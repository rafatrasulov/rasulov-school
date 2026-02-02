"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useEffect, useRef } from "react";

interface MathInlineProps {
  math: string;
  className?: string;
}

export function MathInline({ math, className }: MathInlineProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math, ref.current, { throwOnError: false, displayMode: false });
    } catch {
      ref.current.textContent = math;
    }
  }, [math]);
  return <span ref={ref} className={className} />;
}

interface MathBlockProps {
  math: string;
  className?: string;
}

export function MathBlock({ math, className }: MathBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math, ref.current, { throwOnError: false, displayMode: true });
    } catch {
      ref.current.textContent = math;
    }
  }, [math]);
  return <div ref={ref} className={className} />;
}
