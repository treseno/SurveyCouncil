import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/30 py-6 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>© 2025 SurveyCouncil</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <span className="font-semibold text-primary">Zama FHE</span>
        </div>
      </div>
    </footer>
  );
};
