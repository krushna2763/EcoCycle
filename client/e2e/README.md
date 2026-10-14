# Browser end-to-end test

`run-e2e.mjs` drives Google Chrome through the whole seller/buyer flow against a private,
throwaway copy of the app. It never uses the shared Atlas database.

## What it checks (13 steps)

1. The seller logs in through the login page.
2. The seller creates a listing with a real photo upload.
3. My Listings shows the listing as *Pending Approval*, with its photo.
4. The buyer logs in, finds the listing (approved directly in the test database, since there is no approval UI yet), opens it and sends a request.
5. The seller gets a live notification badge and accepts the request.
6. The buyer sees the acceptance.
7. The seller schedules the collection.
8. The buyer sees the pickup schedule.
9. Both users chat. Messages arrive live and exactly once, and are still there after a reload.
10. The seller starts and completes the collection.
11. Buyer requests, buyer notifications and seller dashboard show the result. The listing quantity drops from 50 to 20 kg.
12. Profile and settings changes are saved to the database.
13. No page errors, console errors or HTTP 5xx responses occurred.

## Prerequisites

- Node.js 22+
- Dependencies installed in both packages: `npm install` in `client/` and in `server/`
- A MongoDB server binary (`mongod`) on your `PATH`, or `MONGOD_PATH` pointing to it.
  A running MongoDB service is not needed.
- Google Chrome. It is found automatically in the usual install locations; otherwise set `CHROME_PATH`.

## Running

```bash
cd client
npm run test:e2e
```

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `MONGOD_PATH` | Path to `mongod` if it is not on `PATH` |
| `CHROME_PATH` | Path to the Chrome executable |
| `E2E_HEADFUL=1` | Show the browser window while the test runs |
| `E2E_ARTIFACTS_DIR` | Folder in which to keep screenshots of the key screens |

The run takes about a minute. The script exits with code 0 when all 13 steps pass and 1 otherwise.

## Isolation and safety

- The script creates a temporary folder and starts its own `mongod` there, on a free port bound
  to `127.0.0.1`.
- It starts the API (`server/index.js`) and the Vite dev server on further free local ports.
- Every setting the API reads is passed explicitly, so values in `server/.env`, including the
  Atlas connection string, are never used. `client/.env` is overridden the same way.
- The run stops before any test step unless the API reports a `127.0.0.1` database host.
- Test accounts use `@e2e.local` addresses and exist only in the temporary database.

## Cleanup

All processes (`mongod`, the API, Vite and Chrome) are stopped when the run ends.

- **Successful run:** the temporary folder is deleted.
- **Failed run:** only the database files are deleted. The folder keeps screenshots of both
  browser sessions, and its path is printed at the end of the output.
