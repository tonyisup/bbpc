import { type Dispatch, type FC, useState } from "react";
import Image from "next/image";
import { type Title } from "../server/tmdb/client";

interface TitleCardProps {
  title: Title,
  titleSelected?: Dispatch<Title>
}

const TitleCard: FC<TitleCardProps> = ({ title, titleSelected }) => {

  const [isFlipped, setIsFlipped] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleSelect = () => {
    if (!titleSelected) return;
    titleSelected(title)
  }

  const handleZoomIn = () => {
    setIsZoomedIn(!isZoomedIn)
  }

  return (
    <div className="rounded-md w-[100px] h-[150px]">
      <div
        className={`relative w-full transition-transform duration-700 h-[150px] cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div className="absolute top-1 right-1 z-10" onClick={handleFlip}>
          <div className="bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
          </div>
        </div>
        <div
          className="absolute w-full h-full rounded-lg overflow-hidden shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          {!isZoomedIn && <button onClick={handleZoomIn}>
            <Image
              unoptimized
              width={100}
              height={150}
              src={title?.poster_path}
              alt={title?.title}
            />
          </button>}
          {isZoomedIn && <button onClick={handleZoomIn}>
            <Image
              unoptimized
              width={200}
              height={300}
              src={title?.poster_path}
              alt={title?.title}
            />
          </button>}
        </div>
        <div
          className="absolute w-full h-full bg-gray-900 text-white rounded-lg overflow-hidden shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="p-4">
            <h2 className="text-lg font-bold mb-2">{title.title}</h2>
            <p className="text-sm">{(new Date(title.release_date)).getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TitleCard;