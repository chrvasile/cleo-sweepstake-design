import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, VStack, LineIcon } from '../../../design-system/components';
import {
  colorRoles, colors, Spacing, Radii,
  MotionTransitions, EnterTransitions,
  framerFromDef, msToSeconds, MotionDuration,
} from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import winnerHero from '../../assets/winner-hero.png';

type WinnerVariant = 'simple' | 'shareable';

// Social share card image — Figma asset URL (valid for 7 days from generation)
const SOCIAL_SHARE_IMAGE = 'https://www.figma.com/api/mcp/asset/584d0467-150b-4a77-bfe0-5c7a7f6fa599.png';
const MESSAGES_BADGE = 'https://www.figma.com/api/mcp/asset/a282dd49-29cf-43b6-aa98-cc095e8a2f65.png';

const IOS_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';

const CONTACTS = [
  { line1: 'Herland', line2: 'Antezana', avatar: 'https://www.figma.com/api/mcp/asset/26a84c67-0c12-43a3-9125-fb10a4d91822.png' },
  { line1: 'Rigo', line2: 'Rangel', avatar: 'https://www.figma.com/api/mcp/asset/c37b26d2-6d3b-43dd-8c56-b9334a2e182c.png' },
  { line1: 'Jenny', line2: 'Court', avatar: 'https://www.figma.com/api/mcp/asset/bd335e57-8a66-42c3-9eb5-d0694a711691.png' },
  { line1: 'Alejandra', line2: 'Delgado', avatar: 'https://www.figma.com/api/mcp/asset/f3d79bcb-322a-43b3-a044-fd1c4877fc20.png' },
];

const APP_ICONS = [
  { name: 'AirDrop', icon: 'https://www.figma.com/api/mcp/asset/0cb60361-58d2-4ab2-b826-940f88cb2e0c.png' },
  { name: 'Messages', icon: MESSAGES_BADGE },
  { name: 'Mail', icon: 'https://www.figma.com/api/mcp/asset/41d91953-961c-4017-bb39-53eaec050271.png' },
  { name: 'Notes', icon: 'https://www.figma.com/api/mcp/asset/778c7a96-7f7e-4219-91e8-999ae0bdb16f.png' },
  { name: 'Reminders', icon: 'https://www.figma.com/api/mcp/asset/979ccb75-1d6a-484c-9053-58e51280af8c.png' },
];

export const contentMap: ContentMapScreenMetadata = {
  id: 'v1-winner',
  routePath: '/winner',
  label: 'Winner screen',
  context: 'Sweepstakes result',
  heading: "John, you've won $3,000 in the draw!",
  subhead: 'Simple: Re-enter draw. Shareable: Share flow with iOS share sheet.',
  order: 10,
  options: [],
};

// ─── Share drawer ──────────────────────────────────────────────────────────────

