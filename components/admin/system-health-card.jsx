'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Loader2,
  Server,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { formatTimeLocal } from '@/lib/format';
import { cn } from '@/lib/utils';
import * as healthService from '@/services/health.service';

function overallStatus(health) {
  if (!health) return { label: 'Checking…', tone: 'slate' };
  if (health.database === 'down') return { label: 'Down', tone: 'red' };
  if (health.status === 'degraded' || health.api !== 'up') {
    return { label: 'Degraded', tone: 'amber' };
  }
  return { label: 'Healthy', tone: 'emerald' };
}

const tonePill = {
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  slate: 'bg-slate-100 text-slate-600',
};

const toneDot = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
};

export function SystemHealthCard() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await healthService.getHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Health check failed');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const overall = overallStatus(health);
  const lastChecked = health?.timestamp
    ? formatTimeLocal(health.timestamp)
    : '—';

  return (
    <div className="relative col-span-12 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
      <Server
        className="pointer-events-none absolute right-4 top-4 h-28 w-28 text-slate-100"
        aria-hidden
      />

      <div className="relative z-10 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            System health monitoring
          </h4>
          <p className="text-sm text-slate-500">
            Real-time status of API and database
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase',
            tonePill[overall.tone],
          )}
        >
          <span
            className={cn('h-2 w-2 rounded-full', toneDot[overall.tone], {
              'animate-pulse': overall.tone === 'emerald',
            })}
          />
          {overall.label}
        </div>
      </div>

      {loading && !health ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking health…
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="relative z-10 grid gap-6 md:grid-cols-3">
        <HealthTile
          label="API status"
          value={health?.api === 'up' ? 'Up' : health?.api ?? '—'}
          ok={health?.api === 'up'}
          icon={CheckCircle2}
        />
        <HealthTile
          label="Database status"
          value={
            health?.database === 'up'
              ? 'Operational'
              : health?.database === 'down'
                ? 'Down'
                : '—'
          }
          ok={health?.database === 'up'}
          icon={Database}
          detail={health?.environment ? `Env: ${health.environment}` : undefined}
        />
        <HealthTile
          label="Last checked"
          value={lastChecked}
          icon={Clock}
          detail={
            health?.timestamp
              ? new Date(health.timestamp).toLocaleString()
              : 'Refreshes every 60s'
          }
        />
      </div>
    </div>
  );
}

function HealthTile({ label, value, ok, icon: Icon, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <Icon
          className={cn(
            'h-5 w-5',
            ok === true
              ? 'text-emerald-600'
              : ok === false
                ? 'text-red-600'
                : 'text-slate-400',
          )}
          aria-hidden
        />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {detail ? (
        <p className="mt-2 text-[11px] text-slate-500">{detail}</p>
      ) : null}
      {ok === false ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Needs attention
        </p>
      ) : null}
    </div>
  );
}
