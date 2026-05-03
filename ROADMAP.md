# ROADMAP — Matrice Narrative

*Dernière mise à jour : 3 mai 2026 — v2.0*

---

## ÉTAT ACTUEL — v2.0 ✅

### Infrastructure
- [x] Monorepo pnpm (frontend, API, libs partagées)
- [x] Express 5 + Drizzle ORM + PostgreSQL (20 tables)
- [x] React + Vite + TypeScript + Tailwind CSS v4
- [x] Docker + Docker Compose (déploiement VPS)
- [x] Nginx (reverse proxy, SSL, gzip, cache)
- [x] Admin sécurisé (HMAC-SHA256)
- [x] Génération IA avec fallback déterministe universel
- [x] Cron quotidien automatique (enrichissement Laboratoire)

### Pipeline narratif
- [x] Matrice Narrative (logline, synopsis, thèmes, lois, motifs, fins possibles)
- [x] Noyau Émotionnel (arc, catharsis, rythme, empathie)
- [x] Personnages (galerie, psychologie, archétypes, arcs)
- [x] Relations entre personnages (graphe IA)
- [x] Monde & Temps (worldbuilding, chronologie, logique temporelle)
- [x] Notes de Recherche (contexte documentaire IA)
- [x] Scores H.P.S.A. (4 métriques narratives custom)
- [x] Atelier Roman (plan chapitré)
- [x] Atelier Scénario (formaté)
- [x] Atelier Série (structure sérielle, épisodes, arcs longs)
- [x] Dossier de Pitch (producteurs / éditeurs)
- [x] Exports (JSON / TXT / Markdown)

### Analyse IA
- [x] Analyse contextualisée (6 dimensions, injection matrice + personnages + skills)
- [x] Progression inter-sessions (chart Bézier, deltas, streak)
- [x] Analyse standalone (sans contexte projet)
- [x] Laboratoire narratif (corpus cross-culturel)
- [x] Skills narratifs secrets (injectés dans les prompts)

### Outils d'Immersion (11)
- [x] Arc de Tension (Recharts, acte par acte)
- [x] Chambre des Atmosphères (palette, musique, style cinéma)
- [x] Constellation (carte SVG interactive)
- [x] Dialogue des Personnages (chat IA incarné)
- [x] Mode Réalisateur (découpe technique depuis un passage)
- [x] Carnet de Tournage (compilation PDF imprimable)
- [x] Écho du Temps (résonances mythiques/historiques)
- [x] Miroir Artistique (thème caché, angles morts)
- [x] Les 5 Piliers (humour/suspense/émotion/tendresse/surprise)
- [x] Séquencier professionnel (séquences numérotées, fonctions dramatiques)
- [x] Note d'Intention Cinématographique (document CNC/festivals, 8 sections)

---

## v2.1 — Court terme 🔜
*Prochains sprints — impact immédiat*

### Authentification multi-utilisateurs
- [ ] Intégration Clerk Auth
- [ ] Espace personnel par utilisateur
- [ ] Projets isolés par compte
- [ ] Migration des données existantes

### Export PDF natif
- [ ] Note d'Intention en PDF côté serveur (Puppeteer)
- [ ] Séquencier en PDF côté serveur
- [ ] Template PDF premium (mise en page professionnelle)
- [ ] Export Dossier de Pitch en PDF

### Beat Sheet / Structure narrative
- [ ] Nouveau module "Structure" — visualisation 3 actes
- [ ] Points de bascule automatiquement identifiés depuis la matrice
- [ ] Midpoint, All is Lost, Dark Night of the Soul
- [ ] Compatible avec Save the Cat et le modèle de Syd Field

### Analyse améliorée
- [ ] Export CSV de toutes les analyses
- [ ] Mode Révision — comparer deux versions d'un même passage
- [ ] Pagination (listes > 50 entrées)
- [ ] Connexion Ateliers → Analyse (analyser le texte généré directement)

---

## v2.2 — Moyen terme 📅
*1–3 mois*

### Templates par genre
- [ ] Bibliothèque de 12 templates genre (thriller, drame, comédie, fantastique, historique, sci-fi, horreur, romance, biopic, road movie, teen drama, policier)
- [ ] Ajustement automatique des prompts IA selon le genre
- [ ] Structures suggérées spécifiques au genre

