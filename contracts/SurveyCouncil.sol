// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SurveyCouncil - Privacy-Preserving Encrypted Voting System
/// @notice A confidential survey/voting platform using Zama fhEVM 0.9.1
/// @dev Uses FHE to keep vote counts encrypted until finalization
contract SurveyCouncil is ZamaEthereumConfig {
    // ============ State Variables ============
    address public admin;
    string public title;
    uint256 public votingStart;
    uint256 public votingEnd;
    bool public finalized;
    uint256 public totalVoters;

    mapping(uint256 => euint64) private _votes; // optionId => encrypted count
    mapping(address => bool) private _hasVoted;
    string[] private _options;
    mapping(address => bool) public canViewResults;
    mapping(address => bool) private _queuedViewers;
    address[] private _queuedViewerList;

    // ============ Custom Errors ============
    error AlreadyVoted();
    error VotingClosed();
    error VotingNotStarted();
    error InvalidOption();
    error NotAdmin();
    error AlreadyFinalized();
    error NotAuthorized();
    error InvalidDuration();
    error ResultsLocked();
    error InvalidOptionsLength();
    error NotFinalized();
    error AlreadyAuthorized();
    error InvalidViewer();
    error NotQueued();
    error VotingNotEnded();

    // ============ Constants ============
    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant MAX_OPTIONS = 32;

    // ============ Events ============
    event SurveyCreated(string title, uint256 optionsCount, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed optionId, uint256 timestamp);
    event ViewerGranted(address indexed viewer);
    event ViewerQueued(address indexed viewer);
    event ViewerRemoved(address indexed viewer);
    event VotingExtended(uint256 oldEndTime, uint256 newEndTime);
    event Finalized(uint256 timestamp, uint256 totalVoters);

    // ============ Modifiers ============
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier notFinalized() {
        if (finalized) revert AlreadyFinalized();
        _;
    }

    modifier isFinalized() {
        if (!finalized) revert NotFinalized();
        _;
    }

    // ============ Constructor ============
    /// @notice Create a new encrypted survey
    /// @param _title Survey title
    /// @param optionList Array of option strings (2-32 options)
    /// @param durationSeconds Duration of voting period (1 hour - 30 days)
    constructor(
        string memory _title,
        string[] memory optionList,
        uint256 durationSeconds
    ) {
        if (optionList.length < 2 || optionList.length > MAX_OPTIONS) {
            revert InvalidOptionsLength();
        }
        if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) {
            revert InvalidDuration();
        }

        admin = msg.sender;
        title = _title;
        votingStart = block.timestamp;
        votingEnd = votingStart + durationSeconds;
        _options = optionList;
        canViewResults[msg.sender] = true;

        // Initialize encrypted vote counters to zero
        for (uint256 i = 0; i < optionList.length; i++) {
            euint64 zero = FHE.asEuint64(0);
            _votes[i] = zero;
            FHE.allowThis(_votes[i]);
        }

        emit SurveyCreated(_title, optionList.length, votingEnd);
    }

    // ============ Voting Functions ============

    /// @notice Cast an encrypted vote for a given option
    /// @param optionId The option index to vote for (0-based)
    /// @param encryptedOne Encrypted value of 1 (euint64)
    /// @param proof Zero-knowledge proof for the encrypted input
    function castVote(
        uint256 optionId,
        externalEuint64 encryptedOne,
        bytes calldata proof
    ) external {
        if (block.timestamp < votingStart) revert VotingNotStarted();
        if (block.timestamp > votingEnd) revert VotingClosed();
        if (_hasVoted[msg.sender]) revert AlreadyVoted();
        if (optionId >= _options.length) revert InvalidOption();

        // Convert external encrypted input to internal euint64
        euint64 one = FHE.fromExternal(encryptedOne, proof);

        // Homomorphically add vote to the option's count
        _votes[optionId] = FHE.add(_votes[optionId], one);
        FHE.allowThis(_votes[optionId]);

        _hasVoted[msg.sender] = true;
        totalVoters++;

        emit VoteCast(msg.sender, optionId, block.timestamp);
    }

    // ============ Result Viewing Functions ============

    /// @notice Get encrypted tally for a given option
    /// @param optionId The option index to query
    /// @return The encrypted vote count (euint64)
    function getTally(uint256 optionId) external view returns (euint64) {
        if (optionId >= _options.length) revert InvalidOption();
        if (!finalized) revert ResultsLocked();
        if (!canViewResults[msg.sender]) revert NotAuthorized();

        return _votes[optionId];
    }

    /// @notice Get all encrypted tallies at once
    /// @return Array of encrypted vote counts
    function getAllTallies() external view returns (euint64[] memory) {
        if (!finalized) revert ResultsLocked();
        if (!canViewResults[msg.sender]) revert NotAuthorized();

        euint64[] memory tallies = new euint64[](_options.length);
        for (uint256 i = 0; i < _options.length; i++) {
            tallies[i] = _votes[i];
        }
        return tallies;
    }

    // ============ Authorization Functions ============

    /// @notice Grant view permission after finalization to a viewer
    /// @param viewer Address to grant access
    function grantView(address viewer) external onlyAdmin isFinalized {
        if (viewer == address(0)) revert InvalidViewer();
        if (canViewResults[viewer]) revert AlreadyAuthorized();

        _authorizeViewer(viewer);
    }

    /// @notice Batch grant permissions to multiple viewers post-finalization
    /// @param viewers Array of addresses to grant access
    function grantViewMany(address[] calldata viewers) external onlyAdmin isFinalized {
        for (uint256 j = 0; j < viewers.length; j++) {
            address viewer = viewers[j];
            if (viewer == address(0)) revert InvalidViewer();
            if (canViewResults[viewer]) continue;
            _authorizeViewer(viewer);
        }
    }

    /// @notice Queue a viewer for automatic authorization on finalization
    /// @param viewer Address to queue
    function queueViewer(address viewer) external onlyAdmin notFinalized {
        _queueViewerInternal(viewer, true);
    }

    /// @notice Queue multiple viewers for post-finalization access
    /// @param viewers Array of addresses to queue
    function queueViewers(address[] calldata viewers) external onlyAdmin notFinalized {
        for (uint256 j = 0; j < viewers.length; j++) {
            _queueViewerInternal(viewers[j], false);
        }
    }

    /// @notice Remove a previously queued viewer
    /// @param viewer Address to remove from queue
    function removeQueuedViewer(address viewer) external onlyAdmin notFinalized {
        if (viewer == address(0)) revert InvalidViewer();
        if (!_queuedViewers[viewer]) revert NotQueued();

        _queuedViewers[viewer] = false;
        emit ViewerRemoved(viewer);
    }

    // ============ Admin Functions ============

    /// @notice Extend the voting period
    /// @param newEndTime New end timestamp (must be after current end)
    function extendVoting(uint256 newEndTime) external onlyAdmin notFinalized {
        if (newEndTime <= votingEnd) revert InvalidDuration();
        if (newEndTime > votingStart + MAX_DURATION) revert InvalidDuration();

        uint256 oldEndTime = votingEnd;
        votingEnd = newEndTime;
        emit VotingExtended(oldEndTime, newEndTime);
    }

    /// @notice Finalize the vote and grant decryption rights
    function finalize() external onlyAdmin notFinalized {
        if (block.timestamp < votingEnd) revert VotingNotEnded();

        finalized = true;

        // Grant admin decryption rights for all options
        for (uint256 i = 0; i < _options.length; i++) {
            FHE.allow(_votes[i], admin);
        }

        // Authorize all queued viewers
        _authorizeQueuedViewers();

        emit Finalized(block.timestamp, totalVoters);
    }

    // ============ Internal Functions ============

    function _authorizeViewer(address viewer) internal {
        canViewResults[viewer] = true;
        for (uint256 i = 0; i < _options.length; i++) {
            FHE.allow(_votes[i], viewer);
        }

        emit ViewerGranted(viewer);
    }

    function _authorizeQueuedViewers() internal {
        uint256 len = _queuedViewerList.length;
        for (uint256 j = 0; j < len; j++) {
            address viewer = _queuedViewerList[j];
            if (!_queuedViewers[viewer]) continue;
            _queuedViewers[viewer] = false;
            if (canViewResults[viewer]) continue;
            _authorizeViewer(viewer);
        }

        delete _queuedViewerList;
    }

    function _queueViewerInternal(address viewer, bool revertOnDuplicate) internal {
        if (viewer == address(0)) revert InvalidViewer();
        if (canViewResults[viewer]) {
            if (revertOnDuplicate) revert AlreadyAuthorized();
            return;
        }

        if (_queuedViewers[viewer]) {
            if (revertOnDuplicate) revert AlreadyAuthorized();
            return;
        }

        _queuedViewers[viewer] = true;
        _queuedViewerList.push(viewer);

        emit ViewerQueued(viewer);
    }

    // ============ View Functions ============

    /// @notice Check if an address has voted
    /// @param voter Address to check
    /// @return True if the address has voted
    function hasVoted(address voter) external view returns (bool) {
        return _hasVoted[voter];
    }

    /// @notice Get all survey options
    /// @return Array of option strings
    function getOptions() external view returns (string[] memory) {
        string[] memory opts = new string[](_options.length);
        for (uint256 i = 0; i < _options.length; i++) {
            opts[i] = _options[i];
        }
        return opts;
    }

    /// @notice Get the number of options
    /// @return Number of options
    function getOptionsCount() external view returns (uint256) {
        return _options.length;
    }

    /// @notice Get list of queued viewers
    /// @return Array of queued viewer addresses
    function getQueuedViewers() external view returns (address[] memory) {
        uint256 len = _queuedViewerList.length;
        uint256 count;
        for (uint256 i = 0; i < len; i++) {
            if (_queuedViewers[_queuedViewerList[i]]) {
                count++;
            }
        }

        address[] memory queued = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < len; i++) {
            address viewer = _queuedViewerList[i];
            if (_queuedViewers[viewer]) {
                queued[idx] = viewer;
                idx++;
            }
        }
        return queued;
    }

    /// @notice Check if an address is queued for access
    /// @param viewer Address to check
    /// @return True if queued
    function isQueued(address viewer) external view returns (bool) {
        return _queuedViewers[viewer];
    }

    /// @notice Get survey metadata and state
    /// @return surveyTitle The survey title
    /// @return startTime Voting start timestamp
    /// @return endTime Voting end timestamp
    /// @return surveyFinalized Whether voting is finalized
    /// @return optionsCount Number of options
    /// @return voterCount Total number of voters
    function getSurveyInfo()
        external
        view
        returns (
            string memory surveyTitle,
            uint256 startTime,
            uint256 endTime,
            bool surveyFinalized,
            uint256 optionsCount,
            uint256 voterCount
        )
    {
        return (title, votingStart, votingEnd, finalized, _options.length, totalVoters);
    }

    /// @notice Get current voting status
    /// @return status 0=NotStarted, 1=Active, 2=Ended, 3=Finalized
    function getVotingStatus() external view returns (uint8 status) {
        if (finalized) return 3;
        if (block.timestamp < votingStart) return 0;
        if (block.timestamp > votingEnd) return 2;
        return 1;
    }

    /// @notice Get time remaining until voting ends
    /// @return Seconds remaining, or 0 if ended
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= votingEnd) return 0;
        return votingEnd - block.timestamp;
    }
}
