# BBPC Prediction Game UX Audit

**Date:** 2026-07-23  
**Scope:** The prediction journey on `/game`, centered on `PredictionGame`, `GameParticipation`, `AssignmentGamblingBoard`, and `BettingCoin`  
**Excluded:** The retired Tags feature and all `/tags` routes  
**Method:** Nielsen heuristics, Krug task clarity, accessibility review, source-backed interaction analysis, and responsive browser verification

## Executive summary

### Current score: **5 / 10**

The signed-out entry point is clear and visually coherent, but the authenticated prediction flow does not yet provide the clarity, feedback, accessibility, or integrity guarantees expected of a competition that changes standings and lets users risk points.

The largest issue is not cosmetic. The UI asks users to trust that picks are attributed, saved, and locked correctly, while the API accepts client-supplied user IDs and the component does not visibly communicate save failures or round-lock state. That trust boundary must be repaired before visual polish.

### Score by state

| State | Score | Assessment |
|---|---:|---|
| Signed-out `/game` entry | **8 / 10** | Strong hierarchy, one clear CTA, responsive at 390px, rules remain inspectable |
| Authenticated pick flow | **4 / 10** | Primary action is hidden, icon meanings rely on recall, save/error status is missing |
| Wager flow | **3 / 10** | Dense, very small controls, misleading promotional copy, weak risk and lock communication |
| End-to-end trust | **3 / 10** | Caller identity and open-round eligibility are not visibly or contractually secured at the application boundary |

## Evidence and limitations

### Runtime-verified

- Loaded the local `/game` route from the active `audit/taste-ui` branch.
- Verified the signed-out route at desktop width and a true 390px Playwright viewport.
- Confirmed no visible horizontal clipping or overflow at 390px.
- Confirmed the page has one H1, a clear current-round section, one sign-in CTA, standings, and progressively disclosed rules.
- Browser console showed no JavaScript errors on the signed-out route.
- `npm test` passed all 11 existing tests.

Screenshots:

- `verification/ux-audit/prediction-game-desktop-anonymous.png`
- `verification/ux-audit/prediction-game-mobile-anonymous.png`

### Source-verified but not authenticated-browser-verified

The authenticated component was audited directly from its implementation and server procedures. I did not create or impersonate an account, insert a database session, or fabricate authenticated browser output merely to produce screenshots. Therefore exact authenticated visual spacing should be rechecked with a legitimate test account after the first remediation batch.

## What already works

1. **The page passes the trunk test.** “WTFIR Game,” “Play the current round,” standings, and rules establish place and purpose quickly.
2. **The anonymous experience is consolidated.** `GameParticipation` shows one card and one “Sign in to play” CTA rather than rendering the full game shell plus another sign-in prompt.
3. **Mobile composition is sound at 390px.** The current-round card, posters, CTA, standings, rule accordions, and footer fit without visible horizontal overflow.
4. **The rules are inspectable without overwhelming the primary task.** Native `details` elements provide progressive disclosure.
5. **The current-round content remains visible before authentication.** Users can see the assignments and understand what they are signing in to do.
6. **Reduced-motion behavior exists globally.** The stylesheet suppresses repeated animation for users who request reduced motion.
7. **Guess selection is reversible in principle.** Selecting another rating replaces the optimistic choice rather than forcing a destructive reset flow.

## Findings

### Severity 4 — Competition integrity blockers

| # | Finding | Evidence | Heuristics / impact |
|---|---|---|---|
| 1 | **Guess ownership is controlled by client input instead of being derived from the authenticated session.** | `getUsersGuessesForAssignments` accepts `userId` and queries with it. `submitGuess` accepts `guesserId` and forwards it to `SubmitGuess`; the stored procedure receives no authenticated caller ID. | Trust, error prevention, authorization. An authenticated caller can request another user's guesses and can ask the server to submit under another user identity unless an unversioned database mechanism outside this call somehow compensates. |
| 2 | **The client does not enforce or explain whether rating picks are open or locked.** | `episodeStatus` is passed to the gambling board but is not used to disable rating buttons. `submitGuess` has no application-level open-round check; the versioned code only calls an unversioned stored procedure. | Error prevention and competition fairness. The visible contract permits edits during `recording` or `published`; if the database rejects them, the UI only rolls back silently. |

These two findings should block expansion or polishing of wagering. A competition UI cannot earn trust if user attribution and lock semantics are ambiguous at the real decision boundary.

### Severity 3 — Major task and accessibility failures

