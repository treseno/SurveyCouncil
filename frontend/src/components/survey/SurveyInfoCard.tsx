import { Card } from "@/components/ui/card";
import { CountdownTimer } from "./CountdownTimer";
import { EncryptedBadge } from "./EncryptedBadge";
import { Users, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SurveyInfoCardProps {
  title: string;
  description: string;
  endTime: number;
  status: "not_started" | "upcoming" | "active" | "ended" | "finalized";
  participantCount?: number;
}

export const SurveyInfoCard = ({
  title,
  description,
  endTime,
  status,
  participantCount = 0
}: SurveyInfoCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "not_started":
      case "upcoming":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Not Started</Badge>;
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "ended":
        return <Badge className="bg-warning text-warning-foreground">Ended</Badge>;
      case "finalized":
        return <Badge className="bg-primary text-primary-foreground">Finalized</Badge>;
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-lg border-2 border-border/50">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Timer Section */}
        <div className="flex-shrink-0 flex items-center justify-center md:border-r md:border-border md:pr-6">
          <CountdownTimer endTime={endTime} />
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {getStatusBadge()}
            <EncryptedBadge />
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-lg font-bold text-foreground">
                  {participantCount > 0 ? participantCount : "--"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Voting Ends</p>
                <p className="text-sm font-medium text-foreground">
                  {endTime > 0 ? new Date(endTime * 1000).toLocaleDateString() : "--"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Encryption</p>
                <p className="text-sm font-medium text-success">FHE Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
