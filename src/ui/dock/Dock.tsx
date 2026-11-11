import { AnimatePresence } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';

import { groupsInOrder, type GroupKey } from '@/lib/data';
import { useConfigurator } from '@/store/configurator/useConfigurator';
import { useQuote } from '@/store/configurator/useQuote';

import { DockButton } from './DockButton';
import { Tray } from './Tray';

/**
 * Diameter of a circle in em of the dock's font size: the open one, the ones
 * right next to it, and the rest. The dock's font is smaller on phones, so
 * five circles and the swell fit a narrow screen.
 */
const CIRCLE = { open: 5.4, near: 4.5, rest: 4 };

/** Milliseconds a hover-opened tray stays after the pointer leaves: time to cross a gap or change one's mind. */
const CLOSE_DELAY_MS = 180;

/**
 * Every choice, as a row of circles floating at the bottom of the scene, with
 * no bar around them. A circle opens the tray of its group above the row.
 *
 * With a mouse, hovering opens a tray and leaving closes it; a click pins it
 * open until it is clicked again, Escape is pressed, or something outside is
 * clicked. Touch and keyboard have no hover: for them a tray is always
 * pinned, opened and closed by the button.
 */
export const Dock: React.FC = () => {
  const catalog = useConfigurator((state) => state.catalog);
  const selection = useConfigurator((state) => state.selection);
  const select = useConfigurator((state) => state.select);
  const quote = useQuote(selection);

  const [open, setOpen] = useState<GroupKey | null>(null);
  const [pinned, setPinned] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const closing = useRef<number | undefined>(undefined);
  const trayId = useId();

  const keepOpen = () => window.clearTimeout(closing.current);
  const close = () => {
    keepOpen();
    setOpen(null);
    setPinned(false);
  };

  // A pinned tray closes on Escape and on a press anywhere outside the dock.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    const onPress = (event: PointerEvent) =>
      !root.current?.contains(event.target as Node) && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPress);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPress);
    };
    // close only sets state and clears a timer.
  }, [open]);

  useEffect(() => keepOpen, []);

  if (!catalog || !selection) return null;

  const groups = groupsInOrder(catalog);
  const openGroup = groups.find((group) => group.key === open);
  const openIndex = groups.findIndex((group) => group.key === open);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-3 pb-3 sm:pb-6">
      <div
        ref={root}
        onPointerEnter={keepOpen}
        onPointerLeave={(event) => {
          if (pinned || event.pointerType !== 'mouse') return;
          closing.current = window.setTimeout(close, CLOSE_DELAY_MS);
        }}
        className="pointer-events-auto relative w-full sm:w-auto"
      >
        {/* items-end: the circles grow upward, their names stay on one line. */}
        <nav
          aria-label={catalog.product.name}
          className="flex items-end justify-center gap-3 text-[12px] sm:gap-2 sm:text-[14px]"
        >
          {groups.map((group, index) => {
            const selected = catalog.options.find(
              (o) => o.key === selection[group.key],
            );
            if (!selected) return null;
            const away = openIndex < 0 ? Infinity : Math.abs(index - openIndex);
            return (
              <DockButton
                key={group.key}
                group={group}
                selected={selected}
                open={open === group.key}
                size={
                  away === 0
                    ? CIRCLE.open
                    : away === 1
                      ? CIRCLE.near
                      : CIRCLE.rest
                }
                trayId={trayId}
                onHover={() => {
                  keepOpen();
                  setOpen(group.key);
                }}
                onPress={() => {
                  if (open === group.key && pinned) return close();
                  setOpen(group.key);
                  setPinned(true);
                }}
              />
            );
          })}
        </nav>

        {/* After the row in the page, so Tab reaches it after the circles;
            placed above it. The padding (not a margin) joins the two, so the
            pointer can travel from a button to its tray without leaving. */}
        <div className="absolute bottom-full left-1/2 flex -translate-x-1/2 justify-center pb-3">
          <AnimatePresence mode="wait">
            {openGroup && (
              <Tray
                key={openGroup.key}
                id={trayId}
                group={openGroup}
                options={catalog.options.filter(
                  (o) => o.groupKey === openGroup.key,
                )}
                selectedKey={selection[openGroup.key]}
                blocked={quote?.blocked ?? []}
                currency={catalog.currency}
                onSelect={(optionKey) => select(openGroup.key, optionKey)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
