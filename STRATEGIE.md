# Matrice Narrative — Document de Stratégie Produit

> Version 1.0 · Mai 2026  
> Confidentiel — Usage interne

---

## Vision

**Matrice Narrative** est le premier OS créatif francophone pour auteurs et cinéastes.  
Il accompagne l'œuvre de l'idée brute jusqu'au dossier professionnel, en suivant la logique naturelle de tout créateur : d'abord l'histoire, ensuite sa forme, enfin sa visualisation.

**Principe fondateur :** la technologie sert la vision créative — jamais l'inverse.  
On ne génère pas des images avant d'avoir une histoire. On ne visualise pas une scène avant d'avoir écrit le scénario.

---

## Positionnement (avril 2026)

| Dimension | Matrice Narrative | Concurrents (Sudowrite, Novelcrafter) |
|-----------|-------------------|---------------------------------------|
| Langue | 100% français — prompts, UI, contenu | Anglais uniquement |
| Périmètre | Roman + Cinéma + Série TV dans un pipeline | Spécialisés roman OU scénario |
| Standards pro | CNC, SACD, festivals, format Fountain | Aucun standard francophone |
| Scoring narratif | H.P.S.A. 4 axes + corrections | Inexistant |
| Pipeline guidé | 5 phases ordonnées | Modules indépendants |
| Marché | 300M de francophones non servis | Marché anglophone saturé |

**Fenêtre d'opportunité estimée : 12–18 mois** avant localisation française des concurrents.

---

## Philosophie du développement

### L'ordre est la loi

Un film ou une série naît toujours dans cet ordre :

```
1. L'HISTOIRE          — Qui sont ces gens ? Que vivent-ils ? Pourquoi ?
2. LA STRUCTURE        — Comment cette histoire se raconte-t-elle ?
3. LE SCÉNARIO         — La mise en mots professionnelle
4. LA VISUALISATION    — À quoi ressemblent les scènes ?
```

Matrice Narrative respecte et renforce cet ordre.  
La génération de visuels ou de vidéos n'a de valeur que si l'histoire qui les justifie existe déjà.

### Puissance progressive

Chaque mise à jour ajoute une couche de puissance sans remettre en cause ce qui existe.  
L'utilisateur découvre la profondeur au fur et à mesure — il n'est jamais submergé dès le départ.

---

## Phases produit

### Phase 0 — Existant (état actuel)

Le pipeline complet est fonctionnel :

| Phase | Modules disponibles |
|-------|---------------------|
| Comprendre | Matrice Narrative · Noyau Émotionnel (9 étapes) · Recherche |
| Construire | Personnages (5 archétypes) · Relations · Monde & Temps |
| Écrire | Atelier Roman · Atelier Scénario · Scènes Jouables · Atelier Série |
| Corriger | Scores H.P.S.A. · Analyse IA contextuelle (4 types) |
| Présenter | Pitch · Note d'Intention · Exports (9 formats) |
| Studio | Arc de Tension · Atmosphères · Constellation · Mode Réalisateur · Séquencier · Dialogue · Écho du Temps · Miroir Artistique · Les 5 Piliers |

