'use client';

import {
  Bot,
  Info,
  Loader2,
  Plus,
  Tag,
  Timer,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

const CONFIG_KEYS = {
  maxWeeklyHours: 'max_weekly_hours',
  schedulerIntervalHours: 'scheduler_interval_hours',
  matchingMode: 'matching_mode',
  llmProvider: 'llm_provider',
  llmApiKey: 'llm_api_key',
};

const MATCHING_OPTIONS = [
  { value: 'keyword', label: 'Keyword (rules)' },
  { value: 'llm', label: 'LLM (when enabled)' },
];

const LLM_PROVIDERS = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
];

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const [maxWeeklyHours, setMaxWeeklyHours] = useState('40');
  const [schedulerHours, setSchedulerHours] = useState('4');
  const [matchingMode, setMatchingMode] = useState('keyword');
  const [llmProvider, setLlmProvider] = useState('gemini');
  const [llmApiKey, setLlmApiKey] = useState('');

  const initial = useMemo(() => ({ ...config }), [config]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cfg, tagList] = await Promise.all([
        adminService.getSettingsConfig(),
        adminService.listActivityTags(),
      ]);
      setConfig(cfg);
      setTags(tagList);
      setMaxWeeklyHours(cfg[CONFIG_KEYS.maxWeeklyHours] ?? '40');
      setSchedulerHours(cfg[CONFIG_KEYS.schedulerIntervalHours] ?? '4');
      setMatchingMode(cfg[CONFIG_KEYS.matchingMode] ?? 'keyword');
      setLlmProvider(cfg[CONFIG_KEYS.llmProvider] ?? 'gemini');
      setLlmApiKey(cfg[CONFIG_KEYS.llmApiKey] ?? '');
    } catch (err) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setMaxWeeklyHours(initial[CONFIG_KEYS.maxWeeklyHours] ?? '40');
    setSchedulerHours(initial[CONFIG_KEYS.schedulerIntervalHours] ?? '4');
    setMatchingMode(initial[CONFIG_KEYS.matchingMode] ?? 'keyword');
    setLlmProvider(initial[CONFIG_KEYS.llmProvider] ?? 'gemini');
    setLlmApiKey(initial[CONFIG_KEYS.llmApiKey] ?? '');
    setMessage('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const hours = Number(maxWeeklyHours);
      const interval = Number(schedulerHours);
      if (Number.isNaN(hours) || hours < 20 || hours > 80) {
        setError('Max weekly hours must be between 20 and 80.');
        return;
      }
      if (Number.isNaN(interval) || interval < 1 || interval > 168) {
        setError('Scheduler interval must be between 1 and 168 hours.');
        return;
      }
      await adminService.patchSettingsConfig({
        [CONFIG_KEYS.maxWeeklyHours]: String(hours),
        [CONFIG_KEYS.schedulerIntervalHours]: String(interval),
        [CONFIG_KEYS.matchingMode]: matchingMode,
        [CONFIG_KEYS.llmProvider]: llmProvider,
        [CONFIG_KEYS.llmApiKey]: llmApiKey,
      });
      setMessage('Settings saved successfully.');
      await load();
    } catch (err) {
      setError(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTag(e) {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    setAddingTag(true);
    setError('');
    try {
      await adminService.createActivityTag({ name });
      setNewTagName('');
      await load();
      setMessage('Activity tag added.');
    } catch (err) {
      setError(err.message || 'Could not add tag.');
    } finally {
      setAddingTag(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading system configuration…
      </div>
    );
  }

  const activeTags = tags.filter((t) => t.isActive !== false);

  return (
    <form onSubmit={handleSave} className="p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            System configuration
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Operational parameters, matching mode, and timesheet activity tags.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Cancel changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="rounded-lg border border-slate-200 bg-white p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-900 text-white">
                <Bot className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  LLM provider settings
                </h4>
                <p className="text-sm text-slate-500">
                  Used when matching mode is set to LLM (Phase 9).
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Field label="Provider selection">
                <select
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                  className={inputClass}
                >
                  {LLM_PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="API access key">
                <input
                  type="password"
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className={cn(inputClass, 'font-mono text-xs')}
                  autoComplete="off"
                />
              </Field>
              <Field label="Matching mode" className="md:col-span-2">
                <select
                  value={matchingMode}
                  onChange={(e) => setMatchingMode(e.target.value)}
                  className={inputClass}
                >
                  {MATCHING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-900 text-white">
                <Tag className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  Activity taxonomy
                </h4>
                <p className="text-sm text-slate-500">
                  Tags employees pick on weekly timesheets.
                </p>
              </div>
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Active activity tags
            </p>
            <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
              {activeTags.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No tags yet. Add tags below or run database reference SQL.
                </p>
              ) : (
                activeTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white"
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
                className={cn(inputClass, 'max-w-xs flex-1')}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={addingTag || !newTagName.trim()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add tag
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section className="rounded-lg border border-slate-200 bg-white p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-900">
                <Timer className="h-5 w-5" aria-hidden />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">
                Engine params
              </h4>
            </div>
            <div className="space-y-6">
              <Field label="Scheduler interval (hours)">
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={schedulerHours}
                  onChange={(e) => setSchedulerHours(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  How often background jobs run (hours).
                </p>
              </Field>
              <Field label="Max weekly hours">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={maxWeeklyHours}
                    onChange={(e) => setMaxWeeklyHours(e.target.value)}
                    className="h-1.5 flex-1 cursor-pointer accent-slate-900"
                  />
                  <span className="min-w-[2.5rem] rounded bg-slate-100 px-3 py-1 text-center font-mono text-sm font-bold text-slate-900">
                    {maxWeeklyHours}
                  </span>
                </div>
              </Field>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-lg bg-slate-900 p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Configuration
            </p>
            <h4 className="mt-2 text-lg font-semibold">
              {Object.keys(config).length} keys loaded
            </h4>
            <p className="mt-4 text-sm text-slate-300">
              Values are stored in <code className="text-slate-200">system_config</code>{' '}
              and used by the scheduler and timesheet validation.
            </p>
          </section>

          <div className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <Info className="h-5 w-5 shrink-0 text-slate-900" aria-hidden />
            <p className="text-sm leading-relaxed text-slate-600">
              Changes to LLM provider and scheduler interval may require a backend
              restart for long-running workers to pick up new values.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10';

function Field({ label, children, className }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
