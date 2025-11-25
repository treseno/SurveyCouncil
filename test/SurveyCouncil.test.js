const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SurveyCouncil", function () {
  let surveyCouncil;
  let admin, voter1, voter2, voter3, viewer1;
  let surveyTitle;
  let options;
  let votingDuration;

  // Helper function to create encrypted input (mocked for testing)
  async function mockEncryptedInput() {
    // In real tests, this would use the FHE SDK
    // For now, we return dummy values
    const encryptedOne = ethers.encodeBytes32String("encrypted1");
    const proof = ethers.toUtf8Bytes("mock_proof");
    return { encryptedOne, proof };
  }

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, viewer1] = await ethers.getSigners();

    surveyTitle = "DAO Treasury Allocation";
    options = [
      "Protocol Development",
      "Marketing & Community",
      "Security Audits",
      "Reserve Fund",
      "Token Buyback"
    ];
    votingDuration = 7 * 24 * 60 * 60; // 7 days

    const SurveyCouncil = await ethers.getContractFactory("SurveyCouncil");
    surveyCouncil = await SurveyCouncil.deploy(surveyTitle, options, votingDuration);
    await surveyCouncil.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await surveyCouncil.admin()).to.equal(admin.address);
    });

    it("Should set the correct title", async function () {
      expect(await surveyCouncil.title()).to.equal(surveyTitle);
    });

    it("Should initialize with correct options", async function () {
      const retrievedOptions = await surveyCouncil.getOptions();
      expect(retrievedOptions.length).to.equal(options.length);
      expect(retrievedOptions[0]).to.equal(options[0]);
    });

    it("Should set correct voting period", async function () {
      const info = await surveyCouncil.getSurveyInfo();
      const startTime = info[1];
      const endTime = info[2];
      expect(Number(endTime) - Number(startTime)).to.equal(votingDuration);
    });

    it("Should start with voting status ACTIVE", async function () {
      const status = await surveyCouncil.getVotingStatus();
      expect(status).to.equal(1); // ACTIVE
    });

    it("Should grant admin view access by default", async function () {
      expect(await surveyCouncil.canViewResults(admin.address)).to.be.true;
    });

    it("Should revert with invalid options length", async function () {
      const SurveyCouncil = await ethers.getContractFactory("SurveyCouncil");

      // Too few options (< 2)
      await expect(
        SurveyCouncil.deploy("Test", ["Option 1"], votingDuration)
      ).to.be.revertedWithCustomError(surveyCouncil, "InvalidOptionsLength");

      // Too many options (> 32)
      const tooManyOptions = Array(33).fill("Option");
      await expect(
        SurveyCouncil.deploy("Test", tooManyOptions, votingDuration)
      ).to.be.revertedWithCustomError(surveyCouncil, "InvalidOptionsLength");
    });

    it("Should revert with invalid duration", async function () {
      const SurveyCouncil = await ethers.getContractFactory("SurveyCouncil");

      // Too short (< 1 hour)
      await expect(
        SurveyCouncil.deploy(surveyTitle, options, 30 * 60)
      ).to.be.revertedWithCustomError(surveyCouncil, "InvalidDuration");

      // Too long (> 30 days)
      await expect(
        SurveyCouncil.deploy(surveyTitle, options, 31 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(surveyCouncil, "InvalidDuration");
    });
  });

  describe("Voting", function () {
    it("Should allow a user to cast a vote", async function () {
      const { encryptedOne, proof } = await mockEncryptedInput();

      await expect(
        surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof)
      ).to.emit(surveyCouncil, "VoteCast")
        .withArgs(voter1.address, 0, await time.latest());

      expect(await surveyCouncil.hasVoted(voter1.address)).to.be.true;
      expect(await surveyCouncil.totalVoters()).to.equal(1);
    });

    it("Should prevent double voting", async function () {
      const { encryptedOne, proof } = await mockEncryptedInput();

      await surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof);

      await expect(
        surveyCouncil.connect(voter1).castVote(1, encryptedOne, proof)
      ).to.be.revertedWithCustomError(surveyCouncil, "AlreadyVoted");
    });

    it("Should revert with invalid option ID", async function () {
      const { encryptedOne, proof } = await mockEncryptedInput();

      await expect(
        surveyCouncil.connect(voter1).castVote(999, encryptedOne, proof)
      ).to.be.revertedWithCustomError(surveyCouncil, "InvalidOption");
    });

    it("Should not allow voting after deadline", async function () {
      const { encryptedOne, proof } = await mockEncryptedInput();

      // Fast forward time past the deadline
      await time.increase(votingDuration + 1);

      await expect(
        surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof)
      ).to.be.revertedWithCustomError(surveyCouncil, "VotingClosed");
    });

    it("Should track multiple voters correctly", async function () {
      const { encryptedOne, proof } = await mockEncryptedInput();

      await surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof);
      await surveyCouncil.connect(voter2).castVote(1, encryptedOne, proof);
      await surveyCouncil.connect(voter3).castVote(2, encryptedOne, proof);

      expect(await surveyCouncil.totalVoters()).to.equal(3);
      expect(await surveyCouncil.hasVoted(voter1.address)).to.be.true;
      expect(await surveyCouncil.hasVoted(voter2.address)).to.be.true;
      expect(await surveyCouncil.hasVoted(voter3.address)).to.be.true;
    });
  });

  describe("Voting Status", function () {
    it("Should return ACTIVE status during voting period", async function () {
      const status = await surveyCouncil.getVotingStatus();
      expect(status).to.equal(1); // ACTIVE
    });

    it("Should return ENDED status after voting period", async function () {
      await time.increase(votingDuration + 1);
      const status = await surveyCouncil.getVotingStatus();
      expect(status).to.equal(2); // ENDED
    });

    it("Should return FINALIZED status after finalization", async function () {
      await time.increase(votingDuration + 1);
      await surveyCouncil.finalize();
      const status = await surveyCouncil.getVotingStatus();
      expect(status).to.equal(3); // FINALIZED
    });
  });

  describe("Admin Functions", function () {
    describe("Extend Voting", function () {
      it("Should allow admin to extend voting period", async function () {
        const info = await surveyCouncil.getSurveyInfo();
        const currentEndTime = info[2];
        const newEndTime = Number(currentEndTime) + 3 * 24 * 60 * 60; // +3 days

        await expect(
          surveyCouncil.extendVoting(newEndTime)
        ).to.emit(surveyCouncil, "VotingExtended")
          .withArgs(currentEndTime, newEndTime);

        const updatedInfo = await surveyCouncil.getSurveyInfo();
        expect(updatedInfo[2]).to.equal(newEndTime);
      });

      it("Should not allow non-admin to extend voting", async function () {
        const info = await surveyCouncil.getSurveyInfo();
        const newEndTime = Number(info[2]) + 3 * 24 * 60 * 60;

        await expect(
          surveyCouncil.connect(voter1).extendVoting(newEndTime)
        ).to.be.revertedWithCustomError(surveyCouncil, "NotAdmin");
      });

      it("Should not allow extending to earlier time", async function () {
        const info = await surveyCouncil.getSurveyInfo();
        const currentEndTime = info[2];
        const newEndTime = Number(currentEndTime) - 1;

        await expect(
          surveyCouncil.extendVoting(newEndTime)
        ).to.be.revertedWithCustomError(surveyCouncil, "InvalidDuration");
      });

      it("Should not allow extending after finalization", async function () {
        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        const info = await surveyCouncil.getSurveyInfo();
        const newEndTime = Number(info[2]) + 3 * 24 * 60 * 60;

        await expect(
          surveyCouncil.extendVoting(newEndTime)
        ).to.be.revertedWithCustomError(surveyCouncil, "AlreadyFinalized");
      });
    });

    describe("Finalization", function () {
      it("Should allow admin to finalize after voting ends", async function () {
        await time.increase(votingDuration + 1);

        await expect(
          surveyCouncil.finalize()
        ).to.emit(surveyCouncil, "Finalized");

        expect(await surveyCouncil.finalized()).to.be.true;
      });

      it("Should not allow finalization before voting ends", async function () {
        await expect(
          surveyCouncil.finalize()
        ).to.be.revertedWithCustomError(surveyCouncil, "VotingNotEnded");
      });

      it("Should not allow non-admin to finalize", async function () {
        await time.increase(votingDuration + 1);

        await expect(
          surveyCouncil.connect(voter1).finalize()
        ).to.be.revertedWithCustomError(surveyCouncil, "NotAdmin");
      });

      it("Should not allow double finalization", async function () {
        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        await expect(
          surveyCouncil.finalize()
        ).to.be.revertedWithCustomError(surveyCouncil, "AlreadyFinalized");
      });
    });
  });

  describe("Viewer Management", function () {
    describe("Queue Viewers", function () {
      it("Should allow admin to queue a viewer", async function () {
        await expect(
          surveyCouncil.queueViewer(viewer1.address)
        ).to.emit(surveyCouncil, "ViewerQueued")
          .withArgs(viewer1.address);

        expect(await surveyCouncil.isQueued(viewer1.address)).to.be.true;
      });

      it("Should allow admin to queue multiple viewers", async function () {
        const viewers = [voter1.address, voter2.address, voter3.address];

        await surveyCouncil.queueViewers(viewers);

        expect(await surveyCouncil.isQueued(voter1.address)).to.be.true;
        expect(await surveyCouncil.isQueued(voter2.address)).to.be.true;
        expect(await surveyCouncil.isQueued(voter3.address)).to.be.true;
      });

      it("Should not allow non-admin to queue viewers", async function () {
        await expect(
          surveyCouncil.connect(voter1).queueViewer(viewer1.address)
        ).to.be.revertedWithCustomError(surveyCouncil, "NotAdmin");
      });

      it("Should not allow queueing invalid address", async function () {
        await expect(
          surveyCouncil.queueViewer(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(surveyCouncil, "InvalidViewer");
      });

      it("Should allow removing queued viewer", async function () {
        await surveyCouncil.queueViewer(viewer1.address);

        await expect(
          surveyCouncil.removeQueuedViewer(viewer1.address)
        ).to.emit(surveyCouncil, "ViewerRemoved")
          .withArgs(viewer1.address);

        expect(await surveyCouncil.isQueued(viewer1.address)).to.be.false;
      });

      it("Should not allow queueing after finalization", async function () {
        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        await expect(
          surveyCouncil.queueViewer(viewer1.address)
        ).to.be.revertedWithCustomError(surveyCouncil, "AlreadyFinalized");
      });
    });

    describe("Grant View Access", function () {
      it("Should grant view access after finalization", async function () {
        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        await expect(
          surveyCouncil.grantView(viewer1.address)
        ).to.emit(surveyCouncil, "ViewerGranted")
          .withArgs(viewer1.address);

        expect(await surveyCouncil.canViewResults(viewer1.address)).to.be.true;
      });

      it("Should grant view access to multiple viewers", async function () {
        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        const viewers = [voter1.address, voter2.address];
        await surveyCouncil.grantViewMany(viewers);

        expect(await surveyCouncil.canViewResults(voter1.address)).to.be.true;
        expect(await surveyCouncil.canViewResults(voter2.address)).to.be.true;
      });

      it("Should not allow granting view access before finalization", async function () {
        await expect(
          surveyCouncil.grantView(viewer1.address)
        ).to.be.revertedWithCustomError(surveyCouncil, "NotFinalized");
      });

      it("Should automatically grant access to queued viewers on finalization", async function () {
        await surveyCouncil.queueViewer(viewer1.address);

        await time.increase(votingDuration + 1);
        await surveyCouncil.finalize();

        expect(await surveyCouncil.canViewResults(viewer1.address)).to.be.true;
      });
    });
  });

  describe("View Functions", function () {
    it("Should return correct survey info", async function () {
      const info = await surveyCouncil.getSurveyInfo();

      expect(info[0]).to.equal(surveyTitle);
      expect(info[3]).to.be.false; // not finalized
      expect(info[4]).to.equal(options.length);
      expect(info[5]).to.equal(0); // no voters yet
    });

    it("Should return correct options count", async function () {
      expect(await surveyCouncil.getOptionsCount()).to.equal(options.length);
    });

    it("Should return time remaining", async function () {
      const remaining = await surveyCouncil.getTimeRemaining();
      expect(remaining).to.be.gt(0);
      expect(remaining).to.be.lte(votingDuration);
    });

    it("Should return zero time remaining after deadline", async function () {
      await time.increase(votingDuration + 1);
      expect(await surveyCouncil.getTimeRemaining()).to.equal(0);
    });

    it("Should return queued viewers list", async function () {
      await surveyCouncil.queueViewer(voter1.address);
      await surveyCouncil.queueViewer(voter2.address);

      const queued = await surveyCouncil.getQueuedViewers();
      expect(queued.length).to.equal(2);
      expect(queued).to.include(voter1.address);
      expect(queued).to.include(voter2.address);
    });
  });

  describe("Result Access Control", function () {
    it("Should not allow viewing results before finalization", async function () {
      await expect(
        surveyCouncil.getTally(0)
      ).to.be.revertedWithCustomError(surveyCouncil, "ResultsLocked");
    });

    it("Should not allow unauthorized users to view results", async function () {
      await time.increase(votingDuration + 1);
      await surveyCouncil.finalize();

      await expect(
        surveyCouncil.connect(voter1).getTally(0)
      ).to.be.revertedWithCustomError(surveyCouncil, "NotAuthorized");
    });

    it("Should allow admin to view results after finalization", async function () {
      await time.increase(votingDuration + 1);
      await surveyCouncil.finalize();

      // Admin can view results
      await surveyCouncil.getTally(0);
      await surveyCouncil.getAllTallies();
    });

    it("Should allow authorized viewers to view results", async function () {
      await time.increase(votingDuration + 1);
      await surveyCouncil.finalize();
      await surveyCouncil.grantView(viewer1.address);

      // Viewer can now access results
      await surveyCouncil.connect(viewer1).getTally(0);
      await surveyCouncil.connect(viewer1).getAllTallies();
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete voting lifecycle", async function () {
      // 1. Multiple users vote
      const { encryptedOne, proof } = await mockEncryptedInput();
      await surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof);
      await surveyCouncil.connect(voter2).castVote(1, encryptedOne, proof);
      await surveyCouncil.connect(voter3).castVote(0, encryptedOne, proof);

      expect(await surveyCouncil.totalVoters()).to.equal(3);

      // 2. Queue some viewers
      await surveyCouncil.queueViewer(viewer1.address);

      // 3. Fast forward time
      await time.increase(votingDuration + 1);

      // 4. Finalize
      await surveyCouncil.finalize();

      // 5. Verify finalization state
      expect(await surveyCouncil.finalized()).to.be.true;
      expect(await surveyCouncil.canViewResults(viewer1.address)).to.be.true;
      expect(await surveyCouncil.getVotingStatus()).to.equal(3); // FINALIZED

      // 6. Admin can view results
      await surveyCouncil.getAllTallies();
    });

    it("Should handle extended voting period", async function () {
      // Vote during initial period
      const { encryptedOne, proof } = await mockEncryptedInput();
      await surveyCouncil.connect(voter1).castVote(0, encryptedOne, proof);

      // Extend voting
      const info = await surveyCouncil.getSurveyInfo();
      const newEndTime = Number(info[2]) + 3 * 24 * 60 * 60;
      await surveyCouncil.extendVoting(newEndTime);

      // Continue voting in extended period
      await time.increase(votingDuration + 1);
      await surveyCouncil.connect(voter2).castVote(1, encryptedOne, proof);

      expect(await surveyCouncil.totalVoters()).to.equal(2);

      // Finalize after extended period
      await time.increase(3 * 24 * 60 * 60 + 1);
      await surveyCouncil.finalize();

      expect(await surveyCouncil.finalized()).to.be.true;
    });
  });
});
