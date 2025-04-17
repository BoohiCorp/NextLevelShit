"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signUp } from "@/utils/auth-helpers/server";
import { handleRequest, signInWithOAuth } from "@/utils/auth-helpers/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import Particles from "@/components/magicui/particles";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {}

// Helper function to get the redirect URL
function getRedirectUrl() {
	let url =
		process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in your .env!
		process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
		"http://localhost:3000/";
	// Make sure to include `https://` when not localhost.
	url = url.includes("http") ? url : `https://${url}`;
	// Make sure to include trailing `/`
	url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
	url = `${url}auth/callback`; // Append the callback path
	return url;
}

export default function SignUp() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isOAuthSubmitting, setIsOAuthSubmitting] = useState<Provider | null>(
		null,
	);
	const { theme } = useTheme();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setIsSubmitting(true);
		await handleRequest(e, signUp, router);
		setIsSubmitting(false);
	};

	const handleOAuthSignIn = async (provider: Provider) => {
		setIsOAuthSubmitting(provider);
		try {
			await signInWithOAuth({
				provider: provider,
				options: {
					redirectTo: getRedirectUrl(),
				},
			});
		} catch (error) {
			console.error(`Error signing in with ${provider}:`, error);
			setIsOAuthSubmitting(null);
		}
	};

	return (
		<div className="relative flex min-h-[100dvh] flex-col justify-center items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<Particles
				className="absolute inset-0 -z-10"
				quantity={100}
				ease={80}
				color={theme === "dark" ? "#ffffff" : "#000000"}
				refresh
			/>
			<div className="w-full max-w-md z-10">
				<Card className="w-full border-none shadow-xl dark:bg-zinc-900/80 bg-white/80 backdrop-blur-lg">
					<CardContent className="grid gap-6 px-6 pb-6 pt-8">
						<div className="space-y-2 text-center">
							<h1 className="text-3xl font-bold tracking-tight">
								Create Account
							</h1>
							<p className="text-muted-foreground">
								Enter your details or use Google to sign up.
							</p>
						</div>
						<form
							noValidate={true}
							className="grid gap-4"
							onSubmit={(e) => handleSubmit(e)}
						>
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									type="text"
									name="name"
									placeholder="Your Name"
									required
									className="bg-background/50 dark:bg-zinc-800/50"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="name@example.com"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect="off"
									required
									className="bg-background/50 dark:bg-zinc-800/50"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									name="password"
									required
									className="bg-background/50 dark:bg-zinc-800/50"
								/>
							</div>
							<Button
								type="submit"
								className={cn(
									buttonVariants({ size: "lg" }),
									"w-full mt-2 rounded-full",
								)}
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Creating Account..."
									: "Create Account with Email"}
							</Button>
						</form>
						<Separator className="my-2" />
						<div className="grid gap-3">
							<Button
								variant="outline"
								className={cn(
									buttonVariants({ size: "lg", variant: "outline" }),
									"w-full rounded-full border-2 dark:border-white border-primary",
								)}
								onClick={() => handleOAuthSignIn("google")}
								disabled={!!isOAuthSubmitting}
							>
								{isOAuthSubmitting === "google" ? (
									<>
										<LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
										Redirecting...
									</>
								) : (
									<>
										<ChromeIcon className="mr-2 h-4 w-4" />
										Sign up with Google
									</>
								)}
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Already have an account?{" "}
							<Link
								href="/signin"
								className="font-semibold text-primary underline underline-offset-4 hover:text-primary/90"
								prefetch={false}
							>
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function LoadingSpinner(props: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<title>Loading</title>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
}

function ChromeIcon(props: IconProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Google Logo</title>
			<path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
			<path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c.98 0 1.86.4 2.5 1.05l-1.16 1.16c-.34-.31-.82-.51-1.34-.51-1.1 0-2 .9-2 2s.9 2 2 2c1.3 0 1.76-.8 1.88-1.24h-1.88v-1.66h3.47c.05.18.08.38.08.58 0 2.1-1.41 3.59-3.55 3.59z" />
		</svg>
	);
}
