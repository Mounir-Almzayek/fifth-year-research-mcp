# Deployment checklist — Appwrite Function

1. Source: `appwrite-function/`, entrypoint `index.js`, Node.js 22, no install command.
2. In Appwrite project `6af2b418002860c001a2`, deploy function `fifth-year-research` and activate a successful build.
3. Configure `NOTION_TOKEN` as a **secret variable on the Function**, using the same token that passed GitHub Actions. A GitHub secret is NOT automatically available to Appwrite.
4. Connect the internal Notion integration to root page `41071da3-3679-81e6-8f76-fd7485e6618b`, only this tree.
5. Set up a Web platform for the generated `*.fra.appwrite.run` function hostname.
6. Create Appwrite users with verified emails. For each user, make a server-only row in `team_access/members` with row ID equal to Appwrite user ID, `role` one of viewer/editor/admin, `active` true.
7. The function uses an Appwrite-generated execution key with `rows.read` scope. The app must fail closed if membership lookup is unavailable.
8. Leave `ENABLE_WRITES=false` in production. `OPENAI_API_KEY` is optional and only turns on read-only research AI. Add spending controls before enabling.
9. Test `GET /health` (configuration only), `GET /api/me` with a real verified-member JWT, `POST /api/tool` for the root, unauthorized-user rejection, and out-of-scope Notion page denial.
10. Inspect GitHub Actions `Verify Notion API access` for token/root HTTP 200. GitHub's token is never printed, and the workflow prints only the HTTP status.

The portal is not a replacement for Notion's own Member/Guest roles. It is an independently operated integration with its own access checks, and it does **not** implement OAuth-compatible ChatGPT MCP. Static content is served by the Appwrite Function at its generated HTTPS domain after successful deployment.

Troubleshooting: Appwrite Web platform missing -> browser CORS fails; no `NOTION_TOKEN` -> `/health` responds `configured:false`; no role row -> 403 even when user is logged in; missing Appwrite function ephemeral API key -> 503.
