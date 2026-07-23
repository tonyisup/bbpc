import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PredictionRoundError,
  PredictionRoundState,
  getPredictionRoundState,
} from "../src/lib/predictionRound.mjs";

const read = (/** @type {string} */ path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("prediction round state only opens the upcoming playable episode", () => {
  assert.equal(getPredictionRoundState("next"), PredictionRoundState.OPEN);
  assert.equal(
    getPredictionRoundState("next", false),
    PredictionRoundState.LOCKED
  );
  assert.equal(
    getPredictionRoundState("recording"),
    PredictionRoundState.LOCKED
  );
  assert.equal(
    getPredictionRoundState("published"),
    PredictionRoundState.LOCKED
  );
  assert.equal(
    getPredictionRoundState("draft"),
    PredictionRoundState.UNAVAILABLE
  );
  assert.equal(PredictionRoundError.ROUND_LOCKED, "ROUND_LOCKED");
});

test("guess ownership comes only from the authenticated session", () => {
  const router = read("src/server/api/routers/reviewRouter.ts");
  const predictionGame = read("src/components/PredictionGame.tsx");
  const legacyGame = read("src/components/GameSegment.tsx");

  const bulkReadStart = router.indexOf("getUsersGuessesForAssignments:");
  const bulkReadEnd = router.indexOf(
    "getUsersGamblingPointsForAssignments:",
    bulkReadStart
  );
  const bulkRead = router.slice(bulkReadStart, bulkReadEnd);
  assert.doesNotMatch(bulkRead, /userId:\s*z\.string/);
  assert.match(bulkRead, /userId:\s*ctx\.session\.user\.id/);

  const singleReadStart = router.indexOf("getGuessesForAssignmentForUser:");
  const singleReadEnd = router.indexOf("submitGuess:", singleReadStart);
  const singleRead = router.slice(singleReadStart, singleReadEnd);
  assert.doesNotMatch(singleRead, /userId:\s*z\.string/);
  assert.match(singleRead, /userId:\s*ctx\.session\.user\.id/);

  const submitStart = router.indexOf("submitGuess:");
  const submitEnd = router.indexOf("updateAudioMessage:", submitStart);
  const submit = router.slice(submitStart, submitEnd);
  assert.doesNotMatch(submit, /guesserId:\s*z\.string/);
  assert.match(submit, /@guesserId=\$\{ctx\.session\.user\.id\}/);
  assert.doesNotMatch(predictionGame, /guesserId:/);
  assert.doesNotMatch(legacyGame, /guesserId:/);
});

test("guess writes validate round state inside the write transaction", () => {
  const router = read("src/server/api/routers/reviewRouter.ts");
  const submitStart = router.indexOf("submitGuess:");
  const submitEnd = router.indexOf("updateAudioMessage:", submitStart);
  const submit = router.slice(submitStart, submitEnd);

  const transactionIndex = submit.indexOf("$transaction(async");
  const assignmentCheckIndex = submit.indexOf("tx.assignment.findUnique");
  const roundCheckIndex = submit.indexOf("getPredictionRoundState");
  const writeIndex = submit.indexOf("tx.$executeRaw");

  assert.notEqual(transactionIndex, -1);
  assert.ok(transactionIndex < assignmentCheckIndex);
  assert.ok(assignmentCheckIndex < roundCheckIndex);
  assert.ok(roundCheckIndex < writeIndex);
  assert.match(submit, /PredictionRoundError\.ROUND_LOCKED/);
  assert.match(submit, /assignment\.playable/);
  assert.match(submit, /where:\s*\{\s*review:\s*\{\s*userId:\s*input\.hostId/);
});

test("prediction cards expose progress, accessible choices, and save recovery", () => {
  const game = read("src/components/PredictionGame.tsx");
  const participation = read("src/components/GameParticipation.tsx");
  const scoring = read("src/server/predictionScoring.ts");
  const reviewRouter = read("src/server/api/routers/reviewRouter.ts");
  const gamePage = read("src/app/game/page.tsx");

  assert.doesNotMatch(game, /api\.auth\.getSession/);
  assert.match(participation, /userId=\{session\.user\.id\}/);
  assert.match(game, /firstIncompleteIndex/);
  assert.match(game, /Make picks/);
  assert.match(game, /View or edit picks/);
  assert.match(game, /Hide picks/);
  assert.match(game, /md:grid-cols-3/);
  assert.match(game, /of \{totalPickCount\} picks saved/);
  assert.match(game, /type="radio"/);
  assert.match(game, /checked=\{isSelected\}/);
  assert.match(
    game,
    /name=\{`prediction-\$\{assignment\.id\}-\$\{host\.id\}`\}/
  );
  assert.match(game, /min-h-11/);
  assert.match(game, /Saving…/);
  assert.match(game, /Saved just now/);
  assert.match(game, /Couldn’t save/);
  assert.match(game, /Retry save/);
  assert.match(game, /Picks locked/);
  assert.match(game, /Wager points/);
  assert.match(game, /optional/);
  assert.match(game, /How prediction scoring works/);
  assert.match(game, /Correct host/);
  assert.match(game, /points total/);
  assert.match(game, /assignment\.movie\?\.poster/);
  assert.match(game, /sizes="40px"/);
  assert.match(game, /h-\[60px\] w-10/);
  assert.match(game, /alt=""/);
  assert.match(
    read("src/components/Episode.tsx"),
    /poster: assignment\.movie\.poster/
  );
  assert.match(game, /Call the show/);
  assert.match(game, /Record a voice message/);
  assert.match(reviewRouter, /getPredictionScoring/);
  assert.match(scoring, /lookupID: \{ in: \[\.\.\.predictionPointTypes\] \}/);
  assert.match(scoring, /gameType: \{ lookupID: "wtfir" \}/);
  assert.match(gamePage, /getPredictionScoring\(db\)/);
  assert.doesNotMatch(gamePage, /Each correct host rating earns 1 point/);
});

test("wagering presents risk, confirmation, recovery, and accurate lock states", () => {
  const board = read("src/components/AssignmentGamblingBoard.tsx");
  const wager = read("src/components/BettingCoin.tsx");

  assert.doesNotMatch(board, /motion\/react|AnimatePresence|setInterval/);
  assert.doesNotMatch(board, /nothing to lose/i);
  assert.match(board, /Wagers can lose points/);
  assert.match(board, /Available/);
  assert.match(board, /Betting is closed/);
  assert.match(board, /One host/);
  assert.match(board, /Two hosts/);
  assert.match(board, /All hosts/);
  assert.match(board, /payoutMultiplier=\{getPayoutMultiplier/);
  assert.match(board, /payoutTone="standard"/);
  assert.match(board, /payoutTone="boosted"/);
  assert.match(board, /payoutTone="maximum"/);

  assert.doesNotMatch(wager, /alert\(/);
  assert.doesNotMatch(wager, /PopoverTrigger/);
  assert.match(wager, /Points to risk/);
  assert.match(wager, /Review wager/);
  assert.match(wager, /Confirm wager/);
  assert.match(wager, /Clear wager/);
  assert.match(wager, /role="alert"/);
  assert.match(wager, /min-h-11/);
  assert.match(wager, /Betting closed for this outcome/);
  assert.match(wager, /Couldn’t save this wager/);
  assert.match(wager, /Pays/);
  assert.match(wager, /border-cyan-300/);
  assert.match(wager, /border-amber-300/);
  assert.match(wager, /border-rose-300/);
});

test("assignment wagers are locked and target-validated inside the transaction", () => {
  const router = read("src/server/api/routers/gamblingRouter.ts");
  const submitStart = router.indexOf("submitPoints:");
  const submitEnd = router.indexOf("getForAssignment:", submitStart);
  const submit = router.slice(submitStart, submitEnd);

  const transactionIndex = submit.indexOf("$transaction(async");
  const assignmentCheckIndex = submit.indexOf("tx.assignment.findUnique");
  const roundCheckIndex = submit.indexOf("getPredictionRoundState");
  const writeIndex = submit.indexOf("tx.gamblingPoints");

  assert.notEqual(transactionIndex, -1);
  assert.ok(transactionIndex < assignmentCheckIndex);
  assert.ok(assignmentCheckIndex < roundCheckIndex);
  assert.ok(roundCheckIndex < writeIndex);
  assert.match(submit, /PredictionRoundError\.ROUND_LOCKED/);
  assert.match(submit, /PredictionRoundError\.INVALID_HOST/);
  assert.match(submit, /PredictionRoundError\.WAGER_TYPE_UNAVAILABLE/);
  assert.match(submit, /lookupId\.endsWith\("-1x"\)/);
  assert.match(submit, /requiresTarget !== Boolean\(targetUserId\)/);
  assert.match(submit, /z\.number\(\)\.int\(\)\.nonnegative\(\)/);
});
