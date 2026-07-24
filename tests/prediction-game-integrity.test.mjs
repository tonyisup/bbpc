import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PredictionRoundError,
  PredictionRoundState,
  getPredictionRoundState,
} from "../src/lib/predictionRound.mjs";
import {
  getGuessesForAssignmentForUser,
  getUsersGuessesForAssignments,
  submitGuess,
} from "../src/server/api/routers/reviewProcedures.mjs";

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

test("guess reads derive ownership from the authenticated session", async () => {
  const router = read("src/server/api/routers/reviewRouter.ts");
  const bulkReadStart = router.indexOf("getUsersGuessesForAssignments:");
  const bulkReadEnd = router.indexOf(
    "getUsersGamblingPointsForAssignments:",
    bulkReadStart
  );
  const bulkRead = router.slice(bulkReadStart, bulkReadEnd);
  assert.doesNotMatch(bulkRead, /userId:\s*z\.string/);

  const singleReadStart = router.indexOf("getGuessesForAssignmentForUser:");
  const singleReadEnd = router.indexOf("submitGuess:", singleReadStart);
  const singleRead = router.slice(singleReadStart, singleReadEnd);
  assert.doesNotMatch(singleRead, /userId:\s*z\.string/);

  const assignmentReviews = [
    { id: "review-1", assignmentId: "assignment-1" },
    { id: "review-2", assignmentId: "assignment-2" },
  ];
  const guesses = [
    {
      id: "session-guess-1",
      userId: "session-user",
      assignmntReviewId: "review-1",
      assignmentReview: assignmentReviews[0],
    },
    {
      id: "session-guess-2",
      userId: "session-user",
      assignmntReviewId: "review-2",
      assignmentReview: assignmentReviews[1],
    },
    {
      id: "forged-user-guess",
      userId: "forged-user",
      assignmntReviewId: "review-1",
      assignmentReview: assignmentReviews[0],
    },
  ];
  /** @type {string[]} */
  const queriedUserIds = [];
  const ctx = {
    session: { user: { id: "session-user" } },
    db: {
      assignmentReview: {
        findMany: async (/** @type {any} */ args) => {
          const assignmentId = args.where.assignmentId;
          const assignmentIds = assignmentId.in ?? [assignmentId];
          return assignmentReviews.filter((review) =>
            assignmentIds.includes(review.assignmentId)
          );
        },
      },
      guess: {
        findMany: async (/** @type {any} */ args) => {
          queriedUserIds.push(args.where.userId);
          return guesses.filter(
            (guess) =>
              args.where.assignmntReviewId.in.includes(
                guess.assignmntReviewId
              ) && guess.userId === args.where.userId
          );
        },
      },
    },
  };

  const bulk = await getUsersGuessesForAssignments({
    ctx: /** @type {any} */ (ctx),
    input: /** @type {any} */ ({
      assignmentIds: ["assignment-1", "assignment-2"],
      userId: "forged-user",
    }),
  });
  assert.deepEqual(
    Object.values(bulk)
      .flat()
      .map((guess) => guess.id),
    ["session-guess-1", "session-guess-2"]
  );

  const single = await getGuessesForAssignmentForUser({
    ctx: /** @type {any} */ (ctx),
    input: /** @type {any} */ ({
      assignmentId: "assignment-1",
      userId: "forged-user",
    }),
  });
  assert.deepEqual(
    single.map((guess) => guess.id),
    ["session-guess-1"]
  );
  assert.deepEqual(queriedUserIds, ["session-user", "session-user"]);
});

/**
 * @param {{
 *   assignmentExists?: boolean,
 *   episodeStatus?: string,
 *   playable?: boolean,
 *   validHost?: boolean,
 *   validRating?: boolean
 * }} [options]
 */
const createSubmitGuessFixture = (options = {}) => {
  let transactionActive = false;
  let assignmentCheckedInsideTransaction = false;
  /** @type {unknown[][]} */
  const executeValues = [];
  const transaction = {
    assignment: {
      findUnique: async () => {
        assignmentCheckedInsideTransaction = transactionActive;
        if (options.assignmentExists === false) return null;

        return {
          playable: options.playable ?? true,
          episode: { status: options.episodeStatus ?? "next" },
          assignmentReviews:
            options.validHost === false ? [] : [{ id: "review-1" }],
        };
      },
    },
    rating: {
      findUnique: async () =>
        options.validRating === false ? null : { id: "rating-1" },
    },
    $executeRaw: async (
      /** @type {TemplateStringsArray} */ _strings,
      /** @type {unknown[]} */ ...values
    ) => {
      executeValues.push(values);
      return 1;
    },
  };
  const ctx = {
    session: { user: { id: "session-user" } },
    db: {
      $transaction: async (
        /** @type {(tx: any) => Promise<any>} */ callback
      ) => {
        transactionActive = true;
        try {
          return await callback(transaction);
        } finally {
          transactionActive = false;
        }
      },
    },
  };

  return {
    ctx,
    executeValues,
    wasAssignmentCheckedInsideTransaction: () =>
      assignmentCheckedInsideTransaction,
  };
};

const validGuessInput = {
  assignmentId: "assignment-1",
  hostId: "host-1",
  ratingId: "rating-1",
};

