import 'dotenv/config';
import Stripe from 'stripe';

// Initialize Stripe with your secret key from the environment (exit if missing)
const apiKey = process.env.STRIPE_API_KEY;
if (!apiKey) {
	console.error('❌ Missing STRIPE_API_KEY in environment');
	process.exit(1);
}
const stripe = new Stripe(apiKey);

async function seedEventlySubscription() {
	// Create the Evently Subscription product
	const product = await stripe.products.create({
		name: 'Evently Subscription',
		description: 'Access personalized event recommendations for $8 per month on evently.life'
	});

	// Create the monthly recurring price at $8
	const price = await stripe.prices.create({
		product: product.id,
		currency: 'usd',
		unit_amount: 800,
		recurring: { interval: 'month', interval_count: 1 }
	});

	console.log('✅ Seeded Evently Subscription');
	console.log('Product ID:', product.id);
	console.log('Price ID:', price.id);
}

seedEventlySubscription().catch(err => {
	console.error('❌ Seed script failed:', err);
	process.exit(1);
}); 