| # | Finding | Evidence | Heuristics / impact |
|---|---|---|---|
| 3 | **The primary task is hidden behind an unlabeled collapsed movie row.** | Every `AssignmentPrediction` starts with `userExpanded = false`, even when no guesses exist. The row shows a movie title and chevron, but no “Make picks,” completion count, or saved status. | Recognition rather than recall. A new player must infer that the entire row opens the form. |
| 4 | **There is no reliable user-visible save, success, failure, or retry state.** | Guess submission uses optimistic updates. `onError` logs to the console and rolls back; no toast or inline error is shown. Loading only disables a button; it does not announce “Saving.” Query errors are not rendered. | Visibility of system status; error recovery. Users cannot know whether a standings-affecting action persisted. |
| 5 | **Rating choices are icon-only, undersized, and lack selected-state semantics.** | Buttons contain only `RatingIcon`, use approximately 24–32px visual targets, expose a hover `title`, and do not use `aria-label` or `aria-pressed`. | Accessibility, real-world match, recognition. The proprietary Slater/Dollar/Waste/Goldbloom scale should not depend on memorized colors or hover tooltips. |
| 6 | **The wager board's interactive coins are not robust controls.** | `PopoverTrigger asChild` wraps a clickable `div`; the visible coin is `w-6 h-6`, labels are `text-[10px]`, and the seven-column layout compresses many outcomes into one board. | Keyboard access, touch access, clarity. Optional wagering becomes a decoding exercise and may be unreachable or error-prone for keyboard and motor users. |
| 7 | **Wagering does not present risk at the decision point.** | Rotating phrases include “You've got nothing to lose!” even though the rules state losing bets lose points. Balance appears only inside a small popover after a target is chosen. | Match with the real world, trust, error prevention. Playful copy directly contradicts the consequence. |
| 8 | **Call and voicemail actions are icon-only and context-free.** | `Call` renders only a phone icon without an accessible label. The default `Message` button exposes a count plus icon but no action label. | Recognition and accessibility. Users must connect these controls to bonus rules located much farther down the page. |

### Severity 2 — Friction, ambiguity, and maintainability problems

| # | Finding | Evidence | Heuristics / impact |
|---|---|---|---|
| 9 | **Completed and incomplete assignment summaries are hard to scan.** | Collapsed summaries show selected rating icons without persistent host labels; host identity is only in a pointer `title`. No “2 of 3 picked” or “Complete” state is visible. | Recognition rather than recall; status visibility. |
| 10 | **An expanded incomplete assignment cannot be collapsed.** | The collapse button only renders when `hasAllGuesses` is true. | User control and freedom. Opening the wrong movie forces the user through a long section or a page scroll. |
| 11 | **Authenticated users can see a false sign-in state while the second session query resolves.** | `GameParticipation` already uses `useSession`, then `PredictionGame` separately calls `api.auth.getSession` and treats `undefined` as signed out. | Consistency and status visibility. This can flash “Please Sign In” after NextAuth has already authenticated the user. |
| 12 | **Error and empty states collapse into loading or disappearance.** | Host/rating errors continue to render “Loading prediction game...”; bulk-query errors are not distinguished; `hasActiveSeason === false` returns `null`. | Diagnose and recover. Users cannot distinguish no season, no assignments, a network failure, or a slow request. |
| 13 | **The locked-wager message can be factually wrong.** | Any `recording` or `published` episode sets `isLocked`, but the popover always says “Bet confirmed and locked,” including when the user never placed that bet. | Match with reality and trust. The correct state may be “Betting closed.” |
| 14 | **Bet errors use blocking browser alerts and mutation failures lack recovery UI.** | Invalid or insufficient amounts call `alert`; `submitPoints` has no visible `onError` handling in this component. | Error recovery and accessibility. Alerts separate the error from the field and do not preserve an inline recovery path. |
| 15 | **Instructions and functionality are structurally scattered.** | The component description only mentions rating predictions, while wagering, calling, and voicemail appear later. The meaning of rating icons and wagering rules lives below the current round. | Match and recognition. Users encounter controls before the minimum explanation needed to use them confidently. |
| 16 | **The authenticated data path duplicates requests and state ownership.** | The wrapper bulk-fetches guesses/audio/wagers, then each assignment mounts the same query family again with `initialData`; authentication is also queried twice. | Efficiency and maintainability. More state owners make loading flicker and stale-status bugs more likely. |
| 17 | **The current round has no explicit open/closed/deadline indicator.** | The visible episode title can say “SKIPPING A WEEK!” while the CTA still invites participation; neither the anonymous card nor prediction header states when picks close. | Status visibility and confidence. Users cannot tell whether this is an active round from the task area alone. |

### Severity 1 — Visual polish

| # | Finding | Evidence | Heuristics / impact |
|---|---|---|---|
| 18 | **The nested “Prediction Game” panel repeats page-level messaging.** | `/game` already establishes “WTFIR Game” and “Play the current round”; the authenticated component adds another bordered shell, title, and generic description. | Minimalist design. This spends vertical space without clarifying state or next action. |
| 19 | **The wager board uses attention-seeking motion instead of informational hierarchy.** | Rotating slogans, a shine sweep, rotating dice, gradients, and hover rotation compete with the actual point decision. | Minimalist design. Reduced-motion support is good, but the default animation is still distracting. |

## Recommended target flow

The right redesign is not a reskin. It should move the interaction from “open cryptic cards and hope autosave worked” to a stateful, explainable round workflow.

### 1. Round status header

Show, in one compact row:

- **Round open / Picks locked / No active season / Could not load**
- closing event or deadline, if known
- current points balance
- progress: “3 of 6 host picks saved”

This status must come from a server-owned round-state contract, not from presentation logic scattered across components.