### Générateur de Loglines
- [ ] 5 à 10 variations de logline depuis la matrice
- [ ] Scoring de chaque variante (clarté, tension, originalité, accroche)
- [ ] A/B testing narratif (quelle logline résonne le mieux ?)

### Moodboard visuel
- [ ] Intégration TMDB API pour les références cinéma dans les Atmosphères
- [ ] Galerie d'images par ambiance (Unsplash / Pexels)
- [ ] Export du moodboard en image

### Snapshots de modules
- [ ] Table `module_snapshots` — photographier l'état d'un module avant réécriture
- [ ] Interface de comparaison avant/après
- [ ] Restauration d'un snapshot antérieur

### Dashboard amélioré
- [ ] Vue "Kanban" des projets (En cours / En pause / Terminé)
- [ ] Statistiques globales auteur (mots générés, analyses effectuées, progression moyenne)
- [ ] Rappels de reprise (projets inactifs depuis > 7 jours)

---

## v3.0 — Long terme 🔭
*6–12 mois*

### Application mobile
- [ ] Expo React Native
- [ ] Mode lecture (consulter la matrice, les personnages, le séquencier)
- [ ] Dictaphone narratif — enregistrer des idées vocalement, transcription automatique
- [ ] Annotations synchronisées avec le projet desktop

### Mode collaboratif
- [ ] Co-écriture en temps réel (WebSockets + CRDT)
- [ ] Commentaires par section de module
- [ ] Historique des modifications avec attribution par auteur
- [ ] Gestion des rôles (auteur principal, co-auteur, lecteur)

### API publique
- [ ] Documentation OpenAPI complète
- [ ] Authentification par clé API
- [ ] Webhook entrant (envoyer un extrait depuis Notion / Obsidian / Scrivener)
- [ ] Webhook sortant (notifier une app externe après analyse)

### Analyse globale du manuscrit
- [ ] Upload d'un texte long (jusqu'à 80 000 mots)
- [ ] Découpage automatique en segments narratifs
- [ ] Analyse de la progression structurelle globale
- [ ] Carte de chaleur de cohérence sur l'ensemble du texte
- [ ] Identification des chapitres/scènes problématiques

### Intelligence narrative avancée
- [ ] Comparaison inter-projets (cohérence stylistique entre deux œuvres)
- [ ] Détection automatique du sous-genre narratif (thriller psychologique vs thriller d'action...)
- [ ] Analyse de la voix narrative (1ère/3ème personne, distanciation, focalisation)
- [ ] Cartographie des thèmes récurrents sur la durée

---

## IDÉES EN EXPLORATION 💡
*À évaluer selon les retours utilisateurs*

- **Mode "Pitch Deck"** — présentation visuelle pour les investisseurs (slides automatiques depuis la matrice)
- **Intégration IMDB / Letterboxd** — enrichir automatiquement les références cinéma dans les atmosphères
- **Comparateur de projets** — "Ton projet ressemble à Film X à 73%" (kNN sur les embeddings de matrices)
- **Mode "Atelier Graphique"** — storyboard textuel avec description de chaque image
- **Traduction automatique** — générer la Note d'Intention en anglais pour les coproductions
- **Analyse de dialogues** — cohérence de la voix de chaque personnage sur tout le texte
- **Générateur de biographies de personnages** — backstory complète, 2000 mots, depuis la fiche psychologique

---

## DÉCISIONS ARCHITECTURALES PRISES

| Décision | Justification |
|----------|---------------|
| Un seul `generationService.ts` | Cohérence des patterns IA, fallback universel, maintenabilité |
| Fallback déterministe obligatoire | Jamais d'état vide face à l'utilisateur |
| Pas de SSE pour les générations | Timeout nginx à 120s suffit, moins de complexité client |
| Zod v4 + Drizzle strict | Sécurité des types bout-en-bout |
| Pas de `console.log` — Pino uniquement | Logs structurés JSON, compatibles cloud |
| Wouter (pas React Router) | Légèreté, pas de dépendances inutiles |

---

*Matrice Narrative — Roadmap v2.0 — mai 2026*
*Mis à jour à chaque sprint — source de vérité : ce fichier*
