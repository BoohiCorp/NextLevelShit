import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Search, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { cn } from "@/lib/utils";
import HeroSection from "@/components/landing-page/hero";

export default async function IndexPage() {
	return (
		<div className="flex flex-col min-h-screen font-sans">
			<HeroSection />

			{/* How It Works Section */}
			<section id="how-it-works" className="w-full py-16 md:py-24 bg-white">
				<div className="container px-4 md:px-6">
					<h2 className="text-3xl font-bold tracking-tighter text-center text-gray-900 mb-4">
						Your Event Feed,{" "}
						<span className="text-purple-600">Supercharged</span>.
					</h2>
					<p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
						Finding your next great event is simple. Here's how:
					</p>
					<BentoGrid className="max-w-5xl mx-auto grid-cols-1 md:grid-cols-3">
						{[
							{
								Icon: Sparkles,
								name: "1. Share Your Style",
								description:
									"Tell Evently your interests—music, tech, art—and let our AI understand your vibe.",
								className: "md:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-50" />
								),
							},
							{
								Icon: Search,
								name: "2. AI Scouts for You",
								description:
									"Our smart system scans Luma, Eventbrite, Meetup & more for hidden gems matching your taste.",
								className: "md:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 opacity-50" />
								),
							},
							{
								Icon: Calendar,
								name: "3. Get Perfect Matches",
								description:
									"Receive tailored event suggestions delivered right to you. Effortless discovery, finally.",
								className: "md:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 opacity-50" />
								),
							},
						].map((feature) => (
							<BentoCard key={feature.name} {...feature} />
						))}
					</BentoGrid>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"
			>
				<div className="container px-4 md:px-6">
					<h2 className="text-3xl font-bold tracking-tighter text-center text-gray-900 mb-12">
						Why Choose <span className="text-blue-600">Evently</span>?
					</h2>
					<BentoGrid className="max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{[
							{
								Icon: Sparkles,
								name: "Hyper-Personalized AI",
								description:
									"Go beyond simple filters. Our AI truly learns your tastes for uniquely relevant finds.",
								className: "lg:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 opacity-50" />
								),
							},
							{
								Icon: Zap,
								name: "All Events, One Place",
								description:
									"We aggregate from Eventbrite, Luma, Meetup, and local sources, saving you valuable time.",
								className: "lg:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-50" />
								),
							},
							{
								Icon: Search,
								name: "Seamless Discovery",
								description:
									"Enjoy an intuitive interface and smart notifications. Finding events is finally easy.",
								className: "lg:col-span-1",
								href: "#",
								cta: "Learn More",
								background: (
									<div className="absolute -z-10 inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 opacity-50" />
								),
							},
						].map((feature) => (
							<BentoCard key={feature.name} {...feature} />
						))}
					</BentoGrid>
				</div>
			</section>

			{/* Pricing Section */}
			<section id="pricing" className="w-full py-16 md:py-24 bg-white">
				<div className="container px-4 md:px-6 flex justify-center">
					<NeonGradientCard className="max-w-md text-center shadow-xl p-8 md:p-12">
						<h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-900">
							Unlock Premium Event Access
						</h2>
						<p className="text-5xl font-extrabold mb-2 text-gray-900">
							$8<span className="text-2xl font-medium align-top">/mo</span>
						</p>
						<p className="text-gray-600 mb-6">
							Get unlimited AI recommendations, advanced discovery filters, and
							priority alerts. Never miss out again!
						</p>
						<Link href="/signup" className="inline-block">
							<ShimmerButton
								className="shadow-xl"
								shimmerColor="#ffffff"
								background="#007AFF"
							>
								<span className="whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight text-white lg:text-base">
									Start 7-Day Free Trial
								</span>
							</ShimmerButton>
						</Link>
						<p className="text-xs text-gray-500 mt-4">
							No commitment. Cancel anytime.
						</p>
					</NeonGradientCard>
				</div>
			</section>

			{/* Footer CTA */}
			<section className="w-full py-20 md:py-28 bg-gray-50 text-center">
				<div className="container px-4 md:px-6">
					<h2 className="text-3xl font-bold tracking-tighter text-gray-900 mb-4">
						Stop Searching, Start Experiencing.
					</h2>
					<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
						Ready for events perfectly matched to you? Let Evently's AI lead the
						way.
					</p>
					<Link href="/signup" className="inline-block">
						<ShimmerButton background="#007AFF">
							<span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
								Get Started Free <ArrowRight className="ml-2 h-5 w-5 inline" />
							</span>
						</ShimmerButton>
					</Link>
				</div>
			</section>

			{/* Simple Footer */}
			<footer className="w-full py-6 bg-white border-t border-gray-200">
				<div className="container px-4 md:px-6 text-center text-sm text-gray-500">
					© {new Date().getFullYear()} Evently.life. All rights reserved. |{" "}
					<Link href="/privacy" className="hover:underline">
						Privacy
					</Link>{" "}
					|{" "}
					<Link href="/terms" className="hover:underline">
						Terms
					</Link>
				</div>
			</footer>
		</div>
	);
}
