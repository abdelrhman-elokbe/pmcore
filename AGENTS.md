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
- Client preview uses its own `cp-*` theme tokens (client look); the admin console keeps the main design tokens.
