import { type NextPage } from "next";

const Game: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Game Rules</h1>
        
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
        </div>
      </div>
    </div>
  );
};

export default Game;
