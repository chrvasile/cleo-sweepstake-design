import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Divider,
  IconButton,
  LineIcon,
  Typography,
  VStack,
} from '../../../design-system/components';
import {
  colorRoles,
  framerFromDef,
  MotionTransitions,
  Radii,
  Spacing,
} from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import type { LineIconName } from '../../../design-system/components/LineIcon/types';
import learnMoreHero from '../../assets/learn-more-hero.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'sep16-learn-more',
  routePath: '/learn-more',
  label: 'Learn More',
  context: 'Sweepstakes info',
  heading: 'Save. Earn. Grow your odds',
  subhead: 'Informational screen explaining how the prize draw works.',
  order: 3,
  options: [],
};

const HOW_IT_WORKS: { icon: LineIconName; title: string; subtitle: string }[] = [
  {
    icon: 'cash-incoming',
    title: 'Add to your savings',
    subtitle: 'Starting at $1',
  },
  {
    icon: 'ticket-default',
    title: 'Watch your tokens add up',
    subtitle: '1 token per dollar saved, up to 1,000',
  },
  {
    icon: 'calendar-check',
    title: 'Lock in your spot',
    subtitle: 'Come back to Cleo and enter before the deadline each week',
  },
  {
    icon: 'sync',
    title: 'Stay in the running',
    subtitle: "Tokens carry over as long as your money stay saved",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I earn tokens?',
    a: 'You get 1 token for each dollar added to Cleo Savings.',
  },
  {
    q: 'What is a token?',
    a: '1 token = 1 entry in the draw. The more tokens you earn, the better your chance of winning.',
  },
  {
    q: 'Is there a limit to how many tokens I can have?',
    a: "Yes, the limit is 1,000. Once you reach that, saving more won't give you more tokens.",
  },
  {
    q: 'How are winners chosen?',
    a: 'Winners are picked at random for each prize from the list of all eligible participants.',
  },
  {
    q: 'Are my tokens automatically entered into the draw?',
    a: 'No. You need to come back to the app and enter the draw each week.',
  },
  {
    q: 'When will I find out if I won a prize?',
    a: "The draw happens every {{date}}. You'll get an email if you win, plus a notification in the app.",
  },
];

const FaqItem: React.FC<{ q: string; a: string; isLast: boolean }> = ({ q, a, isLast }) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: `${Spacing.S}px 0`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.S,
          textAlign: 'left',
        }}
      >
        <Typography type="titleStrong" size="M" color={colorRoles.content.primary}>
          {q}
        </Typography>
        <motion.div
          animate={{ rotate: open ? 0 : 180 }}
          transition={framerFromDef(MotionTransitions.scale.swift2)}
          style={{ flexShrink: 0 }}
        >
          <LineIcon name="chevron-up" size="S" color={colorRoles.content.secondary} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={framerFromDef(MotionTransitions.slideIn.steady1)}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: Spacing.S }}>
              <Typography type="body" size="L" color={colorRoles.content.secondary}>
                {a}
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLast && <Divider />}
    </>
  );
};

// Content overlaps the hero by this many px so the title sits over the dark gradient
const CONTENT_OVERLAP = 276;

export const LearnMoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const insets = useSafeArea();

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: colorRoles.background.primary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Back button */}
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          top: insets.top + Spacing.XXS,
          left: Spacing.XXS,
        }}
      >
        <IconButton
          icon="chevron-left"
          variant="primary"
          transparentBackground
          label="Back"
          onPress={() => navigate(-1)}
        />
      </div>

      {/* Hero + content scroll together */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {/* Hero photo */}
        <div
          style={{
            position: 'relative',
            height: 582,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            alt=""
            src={learnMoreHero}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 70%',
              pointerEvents: 'none',
            }}
          />
          {/* Gradient darkens the bottom so the title reads in white */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Content — overlaps hero bottom; no background of its own.
            Only the bordered list card carries a white background.
            When scrolled, the hero photo exits the viewport and the
            screen background (warm off-white) shows through. */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: -CONTENT_OVERLAP,
            padding: `0 ${Spacing.S}px 0`,
          }}
        >
          {/* Title — sits over the hero gradient, needs white text */}
          <Typography
            type="displayNumbers"
            size="M"
            color={colorRoles.content.onColor}
            style={{
              fontFamily: 'PPNeueMontreal, system-ui, sans-serif',
              lineHeight: '40px',
            }}
          >
            Save. Earn. Grow your odds
          </Typography>

          <div style={{ height: Spacing.S }} />

          {/* List card — only element with its own white background */}
          <div
            style={{
              border: `1px solid ${colorRoles.border.default}`,
              borderRadius: Radii.CONTAINER,
              overflow: 'hidden',
              backgroundColor: colorRoles.background.baseLight,
              marginBottom: Spacing.S,
            }}
          >
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.icon}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: Spacing.S,
                    padding: `${Spacing.S}px`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: colorRoles.background.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LineIcon name={item.icon} size="M" color={colorRoles.content.primary} />
                  </div>

                  <VStack gap="XXXS" align="start" style={{ flex: 1, minWidth: 0 }}>
                    <Typography type="titleStrong" size="M" color={colorRoles.content.primary}>
                      {item.title}
                    </Typography>
                    <Typography type="body" size="M" color={colorRoles.content.secondary}>
                      {item.subtitle}
                    </Typography>
                  </VStack>
                </div>

                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    style={{
                      height: 1,
                      backgroundColor: colorRoles.border.default,
                      marginLeft: 44 + Spacing.S + Spacing.S,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* FAQs — no background, screen background shows through */}
          <div style={{ paddingBottom: Spacing.S }}>
            <Typography type="headline" size="S" color={colorRoles.content.primary}>
              FAQs
            </Typography>
          </div>

          {FAQS.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} isLast={i === FAQS.length - 1} />
          ))}

          <div style={{ height: 180 + insets.bottom }} />
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: colorRoles.background.primary,
          borderTop: `1px solid ${colorRoles.border.default}`,
          padding: `${Spacing.XS}px ${Spacing.S}px`,
          paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.S,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Spacing.XXS,
            marginBottom: Spacing.XS,
          }}
        >
          <LineIcon name="exclamation-in-circle" size="S" color={colorRoles.content.tertiary} />
          <Typography type="label" size="M" color={colorRoles.content.tertiary}>
            By opting in you agree to Cleo's terms and conditions.
          </Typography>
        </div>

        <VStack gap="XXS">
          <Button
            label="Hold to enter draw"
            variant="primary"
            size="L"
            fullWidth
            onPress={() => navigate(-1)}
          />
          <Button
            label="Not now"
            variant="secondary"
            size="L"
            fullWidth
            onPress={() => navigate(-1)}
          />
        </VStack>
      </div>
    </div>
  );
};
