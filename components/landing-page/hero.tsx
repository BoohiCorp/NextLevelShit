"use client";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Star } from "lucide-react";
import Particles from "@/components/magicui/particles";
import Ripple from "@/components/magicui/ripple";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import AvatarCircles from "@/components/magicui/avatar-circles";
import { useTheme } from "next-themes";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroSection() {
	const { theme } = useTheme();
	const avatarUrls = [
		"https://avatars.githubusercontent.com/u/16860528",
		"https://avatars.githubusercontent.com/u/20110627",
		"https://avatars.githubusercontent.com/u/106103625",
		"https://avatars.githubusercontent.com/u/59228569",
	];

	const quotes = [
		{
			text: "That's beautiful bro!",
			author: "dcodesdev",
			title: "TypeScript Developer",
			avatarFallback: "DC",
			avatarImg: "/images/dcodes.png",
		},
		{
			text: "If you've built this a few months ago, it would have saved me hours :D",
			author: "SuhailKakar",
			title: "Developer at joinOnboard",
			avatarFallback: "SK",
			avatarImg: "/images/SuhailKakar.jpg",
		},
		{
			text: "So cool, looks really clean. Any plan to open source it? ☺️ Wanna play with it!",
			author: "SaidAitmbarek",
			title: "Founder of microlaunch.net",
			avatarFallback: "SA",
			avatarImg: "/images/said.jpg",
		},
	];

	const [currentQuote, setCurrentQuote] = useState(0);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentQuote((prevQuote) => (prevQuote + 1) % quotes.length);
		}, 5000); // Change quote every 5 seconds

		return () => clearInterval(intervalId);
	}, []);

	return (
		<section className="relative w-full overflow-hidden">
			<div className="absolute inset-0 z-0">
				<Particles
					className="absolute inset-0"
					quantity={300}
					ease={80}
					color={theme === "dark" ? "#FFFFFF" : "#000000"}
					refresh
				/>
				<Ripple />
			</div>
			<div className="container mx-auto px-4 py-12 md:py-16 lg:py-32">
				<div className="relative z-10 flex max-w-[64rem] flex-col items-center gap-6 text-center mx-auto">
					<h1 className="font-heading tracking-tight font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
						Stop Missing Out. <br /> AI Finds Your Perfect Events.
					</h1>
					<p className="max-w-[42rem] font-medium text-primary/80 sm:text-xl sm:leading-8 rounded-full p-2">
						Tired of endless scrolling? Get personalized event recommendations
						from Eventbrite, Luma, Meetup, and more, delivered right to you.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							href="/signup"
							className={cn(
								buttonVariants({ size: "lg" }),
								"rounded-full border-2 border-primary dark:border-white font-bold text-white",
							)}
						>
							Start Your Free Trial
						</Link>
						<Link
							href="#pricing"
							className={cn(
								buttonVariants({ variant: "outline", size: "lg" }),
								"rounded-full border-2 border-primary dark:border-white font-semibold",
							)}
						>
							See Plans & Pricing
						</Link>
					</div>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full">
						<AvatarCircles numPeople={160} avatarUrls={avatarUrls} />
						<div className="flex flex-col items-center sm:items-start mt-2 sm:mt-0">
							<div className="flex flex-row justify-center">
								{[1, 2, 3, 4, 5].map((value) => (
									<Star
										key={value}
										className="fill-yellow-300 text-yellow-400 size-5"
									/>
								))}
							</div>
							<span className="text-sm font-semibold text-primary/80">
								Loved by 160+ event-goers!
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
