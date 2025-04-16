const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Les variables d\'environnement SUPABASE ne sont pas définies');
  process.exit(1);
}

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour uploader un fichier
async function uploadFile(filePath, bucketName, targetPath) {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier non trouvé: ${filePath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(fileName);
    
    // Construire le chemin cible dans le bucket
    const finalPath = targetPath || fileName;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(finalPath, fileBuffer, {
        contentType: `image/${fileExtension.replace('.', '')}`,
        upsert: true
      });

    if (error) {
      console.error(`❌ Erreur lors de l'upload de ${fileName}:`, error.message);
      return null;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(finalPath);

    console.log(`✅ Fichier uploadé: ${fileName} -> ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Exception lors de l'upload de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de l\'upload des images pour l\'Academy...');

  // Créer les buckets s'ils n'existent pas
  const buckets = [
    { name: 'academy-images', public: true },
    { name: 'courses', public: true },
    { name: 'resources', public: true }
  ];

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, { public: bucket.public });
    if (error && error.message !== 'Duplicate name') {
      console.error(`❌ Erreur lors de la création du bucket ${bucket.name}:`, error.message);
    } else {
      console.log(`✅ Bucket vérifié: ${bucket.name}`);
    }
  }

  // Exemples d'upload - remplacez par vos propres images
  const imagesToUpload = [
    { 
      path: './public/images/academy/courses/branding.jpg', 
      bucket: 'academy-images', 
      targetPath: 'courses/branding-course.jpg' 
    },
    { 
      path: './public/images/academy/resources/ebook.jpg', 
      bucket: 'academy-images', 
      targetPath: 'resources/branding-ebook.jpg' 
    },
    // Ajoutez d'autres images ici
  ];

  // Upload des images
  for (const image of imagesToUpload) {
    await uploadFile(image.path, image.bucket, image.targetPath);
  }

  console.log('✅ Upload des images terminé!');
}

// Exécution
main().catch(err => {
  console.error('❌ Erreur globale:', err);
  process.exit(1);
}); 