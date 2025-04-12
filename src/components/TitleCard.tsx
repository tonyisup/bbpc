import { type FC } from "react";
import Image from "next/image";
import { type Title } from "../server/tmdb/client";

interface TitleCardProps {
  title: Title
  showTitle?: boolean
  showYear?: boolean
}

const TitleCard: FC<TitleCardProps> = ({ title, showTitle = false, showYear = false }) => {
  return (
      <figure>
        <Image
          unoptimized
          width={100}
          height={150}
          src={title?.poster_path}
          alt={title?.title}
        />
        {showTitle && <figcaption className="text-center text-wrap">
          {title.title} 
          {showYear && <span className="text-xs"> ({(new Date(title.release_date)).getFullYear()})</span>}  
        </figcaption>}
      </figure>
  )
}

export default TitleCard