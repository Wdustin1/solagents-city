import { TAX_RATES, type TransactionType } from '@/types';

/**
 * Calculate tax for a given transaction amount and type
 */
export function calculateTax(amount: number, type: TransactionType): { gross: number; tax: number; net: number; effectiveRate: number } {
  let rate = 0;

  switch (type) {
    case 'job_payment':
      rate = TAX_RATES.income;
      break;
    case 'company_revenue':
      rate = TAX_RATES.company;
      break;
    case 'gambling_bet':
    case 'gambling_win':
      rate = TAX_RATES.gambling;
      break;
    case 'trade':
      rate = TAX_RATES.trading;
      break;
    case 'staking_withdrawal':
      rate = TAX_RATES.staking_fee;
      break;
    default:
      rate = 0;
  }

  const tax = Math.round(amount * rate * 1e9) / 1e9; // Round to lamports precision
  const net = amount - tax;

  return { gross: amount, tax, net, effectiveRate: Math.round(rate * 10000) / 100 };
}

/**
 * Format SOL amount for display
 */
export function formatSOL(amount: number): string {
  return `◎${amount.toFixed(4)}`;
}

/**
 * Get human-readable tax type label
 */
export function getTaxLabel(type: TransactionType): string {
  const labels: Record<string, string> = {
    job_payment: 'Income Tax',
    company_revenue: 'Corporate Tax',
    gambling_bet: 'Gambling Tax',
    gambling_win: 'Gambling Tax',
    trade: 'Trading Tax',
    staking_withdrawal: 'Staking Fee',
  };
  return labels[type] || 'Tax';
}
