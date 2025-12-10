/**
 * Currency formatting utilities for EUR (European market)
 */

const CURRENCY_SYMBOL = '€';
const CURRENCY_CODE = 'EUR';

/**
 * Format a number as EUR currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "€12.50")
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 2 } = options || {};
  
  const formatted = amount.toFixed(decimals);
  
  if (showSymbol) {
    return `${CURRENCY_SYMBOL}${formatted}`;
  }
  
  return formatted;
}

/**
 * Format currency for display in components (simple format: €X.XX)
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "€12.50")
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(): string {
  return CURRENCY_SYMBOL;
}

/**
 * Get currency code
 */
export function getCurrencyCode(): string {
  return CURRENCY_CODE;
}

