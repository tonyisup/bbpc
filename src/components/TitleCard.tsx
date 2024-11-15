import { type FC } from "react";
import Image from "next/image";
import { type Title } from "../server/tmdb/client";

interface TitleCardProps {
  title: Title
}

const TitleCard: FC<TitleCardProps> = ({ title }) => {
  return (
    <div className="w-full flex justify-center">
      <div>
        <figure>
          <Image
            unoptimized
            width={100}
            height={150}
            src={title?.poster_path}
            alt={title?.title}
          />
          {/* <figcaption className="text-center">
            {title.title} 
            <span className="text-xs"> ({(new Date(title.release_date)).getFullYear()})</span>
          </figcaption> */}
        </figure>
      </div>
    </div>
  )
}

export default TitleCard