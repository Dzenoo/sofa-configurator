/** Text the visitor reads at the top of the page, kept out of the components. The product name comes from the catalog. */
export const TOP_BAR = {
  total: 'Total',
  /** Label of the price button for screen readers. */
  showBreakdown: 'Price breakdown',
  /** Quantity in a price line: "× 4". */
  quantity: (count: number) => `× ${count}`,
  /** Price line that costs nothing extra. */
  included: 'Included',
  resetView: 'Reset view',
  /** What the two numbers are, for screen readers. */
  dimensionsLabel: 'Width × depth',
  dimensions: (widthCm: number, depthCm: number) =>
    `${widthCm} × ${depthCm} cm`,
  share: {
    button: 'Share',
    copied: 'Link copied',
    /** The browser refused to copy (for example, a page not served over HTTPS). */
    failed: 'Copy the address from the address bar',
  },
};
