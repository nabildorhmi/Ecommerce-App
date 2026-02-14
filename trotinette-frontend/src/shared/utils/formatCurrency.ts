/**
 * Formats a price in MAD for the Moroccan market.
 *
 * Uses 'ar-MA-u-nu-latn' locale string to force Latin (Western Arabic) numerals.
 * Moroccan users expect Western digits (1 500,00 MAD), NOT Eastern Arabic numerals
 * (١٥٠٠ درهم). The 'nu-latn' Unicode extension overrides the default numeral system.
 *
 * @param amountInCentimes - Integer price in centimes (e.g., 150000 = 1 500,00 MAD)
 * @returns Formatted string e.g. "1 500,00 MAD" in all locales
 */
export function formatCurrency(amountInCentimes: number): string {
  const amount = amountInCentimes / 100;
  return new Intl.NumberFormat('ar-MA-u-nu-latn', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
