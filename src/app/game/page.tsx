import RatingIcon from "../../components/RatingIcon";
import { NextEpisode } from "../../components/NextEpisode";
import { Info } from "lucide-react";
import Link from "next/link";

export default function GamePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-4xl font-bold text-center text-red-600">
        <span title="Who The Fuck Is Reggie">WTFIR</span> Game
      </h1>

      <NextEpisode />

      <h2 className="text-4xl font-bold text-center text-red-600">Rules</h2>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Synopsis</h2>
        <div className="space-y-4 text-lg">
          <p>The player with the <span className="text-yellow-400 font-semibold">most points</span> at the end of the season wins.</p>
          <p>Each season lasts <span className="text-yellow-400 font-semibold">8 weeks</span>.</p>
          <p>
            The winner gets to pick a movie and talk to us about it as a <span className="text-green-400 font-semibold">guest</span> on show!
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Gameplay</h2>
        <div className="space-y-4 text-lg">
          <p>Every week two movies will be assigned for review on the next episode.</p>
          <p>Players try to guess the <span className="text-green-400 font-semibold">rating</span> that each host will give to each movie</p>
          <p>Guesses may be submitted via phone message, voice message, or through the website.</p>
          <p>Note that some bonus points are <span className="text-yellow-400 font-semibold">only</span> available via phone or voice message.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col gap-4 justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Ratings</h2>
        <div className="space-y-4 text-lg">
          <p className="leading-relaxed flex items-center gap-2">
            <p><span className="text-green-400 font-semibold">4</span> out of 4</p>
            <RatingIcon value={4} />
            <p>Slater: <span className="text-green-400 font-semibold">the best</span></p>
          </p>
          <p className="leading-relaxed flex items-center gap-2">
            <p><span className="text-yellow-400 font-semibold">3</span> out of 4</p>
            <RatingIcon value={3} />
            <p>Dollar: <span className="text-yellow-400 font-semibold">ok</span></p>
          </p>
          <p className="leading-relaxed flex items-center gap-2">
            <p><span className="text-orange-400 font-semibold">2</span> out of 4</p>
            <RatingIcon value={2} />
            <p>Waste: <span className="text-orange-400 font-semibold">not ok</span></p>
          </p>
          <p className="leading-relaxed flex items-center gap-2">
            <p><span className="text-red-400 font-semibold">1</span> out of 4</p>
            <RatingIcon value={1} />
            <p>Goldbloom: <span className="text-red-400 font-semibold">the worst</span></p>
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Scoring</h2>
        <div className="space-y-4 text-lg">
          <p>
            Players who <span className="text-green-400 font-semibold">correctly</span> guess the rating for a host will <span className="text-green-400 font-semibold">earn 1 point</span>.
          </p>
          <p>
            Players who <span className="text-green-400 font-semibold">correctly</span> guess the rating for all hosts will <span className="text-green-400 font-semibold">earn an extra 1 point</span>.
          </p>
          <p>
            Players who <span className="text-red-400 font-semibold">incorrectly</span> guess the rating for all hosts will <span className="text-red-400 font-semibold">lose 1 point</span>.
          </p>
          <p>
            Players who <span className="text-blue-400 font-semibold">vote on movie tags</span> will <span className="text-green-400 font-semibold">earn 1 point</span> per vote.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Bonus Points</h2>
        <div className="space-y-4 text-lg">
          <p>
            If you use a <span className="text-yellow-400 font-semibold">drastic*</span> enough accent, you will <span className="text-green-400 font-semibold">earn 1 point</span>.
          </p>
          <p>
            If you adopt an impersonation of anyone but yourself, you will <span className="text-green-400 font-semibold">earn 1 point</span>.
          </p>
          <p>
            Accents or impersonations are only good for <span className="text-yellow-400 font-semibold">one movie</span>. They cannot be continued from one movie to the next.
          </p>
          <p>
            Accents or impersonations must be maintained for the <span className="text-yellow-400 font-semibold">majority*</span> of the message.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Assignments</h2>
        <div className="space-y-4 text-lg">
          <p>Assignments consist of either a <span className="text-blue-400 font-semibold">Homework</span> or <span className="text-blue-600 font-semibold">Extra Credit</span>.</p>
          <p>A <span className="text-blue-400 font-semibold">Homework</span> assignment is a movie that all the hosts have never seen.</p>
          <p>An <span className="text-blue-600 font-semibold">Extra Credit</span> assignment is a movie that at least one host has seen.</p>
          <p>At the end of each episode, the opportunity to choose the assignment will be randomly picked from a <span className="text-blue-400 font-semibold">wheel spin</span>.</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Wheel Spin</h2>
        <div className="space-y-4 text-lg">
          <p>
            At the end of the reviews in each episode, we spin the wheel to determine the Assignments for the next episode.
          </p>
          <p>
            Each host will have a <span className="text-blue-400 font-semibold">Homework</span> entry and an <span className="text-blue-600 font-semibold">Extra Credit</span> entry.
          </p>
          <p>
            The last entry will be for the player who <span className="text-green-400 font-semibold">earned the most points</span> that week.
          </p>
          <p>
            If the player entry is landed on, we will choose the next available assignment from that user&apos;s
            <Link href="/syllabus" className="text-blue-400 font-semibold">
              &nbsp;syllabus
            </Link>.
            If the syllabus is empty, the bonus is forfeited.
          </p>
          <p>
            Players may also choose no assignment at all! (Strategy!?)
          </p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Gambling</h2>
        <div className="space-y-4 text-lg">
          <h3 className="text-xl font-semibold text-center text-blue-400">[Sunsetting January 12, 2026]</h3>
          <p>
            For each assignment, you can gamble points for a 1x return guessing all three hosts' ratings.
          </p>
          <p>
            <a href="https://www.instagram.com/p/DIFsttBpTaF/" target="_blank" rel="noreferrer">
              <p className="underline text-xl font-semibold mt-2 text-blue-400">Video: How to gamble on the site</p>
            </a>
          </p>
        </div>
        <div className="mt-6 space-y-4 text-lg">
          <h3 className="text-xl font-semibold text-center text-blue-400">[Effective January 12, 2026]</h3>
          <p>
            For each assignment, you can gamble points on specific host outcomes.
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">1x Multiplier</span>: Bet on guessing a single host&apos;s rating (MCP, Harley, or Fonso).
          </p>
          <p>
            <span className="text-orange-400 font-semibold">2x Multiplier</span>: Bet on guessing a pair of hosts' ratings (e.g., &quot;MCP & Harley&quot; or &quot;Harley & Fonso&quot; or &quot;MCP & Fonso&quot;).
          </p>
          <p>
            <span className="text-red-400 font-semibold">3x Multiplier</span>: Bet on guessing all three hosts' ratings (&quot;MCP & Harley & Fonso&quot;).
          </p>
          <p>
            If you win, you will earn your wager back + the points wagered multiplied by the bet multiplier. If you lose, you lose the points wagered.
          </p>
          <p>
            <span className="text-amber-500 font-semibold italic">Note: Once a bet is confirmed by the Game Master, it is locked and cannot be changed.</span>
          </p>
          <p className="text-sm border-t border-gray-700 pt-4">
            BONUS HARLEY POINTS: If you call in/leave a voice message and you wager &quot;all your points&quot; and you win, you will earn an extra 4 points BEFORE it&apos;s doubled (or tripled).
            This only applies to voice submissions.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Fine Print</h2>
        <div className="space-y-4 text-lg">
          <p>* - All bonus points are subject to the Game Master&apos;s discretion.</p>
          <p >If a player misses 2 episodes in a row, they will start losing 1 point per episode missed.</p>
          <p>In the event of a tie at the end of the season, the player with the most points earned in the final episode wins.</p>
        </div>
      </div>
    </div>
  );
} 
