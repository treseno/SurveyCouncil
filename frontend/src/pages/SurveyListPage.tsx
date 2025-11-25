import { Link } from "react-router-dom";
import { useReadContracts } from "wagmi";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SURVEYS, SURVEY_COUNCIL_ABI } from "@/config/contracts";
import { Shield, Users, Clock, ArrowRight, Vote } from "lucide-react";
import { motion } from "framer-motion";

const SurveyListPage = () => {
  // Fetch survey info for all surveys
  const { data: surveyData, isLoading } = useReadContracts({
    contracts: SURVEYS.map((survey) => ({
      address: survey.address,
      abi: SURVEY_COUNCIL_ABI,
      functionName: "getSurveyInfo",
    })),
  });

  const getStatusBadge = (endTime: number, finalized: boolean) => {
    if (finalized) {
      return <Badge variant="secondary">Finalized</Badge>;
    }
    const now = Math.floor(Date.now() / 1000);
    if (now > endTime) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Ended</Badge>;
    }
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DeFi: "bg-purple-100 text-purple-700",
      Governance: "bg-blue-100 text-blue-700",
      Infrastructure: "bg-green-100 text-green-700",
      Tokenomics: "bg-orange-100 text-orange-700",
      Treasury: "bg-pink-100 text-pink-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              SurveyCouncil
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Participate in confidential DAO governance. All votes are encrypted using Zama FHE technology,
            ensuring complete privacy while maintaining transparency.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              <span>{SURVEYS.length} Active Surveys</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>FHE Encrypted</span>
            </div>
          </div>
        </motion.div>

        {/* Survey Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SURVEYS.map((survey, index) => {
            const info = surveyData?.[index]?.result as [string, bigint, bigint, boolean, bigint, bigint] | undefined;
            const endTime = info ? Number(info[2]) : 0;
            const finalized = info ? info[3] : false;
            const voterCount = info ? Number(info[5]) : 0;

            return (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={getCategoryColor(survey.category)} variant="secondary">
                        {survey.category}
                      </Badge>
                      {!isLoading && info && getStatusBadge(endTime, finalized)}
                    </div>
                    <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">
                      {survey.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {survey.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{isLoading ? "..." : voterCount} voters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{isLoading ? "..." : getTimeRemaining(endTime)}</span>
                      </div>
                    </div>
                    <Link to={`/vote/${survey.address}`}>
                      <Button className="w-full group-hover:bg-primary transition-colors" variant="outline">
                        View Survey
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 text-center"
        >
          <h3 className="font-semibold text-lg mb-2">Privacy-First Voting</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Your vote choices are encrypted before submission using Fully Homomorphic Encryption (FHE).
            Even during computation, your vote remains encrypted and private.
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default SurveyListPage;
