import React, { useEffect, useState } from 'react';
import AppIcon from '../components/AppIcon';
import { TRANSACTION_CATEGORIES, formatCurrency } from '../data/initialData';

export default function TransactionsPage({
  initialType = 'expense',
  accounts = [],
  transactions = [],
  onAddTransaction,
}) {
  const [currentType, setCurrentType] = useState(initialType || 'expense');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id || 'chase-premier'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    TRANSACTION_CATEGORIES[0]
  );
  const [dateTimeLabel, setDateTimeLabel] = useState('Today');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receiptName, setReceiptName] = useState('receipt.jpg');
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (initialType) {
      setCurrentType(initialType);
      if (initialType === 'income') {
        const incCat = TRANSACTION_CATEGORIES.find((c) => c.id === 'income');
        if (incCat) setSelectedCategory(incCat);
      } else if (initialType === 'expense') {
        setSelectedCategory(TRANSACTION_CATEGORIES[0]);
      }
    }
  }, [initialType]);

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
  };

  const glowColorClass =
    currentType === 'expense'
      ? 'bg-tertiary/10'
      : currentType === 'income'
      ? 'bg-secondary/10'
      : 'bg-primary/10';

  const typeCaption =
    currentType === 'expense'
      ? 'Outflow deduction'
      : currentType === 'income'
      ? 'Inflow deposit'
      : 'Internal vault transfer';

  const accountSectionLabel =
    currentType === 'expense'
      ? 'Debit Account'
      : currentType === 'income'
      ? 'Destination Account'
      : 'Settlement Origin';

  const inputCharLen = Math.max((amount || '').length, 4);
  const inputWidthCh = Math.min(Math.max(inputCharLen + 1, 5), 12);

  const handleSave = () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return;

    if (onAddTransaction && selectedAccount) {
      onAddTransaction({
        title:
          note.trim() ||
          `${selectedCategory.fullLabel} (${
            currentType.charAt(0).toUpperCase() + currentType.slice(1)
          })`,
        category: selectedCategory.fullLabel,
        categoryId: selectedCategory.id,
        accountId: selectedAccount.id,
        account: selectedAccount.name,
        amount: numericAmount,
        currencySymbol,
        type: currentType,
        timestamp: dateTimeLabel,
        icon: selectedCategory.icon,
      });
    }

    setIsSavedSuccess(true);
    setAmount('');
    setNote('');
    setHasReceipt(false);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 1500);
  };

  const filteredTransactions =
    filterType === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  return (
    <div className="flex flex-col w-full px-gutter lg:px-0 pb-8 gap-space-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Interactive Form Master Container */}
        <div className="lg:col-span-7 flex flex-col w-full gap-space-lg">
          {/* Segmented Control Switcher */}
          <div className="flex items-center justify-between p-1 rounded-full bg-surface-container-low shadow-sm">
            <button
              id="tab-expense"
              type="button"
              onClick={() => setCurrentType('expense')}
              className={`flex-1 py-2 px-3 rounded-full text-center transition-all duration-200 ${
                currentType === 'expense'
                  ? 'bg-surface-container text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="font-label-md text-label-md flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                Expense
              </span>
            </button>

            <button
              id="tab-income"
              type="button"
              onClick={() => setCurrentType('income')}
              className={`flex-1 py-2 px-3 rounded-full text-center transition-all duration-200 ${
                currentType === 'income'
                  ? 'bg-surface-container text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="font-label-md text-label-md flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Income
              </span>
            </button>

            <button
              id="tab-transfer"
              type="button"
              onClick={() => setCurrentType('transfer')}
              className={`flex-1 py-2 px-3 rounded-full text-center transition-all duration-200 ${
                currentType === 'transfer'
                  ? 'bg-surface-container text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="font-label-md text-label-md flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Transfer
              </span>
            </button>
          </div>

          {/* Amount Hero & Currency Selector Display */}
          <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden">
            {/* Glow ambient accent */}
            <div
              id="glow-pill"
              className={`absolute -top-12 inset-x-12 h-24 ${glowColorClass} blur-2xl pointer-events-none rounded-full transition-colors duration-300`}
            />

            {/* Currency Switcher Badge */}
            <div className="inline-flex items-center gap-1.5 py-1 px-3 mb-2 rounded-full bg-surface-container text-on-surface-variant shadow-sm relative z-10">
              <AppIcon name="payments" className="text-[16px] text-primary" />
              <select
                id="currency-select"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer pr-1 appearance-none"
              >
                <option className="bg-surface-container-high text-on-surface" value="$">
                  USD ($)
                </option>
                <option className="bg-surface-container-high text-on-surface" value="€">
                  EUR (€)
                </option>
                <option className="bg-surface-container-high text-on-surface" value="£">
                  GBP (£)
                </option>
                <option className="bg-surface-container-high text-on-surface" value="¥">
                  JPY (¥)
                </option>
              </select>
              <AppIcon
                name="expand_more"
                className="text-[14px] text-on-surface-variant pointer-events-none"
              />
            </div>

            {/* Centered Tabular Input Display */}
            <div className="flex items-baseline justify-center gap-1 tracking-tight text-on-surface my-1 relative z-10">
              <span
                id="currency-sym"
                className="font-display-currency-mobile text-display-currency-mobile text-on-surface-variant select-none"
              >
                {currencySymbol}
              </span>
              <input
                id="amount-input"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                style={{ width: `${inputWidthCh}ch` }}
                className="font-display-currency-mobile text-display-currency-mobile text-center bg-transparent outline-none max-w-[220px] text-on-surface placeholder:text-outline-variant caret-primary"
              />
            </div>

            <p
              id="type-caption"
              className="font-body-sm text-body-sm text-on-surface-variant mt-1 relative z-10"
            >
              {typeCaption}
            </p>
          </div>

          {/* Account Selector Modal Trigger */}
          {selectedAccount && (
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant px-1 uppercase tracking-wider">
                {accountSectionLabel}
              </label>
              <div
                onClick={() => setIsAccountSheetOpen(true)}
                className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <AppIcon
                      name={selectedAccount.carouselIcon || selectedAccount.icon}
                      className="text-[20px]"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        id="selected-account-name"
                        className="font-label-md text-label-md text-on-surface truncate"
                      >
                        {selectedAccount.fullName || selectedAccount.name}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                        {selectedAccount.shortMask || selectedAccount.mask}
                      </span>
                    </div>
                    <span
                      id="selected-account-balance"
                      className="font-body-sm text-body-sm text-secondary truncate"
                    >
                      Avail: {formatCurrency(selectedAccount.balance)}
                    </span>
                  </div>
                </div>
                <AppIcon
                  name="expand_more"
                  className="text-[20px] text-on-surface-variant shrink-0 ml-2"
                />
              </div>
            </div>
          )}

          {/* Category Selector Chips Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextIdx =
                    (TRANSACTION_CATEGORIES.findIndex(
                      (c) => c.id === selectedCategory.id
                    ) +
                      1) %
                    TRANSACTION_CATEGORIES.length;
                  setSelectedCategory(TRANSACTION_CATEGORIES[nextIdx]);
                }}
                className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2" id="category-grid">
              {TRANSACTION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`cat-pill flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'bg-surface-container text-on-surface shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <AppIcon name={cat.icon} className="text-[18px]" />
                    </div>
                    <span className="font-label-sm text-label-sm truncate w-full text-center">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Card Stack */}
          <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4 shadow-sm">
            {/* Date & Time Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <AppIcon name="calendar_today" className="text-[20px] text-primary" />
                <span className="font-body-md text-body-md text-on-surface">
                  Date &amp; Time
                </span>
              </div>
              {isEditingDate ? (
                <input
                  type="text"
                  value={dateTimeLabel}
                  onChange={(e) => setDateTimeLabel(e.target.value)}
                  onBlur={() => setIsEditingDate(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingDate(false)}
                  autoFocus
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm outline-none ring-1 ring-primary/40 text-right w-40"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDate(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  <span className="font-label-sm text-label-sm">{dateTimeLabel}</span>
                  <AppIcon
                    name="edit"
                    className="text-[14px] text-on-surface-variant"
                  />
                </button>
              )}
            </div>

            <div className="h-[1px] bg-surface-container-high my-0.5" />

            {/* Note / Description Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <AppIcon name="notes" className="text-[18px]" />
                <label className="font-label-sm text-label-sm uppercase tracking-wider">
                  Note
                </label>
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Dinner with team, monthly SaaS subscription"
                className="w-full bg-surface-container px-3 py-2.5 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <div className="h-[1px] bg-surface-container-high my-0.5" />

            {/* Recurring Switch */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-body-md text-body-md text-on-surface">
                  Recurring monthly
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Auto-record on the 18th
                </span>
              </div>
              <button
                id="recurring-toggle"
                type="button"
                onClick={() => setIsRecurring((prev) => !prev)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 relative flex items-center ${
                  isRecurring ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              >
                <div
                  id="toggle-knob"
                  className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    isRecurring
                      ? 'translate-x-6 bg-on-primary'
                      : 'translate-x-0 bg-on-surface'
                  }`}
                />
              </button>
            </div>

            <div className="h-[1px] bg-surface-container-high my-0.5" />

            {/* Attach Receipt / Bill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-on-surface-variant">
                <AppIcon name="receipt" className="text-[20px]" />
                <span className="font-body-md text-body-md text-on-surface">
                  Receipt or Invoice
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasReceipt ? (
                  <button
                    type="button"
                    onClick={() => setHasReceipt(false)}
                    title="Click to remove receipt"
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-container/20 text-secondary"
                    id="receipt-preview"
                  >
                    <AppIcon name="check_circle" className="text-[14px]" />
                    <span className="font-label-sm text-label-sm">{receiptName}</span>
                  </button>
                ) : (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Optional
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setHasReceipt(true);
                    setReceiptName('receipt.jpg');
                  }}
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
                >
                  <AppIcon name="photo_camera" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Primary Action Button with Tactile Feedback */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className={`w-full py-4 px-6 rounded-xl transition-all duration-150 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 group ${
                isSavedSuccess
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-primary hover:bg-primary-fixed text-on-primary'
              }`}
            >
              <AppIcon
                name={isSavedSuccess ? 'check_circle' : 'check'}
                className="text-[20px] transition-transform group-active:scale-90"
              />
              <span className="font-headline-sm text-headline-sm tracking-wide">
                {isSavedSuccess ? 'Transaction Recorded' : 'Save Transaction'}
              </span>
            </button>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
              Instant ledger sync via Traney Protocol
            </p>
          </div>
        </div>

        {/* Desktop Right Column (5 cols): Live Transaction Feed */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-space-md">
          <div className="rounded-xl bg-surface-container p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Ledger Stream
                </h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Real-time settlement log ({transactions.length} entries)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                {['all', 'expense', 'income'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm capitalize transition-colors ${
                      filterType === type
                        ? 'bg-surface-container-highest text-on-surface'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-12 px-4 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                  <AppIcon name="receipt_long" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md text-on-surface">
                  Ledger is currently empty
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                  Enter an amount on the left and click Save Transaction to record
                  your first entry.
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                      <div className="flex flex-col items-end shrink-0 ml-2">
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

      {/* Bottom Sheet / Modal Overlay for Bank Account Selection */}
      {isAccountSheetOpen && (
        <div
          id="account-sheet"
          onClick={() => setIsAccountSheetOpen(false)}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col justify-end lg:justify-center lg:items-center transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full lg:max-w-md bg-surface-container-low rounded-t-2xl lg:rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-outline-variant/20"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Select Account
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Choose settlement origin
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <AppIcon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {accounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setIsAccountSheetOpen(false);
                    }}
                    className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-surface-container'
                        : 'bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-surface-bright flex items-center justify-center ${
                          acc.group === 'savings'
                            ? 'text-secondary'
                            : 'text-primary'
                        }`}
                      >
                        <AppIcon
                          name={acc.carouselIcon || acc.icon}
                          className="text-[20px]"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">
                          {acc.fullName || acc.name}
                        </span>
                        <span
                          className={`font-body-sm text-body-sm ${
                            isSelected ? 'text-secondary' : 'text-on-surface-variant'
                          }`}
                        >
                          Available: {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <AppIcon name="check" className="text-[20px] text-secondary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
