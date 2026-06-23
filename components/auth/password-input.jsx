'use client';

import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * @param {{ id: string, label: string, value: string, onChange: (v: string) => void, icon?: 'lock' | 'shield', strengthLabel?: string, strengthColor?: string }} props
 */
export function PasswordInput({
  id,
  label,
  value,
  onChange,
  icon = 'lock',
  strengthLabel,
  strengthColor,
}) {
  const [visible, setVisible] = useState(false);
  const Icon = icon === 'shield' ? ShieldCheck : Lock;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        <span>{label}</span>
        {strengthLabel ? (
          <span className={cn('normal-case transition-opacity', strengthColor)}>
            {strengthLabel}
          </span>
        ) : null}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="block w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-900"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
