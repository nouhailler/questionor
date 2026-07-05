# La question du jour — PWA

Implémentation PWA (vanilla JS, sans build) du design `design_handoff_question_du_jour`.
1001 questions/réponses en français, une par jour, sélection déterministe, favoris et
historique — 100 % hors-ligne après la première visite.

## Lancer en local

Un serveur statique suffit (le service worker et `fetch` des JSON exigent `http://`,
pas `file://`) :

```bash
cd app
python3 -m http.server 8123
# puis ouvrir http://localhost:8123
```

Autre option : `npx serve` dans `app/`.

## Structure

```
app/
├── index.html            # coquille de l'app
├── css/styles.css        # design tokens + styles (hi-fi)
├── js/app.js             # logique : sélection du jour, favoris, rendu, SW
├── manifest.webmanifest  # métadonnées PWA (installable)
├── sw.js                 # service worker — précache complet (offline)
├── icons/                # icônes 192/512 + maskable + apple-touch
└── data/q01.json … q16.json   # dataset de production (1001 questions)
```

## Notes d'implémentation

- **Sélection du jour** : époque 1er juillet 2026 = jour 0 ; `idx = (dayNum × 373) mod N`
  (fallback stride = 1 si `N mod 373 === 0`). Déterministe et recalculable sans stockage.
- **Favoris** : persistés dans `localStorage` (clé `qdj-favs`), comme le prototype.
- **Offline** : le service worker précache l'app + les 16 JSON ; navigation réseau-d'abord
  avec repli cache, assets cache-d'abord.
- **Sécurité** : tout le texte des questions est inséré via `textContent` (pas d'`innerHTML`).
- **Polices** : Baloo 2 + Nunito via Google Fonts (seule dépendance réseau ; l'app reste
  fonctionnelle sans, avec une police système de repli).

## Déploiement

Héberger le dossier `app/` tel quel sur n'importe quel hébergeur statique servant en HTTPS
(GitHub Pages, Netlify, Vercel, Cloudflare Pages…). Aucune étape de build.
