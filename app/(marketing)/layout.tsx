import { marketingConfig } from "@/config/marketing";
// import FooterPrimary from "@/components/footer-primary";
import CircularNavigation from "@/components/navigation";
import type React from "react";

import { getUser } from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/client";

interface MarketingLayoutProps {
	children: React.ReactNode;
}

export default async function MarketingLayout({
	children,
}: MarketingLayoutProps) {
	const supabase = createClient();
	const user = await getUser(supabase);

	return (
		<div className="flex min-h-screen flex-col items-center w-full">
			<CircularNavigation items={marketingConfig.mainNav} user={!!user} />
			<main className="flex-1 w-full">{children}</main>
		</div>
	);
}
