# Team onboarding and future projects

## Login at the live website

Open https://fifth-year-research.fra.appwrite.run

The five pre-enrolled members (one owner, four editors) enter their **own registered email** and click the Arabic button for "Send login link". Each person receives a Magic URL and returns to the portal, without a shared password. All accounts are initially unverified until each member completes authentication. Creating a server-side team membership alone does not send an invitation email.

## Access controls

Only Appwrite users with verified email and an active role record in team_access / members may access the portal.

The server consults the per-project access records in team_access / project_grants for each request. Every project is defined as a Notion root in team_access / projects. Each member can have a different role on each project, and a member of one project cannot access another automatically.

GET /api/projects returns only the current member's active projects. Other APIs require projectId, check the member's grants, and enforce the Notion page ancestry before accessing the content.

## Adding future research projects

1. Create a top-level Notion project page and explicitly give the Fifth Year Research MCP internal integration access to that page (and intended children), not the whole private workspace.
2. Add a row to Appwrite TablesDB team_access / projects: unique row ID (for example physics_lab), name, rootId (a 32- or 36-character Notion page ID), active=true.
3. Add one row per authorized collaborator to team_access / project_grants: projectId, userId, role (viewer/editor/admin), active=true. Use the user's ID from the Appwrite Auth Users dashboard.
4. After logging in or refreshing, the collaborator will see the new project in the dropdown. All tool requests remain scoped to that project's root.
5. To remove a user from one project, set that project grant's active=false. To remove them from all projects, set their global members row active=false.

## ChatGPT vs. web

The hosted portal is a web client, **not yet an OAuth-protected MCP server compatible with ChatGPT custom connections**. Do not share the Notion Integration Token. Full custom MCP support is restricted by ChatGPT plan/workspace eligibility. Other compatible MCP clients may be added later with properly scoped OAuth.

## Limitations

- Real end-to-end email sign-in and Notion reads from a verified student account are not yet tested.
- AI chat is disabled until a server-side OpenAI API key and spending safeguards are configured.
- The browser SDK may use localStorage for sessions across third-party domains; deploy a first-party Appwrite API domain before high-risk production.
