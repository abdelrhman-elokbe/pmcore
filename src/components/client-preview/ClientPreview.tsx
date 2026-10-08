import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { BarChart3, Bell, Briefcase, Building, ChevronRight, ChevronDown, Eye, EyeOff, FileBarChart, Folder, Gauge, Layers, LayoutGrid, LayoutDashboard, Lightbulb, ListChecks, LogOut, RotateCcw, Search, Settings, SlidersHorizontal, SquareX, Users, X, Check, AlertTriangle, Info, CircleCheck, ChartLine } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePlatform } from '@/lib/platform/context';
import { useTools } from '@/components/project-core/toolkitData';
import { can, featureOn, mandatoryTools, menuItems, notifStore, projectsStore, resolveStage, stageWorkflow, usePreviewConfig, type AdminLink, type MenuId, type PProject, type PreviewConfig, type PreviewRole, type TraceLine } from './engine';
import { CpButton, Badge, Section } from './PreviewUI';
import { ProjectsDashboard } from './ProjectsDashboard';
import { ProjectLists } from './ProjectLists';
import { ProjectDetail } from './ProjectDetail';
import { ProposalWizard } from './ProposalWizard';
import { ToolDrawer } from './PreviewTools';
import { isProposal } from './projectModel';

const menuIcons = { dashboard: ChartLine, proposals: Folder, projects: LayoutGrid, 'pmo-dashboards': LayoutDashboard, 'pmo-reports': FileBarChart, 'change-requests': SlidersHorizontal, 'closure-requests': SquareX, lessons: Lightbulb, configurations: Settings };
export function ClientPreview({ from }: { from: string }) {
 const {tenantId}=usePlatform();const tools=useTools();const cfg=usePreviewConfig(tenantId,tools);const [projects]=projectsStore.use(tenantId);const [notifs,setNotifs]=notifStore.use(tenantId);
 const [roleId,setRoleId]=useState('pm');const role=cfg.roles.find((r)=>r.id===roleId) ?? cfg.roles[0];
 const [menuId,setMenuId]=useState<MenuId>('dashboard');const [projectId,setProjectId]=useState<string|null>(null);const [newOpen,setNewOpen]=useState(false);const [traceOpen,setTraceOpen]=useState(false);const [bellOpen,setBellOpen]=useState(false);const [collapsed,setCollapsed]=useState(false);const [configOpen,setConfigOpen]=useState(false);const [configItem,setConfigItem]=useState('Lookups');const [query,setQuery]=useState('');const [toolOpen,setToolOpen]=useState<string|null>(null);const [ar,setAr]=useState(false);const [healthFilter,setHealthFilter]=useState('');const [message,setMessage]=useState('');
 const menu=role?menuItems(cfg,role):[];const visible=menu.filter((m)=>m.visible);const project=projectId?projects.find((p)=>p.id===projectId):undefined;
 useEffect(()=>{if(!visible.some((m)=>m.id===menuId)){const next=visible[0];if(next){setMenuId(next.id);setProjectId(null);}}},[cfg.features,roleId,menuId]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),4000);return ()=>clearTimeout(timer);},[message]);
 if(!role)return <div className="client-preview">No preview roles configured.</div>;
 const navigate=(id:MenuId)=>{setMenuId(id);setProjectId(null);setToolOpen(null);setHealthFilter('');};
 const myInbox=notifs.filter((n)=>n.inApp&&n.recipients.includes(role.name));const unread=myInbox.filter((n)=>!n.readBy.includes(role.name)).length;
 const proposals=projects.filter((p)=>isProposal(cfg,p));const approved=projects.filter((p)=>!isProposal(cfg,p));const counts:Partial<Record<MenuId,number>>={proposals:proposals.length,projects:approved.length,'closure-requests':projects.filter((p)=>p.stageId==='closure').length,'change-requests':projects.filter((p)=>p.status==='Returned').length};
 const activeMenuId=project ? (isProposal(cfg,project)?'proposals':'projects') : menuId;
 const crumb=project?.name ?? (menuId==='configurations'?`Configurations · ${configItem}`:menu.find((m)=>m.id===menuId)?.label ?? 'Projects');
 const userName=role.name==='Project Manager'?'Youness Zahir':role.name;const trace=buildTrace(cfg,role,menu,project ?? null);
 const notice=(text:string)=>{setMessage(text);toast(text);};
 return <div className="client-preview" dir={ar?'rtl':'ltr'}>
 <div className="cp-preview-banner" dir="ltr"><Eye /><strong>Preview mode</strong><span>· {cfg.tenant.name} · Draft configuration — nothing is saved</span><label>Previewing as:<select aria-label="Previewing as role" value={role.id} onChange={(e)=>setRoleId(e.target.value)}>{cfg.roles.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><CpButton tone="ghost" onClick={()=>setTraceOpen(!traceOpen)}><ListChecks />Config trace</CpButton><CpButton tone="ghost" onClick={()=>{projectsStore.reset(tenantId);notifStore.reset(tenantId);navigate('dashboard');notice('Demo data reset');}}><RotateCcw />Reset demo data</CpButton><CpButton asChild tone="ghost">{from==='platform'?<Link to="/"><LogOut />Exit preview</Link>:<Link to="/project-core" search={{screen:from as 'stages'}}><LogOut />Exit preview</Link>}</CpButton></div>
 <div className="cp-wrapper"><div className="cp-client-container"><header className="cp-client-header"><div className="cp-wordmark">{tenantId==='dcaa'?<><strong>DU<span>BA</span>I</strong><small>Culture للثقافة</small></>:<><strong>{cfg.tenant.name}</strong><small>{cfg.branding.nameEn}</small></>}</div><div className="cp-header-divider" /><div className="cp-breadcrumb">Projects · <strong>{crumb}</strong></div><div className="cp-header-end">{message&&<span className="cp-toast-pill">{message}</span>}<div className="cp-bell-wrap"><CpButton aria-label="Notifications" size="icon" onClick={()=>setBellOpen(!bellOpen)}><Bell />{unread>0&&<span className="cp-notification-count">{unread}</span>}</CpButton>{bellOpen&&<div className="cp-inbox"><div><strong>Notifications for {role.name}</strong><CpButton tone="ghost" onClick={()=>setNotifs((all)=>all.map((n)=>n.recipients.includes(role.name)?{...n,readBy:Array.from(new Set([...n.readBy,role.name]))}:n))}>Mark all read</CpButton></div>{myInbox.length===0?<p>No notifications for this role yet.</p>:myInbox.map((n)=><article key={n.id} className={!n.readBy.includes(role.name)?'cp-unread':''}><p>{n.text}</p><small>Rule: {n.rule}</small><small>To: {n.recipients.join(', ')} · {n.channels.join(' + ')}</small></article>)}</div>}</div><div className="cp-user"><strong>{userName}</strong><small>{role.name}</small></div><div className="cp-user-avatar">{userName.split(' ').slice(0,2).map((x)=>x[0]).join('')}</div><CpButton tone="ghost" className="cp-language" onClick={()=>setAr(!ar)}>{ar?'English':'عربي'}</CpButton></div></header>
 <div className="cp-shell-body"><nav className="cp-rail" aria-label="Client modules">{[{name:'Dashboards',icon:LayoutGrid},{name:'Performance',icon:Gauge},{name:'Services',icon:Layers},{name:'Projects',icon:Briefcase,badge:'40'},{name:'Admin',icon:Settings},{name:'Committees',icon:Users,badge:'1'},{name:'BAU',icon:Building}].map((item)=><CpButton key={item.name} className={cn('cp-rail-item',item.name==='Projects'&&'cp-rail-active')} onClick={()=>item.name==='Projects'?navigate('dashboard'):notice(`${item.name} — not part of Project Core preview`)}><item.icon /><span>{item.name}</span>{item.badge&&<b>{item.badge}</b>}</CpButton>)}</nav>
 <CpButton tone="ghost" aria-label={collapsed?'Expand Projects menu':'Collapse Projects menu'} className="cp-collapse" onClick={()=>setCollapsed(!collapsed)}><span /></CpButton>
 {!collapsed&&<aside className="cp-secondary"><label className="cp-menu-search"><Search /><input placeholder="Search" aria-label="Search menu" value={query} onChange={(e)=>setQuery(e.target.value)} /></label><nav aria-label="Project Core">{visible.filter((m)=>m.label.toLowerCase().includes(query.toLowerCase())).map((m)=>{const Icon=menuIcons[m.id];return <div key={m.id}><CpButton className={cn('cp-menu-item',activeMenuId===m.id&&'cp-menu-active',m.id==='configurations'&&configOpen&&'cp-config-active')} onClick={()=>{navigate(m.id);if(m.id==='configurations')setConfigOpen(!configOpen);}}><Icon /><span>{m.label}</span>{counts[m.id]?<b>{counts[m.id]}</b>:null}{m.id==='configurations'&&<ChevronDown />}</CpButton>{m.id==='configurations'&&configOpen&&<div className="cp-config-children">{['Lookups','Organisation structure','Notification preferences'].map((item)=><CpButton key={item} className={configItem===item?'cp-menu-active':''} onClick={()=>{setConfigItem(item);navigate('configurations');}}><CircleCheck />{item}</CpButton>)}</div>}</div>;})}</nav></aside>}
 <main className="cp-content">{project?<ProjectDetail key={project.id} cfg={cfg} tenantId={tenantId} p={project} role={role} ar={ar} openTool={setToolOpen} back={()=>{setProjectId(null);setMenuId(isProposal(cfg,project)?'proposals':'projects');}} />:menuId==='dashboard'?<ProjectsDashboard cfg={cfg} projects={projects} role={role} open={setProjectId} drill={(health)=>{navigate('projects');setHealthFilter(health);notice(`${health} projects`);}} />:menuId==='proposals'||menuId==='projects'?<ProjectLists key={`${menuId}-${healthFilter}`} cfg={cfg} role={role} projects={projects} proposals={menuId==='proposals'} open={setProjectId} onNew={()=>setNewOpen(true)} initialHealth={healthFilter} />:<OtherScreen id={menuId} cfg={cfg} role={role} projects={projects} configItem={configItem} />}</main></div></div></div>
 {traceOpen&&<aside className="cp-trace" dir="ltr"><div className="cp-section-title"><h2>Config trace</h2><CpButton size="icon" tone="ghost" aria-label="Close trace" onClick={()=>setTraceOpen(false)}><X /></CpButton></div><ul>{trace.map((line,i)=><li key={i}>{line.kind==='hidden'?<EyeOff />:line.kind==='warn'?<AlertTriangle />:line.kind==='ok'?<Check />:<Info />}<span>{line.text}{line.link&&<AdminLinkEl link={line.link} />}</span></li>)}</ul></aside>}
 {newOpen&&can(role,'Projects','Create')&&<ProposalWizard cfg={cfg} tenantId={tenantId} close={()=>setNewOpen(false)} done={(id)=>{setNewOpen(false);setProjectId(id);}} />}{project&&toolOpen&&<ToolDrawer cfg={cfg} tenantId={tenantId} p={project} toolId={toolOpen} role={role} close={()=>setToolOpen(null)} />}
 </div>;
}
function OtherScreen({id,cfg,role,projects,configItem}:{id:MenuId;cfg:PreviewConfig;role:PreviewRole;projects:PProject[];configItem:string}) {
 const [tab,setTab]=useState('Portfolio Overview');const title=id==='configurations'?`Configurations · ${configItem}`:menuItems(cfg,role).find((m)=>m.id===id)?.label ?? '';
 const pmoTabs=[['Portfolio Overview','Portfolio Summary KPIs'],['Progress','Project Progress'],['Risks','Risk Management'],['Budget','Budget Management'],['Benefits Realization','Benefits Realization'],['Deliverables Management','Deliverables Management'],['Project Health Score','Project Health Score']].filter(([,f])=>featureOn(cfg.features,'dashboard',f));
 const rows=id==='lessons'?cfg.lookups['lessons-learned'].filter((x)=>x.active).map((x)=>x.name):id==='configurations'?cfg.lookups.categories.filter((x)=>x.active).map((x)=>x.name):projects.filter((p)=>id==='closure-requests'?p.stageId==='closure':id==='change-requests'?p.status==='Returned':true).slice(0,6).map((p)=>p.name);
 return <div className="cp-page"><div className="cp-page-title"><h1>{title}</h1></div>{id==='pmo-dashboards'&&<><div className="cp-filter"><label>Classification<select><option>All</option>{cfg.lookups.categories.filter((x)=>x.active).map((x)=><option key={x.id}>{x.name}</option>)}</select></label><label>Year<select><option>2026</option></select></label></div><div className="cp-tabs">{pmoTabs.map(([name])=><CpButton key={name} className={tab===name?'cp-tab-active':''} onClick={()=>setTab(name ?? 'Portfolio Overview')}>{name}</CpButton>)}</div><div className="cp-kpis">{['Total Projects','On Track','Under Review','Closed'].map((label,i)=><div className="cp-placeholder-kpi" key={label}><strong>{[projects.length,projects.filter((p)=>p.health>50&&!p.approval).length,projects.filter((p)=>p.approval).length,projects.filter((p)=>p.status==='Completed').length][i]}</strong><span>{label}</span></div>)}</div></>}<Section title={id==='pmo-dashboards'?tab:title}><table className="cp-simple-table"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>{rows.map((name)=><tr key={name}><td>{name}</td><td><Badge>Active</Badge></td></tr>)}</tbody></table>{!rows.length&&<div className="cp-empty">No records.</div>}</Section></div>;
}
function AdminLinkEl({ link }: { link: AdminLink }) {
  return (
    <Link
      to="/project-core"
      search={link.tool ? { screen: "toolkit", tool: link.tool } : { screen: link.screen as "stages" }}
      className="ms-1 inline-flex items-center font-semibold text-cp-purple"
    >
      Open <ChevronRight className="size-3" />
    </Link>
  );
}

