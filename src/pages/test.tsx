import type { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import VideoSearch from "../components/VideoSearch";
import { type VideoSearchResult } from "../server/yt/client";

const Test: NextPage = () => {
  const [video, setVideo] = useState<VideoSearchResult>()
  return (
    <main className="bg-black flex flex-col w-full">
      <h1>Test</h1>
      {video && <div className="bg-slate-800 p-2 w-full flex justify-center">
        <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} title={video.snippet.title}>
          <Image 
            src={video.snippet.thumbnails.default.url} 
            width={video.snippet.thumbnails.default.width} 
            height={video.snippet.thumbnails.default.height}
            alt={video.snippet.title}
          />              
        </a>
      </div>}
      <VideoSearch setVideo={setVideo} />
    </main>
  );
};

export default Test;