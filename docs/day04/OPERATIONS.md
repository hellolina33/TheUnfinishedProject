# Publishing and recovering Day 04

Run npm ci, npm run validate:day04 and npm run test:browser before release. The build validates the 50 bilingual source records, generates localized HTML, creates hashed assets and builds the two offline apps and six situation kits. Vercel runs the build and Node checks before exposing a deployment.

The canonical editorial source is day-04-productivity-library/data/methods.json. Generated HTML, methods.js, images and releases are outputs of scripts/build-day04.mjs. Edit the source records or modules, then rebuild. Schema v3 backups use stable field IDs. Versions 1 and 2 remain importable. Structured workspace rows are validated on import, and user data remains in memory in the open tab.

Use npm run verify:release after publishing. It checks the bytes of every manifest asset and availability of key pages. The scheduled GitHub check reports failures through GitHub Actions. Release manifests record content hashes, byte sizes and export library versions. The checked lockfile and the software inventory cover the dependency tree.

To roll back, promote the previous known Vercel deployment, or revert the release commit and publish it through the same checks. Old downloaded HTML files remain independent copies. Distribute the current offline version when a security update is published.

The default build uses no application API and requires no application secret. A future shared workspace requires a separate design covering explicit access grants, authenticated edit roles, expiry, deletion, encrypted transport, retention, bounded requests and cross-workspace isolation tests. Do not transmit worksheet values to monitoring or analytics services.

The main app has frame-ancestors self. Dedicated /embed/ pages allow HTTPS parents and expose only session-local worksheets. They do not send worksheet data to a parent. Their sample iframe uses a sandbox. Projects requiring a narrower parent allowlist can replace frame-ancestors https: for that path in vercel.json.
