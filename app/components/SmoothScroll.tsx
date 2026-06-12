'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Instantiate Lenis smooth scroll with responsive lerp settings
    const lenis = new Lenis({
      duration: 1.0,
      lerp: 0.1, // Smooth interpolation (standard for Lenis)
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Connect Lenis to requestAnimationFrame loop, correctly updating the frame ID
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

