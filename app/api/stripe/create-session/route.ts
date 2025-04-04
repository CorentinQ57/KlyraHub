import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Fonction cohérente de création de slug utilisée dans toute l'application
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

// Ne pas initialiser Stripe globalement
// Nous l'initialiserons dans la fonction POST

export async function POST(request: Request) {
  console.log('API /api/stripe/create-session appelée');
  
  // Ajouter les headers CORS
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Gérer la requête OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: responseHeaders
    });
  }
  
  try {
    // Vérifier que la clé API est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500, headers: responseHeaders }
      );
    }

    console.log('Clé API Stripe trouvée, initialisation de Stripe');
    
    // Initialiser Stripe à l'exécution
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Vérifier que l'URL de l'application est configurée
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL is not defined');
      return NextResponse.json(
        { error: 'Configuration de l\'URL de l\'application manquante' },
        { status: 500, headers: responseHeaders }
      );
    }

    // Log du corps de la requête
    console.log('Lecture du body de la requête');
    const body = await request.json();
    console.log('Body reçu:', body);
    
    const { serviceId, serviceTitle, price, userId } = body;
    
    // Générer le slug de manière cohérente
    const serviceSlug = getSlug(serviceTitle);
    
    // Valider les données reçues
    if (!serviceId || !serviceTitle || !price || !userId) {
      console.error('Missing required data:', { serviceId, serviceTitle, price, userId, serviceSlug });
      return NextResponse.json(
        { error: 'Données manquantes pour créer une session de paiement' },
        { status: 400, headers: responseHeaders }
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

    // URL de succès simplifiée - Correction du chemin de redirection
    const successUrl = `${baseUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}&service_id=${serviceId}&title=${encodeURIComponent(serviceTitle)}&price=${price}`;
    const cancelUrl = `${baseUrl}/dashboard/marketplace/${serviceSlug}`;
    
    console.log('URLs de redirection:', { successUrl, cancelUrl });

    try {
      // Créer une session de paiement Stripe
      console.log('Création de la session Stripe...');
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

      // Retourner l'ID de la session et l'URL de paiement avec les headers CORS
      return NextResponse.json({ 
        sessionId: session.id,
        url: session.url 
      }, { headers: responseHeaders });
    } catch (stripeError: any) {
      console.error('Erreur lors de la création de la session Stripe:', stripeError);
      return NextResponse.json(
        { 
          error: 'Erreur Stripe',
          message: stripeError.message
        },
        { status: 500, headers: responseHeaders }
      );
    }
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
      { status: 500, headers: responseHeaders }
    );
  }
} 