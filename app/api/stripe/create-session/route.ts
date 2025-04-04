import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Fonction cohérente de création de slug utilisée dans toute l'application
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

// Initialiser Stripe avec la clé API secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: Request) {
  try {
    // Vérifier que la clé API est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    // Vérifier que l'URL de l'application est configurée
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL is not defined');
      return NextResponse.json(
        { error: 'Configuration de l\'URL de l\'application manquante' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { serviceId, serviceTitle, price, userId } = body;
    
    // Générer le slug de manière cohérente
    const serviceSlug = getSlug(serviceTitle);
    
    // Valider les données reçues
    if (!serviceId || !serviceTitle || !price || !userId) {
      console.error('Missing required data:', { serviceId, serviceTitle, price, userId, serviceSlug });
      return NextResponse.json(
        { error: 'Données manquantes pour créer une session de paiement' },
        { status: 400 }
      );
    }

    console.log('Creating Stripe session with:', {
      serviceId, 
      serviceTitle, 
      price, 
      userId,
      serviceSlug,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    // Forcer l'URL absolue avec le port correct
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL;

    // URL de succès simplifiée
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/dashboard/marketplace/${serviceSlug}`;
    
    console.log('URLs de redirection:', { successUrl, cancelUrl });

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: serviceTitle,
              description: `Service Klyra: ${serviceTitle}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        serviceId: serviceId.toString(),
        serviceTitle,
        price: price.toString(),
      },
    });

    console.log('Stripe session created successfully:', {
      sessionId: session.id,
      sessionUrl: session.url
    });

    // Retourner l'ID de la session et l'URL de paiement
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    // Log détaillé de l'erreur
    console.error('Erreur Stripe détaillée:', {
      message: error.message,
      type: error.type,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Impossible de créer une session de paiement',
        message: error.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 