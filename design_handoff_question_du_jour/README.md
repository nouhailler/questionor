# Handoff: La Question du Jour

## Overview
"La Question du Jour" est une application mobile pour un enfant de 4 ans (utilisée par le parent sur son téléphone). Chaque jour, elle propose une question qui stimule la curiosité — sans attendre de « bonne » réponse de l'enfant. La réponse (adaptée à un enfant de 4 ans) est affichée directement sous la question pour que l'adulte sache répondre, suivie d'une « question de rebond » pour prolonger la discussion.

Contenu : **1001 questions/réponses en français**, réparties en 8 thèmes.

## About the Design Files
Les fichiers de ce dossier sont des **références de design créées en HTML** (dossier `design/`). Ce sont des prototypes montrant l'apparence et le comportement voulus — **pas du code de production à copier tel quel**. La tâche est de **recréer ce design dans l'environnement du codebase cible** (React Native, Flutter, Swift, PWA, etc.) en utilisant ses patterns et bibliothèques existants — ou, s'il n'y a pas encore de codebase, de choisir le framework le plus adapté (une PWA ou React Native conviendrait bien pour un usage téléphone).

Le fichier `design/Question du Jour.dc.html` s'ouvre directement dans un navigateur (avec les fichiers `design/data/*.json` à côté).

**Important : le dataset `data/q01.json` … `data/q16.json` (1001 entrées) est un livrable de production** — à réutiliser tel quel dans l'implémentation finale.

## Fidelity
**High-fidelity (hifi)** : couleurs, typographie, espacements et interactions sont finaux. Recréer l'UI fidèlement.

## Data Model
16 fichiers JSON (`data/q01.json` → `data/q16.json`), chacun un tableau d'objets :

```json
{
  "q": "Pourquoi les oiseaux ne tombent-ils pas quand ils dorment ?",  // question
  "a": "Leurs pattes s'accrochent toutes seules à la branche…",         // réponse (2-3 phrases, ton enfant)
  "r": "Et toi, dans quelle position aimes-tu dormir ?",                 // question de rebond ("Pour papoter")
  "c": "animaux"                                                          // catégorie (clé)
}
```

