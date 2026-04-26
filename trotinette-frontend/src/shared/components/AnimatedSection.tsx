import { type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { Variants } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../animations/variants';

interface AnimatedSectionProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  /** Trigger animation only once (default true) */
  once?: boolean;
  /** InView threshold 0-1 (default 0.15) */
  threshold?: number;
}

export function AnimatedSection({
  children,
  variants = fadeInUp,
  className,
  once = true,
  threshold = 0.15,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerSection({
  children,
  className,
  once = true,
  threshold = 0.15,
}: Omit<AnimatedSectionProps, 'variants'>) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}
