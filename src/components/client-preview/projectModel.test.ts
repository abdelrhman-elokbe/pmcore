import { describe, expect, test } from 'vitest';
import { featuresStore, phasesStore, rolesStore, lookupsStore, brandingStore, proposalStore } from '@/components/project-core/configStores';
import { toolkitStore } from '@/components/project-core/toolkitData';
import { buildConfig, mandatoryTools, menuItems, projectsStore, notifStore, type PProject } from './engine';
import { isProposal, missingProposalFields, stageTabs, stageToolTabs } from './projectModel';
import { actOnStage, createProject, submitStage } from './actions';
import { approveChangeRequest, convert } from './currency';
import { budgetLabel, projectCsvRows, clearBudget, financials, isBudgeted, nonBudgetedAllowed, phaseBudgetError } from './budget';
function config(tid:string) {
 return buildConfig(tid,{phases:phasesStore.get(tid),features:featuresStore.get(tid),roles:rolesStore.get(tid),lookups:lookupsStore.get(tid),branding:brandingStore.get(tid),proposal:proposalStore.get(tid),tools:toolkitStore.get()});
}
describe('configuration-driven client Projects',()=>{
 test('reset seeds 12 initiation proposals and 10 approved projects',()=>{
  const cfg=config('seed-test');projectsStore.reset('seed-test');const rows=projectsStore.get('seed-test');
  expect(rows.filter((p)=>isProposal(cfg,p))).toHaveLength(12);expect(rows.filter((p)=>!isProposal(cfg,p))).toHaveLength(10);
 });
 test('Change requests off hides both the menu and execution tab',()=>{
  const cfg=config('feature-test');cfg.features={...cfg.features,enabled:{...cfg.features.enabled,cr:false}};
  const role=cfg.roles.find((r)=>r.id==='pm');if(!role)throw Error('Missing PM role');
  expect(menuItems(cfg,role).find((m)=>m.id==='change-requests')?.visible).toBe(false);expect(stageTabs(cfg)).not.toContain('Change Requests');
 });
 test('disabled lifecycle stages are omitted and proposal classification follows enabled stages',()=>{
  const cfg=config('stage-test');const altered=buildConfig('stage-test',{phases:cfg.phases.map((ph)=>({...ph,stages:ph.stages.map((s)=>({...s,enabled:s.id!=='closure'&&s.enabled}))})),features:cfg.features,roles:rolesStore.get('stage-test'),lookups:cfg.lookups,branding:cfg.branding,proposal:cfg.proposal,tools:cfg.tools});
  expect(altered.stages.map((s)=>s.id)).not.toContain('closure');
  const project=projectsStore.get('stage-test')[0];if(!project)throw Error('No seed');expect(isProposal(altered,project)).toBe(true);expect(isProposal(altered,{...project,stageId:'execution'})).toBe(false);
 });
 test('mandatory tools attach locked at default stages and respect category scope',()=>{
  const cfg=config('tools-test');const strategic=mandatoryTools(cfg,'Strategic','Event Management').attach;const operational=mandatoryTools(cfg,'Operational','Event Management').attach;
  expect(strategic.find((t)=>t.toolId==='feasibility-study')).toMatchObject({locked:true,stageId:'proposal'});expect(operational.some((t)=>t.toolId==='feasibility-study')).toBe(false);expect(operational.find((t)=>t.toolId==='business-case')?.locked).toBe(true);
 });
 test('configured required fields block each wizard step',()=>{
  const cfg=config('required-test');cfg.proposal={...cfg.proposal,required:{'Project name':true,'Risks':true}};
  expect(missingProposalFields(cfg,{},0)).toEqual(['Project Title']);expect(missingProposalFields(cfg,{'Project name':'New project'},3)).toEqual(['Key Risk']);expect(missingProposalFields(cfg,{'Project name':'New project',Risks:'Delay'})).toEqual([]);
 });
 test('final initiation approval moves proposal to approved Projects and fires notifications',()=>{
  const tid='approval-test';const cfg=config(tid);const seed=projectsStore.get(tid)[0];if(!seed)throw Error('No seed');
  const project:PProject={...seed,id:'transition',status:'In progress',approval:null,tools:[],stageId:'proposal'};createProject(tid,project);submitStage(tid,cfg,project,'Project Manager');
  const read=()=>{const p=projectsStore.get(tid).find((x)=>x.id==='transition');if(!p)throw Error('No project');return p;};
  expect(read().approval?.stepIdx).toBe(1);actOnStage(tid,cfg,read(),'approve','PMO Officer','');actOnStage(tid,cfg,read(),'approve','Project Sponsor','');actOnStage(tid,cfg,read(),'approve','Committee Chair','');
  expect(read().stageId).toBe('execution');expect(isProposal(cfg,read())).toBe(false);expect(notifStore.get(tid).length).toBeGreaterThan(0);
 });

 test('isBudgeted and budgetLabel: Not Budgeted never shows as 0',()=>{
  const cfg=config('budget-label');
  expect(isBudgeted({budgetApplicability:'NotBudgeted',budget:null})).toBe(false);
  expect(isBudgeted({budgetApplicability:'Budgeted',budget:1000})).toBe(true);
  expect(budgetLabel({budgetApplicability:'NotBudgeted',budget:null},cfg)).toBe('Not Budgeted');
  expect(budgetLabel({budgetApplicability:'NotBudgeted',budget:null},cfg,true)).toBe('غير مخصص له ميزانية');
  expect(budgetLabel({budgetApplicability:'Budgeted',budget:1000},cfg)).toBe('AED 1,000');
 });
 test('non-budgeted allowed for RDA by default, not for DCAA, and respects type limit',()=>{
  expect(nonBudgetedAllowed(config('rda'),'Digital Transformation')).toBe(true);
  expect(nonBudgetedAllowed(config('dcaa'),'Event Management')).toBe(false);
  const cfg=config('rda');cfg.proposal={...cfg.proposal,nonBudgetedTypes:['Urban Planning Studies']};
  expect(nonBudgetedAllowed(cfg,'Digital Transformation')).toBe(false);expect(nonBudgetedAllowed(cfg,'Urban Planning Studies')).toBe(true);
 });
 test('phase budgets may not exceed project budget; check skipped when Not Budgeted',()=>{
  const phases=[{id:'a',name:'A',start:'',end:'',budget:600},{id:'b',name:'B',start:'',end:'',budget:500}];
  expect(phaseBudgetError('Budgeted',1000,phases)).not.toBeNull();
  expect(phaseBudgetError('Budgeted',1100,phases)).toBeNull();
  expect(phaseBudgetError('NotBudgeted',null,phases)).toBeNull();
 });
 test('financial aggregation excludes Not Budgeted projects but counts keep them',()=>{
  const rows=projectsStore.get('fin-test');const fin=financials(rows);
  const nb=rows.filter((p)=>p.budgetApplicability==='NotBudgeted');
  expect(nb.length).toBe(3);expect(nb.every((p)=>p.budget===null&&p.noBudgetReason)).toBe(true);
  expect(fin.excluded).toBe(3);expect(fin.budgeted).toHaveLength(rows.length-3);
  expect(fin.total).toBe(rows.reduce((n,p)=>n+(p.budget??0),0));
 });
 test('seeded budgeted phases sum within the project budget',()=>{
  projectsStore.get('phase-seed').forEach((p)=>{expect(p.phases.length).toBeGreaterThanOrEqual(3);if(isBudgeted(p))expect(phaseBudgetError('Budgeted',p.budget,p.phases)).toBeNull();else expect(p.phases.every((ph)=>ph.budget===undefined)).toBe(true);});
 });
 test('switching Yes to No clears the project budget and every phase budget',()=>{
  const out=clearBudget({budget:5000,phases:[{id:'a',name:'A',start:'',end:'',budget:2000},{id:'b',name:'B',start:'',end:'',budget:null}]});
  expect(out.budget).toBeNull();expect(out.phases.map((p)=>'budget' in p)).toEqual([false,false]);
 });
 test('Not Budgeted project hides Cost tab; budgeted keeps it',()=>{
  const cfg=config('tabs-test');
  expect(stageTabs(cfg,{budgetApplicability:'NotBudgeted',budget:null})).not.toContain('Cost');
  expect(stageTabs(cfg,{budgetApplicability:'Budgeted',budget:10})).toContain('Cost');
 });
 test('each attached tool has a separate named tab and removing it removes only its tab',()=>{
  const cfg=config('tool-tabs');
  const items=['swot','raci'].map((toolId)=>({toolId,stageId:'execution',locked:false,status:'Not started' as const,reason:'Optional',data:{},approval:null}));
  expect(stageToolTabs(cfg,items).map(({id,label})=>({id,label}))).toEqual([{id:'tool:swot',label:'SWOT Analysis'},{id:'tool:raci',label:'RACI Matrix'}]);
  expect(stageToolTabs(cfg,items.filter((t)=>t.toolId!=='swot')).map((t)=>t.id)).toEqual(['tool:raci']);
  expect(stageTabs(cfg)).not.toContain('Toolkit');
 });
 test('Not Budgeted requires a reason instead of the budget in Project Planning',()=>{
  const cfg=config('rda');const base={'Type':'Digital Transformation'};
  expect(missingProposalFields(cfg,base,2)).toContain('Does this project have a dedicated budget?');
  expect(missingProposalFields(cfg,{...base,BudgetApplicability:'NotBudgeted'},2)).toEqual(['Reason']);
  expect(missingProposalFields(cfg,{...base,BudgetApplicability:'Budgeted'},2)).toEqual(['Project Budget']);
  expect(missingProposalFields(config('dcaa'),{Type:'Event Management'},2)).toEqual(['Project Budget']);
 });
 test('currency conversion uses built-in rates to AED',()=>{
  expect(convert(1000,'USD','AED')).toBe(3673);expect(convert(1000,'AED','AED')).toBe(1000);expect(convert(3672.5,'AED','USD')).toBe(1000);
 });
 test('budget label uses project currency; totals convert to tenant currency',()=>{
  const cfg=config('dcaa');const a={budgetApplicability:'Budgeted' as const,budget:1000,currency:'USD'};
  expect(budgetLabel(a,cfg)).toBe('USD 1,000');
  const rows=[{...projectsStore.get('cur-test')[0]!,budget:1000,currency:'USD',budgetApplicability:'Budgeted' as const},{...projectsStore.get('cur-test')[1]!,budget:500,budgetApplicability:'Budgeted' as const}];
  const fin=financials(rows,cfg);expect(fin.total).toBe(3673+500);expect(fin.converted).toBe(true);
  const csv=projectCsvRows(cfg,rows);expect(csv[0]).toContain('Currency');expect(csv[1]).toContain('USD');expect(csv[1]).toContain(3673);
 });
 test('currency changes only when a change request with a new currency is approved',()=>{
  const p={...projectsStore.get('cr-cur')[0]!,changeRequests:[{id:'c1',title:'t',reason:'',scheduleDays:0,costImpact:null,status:'Submitted',at:'',newCurrency:'EUR'}]};
  expect(p.currency).toBeUndefined();const out=approveChangeRequest(p,'c1');expect(out.currency).toBe('EUR');expect(out.budget).toBe(p.budget);expect(out.changeRequests?.[0]?.status).toBe('Approved');
 });
});
