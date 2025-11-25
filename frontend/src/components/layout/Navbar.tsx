import { Link } from "react-router-dom";
import { Shield, Vote, User, Settings, BarChart3 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useIsAdmin } from "@/hooks/useSurveyContract";

export const Navbar = () => {
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <div className="relative">
            <Shield className="h-7 w-7 text-primary" />
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SurveyCouncil
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
          >
            <Vote className="h-4 w-4" />
            Vote
          </Link>
          <Link
            to="/results"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
          >
            <BarChart3 className="h-4 w-4" />
            Results
          </Link>
          <Link
            to="/my-votes"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
          >
            <User className="h-4 w-4" />
            My Votes
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Connect Wallet Button */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
};
