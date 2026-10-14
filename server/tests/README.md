# Server regression tests

Security regression tests for the EcoCycle API, run with Node's built-in test runner (`node:test`).

## Requirements

- Node.js 22+
- A local MongoDB server binary (`mongod`). It must be on your `PATH`, or `MONGOD_PATH` must point to it.
  You do not need a running MongoDB service. The tests start their own `mongod`.
- Dev dependencies installed: `npm install` (in `server/`)

## Running

```bash
cd server
npm test
```

If `mongod` is not on your `PATH`:

```bash
# bash
MONGOD_PATH="/c/Program Files/MongoDB/Server/8.2/bin/mongod.exe" npm test
```

```powershell
# PowerShell
$env:MONGOD_PATH = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe'; npm test
```

To run a single file:

```bash
node --test tests/requestStatus.test.js
```

## How the tests are isolated

For each test file, [`helpers/testServer.js`](helpers/testServer.js):

1. creates an empty temporary data directory under the OS temp folder,
2. starts a private `mongod` on a random free port, bound to `127.0.0.1`,
3. starts the API (`index.js`) on another random port with **every** environment variable it reads
   set explicitly (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`, `CLIENT_URL`, plus fixed values
   for `RATE_LIMIT_MAX`, `UPLOAD_DAILY_LIMIT_MB` and `ORPHAN_IMAGE_*`; the background image sweep is
   off and the sweep tests call it directly).
   `dotenv` never overrides variables that are already set, so values from `server/.env`
   (including the shared Atlas database) are never used,
4. refuses to continue unless the server reports a `127.0.0.1` database host,
5. after the file finishes, stops both processes and deletes the temporary data directory.

The JWT secret is random for each run. The test files contain no credentials. The tests never
connect to Atlas, and they never run `seed.js` or any drop/reset command.

A few steps that have no API yet, such as approving a listing or verifying a buyer, are simulated
by writing directly to the temporary test database.

## Files

| File | Covers |
| --- | --- |
| `auth.test.js` | Server-side role checks, password change rules, token revocation |
| `listings.test.js` | Mass-assignment protection, listing validation and visibility, regex/query injection, error responses |
| `privacy.test.js` | `profileVisibility` and `showContactInformation` on listings, requests and messages |
| `messaging.test.js` | Conversation access, socket room authorization, socket disconnect on password change and token expiry |
| `requestStatus.test.js` | Request status lifecycle for buyers and sellers, ownership, concurrent updates |
| `errorHandler.test.js` | Generic 500 responses and credential masking in logs (unit test, no server) |
| `uploads.test.js` | Image upload type/size checks, serving, ownership of listing images and avatars |
| `sellerListings.test.js` | Seller listing filters, counts, pagination, edit (back to review), delete rules, photo cleanup |
| `workflow.test.js` | Full buyer-seller flow: listing → request → accept (quantity reserved) → schedule → complete, duplicates, sold-out listings, dashboards, notification preferences |
| `notifications.test.js` | Notification delivery over sockets, ownership, filters, read / read-all |
| `conversations.test.js` | Conversation list, privacy of names, single delivery of REST and socket messages, unread counts and read receipts, history paging, presence |
| `profileSettings.test.js` | Profile read/update without secrets or protected fields, buyer settings, partial settings updates |
| `dataIntegrity.test.js` | Unique open-request index (created at start-up, skipped safely when old data conflicts), simultaneous duplicate requests, double accept reserving quantity once |
| `imageCleanup.test.js` | Deleting unused uploads, keeping photos still in use, avatar replacement, orphan sweep (dry run and real), daily upload allowance |

Each file stays under the API rate limit (300 requests per 15 minutes per IP by default). Files run
one at a time (`--test-concurrency=1`), and each one gets its own server and limiter.

## Browser end-to-end test

The full seller/buyer flow in Chrome lives in [`client/e2e`](../../client/e2e/README.md)
(`cd client && npm run test:e2e`). It uses the same isolation rules: its own `mongod`, explicit
settings, and a refusal to run against anything but `127.0.0.1`.
