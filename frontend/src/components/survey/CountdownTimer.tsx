import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endTime: number; // Unix timestamp in seconds
  onEnd?: () => void;
}

export const CountdownTimer = ({ endTime, onEnd }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onEnd?.();
        return;
      }

      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      setTimeLeft({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  const getColorClass = () => {
    const totalHours = timeLeft.total / 3600;
    if (totalHours > 24) return "text-primary";
    if (totalHours > 1) return "text-warning";
    return "text-destructive";
  };

  if (timeLeft.total === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-5 w-5" />
        <span className="text-sm font-medium">Voting Ended</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${getColorClass()}`}>
      <div className="relative">
        <Clock className="h-6 w-6" />
        {timeLeft.total < 3600 && (
          <div className="absolute inset-0 animate-pulse-glow rounded-full" />
        )}
      </div>
      
      <div className="flex items-center gap-1 text-sm font-mono font-bold">
        {timeLeft.days > 0 && (
          <>
            <span className="text-2xl">{timeLeft.days}</span>
            <span className="text-xs">d</span>
          </>
        )}
        <span className="text-2xl">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-xs">:</span>
        <span className="text-2xl">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-xs">:</span>
        <span className="text-2xl">{String(timeLeft.seconds).padStart(2, "0")}</span>
      </div>
    </div>
  );
};
