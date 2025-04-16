# Module Academy - Documentation

Ce module permet d'ajouter une section "Academy" à l'application Klyra, offrant des cours et des ressources aux utilisateurs.

## 🗂 Structure des fichiers

```
app/dashboard/academy/
  ├── page.tsx                 # Page principale de l'Academy
  ├── courses/                 # Section des cours
  │   └── page.tsx             # Liste des cours
  ├── resources/               # Section des ressources
  │   └── page.tsx             # Liste des ressources  
  └── community/               # Section communauté
      └── page.tsx             # Forum et événements
```

## 📊 Structure de la base de données

Le module repose sur deux tables principales dans Supabase :

### Table `courses`
- `id` : UUID primaire
- `title` : Titre du cours
- `description` : Description du cours
- `category_id` : ID de la catégorie (lié à la table categories)
- `level` : Niveau (Débutant, Intermédiaire, Avancé)
- `duration` : Durée du cours
- `lessons` : Nombre de leçons
- `image_url` : URL de l'image
- `is_popular` : Booléen pour les cours populaires
- `is_new` : Booléen pour les nouveaux cours
- `tags` : Tableau de tags

### Table `resources`
- `id` : UUID primaire
- `title` : Titre de la ressource
- `description` : Description de la ressource
- `type` : Type (eBook, Vidéo, Template, Checklist)
- `category_id` : ID de la catégorie
- `image_url` : URL de l'image
- `download_link` : Lien de téléchargement
- `is_popular` : Booléen pour les ressources populaires
- `is_new` : Booléen pour les nouvelles ressources

## 🔐 Politiques de sécurité

- Lecture : Accessible à tous les utilisateurs
- Création/Modification/Suppression : Réservées aux administrateurs

## 📝 Installation

Pour installer le module Academy, suivez ces étapes :

1. Exécutez le script SQL pour créer les tables :
   ```bash
   psql -U postgres -d your_database_name -f supabase/academy_tables.sql
   ```

2. Créez les buckets Supabase pour les images :
   ```bash
   academy-images       # Bucket général pour l'academy
   ```

3. Configurez les politiques de stockage :
   - Lecture publique
   - Écriture réservée aux administrateurs

4. Exécutez le script d'upload des images :
   ```bash
   node scripts/upload_academy_images.js
   ```

## 🎨 Personnalisation

Pour ajouter de nouveaux cours et ressources :

1. Utilisez l'interface d'administration Supabase
2. Ou exécutez des requêtes SQL :
   ```sql
   INSERT INTO courses (title, description, level, duration, lessons, image_url)
   VALUES ('Titre du cours', 'Description', 'Débutant', '3 heures', 8, 'URL_image');
   ```

## 🤝 Intégration avec le reste de l'application

Le module Academy s'intègre avec les composants existants :
- Utilise l'authentification Supabase
- Partage les catégories avec les services
- Utilise le même design system que le reste de l'application 