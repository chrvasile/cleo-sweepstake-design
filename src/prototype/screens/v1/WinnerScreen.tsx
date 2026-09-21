import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Typography, VStack, LineIcon } from '../../../design-system/components';
import { colorRoles, colors, Spacing, Radii } from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import winnerHero from '../../assets/winner-hero.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'v1-winner',
  routePath: '/winner',
  label: 'Winner screen',
  context: 'Sweepstakes result',
  heading: "You're the grand winner!",
  subhead: 'Full-screen image winner confirmation.',
  order: 10,
  options: [],
};

export const WinnerScreen: React.FC = () => {
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
          onClick={() => navigate('/savings')}
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
        <VStack gap="XXS" align="start">
          <Typography
            type="display"
            size="M"
            weight="Bold"
            color={colorRoles.content.onColor}
          >
            John, you've won this week's sweepstake!
          </Typography>
          <Typography
            type="title"
            size="L"
            color={colorRoles.content.onColorMid}
          >
            Check your inbox in the next 48 hours. We'll email you instructions for how to redeem your $3,000
          </Typography>
        </VStack>

        <Button
          label="Share with the world"
          variant="primary"
          palette="dark"
          size="L"
          fullWidth
        />
      </div>

    </div>
  );
};
