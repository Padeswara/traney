export const USER_PROFILE = {
  name: 'Padeswara',
  avatarUrl: null,
};

export const INITIAL_ACCOUNTS = [
  {
    id: 'acc-bca',
    name: 'BCA',
    type: 'Bank',
    icon: 'landmark',
    balance: 0,
  },
  {
    id: 'acc-gopay',
    name: 'GoPay',
    type: 'E-Wallet',
    icon: 'smartphone',
    balance: 0,
  },
  {
    id: 'acc-tabungan',
    name: 'Tabungan',
    type: 'Simpanan',
    icon: 'piggy_bank',
    balance: 0,
  },
  {
    id: 'acc-tunai',
    name: 'Tunai',
    type: 'Kas',
    icon: 'banknote',
    balance: 0,
  },
];

export const INITIAL_TRANSACTIONS = [];

export const EXPENSE_CATEGORIES = [
  {
    id: 'makan',
    label: 'Makan & Minum',
    icon: 'utensils',
    color: 'bg-orange-500',
    badgeClass:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
  },
  {
    id: 'belanja',
    label: 'Belanja',
    icon: 'shopping_bag',
    color: 'bg-blue-500',
    badgeClass:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'car',
    color: 'bg-amber-500',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  },
  {
    id: 'tagihan',
    label: 'Tagihan & Rutin',
    icon: 'receipt',
    color: 'bg-purple-500',
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
  },
  {
    id: 'hiburan',
    label: 'Hiburan',
    icon: 'gamepad',
    color: 'bg-pink-500',
    badgeClass:
      'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800/60',
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: 'heart_pulse',
    color: 'bg-rose-500',
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
  },
];

export const INCOME_CATEGORIES = [
  {
    id: 'gaji',
    label: 'Gaji Utama',
    icon: 'briefcase',
    color: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  {
    id: 'freelance',
    label: 'Proyek / Freelance',
    icon: 'wallet',
    color: 'bg-teal-500',
    badgeClass:
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
  },
  {
    id: 'investasi',
    label: 'Hasil Investasi',
    icon: 'trending_up',
    color: 'bg-cyan-500',
    badgeClass:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60',
  },
  {
    id: 'lainnya_in',
    label: 'Pemasukan Lain',
    icon: 'plus',
    color: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  },
];

export const QUICK_AMOUNTS = [
  { label: '+25rb', value: 25000 },
  { label: '+50rb', value: 50000 },
  { label: '+100rb', value: 100000 },
  { label: '+500rb', value: 500000 },
];

export function formatRupiah(amount) {
  const num = Math.round(Math.abs(Number(amount) || 0));
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatInputRibuan(rawString) {
  const digits = String(rawString || '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}

export function parseInputRibuan(formattedString) {
  const digits = String(formattedString || '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
