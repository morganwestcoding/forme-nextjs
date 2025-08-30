'use client';

import React from 'react';

type StockStatus = 'in' | 'low' | 'out';

interface SmartBadgeProductProps {
  price: number;
  compareAtPrice?: number | null;
  isOnSale?: boolean;
  stockStatus: StockStatus;     // 'in' | 'low' | 'out'
  unitsLeft?: number;           // used when stockStatus === 'low'
  onPriceClick?: () => void;
}

const SmartBadgeProduct: React.FC<SmartBadgeProductProps> = ({
  price,
  compareAtPrice,
  isOnSale = false,
  stockStatus,
  unitsLeft,
  onPriceClick,
}) => {
  const hasCompare = typeof compareAtPrice === 'number' && compareAtPrice! > 0;
  const isDiscount = !!isOnSale && hasCompare && (compareAtPrice as number) > price;
  const discountPct = isDiscount
    ? Math.max(1, Math.round(100 - (price / (compareAtPrice as number)) * 100))
    : 0;

  // Price pill color (your spec: yellow when “top value” -> on sale, blue default, red when low/out)
  const priceStyles = (() => {
    if (stockStatus === 'low' || stockStatus === 'out') {
      return {
        pillBg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        pillBorder: 'border-red-400/40',
        pillGlow: 'shadow-red-500/20',
        text: 'text-red-200',
        dot: 'bg-red-200',
      };
    }
    if (isDiscount) {
      return {
        pillBg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        pillBorder: 'border-yellow-400/40',
        pillGlow: 'shadow-yellow-500/20',
        text: 'text-yellow-200',
        dot: 'bg-yellow-200',
      };
    }
    return {
      pillBg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      pillBorder: 'border-blue-400/40',
      pillGlow: 'shadow-blue-500/20',
      text: 'text-blue-200',
      dot: 'bg-blue-200',
    };
  })();

  // Discount pill (only when on sale) — use your “value” yellow palette
  const discountStyles = {
    pillBg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    pillBorder: 'border-yellow-400/40',
    pillGlow: 'shadow-yellow-500/20',
    text: 'text-yellow-200',
    dot: 'bg-yellow-200',
  };

  // Stock pill colors: green in-stock, orange low, red out (matches your system)
  const stockStyles = (() => {
    if (stockStatus === 'out') {
      return {
        pillBg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        pillBorder: 'border-red-400/40',
        pillGlow: 'shadow-red-500/20',
        text: 'text-red-200',
        dot: 'bg-red-200',
        label: 'Out',
      };
    }
    if (stockStatus === 'low') {
      return {
        pillBg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20',
        pillBorder: 'border-orange-400/40',
        pillGlow: 'shadow-orange-500/20',
        text: 'text-orange-200',
        dot: 'bg-orange-200',
        label: unitsLeft && unitsLeft > 0 ? `${unitsLeft} left` : 'Low',
      };
    }
    return {
      pillBg: 'bg-gradient-to-r from-lime-500/20 to-green-600/20',
      pillBorder: 'border-lime-400/40',
      pillGlow: 'shadow-lime-500/20',
      text: 'text-lime-200',
      dot: 'bg-lime-200',
      label: 'In',
    };
  })();

  const Pill: React.FC<{
    styles: { pillBg: string; pillBorder: string; pillGlow: string; text: string; dot: string };
    children: React.ReactNode;
    onClick?: () => void;
    ariaLabel?: string;
  }> = ({ styles, children, onClick, ariaLabel }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="inline-flex rounded-xl hover:bg-white/10 transition-all duration-300 group p-0"
    >
      <div
        className={[
          'border rounded-md px-2 py-1 w-[88px]',
          'inline-flex items-center justify-center gap-1',
          'group-hover:scale-105 transition-all duration-300 shadow-sm',
          styles.pillBg,
          styles.pillBorder,
          styles.pillGlow,
        ].join(' ')}
      >
        <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
        <span className={`text-xs ${styles.text}`}>{children}</span>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Price */}
      <Pill styles={priceStyles} onClick={onPriceClick} ariaLabel="Price">
        {isDiscount && hasCompare ? (
          <span className="flex items-center gap-1">
            <span className="line-through text-[10px] opacity-70">${(compareAtPrice as number).toFixed(2)}</span>
            <span>${price.toFixed(2)}</span>
          </span>
        ) : (
          <>${price.toFixed(2)}</>
        )}
      </Pill>

      {/* Discount (only show if on sale) */}
      {isDiscount && (
        <Pill styles={discountStyles} ariaLabel="Discount">
          {discountPct}% OFF
        </Pill>
      )}

      {/* Stock */}
      <Pill styles={stockStyles} ariaLabel="Stock">
        {stockStyles.label}
      </Pill>
    </div>
  );
};

export default SmartBadgeProduct;
