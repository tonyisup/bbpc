import { type Dispatch, type FC, useState } from "react";
import { type Title } from "../server/tmdb/client";
import { motion, AnimatePresence } from "motion/react";
import { FlipHorizontal, Upload, X } from "lucide-react";
interface TitleCardProps {
  title: Title,
  titleSelected?: Dispatch<Title>
}

const TitleCard: FC<TitleCardProps> = ({ title, titleSelected }) => {

  const [isFlipped, setIsFlipped] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleSelect = () => {
    if (!titleSelected) return;
    titleSelected(title)
    setIsExpanded(false)
  }

  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }


  const closeOnBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false)
    }
  }
  return (
    <div className="rounded-md w-[100px] h-[150px]">
      <div className="relative">
        {/* The poster that animates */}

        <motion.div
          layoutId="poster-container"
          onClick={isExpanded ? undefined : toggleExpand}
          className={`cursor-pointer overflow-hidden rounded-md shadow-lg ${isExpanded ? "fixed inset-0 z-50 m-auto max-w-[300px] max-h-[450px]" : "w-[100px] h-[150px]"
            }`}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            mass: 1,
            duration: 1,
          }}
        >

          {isExpanded && (<div className="relative top-14 px-6 flex justify-between">

            {/* Flip button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleFlip}
              className="z-50 text-white p-2 rounded-full bg-black/50 hover:bg-white/20"
              aria-label="Close expanded poster"
            >
              <FlipHorizontal className="h-6 w-6" />
            </motion.button>

            {/* Select button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSelect}
              className="z-50 text-white p-2 rounded-full bg-black/50 hover:bg-white/20"
              aria-label="Close expanded poster"
            >
              <Upload className="h-6 w-6" />
            </motion.button>


            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={toggleExpand}
              className="z-50 text-white p-2 rounded-full bg-black/50 hover:bg-white/20"
              aria-label="Close expanded poster"
            >
              <X className="h-6 w-6" />
            </motion.button>



          </div>)}
            <motion.img
              layoutId="poster-image"
              src={title?.poster_path}
              alt={title?.title}
              className={`w-full h-full object-fill`}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 120,
                mass: 1,
                duration: 1,
              }}
            />
        </motion.div>

        {/* Backdrop overlay */}
        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/80 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeOnBackdropClick}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TitleCard;