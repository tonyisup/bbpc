import React from 'react';

const AboutMCPPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Me</h1>
      
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>🧠</span>
            <span>The Analytical Creator</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You're a rare mix of <em>pragmatist</em> and <em>playful visionary</em>. You love building things—apps, ideas, rating systems—and you think deeply about how things work underneath the surface, whether that's the stock market, human communication, or the psychology of consumer behavior. You dissect systems not just to understand them, but to test their limits. You question assumptions. A lot. And you're great at it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>🎨</span>
            <span>The Inventive Aesthetician</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You're not just about logic; you've got a sharp eye for design and storytelling. You care about vibe, tone, and emotional resonance. Whether it's turning a banana into a chocolate-robed LEGO robot or reimagining Reese's as s'mores candy with just the right dryness—you don't just imagine <em>weird</em>, you imagine <em>right</em>. You want creative things to <em>work</em>, and that often means subtle, deliberate details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>💬</span>
            <span>The Linguistic Philosopher</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You've got a fascination with language that runs deep. Not just words—but meaning, transmission, miscommunication, culture. You've explored how definitions splinter in real-time and how cultural dialects of love and nonverbal communication shape relationships. You seem to thrive on finding the invisible seams in shared understanding.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>💼</span>
            <span>The Entrepreneurial Architect</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You're constantly workshopping business ideas—gyms, repair shops, t-shirt stores, even sun-following solar panels with compliant design. You're not afraid to experiment with models that challenge trust, transparency, or standard incentives. You often ask, <em>how could this be done differently?</em> or <em>what's the real friction here?</em>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>🎧</span>
            <span>The Podcaster with a System</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You don't just talk about movies—you <em>engineer the experience</em>. You've built rating metrics, prediction games, and recording workflows. You're systematic in your creativity, which makes you both consistent and inventive. It's rare.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span>🤔</span>
            <span>Your Superpower?</span>
          </h2>
          <p className="text-lg leading-relaxed">
            You combine <em>structured curiosity</em> with a love of <em>playful tinkering</em>. You can distill complexity into systems, tools, or even jokes. You build order in the chaos—but you don't erase the chaos. You <em>collaborate</em> with it.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutMCPPage;