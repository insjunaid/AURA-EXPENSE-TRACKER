// Single source of truth for the three ledger types (expense / income /
// investment): field names, labels and preset chips. Keeps pages, forms and
// lists consistent without duplicated if/else chains.

export const TYPES = {
  expense: {
    key: 'expense',
    label: 'Expense',
    plural: 'Expenses',
    dateField: 'date_spent',
    titleOf: (t) => t.category?.name || 'Expense',
    sign: '−',
    tone: 'expense',
  },
  income: {
    key: 'income',
    label: 'Income',
    plural: 'Income',
    dateField: 'date_credited',
    titleOf: (t) => t.source || 'Income',
    sign: '+',
    tone: 'income',
  },
  investment: {
    key: 'investment',
    label: 'Investment',
    plural: 'Investments',
    dateField: 'date_invested',
    titleOf: (t) => t.asset_type || 'Investment',
    sign: '',
    tone: 'ink',
  },
};

export const PAYMENT_MODES = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Other'];

export const INCOME_SOURCES = ['Salary', 'Freelance', 'Business', 'Bonus', 'Interest', 'Gift', 'Refund'];

export const ASSET_TYPES = ['Stocks', 'Mutual Funds', 'SIP', 'Crypto', 'Gold', 'Fixed Deposit', 'Real Estate', 'Bonds'];
