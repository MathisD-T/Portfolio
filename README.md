# Portfolio

Landing page Vite + petit backend Express pour gérer les projets via une API REST + page admin.

## Prérequis
- Node.js 18+

## Scripts
- `npm run dev` : lance front (http://localhost:3000) + API (http://localhost:4000) en parallèle.
- `npm run dev:client` : front uniquement.
- `npm run dev:server` : API uniquement (prend `ADMIN_PASSWORD` en env si défini).
- `npm run build` : build front (dossier `dist`).
- `npm run build:server` : compile l’API dans `backend/dist`.
- `npm run start:server` : démarre l’API compilée depuis `backend/dist/server.js`.
- Déploiement statique GitHub Pages : workflow `.github/workflows/deploy.yml` (push sur `main`).

## API projets
Routes principales :
- `GET /api/projects` — liste des projets (tri possible par `order` côté front).
- `GET /api/projects/:id` — détail.
- `POST /api/projects` — créer (session admin requise).
- `PUT /api/projects/:id` — modifier (session admin requise).
- `DELETE /api/projects/:id` — supprimer (session admin requise).

Schéma de projet (JSON) :
```json
{
  "id": "prj-01",
  "title": "NEXUS_DASHBOARD",
  "shortDescription": "Courte phrase",
  "fullDescription": "Détails longs (optionnel)",
  "technologies": ["React", "TS"],
  "liveUrl": "https://...",
  "githubUrl": "https://... (optionnel)",
  "imageUrl": "https://.../img.png (optionnel)",
  "isHighlighted": true,
  "order": 1
}
```

### Stockage
Les projets sont persistés dans `backend/data/projects.json`. Modifiez/seed ce fichier directement ou via la page admin.

### Sécurité minimale
- Login simple via `POST /api/login` avec le mot de passe `ADMIN_PASSWORD` (défaut: `change-me`).
- En cas de succès, un cookie HttpOnly `admin_session` est émis et utilisé par les routes POST/PUT/DELETE.
- `POST /api/logout` pour invalider la session.
Pour changer le mot de passe : `ADMIN_PASSWORD="mon-mot-de-passe" npm run dev:server` (ou via l’environnement).

## Page admin
- Accessible via `/admin` sur le front.
- Connexion via mot de passe (ADMIN_PASSWORD) puis CRUD complet sur les projets (ordre, highlights, liens, stack, etc.).

## Front
- Section projets inchangée visuellement : les données viennent de `GET /api/projects` avec un loader simple + gestion d’erreur. La prévisualisation affiche une capture automatique du `liveUrl` (ou `imageUrl` si fourni) dans un format vignette ; si vide, un libellé “No live preview” apparaît.
- Le proxy Vite route `/api/*` vers l’API en dev (port 4000).

## GitHub Pages
- Le workflow `Deploy Vite site to GitHub Pages` publie le contenu de `dist` sur GitHub Pages (branche main).
- Le `base` Vite est défini sur `/Portfolio/` dans `vite.config.ts` : change-le si ton nom de repo diffère pour que les assets se résolvent correctement.
- Active Pages dans Settings > Pages > Source: GitHub Actions.
