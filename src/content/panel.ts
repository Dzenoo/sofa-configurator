/** Text the visitor reads in the panel, kept out of the components. Option and group names come from the catalog. */
export const PANEL = {
  /** After a per-seat price: "+€60 / seat". */
  perSeat: '/ seat',
  /** Quantity in a price line: "× 4". */
  quantity: (count: number) => `× ${count}`,
  /** Price line that costs nothing extra. */
  included: 'Included',
  breakdown: 'Price breakdown',
  total: 'Total',
};
