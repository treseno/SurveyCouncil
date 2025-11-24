import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OptionCardProps {
  option: {
    id: number;
    title: string;
    description: string;
  };
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export const OptionCard = ({ option, selected, disabled, onSelect }: OptionCardProps) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        onClick={!disabled ? onSelect : undefined}
        className={`
          relative overflow-hidden p-6 cursor-pointer transition-all duration-300
          ${selected 
            ? "border-2 border-primary bg-accent shadow-violet" 
            : "border-2 border-border hover:border-primary/50 hover:shadow-md"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {/* Selection indicator */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-primary">
                {String.fromCharCode(9312 + option.id - 1)}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {option.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {option.description}
            </p>
          </div>

          {/* Check mark */}
          <motion.div
            initial={false}
            animate={{ scale: selected ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex-shrink-0"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          </motion.div>
        </div>

        {/* Gradient overlay on hover */}
        {!disabled && (
          <div className={`
            absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity
            ${selected ? "opacity-100" : "group-hover:opacity-50"}
          `} />
        )}
      </Card>
    </motion.div>
  );
};
