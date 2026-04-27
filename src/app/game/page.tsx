import Link from "next/link";
import RatingIcon from "../../components/RatingIcon";
import GamePerformanceTracking from "../../components/GamePerformanceTracking";
import { NextEpisode } from "../../components/NextEpisode";

export default function GamePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-center text-4xl font-bold text-red-600">
        <span title="Who The Fuck Is Reggie">WTFIR</span> Game
      </h1>

      <GamePerformanceTracking />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <NextEpisode showExtras={false} />

        <h2 className="text-center text-4xl font-bold text-red-600">Rules</h2>
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Synopsis</h2>
          <div className="space-y-4 text-lg">
            <p>The player with the <span className="font-semibold text-yellow-400">most points</span> at the end of the season wins.</p>
            <p>Each season lasts <span className="font-semibold text-yellow-400">8 weeks</span>.</p>
            <p>
              The winner gets to pick a movie and talk to us about it as a <span className="font-semibold text-green-400">guest</span> on show!
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Gameplay</h2>
          <div className="space-y-4 text-lg">
            <p>Every week two movies will be assigned for review on the next episode.</p>
            <p>Players try to guess the <span className="font-semibold text-green-400">rating</span> that each host will give to each movie</p>
            <p>Guesses may be submitted via phone message, voice message, or through the website.</p>
            <p>Note that some bonus points are <span className="font-semibold text-yellow-400">only</span> available via phone or voice message.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Ratings</h2>
          <div className="space-y-4 text-lg">
            <div className="flex items-center gap-2 leading-relaxed">
              <p><span className="font-semibold text-green-400">4</span> out of 4</p>
              <RatingIcon value={4} />
              <p>Slater: <span className="font-semibold text-green-400">the best</span></p>
            </div>
            <div className="flex items-center gap-2 leading-relaxed">
              <p><span className="font-semibold text-yellow-400">3</span> out of 4</p>
              <RatingIcon value={3} />
              <p>Dollar: <span className="font-semibold text-yellow-400">ok</span></p>
            </div>
            <div className="flex items-center gap-2 leading-relaxed">
              <p><span className="font-semibold text-orange-400">2</span> out of 4</p>
              <RatingIcon value={2} />
              <p>Waste: <span className="font-semibold text-orange-400">not ok</span></p>
            </div>
            <div className="flex items-center gap-2 leading-relaxed">
              <p><span className="font-semibold text-red-400">1</span> out of 4</p>
              <RatingIcon value={1} />
              <p>Goldbloom: <span className="font-semibold text-red-400">the worst</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Scoring</h2>
          <div className="space-y-4 text-lg">
            <p>
              Players who <span className="font-semibold text-green-400">correctly</span> guess the rating for a host will <span className="font-semibold text-green-400">earn 1 point</span>.
            </p>
            <p>
              Players who <span className="font-semibold text-green-400">correctly</span> guess the rating for all hosts will <span className="font-semibold text-green-400">earn an extra 1 point</span>.
            </p>
            <p>
              Players who <span className="font-semibold text-red-400">incorrectly</span> guess the rating for all hosts will <span className="font-semibold text-red-400">lose 1 point</span>.
            </p>
            <p>
              Players who <span className="font-semibold text-blue-400">vote on movie tags</span> will <span className="font-semibold text-green-400">earn 1 point</span> per vote.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Bonus Points</h2>
          <div className="space-y-4 text-lg">
            <p>
              If you use a <span className="font-semibold text-yellow-400">drastic*</span> enough accent, you will <span className="font-semibold text-green-400">earn 1 point</span>.
            </p>
            <p>
              If you adopt an impersonation of anyone but yourself, you will <span className="font-semibold text-green-400">earn 1 point</span>.
            </p>
            <p>
              Accents or impersonations are only good for <span className="font-semibold text-yellow-400">one movie</span>. They cannot be continued from one movie to the next.
            </p>
            <p>
              Accents or impersonations must be maintained for the <span className="font-semibold text-yellow-400">majority*</span> of the message.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Assignments</h2>
          <div className="space-y-4 text-lg">
            <p>Assignments consist of either a <span className="font-semibold text-blue-400">Homework</span> or <span className="font-semibold text-blue-600">Extra Credit</span>.</p>
            <p>A <span className="font-semibold text-blue-400">Homework</span> assignment is a movie that all the hosts have never seen.</p>
            <p>An <span className="font-semibold text-blue-600">Extra Credit</span> assignment is a movie that at least one host has seen.</p>
            <p>At the end of each episode, the opportunity to choose the assignment will be randomly picked from a <span className="font-semibold text-blue-400">wheel spin</span>.</p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Wheel Spin</h2>
          <div className="space-y-4 text-lg">
            <p>
              At the end of the reviews in each episode, we spin the wheel to determine the Assignments for the next episode.
            </p>
            <p>
              Each host will have a <span className="font-semibold text-blue-400">Homework</span> entry and an <span className="font-semibold text-blue-600">Extra Credit</span> entry.
            </p>
            <p>
              The last entry will be for the player who <span className="font-semibold text-green-400">earned the most points</span> that week.
            </p>
            <p>
              If the player entry is landed on, we will choose the next available assignment from that user&apos;s
              <Link href="/syllabus" className="font-semibold text-blue-400">
                &nbsp;syllabus
              </Link>.
              If the syllabus is empty, the bonus is forfeited.
            </p>
            <p>
              Players may also choose no assignment at all! (Strategy!?)
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Gambling</h2>
          <div className="space-y-4 text-lg">
            <h3 className="text-center text-xl font-semibold text-blue-400">[Sunsetting January 12, 2026]</h3>
            <p>
              For each assignment, you can gamble points for a 1x return guessing all three hosts&apos; ratings.
            </p>
            <a
              href="https://www.instagram.com/p/DIFsttBpTaF/"
              target="_blank"
              rel="noreferrer"
              className="block text-xl font-semibold text-blue-400 underline"
            >
              Video: How to gamble on the site
            </a>
          </div>
          <div className="mt-6 space-y-4 text-lg">
            <h3 className="text-center text-xl font-semibold text-blue-400">[Effective January 12, 2026]</h3>
            <p>
              For each assignment, you can gamble points on specific host outcomes.
            </p>
            <p>
              <span className="font-semibold text-yellow-400">1x Multiplier</span>: Bet on guessing a single host&apos;s rating (MCP, Harley, or Fonso).
            </p>
            <p>
              <span className="font-semibold text-orange-400">2x Multiplier</span>: Bet on guessing a pair of hosts&apos; ratings (e.g., &quot;MCP & Harley&quot; or &quot;Harley & Fonso&quot; or &quot;MCP & Fonso&quot;).
            </p>
            <p>
              <span className="font-semibold text-red-400">3x Multiplier</span>: Bet on guessing all three hosts&apos; ratings (&quot;MCP & Harley & Fonso&quot;).
            </p>
            <p>
              If you win, you will earn your wager back + the points wagered multiplied by the bet multiplier. If you lose, you lose the points wagered.
            </p>
            <p>
              <span className="font-semibold italic text-amber-500">Note: Once a bet is confirmed by the Game Master, it is locked and cannot be changed.</span>
            </p>
            <p className="border-t border-gray-700 pt-4 text-sm">
              BONUS HARLEY POINTS: If you call in/leave a voice message and you wager &quot;all your points&quot; and you win, you will earn an extra 4 points BEFORE it&apos;s doubled (or tripled).
              This only applies to voice submissions.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-semibold text-blue-400">Fine Print</h2>
          <div className="space-y-4 text-lg">
            <p>* - All bonus points are subject to the Game Master&apos;s discretion.</p>
            <p>If a player misses 2 episodes in a row, they will start losing 1 point per episode missed.</p>
            <p>In the event of a tie at the end of the season, the player with the most points earned in the final episode wins.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