const ShareDrawer: React.FC<{
  isOpen: boolean;
  onShare: () => void;
  onCopyImage: () => void;
  onClose: () => void;
}> = ({ isOpen, onShare, onCopyImage, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14,6,5,0.5)' }}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 42, mass: 1 }}
          style={{
            position: 'absolute',
            bottom: 12,
            left: 9,
            right: 9,
            backgroundColor: colorRoles.background.primary,
            borderRadius: 28, // No exact Radii token for modal radius — Figma spec: 28px
            overflow: 'hidden',
            paddingBottom: Spacing.S,
          }}
        >
          {/* Grabber */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: Spacing.XXS, paddingBottom: Spacing.XXS }}>
            <div style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(14,6,5,0.1)' }} />
          </div>
          <div style={{ paddingLeft: Spacing.S, paddingRight: Spacing.S, display: 'flex', flexDirection: 'column', gap: Spacing.S }}>
            {/* Social share image with glow */}
            <div style={{
              aspectRatio: '1200/630',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 0 31px 0 white, 0 0 18px 0 white, 0 0 10px 0 white, 0 0 5px 0 white',
              width: '100%',
            }}>
              <img src={SOCIAL_SHARE_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <VStack gap="XXS">
              <Button label="Share" variant="primary" size="L" fullWidth startIcon="link" onPress={onShare} />
              <motion.button
                type="button"
                onClick={onCopyImage}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  width: '100%',
                  height: 48,
                  paddingLeft: 20,
                  paddingRight: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: Spacing.XXS,
                  backgroundColor: 'transparent',
                  color: colorRoles.content.secondary,
                  border: `1px solid ${colorRoles.border.selected}`,
                  borderRadius: Radii.BUTTON,
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20.4326 20.3193" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.4326 14.8008H14.8008V20.3193H0V5.51855H5.69141V0H20.4326V14.8008ZM1.30078 19.0186H13.5V6.81934H1.30078V19.0186ZM6.99219 5.51855H14.8008V13.5H19.1328V1.30078H6.99219V5.51855Z" fill="currentColor"/>
                </svg>
                <Typography type="buttonLabel" size="L" color="currentColor">Copy image</Typography>
              </motion.button>
            </VStack>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── iOS share sheet ───────────────────────────────────────────────────────────

const IOSShareSheet: React.FC<{ isOpen: boolean; onDismiss: () => void }> = ({ isOpen, onDismiss }) => {
  const insets = useSafeArea();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
            style={{ position: 'absolute', inset: 0, backgroundColor: '#000' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 42, mass: 1 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 38,
              borderTopRightRadius: 38,
              overflow: 'hidden',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
              paddingBottom: insets.bottom,
            }}
          >
            {/* Grabber */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <div style={{ width: 36, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(60,60,67,0.3)' }} />
            </div>

            <div style={{ height: 12 }} />
            <div style={{ height: 1, backgroundColor: '#e6e6e6', marginLeft: 24 }} />

            {/* Contacts row */}
            <div style={{ display: 'flex', gap: 14, padding: '14px 24px 16px', overflowX: 'auto' }}>
              {CONTACTS.map((c) => (
                <div key={c.line1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 78, flexShrink: 0 }}>
                  <div style={{ position: 'relative', width: 70, height: 70 }}>
                    <img src={c.avatar} alt="" style={{ width: 70, height: 70, borderRadius: 35, objectFit: 'cover' }} />
                    <img
                      src={MESSAGES_BADGE}
                      alt=""
                      style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 5 }}
                    />
                  </div>
                  <div style={{ marginTop: 5, textAlign: 'center', fontFamily: IOS_FONT, fontSize: 12, fontWeight: 400, lineHeight: '15px', color: '#000' }}>
                    <div>{c.line1}</div>
                    <div>{c.line2}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, backgroundColor: '#e6e6e6', marginLeft: 24 }} />

            {/* App icons row */}
            <div style={{ display: 'flex', gap: 14, padding: '14px 24px 20px', overflowX: 'auto' }}>
              {APP_ICONS.map((app) => (
                <div key={app.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 78, flexShrink: 0 }}>
                  <img src={app.icon} alt={app.name} style={{ width: 70, height: 70, borderRadius: 15, objectFit: 'cover' }} />
                  <div style={{ fontFamily: IOS_FONT, fontSize: 11, fontWeight: 400, lineHeight: '13px', color: '#000', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {app.name}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, backgroundColor: '#e6e6e6', marginLeft: 24 }} />

            {/* Action icons row */}
            <div style={{ display: 'flex', gap: 14, padding: '18px 24px 20px', overflowX: 'auto' }}>
              {([
                {
                  label: 'Copy',
                  icon: (
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none">
                      <rect x={7} y={7} width={13} height={13} rx={2.5} stroke="#1a1a1a" strokeWidth={1.5} />
                      <rect x={4} y={4} width={13} height={13} rx={2.5} fill="white" stroke="#1a1a1a" strokeWidth={1.5} />
                    </svg>
                  ),
                },
                {
                  label: 'Add to\nFavorites',
                  icon: (
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none">
                      <path d="M12 2l2.78 5.63L22 8.75l-5 4.87 1.18 6.88L12 17.2l-6.18 3.3L7 13.62 2 8.75l7.22-1.12z" stroke="#1a1a1a" strokeWidth={1.5} strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  label: 'Add to\nReading List',
                  icon: (
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none">
                      <ellipse cx={7} cy={13} rx={4} ry={3} stroke="#1a1a1a" strokeWidth={1.5} />
                      <ellipse cx={17} cy={13} rx={4} ry={3} stroke="#1a1a1a" strokeWidth={1.5} />
                      <line x1={11} y1={13} x2={13} y2={13} stroke="#1a1a1a" strokeWidth={1.5} />
                      <line x1={3} y1={10} x2={2} y2={8} stroke="#1a1a1a" strokeWidth={1.5} strokeLinecap="round" />
                      <line x1={21} y1={10} x2={22} y2={8} stroke="#1a1a1a" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  label: 'Add\nBookmark',
                  icon: (
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none">
                      <path d="M5 3h14a1 1 0 011 1v16l-8-5-8 5V4a1 1 0 011-1z" stroke="#1a1a1a" strokeWidth={1.5} strokeLinejoin="round" />
                    </svg>
                  ),
                },
              ] as { label: string; icon: React.ReactNode }[]).map((action) => (
                <div key={action.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 78, flexShrink: 0 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#ededed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </div>
                  <div style={{ fontFamily: IOS_FONT, fontSize: 11, fontWeight: 400, lineHeight: '15px', color: '#1a1a1a', textAlign: 'center', whiteSpace: 'pre-line', width: '100%' }}>
                    {action.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, backgroundColor: '#e6e6e6', marginLeft: 24 }} />

            {/* List action groups */}
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(120,120,128,0.16)', borderRadius: 26, overflow: 'hidden' }}>
                {['Add to Reading List', 'Add Bookmark', 'Add to Favorites', 'Add to Home Screen'].map((label, i) => (
                  <div
                    key={label}
                    style={{
                      height: 52, display: 'flex', alignItems: 'center',
                      paddingLeft: 16, paddingRight: 16,
                      borderTop: i > 0 ? '1px solid #e6e6e6' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: IOS_FONT, fontSize: 17, fontWeight: 400, color: '#000', lineHeight: '22px', letterSpacing: '-0.43px' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <motion.button
                type="button"
                onClick={onDismiss}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: 52, borderRadius: 26,
                  backgroundColor: 'rgba(120,120,128,0.16)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: IOS_FONT, fontSize: 17, fontWeight: 600,
                  color: '#007AFF',
                  width: '100%',
                }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── WinnerScreen ──────────────────────────────────────────────────────────────

export const WinnerScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const insets = useSafeArea();

  const [winnerVariant, setWinnerVariant] = useState<WinnerVariant>(() => {
    const state = location.state as { winnerVariant?: string } | null;
    return state?.winnerVariant === 'shareable' ? 'shareable' : 'simple';
  });
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    const state = location.state as { winnerVariant?: string } | null;
    if (state?.winnerVariant !== undefined) {
      setWinnerVariant(state.winnerVariant === 'shareable' ? 'shareable' : 'simple');
      setShowShareDrawer(false);
      setShowShareSheet(false);
    }
  }, [location.state]);

  const handleMainButton = () => {
    if (winnerVariant === 'simple') {
      navigate('/savings');
    } else {
      setShowShareDrawer(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Background */}
      <img
        src={winnerHero}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%',
        background: `linear-gradient(to bottom, rgba(41,18,16,0) 0%, ${colors.brown[900]} 84%)`,
        pointerEvents: 'none',
      }} />

      {/* Close button */}
      <div style={{ position: 'absolute', top: insets.top + Spacing.XS, right: Spacing.S }}>
        <motion.button
          type="button"
          onClick={() => navigate('/savings')}
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Close"
          style={{
            width: 36, height: 36, borderRadius: Radii.ICON,
            backgroundColor: 'rgba(255,255,255,0.18)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LineIcon name="cross" size="S" color={colorRoles.content.onColor} />
        </motion.button>
      </div>

      {/* Bottom content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingLeft: Spacing.M, paddingRight: Spacing.M,
        paddingBottom: insets.bottom + Spacing.L,
        display: 'flex', flexDirection: 'column', gap: Spacing.L,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={framerFromDef(MotionTransitions.slideIn.slow1)}
          >
            <Typography type="display" size="M" weight="Bold" color={colorRoles.content.onColor}>
              John, you've won $3,000 in the draw!
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: EnterTransitions.text.rowSlideY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...framerFromDef(MotionTransitions.slideIn.slow1), delay: msToSeconds(MotionDuration.steady1) }}
          >
            <Typography type="title" size="L" color={colorRoles.content.onColorMid}>
              We'll email you instructions for how to redeem your prize in the next 2 business days
            </Typography>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: msToSeconds(MotionDuration.slow1) }}
        >
          <Button
            label={winnerVariant === 'simple' ? 'Re-enter draw' : 'Share with the world'}
            variant="primary"
            palette="dark"
            size="L"
            fullWidth
            onPress={handleMainButton}
          />
        </motion.div>
      </div>

      <ShareDrawer
        isOpen={showShareDrawer}
        onShare={() => { setShowShareDrawer(false); setShowShareSheet(true); }}
        onCopyImage={() => navigate('/savings', { state: { depositedAmount: 50, snackbarMessage: 'Image copied. You can share it by pasting it in other apps' } })}
        onClose={() => setShowShareDrawer(false)}
      />

      <IOSShareSheet
        isOpen={showShareSheet}
        onDismiss={() => setShowShareSheet(false)}
      />
    </div>
  );
};
