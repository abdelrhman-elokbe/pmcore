<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Project Core draft config (stages, features, roles, lookups, notification rules, proposal fields, branding) lives in per-tenant stores (`createTenantStore`) so the Client preview reads unsaved admin edits live; never move it back to component-local state.
- The Client preview (`/project-preview`, `src/components/client-preview/`) derives everything from those stores plus `toolkitStore`; demo projects/notifications are in-memory per tenant and resettable.
- Client preview defines brand, surface, text, and border tokens on its root, with `cp-*` utilities resolving to those scoped values, so the admin console theme remains unchanged.
- Client preview screen modules share an enabled-lifecycle classification helper to distinguish initiation proposals from approved projects, so menu counts and approval transitions stay consistent when stages change.
- Execution tool tabs use tool-ID identities and share ToolPanel with the initiation drawer, so configured names cannot collide with built-in tabs and editing/approval behavior stays consistent.

- Client preview configuration rules use Vitest with a standalone browser-safe alias configuration, so tests do not load the application server bootstrap.
- Budget applicability lives in `client-preview/budget.ts` (`isBudgeted`, `budgetLabel`, `financials`, CSV export); every budget display, financial aggregate and export goes through it so Not Budgeted projects never render as 0.
- Project currency helpers live in `client-preview/currency.ts` (fixed list + built-in rates); all money totals convert to the tenant main currency through it, and a project's currency changes only via an approved change request.
