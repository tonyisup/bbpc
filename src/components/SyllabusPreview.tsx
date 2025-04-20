import { type FC } from "react";
import type { Movie } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface SyllabusPreviewProps {
  count: number;
  syllabus: {
    Movie: Movie;
  }[];
}

const SyllabusPreview: FC<SyllabusPreviewProps> = ({ count, syllabus }) => {
  const totalMovies = syllabus.length;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-lg">
        Total Movies: {count}
      </div>
      {totalMovies > 0 && (
        <div className="flex gap-4">
          {syllabus.map((item) => (
            <Link
              key={item.Movie.id}
              href={item.Movie.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              {item.Movie.poster && (
                <Image
                  unoptimized
                  className="rounded-lg"
                  src={item.Movie.poster}
                  alt={item.Movie.title}
                  width={100}
                  height={150}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyllabusPreview; 