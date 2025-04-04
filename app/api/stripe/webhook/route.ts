import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createProject } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature') || '';

    console.log('Webhook - En-têtes reçus:', {
      signature: signature.substring(0, 20) + '...',
      contentType: headersList.get('content-type'),
    });

    // Vérifier que le secret du webhook est configuré
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET non configuré');
      return NextResponse.json(
        { error: 'Configuration du webhook manquante' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook - Événement reçu:', {
        type: event.type,
        id: event.id,
      });
    } catch (err: any) {
      console.error('Webhook - Erreur de construction:', {
        error: err.message,
        signature: signature.substring(0, 20) + '...',
      });
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Traiter uniquement les événements de paiement réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Webhook - Session complétée:', {
        sessionId: session.id,
        customerId: session.customer,
        metadata: session.metadata,
      });
      
      // Récupérer les métadonnées de la session
      const { userId, serviceId, serviceTitle, price } = session.metadata || {};
      
      // Vérifier toutes les données nécessaires
      const missingData = [];
      if (!userId) missingData.push('userId');
      if (!serviceId) missingData.push('serviceId');
      if (!serviceTitle) missingData.push('serviceTitle');
      if (!price) missingData.push('price');

      if (missingData.length > 0) {
        console.error('Webhook - Données manquantes:', {
          missing: missingData,
          metadata: session.metadata,
        });
        return NextResponse.json(
          { error: `Données manquantes: ${missingData.join(', ')}` },
          { status: 400 }
        );
      }

      try {
        console.log('Webhook - Tentative de création du projet:', {
          userId,
          serviceId,
          serviceTitle,
          price,
        });

        const project = await createProject(
          userId,
          serviceId,
          serviceTitle,
          parseInt(price)
        );
        
        if (!project) {
          console.error('Webhook - Projet non créé (null retourné)');
          return NextResponse.json(
            { error: 'Échec de la création du projet' },
            { status: 500 }
          );
        }

        console.log('Webhook - Projet créé avec succès:', {
          projectId: project.id,
          userId: project.client_id,
          serviceId: project.service_id,
        });

        return NextResponse.json({
          received: true,
          projectId: project.id,
        });
      } catch (error: any) {
        console.error('Webhook - Erreur création projet:', {
          error: error.message,
          userId,
          serviceId,
        });
        return NextResponse.json(
          { error: `Erreur création projet: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Pour les autres types d'événements
    console.log('Webhook - Événement ignoré:', { type: event.type });
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook - Erreur générale:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Erreur webhook: ${error.message}` },
      { status: 500 }
    );
  }
} 