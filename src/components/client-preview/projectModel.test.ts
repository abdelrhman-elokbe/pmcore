import { describe, expect, test } from 'vitest';
import { featuresStore, phasesStore, rolesStore, lookupsStore, brandingStore, proposalStore } from '@/components/project-core/configStores';
import { toolkitStore } from '@/components/project-core/toolkitData';
import { buildConfig, mandatoryTools, menuItems, projectsStore, notifStore, type PProject } from './engine';
import { isProposal, missingProposalFields, stageTabs } from './projectModel';
import { actOnStage, createProject, submitStage } from './actions';
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
  expect(menuItems(cfg,role).find((m)=>m.id==='change-requests')?.visible).toBe(false);expect(stageTabs(cfg,false)).not.toContain('Change Requests');
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
  expect(missingProposalFields(cfg,{},0)).toEqual(['Project Title']);expect(missingProposalFields(cfg,{'Project name':'New project'},2)).toEqual(['Key Risk']);expect(missingProposalFields(cfg,{'Project name':'New project',Risks:'Delay'})).toEqual([]);
 });
 test('final initiation approval moves proposal to approved Projects and fires notifications',()=>{
  const tid='approval-test';const cfg=config(tid);const seed=projectsStore.get(tid)[0];if(!seed)throw Error('No seed');
  const project:PProject={...seed,id:'transition',status:'In progress',approval:null,tools:[],stageId:'proposal'};createProject(tid,project);submitStage(tid,cfg,project,'Project Manager');
  const read=()=>{const p=projectsStore.get(tid).find((x)=>x.id==='transition');if(!p)throw Error('No project');return p;};
  expect(read().approval?.stepIdx).toBe(1);actOnStage(tid,cfg,read(),'approve','PMO Officer','');actOnStage(tid,cfg,read(),'approve','Project Sponsor','');actOnStage(tid,cfg,read(),'approve','Committee Chair','');
  expect(read().stageId).toBe('execution');expect(isProposal(cfg,read())).toBe(false);expect(notifStore.get(tid).length).toBeGreaterThan(0);
 });
});
