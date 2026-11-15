'use client';

import dynamic from 'next/dynamic';

/**
 * All WebGL scenes are client-only dynamic imports — no SSR, no hydration
 * mismatch, and zero JS work before the component is actually used.
 */

export const HeroArt = dynamic(() => import('./scenes').then((m) => m.HeroArt), {
  ssr: false,
  loading: () => null,
});

export const PipelineArt = dynamic(() => import('./scenes').then((m) => m.PipelineArt), {
  ssr: false,
  loading: () => null,
});

export const ElectrolyzerArt = dynamic(() => import('./scenes').then((m) => m.ElectrolyzerArt), {
  ssr: false,
  loading: () => null,
});

export const ReactorArt = dynamic(() => import('./scenes').then((m) => m.ReactorArt), {
  ssr: false,
  loading: () => null,
});

export const CatalystArt = dynamic(() => import('./scenes').then((m) => m.CatalystArt), {
  ssr: false,
  loading: () => null,
});

export const VaultArt = dynamic(() => import('./scenes').then((m) => m.VaultArt), {
  ssr: false,
  loading: () => null,
});
