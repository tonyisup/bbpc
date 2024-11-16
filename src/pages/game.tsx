import { type NextPage } from "next";
import RatingIcon from "../components/RatingIcon";

const Game: NextPage = () => {
  // .
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center"><span title="Who The Fuck Is Reggie">WTFIR</span> Game Rules</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Synopsis</h2>
          <div className="space-y-4 text-lg">
            <p className="leading-relaxed">Players compete to get the most points.</p>
            <p className="leading-relaxed">Player who gets the most points passed the goal first wins.</p>
            <p className="leading-relaxed">The goal is <span className="text-yellow-400 font-semibold">100 points</span>.</p>
            <p className="leading-relaxed">
              The winner gets to be a <span className="text-green-400 font-semibold">guest</span> on the next episode of the show!
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Gameplay</h2>
            <div className="space-y-4 text-lg">
              <p className="leading-relaxed">Every week during the next episode, a new round will be played.</p>
              <p className="leading-relaxed">
                The round will be about the <span className="text-yellow-400 font-semibold">movies </span>
                that were assigned the previous week.
              </p>
              <p>Each host will review the assigned movies and give their <span className="text-green-400 font-semibold">rating</span></p>
              <p>Each player will submit their guesses of the <span className="text-blue-400 font-semibold">rating</span> that each host assigns to each movie</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Scoring</h2>
              <div className="space-y-4 text-lg">
                <p className="leading-relaxed">
                  <RatingIcon value={4} />
                  Slater: the best 4 out of 4 ratings
                </p>
                <p className="leading-relaxed">
                  <RatingIcon value={3} />
                  Dollar: the ok 3 out of 4 ratings
                </p>
                <p className="leading-relaxed">
                  <RatingIcon value={2} />
                  Waste: the not ok 2 out of 4 ratings
                </p>
                <p className="leading-relaxed">
                  <RatingIcon value={1} />
                  Goldbloom: the worst 1 out of 4 ratings
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Scoring</h2>
              <div className="space-y-4 text-lg">
                <p className="leading-relaxed">
                  Players who guess the correct rating for a host will earn <span className="text-green-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  Players who guess the correct rating for all hosts will earn an extra <span className="text-green-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  Players who guess incorrectly for all hosts will lose <span className="text-red-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  Players who guess incorrectly for some hosts will not earn or lose points.
                </p>
                <p className="leading-relaxed">
                  Players may double down on either <span className="text-green-400 font-semibold">Slater</span> or <span className="text-red-400 font-semibold">Goldbloom</span> guesses.
                </p>
                <p className="leading-relaxed">
                  If a player doubles down on a guess and it is correct, they will earn an extra<span className="text-green-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  If a player doubles down on a guess and it is incorrect, they will not lose a point.
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Bonus Points</h2>
              <div className="space-y-4 text-lg">
                <p className="leading-relaxed">                  
                  If you leave a voice message for the show, you will earn a <span className="text-green-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  If you use drastic enough accent on your voice message, you will earn a <span className="text-green-400 font-semibold">1 point</span>.
                </p>
                <p className="leading-relaxed">
                  If you adopt an impersonation of anyone but yourself, you will earn a <span className="text-green-400 font-semibold">1 point</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
