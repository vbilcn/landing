'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { GlassCard, Reveal, SectionHeader, SpecRow, Tag } from '@/components/portal/ui';
import { CatalystArt, ReactorArt } from '@/components/portal/three/lazy';
import { cn } from '@/lib/utils';

/* ── Process flow diagram (light) ─────────────────────────────────────────── */

const W = 190;
const H = 76;

const NODE_POS: Record<string, { x: number; y: number }> = {
  water: { x: 40, y: 170 },
  pem: { x: 270, y: 170 },
  h2comp: { x: 500, y: 170 },
  sabatier: { x: 730, y: 170 },
  condenser: { x: 960, y: 170 },
  co2: { x: 270, y: 290 },
  co2comp: { x: 500, y: 290 },
  tsa: { x: 960, y: 290 },
  heat: { x: 40, y: 410 },
  turbine: { x: 40, y: 530 },
};

const NODE_ACCENT: Record<string, string> = {
  water: '#0284c7',
  pem: '#0891b2',
  h2comp: '#0891b2',
  co2: '#71717a',
  co2comp: '#71717a',
  sabatier: '#0071e3',
  condenser: '#0284c7',
  tsa: '#0071e3',
  heat: '#d97706',
  turbine: '#d97706',
};

type Pipe = { d: string; color: string };

const PIPES: Pipe[] = [
  { d: 'M 8,208 L 40,208', color: '#0284c7' }, // water in
  { d: 'M 230,208 L 270,208', color: '#0284c7' }, // water → pem
  { d: 'M 460,208 L 500,208', color: '#0891b2' }, // pem → h2comp
  { d: 'M 690,208 L 730,208', color: '#0891b2' }, // h2comp → sabatier
  { d: 'M 8,328 L 270,328', color: '#71717a' }, // co2 in
  { d: 'M 460,328 L 500,328', color: '#71717a' }, // co2 → co2comp
  { d: 'M 690,328 L 780,328 L 780,246', color: '#71717a' }, // co2comp → sabatier (up)
  { d: 'M 920,208 L 960,208', color: '#0071e3' }, // sabatier → condenser
  { d: 'M 1055,246 L 1055,290', color: '#0071e3' }, // condenser → tsa (down)
  { d: 'M 1150,328 L 1212,328', color: '#0071e3' }, // tsa → grid
  { d: 'M 825,246 L 825,448 L 230,448', color: '#d97706' }, // sabatier → heat recovery (steam)
  { d: 'M 40,448 L 16,448 L 16,110 L 300,110 L 300,170', color: '#d97706' }, // heat → pem (⅓)
  { d: 'M 135,486 L 135,530', color: '#d97706' }, // heat → turbine (⅔)
  { d: 'M 430,170 L 430,84', color: '#a1a1aa' }, // O2 out from pem
];

/* Solid (precomputed-on-white) tints — the diagram uses no alpha anywhere. */
const PIPE_LIGHT: Record<string, string> = {
  '#0284c7': '#b3daee',
  '#0891b2': '#b5dee8',
  '#71717a': '#d4d4d7',
  '#0071e3': '#b2d4f7',
  '#d97706': '#f4d6b4',
  '#a1a1aa': '#e3e3e6',
};
const NODE_TINT: Record<string, string> = {
  '#0284c7': '#f0f8fc',
  '#0891b2': '#f0f8fa',
  '#71717a': '#f6f6f7',
  '#0071e3': '#f0f6fd',
  '#d97706': '#fdf7f0',
};
const NODE_TAG: Record<string, string> = {
  '#0284c7': '#41a3d5',
  '#0891b2': '#46acc5',
  '#71717a': '#94949b',
  '#0071e3': '#4094ea',
  '#d97706': '#e29944',
};

