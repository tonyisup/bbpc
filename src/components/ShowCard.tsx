import type { Show } from "@prisma/client";
import Image from "next/image";
import type { FC } from "react";

interface ShowCardProps {
  show: Show,
  width?: number,
  height?: number
}

const ShowCard: FC<ShowCardProps> = ({ show, width, height }) => {
  return (
    <div className="w-full flex justify-center text-white">
      <a href={show.url} target="_blank" rel="noreferrer">
        <figure className="flex flex-col items-center justify-center">
          {show.poster && <Image width={width ?? 114} height={height ?? 216} src={show.poster} alt={show.title} />}
          <figcaption className="text-center">
            {show.title}
            <span className="text-xs"> ({show.year})</span>
          </figcaption>
        </figure>
      </a>
    </div>
  )
}

export default ShowCard