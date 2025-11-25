import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BarChart3, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useSurveyInfo, useSurveyOptions, useVotingStatus, useCanViewResults, useAllTallies, useTotalVoters } from "@/hooks/useSurveyContract";
import { publicDecryptHandles, initializeFHE, isFheReady } from "@/lib/fhe";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SURVEY_COUNCIL_ADDRESS } from "@/config/contracts";

const ResultsPage = () => {
  const { address, isConnected } = useAccount();
  const [decryptedResults, setDecryptedResults] = useState<number[] | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Contract data hooks
  const { surveyInfo, isLoading: isLoadingSurvey } = useSurveyInfo();
  const { options, isLoading: isLoadingOptions } = useSurveyOptions();
  const { status, isLoading: isLoadingStatus } = useVotingStatus();
  const { canViewResults } = useCanViewResults(address);
  const { tallies, isLoading: isLoadingTallies, refetch: refetchTallies } = useAllTallies();
  const { totalVoters } = useTotalVoters();

  const isLoading = isLoadingSurvey || isLoadingOptions || isLoadingStatus;
  const isFinalized = status === "finalized";
  const isContractConfigured = SURVEY_COUNCIL_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const handleDecrypt = async () => {
    if (!tallies || tallies.length === 0) {
      toast.error("No tallies available to decrypt");
      return;
    }

    try {
      setIsDecrypting(true);
      toast.info("Initializing FHE SDK...");

      if (!isFheReady()) {
        await initializeFHE();
      }

      toast.info("Decrypting vote tallies...");
      const result = await publicDecryptHandles(tallies);
      setDecryptedResults(result.values as number[]);
      toast.success("Results decrypted successfully!");
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decrypt results");
    } finally {
      setIsDecrypting(false);
    }
  };

  // Calculate percentages
  const total = decryptedResults?.reduce((sum, val) => sum + val, 0) || 0;
  const resultsWithPercentage = decryptedResults && options ? options.map((option, index) => ({
    title: option,
    votes: decryptedResults[index] || 0,
    percentage: total > 0 ? Math.round((decryptedResults[index] / total) * 100) : 0,
  })) : null;

  // If contract not configured
  if (!isContractConfigured) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Contract Not Configured</h2>
            <p className="text-muted-foreground">
              Please deploy the contract and configure the address first.
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // If not connected
  if (!isConnected) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connect to View Results</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view the encrypted voting results.
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
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // Not finalized yet
  if (!isFinalized) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="h-16 w-16 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Results Not Available Yet</h2>
            <p className="text-muted-foreground mb-4">
              The voting is still in progress or has not been finalized by the admin.
              Results will be available after the survey is finalized.
            </p>
            <p className="text-sm text-muted-foreground">
              Current status: <span className="font-semibold capitalize">{status}</span>
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Not authorized to view
  if (!canViewResults) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to view the decrypted results.
              Contact the survey admin to request access.
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Completion Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 text-center bg-gradient-to-br from-success/10 to-secondary/10 border-success/20">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Survey Finalized</h1>
            <p className="text-muted-foreground">
              Total participants: <span className="font-bold text-foreground">{totalVoters || 0}</span>
            </p>
          </Card>
        </motion.div>

        {/* Decrypt Button */}
        {!decryptedResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              onClick={handleDecrypt}
              disabled={isDecrypting || isLoadingTallies}
              className="bg-gradient-primary text-primary-foreground px-8 py-6 text-lg"
            >
              {isDecrypting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Decrypt Results
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Results Chart */}
        {resultsWithPercentage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Voting Results</h2>
              </div>

              <div className="space-y-6">
                {resultsWithPercentage.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-primary">
                          {String.fromCharCode(9312 + index)}
                        </span>
                        <span className="font-medium">{option.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {option.votes} votes
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {option.percentage}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={option.percentage}
                      className="h-3 bg-muted"
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Details Table */}
        {resultsWithPercentage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Option</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Votes</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsWithPercentage.map((option, index) => (
                      <tr key={index} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-4">{option.title}</td>
                        <td className="text-center py-3 px-4 font-semibold">{option.votes}</td>
                        <td className="text-center py-3 px-4 font-semibold text-primary">
                          {option.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default ResultsPage;
