import RatingIcon from "../../components/RatingIcon";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span title="Who The Fuck Is Reggie">WTFIR</span> Game Rules
        </h1>
        
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[hsl(280,100%,70%)]">Synopsis</h2>
          <div className="space-y-4 text-lg">
            <p className="leading-relaxed">Players compete to get the most points.</p>
            <p className="leading-relaxed">Player who gets the most points passed the goal first wins.</p>
            <p className="leading-relaxed">The goal is <span className="text-yellow-400 font-semibold">100 points</span>.</p>
            <p className="leading-relaxed">
              The winner gets to be a <span className="text-green-400 font-semibold">guest</span> on the next episode of the show!
            </p>
          </div>
        </div>
          
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[hsl(280,100%,70%)]">Gameplay</h2>
          <div className="space-y-4 text-lg">
            <p className="leading-relaxed">Every week during the next episode, a new round will be played.</p>
            <p className="leading-relaxed">
              The round will be about the <span className="text-yellow-400 font-semibold">movies </span>
              that were assigned the previous week.
            </p>
            <p>Each host will review the assigned movies and give their <span className="text-green-400 font-semibold">rating</span></p>
            <p>Each player will submit their guesses of the <span className="text-blue-400 font-semibold">rating</span> that each host assigns to each movie</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[hsl(280,100%,70%)]">Scoring</h2>
          <div className="space-y-4 text-lg">
            <p className="leading-relaxed flex items-center gap-2">
              <RatingIcon value={4} />
              <span>Slater: the best 4 out of 4 ratings</span>
            </p>
            <p className="leading-relaxed flex items-center gap-2">
              <RatingIcon value={3} />
              <span>Dollar: the ok 3 out of 4 ratings</span>
            </p>
            <p className="leading-relaxed flex items-center gap-2">
              <RatingIcon value={2} />
              <span>Waste: the not ok 2 out of 4 ratings</span>
            </p>
            <p className="leading-relaxed flex items-center gap-2">
              <RatingIcon value={1} />
              <span>Trash: the worst 1 out of 4 ratings</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 