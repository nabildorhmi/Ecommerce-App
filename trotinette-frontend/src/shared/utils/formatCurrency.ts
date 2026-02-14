/**
 * Formats a price in MAD for the Moroccan market.
 *
 * @param amountInCentimes - Integer price in centimes (e.g., 150000 = 1 500,00 MAD)
 * @returns Formatted string e.g. "1 500,00 MAD"
 */
export function formatCurrency(amountInCentimes: number): string {
  const amount = amountInCentimes / 100;
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
