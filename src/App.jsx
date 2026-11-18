import React, { useEffect, useMemo, useState } from 'react';
import AppIcon from './components/AppIcon';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  QUICK_AMOUNTS,
  USER_PROFILE,
  formatInputRibuan,
  formatRupiah,
  parseInputRibuan,
} from './data/initialData';

const STORAGE_KEY_ACCOUNTS = 'traney_v2_accounts';
const STORAGE_KEY_TXS = 'traney_v2_transactions';
const STORAGE_KEY_BUDGET = 'traney_v2_budget';
const STORAGE_KEY_THEME = 'traney_v2_theme';

const NAV_PAGES = [
  { id: 'overview', label: 'Ringkasan', icon: 'wallet' },
  { id: 'transactions', label: 'Transaksi', icon: 'receipt' },
  { id: 'accounts', label: 'Dompet', icon: 'landmark' },
  { id: 'analytics', label: 'Laporan', icon: 'trending_up' },
];

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  // Core data state (defaults to Rp 0 fresh account)
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TXS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUDGET, String(monthlyBudget));
  }, [monthlyBudget]);

  // UI states
  const [hideBalance, setHideBalance] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Transaction form state
  const [txType, setTxType] = useState('expense');
  const [amountInput, setAmountInput] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id || 'acc-bca'
  );
  const [targetAccountId, setTargetAccountId] = useState(
    accounts[1]?.id || 'acc-gopay'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    EXPENSE_CATEGORIES[0].id
  );
  const [noteInput, setNoteInput] = useState('');
  const [dateInput, setDateInput] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Account edit & add state
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingBalanceVal, setEditingBalanceVal] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Budget edit state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInputVal, setBudgetInputVal] = useState('');

  // History filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccountId, setFilterAccountId] = useState('all');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  };

  const handleSwitchTxType = (type) => {
    setTxType(type);
    if (type === 'expense') {
      setSelectedCategoryId(EXPENSE_CATEGORIES[0].id);
    } else if (type === 'income') {
      setSelectedCategoryId(INCOME_CATEGORIES[0].id);
    }
  };

  const openQuickTx = (type) => {
    handleSwitchTxType(type);
    setActivePage('transactions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Computed totals
  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0),
    [accounts]
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const netCashflow = totalIncome - totalExpense;

  const expenseCategoryStats = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => {
      const sum = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const count = transactions.filter(
        (t) => t.type === 'expense' && t.categoryId === cat.id
      ).length;
      const pct =
        totalExpense > 0 ? Math.round((sum / totalExpense) * 100) : 0;
      return { ...cat, amount: sum, count, pct };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpense]);

  const incomeCategoryStats = useMemo(() => {
    return INCOME_CATEGORIES.map((cat) => {
      const sum = transactions
        .filter((t) => t.type === 'income' && t.categoryId === cat.id)
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const count = transactions.filter(
        (t) => t.type === 'income' && t.categoryId === cat.id
      ).length;
      const pct = totalIncome > 0 ? Math.round((sum / totalIncome) * 100) : 0;
      return { ...cat, amount: sum, count, pct };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions, totalIncome]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (
        filterAccountId !== 'all' &&
        t.accountId !== filterAccountId &&
        t.targetAccountId !== filterAccountId
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (t.note || '').toLowerCase().includes(q);
        const matchCat = (t.categoryLabel || '').toLowerCase().includes(q);
        const matchAcc = (t.accountName || '').toLowerCase().includes(q);
        return matchNote || matchCat || matchAcc;
      }
      return true;
    });
  }, [transactions, filterType, filterAccountId, searchQuery]);

  // Actions
  const handleAddQuickAmount = (val) => {
    const current = parseInputRibuan(amountInput);
    setAmountInput(formatInputRibuan(current + val));
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    const numericAmount = parseInputRibuan(amountInput);
    if (numericAmount <= 0) {
      showToast('Masukkan nominal lebih dari Rp 0');
      return;
    }

    const sourceAcc =
      accounts.find((a) => a.id === selectedAccountId) || accounts[0];
    if (!sourceAcc) return;

    if (txType === 'transfer') {
      const destAcc = accounts.find((a) => a.id === targetAccountId);
      if (!destAcc || destAcc.id === sourceAcc.id) {
        showToast('Pilih akun tujuan yang berbeda');
        return;
      }

      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'transfer',
        amount: numericAmount,
        accountId: sourceAcc.id,
        accountName: sourceAcc.name,
        targetAccountId: destAcc.id,
        targetAccountName: destAcc.name,
        categoryId: 'transfer',
        categoryLabel: 'Transfer Saldo',
        icon: 'arrow_left_right',
        note:
          noteInput.trim() || `Transfer ${sourceAcc.name} → ${destAcc.name}`,
        date: dateInput,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === sourceAcc.id)
            return { ...a, balance: a.balance - numericAmount };
          if (a.id === destAcc.id)
            return { ...a, balance: a.balance + numericAmount };
          return a;
        })
      );
      showToast(`Transfer ${formatRupiah(numericAmount)} berhasil dicatat`);
    } else {
      const catPool =
        txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      const chosenCat =
        catPool.find((c) => c.id === selectedCategoryId) || catPool[0];

      const newTx = {
        id: `tx-${Date.now()}`,
        type: txType,
        amount: numericAmount,
        accountId: sourceAcc.id,
        accountName: sourceAcc.name,
        categoryId: chosenCat.id,
        categoryLabel: chosenCat.label,
        icon: chosenCat.icon,
        note: noteInput.trim() || chosenCat.label,
        date: dateInput,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === sourceAcc.id) {
            const delta =
              txType === 'income' ? numericAmount : -numericAmount;
            return { ...a, balance: a.balance + delta };
          }
          return a;
        })
      );
      showToast(
        `${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(
          numericAmount
        )} tersimpan`
      );
    }

    setAmountInput('');
    setNoteInput('');
  };

  const handleDeleteTransaction = (tx) => {
    setTransactions((prev) => prev.filter((item) => item.id !== tx.id));
    setAccounts((prev) =>
      prev.map((a) => {
        if (tx.type === 'transfer') {
          if (a.id === tx.accountId)
            return { ...a, balance: a.balance + tx.amount };
          if (a.id === tx.targetAccountId)
            return { ...a, balance: a.balance - tx.amount };
          return a;
        }
        if (a.id === tx.accountId) {
          const revertDelta = tx.type === 'income' ? -tx.amount : tx.amount;
          return { ...a, balance: a.balance + revertDelta };
        }
        return a;
      })
    );
    showToast('Transaksi dihapus & saldo disesuaikan');
  };

  const handleStartEditAccount = (acc) => {
    setEditingAccountId(acc.id);
    setEditingBalanceVal(
      acc.balance > 0 ? formatInputRibuan(acc.balance) : ''
    );
  };

  const handleSaveAccountBalance = (accId) => {
    const newBal = parseInputRibuan(editingBalanceVal);
    setAccounts((prev) =>
      prev.map((a) => (a.id === accId ? { ...a, balance: newBal } : a))
    );
    setEditingAccountId(null);
    showToast('Saldo akun diperbarui');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const initBal = parseInputRibuan(newAccBalance);
    const iconByType =
      newAccType === 'E-Wallet'
        ? 'smartphone'
        : newAccType === 'Simpanan'
        ? 'piggy_bank'
        : newAccType === 'Kas'
        ? 'banknote'
        : 'landmark';

    const newAcc = {
      id: `acc-${Date.now()}`,
      name: newAccName.trim(),
      type: newAccType,
      icon: iconByType,
      balance: initBal,
    };

    setAccounts((prev) => [...prev, newAcc]);
    setNewAccName('');
    setNewAccBalance('');
    setShowAddAccount(false);
    showToast(`Akun ${newAcc.name} ditambahkan`);
  };

  const handleDeleteAccount = (accId) => {
    if (accounts.length <= 1) {
      showToast('Minimal harus ada 1 akun aktif');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== accId));
    if (selectedAccountId === accId) {
      const remaining = accounts.filter((a) => a.id !== accId);
      if (remaining[0]) setSelectedAccountId(remaining[0].id);
    }
    showToast('Akun dihapus');
  };

  const handleSaveBudget = () => {
    const parsed = parseInputRibuan(budgetInputVal);
    setMonthlyBudget(parsed);
    setIsEditingBudget(false);
    showToast('Target anggaran bulanan disimpan');
  };

  const handleResetAllData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMonthlyBudget(0);
    setShowProfileMenu(false);
    showToast('Semua data direset kembali ke Rp 0');
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('Belum ada transaksi untuk diekspor');
      return;
    }
    const headers = ['Tanggal,Tipe,Kategori,Akun,Catatan,Nominal (Rp)'];
    const rows = transactions.map(
      (t) =>
        `${t.date},${t.type},"${t.categoryLabel}","${t.accountName}","${(
          t.note || ''
        ).replace(/"/g, '""')}",${t.amount}`
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `traney-padeswara-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh');
  };

  const activeCategoryPool =
    txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const budgetPercent =
    monthlyBudget > 0
      ? Math.min(100, Math.round((totalExpense / monthlyBudget) * 100))
      : 0;

  const currentNavObj =
    NAV_PAGES.find((p) => p.id === activePage) || NAV_PAGES[0];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 md:pb-10 transition-colors">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-2">
          {/* Left: Brand & Desktop Navigation Tabs */}
          <div className="flex items-center gap-6 min-w-0">
            <button
              type="button"
              onClick={() => handleNavigate('overview')}
              className="flex items-center gap-2 text-left shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-display font-bold text-sm">
                T
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  Traney
                </span>
                <span className="md:hidden text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  • {currentNavObj.label}
                </span>
              </div>
            </button>

            {/* Desktop Page Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_PAGES.map((page) => {
                const isActive = activePage === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleNavigate(page.id)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70'
                    }`}
                  >
                    <AppIcon name={page.icon} className="text-[14px]" />
                    <span>{page.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openQuickTx('expense')}
              className="hidden sm:inline-flex h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-medium items-center gap-1.5 transition-colors"
            >
              <AppIcon name="plus" className="text-[14px]" />
              <span>Catat Transaksi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label="Toggle Dark/Light Mode"
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 inline-flex items-center justify-center transition-colors"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              <AppIcon name={isDark ? 'sun' : 'moon'} className="text-[15px]" />
            </button>

            {/* User Profile Pill (Default Empty Photo) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="h-9 sm:h-8 pl-1.5 pr-2 sm:pr-2.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 inline-flex items-center gap-1.5 sm:gap-2 transition-colors"
              >
                <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  <AppIcon name="user" className="text-[12px]" />
                </div>
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[84px] sm:max-w-none truncate">
                  {USER_PROFILE.name}
                </span>
                <AppIcon
                  name="chevron_down"
                  className="text-[12px] text-zinc-400"
                />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-2 z-50 space-y-1">
                    <div className="px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {USER_PROFILE.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Data tersimpan lokal di browser
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleExportCSV();
                      }}
                      className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                    >
                      <AppIcon name="download" className="text-[14px]" />
                      <span>Ekspor Laporan CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAllData}
                      className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                    >
                      <AppIcon name="rotate_ccw" className="text-[14px]" />
                      <span>Reset Semua Data ke Rp 0</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        {/* ============================================================
            PAGE 1: RINGKASAN (OVERVIEW DASHBOARD)
        ============================================================ */}
        {activePage === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Greeting & Mobile-Friendly Quick Action Grid */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                  Halo, {USER_PROFILE.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Ringkasan posisi saldo dan arus kas Anda saat ini.
                </p>
              </div>
              <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openQuickTx('income')}
                  className="h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl sm:rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AppIcon name="plus" className="text-[14px]" />
                  <span>Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => openQuickTx('expense')}
                  className="h-10 sm:h-9 px-3 sm:px-3.5 rounded-xl sm:rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AppIcon name="minus" className="text-[14px]" />
                  <span>Keluar</span>
                </button>
                <button
                  type="button"
                  onClick={() => openQuickTx('transfer')}
                  className="h-10 sm:h-9 px-3 rounded-xl sm:rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AppIcon name="arrow_left_right" className="text-[14px]" />
                  <span>Transfer</span>
                </button>
              </div>
            </div>

            {/* Responsive KPI Summary Grid:
                On mobile: Total Saldo is col-span-2 (full width), Pemasukan & Pengeluaran are 1 col each side-by-side, Selisih Bersih is col-span-2.
                On desktop (lg): 4 equal columns! */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Total Saldo (Full width on mobile so large Rupiah figures never get cut off) */}
              <div className="col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Total Saldo Aktif</span>
                  <button
                    type="button"
                    onClick={() => setHideBalance((prev) => !prev)}
                    className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    title={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                  >
                    <AppIcon
                      name={hideBalance ? 'eye_off' : 'eye'}
                      className="text-[15px]"
                    />
                  </button>
                </div>
                <div className="mt-1.5 font-display font-bold text-2xl sm:text-xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {hideBalance ? 'Rp •••••••' : formatRupiah(totalBalance)}
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Tersebar di {accounts.length} dompet/rekening
                </div>
              </div>

              {/* Pemasukan */}
              <div className="col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Pemasukan</span>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <AppIcon name="arrow_down_left" className="text-[13px]" />
                  </span>
                </div>
                <div className="mt-2 font-display font-bold text-base sm:text-xl text-emerald-600 dark:text-emerald-400 tabular-nums break-words">
                  {hideBalance ? 'Rp •••••' : `+${formatRupiah(totalIncome)}`}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  {transactions.filter((t) => t.type === 'income').length}{' '}
                  transaksi
                </div>
              </div>

              {/* Pengeluaran */}
              <div className="col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Pengeluaran</span>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AppIcon name="arrow_up_right" className="text-[13px]" />
                  </span>
                </div>
                <div className="mt-2 font-display font-bold text-base sm:text-xl text-rose-600 dark:text-rose-400 tabular-nums break-words">
                  {hideBalance ? 'Rp •••••' : `-${formatRupiah(totalExpense)}`}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  {transactions.filter((t) => t.type === 'expense').length}{' '}
                  transaksi
                </div>
              </div>

              {/* Selisih Bersih */}
              <div className="col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Selisih Arus Kas</span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('analytics')}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline underline-offset-2"
                  >
                    Atur Anggaran
                  </button>
                </div>
                <div
                  className={`mt-1.5 font-display font-bold text-lg sm:text-xl tabular-nums ${
                    netCashflow < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {hideBalance
                    ? 'Rp •••••••'
                    : `${netCashflow < 0 ? '-' : '+'}${formatRupiah(
                        netCashflow
                      )}`}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                  {monthlyBudget > 0
                    ? `Anggaran terpakai ${budgetPercent}% dari ${formatRupiah(
                        monthlyBudget
                      )}`
                    : 'Target anggaran bulanan belum diatur'}
                </div>
              </div>
            </section>

            {/* 2-Column Overview Lower Section: Wallets Summary + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              {/* Left 5 Cols: Dompet & Rekening */}
              <section className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      Posisi Dompet &amp; Bank
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Saldo aktif di masing-masing akun
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('accounts')}
                    className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors shrink-0"
                  >
                    Kelola
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleNavigate('accounts')}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                          <AppIcon name={acc.icon} className="text-[16px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {acc.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {acc.type}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0">
                        {hideBalance ? 'Rp •••••' : formatRupiah(acc.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right 7 Cols: Recent Transactions */}
              <section className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      Transaksi Terakhir
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      5 aktivitas terbaru yang tercatat
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('transactions')}
                    className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors shrink-0"
                  >
                    Semua
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-8 sm:py-10 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-2">
                      <AppIcon name="inbox" className="text-[18px]" />
                    </div>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Belum ada transaksi tercatat
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-xs">
                      Catat pemasukan/pengeluaran pertama Anda atau atur saldo
                      awal di menu Dompet.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openQuickTx('income')}
                        className="h-8 px-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium"
                      >
                        + Catat Transaksi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('accounts')}
                        className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        Atur Saldo Awal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {transactions.slice(0, 5).map((tx) => {
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      return (
                        <div
                          key={tx.id}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isIncome
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : isTransfer
                                  ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              }`}
                            >
                              <AppIcon name={tx.icon} className="text-[16px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {tx.note}
                              </p>
                              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                                {tx.categoryLabel} •{' '}
                                {isTransfer
                                  ? `${tx.accountName} → ${tx.targetAccountName}`
                                  : tx.accountName}{' '}
                                • {tx.date}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold tabular-nums shrink-0 ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isTransfer
                                ? 'text-zinc-700 dark:text-zinc-300'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : isTransfer ? '' : '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ============================================================
            PAGE 2: TRANSAKSI (FORM CATAT & RIWAYAT LENGKAP)
        ============================================================ */}
        {activePage === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
            {/* Left 5 Cols: Form Catat Transaksi */}
            <section className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="space-y-2.5">
                <h1 className="font-display font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Catat Transaksi Baru
                </h1>
                {/* Full-width 3-column segmented switcher for comfortable mobile tapping */}
                <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                  {[
                    { id: 'expense', label: 'Pengeluaran' },
                    { id: 'income', label: 'Pemasukan' },
                    { id: 'transfer', label: 'Transfer' },
                  ].map((tab) => {
                    const active = txType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSwitchTxType(tab.id)}
                        className={`h-8 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmitTransaction} className="space-y-3.5">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Nominal (Rupiah)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-semibold text-zinc-400 dark:text-zinc-500 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amountInput}
                      onChange={(e) =>
                        setAmountInput(formatInputRibuan(e.target.value))
                      }
                      className="w-full h-11 pl-10 pr-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-lg font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                    />
                    {amountInput && (
                      <button
                        type="button"
                        onClick={() => setAmountInput('')}
                        className="absolute right-2.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Equal 4-col grid on mobile for quick nominal buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {QUICK_AMOUNTS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleAddQuickAmount(item.value)}
                        className="h-8 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors tabular-nums"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {txType === 'transfer' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Dari Akun
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({formatRupiah(a.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Ke Akun
                      </label>
                      <select
                        value={targetAccountId}
                        onChange={(e) => setTargetAccountId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({formatRupiah(a.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        {txType === 'expense' ? 'Sumber Dana' : 'Masuk ke Akun'}
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({formatRupiah(a.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none"
                      />
                    </div>
                  </div>
                )}

                {txType !== 'transfer' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Kategori
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCategoryPool.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-2 truncate transition-colors ${
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <AppIcon name={cat.icon} className="text-[14px]" />
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Makan siang, Kopi, Listrik bulanan..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <AppIcon name="check" className="text-[15px]" />
                  <span>Simpan Transaksi</span>
                </button>
              </form>
            </section>

            {/* Right 7 Cols: Riwayat Transaksi Lengkap */}
            <section className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-base text-zinc-900 dark:text-zinc-100">
                    Riwayat Transaksi
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {filteredTransactions.length}
                  </span>
                </div>

                {/* Account Filter Dropdown */}
                <select
                  value={filterAccountId}
                  onChange={(e) => setFilterAccountId(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
                >
                  <option value="all">Semua Akun</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full-width 4-col filter bar on mobile */}
              <div className="grid grid-cols-4 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'expense', label: 'Keluar' },
                  { id: 'income', label: 'Masuk' },
                  { id: 'transfer', label: 'Transfer' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterType(f.id)}
                    className={`h-7 rounded-lg text-xs font-medium transition-colors ${
                      filterType === f.id
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <AppIcon
                  name="search"
                  className="text-[14px] text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Cari catatan, kategori, atau akun..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                />
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-2">
                    <AppIcon name="inbox" className="text-[18px]" />
                  </div>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Tidak ada transaksi yang ditemukan
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-xs">
                    Gunakan form di atas untuk mencatat transaksi baru.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70 max-h-[500px] overflow-y-auto pr-0.5">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    return (
                      <div
                        key={tx.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            <AppIcon name={tx.icon} className="text-[16px]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {tx.note}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                              <span>{tx.categoryLabel}</span>
                              <span>•</span>
                              <span>
                                {isTransfer
                                  ? `${tx.accountName} → ${tx.targetAccountName}`
                                  : tx.accountName}
                              </span>
                              <span>•</span>
                              <span>{tx.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isTransfer
                                ? 'text-zinc-700 dark:text-zinc-300'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : isTransfer ? '' : '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Hapus transaksi"
                          >
                            <AppIcon name="trash" className="text-[14px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ============================================================
            PAGE 3: DOMPET & BANK (ACCOUNTS MANAGEMENT)
        ============================================================ */}
        {activePage === 'accounts' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                  Dompet &amp; Bank
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Total gabungan:{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {formatRupiah(totalBalance)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAccount((prev) => !prev)}
                className="h-9 px-3 rounded-xl sm:rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <AppIcon
                  name={showAddAccount ? 'close' : 'plus'}
                  className="text-[14px]"
                />
                <span>{showAddAccount ? 'Tutup' : 'Tambah Akun'}</span>
              </button>
            </div>

            {showAddAccount && (
              <form
                onSubmit={handleCreateAccount}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
              >
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Tambah Dompet / Rekening Baru
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      Nama Akun
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Mandiri, SeaBank, OVO"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      Kategori Akun
                    </label>
                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs outline-none"
                    >
                      <option value="Bank">Rekening Bank</option>
                      <option value="E-Wallet">E-Wallet</option>
                      <option value="Simpanan">Tabungan / Investasi</option>
                      <option value="Kas">Kas Tunai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      Saldo Awal (Rp)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={newAccBalance}
                        onChange={(e) =>
                          setNewAccBalance(formatInputRibuan(e.target.value))
                        }
                        className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs tabular-nums outline-none"
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium shrink-0"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {accounts.map((acc) => {
                const isEditing = editingAccountId === acc.id;
                const accIn = transactions
                  .filter(
                    (t) =>
                      (t.type === 'income' && t.accountId === acc.id) ||
                      (t.type === 'transfer' && t.targetAccountId === acc.id)
                  )
                  .reduce((s, t) => s + Number(t.amount || 0), 0);
                const accOut = transactions
                  .filter(
                    (t) =>
                      (t.type === 'expense' && t.accountId === acc.id) ||
                      (t.type === 'transfer' && t.accountId === acc.id)
                  )
                  .reduce((s, t) => s + Number(t.amount || 0), 0);

                return (
                  <div
                    key={acc.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                          <AppIcon name={acc.icon} className="text-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {acc.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                              {acc.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            Saldo aktif
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditAccount(acc)}
                          className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 transition-colors"
                        >
                          <AppIcon name="edit" className="text-[12px]" />
                          <span>Atur Saldo</span>
                        </button>
                        {accounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors"
                            title="Hapus akun"
                          >
                            <AppIcon name="trash" className="text-[14px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-xs font-semibold text-zinc-400 shrink-0">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          autoFocus
                          value={editingBalanceVal}
                          onChange={(e) =>
                            setEditingBalanceVal(
                              formatInputRibuan(e.target.value)
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            handleSaveAccountBalance(acc.id)
                          }
                          className="w-full min-w-0 flex-1 h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm font-semibold tabular-nums outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveAccountBalance(acc.id)}
                          className="h-9 px-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium shrink-0"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAccountId(null)}
                          className="h-9 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 shrink-0"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {hideBalance ? 'Rp •••••••' : formatRupiah(acc.balance)}
                      </div>
                    )}

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                      <span className="text-zinc-500 dark:text-zinc-400 truncate">
                        Masuk:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums font-medium">
                          +{formatRupiah(accIn)}
                        </strong>
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 truncate">
                        Keluar:{' '}
                        <strong className="text-rose-600 dark:text-rose-400 tabular-nums font-medium">
                          -{formatRupiah(accOut)}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            PAGE 4: LAPORAN & ANGGARAN (ANALYTICS)
        ============================================================ */}
        {activePage === 'analytics' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                  Laporan &amp; Anggaran
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Rincian pengeluaran dan evaluasi target bulanan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-9 px-3 rounded-xl sm:rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <AppIcon name="download" className="text-[14px]" />
                <span>CSV</span>
              </button>
            </div>

            {/* Monthly Budget Card */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h2 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Target Anggaran Pengeluaran Bulanan
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {monthlyBudget > 0
                      ? `Terpakai ${formatRupiah(totalExpense)} dari batas ${formatRupiah(
                          monthlyBudget
                        )} (${budgetPercent}%)`
                      : 'Belum ada batas anggaran bulanan yang ditetapkan'}
                  </p>
                </div>

                {isEditingBudget ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-zinc-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Contoh: 5.000.000"
                      autoFocus
                      value={budgetInputVal}
                      onChange={(e) =>
                        setBudgetInputVal(formatInputRibuan(e.target.value))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                      className="flex-1 sm:w-36 h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold tabular-nums outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveBudget}
                      className="h-9 px-3.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium shrink-0"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBudget(true);
                      setBudgetInputVal(
                        monthlyBudget > 0
                          ? formatInputRibuan(monthlyBudget)
                          : ''
                      );
                    }}
                    className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 self-start sm:self-auto"
                  >
                    {monthlyBudget > 0 ? 'Ubah Target' : 'Atur Target Anggaran'}
                  </button>
                )}
              </div>

              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${budgetPercent}%` }}
                  className={`h-full transition-all duration-300 ${
                    budgetPercent >= 90
                      ? 'bg-rose-500'
                      : budgetPercent >= 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </section>

            {/* Category Breakdown Grid: Expenses vs Incomes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {/* Pengeluaran per Kategori */}
              <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Pengeluaran per Kategori
                  </h2>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatRupiah(totalExpense)}
                  </span>
                </div>

                <div className="space-y-3">
                  {expenseCategoryStats.map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`}
                          />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {cat.label}
                          </span>
                          <span className="text-[11px] text-zinc-400 shrink-0">
                            ({cat.count}x)
                          </span>
                        </div>
                        <div className="tabular-nums shrink-0">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(cat.amount)}
                          </span>
                          <span className="text-zinc-400 ml-1">
                            ({cat.pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${cat.pct}%` }}
                          className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pemasukan per Kategori */}
              <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Sumber Pemasukan
                  </h2>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatRupiah(totalIncome)}
                  </span>
                </div>

                <div className="space-y-3">
                  {incomeCategoryStats.map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`}
                          />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {cat.label}
                          </span>
                          <span className="text-[11px] text-zinc-400 shrink-0">
                            ({cat.count}x)
                          </span>
                        </div>
                        <div className="tabular-nums shrink-0">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(cat.amount)}
                          </span>
                          <span className="text-zinc-400 ml-1">
                            ({cat.pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${cat.pct}%` }}
                          className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe">
        <div className="grid grid-cols-4 h-16 px-2 items-center">
          {NAV_PAGES.map((page) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => handleNavigate(page.id)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors"
              >
                <div
                  className={`px-3.5 py-1 rounded-full transition-colors flex items-center justify-center ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  <AppIcon name={page.icon} className="text-[16px]" />
                </div>
                <span
                  className={`text-[11px] leading-none ${
                    isActive
                      ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                      : 'font-medium text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {page.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Subtle Bottom Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-5 inset-x-4 md:inset-x-auto md:right-4 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center justify-center md:justify-start gap-2">
          <AppIcon
            name="check"
            className="text-[14px] text-emerald-400 dark:text-emerald-600"
          />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
