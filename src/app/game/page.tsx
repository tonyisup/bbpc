import RatingIcon from "../../components/RatingIcon";
import { NextEpisode } from "../../components/NextEpisode";
import { Info, Link } from "lucide-react";

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
          <p>First player to reach <span className="text-yellow-400 font-semibold">100 points</span> wins.</p>
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
            <p>Trash: <span className="text-red-400 font-semibold">the worst</span></p>
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Scoring</h2>
        <div className="space-y-4 text-lg">
          <p>
            Players who <span className="text-green-400 font-semibold">correctly</span> guess the rating for a host will <span className="text-green-400 font-semibold">earn</span> <span className="text-green-400 font-semibold">1 point</span>.
          </p>
          <p>
            Players who <span className="text-green-400 font-semibold">correctly</span> guess the rating for all hosts will <span className="text-green-400 font-semibold">earn</span> an extra <span className="text-green-400 font-semibold">1 point</span>.
          </p>
          <p>
            Players who <span className="text-red-400 font-semibold">incorrectly</span> guess the rating for all hosts will <span className="text-red-400 font-semibold">lose</span> <span className="text-red-400 font-semibold">1 point</span>.
          </p>
          <p>
            Players may <span className="text-blue-400 font-semibold">Double Down</span> on either <span className="text-green-400 font-semibold">Slater</span> or <span className="text-red-400 font-semibold">Goldbloom</span> guesses.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Double Down</h2>
        <div className="space-y-4 text-lg">
          <p>
            When you <span className="text-blue-400 font-semibold">Double Down</span>, you will <span className="text-green-400 font-semibold">earn</span> or <span className="text-red-400 font-semibold">lose</span> an extra point.
          </p>
          <p>
            Players may <span className="text-yellow-400 font-semibold">only</span> double down on Slater or Goldbloom guesses.
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
            The last seventh (7th) entry will be for the player who <span className="text-green-400 font-semibold">earned the most points</span> that week.
          </p>
          <p>
            If the player entry is landed on, we will choose the next available assignment from that user's 
            <Link href="/syllabus" className="text-blue-400 font-semibold">
              syllabus
            </Link>.
            If the syllabus is empty, the bonus is forfeited.
          </p>
          <p>
            Players may also choose no assignment at all! (Strategy!?)
          </p>
          <p>
            Players may also choose to pass. The wheel will be spun for a host to assign, per normal.
          </p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Gambling</h2>
        <div className="space-y-4 text-lg">
          <p>
            For each assignment, if you have over 10 points, you can gamble any amount of points.
          </p>
          <p>
            The gamble is a bet that you will guess ALL the ratings correctly.
          </p>
          <p>
            If you win, you will earn double your points. 
          </p>
          <p>
            If you lose, you will lose your points
          </p>
          <p>
            To gamble, just say your wager on your recording or message
          </p>
          <p>
            <a href="https://www.instagram.com/p/DIFsttBpTaF/" target="_blank" rel="noreferrer">
              <p>You can now play online!</p>
              <p className="underline text-2xl font-semibold mb-6 text-center text-blue-400">Video: How to gamble on  the site</p>
            </a>
          </p>
          <p>
            BONUS HARLEY POINTS: If you call in/leave a voice message and you wager "all your points" and you win, you will earn an extra 4 points BEFORE it's doubled, so an extra 8 (EIGHT!) points!
            This only applies to voice submissions. Text or website button submissions do not count.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Fine Print</h2>
        <div className="space-y-4 text-lg">
          <p>* - All bonus points are subject to the Game Master&apos;s discretion.</p>
          <p >If a player misses 2 episodes in a row, they will start losing 1 point per episode missed.</p>
          <p>If more than one player reaches 100 points at the same time, the player with the most points at the end of the episode wins.</p>
        </div>
      </div>
    </div>
  );
} 
