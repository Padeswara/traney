import React, { useState } from 'react';
import AppIcon from './AppIcon';
import { BRAND_ASSETS, formatCurrency } from '../data/initialData';

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    subtitle: 'Executive Dashboard',
    icon: 'dashboard',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    subtitle: 'Add & Manage Ledger',
    icon: 'receipt_long',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    subtitle: 'Connected Bank Vaults',
    icon: 'account_balance_wallet',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    subtitle: 'Cash Velocity & Reports',
    icon: 'monitoring',
  },
];

export default function Layout({
  activeTab,
  setActiveTab,
  totalBalance,
  accountsCount = 4,
  transactions = [],
  onQuickAction,
  isDark = true,
  onToggleTheme,
  children,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const currentNav =
    NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  const recentNotifications = transactions.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col lg:flex-row antialiased selection:bg-primary selection:text-on-primary">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 bg-surface-container-lowest/90 border-r border-outline-variant/20 backdrop-blur-xl select-none">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-outline-variant/15">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group"
          >
            {!logoError ? (
              <img
                alt="Traney Logo"
                className="h-8 w-auto object-contain"
                src={BRAND_ASSETS.logoUrl}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-headline-sm">
                TR
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">
                Traney
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                Multi-Account Ledger
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Quick Net Worth Pill */}
        <div className="px-4 pt-5 pb-2">
          <div className="rounded-xl bg-surface-container p-4 relative overflow-hidden border border-outline-variant/15">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Net Liquidity
              </span>
              <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Live
              </span>
            </div>
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight">
              {formatCurrency(totalBalance)}
            </div>
            <div className="mt-2 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span className="text-secondary">
                {totalBalance > 0 ? 'Active Balance' : '+0.0% MTD'}
              </span>
              <span>{accountsCount} Vaults Linked</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          <div className="px-3 pb-1.5 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Workspace
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold shadow-sm border border-primary/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-container text-on-surface-variant group-hover:text-on-surface'
                  }`}
                >
                  <AppIcon name={item.icon} className="text-[20px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md leading-tight truncate">
                    {item.label}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate text-[11px]">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Add Transaction CTA & Profile Footer */}
        <div className="p-4 space-y-3 border-t border-outline-variant/15">
          <button
            type="button"
            onClick={() => onQuickAction('expense')}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <AppIcon name="add_circle" className="text-[18px]" />
            <span>Record Transaction</span>
          </button>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Default Empty Avatar Placeholder */}
              <div
                aria-label="Default Profile Avatar"
                className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant ring-1 ring-outline-variant/40 flex items-center justify-center shrink-0"
              >
                <AppIcon name="person" className="text-[18px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface truncate">
                  {BRAND_ASSETS.userName}
                </span>
                <span className="font-label-sm text-label-sm text-secondary truncate">
                  {BRAND_ASSETS.userTier}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm">
              256-Bit
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 xl:pl-72">
        {/* Top Header (Fixed on Mobile, Sticky on Desktop) */}
        <header className="fixed lg:sticky top-0 inset-x-0 z-40 bg-surface/85 backdrop-blur-xl pt-safe border-b border-transparent lg:border-outline-variant/15">
          <div className="h-16 px-gutter lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
            {/* Mobile Brand / Desktop Page Title */}
            <div className="flex items-center gap-space-sm">
              <div className="lg:hidden flex items-center gap-space-sm">
                {!logoError ? (
                  <img
                    alt="Traney Logo"
                    className="h-8 w-auto object-contain"
                    src={BRAND_ASSETS.logoUrl}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-headline-sm">
                    TR
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                    Traney
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden">
                    {currentNav.label}
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                  {currentNav.label}
                </h1>
                <span className="text-outline-variant">/</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {currentNav.subtitle}
                </span>
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-space-sm relative">
              {/* Desktop Quick Pill Switcher */}
              <div className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-outline-variant/20 mr-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-all ${
                      activeTab === item.id
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                type="button"
                onClick={onToggleTheme}
                className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors"
              >
                <AppIcon
                  name={isDark ? 'light_mode' : 'dark_mode'}
                  className="text-[22px]"
                />
              </button>

              <button
                aria-label="Notifications"
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors"
              >
                <AppIcon name="notifications" className="text-[22px]" />
                {recentNotifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
                )}
              </button>

              <button
                aria-label="Account Profile"
                type="button"
                onClick={() => setActiveTab('accounts')}
                className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-surface-container/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant ring-1 ring-outline-variant/40 flex items-center justify-center">
                  <AppIcon name="person" className="text-[18px]" />
                </div>
                <span className="hidden sm:inline font-label-md text-label-md text-on-surface pr-1">
                  {BRAND_ASSETS.userName}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl bg-surface-container-high p-4 shadow-2xl border border-outline-variant/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Ledger Alerts
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                        {recentNotifications.length} New
                      </span>
                    </div>
                    {recentNotifications.length === 0 ? (
                      <div className="py-6 text-center space-y-1">
                        <AppIcon
                          name="notifications"
                          className="text-[24px] text-on-surface-variant/60 mx-auto"
                        />
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          No ledger activity yet for {BRAND_ASSETS.userName}.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentNotifications.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-2.5 rounded-xl bg-surface-container flex items-start gap-2.5"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                tx.type === 'income'
                                  ? 'bg-secondary/15 text-secondary'
                                  : 'bg-primary/15 text-primary'
                              }`}
                            >
                              <AppIcon name={tx.icon} className="text-[16px]" />
                            </div>
                            <div className="text-left min-w-0">
                              <span className="font-label-md text-label-md text-on-surface block truncate">
                                {tx.title}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant block truncate">
                                {tx.type === 'income' ? '+' : '-'}
                                {formatCurrency(
                                  tx.amount,
                                  tx.currencySymbol || '$'
                                )}{' '}
                                • {tx.account}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 flex flex-col relative w-full pt-16 lg:pt-6 pb-24 lg:pb-12 bg-surface">
          <div className="w-full max-w-7xl mx-auto lg:px-8">{children}</div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-low/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-t border-outline-variant/10"
          data-active-classes="text-primary font-semibold"
        >
          <div className="flex justify-around items-center h-16 px-space-xs">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 transition-colors ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <AppIcon name={item.icon} className="text-[24px]" />
                  <span className="font-label-sm text-label-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
