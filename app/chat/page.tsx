import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
	title: "Chat | Evently",
	description: "Ask Evently AI for personalized event recommendations",
};

// Dynamically import the Assistant client component to disable SSR
const Chat = dynamic(
	() => import("@/app/assistant").then((mod) => mod.Assistant),
	{ ssr: false },
);

export default function ChatPage() {
	return <Chat />;
}
