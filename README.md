# Fifth Year Research Portal

A student research portal for the Solar Intelligence graduation project. The server runs as an Appwrite Function (Node.js 22, no npm dependencies), authenticates Appwrite JWT sessions, and uses a **server-side Notion Internal Connection** to read a single approved research page tree.

## Source

- `appwrite-function/index.js` — HTTP API, Appwrite auth & roles, Notion scope enforcement, read-only AI.
- `appwrite-function/public/` — Arabic browser portal (login, search, browse, AI chat).
- `.github/workflows/notion-check.yml` — checks JavaScript syntax and securely tests Notion API access with GitHub Actions Secrets.

## Existing resources

- Appwrite project ID: `6af2b418002860c001a2`, endpoint `https://fra.cloud.appwrite.io/v1`.
- Private Roles database and table: `team_access / members`.
- Function ID: `fifth-year-research`, runtime `node-22`, role-lookup scope `rows.read`.
- Notion research root ID: `41071da3-3679-81e6-8f76-fd7485e6618b`.

## Server configuration

Notion is now configured using **Appwrite function secrets** `NOTION_ENC_TOKEN_B64` and `NOTION_RSA_PRIVATE_KEY_B64`: an RSA-OAEP encrypted transfer securely moved the GitHub Actions `NOTION_TOKEN` without exposing its plaintext. A direct Appwrite secret named `NOTION_TOKEN` is also supported and takes precedence for future token rotation. GitHub Actions secrets are not injected into Functions automatically. Optional `OPENAI_API_KEY` activates read-only AI chat; it is **not yet provisioned**. Leave `ENABLE_WRITES=false` until the team has tested permissions and approved a writing policy.

Do not grant the Notion Integration access to personal or unrelated pages. Notion Guests do not become Notion MCP Members by using this independent portal.

## Access model

Every API request requires a valid Appwrite JWT and verified email. An active role row is required under `team_access/members`, with the row ID matching the Appwrite user's ID. Allowed `role` values: viewer, editor, admin; `active` must be true. Appwrite user signup does NOT automatically grant a role. The role table has no public permissions.

The Notion root and descendants are the only readable area. AI tools are read-only. Direct changes can be enabled only by explicitly setting `ENABLE_WRITES=true` on the Appwrite Function and supplying an exact confirmation string; use this only after an explicit human security review. No direct OAuth-compatible ChatGPT MCP endpoint is included.

## Deployment

See [deployment details](docs/DEPLOYMENT.md). The generated Appwrite HTTPS domain is usable only once the Function has an **active successful deployment**. The active Appwrite deployment and public HTTPS domain passed health checks with `configured: true`. **Actual student account login and end-to-end page reading still require enrolling verified Appwrite users with membership rows.**

**Never commit API keys, secrets, `.env`, or Notion page data.**
