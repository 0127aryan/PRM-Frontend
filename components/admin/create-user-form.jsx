'use client';

import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const inputClass =
  'w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100';

/**
 * @param {{ managers: Array<{ id: number, fullName: string, employeeCode: string }>, skills: Array<{ id: number, name: string }>, onCreated: () => void }} props
 */
export function CreateUserForm({ managers, skills, onCreated }) {
  const [role, setRole] = useState('EMPLOYEE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [skillRows, setSkillRows] = useState([
    { skillId: '', proficiency: 'BEGINNER' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const isEmployee = role === 'EMPLOYEE';

  const managerOptions = useMemo(
    () =>
      managers.map((m) => ({
        id: m.id,
        label: `${m.fullName} (${m.employeeCode})`,
      })),
    [managers],
  );

  function addSkillRow() {
    setSkillRows((rows) => [...rows, { skillId: '', proficiency: 'BEGINNER' }]);
  }

  function removeSkillRow(index) {
    setSkillRows((rows) => rows.filter((_, i) => i !== index));
  }

  function updateSkillRow(index, field, value) {
    setSkillRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function resetForm() {
    setFullName('');
    setEmail('');
    setEmployeeCode('');
    setDepartment('');
    setDesignation('');
    setReportingManagerId('');
    setSkillRows([{ skillId: '', proficiency: 'BEGINNER' }]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess(null);

    if (!email.trim() || !fullName.trim() || !employeeCode.trim()) {
      setError('Email, full name, and employee ID are required.');
      return;
    }
    if (!department.trim() || !designation.trim()) {
      setError('Department and designation are required.');
      return;
    }
    if (isEmployee && !reportingManagerId) {
      setError('Select a reporting manager for employees.');
      return;
    }

    setLoading(true);
    try {
      const userRes = await adminService.createUser({
        email: email.trim(),
        role,
      });

      const skillsPayload = isEmployee
        ? skillRows
            .filter((r) => r.skillId)
            .map((r) => ({
              skillId: Number(r.skillId),
              proficiency: r.proficiency,
            }))
        : undefined;

      await adminService.createEmployee({
        userId: userRes.user.id,
        employeeCode: employeeCode.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim(),
        designation: designation.trim(),
        reportingManagerId: isEmployee
          ? Number(reportingManagerId)
          : undefined,
        skills: skillsPayload?.length ? skillsPayload : undefined,
      });

      setSuccess({
        message: 'Invitation ready — share the set-password link with the user.',
        setupUrl: userRes.setupUrl,
      });
      resetForm();
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="sticky top-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
      <div className="mb-6 flex items-center gap-2 text-slate-900">
        <UserPlus className="h-5 w-5" aria-hidden />
        <h3 className="text-lg font-semibold">Create new user</h3>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Work email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={inputClass}
          />
          <p className="text-xs text-slate-500">
            User will receive a link to set their password (no password field here).
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Full name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Jonathan Doe"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employee ID
            </label>
            <input
              type="text"
              required
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="EMP-001"
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Department
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Designation
          </label>
          <input
            type="text"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Senior Engineer"
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role
          </span>
          <div className="mt-2 flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                checked={role === 'MANAGER'}
                onChange={() => setRole('MANAGER')}
                className="text-slate-900"
              />
              Manager
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                checked={role === 'EMPLOYEE'}
                onChange={() => setRole('EMPLOYEE')}
                className="text-slate-900"
              />
              Employee
            </label>
          </div>
        </div>

        {isEmployee ? (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reporting manager
              </label>
              <select
                required
                value={reportingManagerId}
                onChange={(e) => setReportingManagerId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select manager…</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Skills & proficiency
                </label>
                <button
                  type="button"
                  onClick={addSkillRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-slate-900 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              {skillRows.map((row, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={row.skillId}
                    onChange={(e) =>
                      updateSkillRow(index, 'skillId', e.target.value)
                    }
                    className={cn(inputClass, 'flex-1')}
                  >
                    <option value="">Skill…</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.proficiency}
                    onChange={(e) =>
                      updateSkillRow(index, 'proficiency', e.target.value)
                    }
                    className={cn(inputClass, 'w-32')}
                  >
                    {PROFICIENCY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {skillRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSkillRow(index)}
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                      aria-label="Remove skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
            <p className="font-medium">{success.message}</p>
            <p className="mt-2 break-all font-mono text-xs">{success.setupUrl}</p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold underline"
              onClick={() => navigator.clipboard.writeText(success.setupUrl)}
            >
              Copy setup page link
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating…
            </>
          ) : (
            'Create user'
          )}
        </button>
      </form>
    </section>
  );
}
