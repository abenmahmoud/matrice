# AGENTS COORDINATION - Matrice

Ce fichier sert de journal de coordination entre Codex, Claude Code et le
createur du projet. Chaque agent doit ajouter une entree courte avant ou apres
un bloc de travail significatif.

## Regles

- Ne jamais travailler directement sur `main`.
- Ne jamais modifier ou revert le travail d'un autre agent sans accord.
- Toujours verifier `git status` avant modification.
- Garder Replit utilisable tant que le VPS n'est pas valide.
- Ne jamais committer `.env`, secrets, cles API, archives ou backups.
- Preferer des variables d'environnement aux valeurs hardcodees.
- Si le VPS a deja Nginx sur 80/443, ne pas binder les conteneurs Matrice sur
  80/443 directement; utiliser un port localhost et un reverse proxy.

## 2026-05-05 - Codex - codex-fondations-durables-matrice

Objectif:
Stabiliser les fondations locales et preparer l'integration avec le travail VPS
de Claude.

Fichiers touches:
- `.gitignore`
- `.dockerignore`
- `Dockerfile.api`
- `Dockerfile.frontend`
- `package.json`
- `MATRICE_PRIVEE_STRATEGIE.md`
- `artifacts/matrice-narrative/src/components/EditableField.tsx`
- `artifacts/matrice-narrative/src/pages/prisme.tsx`
- `artifacts/matrice-narrative/src/pages/dashboard.tsx`

Commandes verifiees:
- `corepack pnpm --filter @workspace/matrice-narrative run typecheck`
- `corepack pnpm --filter @workspace/api-server run typecheck`
- `corepack pnpm run typecheck:libs`
- `git diff --check`

Risques:
- Build Docker non valide localement car Docker Desktop/Linux engine n'est pas
  lance sur la machine Windows.
- Claude travaille sur le VPS sur une branche separee; attention aux conflits
  sur Docker, compose, modeles IA et documentation.

Prochaine etape:
Fusionner proprement le travail Claude VPS avec ces fondations, en gardant une
architecture Replit + VPS durable.
