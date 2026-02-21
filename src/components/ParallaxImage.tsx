"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ParallaxImage({ src, alt, className }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;

    function onMove(e: MouseEvent) {
      const elLocal = ref.current;
      if (!elLocal) return;
      const rect = elLocal.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const tx = relX * 10; // horizontal amplitude
      const ty = relY * 8; // vertical amplitude
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const elNow = ref.current;
        if (elNow) elNow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    }

    function onLeave() {
      cancelAnimationFrame(raf);
      const elNow = ref.current;
      if (elNow) elNow.style.transform = "translate3d(0,0,0)";
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`absolute inset-0 will-change-transform ${className ?? ""}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className={`object-contain w-full h-full`} />
    </div>
  );
}
