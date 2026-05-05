# Matrice Privee - Strategie de Travail Durable

## Intention

Matrice est d'abord un atelier creatif prive. La priorite n'est pas de vendre vite,
mais de construire un outil puissant, confidentiel et evolutif pour son createur.

La version commerciale viendra plus tard, en extrayant seulement les modules
adaptables au public. Le noyau personnel, les donnees, les preferences creatives,
les prompts avances et le dashboard intime restent prives.

## Principes

- Possession: le code, la base, les secrets, les backups et le deploiement doivent
  appartenir au createur.
- Confidentialite: aucune idee, aucun projet et aucun fragment narratif ne doit
  etre expose inutilement dans les logs, depots ou services tiers.
- Progression par blocs: chaque cycle doit produire un resultat verifiable.
- Compatibilite progressive: garder Replit utile pour visualiser pendant la
  stabilisation, puis preparer le passage VPS.
- Point de retour: creer une sauvegarde ou branche avant chaque gros chantier.

## Phase 1 - Fondations Fiables

Objectif: rendre l'application saine avant d'ajouter de nouvelles ambitions.

- Corriger le typecheck frontend principal.
- Garder l'API typable et buildable.
- Supprimer les instructions Docker invalides.
- Ajouter un `.dockerignore` pour eviter d'envoyer secrets, archives et
  dependances locales dans les builds.
- Eviter les scripts qui ne marchent que dans un environnement implicite.

Critere de succes:

- `corepack pnpm --filter @workspace/matrice-narrative run typecheck` passe.
- `corepack pnpm --filter @workspace/api-server run typecheck` passe.
- Les Dockerfiles sont syntaxiquement valides et prepares pour un build Linux.

## Phase 2 - Replit Comme Atelier De Visualisation

Objectif: continuer a voir et manipuler l'app pendant les corrections.

- Ne pas retirer brutalement les fichiers `.replit` et plugins Replit.
- Garder Vite utilisable avec `PORT` et `BASE_PATH`.
- Corriger sans casser le parcours visuel existant.
- Documenter les variables necessaires pour Replit.

Critere de succes:

- L'application reste visualisable sur Replit.
- Les corrections faites pour le VPS ne bloquent pas l'usage Replit.

## Phase 3 - Sortie Progressive Vers VPS

Objectif: rendre Matrice autonome hors Replit.

- Docker Compose propre: frontend, API, Postgres, reverse proxy.
- OpenAI via cle personnelle ou fournisseur configure, sans dependance obligatoire
  au proxy Replit.
- Secrets uniquement en `.env` local ou secrets VPS.
- HTTPS, sauvegardes Postgres et procedure de restauration.

Critere de succes:

- Un VPS peut reconstruire et lancer l'application depuis le depot.
- Les donnees restent dans une base controlee par le createur.
- Les conteneurs Matrice restent bindes sur `127.0.0.1` et le Nginx systeme
  expose seul le domaine public avec TLS.

## Phase 4 - Dashboard Personnel Evolutif

Objectif: transformer le dashboard en cockpit creatif prive.

Fonctions prioritaires:

- Projets actifs et progression reelle.
- Idees brutes non transformees.
- Fragments/imports recents.
- Alertes de coherence.
- Prochain meilleur geste par projet.
- Recherche dans les projets et analyses.
- Bibliotheque personnelle: themes, motifs, personnages, references, obsessions.

Critere de succes:

- Le dashboard aide a decider quoi faire ensuite, pas seulement a lister des
  projets.

## Phase 5 - Memoire Creative Personnelle

Objectif: ajouter une couche qui represente la sensibilite du createur.

- Regles d'ecriture personnelles.
- References cinema/litterature importantes.
- Interdits narratifs.
- Obsessions recurrentes.
- Criteres de qualite.
- Historique des decisions fortes.

Critere de succes:

- Les generations et analyses deviennent de moins en moins generiques.
- L'outil apprend la direction artistique du createur.

## Phase 6 - Separation Future Commerciale

Objectif: preparer la vente sans exposer le noyau prive.

- Identifier les modules publics possibles.
- Isoler les prompts et donnees prives.
- Preparer une edition publique limitee.
- Garder le cockpit personnel hors produit commercial.

Critere de succes:

- Une future version vendable peut etre creee sans fuite de contenu personnel.

## Phase 6.1 - Verrouillage Abonnement Progressif

Objectif: preparer une edition commerciale sans bloquer l'instance privee.

- `MATRICE_PRODUCT_MODE=private`: tout reste ouvert pour le proprietaire.
- `MATRICE_PRODUCT_MODE=commercial`: les fondations montrent la valeur, puis les
  modules avances declenchent un verrou d'abonnement.
- Parcours gratuit initial: Matrice Narrative et Noyau Emotionnel.
- Parcours premium: personnages, structure, analyse, ecriture, pitch et outils IA
  avances.
- Le backend doit refuser les generations avancees avec `402 PAYWALL_REQUIRED`.
- Le frontend doit montrer les modules premium comme verrouilles, mais visibles.

Critere de succes:

- La vente future est preparee sans Stripe ni auth obligatoires maintenant.
- Le VPS prive continue de fonctionner en acces complet.

## Phase 6.2 - Separation Proprietaire / Public

Objectif: preparer les comptes utilisateurs sans rendre le VPS prive dependant
d'un fournisseur d'authentification.

- En mode `private`, le proprietaire reste reconnu automatiquement.
- En mode `commercial`, le token admin existant identifie le proprietaire.
- Un visiteur sans token est traite comme `public` et reste sur le plan gratuit.
- Les reponses `/api/access` exposent `viewer.role` pour que l'interface sache
  differencier owner/public.
- Les appels API generes et les generations SSE propagent le token admin stocke
  dans le navigateur.
- `MATRICE_AUTH_PROVIDER=admin-token` documente la separation actuelle; `clerk`
  reste la prochaine etape comptes clients.

## Phase 7 - Cockpit Prive Evolutif

Objectif: faire du dashboard un vrai centre de decision personnel.

- Le focus du moment choisit le projet prioritaire, pas seulement le plus recent.
- Les projets sont filtrables par recherche, format et etape.
- Une zone de priorites privees indique quoi reprendre ensuite.
- La bibliotheque active distingue fondations, structure, finalisation et archives.
- Le bloc memoire privee prepare les futures regles creatives, references fortes
  et motifs recurrents.

## Phase 8 - Memoire Creative Privee V1

Objectif: commencer a stocker la sensibilite creative du proprietaire.

- Table `creative_memory_entries` pour les regles, interdits, references, motifs,
  criteres qualite et direction artistique.
- API `/api/memory` reservee au proprietaire.
- Page `/memory` pour ajouter, modifier, filtrer et supprimer les entrees.
- Navigation globale vers la memoire privee.
- Prochaine etape: injecter cette memoire dans les prompts IA.

## Methode De Travail

Chaque bloc suit le meme rythme:

1. Point de retour.
2. Objectif clair.
3. Changement limite.
4. Verification.
5. Resume court.
6. Decision suivante.

Cette methode protege le projet, l'energie du createur et la confidentialite de
Matrice.
