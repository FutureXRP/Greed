import React, { useEffect, useRef, useState } from 'react';
import { TextStyle, StyleProp } from 'react-native';
import { Mono } from './ui';

/** Animated count-up number (score reveal). Respects reduced motion. */
export function CountUp({
  value,
  duration = 800,
  reducedMotion,
  style,
  prefix = '',
}: {
  value: number;
  duration?: number;
  reducedMotion?: boolean;
  style?: StyleProp<TextStyle>;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    start.current = null;
    const step = (ts: number) => {
      if (start.current == null) start.current = ts;
      const t = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration, reducedMotion]);

  return (
    <Mono style={style}>
      {prefix}
      {display}
    </Mono>
  );
}
