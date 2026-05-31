# Etat cockpit superadmin

## 2026-05-31 - Bloc 2 premiere passe

- Backend : ajout de `POST /api/admin/users/:id/credits` pour ajuster les credits d'un utilisateur depuis l'admin.
- Backend : le detail `GET /api/admin/users/:id` renvoie maintenant le solde credits, la date de renouvellement et les 25 derniers mouvements du ledger.
- Securite : endpoint protege par `requireAdmin`, raison obligatoire, montant borne de -10000 a 10000, refus d'ajustement owner par un admin non-owner, action tracee dans `admin_audit_log`.
- Frontend : fiche utilisateur admin enrichie avec KPI credits, solde mensuel/achete, formulaire d'ajustement et historique ledger.
- Frontend : navigation `AdminShell` recadree en cockpit 360 : Vue d'ensemble, Finance, Users, Credits, Audit, Support, Invitations, Labo IA, Systeme.

