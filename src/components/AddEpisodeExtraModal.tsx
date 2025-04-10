'use client';

import type { Episode, Movie } from "@prisma/client";
import { type FC, useState, type Dispatch } from "react";
import { api } from "@/trpc/react";
import Modal from "./common/Modal";
import MovieFind from "./MovieFind";

interface AddEpisodeExtraModalProps {
	episode: Episode,
	setMovieAdded?: Dispatch<Movie>
}

const AddEpisodeExtraModal: FC<AddEpisodeExtraModalProps> = ({ episode, setMovieAdded }) => {
	const reviewer = api.user.me.useQuery();
	const [modalOpen, setModalOpen] = useState(false)
	const [movie, setMovie] = useState<Movie | null>(null)
	const addExtra = api.review.add.useMutation({
		onSuccess: () => {
			if (setMovieAdded && movie) setMovieAdded(movie)
			closeModal()
		}
	})
	const closeModal = function() {
		setModalOpen(false)
		setMovie(null)
	}
	const handleAddExtra = function() {
		if (reviewer?.data && movie) {
			addExtra.mutate({
				userId: reviewer.data.id,
				movieId: movie.id,
				episodeId: episode.id
			})
		}
	}

	return <Modal  isOpen={modalOpen} setIsOpen={setModalOpen} openText="Add Extra" titleText="New Extra">
		<div className="p-3 space-y-4 bg-gray-800">
			<div className="flex flex-col gap-6">
				<label htmlFor="movie">Movie</label>
				<MovieFind selectMovie={setMovie} />
				<button
					onClick={closeModal}
					className="rounded-md bg-gray-500 p-4 text-xs transition hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					onClick={handleAddExtra}
					disabled={!reviewer?.data || !movie}
					className="rounded-md bg-red-800 p-4 text-xs transition hover:bg-red-400 disabled:bg-gray-600 disabled:text-gray-400"
				>
					Add Extra
				</button>
			</div>
		</div>
	</Modal>
}
export default AddEpisodeExtraModal