test("guess writes use session ownership and transaction-scoped validation", async () => {
  const router = read("src/server/api/routers/reviewRouter.ts");
  const submitStart = router.indexOf("submitGuess:");
  const submitEnd = router.indexOf("updateAudioMessage:", submitStart);
  const submit = router.slice(submitStart, submitEnd);
  assert.doesNotMatch(submit, /guesserId:\s*z\.string/);

  const fixture = createSubmitGuessFixture();
  const result = await submitGuess({
    ctx: /** @type {any} */ (fixture.ctx),
    input: /** @type {any} */ ({
      ...validGuessInput,
      guesserId: "forged-user",
    }),
  });

  assert.equal(result, 1);
  assert.equal(fixture.wasAssignmentCheckedInsideTransaction(), true);
  assert.deepEqual(fixture.executeValues, [
    ["assignment-1", "host-1", "session-user", "rating-1"],
  ]);
});

test("guess writes reject missing, locked, and non-playable assignments", async () => {
  /** @type {Array<[Parameters<typeof createSubmitGuessFixture>[0], string]>} */
  const testCases = [
    [{ assignmentExists: false }, PredictionRoundError.ASSIGNMENT_NOT_FOUND],
    [{ episodeStatus: "recording" }, PredictionRoundError.ROUND_LOCKED],
    [{ playable: false }, PredictionRoundError.ROUND_LOCKED],
  ];

  for (const [options, expectedMessage] of testCases) {
    const fixture = createSubmitGuessFixture(options);
    await assert.rejects(
      submitGuess({
        ctx: /** @type {any} */ (fixture.ctx),
        input: validGuessInput,
      }),
      (error) => error instanceof Error && error.message === expectedMessage
    );
    assert.equal(fixture.executeValues.length, 0);
    assert.equal(fixture.wasAssignmentCheckedInsideTransaction(), true);
  }
});

test("guess writes reject invalid host and rating targets", async () => {
  /** @type {Array<[Parameters<typeof createSubmitGuessFixture>[0], string]>} */
  const testCases = [
    [{ validHost: false }, PredictionRoundError.INVALID_HOST],
    [{ validRating: false }, PredictionRoundError.INVALID_RATING],
  ];

  for (const [options, expectedMessage] of testCases) {
    const fixture = createSubmitGuessFixture(options);
    await assert.rejects(
      submitGuess({
        ctx: /** @type {any} */ (fixture.ctx),
        input: validGuessInput,
      }),
      (error) => error instanceof Error && error.message === expectedMessage
    );
    assert.equal(fixture.executeValues.length, 0);
  }
});

test("prediction cards expose progress, accessible choices, and save recovery", () => {
  const game = read("src/components/PredictionGame.tsx");
  const participation = read("src/components/GameParticipation.tsx");
  const scoring = read("src/server/predictionScoring.ts");
  const sqlGames = read("src/server/sql/games.ts");
  const reviewRouter = read("src/server/api/routers/reviewRouter.ts");
  const gamePage = read("src/app/game/page.tsx");

  assert.doesNotMatch(game, /api\.auth\.getSession/);
  assert.match(participation, /userId=\{user\.appUserId\}/);
  assert.match(
    participation,
    /backend === "convex"[\s\S]*<ConvexPredictionGame/u
  );
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
  assert.match(game, /playable=\{assignment\.playable\}/);
  assert.match(game, /sizes="40px"/);
  assert.match(game, /h-\[60px\] w-10/);
  assert.match(game, /alt=""/);
  assert.match(
    read("src/components/Episode.tsx"),
    /poster: assignment\.movie\.poster/
  );
  assert.match(
    read("src/components/Episode.tsx"),
    /playable: assignment\.playable/
  );
  assert.match(game, /Call the show/);
  assert.match(game, /Record a voice message/);
  assert.match(reviewRouter, /getPredictionScoring/);
  assert.match(scoring, /lookupID: \{ in: \[\.\.\.predictionPointTypes\] \}/);
  assert.match(scoring, /gameType: \{ lookupID: "wtfir" \}/);
  assert.match(gamePage, /getConvexPredictionScoring\(\)/);
  assert.match(sqlGames, /getPredictionScoring\(db\)/);
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
  assert.match(board, /getHostIdentifiersForLookupId/);
  assert.match(board, /getHostLabelForLookupId\("mcp-fonso-rating-guess-2x"\)/);
  assert.match(board, /getHostLabelForLookupId\("all-rating-guess-3x"\)/);
  assert.doesNotMatch(board, /firstName\(hosts\[[012]\]/);
  assert.match(board, /playable:\s*boolean/);
  assert.match(board, /getPredictionRoundState\(episodeStatus, playable\)/);
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

test("legacy rating controls use native buttons for click interactions", () => {
  const segment = read("src/components/GameSegment.tsx");
  const ratingButtonStart = segment.indexOf("const RatingButton:");
  const ratingButton = segment.slice(ratingButtonStart);

  assert.match(ratingButton, /<button\s+type="button"/);
  assert.match(ratingButton, /onClick=\{handleClick\}/);
  assert.match(segment, /label=\{rating\.name\}/);
  assert.match(segment, /label:\s*string/);
  assert.match(ratingButton, /aria-label=\{label\}/);
  assert.doesNotMatch(ratingButton, /<div[^>]*onClick=/);
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
