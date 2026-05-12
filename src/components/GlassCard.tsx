
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'indigo' | 'azure';
}

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  const variantClasses = {
    default: 'glass',
    indigo: 'glass-indigo',
    azure: 'glass-azure',
  };

  return (
    <div className={cn("rounded-2xl p-6 transition-all duration-300", variantClasses[variant], className)}>
      {children}
    </div>
  );
}
