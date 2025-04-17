import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Adjust path if necessary
import type { Database, Json } from '@/types_db'; // Adjust path if necessary

// Interface representing the expected structure from Eventbrite API
// based on documentation and requested expansions.
// Refine further based on actual API responses.
interface EventbriteAddress {
	address_1?: string | null;
	address_2?: string | null;
	city?: string | null;
	region?: string | null;
	postal_code?: string | null;
	country?: string | null;
	latitude?: string | null; // Eventbrite returns coords as strings
	longitude?: string | null;
	localized_address_display?: string | null;
	localized_area_display?: string | null;
	localized_multi_line_address_display?: string[];
}

interface EventbriteVenue {
	id: string;
	name?: string | null;
	address?: EventbriteAddress | null;
	latitude?: string | null; // Direct fields might exist too
	longitude?: string | null;
}

interface EventbriteOrganizer {
	id: string;
	name?: string | null;
}

interface EventbriteCategory {
	id: string;
	name?: string | null;
	name_localized?: string | null;
	slug?: string | null;
}

interface EventbriteEvent {
	id: string; // Required for eventbrite_id
	name?: { text?: string | null } | null; // Required for name
	description?: { text?: string | null; html?: string | null } | null;
	summary?: string | null;
	url?: string | null;
	start?: { utc?: string | null; timezone?: string | null; local?: string | null } | null; // Required for start_time
	end?: { utc?: string | null; timezone?: string | null; local?: string | null } | null; // Required for end_time
	created?: string | null;
	changed?: string | null;
	published?: string | null;
	status?: string | null;
	currency?: string | null;
	online_event?: boolean | null;
	is_free?: boolean | null;
	logo?: { original?: { url?: string | null } | null; id?: string | null; } | null;
	organizer_id?: string | null;
	venue_id?: string | null;
	category_id?: string | null;
	subcategory_id?: string | null;
	format_id?: string | null;

	// --- Expanded fields ---
	venue?: EventbriteVenue | null;
	organizer?: EventbriteOrganizer | null;
	category?: EventbriteCategory | null;
}

// Type for the paginated response structure
interface EventbritePaginatedResponse<T> {
	pagination: {
		object_count: number;
		page_number: number;
		page_size: number;
		page_count: number;
		has_more_items: boolean;
		continuation?: string;
	};
	events: T[]; // Assuming the list is keyed under 'events'
}

