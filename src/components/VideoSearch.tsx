import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import { trpc } from "../utils/trpc";
import Search from "./common/Search";
import Image from "next/image";

import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { type VideoSearchResult } from "../server/yt/client";
import { HiX } from "react-icons/hi";
import { api } from "@/trpc/react";

interface VideoSearchProps {
	setVideo: Dispatch<SetStateAction<VideoSearchResult | undefined>>;
	open?: boolean
}

const VideoSearch: FC<VideoSearchProps> = ({ setVideo, open = false }) => {
	const [modalOpen, setModalOpen] = useState<boolean>(open);
	const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: resp } = api.video.search.useQuery({ searchTerm: searchQuery })
	const selectVideo = function(snippet: VideoSearchResult) {
    setVideo(snippet);
		setSearchQuery("");
		setModalOpen(false);
	}
	const closeModal = function() {
		setSearchQuery("");
		setModalOpen(false);
	}
	return (
		<>
			{ !modalOpen &&
				<div>
					<button
						type="button"
						title="open movie title search modal"
						className="rounded-md bg-violet-500 p-1 text-xs transition hover:bg-violet-600"
						onClick={() => setModalOpen(true)}
					>
						<span className="focus:outline-none inset-y-0 left-0 flex items-center pl-3">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
						</span>
					</button>
				</div>
			}
			{ modalOpen &&
				<div className="text-white w-full inset-0 flex items-center justify-center bg-black/75">
					<div className="p-3 w-full bg-gray-800">
						<div className="relative w-full flex justify-end">
							<button
								type="button"
								title="close movie title search modal"
								onClick={closeModal}
								className="focus:outline-none flex items-center"
							>
                <HiX />
							</button>
						</div>
						<div>
							<Search setSearch={setSearchQuery} />
							<CarouselProvider
								naturalSlideWidth={120}
								naturalSlideHeight={90}
								totalSlides={resp?.items.length || 0}
								visibleSlides={5}
								step={5}
								infinite={true}
							>
								<div className="flex justify-between">
									<ButtonBack>Back</ButtonBack>
									<ButtonNext>Next</ButtonNext>
								</div>
								<Slider>
									{resp?.items.map((video, index) => (
										<Slide index={index} key={video.id.videoId}>
											<button 
												type="button"
												title="select movie title"
												onClick={() => selectVideo(video)}
											>
												<Image unoptimized
                          src={video.snippet.thumbnails.default?.url} 
                          width={video.snippet.thumbnails.default?.width ?? 90} 
                          height={video.snippet.thumbnails.default?.height ?? 120}
                          alt={video.snippet.title}
                        />  
											</button>
										</Slide>
									))}
								</Slider>
							</CarouselProvider>
						</div>
					</div>
				</div>}
		</>
	);
};

export default VideoSearch;