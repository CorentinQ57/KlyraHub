# Handling Supabase Session Timeouts

## Problème
Nous avons rencontré un problème où les données utilisateurs (projets, admin, etc.) ne se chargent pas à cause d'un timeout de session Supabase :
- L'utilisateur est bien authentifié (user détecté, authConfirmed true, isAdmin true) 
- Le layout débloque bien le rendu, avec fallback et timeout OK
- MAIS `getInitialSession` échoue (timeout Supabase)
- Résultat : les composants clients (dashboard, admin...) ne chargent pas leurs données
- Les logs montrent : session timeout, emergency user check, mais aucun appel de data ensuite

## Solution
Notre solution repose sur trois principes clés :

1. **Utiliser l'ID utilisateur plutôt que la session** : Déclencher les appels API dès que `user?.id` ou `user?.email` est disponible, même si `session` est undefined

2. **Ajouter un mécanisme de repli** : Si après 2 secondes aucune donnée n'est chargée malgré un utilisateur détecté, relancer automatiquement la requête

3. **Généraliser avec un hook personnalisé** : Encapsuler cette logique dans un hook réutilisable `useSafeFetch`

## Le Hook useSafeFetch

Le hook `useSafeFetch` gère tout le cycle de vie du chargement des données, avec une gestion intégrée des erreurs et des mécanismes de repli.

### Exemple d'utilisation :

```tsx
// Utilisation du hook - déclaration
const { 
  data: projects,              // Données récupérées 
  isLoading,                   // État du chargement
  error,                       // Erreur éventuelle
  refetch                      // Fonction pour recharger manuellement
} = useSafeFetch(
  // Fonction qui sera appelée pour récupérer les données
  async (userId) => {
    return await fetchProjects(userId);
  },
  [otherDependency]            // Dépendances additionnelles
);

// Utilisation des données
useEffect(() => {
  if (projects) {
    // Faire quelque chose avec les données...
  }
}, [projects]);
```

## Comment ça fonctionne

1. **Détection de l'utilisateur** : Le hook utilise le contexte d'authentification pour détecter quand l'utilisateur est disponible

2. **Chargement automatique** : Dès que `user?.id` ou `user?.email` est disponible, le hook déclenche le chargement des données

3. **Repli automatique** : Si aucune donnée n'est chargée après 2 secondes, une nouvelle tentative est automatiquement lancée avec un message de log explicite

4. **Statut de chargement** : Le statut de chargement est exposé pour afficher les états appropriés dans l'UI

5. **Gestion des erreurs** : Les erreurs sont capturées et exposées pour permettre un traitement approprié

## Où est implémenté ce pattern

Ce pattern est maintenant implémenté dans :

- **Dashboard** : Récupération des projets utilisateur
- **Dashboard Admin** : Récupération des projets pour l'admin
- **Admin Page** : Récupération des statistiques

## Comment étendre

Pour utiliser ce hook dans d'autres composants :

1. Importez le hook :
```tsx
import { useSafeFetch } from '@/lib/hooks/useSafeFetch'
```

2. Remplacez les useEffect/useState pour le chargement des données par le hook :
```tsx
// Avant
useEffect(() => {
  if (user) {
    loadData(user.id)
  }
}, [user])

// Après
const { data, isLoading } = useSafeFetch(
  async (userId) => {
    return await loadData(userId)
  }
)
```

3. Utilisez les données récupérées et l'état de chargement dans votre composant.

## Notes importantes

- Le hook essaie d'abord de charger les données dès que l'utilisateur est disponible
- Si aucune donnée n'est récupérée, un mécanisme de repli lance une seconde tentative après 2 secondes
- Toutes les erreurs sont loguées dans la console pour faciliter le débogage
- Le hook expose une fonction `refetch` pour recharger manuellement les données si nécessaire 