Catégories (clé → label, emoji, couleur de fond pastel, couleur d'encre) :

| clé | label | emoji | fond | encre |
|---|---|---|---|---|
| animaux | Animaux | 🐰 | #F9DBD9 | #9A544F |
| nature | Nature | 🌿 | #DCEDD5 | #54744A |
| ciel | Ciel & espace | 🌙 | #DCE6F5 | #4E6299 |
| corps | Mon corps | 🖐️ | #FBE6CC | #966C36 |
| meteo | Eau & météo | ☁️ | #D8EFED | #3B7671 |
| objets | Objets & maison | 💡 | #EAE0F4 | #6F5394 |
| manger | À table | 🍓 | #F7ECC8 | #86722B |
| gens | Gens & cœurs | 💛 | #F6DCE9 | #9C4E77 |

### Sélection de la question du jour
- Époque fixe : **1er juillet 2026 = jour 0**. `dayNum = jours entiers écoulés depuis l'époque`.
- Index du jour : `idx = (dayNum × 373) mod N` (N = nombre total de questions ; 373 est premier, ce qui fait alterner les thèmes d'un jour à l'autre). Si `N mod 373 === 0`, fallback stride = 1.
- Déterministe : le même jour affiche toujours la même question, et l'historique est recalculable sans stockage.

## Screens / Views
Application single-screen à 3 onglets, largeur max **430px** centrée, padding horizontal 18px. Fond : dégradé vertical `#E8E0F2 → #F6EEE3 (34%) → #F6EEE3`.

### 1. En-tête (toutes vues)
- Titre « La question du jour » — Baloo 2, 24px, bold (700), `#4A4159`, centré.
- Date du jour en dessous (ex. « dimanche 5 juillet ») — Nunito 14px, `#8C819E`, `text-transform: capitalize`.

### 2. Barre d'onglets (toutes vues)
- Conteneur pill : `rgba(255,255,255,0.55)`, radius 999px, padding 5px, gap 6px, margin-bottom 18px.
- 3 boutons égaux (flex:1) : « Aujourd'hui », « Jours passés », « Préférées » — Nunito 700, 14px, padding 9px, radius 999px.
- Actif : fond `#FFFFFF`, texte `#4A4159`. Inactif : fond transparent, texte `#8C819E`.

### 3. Vue « Aujourd'hui » (et mode « Question surprise »)
Carte blanche : radius 28px, padding 26px 24px 24px, ombre `0 10px 30px rgba(93,76,128,0.12)`, animation d'entrée pop (scale 0.97→1 + fade, 0.35s ease).
- **Ligne du haut** : chip de catégorie (fond/encre du thème, radius 999px, padding 6px 14px, 13px 700, emoji + label) + bouton étoile favori à droite (42×42px rond, fond `#F6F1E9`, ☆ non-favori / ⭐ favori, 20px).
- Si mode surprise : sur-titre « QUESTION SURPRISE » — 12px 700, uppercase, letter-spacing 1.2px, `#B9A8D6`.
- **Question** : Baloo 2, 27px, 600, line-height 1.25, `#4A4159`, `text-wrap: pretty`.
- Séparateur 1px `#F0E9DE`.
- **Label « LA RÉPONSE »** : 12px 800, uppercase, letter-spacing 1.4px, `#C0B5A3`.
- **Réponse** : Nunito 17px, line-height 1.55, `#5C5470`.
- **Encart « POUR PAPOTER »** : fond = couleur du thème, radius 18px, padding 14px 16px. Label 12px 800 uppercase (encre du thème, opacité 0.75) + question de rebond en italique 16px (encre du thème).
- **Bouton « Une autre question ! »** : pleine largeur, fond `#6F5FA3`, texte `#FFF8EE`, Baloo 2 18px 600, padding 15px, radius 999px, ombre `0 6px 16px rgba(111,95,163,0.3)`. Tire une question aléatoire (≠ courante) et passe la carte en mode surprise.
- En mode surprise : lien texte « Revenir à la question du jour » (`#6F5FA3`, 15px 700, souligné).

### 4. Vue « Jours passés »
Liste verticale (gap 12px) des jours précédents, du plus récent au plus ancien (max 30, depuis l'époque). Chaque carte : blanche, radius 22px, padding 18px 20px, ombre `0 6px 18px rgba(93,76,128,0.08)`.
- Ligne d'en-tête (flex, wrap autorisé, gap 6px/8px) : date (« Samedi 4 juillet », 12.5px 800 `#B9A8D6`, capitalize, `flex:1; min-width:90px`) + chip catégorie compacte (11.5px, `white-space:nowrap; flex-shrink:0`) + étoile favori (17px, sans fond).
- Question : Baloo 2 18.5px 600 `#4A4159` ; réponse : 14.5px `#6E6580`.
- État vide (jour 0) : « C'est ton tout premier jour ! Les questions passées apparaîtront ici. » centré, `#8C819E`.

### 5. Vue « Préférées »
Même carte que « Jours passés » sans la date, listant les favoris (plus récent d'abord). L'étoile ⭐ retire des favoris.
- État vide : « Touche l'étoile ⭐ sur une question pour la garder ici. »

### 6. Pied de page
« 1001 questions pour grandir » — 12.5px, `#B4A9C2`, centré, poussé en bas (`margin-top:auto`).

## Interactions & Behavior
- **Onglets** : changement de vue instantané, pas de transition.
- **Favori** : toggle immédiat ☆/⭐, persisté (voir State Management).
- **Une autre question !** : nouvelle question aléatoire à chaque tap ; le sur-titre « Question surprise » et le lien retour apparaissent.
- **Animation** : la carte du jour a une animation pop à l'entrée (0.35s).
- Cibles tactiles ≥ 42px pour les actions principales.
- **Chargement** : « Je prépare ta question… » centré pendant le fetch des 16 JSON (Promise.all ; un fichier en échec renvoie `[]` sans bloquer).

## State Management
- `data` : tableau concaténé des 16 JSON (ordre des fichiers).
- `tab` : `'jour' | 'passees' | 'favs'`.
- `surpriseIdx` : `null` (question du jour) ou index de la question surprise.
- `favs` : tableau d'index de questions, persisté en `localStorage` clé `qdj-favs` (JSON). En production mobile, remplacer par le stockage local de la plateforme.
- Pas de backend : tout est statique + calcul de date.

## Design Tokens
**Couleurs**
- Fond app : dégradé `#E8E0F2 → #F6EEE3`
- Surface carte : `#FFFFFF` ; séparateur `#F0E9DE` ; fond bouton étoile `#F6F1E9`
- Texte principal `#4A4159` ; secondaire `#5C5470` / `#6E6580` ; discret `#8C819E` ; labels `#C0B5A3` ; accents lilas `#B9A8D6` / `#B4A9C2`
- Accent primaire (bouton) : `#6F5FA3`, texte `#FFF8EE`
- 8 paires pastel par catégorie (tableau ci-dessus)

**Typographie** (Google Fonts)
- Display : **Baloo 2** (500/600/700) — titres, questions, bouton principal
- Texte : **Nunito** (400/600/700, + italique) — corps, réponses, UI
- Échelle : 27 / 24 / 18.5 / 18 / 17 / 16 / 14.5 / 14 / 13 / 12.5 / 12 px

**Rayons** : cartes 28px et 22px ; encart 18px ; pills/boutons 999px
**Ombres** : `0 10px 30px rgba(93,76,128,0.12)` (carte principale), `0 6px 18px rgba(93,76,128,0.08)` (cartes liste), `0 6px 16px rgba(111,95,163,0.3)` (bouton)

## Assets
Aucune image. Icônes = emoji système (🐰🌿🌙🖐️☁️💡🍓💛, ☆/⭐). Polices via Google Fonts.

## Files
- `design/Question du Jour.dc.html` — prototype complet (ouvrir dans un navigateur)
- `design/data/q01.json` … `q16.json` — **dataset de production, 1001 questions** (~63 par fichier, groupées par thème : q01-02 animaux, q03-04 nature, q05-06 ciel, q07-08 corps, q09-10 météo, q11-12 objets, q13-14 manger, q15-16 gens)
- `screenshots/01-aujourdhui.png` — vue du jour
- `screenshots/02-question-surprise.png` — mode question surprise
- `screenshots/03-jours-passes.png` — historique
- `screenshots/04-preferees-vide.png` — favoris (état vide)
