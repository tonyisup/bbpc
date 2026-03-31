'use client';

import { type FC, useState } from "react";
import { useRouter } from "next/navigation";
import type { Movie, Syllabus, Assignment, Episode } from "@prisma/client";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X, ArrowUp, ArrowDown, Edit3, Save, ChevronsUp } from "lucide-react";
import MovieFind from "./MovieFind";
import MovieInlinePreview from "./MovieInlinePreview";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  buildDenseDescendingOrder,
  insertIntoCanonicalSyllabus,
  normalizeSyllabusOrder,
  type SyllabusInsertPosition,
} from "@/lib/syllabus";

type SyllabusItem = Syllabus & {
  movie: Movie;
  assignment: (Assignment & {
    episode: Episode;
  }) | null;
};

interface SyllabusManagerProps {
  initialSyllabus: SyllabusItem[];
  userId: string;
}

const SyllabusManager: FC<SyllabusManagerProps> = ({ initialSyllabus, userId }) => {
  const router = useRouter();
  const [syllabus, setSyllabus] = useState(() => normalizeSyllabusOrder(initialSyllabus));
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>("");
  const [insertPosition, setInsertPosition] = useState<SyllabusInsertPosition>("END");

  const { mutate: reorderSyllabus, isPending: isReordering } = api.syllabus.reorder.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to reorder syllabus: ${error.message}`);
      router.refresh();
    },
  });
  const persistSyllabusOrder = (orderedSyllabus: SyllabusItem[], previousSyllabus: SyllabusItem[]) => {
    if (isReordering) {
      return;
    }

    const previousOrderById = new Map(
      buildDenseDescendingOrder(previousSyllabus).map((item) => [item.id, item.order]),
    );
    const changedOrder = buildDenseDescendingOrder(orderedSyllabus).filter(
      (item) => previousOrderById.get(item.id) !== item.order,
    );

    if (changedOrder.length === 0) {
      return;
    }

    reorderSyllabus({
      userId,
      syllabus: changedOrder,
    });
  };

  const { mutate: addToSyllabus } = api.syllabus.add.useMutation({
    onSuccess: (newSyllabus, variables) => {
      setSyllabus((prev) => insertIntoCanonicalSyllabus(prev, newSyllabus, variables.position ?? "END"));
      setShowMovieSearch(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to add movie: ${error.message}`);
    },
  });

  const { mutate: removeFromSyllabus } = api.syllabus.remove.useMutation({
    onSuccess: (removedId) => {
      setSyllabus((prev) => normalizeSyllabusOrder(prev.filter((item) => item.id !== removedId)));
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to remove movie: ${error.message}`);
    },
  });

  const { mutate: updateNotes } = api.syllabus.updateNotes.useMutation({
    onSuccess: (updatedSyllabus) => {
      setSyllabus((prev) => normalizeSyllabusOrder(prev.map((item) =>
        item.id === updatedSyllabus.id ? updatedSyllabus : item,
      )));
      setEditingNotes(null);
      setNotesText("");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to save notes: ${error.message}`);
    },
  });

  const handleAddMovie = (movie: Movie, position: SyllabusInsertPosition) => {
    addToSyllabus({
      userId,
      movieId: movie.id,
      position,
    });
  };

  const handleRemoveMovie = (syllabusId: string) => {
    removeFromSyllabus({ id: syllabusId });
  };

  type MoveDirection = "up" | "down";

  const moveSyllabusItem = (syllabusId: string, direction: MoveDirection) => {
    setSyllabus((prev) => {
      const normalized = normalizeSyllabusOrder(prev);
      const pending = normalized.filter((item) => item.assignmentId === null);
      const assigned = normalized.filter((item) => item.assignmentId !== null);
      const currentIndex = pending.findIndex((item) => item.id === syllabusId);

      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= pending.length) {
        return prev;
      }

      const updatedPending = [...pending];
      const targetItem = updatedPending[targetIndex];
      const currentItem = updatedPending[currentIndex];

      if (!targetItem || !currentItem) {
        return prev;
      }

      [updatedPending[currentIndex], updatedPending[targetIndex]] = [targetItem, currentItem];

      const updated = [...updatedPending, ...assigned];
      persistSyllabusOrder(updated, normalized);

      return updated;
    });
  };

  const handleMoveUp = (syllabusId: string) => moveSyllabusItem(syllabusId, "up");
  const handleMoveDown = (syllabusId: string) => moveSyllabusItem(syllabusId, "down");

  const handleSendToTop = (syllabusId: string) => {
    setSyllabus((prev) => {
      const normalized = normalizeSyllabusOrder(prev);
      const pending = normalized.filter((item) => item.assignmentId === null);
      const assigned = normalized.filter((item) => item.assignmentId !== null);
      const currentIndex = pending.findIndex((item) => item.id === syllabusId);

      if (currentIndex <= 0) {
        return prev;
      }

      const itemToMove = pending[currentIndex];
      if (!itemToMove) {
        return prev;
      }

      const updatedPending = [...pending];
      updatedPending.splice(currentIndex, 1);
      updatedPending.unshift(itemToMove);

      const updated = [...updatedPending, ...assigned];
      persistSyllabusOrder(updated, normalized);

      return updated;
    });
  };

  const handleStartEditNotes = (syllabusId: string, currentNotes: string | null) => {
    setEditingNotes(syllabusId);
    setNotesText(currentNotes ?? "");
  };

  const handleSaveNotes = (syllabusId: string) => {
    updateNotes({
      id: syllabusId,
      notes: notesText.trim() || undefined,
    });
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
    setNotesText("");
  };

  const unassignedSyllabus = syllabus.filter((item) => item.assignmentId === null);
  const assignedSyllabus = syllabus.filter((item) => item.assignmentId !== null);
  const topUnassignedSyllabusItem = unassignedSyllabus[0] ?? null;

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-center">
        {!showMovieSearch && (
          <Button
            variant="outline"
            onClick={() => setShowMovieSearch(true)}
            aria-label="Add movie"
          >
            Add Movie
          </Button>
        )}
        {showMovieSearch && (
          <Button
            variant="outline"
            onClick={() => setShowMovieSearch(false)}
            aria-label="Cancel movie search"
          >
            Cancel
          </Button>
        )}
      </div>

      {showMovieSearch && (
        <MovieFind
          selectMovie={handleAddMovie}
          selectedPosition={insertPosition}
          onSelectedPositionChange={setInsertPosition}
        />
      )}

      <div className="flex w-full flex-col gap-4">
        {unassignedSyllabus.map((item, index) => {
          const isNextMovie = item.id === topUnassignedSyllabusItem?.id;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                isNextMovie && "border-red-500/70 bg-red-500/5 shadow-[0_0_0_1px_rgba(239,68,68,0.18)]",
              )}
            >
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSendToTop(item.id)}
                  disabled={isNextMovie || isReordering}
                  aria-label="Send to top"
                >
                  <ChevronsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUp(item.id)}
                  disabled={index === 0 || isReordering}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(item.id)}
                  disabled={index === unassignedSyllabus.length - 1 || isReordering}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-4">
                  {item.movie.poster && (
                    <MovieInlinePreview movie={item.movie} />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-lg font-semibold">{item.movie.title}</h3>
                      {isNextMovie && (
                        <span className="rounded-full border border-red-500/60 bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-200">
                          Next
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{item.movie.year}</p>
                  </div>
                </div>

                <div className="mt-3">
                  {editingNotes === item.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Add your notes here..."
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(item.id)}
                          aria-label="Save notes"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditNotes}
                          aria-label="Cancel notes"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        {item.notes ? (
                          <p className="whitespace-pre-wrap text-sm text-gray-600">{item.notes}</p>
                        ) : (
                          <p className="text-sm italic text-gray-400">No notes yet</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEditNotes(item.id, item.notes)}
                        aria-label="Edit notes"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMovie(item.id)}
                aria-label="Remove movie"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col gap-4">
        <h2 className="text-lg font-semibold">Assigned</h2>
      </div>
      <div className="flex w-full flex-col gap-4">
        {assignedSyllabus.map((item) => (
          <div key={item.id} className="flex-1 rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-4">
              {item.movie.poster && (
                <MovieInlinePreview movie={item.movie} />
              )}
              <div className="flex-1">
                <h3 className="break-words text-lg font-semibold">{item.movie.title}</h3>
                <p className="text-gray-400">{item.movie.year}</p>
              </div>
              <p>Reviewed in Episode {item.assignment?.episode.number} - {item.assignment?.episode.title}</p>
            </div>

            {item.notes && (
              <div className="mt-2">
                <p className="whitespace-pre-wrap text-sm text-gray-600">{item.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusManager;
