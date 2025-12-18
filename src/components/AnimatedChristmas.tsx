import React from 'react';

const snowParticles = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  cx: Math.random() * 400,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 3,
  size: 2 + Math.random() * 3,
}));

const ChristmasSnow = () => {

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        width="400"
        height="200"
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-lg shadow-xl"
        style={{ backgroundColor: '#1a472a' }}
      >
        <defs>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
              @keyframes fall {
                0% { transform: translateY(-20px) translateX(0px); opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { transform: translateY(220px) translateX(15px); opacity: 0; }
              }
              .snow-particle {
                animation: fall var(--duration) linear infinite;
                animation-delay: var(--delay);
                fill: white;
              }
            `}
          </style>
        </defs>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '80px',
            fill: '#D42426',
          }}
        >
          Christmas
        </text>

        {snowParticles.map((p) => (
          <circle
            key={p.id}
            className="snow-particle"
            cx={p.cx}
            cy="-10"
            r={p.size}
            style={{
              // @ts-ignore
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default ChristmasSnow;