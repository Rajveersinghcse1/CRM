// ==============================================================================
// WEXLOGIC CRM — Financial Calculation Engine
// Safe decimal handling & standard financial formulas
// ==============================================================================

export type BudgetHealthStatus = "healthy" | "warning" | "at_limit" | "over_budget";

export const formatINR = (amount: number | string | null | undefined): string => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const roundCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const calcGrossProfit = (revenue: number, actualCost: number): number => {
  return roundCurrency(revenue - actualCost);
};

export const calcGrossMarginPct = (revenue: number, actualCost: number): number => {
  if (revenue <= 0) return 0;
  const profit = revenue - actualCost;
  return roundCurrency((profit / revenue) * 100);
};

export const calcOutstandingBalance = (totalInvoiced: number, amountPaid: number): number => {
  return roundCurrency(Math.max(0, totalInvoiced - amountPaid));
};

export const calcUtilizationPct = (actualCost: number, budget: number): number => {
  if (budget <= 0) return actualCost > 0 ? 100 : 0;
  return roundCurrency((actualCost / budget) * 100);
};

export const getBudgetHealth = (actualCost: number, budget: number): BudgetHealthStatus => {
  if (budget <= 0) return actualCost > 0 ? "over_budget" : "healthy";
  if (actualCost > budget) return "over_budget";
  if (actualCost === budget) return "at_limit";
  if (actualCost >= budget * 0.8) return "warning";
  return "healthy";
};

export const getBudgetHealthBadge = (status: BudgetHealthStatus) => {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        bg: "bg-emerald-100",
        text: "text-emerald-900",
        border: "border-[#34D399]",
      };
    case "warning":
      return {
        label: "Warning",
        bg: "bg-amber-100",
        text: "text-amber-950",
        border: "border-[#FBBF24]",
      };
    case "at_limit":
      return {
        label: "At Limit",
        bg: "bg-orange-100",
        text: "text-orange-950",
        border: "border-orange-400",
      };
    case "over_budget":
      return {
        label: "OVER BUDGET",
        bg: "bg-rose-100",
        text: "text-rose-950",
        border: "border-rose-400",
      };
  }
};

export const numberToIndianWords = (num: number | string | null | undefined): string => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertTwoDigits(val: number): string {
    if (val < 20) return ones[val];
    const unit = val % 10;
    return tens[Math.floor(val / 10)] + (unit ? " " + ones[unit] : "");
  }

  function convertThreeDigits(val: number): string {
    let result = "";
    if (val >= 100) {
      result += ones[Math.floor(val / 100)] + " Hundred";
      val %= 100;
      if (val > 0) result += " ";
    }
    if (val > 0) {
      result += convertTwoDigits(val);
    }
    return result;
  }

  let words = "";
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundreds = rem;

  if (crore > 0) {
    words += convertThreeDigits(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + " Thousand ";
  }
  if (hundreds > 0) {
    words += convertThreeDigits(hundreds) + " ";
  }

  return words.trim() + " Rupees Only";
};
