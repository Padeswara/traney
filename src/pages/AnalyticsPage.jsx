import React, { useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import {
  BRAND_ASSETS,
  TRANSACTION_CATEGORIES,
  formatCurrency,
} from '../data/initialData';

const PERIOD_OPTIONS = [
  { id: 'this_month', label: 'This Month', context: 'Live Metrics • Current Month' },
  { id: 'last_month', label: 'Last Month', context: 'Closed Ledger • Prior Month' },
  { id: 'quarter', label: 'Quarter', context: 'Quarterly Rollup • 90 Days' },
  { id: 'custom', label: 'Custom', context: 'Custom Window • Last 14 Days' },
];

export default function AnalyticsPage({ accounts = [], transactions = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('bills');
  const [exportSuccess, setExportSuccess] = useState(false);

  const periodMeta =
    PERIOD_OPTIONS.find((p) => p.id === selectedPeriod) || PERIOD_OPTIONS[0];

  const incomeTxs = useMemo(
    () => transactions.filter((t) => t.type === 'income'),
    [transactions]
  );
  const expenseTxs = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions]
  );

  const totalInflow = useMemo(
    () => incomeTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [incomeTxs]
  );
  const totalOutflow = useMemo(
    () => expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [expenseTxs]
  );
  const netVelocity = totalInflow - totalOutflow;

  const savedRate =
    totalInflow > 0
      ? `${Math.max(0, ((netVelocity / totalInflow) * 100)).toFixed(1)}% Saved`
      : '0.0% Saved';

  const budgetLimit = 5000.0;
  const budgetUtilized = Math.min(100, (totalOutflow / budgetLimit) * 100);
  const budgetRemaining = Math.max(0, budgetLimit - totalOutflow);

  // Core 5 category clusters for breakdown, dynamically aggregated from expense transactions
  const categoryBreakdown = useMemo(() => {
    const coreClusters = [
      {
        id: 'bills',
        name: 'Housing & Utilities',
        shortName: 'Housing & Util',
        icon: 'home',
        iconBg: 'bg-primary-container/20 text-primary-container',
        barColor: 'bg-primary-container',
        strokeColor: '#8083ff',
      },
      {
        id: 'shopping',
        name: 'Shopping & Tech',
        shortName: 'Shopping & Tech',
        icon: 'devices',
        iconBg: 'bg-secondary/15 text-secondary',
        barColor: 'bg-secondary',
        strokeColor: '#4edea3',
      },
      {
        id: 'dining',
        name: 'Food & Dining',
        shortName: 'Food & Dining',
        icon: 'restaurant',
        iconBg: 'bg-tertiary/15 text-tertiary',
        barColor: 'bg-tertiary',
        strokeColor: '#ffb2b7',
      },
      {
        id: 'transit',
        name: 'Transport',
        shortName: 'Transport',
        icon: 'directions_car',
        iconBg: 'bg-surface-container-highest text-on-surface-variant',
        barColor: 'bg-tertiary-fixed',
        strokeColor: '#ffdadb',
      },
      {
        id: 'leisure',
        name: 'Entertainment',
        shortName: 'Entertainment',
        icon: 'sports_esports',
        iconBg: 'bg-surface-container-highest text-on-surface-variant',
        barColor: 'bg-on-surface-variant',
        strokeColor: '#c7c4d7',
      },
    ];

    return coreClusters.map((cluster) => {
      const sum = expenseTxs
        .filter(
          (tx) =>
            tx.categoryId === cluster.id ||
            tx.category.toLowerCase().includes(cluster.name.split(' ')[0].toLowerCase())
        )
        .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

      const pct =
        totalOutflow > 0 ? Number(((sum / totalOutflow) * 100).toFixed(1)) : 0.0;

      return {
        ...cluster,
        rawAmount: sum,
        amount: formatCurrency(sum),
        percentage: pct,
      };
    });
  }, [expenseTxs, totalOutflow]);

  const activeCategory =
    categoryBreakdown.find((c) => c.id === selectedCategoryId) ||
    categoryBreakdown[0];

  // Weekly breakdown bars (W1 reflects live transactions, W2-W4 start at 0)
  const weeks = useMemo(() => {
    const maxScale = Math.max(totalInflow, totalOutflow, 1000);
    const w1InHeight =
      totalInflow > 0 ? Math.max(8, Math.round((totalInflow / maxScale) * 84)) : 4;
    const w1OutHeight =
      totalOutflow > 0 ? Math.max(8, Math.round((totalOutflow / maxScale) * 84)) : 4;

    return [
      {
        id: 'W1',
        label: 'Week 1 (Current)',
        inAmount: `+${formatCurrency(totalInflow)}`,
        outAmount: `-${formatCurrency(totalOutflow)}`,
        inHeight: w1InHeight,
        outHeight: w1OutHeight,
      },
      {
        id: 'W2',
        label: 'Week 2',
        inAmount: '+$0.00',
        outAmount: '-$0.00',
        inHeight: 4,
        outHeight: 4,
      },
      {
        id: 'W3',
        label: 'Week 3',
        inAmount: '+$0.00',
        outAmount: '-$0.00',
        inHeight: 4,
        outHeight: 4,
      },
      {
        id: 'W4',
        label: 'Week 4',
        inAmount: '+$0.00',
        outAmount: '-$0.00',
        inHeight: 4,
        outHeight: 4,
      },
    ];
  }, [totalInflow, totalOutflow]);

  const activeWeek = weeks.find((w) => w.id === selectedWeekId);

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 1800);
  };

  let cumulativePercent = 0;
  const donutSegments = categoryBreakdown.map((cat) => {
    const dashArray = `${cat.percentage} ${100 - cat.percentage}`;
    const dashOffset = -cumulativePercent;
    cumulativePercent += cat.percentage;
    return {
      ...cat,
      dashArray,
      dashOffset,
    };
  });

  const barXPositions = [
    { inX: 24, outX: 44, textX: 42 },
    { inX: 100, outX: 120, textX: 118 },
    { inX: 176, outX: 196, textX: 194 },
    { inX: 252, outX: 272, textX: 270 },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="px-gutter lg:px-0 space-y-space-lg pb-space-xl">
        {/* Top Context & Period Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center justify-between lg:justify-start lg:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {periodMeta.context}
              </span>
            </div>
            <button
              id="export-btn"
              type="button"
              onClick={handleExport}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                exportSuccess
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <AppIcon
                name={exportSuccess ? 'check' : 'file_download'}
                className="text-[16px]"
              />
              <span className="font-label-sm text-label-sm">
                {exportSuccess ? 'Exported CSV' : 'Export'}
              </span>
            </button>
          </div>

          {/* Segmented Pill Filter */}
          <div
            id="period-selector"
            className="flex items-center p-1 bg-surface-container-lowest rounded-xl overflow-x-auto no-scrollbar lg:w-auto lg:min-w-[380px]"
          >
            {PERIOD_OPTIONS.map((item) => {
              const isActive = selectedPeriod === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-period={item.id}
                  onClick={() => {
                    setSelectedPeriod(item.id);
                    setSelectedWeekId(null);
                  }}
                  className={`period-btn flex-1 py-1.5 px-3 rounded-lg font-label-md text-label-md text-center transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-surface-container-highest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop 12-Col Grid / Mobile Stacked Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left 7 Columns on Desktop */}
          <div className="lg:col-span-7 space-y-space-lg">
            {/* Cash Flow Master Comparison Card */}
            <div className="p-4 lg:p-6 rounded-xl bg-surface-container shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
                    Net Cash Velocity
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h2 className="font-display-currency-mobile text-display-currency-mobile lg:text-display-currency text-on-surface tracking-tight">
                      {netVelocity >= 0 ? '+' : '-'}
                      {formatCurrency(netVelocity)}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
                    <AppIcon name="trending_up" className="text-[14px]" />
                    {savedRate}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {transactions.length} total entries
                  </span>
                </div>
              </div>

              {/* Inflow vs Outflow Dual Counter */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container-low mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                    <AppIcon name="south_west" className="text-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      Total Inflow
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-secondary truncate block">
                      +{formatCurrency(totalInflow)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pl-2">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                    <AppIcon name="north_east" className="text-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      Total Outflow
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-tertiary truncate block">
                      -{formatCurrency(totalOutflow)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Header & Legend */}
              <div className="flex items-center justify-between text-on-surface-variant mb-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Weekly Inflow vs Outflow
                </span>
                <div className="flex items-center gap-3 font-body-sm text-body-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span>In</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    <span>Out</span>
                  </div>
                </div>
              </div>

              {/* Interactive Mini Bar Chart SVG */}
              <div className="w-full bg-surface-container-lowest/50 rounded-xl p-3">
                <svg
                  id="cashflow-chart"
                  viewBox="0 0 320 130"
                  className="w-full h-32 lg:h-40 overflow-visible"
                >
                  <line
                    x1="0"
                    y1="20"
                    x2="320"
                    y2="20"
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    opacity="0.4"
                    className="text-surface-container-highest"
                  />
                  <line
                    x1="0"
                    y1="60"
                    x2="320"
                    y2="60"
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    opacity="0.4"
                    className="text-surface-container-highest"
                  />
                  <line
                    x1="0"
                    y1="100"
                    x2="320"
                    y2="100"
                    stroke="currentColor"
                    opacity="0.6"
                    className="text-surface-container-highest"
                  />

                  {weeks.map((week, idx) => {
                    const pos = barXPositions[idx];
                    const isSelected = selectedWeekId === week.id;
                    const inY = 100 - week.inHeight;
                    const outY = 100 - week.outHeight;
                    return (
                      <g
                        key={week.id}
                        onClick={() => setSelectedWeekId(week.id)}
                        className="chart-group cursor-pointer group"
                      >
                        <rect
                          x={pos.inX}
                          y={inY}
                          width="16"
                          height={week.inHeight}
                          rx="4"
                          fill="rgb(var(--color-secondary))"
                          className={`transition-all duration-300 ${
                            isSelected
                              ? 'opacity-100 stroke-2 stroke-primary'
                              : 'opacity-90 group-hover:opacity-100'
                          }`}
                        />
                        <rect
                          x={pos.outX}
                          y={outY}
                          width="16"
                          height={week.outHeight}
                          rx="4"
                          fill="rgb(var(--color-tertiary))"
                          className={`transition-all duration-300 ${
                            isSelected
                              ? 'opacity-100 stroke-2 stroke-primary'
                              : 'opacity-90 group-hover:opacity-100'
                          }`}
                        />
                        <text
                          x={pos.textX}
                          y="118"
                          textAnchor="middle"
                          fill={
                            isSelected
                              ? 'rgb(var(--color-on-surface))'
                              : 'rgb(var(--color-on-surface-variant))'
                          }
                          fontFamily="Inter"
                          fontSize="11"
                          fontWeight={isSelected ? '600' : '400'}
                        >
                          {week.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tap tooltip preview container */}
                <div
                  id="chart-tooltip"
                  className="mt-2 py-1.5 px-3 rounded-lg bg-surface-container-high flex items-center justify-between text-on-surface font-body-sm text-body-sm transition-opacity duration-150"
                >
                  <span
                    id="tooltip-label"
                    className="text-on-surface-variant font-label-sm text-label-sm"
                  >
                    {activeWeek
                      ? `${activeWeek.label} Breakdown`
                      : 'Tap any week to inspect'}
                  </span>
                  {activeWeek ? (
                    <span
                      id="tooltip-stats"
                      className="font-numeric-metric text-numeric-metric"
                    >
                      <span className="text-secondary">{activeWeek.inAmount}</span>
                      <span className="text-outline mx-1.5">•</span>
                      <span className="text-tertiary">{activeWeek.outAmount}</span>
                    </span>
                  ) : (
                    <span
                      id="tooltip-stats"
                      className="font-numeric-metric text-numeric-metric"
                    >
                      Select a bar
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Budget Progress Widget */}
            <div className="p-4 lg:p-5 rounded-xl bg-surface-container shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                    <AppIcon name="account_balance" className="text-[18px]" />
                  </div>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight">
                      Monthly Budget
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {budgetUtilized.toFixed(1)}% utilized of monthly limit
                    </span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary">
                  {totalOutflow === 0 ? 'Fresh Start' : 'On Pace'}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-numeric-metric text-numeric-metric text-on-surface">
                    {formatCurrency(totalOutflow)}{' '}
                    <span className="text-on-surface-variant font-body-sm text-body-sm font-normal">
                      spent
                    </span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Limit: {formatCurrency(budgetLimit)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-container via-primary to-secondary transition-all duration-500"
                    style={{ width: `${budgetUtilized}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {formatCurrency(budgetRemaining)} remaining
                  </span>
                  <span>Target: &lt; $166/day</span>
                </div>
              </div>
            </div>

            {/* Smart Optimization Insight (Desktop) */}
            <div className="hidden lg:flex p-4 rounded-xl bg-surface-container-high/60 backdrop-blur-md items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                <AppIcon name="auto_awesome" className="text-[18px]" />
              </div>
              <div className="min-w-0">
                <span className="font-body-md text-body-md text-on-surface font-semibold block">
                  Traney AI Cash Velocity Note
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  {transactions.length === 0
                    ? `Welcome, ${BRAND_ASSETS.userName}! Your ledger is initialized at $0.00. Record income or expenses to unlock personalized cash velocity insights.`
                    : `Your current net cash flow is ${formatCurrency(
                        netVelocity
                      )} (${savedRate}). Keep tracking expenses to optimize your monthly savings rate.`}
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns on Desktop: Category Breakdown + Connected Accounts */}
          <div className="lg:col-span-5 space-y-space-lg">
            {/* Spending by Category */}
            <div className="p-4 lg:p-5 rounded-xl bg-surface-container shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Category Breakdown
                  </h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Distribution across 5 core clusters
                  </span>
                </div>
                <button
                  aria-label="Filter Categories"
                  type="button"
                  onClick={() => {
                    const nextIdx =
                      (categoryBreakdown.findIndex(
                        (c) => c.id === activeCategory.id
                      ) +
                        1) %
                      categoryBreakdown.length;
                    setSelectedCategoryId(categoryBreakdown[nextIdx].id);
                  }}
                  className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <AppIcon name="tune" className="text-[18px]" />
                </button>
              </div>

              {/* Donut Chart & Hero Stat Split */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-container-low mb-4">
                <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 42 42">
                    <circle
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="rgb(var(--color-surface-container-highest))"
                      strokeWidth="4.2"
                    />
                    {totalOutflow > 0 &&
                      donutSegments.map((seg) => (
                        <circle
                          key={seg.id}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={seg.strokeColor}
                          strokeWidth={
                            activeCategory.id === seg.id ? '5.0' : '4.2'
                          }
                          strokeDasharray={seg.dashArray}
                          strokeDashoffset={seg.dashOffset}
                          onClick={() => setSelectedCategoryId(seg.id)}
                          className="transition-all cursor-pointer hover:opacity-80"
                        />
                      ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
                      Total
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-on-surface font-bold mt-0.5">
                      {formatCurrency(totalOutflow)}
                    </span>
                  </div>
                </div>

                {/* Highlight Callout */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="p-2.5 rounded-lg bg-surface-container">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">
                      Selected Cluster
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate block mt-0.5">
                      {activeCategory.shortName}
                    </span>
                    <span className="font-numeric-metric text-numeric-metric text-primary mt-1 block">
                      {activeCategory.amount} • {activeCategory.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories Progress List */}
              <div className="space-y-3" id="category-list">
                {categoryBreakdown.map((cat) => {
                  const isActive = activeCategory.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-surface-container-high/80'
                          : 'hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${cat.iconBg}`}
                          >
                            <AppIcon name={cat.icon} className="text-[15px]" />
                          </div>
                          <span className="font-body-md text-body-md text-on-surface truncate">
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-numeric-metric text-numeric-metric text-on-surface">
                            {cat.amount}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant ml-1.5">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account Cash Flow Breakdown */}
            <div className="p-4 lg:p-5 rounded-xl bg-surface-container shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Connected Accounts
                  </h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Liquidity movements per ledger
                  </span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                  {accounts.length} Active
                </span>
              </div>

              <div className="space-y-2.5">
                {accounts.map((acc) => {
                  const accInflow = transactions
                    .filter(
                      (t) =>
                        t.type === 'income' &&
                        (t.accountId === acc.id || t.account === acc.name)
                    )
                    .reduce((s, t) => s + Number(t.amount || 0), 0);
                  const accOutflow = transactions
                    .filter(
                      (t) =>
                        t.type === 'expense' &&
                        (t.accountId === acc.id || t.account === acc.name)
                    )
                    .reduce((s, t) => s + Number(t.amount || 0), 0);
                  const accNet = accInflow - accOutflow;

                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                            <AppIcon
                              name={acc.carouselIcon || acc.icon}
                              className="text-[20px]"
                            />
                          </div>
                          <div>
                            <span className="font-body-md text-body-md text-on-surface font-semibold block leading-tight">
                              {acc.analyticsName || acc.shortName || acc.name}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {acc.analyticsMask || acc.mask}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-numeric-metric text-numeric-metric ${
                            accNet < 0 ? 'text-tertiary' : 'text-secondary'
                          }`}
                        >
                          {accNet >= 0 ? '+' : '-'}
                          {formatCurrency(accNet)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-none text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">
                          In:{' '}
                          <span className="text-secondary font-medium">
                            +{formatCurrency(accInflow)}
                          </span>
                        </span>
                        <span className="text-on-surface-variant">
                          Out:{' '}
                          <span className="text-tertiary font-medium">
                            -{formatCurrency(accOutflow)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Optimization Insight (Mobile Bottom Placement) */}
        <div className="lg:hidden p-4 rounded-xl bg-surface-container-high/60 backdrop-blur-md flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
            <AppIcon name="auto_awesome" className="text-[18px]" />
          </div>
          <div className="min-w-0">
            <span className="font-body-md text-body-md text-on-surface font-semibold block">
              Traney AI Cash Velocity Note
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
              {transactions.length === 0
                ? `Welcome, ${BRAND_ASSETS.userName}! Your ledger is initialized at $0.00. Record income or expenses to unlock personalized cash velocity insights.`
                : `Your current net cash flow is ${formatCurrency(
                    netVelocity
                  )} (${savedRate}). Keep tracking expenses to optimize your monthly savings rate.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