### 2. Assignment cards

Each movie card should expose:

- movie title
- explicit state: **Needs picks**, **2 of 3 saved**, or **Complete**
- a labeled action: **Make picks** or **Edit picks**
- always-available expand/collapse control
- saved summaries in the form “MCP — Dollar,” not unlabeled icon sequences

Auto-expand the first incomplete assignment. Leave completed assignments collapsed.

### 3. Rating controls

For each host, render a real single-choice group:

- 44px minimum targets
- icon plus persistent short label
- `aria-pressed` or radio-group semantics
- visible keyboard focus
- deterministic order
- a compact inline legend for the proprietary scale

Autosave can remain, but every host row or assignment must show **Saving…**, **Saved**, or **Couldn’t save — Retry**. Do not rely on color or optimistic highlighting as proof of persistence.

### 4. Wagering as progressive disclosure

After all picks are saved, offer a separate optional section:

- “Wager points — optional”
- current balance and maximum available amount before any choice
- stable explanation of 1x/2x/3x outcomes
- semantically correct buttons with at least 44px targets
- clear draft/pending/locked/resolved states
- an explicit confirmation or review step for consequential point changes
- inline validation and retry

Remove “nothing to lose” and ornamental continuous motion. The tone can remain playful without contradicting the risk.

### 5. Secondary participation actions

Render labeled controls such as:

- **Call the show**
- **Record a voice message**

Add one sentence explaining that these may qualify for discretionary bonus points. Keep them visually secondary to saving picks.

## Prioritized remediation plan

No implementation should begin until this plan is approved.

### Phase 0 — Repair the trust boundary

1. Remove `userId` and `guesserId` from client-controlled guess inputs.
2. Derive the acting user exclusively from `ctx.session.user.id` for reads and writes.
3. Enforce open-round eligibility server-side in the same transaction as the write.
4. Version the guess-write semantics in repository code or add contract tests around the stored procedure.
5. Return a typed round state and typed rejection reasons such as `ROUND_LOCKED`.

**Acceptance gate:** cross-user access is impossible by API shape; locked-round writes fail server-side; tests prove both.

### Phase 1 — Make picking obvious and trustworthy

1. Replace default-collapsed mystery rows with progress-aware assignment cards.
2. Auto-expand the first incomplete assignment.
3. Add labeled, accessible rating controls and persistent scale guidance.
4. Add explicit saving, saved, failure, and retry states.
5. Keep collapse available regardless of completion.

**Acceptance gate:** a first-time mobile user can identify how to pick without opening the rules; every saved pick has a visible persistence state.

### Phase 2 — Separate and harden wagering

1. Move wagering into an optional disclosure after completed picks.
2. Replace the seven-column coin diagram with outcome groups that remain legible at 390px.
3. Show balance, risk, multiplier, and lock status before submission.
4. Use semantic buttons, 44px targets, inline validation, mutation error recovery, and accurate lock copy.
5. Remove continuous promotional animation.

**Acceptance gate:** keyboard-only and touch users can place, edit, clear, and understand a wager without hidden hover text or browser alerts.

### Phase 3 — Consolidate state and secondary actions

1. Use one authentication source.
2. Give loading, empty, no-season, locked, and error states distinct UI.
3. Consolidate assignment queries under one owner and invalidate precise query keys.
4. Label call and voicemail actions and explain their game relevance.
5. Replace the redundant nested “Prediction Game” heading with round status and progress.

### Phase 4 — Verification and documentation

Add behavior tests rather than more source-regex contracts:

- API tests for session-derived identity and locked-round rejection
- component tests for no picks, partial picks, complete, saving, save error, retry, locked, no season, and load failure
- keyboard and accessible-name checks for every rating, wager, call, and voicemail control
- viewport checks at 390px, tablet, and desktop
- authenticated Playwright screenshots for incomplete, complete, and locked rounds
- an end-to-end test proving a persisted pick survives reload

Then run:

- `npm test`
- `npm run lint`
- `npm run build`

## 10 / 10 acceptance criteria

The component reaches 10 / 10 when:

1. The authenticated session is the only source of guess ownership.
2. The server, not the client, decides whether the round accepts writes.
3. A new player can identify the first action and current progress without inference.
4. All proprietary rating choices have persistent names and accessible selection semantics.
5. Every consequential mutation communicates saving, success, failure, retry, and lock state.
6. All targets meet touch and keyboard requirements.
7. Wager risk and balance are visible before commitment; copy never contradicts consequences.
8. Empty, no-season, locked, and error states are distinct.
9. The flow remains usable without hover, color perception, or animation.
10. Authenticated browser tests and screenshots verify the real flow at mobile and desktop widths.

## Verification status

- Local `/game` desktop visual check: **PASS**
- Local `/game` 390px Playwright visual check: **PASS**
- Visible horizontal overflow at 390px: **NONE OBSERVED**
- Browser console on signed-out route: **PASS — no JS errors**
- `npm test`: **PASS — 11/11**
- Authenticated browser interaction: **NOT RUN — legitimate test session unavailable**
- Lint/build: **Not required for this documentation-only audit; must run after implementation**
