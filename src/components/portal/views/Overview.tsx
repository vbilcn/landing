'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BatteryCharging,
  Coins,
  Download,
  FlaskConical,
  Factory,
  PlugZap,
} from 'lucide-react';
import { dec, useI18n } from '@/lib/i18n';
import { useDataRoom } from '@/components/portal/Portal';
import { useToast } from '@/hooks/use-toast';
import { AnimatedNumber, GlassCard, Kicker, Reveal, RichText, SectionHeader, Tag, Term } from '@/components/portal/ui';
import { ElectrolyzerArt, HeroArt, PipelineArt } from '@/components/portal/three/lazy';

/* ── NPV sensitivity chart (custom SVG, light theme) ──────────────────────── */
function NpvChart() {
  const { t, lang } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const X0 = 52;
  const X1 = 740;
  const Y0 = 24;
  const Y1 = 300;
  const px = (p: number) => X0 + (p / 200) * (X1 - X0);
  const py = (v: number) => Y1 - ((v + 60) / 110) * (Y1 - Y0);
  const npvWith = (p: number) => 0.3307 * p - 25.235;
  const npvWithout = (p: number) => npvWith(p) - 27.6;

  const linePath = (fn: (p: number) => number) => {
    const pts: string[] = [];
    for (let p = 0; p <= 200; p += 5) pts.push(`${px(p).toFixed(1)},${py(fn(p)).toFixed(1)}`);
    return 'M' + pts.join(' L');
  };

  const beWith = 76.3;
  const beWithout = 159.8;
  const scenarios = [50, 125, 150];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 760;
    const p = Math.round(((x - X0) / (X1 - X0)) * 200);
    setHover(p >= 0 && p <= 200 ? p : null);
  };

  const fmt = (v: number) => dec(v, lang, 1);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="legend-dot bg-blue-600" />
          {t.overview.chart.legendWith}
        </span>
        <span className="flex items-center gap-2">
          <span className="legend-dot border-t-2 border-dashed border-amber-500 bg-white" />
          {t.overview.chart.legendWithout}
        </span>
        <span className="flex items-center gap-2">
          <span className="legend-dot border-2 border-blue-600 bg-white" />
          {t.overview.chart.breakeven}
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 760 340"
        className="h-auto w-full cursor-crosshair select-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={t.overview.chart.title}
      >
        {/* grid */}
        {Array.from({ length: 9 }, (_, i) => i * 25).map((p) => (
          <g key={`gx${p}`}>
            <line x1={px(p)} y1={Y0} x2={px(p)} y2={Y1} stroke="#f1f1f2" strokeWidth={1} />
            <text x={px(p)} y={Y1 + 16} textAnchor="middle" fontSize={10} fill="#a1a1aa" fontFamily="var(--font-jetmono), monospace">
              {p}
            </text>
          </g>
        ))}
        {[-60, -40, -20, 0, 20, 40].map((v) => (
          <g key={`gy${v}`}>
            <line
              x1={X0}
              y1={py(v)}
              x2={X1}
              y2={py(v)}
              stroke={v === 0 ? '#c0c0c0' : '#f1f1f2'}
              strokeWidth={1}
            />
            <text x={X0 - 8} y={py(v) + 3} textAnchor="end" fontSize={10} fill="#a1a1aa" fontFamily="var(--font-jetmono), monospace">
              {v}
            </text>
          </g>
        ))}
        {/* axis titles */}
        <text x={(X0 + X1) / 2} y={Y1 + 34} textAnchor="middle" fontSize={11} fill="#6e6e73">
          {t.overview.chart.axisX}
        </text>
        <text x={X0 - 40} y={Y0 + 6} fontSize={11} fill="#6e6e73">
          {t.overview.chart.axisY}
        </text>

        {/* breakeven markers */}
        {[beWith, beWithout].map((b, i) => (
          <g key={`be${i}`}>
            <line x1={px(b)} y1={Y0} x2={px(b)} y2={Y1} stroke="#8cbff2" strokeWidth={1} strokeDasharray="3 5" />
            <text x={px(b) + 6} y={Y0 + 14} fontSize={11} fill="#0071e3" fontFamily="var(--font-jetmono), monospace">
              ≈ ${Math.round(b)}/t
            </text>
          </g>
        ))}

        {/* lines */}
        <path d={linePath(npvWithout)} fill="none" stroke="#df8b2b" strokeWidth={2} strokeDasharray="6 6" />
        <path d={linePath(npvWith)} fill="none" stroke="#0071e3" strokeWidth={2.5} />

        {/* hover crosshair */}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={px(hover)} y1={Y0} x2={px(hover)} y2={Y1} stroke="#d2d2d2" strokeWidth={1} />
            <circle cx={px(hover)} cy={py(npvWith(hover))} r={4} fill="#0071e3" />
            <circle cx={px(hover)} cy={py(npvWithout(hover))} r={4} fill="#d97706" />
            <g transform={`translate(${Math.min(px(hover) + 10, 600)},${Math.max(py(npvWith(hover)) - 52, Y0)})`}>
              <rect width={150} height={46} rx={8} fill="#ffffff" stroke="#d2d2d7" />
              <text x={10} y={18} fontSize={11} fill="#1d1d1f" fontFamily="var(--font-jetmono), monospace">
                CO₂ ${hover}/t
              </text>
              <text x={10} y={34} fontSize={11} fill="#0071e3" fontFamily="var(--font-jetmono), monospace">
                {fmt(npvWith(hover))} / {fmt(npvWithout(hover))} $M
              </text>
            </g>
          </g>
        )}

        {/* scenario markers */}
        {scenarios.map((p, i) => {
          const names = ['pess', 'base', 'opt'];
          const item = t.overview.scenarios.items[i];
          return (
            <circle
              key={names[i]}
              cx={px(p)}
              cy={py(npvWith(p))}
              r={5.5}
              fill={p === 125 ? '#0071e3' : '#ffffff'}
              stroke="#0071e3"
              strokeWidth={2}
              className="cursor-pointer"
            >
              <title>{`${item.name} · ${item.co2} · NPV ${fmt(item.npv)}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Overview view ────────────────────────────────────────────────────────── */
export default function OverviewView() {
  const { t, lang, setView } = useI18n();
  const { open } = useDataRoom();
  const { toast } = useToast();
  const [active, setActive] = useState(1); // base scenario index

  const isZh = lang === 'zh';

  const heroEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* left: text */}
          <div className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: heroEase }}>
              <Kicker>{t.overview.kicker}</Kicker>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: heroEase }}
              className="mt-6 text-4xl font-semibold leading-[1.06] tracking-tight text-zinc-900 sm:text-[3.4rem]"
            >
              {t.overview.h1line1}
              <br />
              <span className="text-blue-600">{t.overview.h1line2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: heroEase }}
              className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg"
            >
              <RichText text={t.overview.tagline} keys={['trl', 'sng', 'npv']} />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: heroEase }}
              className="mt-7 flex flex-wrap items-center gap-4"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs text-zinc-600">
                <span className="pulse-soft h-2 w-2 rounded-full bg-blue-600" />
                {t.overview.heroBadge}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52, ease: heroEase }}
              className="mt-7 flex flex-wrap gap-4"
            >
              <button
                type="button"
                onClick={() => toast({ description: t.toast.deck })}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                <Download className="h-4 w-4" aria-hidden />
                {t.overview.ctaPrimary}
              </button>
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                {t.overview.ctaSecondary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          </div>

          {/* right: interactive 3D scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: heroEase }}
            className="relative min-w-0"
          >
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
              <HeroArt className="h-[340px] w-full sm:h-[420px] lg:h-[470px]" />
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              CO₂ + 4H₂ → CH₄ + 2H₂O
            </div>
          </motion.div>
        </div>

        {/* hooks */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.overview.hooks.map((h, i) => {
            const isNpv = h.prefix === '+$';
            const val = isZh && isNpv ? Number(h.num) * 100 : Number(h.num);
            return (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.62 + i * 0.09, ease: heroEase }}
              >
                <GlassCard className="px-4 py-4" hover>
                  <div className="font-mono text-2xl font-semibold text-zinc-900 sm:text-3xl">
                    <AnimatedNumber
                      value={val}
                      decimals={h.num.includes('.') ? 1 : 0}
                      prefix={isZh && isNpv ? '+' : h.prefix}
                      suffix={isZh && isNpv ? '万' : isNpv ? h.unit : ' ' + h.unit}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug text-zinc-500">{h.label}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader kicker={t.overview.problem.kicker} title={t.overview.problem.title} lead={t.overview.problem.text} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.overview.problem.items.map((item, i) => {
            const icons = [Coins, BatteryCharging, PlugZap];
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <GlassCard className="h-full p-6" hover>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                    <Icon className="h-5 w-5 text-zinc-700" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{item.text}</p>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.1} className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            <PipelineArt className="h-52 w-full sm:h-60" />
          </div>
        </Reveal>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <Kicker>{t.overview.solution.kicker}</Kicker>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{t.overview.solution.title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-600">{t.overview.solution.text}</p>
            <ul className="mt-6 space-y-3">
              {t.overview.solution.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[14px] leading-relaxed text-zinc-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="font-mono uppercase tracking-[0.16em]">DD terms:</span>
              <Term k="sng" />
              <Term k="pem" />
              <Term k="dac" />
              <Term k="trl" />
              <Term k="capex" />
            </div>
          </Reveal>
          <Reveal delay={0.12} className="min-w-0">
            <figure>
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                <ElectrolyzerArt className="aspect-[4/3] w-full" />
              </div>
              <figcaption className="mt-3 text-center text-xs text-zinc-400">{t.overview.solution.kicker} · 109 MW PEM</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── SCENARIOS ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader kicker={t.overview.scenarios.kicker} title={t.overview.scenarios.title} tone="gold" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.overview.scenarios.items.map((s, i) => {
            const isActive = active === i;
            const isBase = s.id === 'base';
            const npvVal = isZh ? s.npv * 100 : s.npv;
            const npvPrefix = isZh ? (s.npv < 0 ? '−' : '+') : s.npv < 0 ? '−$' : '+$';
            const npvSuffix = isZh ? '万' : lang === 'ru' ? ' млн' : 'M';
            return (
              <Reveal key={s.id} delay={i * 0.08}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`block h-full w-full rounded-2xl border p-6 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold uppercase tracking-[0.14em] ${isActive ? 'text-blue-700' : 'text-zinc-600'}`}>
                      {s.name}
                    </h3>
                    {isBase && <Tag tone="emerald">{t.overview.scenarios.badgeBase}</Tag>}
                  </div>
                  <div className="tnum mt-1 font-mono text-xs text-zinc-400">{s.co2}</div>
                  <div className={`mt-5 font-mono text-3xl font-semibold ${s.npv < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    <AnimatedNumber value={Math.abs(npvVal)} decimals={1} prefix={npvPrefix} suffix={npvSuffix} />
                  </div>
                  <dl className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">{t.overview.scenarios.cols.irr}</dt>
                      <dd className="tnum font-mono text-zinc-900">{s.irr}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">{t.overview.scenarios.cols.payback}</dt>
                      <dd className="tnum font-mono text-zinc-900">{s.payback}</dd>
                    </div>
                  </dl>
                  <p className={`mt-4 text-xs leading-relaxed ${isActive ? 'text-zinc-700' : 'text-zinc-500'}`}>{s.verdict}</p>
                </button>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.15} className="mt-8">
          <GlassCard className="p-4 sm:p-6">
            <NpvChart />
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t.overview.chart.subtitle}</p>
          </GlassCard>
        </Reveal>
        <Reveal delay={0.2} className="mt-4">
          <p className="text-xs leading-relaxed text-zinc-500">{t.overview.scenarios.note}</p>
        </Reveal>
      </section>

      {/* ── SUBSIDY ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <Kicker tone="gold">{t.overview.subsidy.kicker}</Kicker>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.overview.subsidy.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-zinc-600">
                  <RichText text={t.overview.subsidy.text} keys={['capex']} />
                </p>
                <p className="mt-4 text-xs leading-relaxed text-amber-700">{t.overview.subsidy.note}</p>
              </div>
              <div className="space-y-3">
                {t.overview.subsidy.rows.map((r, i) => (
                  <div
                    key={r.label}
                    className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 ${
                      i === 2 ? 'border-blue-600 bg-white' : 'border-zinc-200 bg-white'
                    }`}
                  >
                    <span className="text-[13px] text-zinc-500">{r.label}</span>
                    <span className={`tnum font-mono text-lg font-semibold ${i === 2 ? 'text-blue-600' : 'text-zinc-900'}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── ROADMAP ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader kicker={t.overview.roadmap.kicker} title={t.overview.roadmap.title} />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {t.overview.roadmap.phases.map((ph, i) => {
            const icons = [FlaskConical, Factory];
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={ph.name} delay={i * 0.1}>
                <GlassCard className="relative h-full overflow-hidden p-6" hover>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                        <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900">{ph.name}</h3>
                        <div className="tnum font-mono text-xs text-zinc-500">{ph.period}</div>
                      </div>
                    </div>
                    <Tag>{ph.status}</Tag>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {ph.milestones.map((m) => (
                      <li key={m} className="flex items-start gap-3 text-[13px] leading-relaxed text-zinc-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── PARTICIPATION ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-28">
        <SectionHeader kicker={t.overview.participation.kicker} title={t.overview.participation.title} tone="gold" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.overview.participation.items.map((p, i) => (
            <Reveal key={p.role} delay={i * 0.08}>
              <GlassCard className="flex h-full flex-col p-6" hover>
                <h3 className="text-base font-semibold text-zinc-900">{p.role}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-zinc-600">{p.text}</p>
                <button
                  type="button"
                  onClick={() => setView('legal')}
                  className="mt-5 inline-flex items-center gap-2 self-start text-[13px] font-medium text-blue-700 transition hover:text-blue-600"
                >
                  {p.text2}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
