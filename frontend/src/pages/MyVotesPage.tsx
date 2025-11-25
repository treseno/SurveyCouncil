import { useAccount } from "wagmi";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Lock, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSurveyInfo, useVotingStatus, useHasVoted, useTotalVoters } from "@/hooks/useSurveyContract";
import { SURVEY_COUNCIL_ADDRESS } from "@/config/contracts";

const MyVotesPage = () => {
  const { address, isConnected } = useAccount();

  // Contract data hooks
  const { surveyInfo, isLoading: isLoadingSurvey } = useSurveyInfo();
  const { status, isLoading: isLoadingStatus } = useVotingStatus();
  const { hasVoted, isLoading: isLoadingVoted } = useHasVoted(address);
  const { totalVoters } = useTotalVoters();

  const isLoading = isLoadingSurvey || isLoadingStatus || isLoadingVoted;
  const isContractConfigured = SURVEY_COUNCIL_ADDRESS !== "0x0000000000000000000000000000000000000000";
  const isFinalized = status === "finalized";
  const isActive = status === "active";

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
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your voting history.
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
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Voting Record</h1>
          </div>
        </motion.div>

        {!hasVoted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">
                You haven't voted in this survey yet
              </p>
              {isActive && (
                <p className="text-sm text-primary">
                  Go to the Vote page to participate!
                </p>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold">{surveyInfo?.title || "Current Survey"}</h3>
                    {isActive ? (
                      <Badge className="bg-success text-success-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : isFinalized ? (
                      <Badge className="bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finalized
                      </Badge>
                    ) : (
                      <Badge className="bg-warning text-warning-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Ended
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Encrypted Vote Info */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Your vote is encrypted
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Protected by Zama FHE technology
                        </p>
                      </div>
                    </div>

                    {/* Survey Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Total Participants</p>
                        <p className="text-lg font-bold">{totalVoters || 0}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                          {isFinalized ? "Finalized On" : "Voting Ends"}
                        </p>
                        <p className="text-sm font-medium">
                          {surveyInfo?.endTime
                            ? new Date(surveyInfo.endTime * 1000).toLocaleDateString()
                            : "--"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-muted/30">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Privacy Guaranteed</h3>
                <p className="text-sm text-muted-foreground">
                  Your vote choice is encrypted using Fully Homomorphic Encryption (FHE).
                  Even though your vote is recorded on-chain, no one—including administrators—can
                  see what option you voted for. Only the aggregated results can be decrypted
                  after the survey is finalized.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default MyVotesPage;
