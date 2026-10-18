import { useState } from 'react';
import { Check, Lock, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createProject } from './actions';
import { buildPhases, fireEvent, fmtMoney, mandatoryTools, phaseTemplates, type PreviewConfig, type ProjectPhase } from './engine';
import { BUDGET_Q, BUDGET_REASON, PLANNING_STEP, missingProposalFields, proposalFields } from './projectModel';
import { CURRENCIES } from './currency';
import { clearBudget, hasAnyBudget, nonBudgetedAllowed, phaseBudgetError } from './budget';
import { Badge, CpButton } from './PreviewUI';

export function ProposalWizard({ cfg, tenantId, close, done }: { cfg: PreviewConfig; tenantId: string; close: () => void; done: (id: string) => void }) {
  const [step,setStep] = useState(0); const [values,setValues] = useState<Record<string,string>>({}); const [confidential,setConfidential] = useState(false);
  const [phases,setPhases] = useState<ProjectPhase[]>([]); const [confirmNo,setConfirmNo] = useState(false);
  const set = (key:string,value:string) => setValues((v) => ({...v,[key]:value}));
  const attach = mandatoryTools(cfg,values['Category'] ?? '',values['Type'] ?? '');
  const steps = ['Project Profile','Ownership & Strategic Alignment','Project Planning','Risks and Benefits','Review & Submit'];
  const review = steps.length-1;
  const asked = nonBudgetedAllowed(cfg, values['Type'] ?? '');
  const applicability = asked ? (values[BUDGET_Q] as 'Budgeted'|'NotBudgeted'|undefined) ?? null : 'Budgeted';
  const notBudgeted = applicability === 'NotBudgeted';
  const budget = notBudgeted || !values['Budget'] ? null : Number(values['Budget']);
  const phaseError = phaseBudgetError(applicability, budget ?? 0, phases);
  const reasons = cfg.lookups['no-budget-reasons'].filter((x)=>x.active);
  const currency = values['Currency'] || cfg.tenant.currency;
  const money = (n:number) => fmtMoney(n,currency,cfg.branding.numberFormat);
  const blockers = (s?:number) => {const m=missingProposalFields(cfg,values,s);if((s===undefined||s===PLANNING_STEP)&&phaseError)m.push(phaseError);return m;};
  const next = () => {const missing=blockers(step);if(missing.length) {toast.error(`Required: ${missing.join(', ')}`);return;}setStep(step+1);};
  const answer = (v:'Budgeted'|'NotBudgeted') => {
    if (v==='NotBudgeted' && values[BUDGET_Q]!=='NotBudgeted' && hasAnyBudget(values['Budget'] ? Number(values['Budget']) : null, phases)) { setConfirmNo(true); return; }
    set(BUDGET_Q,v); if (v==='NotBudgeted') setPhases((p)=>clearBudget({budget:null,phases:p}).phases);
  };
  const confirmClear = () => {const cleared=clearBudget({budget:null,phases});setPhases(cleared.phases);setValues((v)=>({...v,[BUDGET_Q]:'NotBudgeted',Budget:''}));setConfirmNo(false);};
  const patchPhase = (id:string, patch:Partial<ProjectPhase>) => setPhases((all)=>all.map((ph)=>ph.id===id?{...ph,...patch}:ph));
  const submit = () => {const stage=cfg.stages[0];if(!stage)return; const missing=blockers();if(missing.length){toast.error(`Required: ${missing.join(', ')}`);return;}
    const id=crypto.randomUUID();const at=new Date().toISOString();
    const profile = Object.fromEntries(Object.entries(values).filter(([k])=>k!==BUDGET_Q&&k!==BUDGET_REASON&&!(notBudgeted&&k==='Budget')));
    createProject(tenantId,{id,code:`${cfg.tenant.code}-PRJ-${Date.now().toString().slice(-5)}`,name:values['Project name'] || 'Untitled',description:values['Description'] || '',category:values['Category'] || '',type:values['Type'] || '',source:values['Source'] || '',benefitType:values['Benefits'] || '',entity:values['department'] || '',department:values['department'] || '',sponsor:values['sponsor'] || '',profile,budget:notBudgeted?null:budget,...(!notBudgeted&&currency!==cfg.tenant.currency?{currency}:{}),budgetApplicability:applicability,...(notBudgeted&&values[BUDGET_REASON]?{noBudgetReason:values[BUDGET_REASON]}:{}),phases:notBudgeted?clearBudget({budget:null,phases}).phases:phases,pm:'Youness Zahir',confidential,stageId:stage.id,status:'In progress',health:100,approval:null,tools:attach.attach,createdAt:at,history:[{at,role:'Project Manager',text:`${cfg.intake} created in ${stage.label}`}]});
    fireEvent(tenantId,stage,'Stage entered',{project:values['Project name'] || 'Untitled',actor:'Project Manager'}).forEach((n)=>toast('Notification fired',{description:`${n.text} — ${n.rule}`}));
    toast.success(cfg.intake === 'Proposal' ? 'Project proposal submitted' : `${cfg.intake} submitted`);done(id);
  };
  const fieldEl = (f:(typeof proposalFields)[number]) => {const options='lookup' in f ? cfg.lookups[f.lookup].filter((x)=>x.active) : null;return <label key={f.key} className={f.key==='Description' ? 'cp-field-wide' : ''}>{f.label}{cfg.proposal.required[f.key] && <span> *</span>}{options ? <select aria-label={f.label} required={cfg.proposal.required[f.key]} value={values[f.key] || ''} onChange={(e)=>set(f.key,e.target.value)}><option value="">Select…</option>{options.map((o)=><option key={o.id}>{o.name}</option>)}</select> : f.key==='Description' ? <textarea aria-label={f.label} value={values[f.key] || ''} onChange={(e)=>set(f.key,e.target.value)} /> : <input aria-label={f.label} type={f.key==='Budget' ? 'number':'text'} min={0} value={values[f.key] || ''} onChange={(e)=>set(f.key,e.target.value)} />}</label>;};
  const planning = <div className="cp-form-grid">
    {asked && <fieldset className="cp-field-wide cp-radio-group"><legend>Does this project have a dedicated budget?<span> *</span></legend>{([['Budgeted','Yes'],['NotBudgeted','No']] as const).map(([v,l])=><label key={v} className="cp-checkbox"><input type="radio" name="budget-applicability" checked={values[BUDGET_Q]===v} onChange={()=>answer(v)} />{l}</label>)}</fieldset>}
    {!notBudgeted && (!asked || values[BUDGET_Q]==='Budgeted') && <label>Currency<select aria-label="Currency" value={currency} onChange={(e)=>set('Currency',e.target.value)}>{CURRENCIES.map((c)=><option key={c}>{c}</option>)}</select></label>}
    {!notBudgeted && (!asked || values[BUDGET_Q]==='Budgeted') && <label>Project Budget ({currency}){cfg.proposal.required['Budget'] && <span> *</span>}<input aria-label="Project Budget" type="number" min={0} value={values['Budget'] || ''} onChange={(e)=>set('Budget',e.target.value)} /></label>}
    {notBudgeted && <label>Reason<span> *</span><select aria-label="No-budget reason" value={values[BUDGET_REASON] || ''} onChange={(e)=>set(BUDGET_REASON,e.target.value)}><option value="">Select…</option>{reasons.map((r)=><option key={r.id}>{r.name}</option>)}</select></label>}
    <div className="cp-field-wide cp-phases-editor"><div className="cp-section-title"><h3>Phases</h3><div className="cp-actions"><CpButton onClick={()=>setPhases((all)=>[...all,{id:`ph-${Date.now()}`,name:`Phase ${all.length+1}`,start:'',end:'',...(notBudgeted?{}:{budget:null})}])}><Plus />Add phase</CpButton><select aria-label="Use template" value="" onChange={(e)=>{const tpl=phaseTemplates.find((t)=>t.id===e.target.value);if(tpl)setPhases(buildPhases(tpl,new Date().toISOString().slice(0,10),notBudgeted?null:budget,`ph${Date.now()}`));}}><option value="">Use template…</option>{phaseTemplates.map((t)=><option key={t.id} value={t.id}>{t.label}: {t.phases.map((p)=>p.name).join(', ')}</option>)}</select></div></div>
      {phases.length===0 ? <p className="cp-muted-note">No phases yet — add one or use a template.</p> : <table className="cp-simple-table"><thead><tr><th>Name</th><th>Start</th><th>End</th>{!notBudgeted&&<th>Budget</th>}<th /></tr></thead><tbody>{phases.map((ph)=><tr key={ph.id}><td><input aria-label="Phase name" value={ph.name} onChange={(e)=>patchPhase(ph.id,{name:e.target.value})} /></td><td><input aria-label="Phase start" type="date" value={ph.start} onChange={(e)=>patchPhase(ph.id,{start:e.target.value})} /></td><td><input aria-label="Phase end" type="date" value={ph.end} onChange={(e)=>patchPhase(ph.id,{end:e.target.value})} /></td>{!notBudgeted&&<td><input aria-label="Phase budget" type="number" min={0} value={ph.budget ?? ''} onChange={(e)=>patchPhase(ph.id,{budget:e.target.value===''?null:Number(e.target.value)})} /></td>}<td><CpButton tone="ghost" size="icon" aria-label="Remove phase" onClick={()=>setPhases((all)=>all.filter((x)=>x.id!==ph.id))}><Trash2 /></CpButton></td></tr>)}</tbody></table>}
      {phaseError && <p className="cp-inline-error" role="alert">{phaseError}</p>}
    </div>
  </div>;
  const reviewBody = <div className="cp-review"><dl>{Object.entries(values).filter(([k])=>k!==BUDGET_Q&&k!==BUDGET_REASON&&k!=='Budget'&&k!=='Currency').map(([k,v])=><div key={k}><dt>{proposalFields.find((f)=>f.key===k)?.label || k}</dt><dd>{v || '—'}</dd></div>)}<div><dt>Budget</dt><dd>{notBudgeted ? `Not Budgeted · Reason: ${values[BUDGET_REASON] ?? '—'}` : budget!==null ? money(budget) : '—'}</dd></div></dl>
    <h3>Phases</h3>{phases.length===0?<p className="cp-muted-note">No phases defined.</p>:<ul className="cp-review-phases">{phases.map((ph)=><li key={ph.id}><strong>{ph.name}</strong> <small>{ph.start || '—'} → {ph.end || '—'}</small>{!notBudgeted && ph.budget!=null && <small> · {money(ph.budget)}</small>}</li>)}</ul>}
    <h3>Toolkit items</h3>{attach.attach.map((a)=><div key={a.toolId}><Lock /><strong>{cfg.tools.find((t)=>t.id===a.toolId)?.name}</strong><Badge>Mandatory</Badge><small>{cfg.stages.find((s)=>s.id===a.stageId)?.label}</small></div>)}</div>;
  return <div className="cp-modal-backdrop"><div role="dialog" aria-modal="true" aria-label={`Create New ${cfg.intake}`} className="cp-wizard"><div className="cp-modal-header"><h2>Create New {cfg.intake === 'Proposal' ? 'Project Proposal' : cfg.intake}</h2><CpButton tone="ghost" size="icon" aria-label="Close proposal" onClick={close}><X /></CpButton></div><div className="cp-wizard-steps">{steps.map((s,i)=><div key={s} className={i===step ? 'cp-wizard-current' : i<step ? 'cp-wizard-done' : ''}>{i<step ? <Check /> : <span>{i+1}</span>}{s}</div>)}</div>
    {step===PLANNING_STEP ? planning : step<review ? <div className="cp-form-grid">{proposalFields.filter((f)=>f.step===step && f.key!=='Budget' && (cfg.proposal.required[f.key] || f.key==='Project name' || f.key==='Description' || f.key==='Type')).map(fieldEl)}{step===1 && <><label>Business Unit<select aria-label="Business Unit" value={values['department'] || ''} onChange={(e)=>set('department',e.target.value)}><option value="">Select…</option>{cfg.lookups['external-entities'].filter((x)=>x.active).map((x)=><option key={x.id}>{x.name}</option>)}</select></label><label>Project Sponsor<select aria-label="Project Sponsor" value={values['sponsor'] || ''} onChange={(e)=>set('sponsor',e.target.value)}><option value="">Select…</option>{cfg.roles.filter((r)=>r.name.includes('Sponsor')).map((r)=><option key={r.id}>{r.name}</option>)}</select></label></>}{step===0 && cfg.proposal.confidential && <label className="cp-checkbox"><input type="checkbox" checked={confidential} onChange={(e)=>setConfidential(e.target.checked)} />Confidential</label>}</div> : reviewBody}
    <div className="cp-modal-footer"><CpButton disabled={step===0} onClick={()=>setStep(step-1)}>Back</CpButton>{step<review ? <CpButton tone="teal" onClick={next}>Next</CpButton> : <CpButton tone="purple" onClick={submit}>Submit</CpButton>}</div>
    {confirmNo && <div className="cp-confirm" role="alertdialog" aria-label="Clear budget"><p>Switching to No will clear the project budget and all phase budgets. Continue?</p><div className="cp-actions"><CpButton onClick={()=>setConfirmNo(false)}>Cancel</CpButton><CpButton tone="purple" onClick={confirmClear}>Continue</CpButton></div></div>}
  </div></div>;
}
