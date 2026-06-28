import { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Decimal places to display. */
  decimals?: number;
  className?: string;
  /** Spring stiffness — higher snaps faster. */
  stiffness?: number;
}

/**
 * A number that springs smoothly toward its target whenever `value` changes,
 * giving the "counting" feel without re-rendering the whole tree each frame.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  stiffness = 170,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    stiffness,
    damping: 26,
    mass: 0.6,
  });
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
