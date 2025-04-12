import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import type { Title } from "../server/tmdb/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import TitleCard from "./TitleCard";
import { api } from "@/trpc/react";

interface TitleSearchProps {
	setTitle: Dispatch<SetStateAction<Title | null>>;
	open: boolean
}

const TitleSearch: FC<TitleSearchProps> = ({ setTitle, open }) => {
	const [modalOpen, setModalOpen] = useState<boolean>(open);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { data: resp } = api.movie.searchByPage.useQuery({
		page: 1,
		term: searchQuery,
	});
	const selectTitle = function(title: Title) {
		setTitle(title);
		setSearchQuery("");
		setModalOpen(false);
	}
	const closeModal = function() {
		setSearchQuery("");
		setModalOpen(false);
	}
	return (
		<>
			{ !modalOpen && (
				<Button
					variant="outline"
					size="icon"
					onClick={() => setModalOpen(true)}
					className="w-full"
				>
					<Search className="h-4 w-4" />
					<span className="sr-only">Search for a movie</span>
				</Button>
			)}
			{ modalOpen && (
				<div className="p-8  inset-0 z-50 flex items-center justify-center bg-black/50">
					<Card className="w-full max-w-4xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Search for a Movie</CardTitle>
							<Button
								variant="ghost"
								size="icon"
								onClick={closeModal}
								className="h-8 w-8"
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search for a movie..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
								</div>
								<CarouselProvider
									naturalSlideWidth={150}
									naturalSlideHeight={300}
									totalSlides={resp?.results.length || 0}
									visibleSlides={5}
									step={5}
									infinite={true}
								>
									<div className="flex justify-between mb-2">
										<Button variant="outline" size="sm">
											<ButtonBack>Previous</ButtonBack>
										</Button>
										<Button variant="outline" size="sm">
											<ButtonNext>Next</ButtonNext>
										</Button>
									</div>
									<Slider>
										{resp?.results.map((title, index) => (
											title?.poster_path && (
												<Slide index={index} key={title.id}>
													<Button
														variant="ghost"
														className="h-full w-full p-0"
														onClick={() => selectTitle(title)}
													>
														<TitleCard title={title} />
													</Button>
												</Slide>
											)
										))}
									</Slider>
								</CarouselProvider>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
};

export default TitleSearch;