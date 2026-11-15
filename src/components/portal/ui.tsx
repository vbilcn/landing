'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import type { Dict } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ── Reveal: 600ms fade-up on scroll into view ────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── AnimatedNumber: counts up when visible ───────────────────────────────── */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1500,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { lang } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const fixed = display.toFixed(decimals);
  const shown = lang === 'ru' ? fixed.replace('.', ',') : fixed;

  return (
    <span ref={ref} className={cn('tnum', className)}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ── Kicker: small mono section label ─────────────────────────────────────── */
export function Kicker({ children, tone = 'emerald' }: { children: React.ReactNode; tone?: 'cyan' | 'gold' | 'emerald' }) {
  const dash = tone === 'gold' ? 'bg-blue-700' : 'bg-blue-600';
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
      <span className={cn('h-px w-8', dash)} />
      {children}
    </div>
  );
}

/* ── SectionHeader ────────────────────────────────────────────────────────── */
export function SectionHeader({
  kicker,
  title,
  lead,
  tone = 'emerald',
  className,
}: {
  kicker: string;
  title: string;
  lead?: string;
  tone?: 'cyan' | 'gold' | 'emerald';
  className?: string;
}) {
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      <Kicker tone={tone}>{kicker}</Kicker>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{title}</h2>
      {lead ? <p className="mt-4 text-[15px] leading-relaxed text-zinc-600">{lead}</p> : null}
    </Reveal>
  );
}

/* ── Card (minimalist white panel) ────────────────────────────────────────── */
export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white',
        hover && 'transition-colors duration-300 hover:border-zinc-300',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Tag chip ─────────────────────────────────────────────────────────────── */
export function Tag({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'cyan' | 'emerald' | 'gold' }) {
  const map = {
    slate: 'border-zinc-200 bg-white text-zinc-500',
    cyan: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-blue-200 bg-blue-50 text-blue-700',
    gold: 'border-amber-200 bg-amber-50 text-amber-700',
  } as const;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]', map[tone])}>
      {children}
    </span>
  );
}

/* ── Term: hover/focus typewriter definition ──────────────────────────────── */
export type TermKey = keyof Dict['terms'];

const TT_W = 288; // tooltip width px

export function Term({ k, children }: { k: TermKey; children?: React.ReactNode }) {
  const { t } = useI18n();
  const def = t.terms[k];
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);

  const start = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const left = Math.min(Math.max(8, r.left), window.innerWidth - 8 - TT_W);
      const below = r.bottom + 8;
      const est = 150;
      const top = below + est > window.innerHeight ? Math.max(8, r.top - est - 8) : below;
      setPos({ top, left });
    }
    setOpen(true);
    setCount(0);
  };
  const stop = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c >= def.text.length) {
          if (timer.current) clearInterval(timer.current);
          return c;
        }
        return c + 2;
      });
    }, 14);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [open, def.text]);

  // close on outside click (mobile tap) and on scroll
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onResize = () => setOpen(false);
    document.addEventListener('click', onDoc);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('click', onDoc);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const typed = def.text.slice(0, count);
  const full = count >= def.text.length;

  return (
    <span ref={boxRef} className="inline-block">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={start}
        onFocus={start}
        onClick={(e) => {
          e.stopPropagation();
          if (open) stop();
          else start();
        }}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
        className="cursor-help border-b border-dotted border-blue-400 font-medium text-blue-700 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
      >
        {children ?? def.title}
      </button>
      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: TT_W }}
            className="z-[70] block rounded-2xl border border-zinc-200 bg-white p-3 text-left text-[13px] font-normal leading-relaxed tracking-normal normal-case text-zinc-700 shadow-xl shadow-zinc-900/10"
          >
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-blue-700">{def.title}</span>
            {typed}
            {!full && <span className="type-caret" />}
          </span>,
          document.body,
        )}
    </span>
  );
}

/* ── RichText: wraps term titles found inside a dict paragraph ────────────── */
export function RichText({ text, keys }: { text: string; keys: TermKey[] }) {
  const { t } = useI18n();

  type Part = { s: string } | { k: TermKey };
  let parts: Part[] = [{ s: text }];
  for (const k of keys) {
    const title = t.terms[k].title;
    const next: Part[] = [];
    for (const p of parts) {
      if ('k' in p) {
        next.push(p);
        continue;
      }
      const idx = p.s.indexOf(title);
      if (idx === -1) {
        next.push(p);
        continue;
      }
      if (idx > 0) next.push({ s: p.s.slice(0, idx) });
      next.push({ k });
      const rest = p.s.slice(idx + title.length);
      if (rest) next.push({ s: rest });
    }
    parts = next;
  }

  return (
    <>
      {parts.map((p, i) =>
        'k' in p ? <Term key={i} k={p.k} /> : <React.Fragment key={i}>{p.s}</React.Fragment>,
      )}
    </>
  );
}

/* ── SpecRow for label/value rows ─────────────────────────────────────────── */
export function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-100 py-2.5 last:border-0">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className="tnum text-right text-[13px] font-medium text-zinc-900">{value}</span>
    </div>
  );
}
