import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key (will fail gracefully if not provided yet)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' // Use the latest stable version provided by typescript types
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, currency = 'inr' } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // If the user hasn't added keys yet, return a mock success so the UI doesn't crash during development
      return NextResponse.json({
        clientSecret: 'mock_secret_for_testing',
        mockMode: true,
        message: 'Stripe keys not configured. Running in mock mode.'
      })
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amounts in smallest currency unit (paise/cents)
      currency: currency,
      // In a real app you'd pass metadata like the user's UUID so the webhook knows who paid
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err: any) {
    console.error('Stripe Intent Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
