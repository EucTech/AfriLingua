# LiveKit "invalid token" / 401 Unauthorized — root cause and fix

## Symptom

Tandem video/audio calls never connected. Both participants matched
successfully and were routed to `/call/:id`, but the call screen
immediately showed:

```
could not establish signal connection: invalid token
```

The backend logs showed the same failure on the server side:

```
[LivekitService] LiveKit createRoom failed for call_...: invalid token
```

## Investigation

1. Confirmed the token embedded in the WebSocket URL
   (`wss://afrilingua-backend-v81a25sa.livekit.cloud/rtc/...&access_token=...`)
   was **not** the app's own login JWT. It's a separate, per-call token
   minted by `LivekitService.issueToken()` in
   `backend/src/calls/livekit.service.ts`, signed with
   `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`. Decoding it showed a
   correctly formed payload (right room, right grants, not expired).

2. Bypassed the app entirely and called LiveKit Cloud's own
   management API directly from a terminal script using the exact
   key/secret from `backend/.env`:

   ```js
   const client = new RoomServiceClient(httpUrl, apiKey, apiSecret);
   await client.listRooms();
   ```

   This returned `401 Unauthorized: invalid token` straight from
   LiveKit's servers — proving the app's token-signing code was not
   the problem.

3. Regenerated a brand-new API key/secret pair from the LiveKit Cloud
   dashboard (Project settings → API keys → Create new API key) and
   updated `backend/.env`. **Same error persisted** with the new,
   never-before-used key. This ruled out a revoked/stale key as the
   cause.

4. Found two LiveKit community forum threads describing the identical
   symptom (401/invalid token on fresh projects and fresh keys), both
   pointing to **system clock drift** as the cause: LiveKit signs the
   access token's `nbf` ("not valid before") claim using the *local*
   machine's clock at signing time. If that clock runs ahead of real
   time, the token appears "not yet valid" to LiveKit Cloud's server
   (which checks against the real time), and is rejected.

5. Confirmed clock drift directly by comparing the local system clock
   to a real external server's clock (`Date` response header from an
   HTTPS request to google.com):

   ```
   Local system time:         15:55:38
   Real time (Google server):  15:51:02
   ```

   The local machine's clock was running **~4–5 minutes fast**.

## Root cause

The machine running the backend had a system clock running several
minutes ahead of real time. This is not related to the LiveKit
credentials at all — any key/secret pair would have failed the same
way, since the `nbf` claim in every signed token was in the future
relative to LiveKit Cloud's real-world clock.

## Fix

Resynced the Windows system clock against a real time server:

- Settings → Time & Language → Date & time → **Sync now**
- (equivalent CLI: `w32tm /resync /force`, run as Administrator)

No code or credential changes were needed. The regenerated LiveKit
key from step 3 above is still what's in `backend/.env`, but the
original key would have worked equally well once the clock was fixed.

## Verification

After resyncing the clock:

1. Direct check against LiveKit Cloud's management API succeeded:
   ```
   SUCCESS, room count: 0
   ```
2. Re-ran the two-user tandem call flow in the browser (Guest ↔ Amara
   Diallo) end-to-end to confirm the call actually connects.

## Takeaway for next time

If LiveKit (or any service that validates JWT `nbf`/`exp` claims)
starts rejecting valid-looking, freshly-issued tokens with a generic
"invalid token"/401 error, check the local system clock against real
time **before** assuming the API key/secret is wrong.
