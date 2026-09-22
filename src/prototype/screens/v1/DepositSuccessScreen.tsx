import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Typography, VStack } from '../../../design-system/components';
import { colors, colorRoles, Spacing, MotionTransitions, EnterTransitions, framerFromDef, MotionDuration, msToSeconds } from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import depositSuccessHero from '../../assets/deposit-success-hero.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'v1-deposit-success',
  routePath: '/deposit-success',
  label: 'Deposit success',
  context: 'Extra tokens deposit',
  heading: 'Look at you saving',
  subhead: 'Confirmation shown after a successful deposit.',
  order: 3,
  options: [{ code: 'BACK', label: 'Back to Savings', to: 'savings-v1' }],
};

export const DepositSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const insets = useSafeArea();

  const state = location.state as { depositedAmount?: number } | null;
  const amount = state?.depositedAmount ?? 50;

  const handleBack = () => {
    navigate('/savings', {
      replace: true,
      state: {
        depositedAmount: amount,
        depositedTokens: amount,
        snackbarMessage: `With your $${amount} deposit you've earned ${amount} extra tokens for the weekly draw`,
      },
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Full-bleed background photo */}
      <img
        src={depositSuccessHero}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '75%',
        background: `linear-gradient(to bottom, rgba(41,18,16,0) 0%, ${colors.brown[900]} 84%)`,
        pointerEvents: 'none',
      }} />

      {/* Bottom content */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingLeft: Spacing.S,
        paddingRight: Spacing.S,
        paddingBottom: insets.bottom + Spacing.L,
        display: 'flex',
        flexDirection: 'column',
        gap: Spacing.M,
      }}>
        <VStack gap="XXS" align="start" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={framerFromDef(MotionTransitions.slideIn.slow1)}
          >
            <Typography type="display" size="M" weight="Bold" color={colorRoles.content.onColor}>
              Look at you saving ${amount}
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...framerFromDef(MotionTransitions.slideIn.slow1), delay: msToSeconds(MotionDuration.steady1) }}
          >
            <Typography type="title" size="L" color={colorRoles.content.onColorMid}>
              It will land in your savings account within 3 business days. Future you says thanks
            </Typography>
          </motion.div>
        </VStack>

        <motion.div
          style={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: msToSeconds(MotionDuration.slow1) }}
        >
          <Button
            label="Back to Savings"
            variant="primary"
            palette="dark"
            size="L"
            fullWidth
            onPress={handleBack}
          />
        </motion.div>
      </div>

    </div>
  );
};
