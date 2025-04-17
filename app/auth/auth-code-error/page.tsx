"use client";

import Link from "next/link";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background px-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-destructive">
						Authentication Error
					</CardTitle>
					<CardDescription className="text-muted-foreground pt-2">
						Oops! Something went wrong during the sign-in process. This might
						happen if the authentication link expired or was already used.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="mb-6">Please try signing in again.</p>
					<Link href="/signin">
						<Button className="w-full">Return to Sign In</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
