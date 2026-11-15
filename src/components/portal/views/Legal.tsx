'use client';

import React from 'react';
import { FolderLock, KeyRound, Lock, Percent, Scale, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDataRoom } from '@/components/portal/Portal';
import { GlassCard, Kicker, Reveal, RichText, SectionHeader, SpecRow, Tag } from '@/components/portal/ui';
import { VaultArt } from '@/components/portal/three/lazy';

/* ── Risk register table ──────────────────────────────────────────────────── */
function RiskTable() {
  const { t } = useI18n();
  return (
    <GlassCard className="overflow-hidden">
      <div className="max-h-[520px] overflow-y-auto scroll-slim">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white">
              {(['risk', 'impact', 'mitigation'] as const).map((k) => (
                <th key={k} className="border-b border-zinc-200 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-5">
                  {t.legal.risks.cols[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.legal.risks.rows.map((r) => (
              <tr key={r.risk} className="border-b border-zinc-100 align-top transition-colors last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-4 font-medium text-zinc-800 sm:px-5">{r.risk}</td>
                <td className="px-4 py-4 text-zinc-600 sm:px-5">{r.impact}</td>
                <td className="px-4 py-4 text-blue-700 sm:px-5">{r.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

/* ── Discount rate comparison ─────────────────────────────────────────────── */
function DiscountCompare() {
  const { t } = useI18n();
  const bars = [
    { label: t.legal.discount.us, min: 15, max: 15, tone: 'emerald' as const },
    { label: t.legal.discount.peers, min: 20, max: 25, tone: 'slate' as const },
  ];
  const scaleMax = 25;
  return (
    <div className="space-y-5">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
            <span className={b.tone === 'emerald' ? 'font-medium text-blue-700' : 'text-zinc-500'}>{b.label}</span>
            <span className={`tnum font-mono ${b.tone === 'emerald' ? 'text-blue-700' : 'text-zinc-400'}`}>
              {b.min === b.max ? `${b.min}%` : `${b.min}–${b.max}%`}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full ${b.tone === 'emerald' ? 'bg-blue-600' : 'bg-zinc-300'}`}
              style={{ width: `${(b.max / scaleMax) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs leading-relaxed text-zinc-500">{t.legal.discount.kicker} · TRL 8</p>
    </div>
  );
}

/* ── Legal view ───────────────────────────────────────────────────────────── */
export default function LegalView() {
  const { t } = useI18n();
  const { open } = useDataRoom();

  return (
    <div>
      {/* banner */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionHeader kicker={t.legal.kicker} title={t.legal.title} lead={t.legal.lead} tone="gold" className="min-w-0" />
          <Reveal delay={0.1} className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
              <VaultArt className="h-[260px] w-full sm:h-[300px]" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Valuation */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal>
          <GlassCard className="p-6 sm:p-8">
            <Kicker tone="gold">{t.legal.valuation.kicker}</Kicker>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{t.legal.valuation.title}</h2>
                <div className="tnum mt-6 font-mono text-4xl font-bold tracking-tight text-blue-600 sm:text-5xl">
                  {t.legal.valuation.range}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-400">{t.legal.valuation.rangeLabel}</p>
                <p className="mt-6 font-mono text-xs leading-relaxed text-blue-700">{t.legal.valuation.family}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-zinc-600">
                  <RichText text={t.legal.valuation.text} keys={['npv', 'discount']} />
                </p>
              </div>
              <div className="space-y-3">
                {t.legal.valuation.cards.map((c, i) => (
                  <div
                    key={c.name}
                    className={`rounded-xl border p-4 ${i === 0 ? 'border-blue-300 bg-blue-50' : 'border-zinc-200 bg-white'}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-800">{c.name}</h3>
                      <span className={`tnum font-mono text-sm ${i === 0 ? 'text-blue-600' : 'text-blue-700'}`}>{c.value}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* Licensing */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
              <KeyRound className="h-5 w-5 text-zinc-700" aria-hidden />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.legal.licensing.title}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-600">
              <RichText text={t.legal.licensing.text} keys={['royalty', 'discount', 'trl']} />
            </p>
            <p className="mt-4 text-xs leading-relaxed text-amber-700">{t.legal.licensing.termNote}</p>
          </Reveal>
          <Reveal delay={0.1} className="min-w-0">
            <GlassCard className="p-6">
              <Kicker>{t.legal.licensing.kicker}</Kicker>
              <div className="mt-4">
                {t.legal.licensing.rows.map((r) => (
                  <SpecRow key={r.param} label={r.param} value={r.value} />
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* Risks */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal className="mb-8 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
            <ShieldAlert className="h-5 w-5 text-zinc-700" aria-hidden />
          </div>
          <div>
            <Kicker tone="gold">{t.legal.risks.kicker}</Kicker>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.legal.risks.title}</h2>
          </div>
        </Reveal>
        <Reveal>
          <RiskTable />
        </Reveal>
      </section>

      {/* Discount rate justification */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <Reveal>
          <GlassCard className="p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                    <Percent className="h-5 w-5 text-blue-600" aria-hidden />
                  </div>
                  <div>
                    <Kicker>{t.legal.discount.kicker}</Kicker>
                    <h2 className="mt-1.5 text-lg font-semibold text-zinc-900 sm:text-xl">{t.legal.discount.title}</h2>
                  </div>
                </div>
                <p className="mt-5 text-[14px] leading-relaxed text-zinc-600">
                  <RichText text={t.legal.discount.text} keys={['trl']} />
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-6">
                <DiscountCompare />
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* Data room */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-28">
        <Reveal className="mb-8 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
            <FolderLock className="h-5 w-5 text-zinc-700" aria-hidden />
          </div>
          <div>
            <Kicker tone="gold">{t.legal.dataroom.kicker}</Kicker>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{t.legal.dataroom.title}</h2>
            <p className="mt-2 text-sm text-zinc-500">{t.legal.dataroom.subtitle}</p>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.legal.dataroom.docs.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.06}>
              <div className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-blue-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                    <Lock className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-blue-600" aria-hidden />
                  </div>
                  <Tag>{d.tag}</Tag>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-zinc-800">{d.name}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{d.meta}</p>
                <button
                  type="button"
                  onClick={open}
                  className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <Lock className="h-3 w-3" aria-hidden />
                  {t.legal.dataroom.requestCta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
              <p className="max-w-xl text-xs leading-relaxed text-zinc-500">{t.legal.dataroom.note}</p>
            </div>
            <button
              type="button"
              onClick={open}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              {t.nav.cta}
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
