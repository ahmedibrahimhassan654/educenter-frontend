import { cn } from "@/lib/utils";
import { iconChip, iconColor, type IconColorToken } from "@/lib/icon-styles";

interface SectionHeadingProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  /** Semantic colour for the icon; see lib/icon-styles */
  color?: IconColorToken;
  /** Render the icon inside a tinted square */
  chip?: boolean;
  className?: string;
  /** Right-hand slot for actions such as buttons */
  action?: React.ReactNode;
}

/**
 * Standard heading for a page or card section: coloured icon, title, optional
 * description and action. Keeps icon size, colour and spacing consistent.
 */
export function SectionHeading({
  icon: Icon,
  title,
  description,
  color = "primary",
  chip = false,
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {chip ? (
          <span
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              iconChip[color]
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor[color])} />
          </span>
        ) : (
          <Icon className={cn("w-5 h-5 shrink-0", iconColor[color])} />
        )}

        <div className="min-w-0">
          <h3 className="text-lg font-bold truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}