**Ce qui manque pour un premier produit attractif :**  
- Éditeur de prose intégré (rédaction du roman directement dans l'outil)  
- Landing page et onboarding guidé  
- Système d'authentification et gestion abonnements

---

### Phase 1 — MVP Commercial (0–3 mois)

**Objectif :** transformer le prototype en produit vendable, sans toucher à la profondeur existante.

#### 1.1 Éditeur de prose intégré

Ajouter un éditeur rich-text dans l'Atelier Roman pour que l'auteur puisse **écrire le roman entier** dans Matrice Narrative, chapitre par chapitre, avec :
- Génération IA du contenu d'un chapitre depuis son plan (POV, lieu, arc, scène clé)
- Compteur de mots et de caractères
- Sauvegarde automatique toutes les 30 secondes
- Historique des 10 dernières versions par chapitre

#### 1.2 Skill CNC & Standards professionnels

Créer un ensemble de connaissances injectées dans la Note d'Intention et le Dossier Pitch :
- Critères de sélection CNC (avance sur recettes, aide à la création)
- Format SACD pour les œuvres audiovisuelles
- Conventions des festivals : Cannes, César, Angoulême
- Vocabulaire professionnel du cinéma français

#### 1.3 Génération de prose scénario

Depuis un beat ou une scène existante dans l'Atelier Scénario :
- Générer le texte complet de la scène au format Fountain
- Contrôle du ton (dramatique, comique, tendu, poétique)
- Suggestion de répliques pour chaque personnage depuis son profil psychologique

#### 1.4 Infrastructure production

- Migration Vercel + Supabase (cohérent avec l'autre SaaS existant)
- Authentification (Clerk ou Supabase Auth)
- Plans tarifaires : Découverte (gratuit, 1 projet) / Pro (€19/mois) / Studio (€39/mois)
- Landing page en français

**Coût infrastructure Phase 1 :** ~€200–250/mois  
**Seuil rentabilité :** 15 utilisateurs Pro

---

### Phase 2 — Puissance IA (3–9 mois)

**Objectif :** introduire les agents spécialisés et la mémoire du projet.  
Ces fonctionnalités rendent Matrice Narrative techniquement irréplicable en 6 mois.

#### 2.1 Agents narratifs spécialisés

Chaque agent est un mode d'analyse IA avec un contexte système différencié :

| Agent | Rôle | Déclencheur |
|-------|------|-------------|
| **Script Doctor** | Analyse scène par scène — tension, sous-texte, HPSA local | Bouton dans Atelier Scénario |
| **Showrunner** | Cohérence inter-épisodes, arcs A/B/C, continuité | Bouton dans Atelier Série |
| **Éditeur Littéraire** | Voix narrative, rythme, focalisation, densité de la prose | Bouton dans Atelier Roman |
| **Architecte Narratif** | Vue macro — contradictions cross-modules, thèmes | Rapport global du projet |
| **Lecteur Cible** | Simulation comité de lecture (CNC, éditeur, producteur) | Choix du profil lecteur |

#### 2.2 Mémoire vectorielle du projet (RAG)

Indexer tout le contenu d'un projet dans une base vectorielle :
- Matrice, personnages, lois d'univers, chapitres, scènes
- Les agents peuvent interroger "tout ce que l'auteur a écrit"
- Détection automatique de contradictions (personnage qui change de prénom, lieu impossible, timeline brisée)
- Chat contextuel : l'auteur pose une question sur son propre projet

#### 2.3 Skills enseignables

L'auteur peut enrichir les skills IA avec ses propres références :
- Uploader des extraits d'auteurs admirés → l'IA adapte son style
- Définir les règles d'écriture personnelles du projet
- Ajouter des références filmiques (style Kubrick, rythme Dolan, etc.)

**Technologies Phase 2 :** pgvector (PostgreSQL), embeddings OpenAI text-embedding-3-small, orchestrateur d'agents maison

---

### Phase 3 — Visualisation & Écosystème (9–18 mois)

**Objectif :** ajouter la visualisation des scènes (le "plus" mentionné) et construire l'écosystème.  
Cette phase n'est pertinente QUE si les Phases 1 et 2 sont solides.

#### 3.1 Visualisation de scènes (Storyboard IA)

Depuis une scène existante dans l'Atelier Scénario ou les Scènes Jouables :
- Génération d'un storyboard image (style croquis cinéma)
- Sélection du plan : large, américain, gros plan, contre-plongée
- Ambiance lumière depuis la Chambre des Atmosphères
- Service : Stable Diffusion (Replicate) ou DALL-E 3 → ~$0.04–0.12 par image

**Uniquement disponible en tier Studio (€39/mois) ou crédits à l'usage.**

#### 3.2 Shot vidéo IA (premium uniquement)

Depuis un storyboard validé :
- Génération d'un shot vidéo 5–10 secondes (RunwayML Gen-4 ou Kling AI)
- Coût réel : ~$0.40–$1.00 par shot
- Modèle : pack de crédits vidéo ($15 = 25 shots)
- L'utilisateur paie l'usage, pas l'infrastructure

**Note importante :** la génération vidéo n'a de sens que si l'histoire, le scénario, et la description de scène existent déjà. Le pipeline Matrice Narrative garantit naturellement cet ordre.

#### 3.3 Écosystème

- Writers' Room (collaboration temps réel, 2–5 personnes sur un projet)
- Portail Producteurs (partage sécurisé du dossier pitch avec tracking des lectures)
- Intégration Final Draft / Highland (import/export professionnel)
- API publique (intégrations tierces, plugins)
- Marketplace de templates et de skills communautaires

---

## Structure tarifaire recommandée

| Plan | Prix | Limites | Cible |
|------|------|---------|-------|
| **Découverte** | Gratuit | 1 projet, 5 générations IA | Découverte, test |
| **Pro** | €19/mois | Projets illimités, IA illimitée, tous les modules | Auteurs actifs |
| **Studio** | €39/mois | Pro + storyboard IA, agents avancés, exports pro | Professionnels |
| **Crédits Vidéo** | €15 = 25 shots | Shots vidéo à la demande | Utilisateurs Studio |

**Objectifs de revenus :**
- 50 users Pro → €950/mois → rentable Phase 1
- 100 users (mix Pro/Studio) → ~€2 500/mois → finance Phase 2

---

## Stack technique retenu

```
Frontend     React + Vite + Tailwind (Vercel)
Backend      Express 5 + TypeScript (Vercel Serverless ou VPS)
Base de données  Supabase (PostgreSQL + pgvector pour Phase 2)
Auth         Clerk ou Supabase Auth
IA texte     OpenAI GPT-4o + GPT-4o-mini (selon complexité)
IA image     DALL-E 3 / Stable Diffusion via Replicate (Phase 3)
IA vidéo     RunwayML Gen-4 ou Kling AI via API (Phase 3)
Stockage     Cloudflare R2 (médias générés)
Monorepo     pnpm workspace (structure actuelle conservée)
```

---

## Prochaines actions immédiates

### Semaine 1–2
- [ ] Éditeur de prose dans l'Atelier Roman (chapitre par chapitre)
- [ ] Génération IA depuis le plan de chapitre (POV + arc → prose)
- [ ] Skill CNC injecté dans Note d'Intention et Pitch

### Semaine 3–4
- [ ] Génération de dialogue depuis les profils psychologiques des personnages
- [ ] Génération prose scène Fountain depuis les beats
- [ ] Sauvegarde auto + historique de versions

### Mois 2
- [ ] Landing page premium en français
- [ ] Onboarding guidé (nouveau projet en 3 minutes)
- [ ] Système d'authentification + plans tarifaires

### Mois 3
- [ ] Agent Script Doctor (première implémentation)
- [ ] Détection de contradictions basique (cross-modules)
- [ ] Export PDF formaté (roman + scénario)

---

## Ce que ce document ne change pas

Le pipeline 5 phases actuel est correct et reste la colonne vertébrale.  
Toutes les améliorations s'ajoutent au-dessus — rien n'est jeté.

L'ordre fondamental est non-négociable :
**Histoire → Structure → Scénario → Visualisation.**  
La visualisation de scènes (storyboard, vidéo) ne sera jamais proposée avant que l'étape scénario soit complétée.

---

*Document maintenu à jour à chaque mise à jour majeure du produit.*  
*Voir aussi : `replit.md` (architecture technique) · `OVERVIEW.html` (résumé fonctionnel) · `COMPETITIVE_ANALYSIS.html` (analyse concurrentielle)*
