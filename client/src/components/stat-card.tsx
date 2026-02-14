import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  className?: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  variant = "default", 
  className,
  delay = 0 
}: StatCardProps) {
  
  const variants = {
    default: "bg-card border-border/50",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-green-500/10 border-green-500/20",
    warning: "bg-amber-500/5 border-amber-500/20",
    danger: "bg-red-500/5 border-red-500/20",
  };

  const textColors = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-[hsl(var(--success))]",
    warning: "text-[hsl(var(--warning))]",
    danger: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 border shadow-sm backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{title}</h3>
        {icon && <div className={cn("p-2 rounded-lg bg-background/50", textColors[variant])}>{icon}</div>}
      </div>
      
      <div className="space-y-1 relative z-10">
        <div className={cn("text-4xl font-display font-bold tracking-tight", textColors[variant])}>
          {value}
        </div>
        {subtext && (
          <p className="text-sm font-medium text-muted-foreground/80">
            {subtext}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div 
        className={cn(
          "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
          variant === 'default' ? 'bg-primary' : 
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' : 'bg-primary'
        )} 
      />
    </motion.div>
  );
}
