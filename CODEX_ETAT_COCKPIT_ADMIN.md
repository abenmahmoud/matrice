# Etat cockpit superadmin

## 2026-05-31 - Bloc 2 premiere passe

- Backend : ajout de `POST /api/admin/users/:id/credits` pour ajuster les credits d'un utilisateur depuis l'admin.
- Backend : le detail `GET /api/admin/users/:id` renvoie maintenant le solde credits, la date de renouvellement et les 25 derniers mouvements du ledger.
- Securite : endpoint protege par `requireAdmin`, raison obligatoire, montant borne de -10000 a 10000, refus d'ajustement owner par un admin non-owner, action tracee dans `admin_audit_log`.
- Frontend : fiche utilisateur admin enrichie avec KPI credits, solde mensuel/achete, formulaire d'ajustement et historique ledger.
- Frontend : navigation `AdminShell` recadree en cockpit 360 : Vue d'ensemble, Finance, Users, Credits, Audit, Support, Invitations, Labo IA, Systeme.

## 2026-05-31 - Bloc 2 finition cockpit

- Dashboard admin : MRR recale sur la nouvelle grille credits (Studio 4,99 EUR/mois, Premium 9,99 EUR/mois ; anciens plans legacy a 0).
- Backend : la liste `GET /api/admin/users` expose aussi `monthlyCredits`, `extraCredits`, `creditsRenewAt`.
- Frontend : nouvelle page `/admin/credits` pour piloter tous les soldes et ouvrir directement la fiche d'ajustement.
- Frontend : nouvelle page `/admin/system` dans `AdminShell`, au lieu de sortir vers `/creator-lab/system`.
- Frontend : table `/admin/users` enrichie avec le solde credits total.
