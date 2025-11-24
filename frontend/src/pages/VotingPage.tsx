import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { PageContainer } from "@/components/layout/PageContainer";
import { SurveyInfoCard } from "@/components/survey/SurveyInfoCard";
import { OptionCard } from "@/components/survey/OptionCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Wallet, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSurveyInfo, useSurveyOptions, useVotingStatus, useHasVoted, useTotalVoters } from "@/hooks/useSurveyContract";
import { useCastVote } from "@/hooks/useCastVote";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SURVEYS } from "@/config/contracts";

const VotingPage = () => {
  const { address: contractAddressParam } = useParams<{ address: string }>();
  const contractAddress = contractAddressParam as `0x${string}` | undefined;

  const { address, isConnected } = useAccount();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Find survey info from config
  const surveyConfig = SURVEYS.find(s => s.address.toLowerCase() === contractAddress?.toLowerCase());

  // Contract data hooks with dynamic address
  const { surveyInfo, isLoading: isLoadingSurvey, refetch: refetchSurvey } = useSurveyInfo(contractAddress);
  const { options, isLoading: isLoadingOptions } = useSurveyOptions(contractAddress);
  const { status, isLoading: isLoadingStatus } = useVotingStatus(contractAddress);
  const { hasVoted, refetch: refetchHasVoted } = useHasVoted(address, contractAddress);
  const { totalVoters, refetch: refetchVoters } = useTotalVoters(contractAddress);

  // Voting hook
  const { castVote, isEncrypting, isSubmitting, isSuccess } = useCastVote(contractAddress);

  // Refetch data after successful vote
  useEffect(() => {
    if (isSuccess) {
      refetchHasVoted();
      refetchSurvey();
      refetchVoters();
    }
  }, [isSuccess, refetchHasVoted, refetchSurvey, refetchVoters]);

  const handleVote = async () => {
    if (selectedOption === null) return;
    await castVote(selectedOption);
  };

  const isLoading = isLoadingSurvey || isLoadingOptions || isLoadingStatus;
  const isContractConfigured = !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000";

  // If contract not configured, show setup message
  if (!isContractConfigured) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Survey Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The survey contract address is invalid or not provided.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Surveys
              </Button>
            </Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto space-y-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Link>
          <Card className="p-8 text-center">
            <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to participate in encrypted voting powered by Zama FHE technology.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="max-w-5xl mx-auto space-y-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Link>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Voting status checks
  const isVotingActive = status === "active";
  const isVotingEnded = status === "ended" || status === "finalized";

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Link>

        {/* Survey Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SurveyInfoCard
            title={surveyInfo?.title || "Loading..."}
            description={surveyConfig?.description || "This survey uses Zama FHE (Fully Homomorphic Encryption) to ensure your vote remains completely private. Your choice is encrypted before being submitted to the blockchain."}
            endTime={surveyInfo?.endTime || 0}
            status={status || "not_started"}
            participantCount={totalVoters || 0}
          />
        </motion.div>

        {/* Options Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 grid-cols-1 md:grid-cols-2"
        >
          {options?.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <OptionCard
                option={{ id: index, title: option, description: `Option ${index + 1}` }}
                selected={selectedOption === index}
                disabled={hasVoted || !isVotingActive || isSubmitting}
                onSelect={() => setSelectedOption(index)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Vote Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          {hasVoted ? (
            <div className="text-center p-6 rounded-lg bg-success/10 border border-success/20 max-w-md">
              <p className="text-success font-medium">
                You have already voted. Your encrypted vote has been recorded on the blockchain.
              </p>
            </div>
          ) : isVotingEnded ? (
            <div className="text-center p-6 rounded-lg bg-warning/10 border border-warning/20 max-w-md">
              <p className="text-warning font-medium">
                Voting has ended. Check the Results page to see the outcome.
              </p>
            </div>
          ) : (
            <Button
              size="lg"
              disabled={selectedOption === null || isSubmitting || isEncrypting}
              onClick={handleVote}
              className="bg-gradient-primary text-primary-foreground px-12 py-6 text-lg font-semibold shadow-violet hover:shadow-glow transition-all disabled:opacity-50"
            >
              <Lock className="mr-2 h-5 w-5" />
              {isEncrypting ? "Encrypting..." : isSubmitting ? "Submitting..." : "Cast Encrypted Vote"}
            </Button>
          )}
        </motion.div>

        {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 rounded-lg bg-success/10 border border-success/20"
          >
            <p className="text-success font-medium">
              Your encrypted vote has been submitted to the blockchain!
            </p>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default VotingPage;
