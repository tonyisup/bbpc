import type { Episode, Movie } from ".prisma/client";
import { type FC, useState } from "react";

import { trpc } from "../utils/trpc";
import Modal from "./common/Modal";
import MovieFind from "./MovieFind";

interface AddEpisodeExtraModalProps {
	episode: Episode
}

const AddEpisodeExtraModal: FC<AddEpisodeExtraModalProps> = ({ episode }) => {
	const reviewer = trpc.user.me.useQuery();
	const [modalOpen, setModalOpen] = useState(false)
	const [movie, setMovie] = useState<Movie | null>(null)
	const {mutate: addExtra} = trpc.review.add.useMutation({
		onSuccess: () => {
			closeModal()
		}
	})
	const closeModal = function() {
		setModalOpen(false)
		setMovie(null)
	}
	const handleAddExtra = function() {
		if (reviewer?.data && movie) {
			addExtra({
				episodeId: episode.id,
				userId: reviewer.data.id,
				movieId: movie.id
			})
		}
	}

	console.log("add extra", reviewer, movie)
	return <Modal  isOpen={modalOpen} setIsOpen={setModalOpen} openText="Add Extra" titleText="New Extra">
		<div className="p-3 space-y-4 bg-gray-800">
			<div className="flex flex-col gap-2">
				<label htmlFor="movie">Movie</label>
				<MovieFind selectMovie={setMovie} />
				<button
					onClick={closeModal}
					className="rounded-md bg-gray-500 p-1 text-xs transition hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					onClick={handleAddExtra}
					disabled={!reviewer?.data || !movie}
					className="rounded-md bg-violet-500 p-1 text-xs transition hover:bg-violet-600 disabled:bg-gray-600 disabled:text-gray-400"
				>
					Add Extra
				</button>
			</div>
		</div>
	</Modal>
}
export default AddEpisodeExtraModal