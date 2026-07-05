# La question du jour

Application **PWA** pour un enfant de 4 ans (utilisée par le parent sur son téléphone) :
chaque jour, une question qui éveille la curiosité, avec la réponse adaptée et une
« question pour papoter ». **1001 questions/réponses en français**, en 8 thèmes.

## Structure du dépôt

| Dossier | Contenu |
|---|---|
| [`app/`](app/) | L'application PWA (vanilla JS, sans build) — le livrable. Voir [`app/README.md`](app/README.md). |
| [`design_handoff_question_du_jour/`](design_handoff_question_du_jour/) | Références de design (prototype HTML, screenshots) et dataset de production source. |

## Démarrage rapide

```bash
cd app
python3 -m http.server 8123   # puis ouvrir http://localhost:8123
```

Un serveur HTTP est nécessaire (le service worker et le `fetch` des JSON ne fonctionnent
pas en `file://`). Détails et déploiement dans [`app/README.md`](app/README.md).
