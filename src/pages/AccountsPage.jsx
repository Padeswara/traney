import React, { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { formatCurrency } from '../data/initialData';

export default function AccountsPage({
  accounts,
  totalBalance,
  onUpdateAccountBalance,
  onSetDefaultAccount,
  onAddAccount,
}) {
  const [syncStatus, setSyncStatus] = useState('Ready');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSheetAccount, setActiveSheetAccount] = useState(null);
  const [adjustModalAccount, setAdjustModalAccount] = useState(null);
  const [adjustInputVal, setAdjustInputVal] = useState('');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccGroup, setNewAccGroup] = useState('checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (message, icon = 'check_circle') => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleSyncAll = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('Syncing...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Just now');
      triggerToast(`All ${accounts.length} accounts synchronized`, 'check_circle');
    }, 900);
  };

  const openAdjustModal = (account) => {
    setActiveSheetAccount(null);
    setAdjustModalAccount(account);
    setAdjustInputVal(account.balance > 0 ? String(account.balance) : '');
  };

  const handleConfirmAdjust = (e) => {
    e.preventDefault();
    if (!adjustModalAccount) return;
    const parsed = parseFloat(adjustInputVal.replace(/[^0-9.]/g, '')) || 0;
    onUpdateAccountBalance(adjustModalAccount.id, parsed);
    triggerToast(
      `${adjustModalAccount.name} updated to ${formatCurrency(parsed)}`,
      'check_circle'
    );
    setAdjustModalAccount(null);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const parsedBal = parseFloat(newAccBalance.replace(/[^0-9.]/g, '')) || 0;
    const randomMask = String(Math.floor(1000 + Math.random() * 9000));
    if (onAddAccount) {
      onAddAccount({
        id: `acc-${Date.now()}`,
        name: newAccName.trim(),
        fullName: newAccName.trim(),
        shortName: newAccName.trim(),
        mask: `•••• ${randomMask}`,
        shortMask: `• ${randomMask}`,
        analyticsMask: `•••• ${randomMask} • Active`,
        balance: parsedBal,
        group: newAccGroup,
        badge:
          newAccGroup === 'savings'
            ? '4.75% APY'
            : newAccGroup === 'checking'
            ? 'Checking'
            : 'Manual',
        badgeType: newAccGroup === 'savings' ? 'secondary' : 'primary',
        status: 'Active',
        sublabel: newAccGroup === 'manual' ? 'Manual Wallet' : undefined,
        icon:
          newAccGroup === 'savings'
            ? 'savings'
            : newAccGroup === 'manual'
            ? 'lock'
            : 'account_balance',
        carouselIcon:
          newAccGroup === 'savings'
            ? 'savings'
            : newAccGroup === 'manual'
            ? 'lock'
            : 'account_balance',
        carouselBadge:
          newAccGroup === 'savings'
            ? 'Savings'
            : newAccGroup === 'manual'
            ? 'Manual'
            : 'Checking',
        balanceLabel: 'Available Balance',
        projectedYield:
          newAccGroup === 'savings'
            ? `+${formatCurrency((parsedBal * 0.0475) / 12)} / mo`
            : undefined,
        isDefault: false,
        inflow: parsedBal,
        outflow: 0,
        netFlow: parsedBal,
      });
    }
    triggerToast(`${newAccName.trim()} connected`, 'check_circle');
    setNewAccName('');
    setNewAccBalance('');
    setIsNewAccountModalOpen(false);
  };

  const handleSheetAction = (actionType) => {
    if (!activeSheetAccount) return;
    const acc = activeSheetAccount;
    setActiveSheetAccount(null);

    if (actionType === 'sync') {
      triggerToast(`Synced latest transactions for ${acc.name}`, 'sync');
    } else if (actionType === 'adjust') {
      openAdjustModal(acc);
    } else if (actionType === 'default') {
      onSetDefaultAccount(acc.id);
      triggerToast(`${acc.name} set as primary default`, 'star');
    } else if (actionType === 'details') {
      triggerToast(`Routing & ACH copied for ${acc.name}`, 'info');
    } else if (actionType === 'unlink') {
      triggerToast(`Provider unlink requested for ${acc.name}`, 'error_outline');
    }
  };

  const checkingAccounts = accounts.filter((a) => a.group === 'checking');
  const savingsAccounts = accounts.filter((a) => a.group === 'savings');
  const manualAccounts = accounts.filter((a) => a.group === 'manual');

  const checkingTotal = checkingAccounts.reduce((s, a) => s + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((s, a) => s + a.balance, 0);
  const manualTotal = manualAccounts.reduce((s, a) => s + a.balance, 0);

  const checkingPct =
    totalBalance > 0 ? Math.round((checkingTotal / totalBalance) * 100) : 0;
  const savingsPct =
    totalBalance > 0 ? Math.round((savingsTotal / totalBalance) * 100) : 0;
  const manualPct =
    totalBalance > 0 ? Math.max(0, 100 - checkingPct - savingsPct) : 0;

  return (
    <div className="flex flex-col w-full px-margin-mobile lg:px-0 space-y-space-lg pb-12">
      {/* Top Row on Desktop: Aggregated Balance Cockpit + Link Institutional Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        {/* Aggregated Balance Cockpit */}
        <section className="lg:col-span-7 bg-surface-container-high rounded-xl p-space-md lg:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  All Connected Accounts ({accounts.length})
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              </div>
              <button
                id="sync-all-btn"
                type="button"
                onClick={handleSyncAll}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all active:scale-95"
              >
                <AppIcon
                  name="sync"
                  className={`text-[15px] transition-transform duration-700 ${
                    isSyncing ? 'animate-spin text-primary' : ''
                  }`}
                />
                <span className="font-label-sm text-label-sm" id="sync-label">
                  {syncStatus}
                </span>
              </button>
            </div>

            <div className="mt-space-sm flex flex-col">
              <span className="font-display-currency-mobile text-display-currency-mobile lg:text-display-currency text-on-surface tracking-tight">
                {formatCurrency(totalBalance)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  <AppIcon name="trending_up" className="text-[13px]" />
                  <span className="font-label-sm text-label-sm">
                    +{formatCurrency(totalBalance)} net balance
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  across {accounts.length} vaults
                </span>
              </div>
            </div>
          </div>

          {/* Capital Allocation Breakdown Bar */}
          <div className="mt-space-md pt-space-sm bg-surface-container-lowest/40 -mx-space-md lg:-mx-6 -mb-space-md lg:-mb-6 px-space-md lg:px-6 pb-space-md lg:pb-5 rounded-b-xl">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Asset Distribution
              </span>
              <span className="font-label-sm text-label-sm text-on-surface">
                {totalBalance > 0 ? '100% Liquid' : '0% Allocated'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-highest flex overflow-hidden gap-0.5">
              {totalBalance > 0 ? (
                <>
                  {checkingPct > 0 && (
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${checkingPct}%` }}
                      title={`Checking: ${checkingPct}%`}
                    />
                  )}
                  {savingsPct > 0 && (
                    <div
                      className="h-full bg-secondary transition-all duration-500"
                      style={{ width: `${savingsPct}%` }}
                      title={`Savings: ${savingsPct}%`}
                    />
                  )}
                  {manualPct > 0 && (
                    <div
                      className="h-full bg-primary-container transition-all duration-500"
                      style={{ width: `${manualPct}%` }}
                      title={`Cash: ${manualPct}%`}
                    />
                  )}
                </>
              ) : (
                <div className="h-full w-full bg-surface-container-highest" />
              )}
            </div>
            <div className="flex justify-between items-center mt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Checking{' '}
                  <span className="font-numeric-metric text-on-surface">
                    {checkingPct}%
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Savings{' '}
                  <span className="font-numeric-metric text-on-surface">
                    {savingsPct}%
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Cash{' '}
                  <span className="font-numeric-metric text-on-surface">
                    {manualPct}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Link New Institution Action Card */}
        <section className="lg:col-span-5 bg-gradient-to-r from-surface-container to-surface-container-high rounded-xl p-space-md lg:p-6 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <AppIcon name="account_balance" className="text-[24px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Link Institutional Vault
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Automated sync via Plaid Core Engine
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <AppIcon
                    name="verified_user"
                    className="text-[14px] text-secondary"
                  />
                  <span className="font-label-sm text-label-sm text-secondary tracking-wide">
                    256-Bit Bank Grade Encryption
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsNewAccountModalOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
            >
              <AppIcon name="add_circle" className="text-[18px]" />
              <span>+ Connect New Account</span>
            </button>
            <button
              type="button"
              onClick={() =>
                triggerToast('QR Institutional Pairing ready', 'qr_code_scanner')
              }
              aria-label="Scan QR Code"
              className="px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            >
              <AppIcon name="qr_code_scanner" className="text-[18px]" />
            </button>
          </div>
        </section>
      </div>

      {/* Account Groups Grid on Desktop / Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Group 1: Checking & Everyday Operational */}
        <section className="lg:col-span-7 space-y-space-sm">
          <div className="flex justify-between items-center px-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Checking &amp; Operational ({checkingAccounts.length})
            </span>
            <span className="font-numeric-metric text-numeric-metric text-on-surface-variant">
              {formatCurrency(checkingTotal)}
            </span>
          </div>

          <div className="space-y-space-sm">
            {checkingAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-surface-container rounded-xl p-space-md shadow-md space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div
                      className={`w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-headline-sm ${
                        acc.id === 'chase-premier'
                          ? 'text-primary'
                          : 'text-primary-container'
                      }`}
                    >
                      <AppIcon name={acc.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          {acc.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-label-sm text-label-sm ${
                            acc.isDefault || acc.badgeType === 'primary'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {acc.isDefault ? 'Primary' : acc.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="font-body-sm text-body-sm font-mono tracking-wider">
                          {acc.mask}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          <span className="font-label-sm text-label-sm text-secondary">
                            {acc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label="Open Actions"
                    type="button"
                    onClick={() => setActiveSheetAccount(acc)}
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface active:bg-surface-bright transition-colors"
                  >
                    <AppIcon name="more_vert" className="text-[18px]" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {acc.balanceLabel}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                        {formatCurrency(acc.balance)}
                      </span>
                      {acc.currencies && (
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          (€{(acc.balance * 0.92).toFixed(2)} eqv.)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {acc.currencies && (
                      <div className="hidden sm:flex gap-1">
                        {acc.currencies.map((curr) => (
                          <span
                            key={curr}
                            className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm"
                          >
                            {curr}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => openAdjustModal(acc)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors"
                    >
                      <AppIcon name="tune" className="text-[15px]" />
                      <span>Adjust</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right 5 Cols on Desktop: Group 2 (High Yield) + Group 3 (Manual Wallets) */}
        <div className="lg:col-span-5 space-y-space-lg">
          {/* Group 2: Savings & High Yield Storage */}
          <section className="space-y-space-sm">
            <div className="flex justify-between items-center px-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                High Yield &amp; Long Horizon ({savingsAccounts.length})
              </span>
              <span className="font-numeric-metric text-numeric-metric text-on-surface-variant">
                {formatCurrency(savingsTotal)}
              </span>
            </div>

            {savingsAccounts.map((acc) => {
              const monthlyYield = (acc.balance * 0.0475) / 12;
              return (
                <div
                  key={acc.id}
                  className="bg-surface-container rounded-xl p-space-md shadow-md space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary font-headline-sm">
                        <AppIcon name={acc.icon} className="text-[20px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface">
                            {acc.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm">
                            {acc.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="font-body-sm text-body-sm font-mono tracking-wider">
                            {acc.mask}
                          </span>
                          <span>•</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {acc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      aria-label="Open Actions"
                      type="button"
                      onClick={() => setActiveSheetAccount(acc)}
                      className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface active:bg-surface-bright transition-colors"
                    >
                      <AppIcon name="more_vert" className="text-[18px]" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {acc.balanceLabel}
                      </span>
                      <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                        {formatCurrency(acc.balance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm text-secondary">
                          +{formatCurrency(monthlyYield)} / mo
                        </span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">
                          Yield projected
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAdjustModal(acc)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors"
                      >
                        <AppIcon name="tune" className="text-[15px]" />
                        <span>Adjust</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Group 3: Cash & Manual Reserves */}
          <section className="space-y-space-sm">
            <div className="flex justify-between items-center px-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Manual Wallets &amp; Cash ({manualAccounts.length})
              </span>
              <span className="font-numeric-metric text-numeric-metric text-on-surface-variant">
                {formatCurrency(manualTotal)}
              </span>
            </div>

            {manualAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-surface-container rounded-xl p-space-md shadow-md space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <AppIcon name={acc.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        {acc.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="font-body-sm text-body-sm">
                          {acc.sublabel}
                        </span>
                        <span>•</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {acc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label="Open Actions"
                    type="button"
                    onClick={() => setActiveSheetAccount(acc)}
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface active:bg-surface-bright transition-colors"
                  >
                    <AppIcon name="more_vert" className="text-[18px]" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {acc.balanceLabel}
                    </span>
                    <span
                      className={`font-headline-lg text-headline-lg tracking-tight ${
                        acc.balance > 0
                          ? 'text-on-surface'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAdjustModal(acc)}
                    className="px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors"
                  >
                    <AppIcon name="edit" className="text-[15px]" />
                    <span>Update Balance</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Interactive Action Sheet / Drawer Modal */}
      {activeSheetAccount && (
        <div
          id="action-sheet"
          className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center transition-opacity duration-300"
        >
          {/* Scrim */}
          <div
            id="sheet-backdrop"
            onClick={() => setActiveSheetAccount(null)}
            className="absolute inset-0 bg-surface-dim/80 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div
            id="sheet-panel"
            className="relative w-full lg:max-w-md bg-surface-container-high rounded-t-2xl lg:rounded-2xl p-space-md space-y-4 shadow-2xl border border-outline-variant/20"
          >
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-1 lg:hidden" />

            <div className="flex items-center justify-between pb-2">
              <div className="flex flex-col">
                <span
                  id="sheet-account-title"
                  className="font-headline-sm text-headline-sm text-on-surface"
                >
                  {activeSheetAccount.fullName || activeSheetAccount.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    id="sheet-account-mask"
                    className="font-body-sm text-body-sm font-mono text-on-surface-variant"
                  >
                    {activeSheetAccount.mask}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                  <span
                    id="sheet-account-balance"
                    className="font-numeric-metric text-numeric-metric text-on-surface"
                  >
                    {formatCurrency(activeSheetAccount.balance)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheetAccount(null)}
                className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <AppIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSheetAction('sync')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AppIcon name="sync" className="text-[20px] text-primary" />
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md">
                      Sync Latest Transactions
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Fetch clearing movements
                    </span>
                  </div>
                </div>
                <AppIcon
                  name="chevron_right"
                  className="text-[18px] text-on-surface-variant"
                />
              </button>

              <button
                type="button"
                onClick={() => handleSheetAction('adjust')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AppIcon name="tune" className="text-[20px] text-secondary" />
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md">
                      Adjust Opening Balance
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Override manual reconciliation drift
                    </span>
                  </div>
                </div>
                <AppIcon
                  name="chevron_right"
                  className="text-[18px] text-on-surface-variant"
                />
              </button>

              <button
                type="button"
                onClick={() => handleSheetAction('default')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AppIcon
                    name="star"
                    className="text-[20px] text-primary-container"
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md">
                      Set as Default Account
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Primary card for spending flows
                    </span>
                  </div>
                </div>
                <AppIcon
                  name="chevron_right"
                  className="text-[18px] text-on-surface-variant"
                />
              </button>

              <button
                type="button"
                onClick={() => handleSheetAction('details')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AppIcon
                    name="info"
                    className="text-[20px] text-on-surface-variant"
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md">
                      Account &amp; Routing Details
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Plaid token &amp; wire parameters
                    </span>
                  </div>
                </div>
                <AppIcon
                  name="chevron_right"
                  className="text-[18px] text-on-surface-variant"
                />
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSheetAction('unlink')}
                className="w-full py-3 rounded-lg bg-error-container/20 text-error font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-error-container/30 transition-colors"
              >
                <AppIcon name="link_off" className="text-[18px]" />
                <span>Unlink &amp; Disconnect Provider</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {adjustModalAccount && (
        <div
          onClick={() => setAdjustModalAccount(null)}
          className="fixed inset-0 z-50 bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleConfirmAdjust}
            className="w-full max-w-sm bg-surface-container-high rounded-2xl p-5 space-y-4 shadow-2xl border border-outline-variant/25"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Adjust Balance
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {adjustModalAccount.name} ({adjustModalAccount.mask})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalAccount(null)}
                className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <AppIcon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface-container flex items-baseline justify-center gap-1">
              <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface-variant">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
                value={adjustInputVal}
                onChange={(e) => setAdjustInputVal(e.target.value)}
                className="font-display-currency-mobile text-display-currency-mobile text-on-surface bg-transparent outline-none text-center w-44 placeholder:text-outline-variant"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustModalAccount(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md"
              >
                Save Balance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connect New Account Modal */}
      {isNewAccountModalOpen && (
        <div
          onClick={() => setIsNewAccountModalOpen(false)}
          className="fixed inset-0 z-50 bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateAccount}
            className="w-full max-w-sm bg-surface-container-high rounded-2xl p-5 space-y-4 shadow-2xl border border-outline-variant/25"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Connect New Account
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Add a bank vault or manual wallet
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <AppIcon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA Checking, Bibit Savings"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-outline-variant"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'checking', label: 'Checking' },
                    { id: 'savings', label: 'Savings' },
                    { id: 'manual', label: 'Cash' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewAccGroup(type.id)}
                      className={`py-2 rounded-lg font-label-sm text-label-sm transition-colors ${
                        newAccGroup === type.id
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Initial Balance ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-outline-variant"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsNewAccountModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md"
              >
                Add Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification Feedback */}
      <div
        id="toast"
        className={`fixed bottom-20 lg:bottom-8 inset-x-6 z-50 transform transition-all duration-300 flex justify-center pointer-events-none ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        {toast && (
          <div className="bg-surface-bright text-on-surface px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-outline-variant/25">
            <AppIcon
              name={toast.icon}
              className="text-secondary text-[18px]"
            />
            <span className="font-body-sm text-body-sm" id="toast-text">
              {toast.message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
