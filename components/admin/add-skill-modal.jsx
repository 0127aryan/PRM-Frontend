'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SKILL_CATEGORIES } from '@/lib/admin/skill-display';
import * as adminService from '@/services/admin.service';

/**
 * @param {{ open: boolean, onClose: () => void, onCreated: () => void }} props
 */
export function AddSkillModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('FRONTEND');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setCategory('FRONTEND');
    setError('');
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Skill name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await adminService.createSkill({ name: trimmed, category });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create skill.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-skill-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 id="add-skill-title" className="text-lg font-bold text-slate-900">
            Add new skill
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div>
            <label
              htmlFor="skill-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Skill name
            </label>
            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GraphQL, Terraform"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="skill-category"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Category
            </label>
            <select
              id="skill-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                'Create skill'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
