"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type SourceType = "MOVIE" | "TV" | "OTHER";

export default function QuotabungaSubmission() {
  const { data: session, status: sessionStatus } = useSession();
  const utils = api.useUtils();
  const current = api.quotabunga.getCurrent.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const [isAdminCollapsed, setIsAdminCollapsed] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("MOVIE");
  const [clipUrl, setClipUrl] = useState("");
  const [clipStartSeconds, setClipStartSeconds] = useState("");
  const [listenerNotes, setListenerNotes] = useState("");

  const isAdmin = session?.user?.isAdmin ?? false;
  const toggleAdminCollapse = () => {
    if (!isAdmin) return;
    setIsAdminCollapsed((value) => !value);
  };

  const submission = current.data?.submission;

  useEffect(() => {
    if (!submission) {
      setIsEditing(true);
      return;
    }

    setQuoteText(submission.quoteText);
    setSourceTitle(submission.sourceTitle);
    setSourceType(submission.sourceType as SourceType);
    setClipUrl(submission.clipUrl ?? "");
    setClipStartSeconds(submission.clipStartSeconds?.toString() ?? "");
    setListenerNotes(submission.listenerNotes ?? "");
    setIsEditing(false);
  }, [submission]);

  const submit = api.quotabunga.submit.useMutation({
    onSuccess: async () => {
      await utils.quotabunga.getCurrent.invalidate();
      setIsEditing(false);
      toast.success("Your Quotabunga entry is in!");
    },
    onError: (error) => toast.error(error.message),
  });

  const withdraw = api.quotabunga.withdraw.useMutation({
    onSuccess: async () => {
      await utils.quotabunga.getCurrent.invalidate();
      setQuoteText("");
      setSourceTitle("");
      setSourceType("MOVIE");
      setClipUrl("");
      setClipStartSeconds("");
      setListenerNotes("");
      setIsEditing(true);
      toast.success("Submission withdrawn");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit.mutate({
      quoteText,
      sourceTitle,
      sourceType,
      clipUrl,
      clipStartSeconds: clipStartSeconds ? Number(clipStartSeconds) : null,
      listenerNotes,
    });
  };

  return (
    <section id="quotabunga-submit" className="rounded-lg border border-blue-500/30 bg-gray-900 p-6 shadow-lg">
      <div
        className={cn(
          "flex flex-col gap-1",
          (!isAdmin || !isAdminCollapsed) && "mb-5",
          isAdmin ? "cursor-pointer select-none" : "text-center"
        )}
        role="button"
        tabIndex={isAdmin ? 0 : -1}
        onClick={toggleAdminCollapse}
        onKeyDown={(event) => {
          if (!isAdmin) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleAdminCollapse();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className={cn("flex flex-col gap-1", !isAdmin && "w-full text-center")}>
            <h2 className="text-2xl font-bold text-blue-400">Submit to Quotabunga</h2>
            {(!isAdmin || !isAdminCollapsed) && (
              <p className="mt-1 text-sm text-gray-400">One quote per listener, per episode.</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Admin
              </span>
              {isAdminCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {(!isAdmin || !isAdminCollapsed) && (
        <>
          {sessionStatus === "loading" ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
          ) : !session?.user ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-300">Sign in to submit and manage your quote.</p>
              <Button onClick={() => void signIn()}>Sign in to play</Button>
            </div>
          ) : current.isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
          ) : current.isError ? (
            <p className="text-center text-red-400">Could not load Quotabunga submissions. Please try again.</p>
          ) : !current.data?.episode ? (
            <p className="text-center text-gray-300">Submissions are closed until the next episode is announced.</p>
          ) : !current.data.isOpen && !submission ? (
            <p className="text-center text-gray-300">Submissions for episode {current.data.episode.number} are locked.</p>
          ) : submission && !isEditing ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">
                    Submitted for episode {current.data.episode.number}
                  </span>
                </div>
                <blockquote className="whitespace-pre-wrap text-lg text-white">&ldquo;{submission.quoteText}&rdquo;</blockquote>
                <p className="mt-2 text-sm text-gray-400">
                  {submission.sourceTitle} · {submission.sourceType === "TV" ? "Television" : submission.sourceType === "MOVIE" ? "Movie" : "Other"}
                </p>
                {submission.clipUrl && (
                  <a
                    href={submission.clipUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-400 underline"
                  >
                    View submitted clip <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {current.data.isOpen ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={withdraw.isLoading}
                    onClick={() => {
                      if (window.confirm("Withdraw this Quotabunga entry?")) withdraw.mutate();
                    }}
                  >
                    {withdraw.isLoading ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Withdraw
                  </Button>
                </div>
              ) : (
                <p className="text-center text-sm font-medium text-amber-400">This round is locked for recording.</p>
              )}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="quotabunga-quote" className="text-sm font-semibold">Quote or scene</label>
                <Textarea
                  id="quotabunga-quote"
                  required
                  maxLength={2000}
                  value={quoteText}
                  onChange={(event) => setQuoteText(event.target.value)}
                  placeholder="Type the exact quote or describe the quote-worthy scene..."
                  className="min-h-28"
                />
                <p className="text-right text-xs text-gray-500">{quoteText.length}/2000</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <label htmlFor="quotabunga-source" className="text-sm font-semibold">Movie or show</label>
                  <Input
                    id="quotabunga-source"
                    required
                    maxLength={500}
                    value={sourceTitle}
                    onChange={(event) => setSourceTitle(event.target.value)}
                    placeholder="Heat"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quotabunga-source-type" className="text-sm font-semibold">Source type</label>
                  <select
                    id="quotabunga-source-type"
                    value={sourceType}
                    onChange={(event) => setSourceType(event.target.value as SourceType)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="MOVIE">Movie</option>
                    <option value="TV">Television</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <div className="space-y-2">
                  <label htmlFor="quotabunga-clip" className="text-sm font-semibold">Clip link <span className="font-normal text-gray-500">(optional)</span></label>
                  <Input
                    id="quotabunga-clip"
                    type="url"
                    maxLength={2000}
                    value={clipUrl}
                    onChange={(event) => setClipUrl(event.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quotabunga-timestamp" className="text-sm font-semibold">Start second</label>
                  <Input
                    id="quotabunga-timestamp"
                    type="number"
                    min={0}
                    max={86400}
                    value={clipStartSeconds}
                    onChange={(event) => setClipStartSeconds(event.target.value)}
                    placeholder="42"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="quotabunga-notes" className="text-sm font-semibold">Notes for the hosts <span className="font-normal text-gray-500">(optional)</span></label>
                <Textarea
                  id="quotabunga-notes"
                  maxLength={1000}
                  value={listenerNotes}
                  onChange={(event) => setListenerNotes(event.target.value)}
                  placeholder="Context, preferred stopping point, or why this quote rules..."
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {submission && (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submit.isLoading || !quoteText.trim() || !sourceTitle.trim()}>
                  {submit.isLoading && <Loader2 className="animate-spin" />}
                  {submission ? "Save changes" : "Submit quote"}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
