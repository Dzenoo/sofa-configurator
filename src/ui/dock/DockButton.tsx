import { cn } from 'cn';
import { Layers, RectangleHorizontal, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

import type { GroupKey, OptionGroup, Option } from '@/lib/data';

import { silhouetteOf } from './utils/silhouettes';
import { Silhouette } from './options/Silhouette';

/** Icons for the groups whose choice has no color or outline to show. */
const ICONS: Partial<Record<GroupKey, LucideIcon>> = {
  cushions: Layers,
  ottoman: RectangleHorizontal,
};
/** The circle swells and settles like something soft, with a touch of spring. */
const GROW = { type: 'spring', duration: 0.45, bounce: 0.25 } as const;

interface Props {
  group: OptionGroup;
  /** The option chosen in this group: the circle shows it. */
  selected: Option;
  /** This button's tray is the one on screen. */
  open: boolean;
  /**
   * Diameter of the circle, in em of the dock's font size: the dock sets a
   * smaller font on phones, so one number fits both.
   */
  size: number;
  /** Id of the tray (aria-controls). */
  trayId: string;
  onHover: () => void;
  onPress: () => void;
}

/**
 * One group, as a circle floating over the scene. The circle is the choice
 * itself: filled with the fabric or wood color, or holding the layout's
 * outline, so the row reads as a summary of the sofa with no bar around it.
 * The open one swells and its neighbors a little less, like a wave.
 */
export const DockButton: React.FC<Props> = ({
  group,
  selected,
  open,
  size,
  trayId,
  onHover,
  onPress,
}) => {
  const silhouette =
    group.key === 'layout' ? silhouetteOf(selected.meta.node) : undefined;
  const Icon = ICONS[group.key];

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={trayId}
      onClick={onPress}
      // Hover opens only for a mouse: a finger has no hover, and its tap
      // arrives as a click anyway.
      onPointerEnter={(event) => event.pointerType === 'mouse' && onHover()}
      className="group flex flex-col items-center gap-2 outline-none sm:w-24"
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={{ width: `${size}em`, height: `${size}em` }}
        transition={GROW}
        className={cn(
          'relative flex items-center justify-center rounded-full border bg-background shadow-lg outline-offset-4 outline-transparent transition-[outline-color,box-shadow] duration-300 group-hover:shadow-xl group-focus-visible:outline-2 group-focus-visible:outline-ring',
          open && 'outline-2 outline-primary',
        )}
      >
        {silhouette ? (
          <Silhouette parts={silhouette} className="w-[62%] text-foreground" />
        ) : selected.meta.color ? (
          <span
            className="absolute inset-[9%] rounded-full border border-black/10 transition-colors duration-500"
            style={{ backgroundColor: selected.meta.color }}
          />
        ) : (
          Icon && <Icon className="size-[40%]" strokeWidth={1.5} />
        )}
      </motion.span>

      <span className="flex flex-col items-center leading-tight">
        <span className="text-xs font-medium">{group.name}</span>
        {/* Screen readers always get the choice; on a phone there is no room to show it. */}
        <span className="sr-only text-xs whitespace-nowrap text-foreground/60 sm:not-sr-only">
          {selected.name}
        </span>
      </span>
    </button>
  );
};
