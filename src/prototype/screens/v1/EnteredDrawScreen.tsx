import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Typography, VStack, LineIcon } from '../../../design-system/components';
import { colorRoles, colors, Spacing, Radii, MotionTransitions, EnterTransitions, framerFromDef, msToSeconds, MotionDuration } from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import winnerHero from '../../assets/winner-hero.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'v1-entered-draw',
  routePath: '/entered-draw',
  label: "You're in the draw",
  context: 'Sweepstakes entry',
  heading: "You're in the draw",
  subhead: 'Fullscreen entry confirmation shown after user enters the draw (Variant 2).',
  order: 11,
  options: [],
};

export const EnteredDrawScreen: React.FC = () => {
  const navigate = useNavigate();
  const insets = useSafeArea();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Full-bleed background image */}
      <img
        src={winnerHero}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />

      {/* Bottom gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '75%',
        background: `linear-gradient(to bottom, rgba(41,18,16,0) 0%, ${colors.brown[900]} 84%)`,
        pointerEvents: 'none',
      }} />

      {/* Close button — top right */}
      <div style={{ position: 'absolute', top: insets.top + Spacing.XS, right: Spacing.S }}>
        <motion.button
          type="button"
          onClick={() => navigate('/savings', { state: { depositedAmount: 50, savingsVariant: 'v2' } })}
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Close"
          style={{
            width: 36,
            height: 36,
            borderRadius: Radii.ICON,
            backgroundColor: 'rgba(255,255,255,0.18)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LineIcon name="cross" size="S" color={colorRoles.content.onColor} />
        </motion.button>
      </div>

      {/* Bottom content */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingLeft: Spacing.M,
        paddingRight: Spacing.M,
        paddingBottom: insets.bottom + Spacing.L,
        display: 'flex',
        flexDirection: 'column',
        gap: Spacing.L,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={framerFromDef(MotionTransitions.slideIn.slow1)}
          >
            <Typography type="display" size="M" weight="Bold" color={colorRoles.content.onColor}>
              You're in the draw
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...framerFromDef(MotionTransitions.slideIn.slow1), delay: msToSeconds(MotionDuration.steady1) }}
          >
            <Typography type="title" size="L" color={colorRoles.content.onColorMid}>
              You have 177 tokens, one for each dollar you saved up. Deposit more to earn extra chances to win
            </Typography>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: msToSeconds(MotionDuration.slow1) }}
        >
          <VStack gap="XS">
            <Button
              label="Get more tokens"
              variant="primary"
              palette="dark"
              size="L"
              fullWidth
              onPress={() => navigate('/deposit', { state: { extraTokens: 0 } })}
            />
            <Button
              label="Not now"
              variant="secondary"
              palette="dark"
              size="L"
              fullWidth
              onPress={() => navigate('/savings', { state: { depositedAmount: 50, savingsVariant: 'v2' } })}
            />
          </VStack>
        </motion.div>
      </div>

    </div>
  );
};
