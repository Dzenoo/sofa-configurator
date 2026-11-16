import { useEffect, useState } from 'react';

import { quote, type Quote, type Selection } from '@/lib/data';

/**
 * The quote for the current selection, through the data layer. It is async
 * like the future POST /quotes, so an answer that arrives for an older
 * selection is dropped instead of overwriting the newer one.
 */
export function useQuote(selection: Selection | null): Quote | null {
  const [result, setResult] = useState<Quote | null>(null);

  useEffect(() => {
    if (!selection) return;
    let latest = true;
    quote(selection).then(
      (next) => {
        if (latest) setResult(next);
      },
      (error: unknown) => console.error(error),
    );
    return () => {
      latest = false;
    };
  }, [selection]);

  return result;
}
