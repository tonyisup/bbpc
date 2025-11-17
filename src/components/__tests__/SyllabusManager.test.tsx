import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Assignment, Episode, Movie } from "@prisma/client";
import { type ComponentProps } from "react";
import { vi } from "vitest";

type MutationKey = "add" | "remove" | "reorder" | "updateNotes";

type MutationOptions = {
  onSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
};

const mutationSpies: Record<MutationKey, ReturnType<typeof vi.fn>> = {
  add: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
  updateNotes: vi.fn(),
};

const successFactories: Record<MutationKey, ((input: unknown) => unknown) | undefined> = {
  add: undefined,
  remove: undefined,
  reorder: undefined,
  updateNotes: undefined,
};

function createUseMutationMock(key: MutationKey) {
  return (opts?: MutationOptions) => ({
    mutate: (input: unknown) => {
      mutationSpies[key](input);
      const payloadFactory = successFactories[key];
      if (payloadFactory) {
        const payload = payloadFactory(input);
        opts?.onSuccess?.(payload, input, undefined);
      }
    },
  });
}

const setMutationSuccess = (
  key: MutationKey,
  factory?: (input: unknown) => unknown,
) => {
  successFactories[key] = factory;
};

vi.mock("@/trpc/react", () => ({
  api: {
    syllabus: {
      add: { useMutation: createUseMutationMock("add") },
      remove: { useMutation: createUseMutationMock("remove") },
      reorder: { useMutation: createUseMutationMock("reorder") },
      updateNotes: { useMutation: createUseMutationMock("updateNotes") },
    },
  },
}));

vi.mock("../MovieFind", () => {
  const mockMovie = {
    id: "movie-mock",
    title: "Mock Movie",
    year: 1999,
    poster: null,
    url: "mock-url",
  } as Movie;

  return {
    __esModule: true,
    default: ({ selectMovie }: { selectMovie: (movie: Movie) => void }) => (
      <div data-testid="movie-find">
        Movie search mock
        <button type="button" onClick={() => selectMovie(mockMovie)}>
          Select mock movie
        </button>
      </div>
    ),
  };
});

vi.mock("../MovieInlinePreview", () => ({
  __esModule: true,
  default: ({ movie }: { movie: Movie }) => (
    <div data-testid={`inline-preview-${movie.id}`}>{movie.title}</div>
  ),
}));

import SyllabusManager from "../SyllabusManager";

type SyllabusManagerProps = ComponentProps<typeof SyllabusManager>;
type SyllabusItem = SyllabusManagerProps["initialSyllabus"][number];

const uniqueId = (() => {
  let counter = 0;
  return (prefix: string) => `${prefix}-${counter++}`;
})();

const createMovie = (overrides?: Partial<Movie>): Movie =>
  ({
    id: overrides?.id ?? uniqueId("movie"),
    title: overrides?.title ?? "Sample Movie",
    year: overrides?.year ?? 2000,
    poster: overrides?.poster ?? "poster.jpg",
    url: overrides?.url ?? "https://example.com",
    ...overrides,
  }) as Movie;

const createEpisode = (overrides?: Partial<Episode>): Episode =>
  ({
    id: overrides?.id ?? uniqueId("episode"),
    number: overrides?.number ?? 1,
    title: overrides?.title ?? "Episode Title",
    recording: null,
    date: null,
    description: null,
    assignments: [],
    bangers: [],
    extras: [],
    links: [],
    shows: [],
    AudioEpisodeMessage: [],
    ...overrides,
  }) as Episode;

const createAssignment = (overrides?: Partial<Assignment>): Assignment =>
  ({
    id: overrides?.id ?? uniqueId("assignment"),
    userId: overrides?.userId ?? "user-123",
    episodeId: overrides?.episodeId ?? uniqueId("episode"),
    movieId: overrides?.movieId ?? uniqueId("movie"),
    type: overrides?.type ?? "HOMEWORK",
    Episode: overrides?.Episode ?? createEpisode(),
    Movie: overrides?.Movie ?? createMovie(),
    User: overrides?.User,
    assignmentReviews: [],
    audioMessages: [],
    gamblingPoints: [],
    syllabus: [],
    ...overrides,
  }) as Assignment;

const createSyllabusItem = (overrides?: Partial<SyllabusItem>): SyllabusItem => {
  const movie = overrides?.Movie ?? createMovie();
  return {
    id: overrides?.id ?? uniqueId("syllabus"),
    userId: overrides?.userId ?? "user-123",
    movieId: movie.id,
    order: overrides?.order ?? 1,
    notes: overrides?.notes ?? null,
    createdAt: overrides?.createdAt ?? new Date(),
    assignmentId: overrides?.assignmentId ?? overrides?.Assignment?.id ?? null,
    Assignment: overrides?.Assignment ?? null,
    Movie: movie,
  } as SyllabusItem;
};

