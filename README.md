# Portfolio (front uniquement)

Portfolio React/Vite entierement client-side : aucune API ou backend n'est necessaire. Les projets sont stockes dans `localStorage` avec un seed initial.

## Prerequis
- Node.js 18+

## Scripts
- `npm run dev` : lance Vite sur http://localhost:3000.
- `npm run build` : build statique dans `dist`.
- `npm run preview` : previsualisation du build.

## Donnees projets
- Seed defini dans `localProjectStore.ts`. Au premier chargement, il est copie dans `localStorage` (`portfolio:projects:v1`).
- Toutes les actions admin (creation, edition, suppression, reset local) lisent/ecrivent dans ce stockage navigateur uniquement.
- Bouton "Reset local" dans l'admin pour revenir au seed.

## Page admin
- Acces via `/admin` (ou `${BASE_URL}admin` sur GitHub Pages).
- Mot de passe cote client (par defaut `terre777`) stocke dans `localStorage` pour la session.
- CRUD complet sur les projets ; pas de persistance serveur.

## Deploiement statique
- 100% compatible GitHub Pages : `base` Vite en relatif (`./`) pour marcher sur n'importe quel sous-dossier (repo) ou custom domain.
- Fallback SPA inclus (`public/404.html`) pour que `/admin` fonctionne en direct sur Pages.
- Workflow `.github/workflows/deploy.yml` publie `dist` sur Pages (`main` -> Pages). Pousser puis attendre la fin de l'action.
