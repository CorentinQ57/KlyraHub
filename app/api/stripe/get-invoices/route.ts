import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

export async function POST(request: Request) {
  try {
    // Vérifier l'origine pour la sécurité CORS
    const headersList = headers();
    const origin = headersList.get('origin');
    const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
      ? [process.env.NEXT_PUBLIC_APP_URL] 
      : ['http://localhost:3000'];
    
    if (!origin || !allowedOrigins.includes(origin)) {
      console.warn(`Unauthorized origin attempt: ${origin}`);
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const { userId, sessionIds } = await request.json();

    // Vérifier les paramètres requis
    if (!userId || !sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Tableau pour stocker les informations des factures
    const invoices: { session_id: string; invoice_url: string }[] = [];

    // Pour chaque ID de session Stripe, essayer de trouver la facture associée
    for (const sessionId of sessionIds) {
      if (!sessionId) continue;
      
      try {
        // Récupérer la session pour obtenir des informations sur la commande
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session && session.payment_intent) {
          // Récupérer les factures liées à ce paiement
          const paymentIntentId = 
            typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent.id;
          
          // Rechercher des factures en utilisant le customer ID au lieu du payment_intent
          const invoiceItems = await stripe.invoices.list({
            customer: session.customer as string,
            limit: 5 // Limiter pour optimiser les performances
          });
          
          // Si nous trouvons des factures, prendre la première
          if (invoiceItems.data.length > 0) {
            const invoice = invoiceItems.data[0];
            
            // Ajouter l'URL de la facture à notre liste de résultats
            if (invoice.hosted_invoice_url) {
              invoices.push({
                session_id: sessionId,
                invoice_url: invoice.hosted_invoice_url
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching invoice for session ${sessionId}:`, error);
        // Continuer avec les autres sessions
      }
    }

    // Renvoyer les informations sur les factures trouvées
    return NextResponse.json(
      { 
        invoices,
        count: invoices.length 
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        } 
      }
    );
  } catch (error) {
    console.error('Error in get-invoices API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  const headersList = headers();
  const origin = headersList.get('origin') || '';

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 