const renderComponent = (props?: Partial<SyllabusManagerProps>) => {
  const assignedAssignment = createAssignment({
    id: "assignment-1",
    Episode: createEpisode({ number: 7, title: "Lucky Episode" }),
  });

  const defaultProps: SyllabusManagerProps = {
    userId: "user-123",
    initialSyllabus: [
      createSyllabusItem({
        id: "syllabus-1",
        Movie: createMovie({ id: "movie-1", title: "First Movie" }),
        assignmentId: null,
        order: 3,
      }),
      createSyllabusItem({
        id: "syllabus-2",
        Movie: createMovie({ id: "movie-2", title: "Second Movie" }),
        assignmentId: null,
        order: 2,
      }),
      createSyllabusItem({
        id: "syllabus-3",
        Movie: createMovie({ id: "movie-3", title: "Assigned Movie" }),
        assignmentId: assignedAssignment.id,
        Assignment: assignedAssignment,
        notes: "Existing notes",
        order: 1,
      }),
    ],
  };

  return render(<SyllabusManager {...defaultProps} {...props} />);
};

const resetMutations = () => {
  (Object.values(mutationSpies) as vi.Mock[]).forEach((mock) => mock.mockClear());
  (Object.keys(successFactories) as MutationKey[]).forEach((key) => {
    successFactories[key] = undefined;
  });
};

describe("SyllabusManager", () => {
  beforeEach(() => {
    resetMutations();
  });

  it("toggles the movie search when Add Movie is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.queryByTestId("movie-find")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add movie/i }));
    expect(screen.getByTestId("movie-find")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByTestId("movie-find")).not.toBeInTheDocument();
  });

  it("moves a movie down in the unassigned list and calls reorder mutation", async () => {
    const user = userEvent.setup();
    renderComponent();

    const moveDownButton = screen.getByRole("button", {
      name: /move First Movie down/i,
    });

    await user.click(moveDownButton);

    const unassignedRegion = screen.getByRole("region", { name: /unassigned movies/i });
    await screen.findByRole("heading", { name: /second movie/i });

    await waitFor(() => {
      const headings = within(unassignedRegion)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent);
      expect(headings).toEqual(["Second Movie", "First Movie"]);
    });

    expect(mutationSpies.reorder).toHaveBeenCalledWith({
      userId: "user-123",
      syllabus: [
        { id: "syllabus-2", order: 3 },
        { id: "syllabus-1", order: 2 },
        { id: "syllabus-3", order: 1 },
      ],
    });
  });

  it("saves edited notes and closes the editor after mutation success", async () => {
    const user = userEvent.setup();

    const targetItem = createSyllabusItem({
      id: "syllabus-notes",
      Movie: createMovie({ id: "movie-notes", title: "Notes Movie" }),
      notes: null,
    });

    setMutationSuccess("updateNotes", () => ({
      ...targetItem,
      notes: "Fresh idea",
    }));

    renderComponent({
      initialSyllabus: [
        targetItem,
        createSyllabusItem({
          id: "syllabus-extra",
          Movie: createMovie({ id: "movie-extra", title: "Extra Movie" }),
        }),
      ],
    });

    await user.click(
      screen.getByRole("button", { name: /edit notes for Notes Movie/i }),
    );

    const textarea = screen.getByLabelText(/notes for Notes Movie/i);
    await user.clear(textarea);
    await user.type(textarea, "   Fresh idea   ");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mutationSpies.updateNotes).toHaveBeenCalledWith({
      id: "syllabus-notes",
      notes: "Fresh idea",
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: /notes for Notes Movie/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Fresh idea")).toBeInTheDocument();
    });
  });

  it("removes a movie from the list after successful deletion", async () => {
    const user = userEvent.setup();

    const removable = createSyllabusItem({
      id: "syllabus-remove",
      Movie: createMovie({ id: "movie-remove", title: "Removable Movie" }),
    });

    setMutationSuccess("remove", () => "syllabus-remove");

    renderComponent({
      initialSyllabus: [
        removable,
        createSyllabusItem({
          id: "syllabus-stay",
          Movie: createMovie({ id: "movie-stay", title: "Remaining Movie" }),
        }),
      ],
    });

    await user.click(
      screen.getByRole("button", {
        name: /remove Removable Movie from syllabus/i,
      }),
    );

    expect(mutationSpies.remove).toHaveBeenCalledWith({ id: "syllabus-remove" });

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", {
          name: "Removable Movie",
          level: 3,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: "Remaining Movie",
          level: 3,
        }),
      ).toBeInTheDocument();
    });
  });
});
