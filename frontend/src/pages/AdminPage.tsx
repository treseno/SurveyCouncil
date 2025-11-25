import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Users, Clock, Plus, X, CheckCircle2, AlertCircle, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSurveyInfo, useVotingStatus, useQueuedViewers, useIsAdmin, useTotalVoters } from "@/hooks/useSurveyContract";
import { useFinalize, useExtendVoting, useQueueViewer, useRemoveQueuedViewer, useGrantView } from "@/hooks/useAdminActions";
import { SURVEY_COUNCIL_ADDRESS } from "@/config/contracts";
import { toast } from "sonner";
import { isAddress } from "viem";

const AdminPage = () => {
  const { address, isConnected } = useAccount();
  const [viewerAddress, setViewerAddress] = useState("");
  const [extendHours, setExtendHours] = useState("");

  // Contract data hooks
  const { surveyInfo, isLoading: isLoadingSurvey, refetch: refetchSurvey } = useSurveyInfo();
  const { status, isLoading: isLoadingStatus, refetch: refetchStatus } = useVotingStatus();
  const { queuedViewers, isLoading: isLoadingViewers, refetch: refetchViewers } = useQueuedViewers();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const { totalVoters } = useTotalVoters();

  // Admin action hooks
  const { finalize, isSubmitting: isFinalizing, isSuccess: finalizeSuccess } = useFinalize();
  const { extendVoting, isSubmitting: isExtending, isSuccess: extendSuccess } = useExtendVoting();
  const { queueViewer, isSubmitting: isQueuing, isSuccess: queueSuccess } = useQueueViewer();
  const { removeQueuedViewer, isSubmitting: isRemoving, isSuccess: removeSuccess } = useRemoveQueuedViewer();
  const { grantView, isSubmitting: isGranting, isSuccess: grantSuccess } = useGrantView();

  const isLoading = isLoadingSurvey || isLoadingStatus || isLoadingAdmin;
  const isContractConfigured = SURVEY_COUNCIL_ADDRESS !== "0x0000000000000000000000000000000000000000";
  const isFinalized = status === "finalized";
  const isActive = status === "active";
  const isEnded = status === "ended";

  // Refetch data after successful operations
  useEffect(() => {
    if (finalizeSuccess) {
      refetchStatus();
      refetchSurvey();
    }
  }, [finalizeSuccess, refetchStatus, refetchSurvey]);

  useEffect(() => {
    if (extendSuccess) {
      refetchSurvey();
      refetchStatus();
    }
  }, [extendSuccess, refetchSurvey, refetchStatus]);

  useEffect(() => {
    if (queueSuccess || removeSuccess || grantSuccess) {
      refetchViewers();
      setViewerAddress("");
    }
  }, [queueSuccess, removeSuccess, grantSuccess, refetchViewers]);

  const handleAddViewer = () => {
    if (!viewerAddress) {
      toast.error("Please enter an address");
      return;
    }
    if (!isAddress(viewerAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }

    if (isFinalized) {
      // Grant view access directly after finalization
      grantView(viewerAddress as `0x${string}`);
    } else {
      // Queue viewer for later
      queueViewer(viewerAddress as `0x${string}`);
    }
  };

  const handleRemoveViewer = (viewer: `0x${string}`) => {
    removeQueuedViewer(viewer);
  };

  const handleExtendVoting = () => {
    if (!extendHours || Number(extendHours) <= 0) {
      toast.error("Please enter a valid number of hours");
      return;
    }

    const currentEndTime = surveyInfo?.endTime || Math.floor(Date.now() / 1000);
    const additionalSeconds = Number(extendHours) * 3600;
    const newEndTime = BigInt(currentEndTime + additionalSeconds);

    extendVoting(newEndTime);
    setExtendHours("");
  };

  const handleFinalize = () => {
    finalize();
  };

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
              Connect your wallet to access the admin panel.
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
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have admin permissions for this survey.
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
        </motion.div>

        {/* Survey Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Survey Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-lg font-bold capitalize">{status}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Total Voters</p>
                <p className="text-lg font-bold">{totalVoters || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">End Time</p>
                <p className="text-sm font-medium">
                  {surveyInfo?.endTime ? new Date(surveyInfo.endTime * 1000).toLocaleString() : "--"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Queued Viewers</p>
                <p className="text-lg font-bold">{queuedViewers?.length || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs defaultValue="viewers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewers">
              <Users className="h-4 w-4 mr-2" />
              Viewer Management
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Voting Settings
            </TabsTrigger>
          </TabsList>

          {/* Viewers Management */}
          <TabsContent value="viewers" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isFinalized ? "Grant View Access" : "Queue Result Viewer"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isFinalized
                  ? "Grant addresses permission to decrypt and view the results."
                  : "Queue addresses that will be granted view access when the survey is finalized."
                }
              </p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="viewer-address">Wallet Address</Label>
                  <Input
                    id="viewer-address"
                    placeholder="0x..."
                    className="mt-2"
                    value={viewerAddress}
                    onChange={(e) => setViewerAddress(e.target.value)}
                    disabled={isQueuing || isGranting}
                  />
                </div>
                <Button
                  className="self-end bg-gradient-primary text-primary-foreground"
                  onClick={handleAddViewer}
                  disabled={isQueuing || isGranting || !viewerAddress}
                >
                  {(isQueuing || isGranting) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isFinalized ? "Grant Access" : "Add to Queue"}
                </Button>
              </div>
            </Card>

            {!isFinalized && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Queued Viewers</h3>
                {isLoadingViewers ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : queuedViewers && queuedViewers.length > 0 ? (
                  <div className="space-y-2">
                    {queuedViewers.map((viewer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <span className="font-mono text-sm">
                          {viewer.slice(0, 6)}...{viewer.slice(-4)}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveViewer(viewer)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No viewers queued yet
                  </p>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Voting Settings */}
          <TabsContent value="settings" className="space-y-4">
            {/* Extend Voting */}
            {(isActive || isEnded) && !isFinalized && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <Clock className="h-5 w-5 inline mr-2" />
                  Extend Voting Period
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="extend-hours">Additional Hours</Label>
                    <Input
                      id="extend-hours"
                      type="number"
                      placeholder="24"
                      className="mt-2"
                      value={extendHours}
                      onChange={(e) => setExtendHours(e.target.value)}
                      disabled={isExtending}
                    />
                  </div>
                  <Button
                    className="bg-gradient-primary text-primary-foreground"
                    onClick={handleExtendVoting}
                    disabled={isExtending || !extendHours}
                  >
                    {isExtending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extending...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Extend Voting
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Finalize Survey */}
            {!isFinalized && (
              <Card className="p-6 border-destructive/50">
                <h3 className="text-lg font-semibold mb-4 text-destructive">
                  Finalize Survey
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Finalizing the survey will end voting and allow authorized viewers to decrypt the results.
                  This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalize Survey
                    </>
                  )}
                </Button>
              </Card>
            )}

            {/* Already Finalized */}
            {isFinalized && (
              <Card className="p-6 bg-success/10 border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <div>
                    <h3 className="text-lg font-semibold">Survey Finalized</h3>
                    <p className="text-sm text-muted-foreground">
                      The survey has been finalized. Results can now be decrypted by authorized viewers.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default AdminPage;
