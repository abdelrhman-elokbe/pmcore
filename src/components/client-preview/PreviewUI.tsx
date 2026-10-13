import type { CSSProperties, ReactNode } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { downloadCsv } from './budget';

export type CsvSpec = { name: string; rows: () => (string | number)[][] };

export function CpButton({ className, variant: _variant, tone = 'outline', ...props }: ButtonProps & { tone?: 'outline' | 'purple' | 'teal' | 'grey' | 'ghost' }) {
  return <Button variant="ghost" className={cn('cp-button', `cp-button-${tone}`, className)} {...props} />;
}
export function ExportButton({ enabled = true, teal = false, label = 'Export', csv }: { enabled?: boolean; teal?: boolean; label?: string; csv?: CsvSpec }) {
  if (!enabled) return null;
  return <CpButton tone={teal ? 'teal' : 'grey'} onClick={() => { if (csv) { downloadCsv(csv.name, csv.rows()); toast.success(`${csv.name} downloaded`); } else toast.success('Export generated (preview)'); }}><Download />{label}</CpButton>;
}
export function Badge({ children, tone = 'teal' }: { children: ReactNode; tone?: string }) {
  return <span className={cn('cp-badge', `cp-badge-${tone}`)}>{children}</span>;
}
export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={cn('cp-person-avatar', small && 'cp-person-avatar-small')}>{name.split(' ').slice(0, 2).map((x) => x[0]).join('')}</span>;
}
export function Person({ name, role = 'Project Manager' }: { name: string; role?: string }) {
  return <div className="cp-person"><Avatar name={name} /><div><span>{name}</span><small>{role}</small></div></div>;
}
export function Progress({ value, purple = false }: { value: number; purple?: boolean }) {
  return <div className="cp-progress"><span className={purple ? 'cp-progress-purple' : ''} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
export function Ring({ value, total, tone = 'teal', size = 62, children }: { value: number; total: number; tone?: string; size?: number; children?: ReactNode }) {
  const percent = total ? Math.min(100, value / total * 100) : 0;
  return <div className={cn('cp-ring', `cp-ring-${tone}`)} style={{ '--ring-size': `${size}px` } as CSSProperties}><svg viewBox="0 0 80 80" aria-label={`${Math.round(percent)}%`}><circle className="cp-ring-track" cx="40" cy="40" r="33" /><circle className="cp-ring-value" cx="40" cy="40" r="33" pathLength="100" strokeDasharray={`${percent} 100`} transform="rotate(-90 40 40)" /></svg><div>{children ?? <strong>{Math.round(percent)}%</strong>}</div></div>;
}
export function Section({ title, children, exportable = false, csv }: { title: string; children: ReactNode; exportable?: boolean; csv?: CsvSpec }) {
  return <section className="cp-section"><div className="cp-section-title"><h2>{title}</h2><ExportButton enabled={exportable} {...(csv ? { csv } : {})} /></div>{children}</section>;
}
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <label className="cp-switch-label"><CpButton role="switch" aria-label={label} aria-checked={checked} className={cn('cp-switch', checked && 'cp-switch-on')} onClick={() => onChange(!checked)}><span /></CpButton>{label}</label>;
}
