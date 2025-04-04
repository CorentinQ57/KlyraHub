# Klyra Design Platform

Klyra est une plateforme de design à la demande qui permet aux entreprises tech de commander des services de design et de suivre l'avancement de leurs projets.

## Technologies

- **Frontend**: React, Next.js, TypeScript, TailwindCSS, shadcn UI
- **Backend**: Supabase (Auth, Database, Storage)

## Installation

1. Clonez le dépôt:

```bash
git clone https://github.com/your-username/klyra-design.git
cd klyra-design
```

2. Installez les dépendances:

```bash
npm install
# ou
yarn install
```

3. Configurez les variables d'environnement:

Créez un fichier `.env.local` à la racine du projet avec:

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Lancez le serveur de développement:

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

## Structure du projet

- `/app` - Pages et routing en utilisant la structure de Next.js App Router
- `/components` - Composants React réutilisables
- `/components/ui` - Composants UI basés sur shadcn
- `/lib` - Utilitaires, fonctions d'aide et configuration
- `/public` - Fichiers statiques

## Fonctionnalités

- Authentification utilisateur avec Supabase Auth
- Espace client pour suivre l'avancement des projets
- Interface de chat pour communiquer avec les designers
- Livraison de fichiers en temps réel
- Système de suivi de l'avancement des projets

## Modèle de données

Le projet utilise Supabase comme base de données avec les tables suivantes:

- `users` - Informations utilisateur
- `projects` - Projets de design
- `comments` - Commentaires sur les projets
- `deliverables` - Fichiers livrés aux clients
- `services` - Services de design disponibles
- `categories` - Catégories de services 