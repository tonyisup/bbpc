import { type FC } from "react";
import Image from "next/image";

interface PlatformLink {
	href: string;
	title: string;
	render: () => React.ReactNode;
}

const platforms: PlatformLink[] = [
	{
		href: "https://www.patreon.com/badboyspodcast",
		title: "Patreon",
		render: () => (
			<Image
				src="/PATREON_WORDMARK_1_BLACK_RGB.svg"
				alt="Patreon"
				width={120}
				height={40}
			/>
		),
	},
	{
		href: "https://podcasts.apple.com/us/podcast/bad-boys-podcast/id937655279",
		title: "Listen on Apple Podcasts",
		render: () => (
			<Image
				src="/apple-badge.svg"
				alt="Listen on Apple Podcasts"
				width={120}
				height={40}
			/>
		),
	},
	{
		href: "https://soundcloud.com/badboyspodcast",
		title: "Listen on Soundcloud",
		render: () => (
			<img
				alt="Listen on Soundcloud"
				src="https://a-v2.sndcdn.com/assets/images/brand-1b72dd82.svg"
				width={90}
				height={24}
				loading="lazy"
			/>
		),
	},
	{
		href: "https://open.spotify.com/show/7kNwGU5aJhw4IZ7x7V6jsl",
		title: "Listen on Spotify",
		render: () => (
			<svg width="90" height="24" viewBox="0 0 165 40" aria-label="Listen on Spotify">
				<g fill="none" fillRule="evenodd">
					<circle cx="82" cy="20" r="20" fill="#1ED760" />
					<path d="M115 17.5c-2.2-1.3-5.5-1.5-5.5-1.5s-3.3.2-5.5 1.5c-2.2 1.3-3.5 3.5-3.5 3.5s1.3 2.2 3.5 3.5c2.2 1.3 5.5 1.5 5.5 1.5s3.3-.2 5.5-1.5c2.2-1.3 3.5-3.5 3.5-3.5s-1.3-2.2-3.5-3.5z" fill="#000" />
					<text x="82" y="24" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">Spotify</text>
				</g>
			</svg>
		),
	},
	{
		href: "https://music.youtube.com/playlist?list=PL5tJGBZ94i2eX66kGUk1dO1SxZiWC5J95",
		title: "Listen on YouTube Music",
		render: () => (
			<Image
				src="/ListenonYouTubeMusic-black-SVG.svg"
				alt="Listen on YouTube Music"
				width={90}
				height={24}
			/>
		),
	},
];

export const ListenHere: FC = () => {
	return (
		<div className="w-full py-6">
			<p className="text-center text-xs text-gray-500 uppercase tracking-wider mb-4">Listen on</p>
			<div className="flex gap-6 justify-center items-center flex-wrap">
				{platforms.map((platform) => (
					<a
						key={platform.title}
						href={platform.href}
						target="_blank"
						rel="noreferrer noopener"
						title={platform.title}
						className="flex items-center opacity-70 transition-opacity hover:opacity-100"
					>
						{platform.render()}
					</a>
				))}
			</div>
		</div>
	);
};
