'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Lock, Workflow, Landmark, Languages } from 'lucide-react';
import { LanguageProvider, useI18n } from '@/lib/i18n';
import { LANGS, type View } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import OverviewView from './views/Overview';
import EngineeringView from './views/Engineering';
import LegalView from './views/Legal';

/* ── Data Room dialog context ─────────────────────────────────────────────── */
const DataRoomCtx = createContext<{ open: () => void }>({ open: () => {} });
export const useDataRoom = () => useContext(DataRoomCtx);

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border border-zinc-200 bg-white p-0.5"
    >
      <Languages className="mx-1.5 h-3.5 w-3.5 text-zinc-400" aria-hidden />
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`relative rounded-full px-3 py-1 font-mono text-[11px] tracking-wide transition-colors ${
              active ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-zinc-900"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RequestAccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<string>('');

  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onOpenChange(false);
    setName('');
    setOrg('');
    setEmail('');
    setType('');
    toast({ description: t.dialog.success });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-xl shadow-zinc-900/10 sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-zinc-900">
            <Lock className="h-4 w-4 text-blue-600" aria-hidden />
            {t.dialog.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">{t.dialog.subtitle}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 pt-1" onSubmit={submit}>
          <div className="grid gap-1.5">
            <Label htmlFor="dd-name" className="text-xs text-zinc-500">{t.dialog.fields.name}</Label>
            <Input
              id="dd-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-blue-300"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dd-org" className="text-xs text-zinc-500">{t.dialog.fields.org}</Label>
            <Input
              id="dd-org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-blue-300"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dd-email" className="text-xs text-zinc-500">{t.dialog.fields.email}</Label>
            <Input
              id="dd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-blue-300"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-zinc-500">{t.dialog.fields.type}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full border-zinc-200 bg-white text-zinc-900 focus-visible:ring-blue-300">
                <SelectValue placeholder={t.dialog.fields.type} />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white text-zinc-900">
                {t.dialog.fields.types.map((x) => (
                  <SelectItem key={x} value={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={!valid}
            className="mt-1 w-full rounded-full bg-blue-600 font-medium text-white hover:bg-blue-500"
          >
            {t.dialog.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const NAV: { view: View; labelKey: 'overview' | 'engineering' | 'legal'; icon: React.ElementType }[] = [
  { view: 'overview', labelKey: 'overview', icon: Landmark },
  { view: 'engineering', labelKey: 'engineering', icon: Workflow },
  { view: 'legal', labelKey: 'legal', icon: FileText },
];

function Shell() {
  const { t, view, setView } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const ctx = useMemo(() => ({ open: openDialog }), [openDialog]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  return (
    <DataRoomCtx.Provider value={ctx}>
      <div className="flex min-h-screen flex-col bg-white text-zinc-900">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setView('overview')}
              className="text-left"
            >
              <span>
                <span className="block font-mono text-sm font-semibold tracking-[0.18em] text-zinc-900">
                  E-METHANE-100
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {t.meta.subtitle}
                </span>
              </span>
            </button>

            <nav aria-label="Main" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto scroll-slim sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center">
              {NAV.map(({ view: v, labelKey, icon: Icon }) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[13px] transition-colors ${
                      active ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {t.nav[labelKey]}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-zinc-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <LangSwitcher />
              <Button
                onClick={openDialog}
                size="sm"
                className="hidden rounded-full bg-blue-600 text-white shadow-none hover:bg-blue-500 sm:inline-flex"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {t.nav.cta}
              </Button>
            </div>
          </div>
        </header>

        {/* ── Views ──────────────────────────────────────────────────────── */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {view === 'overview' && <OverviewView />}
              {view === 'engineering' && <EngineeringView />}
              {view === 'legal' && <LegalView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="mt-auto border-t border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-zinc-400">{t.footer.rights}</p>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-zinc-400">{t.footer.disclaimer}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <Lock className="h-3 w-3" aria-hidden />
              {t.meta.confidential}
            </div>
          </div>
        </footer>

        <RequestAccessDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </DataRoomCtx.Provider>
  );
}

export default function Portal() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  );
}
