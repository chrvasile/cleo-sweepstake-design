import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Button,
  Typography,
  VStack,
  HStack,
  IconButton,
} from '../../../design-system/components';
import { colorRoles, Spacing } from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';

export const contentMap: ContentMapScreenMetadata = {
  id: 'two-step-deposit',
  routePath: '/deposit',
  label: 'Deposit',
  context: 'Extra tokens deposit',
  heading: 'How much are you putting in?',
  subhead: 'Deposit screen — add money to get extra sweepstake tokens.',
  order: 2,
  options: [{ code: 'DEPOSIT', label: 'Deposit', to: 'savings-two-step' }],
};

const NUMBER_FONT_FAMILY = "'PPNeueMontreal', system-ui, -apple-system, sans-serif";
const QUICK_AMOUNTS = [25, 50, 150, 200];

const QuickAddPill: React.FC<{
  value: number;
  selected: boolean;
  onPress: () => void;
}> = ({ value, selected, onPress }) => (
  <motion.button
    type="button"
    onClick={onPress}
    whileTap={{ scale: 0.97 }}
    className="flex flex-1 items-center justify-center rounded-BUTTON"
    style={{
      height: 40,
      backgroundColor: colorRoles.background.secondary,
      border: selected
        ? `1px solid ${colorRoles.border.selected}`
        : '1px solid transparent',
      cursor: 'pointer',
    }}
  >
    <Typography
      type="buttonLabel"
      size="S"
      color={selected ? colorRoles.content.primary : colorRoles.content.secondary}
    >
      ${value}
    </Typography>
  </motion.button>
);

const ROW_TOPS = [6, 59, 112, 165] as const;
const ROW_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', 'backspace'],
] as const;

const NumericKeyboard: React.FC<{
  onKey: (digit: string) => void;
  onBackspace: () => void;
}> = ({ onKey, onBackspace }) => (
  <div style={{ height: 290, backgroundColor: '#d1d3d9', position: 'relative', flexShrink: 0 }}>
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 134,
        height: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 100,
      }}
    />
    {ROW_KEYS.map((row, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          position: 'absolute',
          top: ROW_TOPS[rowIndex],
          left: 6,
          right: 6,
          height: 46,
          display: 'flex',
          gap: 5,
        }}
      >
        {row.map((key, keyIndex) => {
          if (key === null) {
            return <div key={keyIndex} style={{ flex: 1 }} />;
          }
          return (
            <motion.button
              key={keyIndex}
              type="button"
              whileTap={{ opacity: 0.6 }}
              onClick={() => (key === 'backspace' ? onBackspace() : onKey(key))}
              style={{
                flex: 1,
                height: 46,
                backgroundColor: key === 'backspace' ? 'transparent' : 'white',
                borderRadius: 4.6,
                boxShadow:
                  key === 'backspace' ? 'none' : '0px 1px 0px 0px rgba(0,0,0,0.3)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'SF Pro Display', system-ui",
                fontSize: 25,
                color: '#000',
                padding: 0,
              }}
            >
              {key === 'backspace' ? (
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <path
                    d="M9 1L1 9L9 17H23V1H9Z"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 6L11 12M11 6L15 12"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                key
              )}
            </motion.button>
          );
        })}
      </div>
    ))}
  </div>
);

export const DepositScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const insets = useSafeArea();

  const locationState = location.state as { extraTokens?: number } | null;
  const extraTokens = locationState?.extraTokens ?? 50;

  const [amountStr, setAmountStr] = useState(extraTokens > 0 ? String(extraTokens) : '');

  const displayAmount = amountStr === '' ? '0' : amountStr;
  const numericAmount = parseInt(amountStr || '0', 10);

  const handleKey = (digit: string) => {
    setAmountStr((prev) => {
      if (prev === '' || prev === '0') return digit;
      if (prev.length >= 5) return prev;
      return prev + digit;
    });
  };

  const handleBackspace = () => {
    setAmountStr((prev) => (prev.length <= 1 ? '' : prev.slice(0, -1)));
  };

  const handleDeposit = () => {
    navigate('/', {
      replace: true,
      state: {
        depositedAmount: numericAmount,
        depositedTokens: numericAmount,
      },
    });
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colorRoles.background.primary,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: insets.top }} />

      {/* Close button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: `${Spacing.XXS}px ${Spacing.XS}px`,
        }}
      >
        <IconButton icon="cross" variant="primary" label="Close" onPress={() => navigate(-1)} />
      </div>

      {/* Title */}
      <div style={{ padding: `${Spacing.M}px ${Spacing.S}px 0` }}>
        <VStack gap="XXXS" align="start">
          <Typography type="headline" size="M" color={colorRoles.content.primary}>
            How much are you putting in?
          </Typography>
          <Typography type="body" size="L" color={colorRoles.content.secondary}>
            Money takes up to 3 business days to land in your savings
          </Typography>
        </VStack>
      </div>

      {/* Centred amount + bank chip */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
        }}
      >
        <HStack gap="ZERO" align="baseline" justify="center">
          <Typography
            type="displayNumbers"
            size="M"
            weight="Medium"
            color={colorRoles.content.tertiary}
            style={{ fontFamily: NUMBER_FONT_FAMILY }}
          >
            $
          </Typography>
          <Typography
            type="displayNumbers"
            size="L"
            weight="Medium"
            color={colorRoles.content.primary}
            style={{ fontFamily: NUMBER_FONT_FAMILY }}
          >
            {displayAmount}
          </Typography>
        </HStack>

        {/* Bank account chip */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 40,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 100,
            backgroundColor: colorRoles.background.secondary,
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#117ACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="0" y="0" width="6" height="6" fill="white" />
              <rect x="6" y="6" width="6" height="6" fill="white" />
            </svg>
          </div>
          <Typography type="titleStrong" size="M" color={colorRoles.content.primary}>
            Chase Total Checking
          </Typography>
          <Typography type="titleStrong" size="M" color={colorRoles.content.primary}>
            $1,150.10
          </Typography>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke={colorRoles.content.primary}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>

      {/* Quick-add pills */}
      <div style={{ padding: `0 ${Spacing.S}px ${Spacing.XS}px` }}>
        <HStack gap="XXS" align="center" className="w-full">
          {QUICK_AMOUNTS.map((value) => (
            <QuickAddPill
              key={value}
              value={value}
              selected={numericAmount === value}
              onPress={() => setAmountStr(String(value))}
            />
          ))}
        </HStack>
      </div>

      {/* Deposit button */}
      <div style={{ padding: `0 ${Spacing.S}px ${Spacing.XS}px` }}>
        <Button label="Deposit" variant="primary" fullWidth onPress={handleDeposit} />
      </div>

      <NumericKeyboard onKey={handleKey} onBackspace={handleBackspace} />
    </div>
  );
};
