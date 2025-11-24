import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const EncryptedBadge = () => {
  return (
    <Badge variant="secondary" className="bg-accent text-accent-foreground border-primary/20">
      <Shield className="h-3 w-3 mr-1 animate-pulse" />
      <span className="text-xs font-medium">FHE Encrypted</span>
      <div className="ml-1 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
    </Badge>
  );
};
