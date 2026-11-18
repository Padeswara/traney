import React, { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { BRAND_ASSETS, formatCurrency } from '../data/initialData';

export default function OverviewPage({
  accounts,
  transactions,
  totalBalance,
  onQuickAction,
  onNavigate,
}) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Dynamic vault distribution percentages
  const savingsBal = accounts
    .filter((a) => a.group === 'savings')
    .reduce((s, a) => s + a.balance, 0);
  const checkingBal = accounts
    .filter((a) => a.group === 'checking')
    .reduce((s, a) => s + a.balance, 0);
  const manualBal = accounts
    .filter((a) => a.group === 'manual')
    .reduce((s, a) => s + a.balance, 0);

  const savingsPct =
    totalBalance > 0 ? Math.round((savingsBal / totalBalance) * 100) : 0;
  const checkingPct =
    totalBalance > 0 ? Math.round((checkingBal / totalBalance) * 100) : 0;
  const manualPct =
    totalBalance > 0 ? Math.max(0, 100 - savingsPct - checkingPct) : 0;

  // Dynamic Cash Flow calculations from transactions
  const incomeTxs = transactions.filter((t) => t.type === 'income');
  const expenseTxs = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = expenseTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  const savingsTarget = 5000;
  const savingsGoalPct =
    netCashFlow > 0
      ? Math.min(100, Math.round((netCashFlow / savingsTarget) * 100))
      : 0;

  const velocityPct =
    totalBalance > 0 && netCashFlow !== 0
      ? ((netCashFlow / Math.max(totalBalance, 1)) * 100).toFixed(1)
      : '0.0';

  const visibleTransactions = showAllActivity
    ? transactions
    : transactions.slice(0, 4);

  return (
    <div className="flex flex-col w-full px-margin-mobile lg:px-0 space-y-space-lg select-none">
      {/* Dynamic Greeting & Quick State Pulse */}
      <div className="flex items-center justify-between pt-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-secondary relative" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
              Welcome, {BRAND_ASSETS.userName}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface font-medium">
              Live Ledger • Ready
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
          <AppIcon name="trending_up" className="text-[14px] text-secondary" />
          <span>Pro Active</span>
        </div>
      </div>

      {/* Desktop Responsive 12-Column Grid / Mobile Stacked Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column on Desktop (7 cols): Hero Card + Quick Actions + Connected Vaults */}
        <div className="lg:col-span-7 flex flex-col space-y-space-lg">
          {/* Section 1: Total Net Balance Hero Card */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-5 lg:p-6 shadow-xl">
            {/* Ambient Luminous Mesh Gradient */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col space-y-space-md">
              {/* Balance Header & Eye Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide">
                  Total Net Balance
                </span>
                <button
                  aria-label="Toggle balance visibility"
                  type="button"
                  onClick={() => setIsBalanceHidden((prev) => !prev)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
                >
                  <AppIcon
                    name={isBalanceHidden ? 'visibility_off' : 'visibility'}
                    className="text-[18px]"
                  />
                </button>
              </div>

              {/* Hero Currency Figure */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-baseline space-x-1">
                  {!isBalanceHidden ? (
                    <span className="font-display-currency-mobile text-display-currency-mobile lg:text-display-currency text-on-surface tracking-tight transition-all duration-200">
                      {formatCurrency(totalBalance)}
                    </span>
                  ) : (
                    <span className="font-display-currency-mobile text-display-currency-mobile lg:text-display-currency text-on-surface tracking-widest">
                      ••••••••
                    </span>
                  )}
                </div>
                {/* Velocity Badge */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      netCashFlow < 0
                        ? 'bg-tertiary/15 text-tertiary'
                        : 'bg-secondary/15 text-secondary'
                    }`}
                  >
                    <AppIcon
                      name={netCashFlow < 0 ? 'arrow_downward' : 'arrow_upward'}
                      className="text-[14px]"
                    />
                    {netCashFlow >= 0 ? `+${velocityPct}%` : `${velocityPct}%`}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {netCashFlow >= 0 ? '+' : '-'}
                    {formatCurrency(netCashFlow)} this month
                  </span>
                </div>
              </div>

              {/* Segmented Vault Distribution Bar */}
              <div className="pt-2 flex flex-col space-y-2">
                <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden flex p-0.5 gap-0.5">
                  {totalBalance > 0 ? (
                    <>
                      {savingsPct > 0 && (
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-300"
                          style={{ width: `${savingsPct}%` }}
                          title={`Savings (${savingsPct}%)`}
                        />
                      )}
                      {checkingPct > 0 && (
                        <div
                          className="h-full bg-primary-container rounded-full transition-all duration-300"
                          style={{ width: `${checkingPct}%` }}
                          title={`Checking (${checkingPct}%)`}
                        />
                      )}
                      {manualPct > 0 && (
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${manualPct}%` }}
                          title={`Cash / Reserve (${manualPct}%)`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full bg-surface-container-high/40 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span>Savings {savingsPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                    <span>Checking {checkingPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Cash {manualPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Action Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => onQuickAction('income')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-transform active:scale-95 group"
            >
              <div className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mb-1.5 group-hover:bg-secondary/25 transition-colors">
                <AppIcon name="add" className="text-[20px]" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-medium truncate w-full text-center">
                Income
              </span>
            </button>

            <button
              type="button"
              onClick={() => onQuickAction('expense')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-transform active:scale-95 group"
            >
              <div className="w-11 h-11 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-1.5 group-hover:bg-tertiary-container/30 transition-colors">
                <AppIcon name="remove" className="text-[20px]" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-medium truncate w-full text-center">
                Expense
              </span>
            </button>

            <button
              type="button"
              onClick={() => onQuickAction('transfer')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-transform active:scale-95 group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-1.5 group-hover:bg-primary/25 transition-colors">
                <AppIcon name="swap_horiz" className="text-[20px]" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-medium truncate w-full text-center">
                Transfer
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('accounts')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-transform active:scale-95 group"
            >
              <div className="w-11 h-11 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center mb-1.5 group-hover:text-on-surface transition-colors">
                <AppIcon name="tune" className="text-[20px]" />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-medium truncate w-full text-center">
                Adjust
              </span>
            </button>
          </div>

          {/* Section 3: Connected Accounts Quick Carousel */}
          <div className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Connected Vaults
              </span>
              <button
                type="button"
                onClick={() => onNavigate('accounts')}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                {accounts.length} Linked
              </button>
            </div>

            <div className="flex lg:grid lg:grid-cols-4 gap-space-sm overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-margin-mobile px-margin-mobile lg:mx-0 lg:px-0">
              {accounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => onNavigate('accounts')}
                  className="flex-shrink-0 w-44 lg:w-auto rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors p-3.5 flex flex-col justify-between space-y-3 relative overflow-hidden cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        acc.group === 'savings'
                          ? 'bg-secondary/15 text-secondary'
                          : acc.id === 'chase-premier'
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <AppIcon
                        name={acc.carouselIcon || acc.icon}
                        className="text-[16px]"
                      />
                    </div>
                    <span
                      className={`font-label-sm text-label-sm ${
                        acc.group === 'savings'
                          ? 'text-secondary font-semibold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {acc.carouselBadge || acc.badge}
                    </span>
                  </div>
                  <div>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">
                      {acc.shortName || acc.name}
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-on-surface">
                      {isBalanceHidden ? '••••••' : formatCurrency(acc.balance)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add Bank Shortcut */}
              <button
                type="button"
                onClick={() => onNavigate('accounts')}
                className="flex-shrink-0 w-28 lg:w-auto rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors p-3.5 flex flex-col items-center justify-center space-y-1.5 text-on-surface-variant active:scale-95"
              >
                <AppIcon name="add_link" className="text-[20px]" />
                <span className="font-label-sm text-label-sm font-medium">
                  Add Bank
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column on Desktop (5 cols): Cash Flow Snapshot + Recent Activity Feed */}
        <div className="lg:col-span-5 flex flex-col space-y-space-lg">
          {/* Section 4: Monthly Cash Flow Snapshot */}
          <div className="rounded-xl bg-surface-container p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Cash Flow
              </span>
              <span
                className={`font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-full ${
                  netCashFlow < 0
                    ? 'text-tertiary bg-tertiary/10'
                    : 'text-secondary bg-secondary/10'
                }`}
              >
                Net {netCashFlow >= 0 ? '+' : '-'}
                {formatCurrency(netCashFlow)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              {/* Income Column */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col space-y-1">
                <div className="flex items-center gap-1.5 text-secondary">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                    <AppIcon name="arrow_downward" className="text-[13px]" />
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                    Income
                  </span>
                </div>
                <span className="font-numeric-metric text-numeric-metric text-on-surface pt-0.5">
                  {formatCurrency(totalIncome)}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {incomeTxs.length}{' '}
                  {incomeTxs.length === 1 ? 'deposit' : 'deposits'}
                </span>
              </div>

              {/* Expense Column */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col space-y-1">
                <div className="flex items-center gap-1.5 text-tertiary">
                  <div className="w-5 h-5 rounded-full bg-tertiary/20 flex items-center justify-center">
                    <AppIcon name="arrow_upward" className="text-[13px]" />
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                    Spent
                  </span>
                </div>
                <span className="font-numeric-metric text-numeric-metric text-on-surface pt-0.5">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {expenseTxs.length}{' '}
                  {expenseTxs.length === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
            </div>

            {/* Mini Progress vs Target */}
            <div className="mt-3 pt-3 flex items-center justify-between border-t-0 bg-surface-container-lowest/60 rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <AppIcon name="savings" className="text-[18px] text-primary" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">
                    Monthly Savings Goal
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {savingsGoalPct}% achieved ($5,000 target)
                  </span>
                </div>
              </div>
              <span className="font-label-md text-label-md text-secondary font-bold">
                {netCashFlow > 0 ? `+${formatCurrency(netCashFlow)}` : '$0.00'}
              </span>
            </div>
          </div>

          {/* Section 5: Recent Transactions Feed */}
          <div className="flex flex-col space-y-space-sm pb-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Recent Activity
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary" />
              </div>
              {transactions.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllActivity((prev) => !prev)}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline"
                >
                  {showAllActivity ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <AppIcon name="receipt_long" className="text-[22px]" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-label-md text-label-md text-on-surface block">
                    No transactions recorded yet
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                    Start tracking your income, expenses, or account balances to
                    populate your live ledger.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onQuickAction('income')}
                    className="px-3 py-1.5 rounded-lg bg-secondary/15 text-secondary font-label-sm text-label-sm hover:bg-secondary/25 transition-colors"
                  >
                    + Add Income
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickAction('expense')}
                    className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary font-label-sm text-label-sm hover:bg-primary/25 transition-colors"
                  >
                    + Add Expense
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {visibleTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-secondary/15 text-secondary'
                              : isTransfer
                              ? 'bg-primary/15 text-primary'
                              : 'bg-tertiary-container/20 text-tertiary'
                          }`}
                        >
                          <AppIcon name={tx.icon} className="text-[20px]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {tx.title}
                          </span>
                          <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant truncate">
                            <span>{tx.category}</span>
                            <span className="w-1 h-1 rounded-full bg-outline" />
                            <span>{tx.account}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <span
                          className={`font-numeric-metric text-numeric-metric ${
                            isIncome
                              ? 'text-secondary'
                              : isTransfer
                              ? 'text-primary'
                              : 'text-on-surface'
                          }`}
                        >
                          {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                          {formatCurrency(tx.amount, tx.currencySymbol || '$')}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {tx.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
