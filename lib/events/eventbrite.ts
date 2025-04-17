/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createClient } from '@/utils/supabase/server';
import type { Database, Json } from '@/types/db';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_PRIVATE_TOKEN;

// Represents a raw Eventbrite event structure for scraping
export interface EventbriteEvent {
	id: string;
	name?: { text: string } | null;
	description?: { text: string } | null;
	url: string;
	start?: { utc: string };
	end?: { utc: string };
	is_free: boolean;
	ticket_availability?: {
		currency: string;
		min_ticket_price?: { value: number };
		max_ticket_price?: { value: number };
	};
	venue?: {
		id: string;
		name: string;
		address?: { localized_address_display: string; latitude?: string; longitude?: string };
	};
	organizer?: { id: string; name: string };
	logo?: { url: string };
	category?: { id: string; name: string };
	// additional fields may exist
}

export interface ScrapeOptions {
	startDate: string;    // ISO 8601 e.g. '2024-08-01T00:00:00Z'
	endDate: string;      // ISO 8601 e.g. '2024-08-07T23:59:59Z'
	locationAddress?: string;
	locationWithin?: string;
}

// Type for inserting into events table
type EventInsert = Database['public']['Tables']['events']['Insert'];

/**
 * Fetches all Eventbrite events in the given range, then upserts into our `events` table.
 */
export async function scrapeEventbriteEvents(options: ScrapeOptions) {
	if (!EVENTBRITE_TOKEN) {
		throw new Error('Missing EVENTBRITE_PRIVATE_TOKEN in environment');
	}

	const supabase = createClient();
	const { startDate, endDate, locationAddress, locationWithin } = options;
	let page = 1;
	const allEvents: EventbriteEvent[] = [];

	while (true) {
		const url = new URL(`${EVENTBRITE_API_BASE}/events/search/`);
		url.searchParams.set('start_date.range_start', startDate);
		url.searchParams.set('start_date.range_end', endDate);
		url.searchParams.set('expand', 'venue,organizer,category,ticket_availability');
		if (locationAddress) url.searchParams.set('location.address', locationAddress);
		if (locationWithin) url.searchParams.set('location.within', locationWithin);
		url.searchParams.set('page', String(page));

		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
				Accept: 'application/json'
			}
		});
		if (!res.ok) {
			const err = await res.json();
			console.error(`Eventbrite fetch error on page ${page}:`, err);
			throw new Error(`Eventbrite API error: ${JSON.stringify(err)}`);
		}

		const data = await res.json();
		const pageEvents = (data.events ?? []) as EventbriteEvent[];
		allEvents.push(...pageEvents);

		if (!data.pagination?.has_more_items) {
			break;
		}
		page++;
	}

	// Map to our events table schema
	const mapped: EventInsert[] = allEvents.map((e: EventbriteEvent) => ({
		eventbrite_id: e.id,
		name: e.name?.text ?? '',
		description: e.description?.text ?? null,
		url: e.url ?? null,
		start_time: e.start?.utc ?? '',
		end_time: e.end?.utc ?? '',
		is_free: e.is_free,
		currency: e.ticket_availability?.currency ?? null,
		min_price: e.ticket_availability?.min_ticket_price?.value ?? null,
		max_price: e.ticket_availability?.max_ticket_price?.value ?? null,
		venue_id: e.venue?.id ?? null,
		venue_name: e.venue?.name ?? null,
		venue_address: e.venue?.address?.localized_address_display ?? null,
		latitude: e.venue?.address?.latitude ? Number(e.venue.address.latitude) : null,
		longitude: e.venue?.address?.longitude ? Number(e.venue.address.longitude) : null,
		organizer_id: e.organizer?.id ?? null,
		organizer_name: e.organizer?.name ?? null,
		image_url: e.logo?.url ?? null,
		category_id: e.category?.id ?? null,
		category_name: e.category?.name ?? null,
		raw_data: e as unknown as Json
	}));

	const { error } = await supabase
		.from('events')
		.upsert(mapped, { onConflict: 'eventbrite_id' });

	if (error) {
		console.error('Supabase upsert error:', error);
		throw error;
	}

	return { count: mapped.length };
} 