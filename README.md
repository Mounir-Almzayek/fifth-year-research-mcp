# Fifth Year Research MCP

Private team research assistant integrating Appwrite Auth, scoped Notion API access, and an optional AI web portal.

## Current state

- Dedicated Appwrite project exists in `fra`: `6af2b418002860c001a2`.
- Private server-only roles database/table: `team_access/members` (`role`: viewer/editor/admin; `active`: boolean).
- Notion research root: `41071da3-3679-81e6-8f76-fd7485e6618b`.
- Application implementation is prepared as a local ZIP from the project conversation, but **is not yet committed or deployed**.
- Notion token and API keys must never be committed here. GitHub Actions secrets alone are not runtime secrets; provision the hosting environment separately.

## Next steps

1. Upload the app source files from `fifth-year-research-mcp-v0.2.0.zip` to this repository (excluding `.env`, `node_modules/`, and all credentials).
2. Install dependencies, run `npm test` and `npm run typecheck`, review the CI workflow and resolve any errors.
3. Configure an Appwrite Web platform for the deployed origin and add invited, verified users with membership rows keyed by their Appwrite user IDs.
4. Configure `APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1`, `APPWRITE_PROJECT_ID=6af2b418002860c001a2`, `APPWRITE_DATABASE_ID=team_access`, `APPWRITE_ROLES_TABLE_ID=members`, `NOTION_ROOT_PAGE_ID=41071da3-3679-81e6-8f76-fd7485e6618b` as runtime settings.
5. Set `NOTION_TOKEN` and a narrowly scoped `APPWRITE_API_KEY` as **server-side secrets** on the hosting provider.
6. Deploy over HTTPS with `ENABLE_MCP_HTTP=false` and `AI_ALLOW_WRITES=false` initially, then perform real end-to-end tests.

The direct ChatGPT OAuth-based MCP integration is not implemented. The web portal is the initial supported client. Do not announce a publicly usable service until the security and live integration checks pass.
