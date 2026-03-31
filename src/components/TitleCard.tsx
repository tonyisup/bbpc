import { type FC, useState } from "react";
import { type Title } from "../server/tmdb/client";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, X } from "lucide-react";
import { getPlainDateYear } from "@/lib/dates";
import SyllabusInsertPositionMenu from "./SyllabusInsertPositionMenu";
import {
  type SyllabusInsertPosition,
  syllabusInsertPositionLabels,
} from "@/lib/syllabus";

interface TitleCardProps {
  title: Title;
  titleSelected?: (title: Title, position: SyllabusInsertPosition) => void;
  syllabusInsertPosition?: SyllabusInsertPosition;
  onSyllabusInsertPositionChange?: (position: SyllabusInsertPosition) => void;
}

const TitleCard: FC<TitleCardProps> = ({
  title,
  titleSelected,
  syllabusInsertPosition = "END",
  onSyllabusInsertPositionChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = () => {
    if (!titleSelected) {
      return;
    }

    titleSelected(title, syllabusInsertPosition);
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeOnBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="h-[150px] w-[100px] rounded-md">
      <div className="relative">
        <motion.div
          layoutId={`poster-container-${title.id}`}
          onClick={isExpanded ? undefined : toggleExpand}
          className={`cursor-pointer overflow-hidden rounded-md shadow-lg ${isExpanded ? "fixed inset-0 z-50 m-auto max-h-[450px] max-w-[300px]" : "h-[150px] w-[100px]"
            }`}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            mass: 1,
            duration: 1,
          }}
        >
          {isExpanded && (
            <div className="relative top-10 flex flex-col gap-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleSelect}
                      className="z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
                      aria-label={`Add using ${syllabusInsertPositionLabels[syllabusInsertPosition]}`}
                      title={syllabusInsertPositionLabels[syllabusInsertPosition]}
                    >
                      <Check className="h-6 w-6" />
                    </motion.button>
                    {onSyllabusInsertPositionChange && (
                      <SyllabusInsertPositionMenu
                        selectedPosition={syllabusInsertPosition}
                        onSelect={onSyllabusInsertPositionChange}
                        contentClassName="bg-black/90 text-white border-white/10"
                        trigger={(
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            className="z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
                            aria-label={`Choose add position. Current: ${syllabusInsertPositionLabels[syllabusInsertPosition]}`}
                            title={syllabusInsertPositionLabels[syllabusInsertPosition]}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </motion.button>
                        )}
                      />
                    )}
                  </div>
                  <span className="rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                    {syllabusInsertPositionLabels[syllabusInsertPosition]}
                  </span>
                </div>

                <span className="rounded-md bg-black/50 p-2 text-xl text-white">
                  {getPlainDateYear(title.release_date) ?? ""}
                </span>

                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={toggleExpand}
                  className="z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
                  aria-label="Close expanded poster"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          )}

          <motion.img
            layoutId={`poster-image-${title.id}`}
            src={title.poster_path ?? ""}
            alt={title.title}
            className="h-full w-full object-fill"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 120,
              mass: 1,
              duration: 1,
            }}
          />
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeOnBackdropClick}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TitleCard;
