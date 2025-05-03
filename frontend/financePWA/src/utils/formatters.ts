/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a number as currency with the Naira symbol
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'NGN')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null, currency = 'NGN') => {
  if (amount === undefined || amount === null) return '...';
  
  // Format based on currency
  switch (currency) {
    case 'NGN':
      // Format the number part
      const formattedNumber = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
      // Explicitly add the Naira symbol
      return `₦${formattedNumber}`;
      
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
      
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
      
    case 'GBP':
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(amount);
      
    default:
      // For other currencies, try to use Intl.NumberFormat
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency
        }).format(amount);
      } catch (error) {
        console.error(`Error formatting currency ${currency}:`, error);
        return `${amount}`;
      }
  }
};

/**
 * Format a date string
 * @param dateString - The date string to format
 * @param format - The format to use (default: 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format = 'MM/DD/YYYY') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Return empty string for invalid dates
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a number as a percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | undefined | null, decimals = 0) => {
  if (value === undefined || value === null) return '...';
  
  return `${value.toFixed(decimals)}%`;
};
