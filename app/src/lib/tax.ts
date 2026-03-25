import { TAX_RATES, type TransactionType } from '@/types';

/**
 * Calculate tax for a given transaction amount and type.
 * All amounts in USDC (6 decimal precision).
 */
export function calculateTax(amount: number, type: TransactionType): {
  gross: number;
  tax: number;
  net: number;
  effectiveRate: number;
} {
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

  // Round to USDC precision (6 decimals)
  const tax = Math.round(amount * rate * 1e6) / 1e6;
  const net = amount - tax;

  return { gross: amount, tax, net, effectiveRate: Math.round(rate * 10000) / 100 };
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)}`;
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
