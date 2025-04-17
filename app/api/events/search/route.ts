import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_PRIVATE_TOKEN;

/**
 * Searches for events on Eventbrite.
 * 
 * Query Parameters:
 *  - q: Search query string
 *  - location.address: e.g., "San Francisco, CA"
 *  - location.within: e.g., "25mi"
 *  - start_date.range_start: ISO 8601 timestamp (e.g., 2024-08-01T00:00:00Z)
 *  - start_date.range_end: ISO 8601 timestamp
 *  - sort_by: e.g., 'date', 'distance'
 *  - page: Page number for pagination
 */
export async function GET(request: NextRequest) {
	if (!EVENTBRITE_TOKEN) {
		console.error('Eventbrite API token is missing.');
		return NextResponse.json(
			{ error: 'Server configuration error: Eventbrite token missing.' },
			{ status: 500 }
		);
	}

	const { searchParams } = new URL(request.url);

	// Construct the search URL for Eventbrite
	const eventbriteSearchUrl = new URL(`${EVENTBRITE_API_BASE}/events/search/`);

	// Forward relevant query parameters from the incoming request to Eventbrite
	searchParams.forEach((value, key) => {
		// TODO: Add validation/sanitization and potentially map keys if needed
		eventbriteSearchUrl.searchParams.append(key, value);
	});

	// Ensure essential parameters are included if not provided
	if (!eventbriteSearchUrl.searchParams.has('location.address') && !eventbriteSearchUrl.searchParams.has('location.latitude')) {
		// Default location or handle error - For now, let Eventbrite handle it or error
		// Example: eventbriteSearchUrl.searchParams.set('location.address', 'worldwide');
	}
	if (!eventbriteSearchUrl.searchParams.has('expand')) {
		// Expand common fields by default for richer data
		eventbriteSearchUrl.searchParams.set('expand', 'venue,organizer,ticket_availability,category');
	}

	console.log(`Fetching from Eventbrite: ${eventbriteSearchUrl.toString()}`);

	try {
		const response = await fetch(eventbriteSearchUrl.toString(), {
			headers: {
				Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
				Accept: 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Eventbrite API Error:', response.status, errorData);
			return NextResponse.json(
				{ error: 'Failed to fetch events from Eventbrite', details: errorData },
				{ status: response.status }
			);
		}

		const data = await response.json();

		// TODO: Process/transform data if needed before sending to client
		// TODO: Potentially cache results in Supabase events table

		return NextResponse.json(data);

	} catch (error) {
		console.error('Error fetching events:', error);
		return NextResponse.json(
			{ error: 'An unexpected error occurred while fetching events.' },
			{ status: 500 }
		);
	}
} 