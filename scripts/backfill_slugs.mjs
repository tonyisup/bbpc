// @ts-nocheck
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const MAX_SLUG_LENGTH = 255;
const SUFFIX_RESERVE = 16;
const CHECK_ONLY = process.argv.includes("--check");

const prisma = new PrismaClient({
  adapter: new PrismaMssql(process.env.DATABASE_URL),
  log: ["error"],
});

const assignmentTypeLabels = {
  HOMEWORK: "homework",
  EXTRA_CREDIT: "extra-credit",
  BONUS: "bonus",
};

function slugify(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized
    .slice(0, MAX_SLUG_LENGTH - SUFFIX_RESERVE)
    .replace(/-+$/g, "");
}

function buildEpisodeSlugBase(episode) {
  return slugify(`episode-${episode.number}-${episode.title || "episode"}`);
}

function buildAssignmentSlugBase(assignment) {
  const userLabel =
    assignment.user.name?.trim() || `user-${assignment.userId.slice(0, 8)}`;
  const movieLabel = assignment.movie.title?.trim() || "assignment";

  return slugify(
    `episode-${assignment.episode.number}-${userLabel}-${movieLabel}-${
      assignmentTypeLabels[assignment.type]
    }`
  );
}

function allocateSlug(usedSlugs, baseSlug, fallbackLabel) {
  const safeBase = baseSlug || fallbackLabel;
  if (!usedSlugs.has(safeBase)) {
    usedSlugs.add(safeBase);
    return safeBase;
  }

  for (let suffix = 2; suffix < 10000; suffix += 1) {
    const candidate = `${safeBase.slice(
      0,
      MAX_SLUG_LENGTH - `-${suffix}`.length
    )}-${suffix}`;
    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate);
      return candidate;
    }
  }

  throw new Error(`Unable to allocate slug for ${safeBase}`);
}

async function loadExistingSlugs(model) {
  const rows =
    model === "episode"
      ? await prisma.episode.findMany({
          where: { slug: { not: null } },
          select: { id: true, slug: true },
        })
      : await prisma.assignment.findMany({
          where: { slug: { not: null } },
          select: { id: true, slug: true },
        });

  return new Map(rows.map((row) => [row.id, row.slug]));
}

async function backfillEpisodes() {
  const existingSlugs = await loadExistingSlugs("episode");
  const usedSlugs = new Set(existingSlugs.values());
  const episodes = await prisma.episode.findMany({
    orderBy: [{ number: "asc" }, { id: "asc" }],
    select: { id: true, slug: true, number: true, title: true },
  });

  const updates = [];

  for (const episode of episodes) {
    if (episode.slug) {
      continue;
    }

    const slug = allocateSlug(
      usedSlugs,
      buildEpisodeSlugBase(episode),
      "episode"
    );
    updates.push({ id: episode.id, slug });
  }

  if (!CHECK_ONLY) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.episode.update({
          where: { id: update.id },
          data: { slug: update.slug },
        })
      )
    );
  }

  return { total: episodes.length, updated: updates.length };
}

async function backfillAssignments() {
  const existingSlugs = await loadExistingSlugs("assignment");
  const usedSlugs = new Set(existingSlugs.values());
  const assignments = await prisma.assignment.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      slug: true,
      userId: true,
      type: true,
      user: { select: { name: true } },
      movie: { select: { title: true } },
      episode: { select: { number: true } },
    },
  });

  const updates = [];

  for (const assignment of assignments) {
    if (assignment.slug) {
      continue;
    }

    const slug = allocateSlug(
      usedSlugs,
      buildAssignmentSlugBase(assignment),
      "assignment"
    );
    updates.push({ id: assignment.id, slug });
  }

  if (!CHECK_ONLY) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.assignment.update({
          where: { id: update.id },
          data: { slug: update.slug },
        })
      )
    );
  }

  return { total: assignments.length, updated: updates.length };
}

async function verify() {
  const [
    nullEpisodeSlugs,
    nullAssignmentSlugs,
    duplicateEpisodes,
    duplicateAssignments,
  ] = await Promise.all([
    prisma.episode.count({ where: { slug: { equals: null } } }),
    prisma.assignment.count({ where: { slug: { equals: null } } }),
    prisma.$queryRaw`
      SELECT COUNT(*) AS count
      FROM (
        SELECT [slug]
        FROM [dbo].[Episode]
        WHERE [slug] IS NOT NULL
        GROUP BY [slug]
        HAVING COUNT(*) > 1
      ) dup
    `,
    prisma.$queryRaw`
      SELECT COUNT(*) AS count
      FROM (
        SELECT [slug]
        FROM [dbo].[Assignment]
        WHERE [slug] IS NOT NULL
        GROUP BY [slug]
        HAVING COUNT(*) > 1
      ) dup
    `,
  ]);

  const duplicateEpisodeCount = Number(duplicateEpisodes[0]?.count ?? 0);
  const duplicateAssignmentCount = Number(duplicateAssignments[0]?.count ?? 0);

  if (
    nullEpisodeSlugs ||
    nullAssignmentSlugs ||
    duplicateEpisodeCount ||
    duplicateAssignmentCount
  ) {
    throw new Error(
      `Slug verification failed: episode nulls=${nullEpisodeSlugs}, assignment nulls=${nullAssignmentSlugs}, episode dupes=${duplicateEpisodeCount}, assignment dupes=${duplicateAssignmentCount}`
    );
  }
}

async function main() {
  const [episodes, assignments] = await Promise.all([
    backfillEpisodes(),
    backfillAssignments(),
  ]);

  await verify();

  console.log(
    JSON.stringify(
      {
        checkOnly: CHECK_ONLY,
        episodes,
        assignments,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
