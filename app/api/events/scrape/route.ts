import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { scrapeEventbriteEvents } from '@/lib/events/eventbrite';

export const config = {
	runtime: 'edge',
	schedule: '0 0 * * *', // run daily at midnight UTC
};

/**
 * Scheduled GET /api/events/scrape  (runs via cron)
 */
export async function GET() {
	const now = new Date();
	const startDate = now.toISOString();
	const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
	try {
		const result = await scrapeEventbriteEvents({ startDate, endDate });
		return NextResponse.json({ success: true, ...result });
	} catch (error: unknown) {
		console.error('Scheduled scrape error:', error);
		const message = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ success: false, message },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/events/scrape
 * Body: { startDate: string; endDate: string; locationAddress?: string; locationWithin?: string }
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = await scrapeEventbriteEvents(body);
		return NextResponse.json({ success: true, ...result });
	} catch (error: unknown) {
		console.error('Error scraping Eventbrite:', error);
		const message = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ success: false, message },
			{ status: 500 }
		);
	}
} 