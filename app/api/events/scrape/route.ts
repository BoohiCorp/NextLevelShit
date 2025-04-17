import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { scrapeEventbriteEvents } from '@/lib/events/eventbrite';

/**
 * POST /api/events/scrape
 * Body: { startDate: string; endDate: string; locationAddress?: string; locationWithin?: string }
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = await scrapeEventbriteEvents(body);
		return NextResponse.json({ success: true, ...result });
	} catch (error: any) {
		console.error('Error scraping Eventbrite:', error);
		return NextResponse.json(
			{ success: false, message: error.message || 'Scrape failed' },
			{ status: 500 }
		);
	}
} 