function FlowDiagram() {
  const { t } = useI18n();
  const nodes = t.engineering.flow.nodes;
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const shown = hovered ?? pinned;

  return (
    <div>
      <div className="overflow-x-auto scroll-slim rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-5">
        <svg viewBox="0 0 1240 620" className="h-auto w-full min-w-[880px]">
          <defs>
            {[
              ['ar-cyan', '#0891b2'],
              ['ar-slate', '#71717a'],
              ['ar-em', '#0071e3'],
              ['ar-amber', '#d97706'],
              ['ar-water', '#0284c7'],
              ['ar-o2', '#a1a1aa'],
            ].map(([id, color]) => (
              <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={color} />
              </marker>
            ))}
          </defs>

          {/* pipes: base + animated overlay */}
          {PIPES.map((p, i) => {
            const marker =
              p.color === '#0891b2' ? 'ar-cyan' : p.color === '#71717a' ? 'ar-slate' : p.color === '#0071e3' ? 'ar-em' : p.color === '#d97706' ? 'ar-amber' : p.color === '#0284c7' ? 'ar-water' : 'ar-o2';
            return (
              <g key={i}>
                <path d={p.d} fill="none" stroke={PIPE_LIGHT[p.color]} strokeWidth={2.5} />
                <path d={p.d} fill="none" stroke={p.color} strokeWidth={2} className="pipe-flow" markerEnd={`url(#${marker})`} />
              </g>
            );
          })}

          {/* pipe labels */}
          <text x={20} y={196} fontSize={11} fill="#0284c7" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.waterLabel}</text>
          <text x={20} y={316} fontSize={11} fill="#71717a" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.co2Label}</text>
          <text x={445} y={78} fontSize={12} fill="#71717a" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.o2Label}</text>
          <text x={24} y={100} fontSize={11} fill="#d97706" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.fracPem}</text>
          <text x={150} y={520} fontSize={11} fill="#d97706" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.fracTurb}</text>
          <text x={440} y={440} fontSize={11} fill="#d97706" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.steamLabel}</text>
          <text x={1160} y={316} fontSize={11} fill="#0071e3" fontFamily="var(--font-jetmono), monospace">{t.engineering.flow.sngLabel}</text>

          {/* nodes */}
          {nodes.map((n, i) => {
            const pos = NODE_POS[n.id];
            const accent = NODE_ACCENT[n.id];
            const active = shown === i;
            return (
              <g
                key={n.id}
                transform={`translate(${pos.x},${pos.y})`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setPinned(pinned === i ? null : i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={n.name}
                className="cursor-pointer outline-none"
              >
                <title>{n.name}</title>
                <rect
                  width={W}
                  height={H}
                  rx={12}
                  fill="#ffffff"
                  stroke={active ? accent : '#d4d4d8'}
                  strokeWidth={active ? 1.8 : 1.1}
                />
                {active && <rect width={W} height={H} rx={12} fill={NODE_TINT[accent] ?? '#f4f4f5'} />}
                <text
                  x={14}
                  y={26}
                  fontSize={11.5}
                  fontWeight={600}
                  fill="#1d1d1f"
                  {...(n.name.length > 26 ? { textLength: 162, lengthAdjust: 'spacingAndGlyphs' as const } : {})}
                >
                  {n.name}
                </text>
                <text x={14} y={48} fontSize={12.5} fill={accent} fontFamily="var(--font-jetmono), monospace">
                  {n.figure}
                </text>
                <text x={14} y={64} fontSize={9} letterSpacing={2} fill={NODE_TAG[accent] ?? accent} fontFamily="var(--font-jetmono), monospace">
                  {n.tag.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* info panel */}
      <div className="mt-4 min-h-[120px]">
        {shown !== null ? (
          <div className="ticker-fade rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-base font-semibold text-zinc-900">{nodes[shown].name}</h4>
              <span className="tnum font-mono text-sm text-blue-700">{nodes[shown].figure}</span>
              <Tag tone="slate">{nodes[shown].tag}</Tag>
            </div>
            <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-[13px] leading-relaxed text-zinc-600 sm:grid-cols-2">
              {nodes[shown].spec.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-400">
            {t.engineering.flow.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Balance table ────────────────────────────────────────────────────────── */
type FilterKey = 'all' | 'inputs' | 'outputs' | 'energy';
const KIND_OF_FILTER: Record<Exclude<FilterKey, 'all'>, string[]> = {
  inputs: ['input', 'inter'],
  outputs: ['output'],
  energy: ['energy'],
};

const KIND_DOT: Record<string, string> = {
  input: 'bg-sky-600',
  inter: 'bg-zinc-400',
  output: 'bg-blue-600',
  energy: 'bg-amber-600',
};

function BalanceTable() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterKey>('all');
  const rows = t.engineering.balance.rows.filter(
    (r) => filter === 'all' || KIND_OF_FILTER[filter].includes(r.kind),
  );
  const filters: FilterKey[] = ['all', 'inputs', 'outputs', 'energy'];
  const labels: Record<FilterKey, string> = {
    all: t.engineering.balance.filters.all,
    inputs: t.engineering.balance.filters.inputs,
    outputs: t.engineering.balance.filters.outputs,
    energy: t.engineering.balance.filters.energy,
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs transition-colors',
              filter === f
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800',
            )}
          >
            {labels[f]}
          </button>
        ))}
      </div>
      <div className="max-h-[420px] overflow-y-auto scroll-slim">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white">
              <th className="border-b border-zinc-200 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                {t.engineering.balance.cols.stream}
              </th>
              <th className="border-b border-zinc-200 px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                {t.engineering.balance.cols.rate}
              </th>
              <th className="hidden border-b border-zinc-200 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:table-cell sm:px-5">
                {t.engineering.balance.cols.note}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.stream} className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 sm:px-5">
                  <span className="flex items-center gap-2.5">
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', KIND_DOT[r.kind])} />
                    <span className="font-medium text-zinc-800">{r.stream}</span>
                  </span>
                </td>
                <td className="tnum px-4 py-3 text-right font-mono text-zinc-700 sm:px-5">{r.rate}</td>
                <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell sm:px-5">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

/* ── Equipment table ──────────────────────────────────────────────────────── */
function EquipmentTable() {
  const { t } = useI18n();
  return (
    <GlassCard className="overflow-hidden">
      <div className="max-h-[440px] overflow-y-auto scroll-slim">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white">
              <th className="border-b border-zinc-200 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                {t.engineering.equipment.cols.name}
              </th>
              <th className="border-b border-zinc-200 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                {t.engineering.equipment.cols.spec}
              </th>
              <th className="border-b border-zinc-200 px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                {t.engineering.equipment.cols.qty}
              </th>
            </tr>
          </thead>
          <tbody>
            {t.engineering.equipment.rows.map((r) => (
              <tr key={r.name} className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-800 sm:px-5">{r.name}</td>
                <td className="tnum px-4 py-3 font-mono text-xs text-zinc-500 sm:px-5">{r.spec}</td>
                <td className="tnum px-4 py-3 text-right font-mono text-zinc-700 sm:px-5">{r.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

/* ── Engineering view ─────────────────────────────────────────────────────── */
export default function EngineeringView() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <SectionHeader kicker={t.engineering.kicker} title={t.engineering.title} lead={t.engineering.lead} />

      {/* Equation */}
      <Reveal className="mt-10">
        <GlassCard className="p-6 sm:p-8">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-blue-700">{t.engineering.equation.title}</h3>
          <p className="mt-5 text-center font-mono text-2xl font-semibold tracking-wide text-zinc-900 sm:text-3xl">
            {t.engineering.equation.equation}
          </p>
          <p className="mt-3 text-center font-mono text-sm text-blue-600">{t.engineering.equation.heat}</p>
          <p className="mx-auto mt-5 max-w-2xl text-center text-[13px] leading-relaxed text-zinc-600">
            {t.engineering.equation.note}
          </p>
        </GlassCard>
      </Reveal>

      {/* Flow diagram */}
      <Reveal className="mt-14">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{t.engineering.flow.title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{t.engineering.flow.subtitle}</p>
        <div className="mt-5">
          <FlowDiagram />
        </div>
      </Reveal>

      {/* Balance */}
      <Reveal className="mt-14">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{t.engineering.balance.title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{t.engineering.balance.subtitle}</p>
        <div className="mt-5">
          <BalanceTable />
        </div>
      </Reveal>

      {/* Reactor */}
      <Reveal className="mt-14">
        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <Tag tone="emerald">{t.engineering.reactor.kicker}</Tag>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.engineering.reactor.title}</h3>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-600">{t.engineering.reactor.text}</p>
            <div className="mt-6">
              {t.engineering.reactor.specs.map((s) => (
                <SpecRow key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          </div>
          <figure className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
              <ReactorArt className="aspect-[4/3] w-full" />
            </div>
            <figcaption className="mt-3 text-center text-xs text-zinc-400">{t.engineering.reactor.imageCaption}</figcaption>
            <div className="mt-5 grid grid-cols-[120px_1fr] items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="h-28 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <CatalystArt className="h-full w-full" />
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">{t.engineering.catalystCaption}</p>
            </div>
          </figure>
        </div>
      </Reveal>

      {/* Heat integration — patent highlight */}
      <Reveal className="mt-14">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <Tag tone="gold">{t.engineering.heat.badge}</Tag>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.engineering.heat.title}</h3>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-[14px] leading-relaxed text-zinc-600">{t.engineering.heat.text}</p>
              <ul className="mt-5 space-y-3">
                {t.engineering.heat.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[13px] leading-relaxed text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center">
              <div className="tnum font-mono text-2xl text-zinc-400 line-through decoration-red-400">{t.engineering.heat.statBefore}</div>
              <div className="my-1 font-mono text-lg text-zinc-400">↓</div>
              <div className="tnum font-mono text-4xl font-bold text-blue-600">{t.engineering.heat.statAfter}</div>
              <div className="mt-2 text-xs text-zinc-500">{t.engineering.heat.statLabel}</div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Equipment */}
      <Reveal className="mt-14">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{t.engineering.equipment.title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{t.engineering.equipment.subtitle}</p>
        <div className="mt-5">
          <EquipmentTable />
        </div>
      </Reveal>
    </div>
  );
}