/* ---------------- Trace ---------------- */

function buildTrace(
  cfg: PreviewConfig,
  role: PreviewRole,
  menu: ReturnType<typeof menuItems>,
  p: PProject | null,
): TraceLine[] {
  const out: TraceLine[] = [];
  out.push({ kind: "info", text: `Lifecycle: ${cfg.stages.map((s) => s.label).join(" → ") || "none"}`, link: { screen: "stages" } });
  cfg.disabledStages.forEach((s) => out.push({ kind: "hidden", text: `${s.name} hidden — stage disabled`, link: { screen: "stages" } }));
  if (cfg.intake !== "Proposal") out.push({ kind: "info", text: `Terminology: "Proposal" shown as "${cfg.intake}"` });
  menu.filter((m) => !m.visible).forEach((m) => out.push({ kind: "hidden", text: `${m.label} hidden — ${m.reason}`, link: m.link }));
  const f = cfg.features;
  if (!featureOn(f, "project", "Health score system")) out.push({ kind: "hidden", text: "Health score hidden — feature disabled", link: { screen: "features" } });
  if (!featureOn(f, "project", "Risk management")) out.push({ kind: "hidden", text: "Risk register hidden — feature disabled", link: { screen: "features" } });
  if (!featureOn(f, "project", "Gantt chart")) out.push({ kind: "hidden", text: "Gantt chart hidden — feature disabled", link: { screen: "features" } });
  out.push({
    kind: "info",
    text: `${role.name}: ${(["View", "Create", "Edit", "Approve", "Delete", "Export"] as const).filter((a) => can(role, "Projects", a)).join(", ") || "no"} on Projects${role.workflowOnly ? " (workflow-only role)" : ""}`,
    link: { screen: "roles" },
  });
  cfg.stages.forEach((s) => {
    const { wf, note } = stageWorkflow(s.id, false);
    if (!wf) out.push({ kind: "warn", text: `${s.label}: ${note}`, link: { screen: "stages" } });
    else
      wf.steps.forEach((st, i) =>
        out.push({ kind: "info", text: `${s.label} · step ${i + 1} = ${st.assigneeRole} (workflow ${wf.title} ${wf.version})`, link: { screen: "stages" } }),
      );
  });
  if (p) {
    p.tools.forEach((t) => {
      const tool = cfg.tools.find((x) => x.id === t.toolId);
      out.push({ kind: "ok", text: `${tool?.name}: ${t.reason}`, link: { screen: "toolkit", tool: t.toolId } });
    });
    mandatoryTools(cfg, p.category, p.type).skipped.forEach((s) =>
      out.push({ kind: "hidden", text: `${s.tool.name} not attached — ${s.reason}`, link: { screen: "toolkit", tool: s.tool.id } }),
    );
    if (!cfg.stages.some((s) => s.id === p.stageId))
      out.push({ kind: "warn", text: `Project sits in a stage that is now disabled (${p.stageId})`, link: { screen: "stages" } });
  } else {
    cfg.tools
      .filter((t) => t.mode === "Mandatory" && t.status === "Active")
      .forEach((t) => {
        const st = resolveStage(cfg, t.defaultStage);
        out.push({
          kind: st ? "ok" : "warn",
          text: st ? `${t.name}: Mandatory → auto-attached at ${st.label}` : `${t.name}: Mandatory but default stage disabled — not attached`,
          link: { screen: "toolkit", tool: t.id },
        });
      });
  }
  out.push({ kind: "info", text: `Branding: ${cfg.branding.nameEn} · ${cfg.tenant.currency} · ${cfg.branding.dateFormat}`, link: { screen: "configurations" } });
  return out;
}