export async function POST(req: NextRequest) {
	console.log('Eventbrite scrape route hit');

	// 1. Secure the endpoint: Check for Cron secret
	const cronSecret = process.env.CRON_SECRET;
	const authHeader = req.headers.get('authorization');
	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		console.warn('Unauthorized attempt to access scrape endpoint.');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Get Eventbrite API Key and Org ID from environment variables
	const eventbriteApiKey = process.env.EVENTBRITE_API_KEY;
	const organizationId = process.env.EVENTBRITE_ORGANIZATION_ID;

	if (!eventbriteApiKey || !organizationId) {
		console.error('EVENTBRITE_API_KEY or EVENTBRITE_ORGANIZATION_ID is not set.');
		return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
	}

	// 3. Fetch events from Eventbrite API
	const expansions = 'venue,organizer,category';
	const eventbriteApiUrl = `https://www.eventbriteapi.com/v3/organizations/${organizationId}/events/?expand=${expansions}&status=live,started`; // Fetch live/started events

	const fetchedEvents: EventbriteEvent[] = []; // Use const as it's only pushed to
	let hasMoreItems = false;
	let continuationToken: string | undefined = undefined;

	try {
		do {
			// Construct URL with continuation token if available
			const currentPageUrl = continuationToken
				? `${eventbriteApiUrl}&continuation=${continuationToken}`
				: eventbriteApiUrl;

			console.log(`Fetching events from: ${currentPageUrl}`);
			const response = await fetch(currentPageUrl, {
				headers: {
					Authorization: `Bearer ${eventbriteApiKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(
					`Eventbrite API error: ${response.status} ${response.statusText} - ${errorBody}`
				);
			}

			const data: EventbritePaginatedResponse<EventbriteEvent> = await response.json();

			fetchedEvents.push(...(data.events || []));
			hasMoreItems = data.pagination.has_more_items;
			continuationToken = data.pagination.continuation;

			console.log(
				`Fetched page ${data.pagination.page_number}. Total events so far: ${fetchedEvents.length}. Has more: ${hasMoreItems}`
			);
		} while (hasMoreItems && continuationToken);

		console.log(`Finished fetching. Total events fetched: ${fetchedEvents.length}`);
	} catch (error) {
		console.error(
			'Error fetching from Eventbrite:',
			error instanceof Error ? error.message : String(error)
		);
		return NextResponse.json(
			{
				error: 'Failed to fetch from Eventbrite',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}

	// 4. Transform Eventbrite data and filter invalid entries
	// Use Supabase generated types for clarity
	type EventInsert = Database['public']['Tables']['events']['Insert'];

	const eventsToUpsert: EventInsert[] = [];

	for (const event of fetchedEvents) {
		// Basic validation for required fields
		if (!event.id || !event.name?.text || !event.start?.utc || !event.end?.utc) {
			console.warn(
				'Skipping event due to missing required fields (id, name, start, end):',
				event.id
			);
			continue;
		}

		// Safely parse latitude and longitude using Number methods
		const latitudeStr = event.venue?.latitude;
		const longitudeStr = event.venue?.longitude;
		const latitude = latitudeStr ? Number.parseFloat(latitudeStr) : null;
		const longitude = longitudeStr ? Number.parseFloat(longitudeStr) : null;

		// Construct the object for insertion
		const transformedEvent: EventInsert = {
			// Required fields from schema, validated above
			eventbrite_id: event.id,
			name: event.name.text,
			start_time: event.start.utc,
			end_time: event.end.utc,

			// Optional fields from schema
			description: event.description?.text || event.summary || null,
			url: event.url || null,
			is_free: typeof event.is_free === 'boolean' ? event.is_free : null,
			currency: event.currency || null,
			venue_id: event.venue_id || event.venue?.id || null,
			organizer_id: event.organizer_id || event.organizer?.id || null,
			image_url: event.logo?.original?.url || null,
			category_id: event.category_id || event.category?.id || null,
			status: event.status || null,
			// Ensure raw_data is always a valid Json object, even if empty
			raw_data: (event as unknown as Json) ?? {},

			// Populated from expansions or set to null
			category_name: event.category?.name_localized || event.category?.name || null,
			latitude: !Number.isNaN(latitude) ? latitude : null,
			longitude: !Number.isNaN(longitude) ? longitude : null,
			organizer_name: event.organizer?.name || null,
			venue_address: event.venue?.address?.localized_address_display || null,
			venue_name: event.venue?.name || null,

			// Fields needing specific logic (e.g., price parsing) - set to null for now
			max_price: null,
			min_price: null
			// Omit fields with DB defaults like id, created_at, updated_at
		};

		eventsToUpsert.push(transformedEvent);
	}

	if (eventsToUpsert.length === 0) {
		console.log('No valid Eventbrite events found to upsert.');
		return NextResponse.json({ message: 'No valid events found' });
	}

	// 5. Upsert data into Supabase
	const supabase = createClient();
	console.log(`Attempting to upsert ${eventsToUpsert.length} events...`);

	const { data, error } = await supabase
		.from('events')
		// Cast to any[] to bypass persistent type errors with upsert
		.upsert(eventsToUpsert as any[], {
			onConflict: 'eventbrite_id', // Use the unique Eventbrite ID column
			ignoreDuplicates: false // Update existing records
		})
		.select(); // Select the upserted rows to get counts

	if (error) {
		console.error('Supabase upsert error:', error);
		if (process.env.NODE_ENV === 'development' && eventsToUpsert.length > 0) {
			console.error('Data for first event being upserted:', JSON.stringify(eventsToUpsert[0], null, 2));
		}
		return NextResponse.json({ error: 'Failed to save events to database', details: error.message }, { status: 500 });
	}

	console.log(`Successfully upserted ${data?.length || 0} events from Eventbrite.`);
	return NextResponse.json({ message: `Successfully upserted ${data?.length || 0} events.`, data });
}
