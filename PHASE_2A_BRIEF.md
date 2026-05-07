# Phase 2A - Brief Codex (Onboarding/UX + Lab prive)

**Document complet**: voir Notion - https://www.notion.so/359bf190fe948156924ee121003a45b9

## Quick reference

**Mission**: implementer onboarding/UX commercial propre + Lab prive verrouille sur 3 dimensions.

**Branche**: `feat/phase-2a-onboarding-uxlab` (creer depuis main)

**Architecture cible** :
- 4 paliers: Free / Pro 19 EUR / Studio 49 EUR / Enterprise sur devis
- Lab prive (BraveHeart): memoire creative privee + modules experimentaux + modeles IA premium

**9 tickets dans l ordre recommande** :
1. Page d accueil publique `/` (landing)
2. Page `/pricing`
3. Flow signup avec verification email (Resend)
4. Flow mot de passe oublie
5. Onboarding 3 ecrans premiere connexion
6. Redirects propres 401/402/403
7. Systeme modules experimentaux (table experimental_modules)
8. Cablage modeles IA par plan (Haiku/Sonnet/Opus + override owner)
9. Fix UX POST /api/projects (Zod validation)

**Migrations DB** :
- ALTER app_users : email_verification_token, email_verification_sent_at, password_reset_token, password_reset_expires_at, onboarding_completed_at
- CREATE TABLE experimental_modules

**Variables env nouvelles** : RESEND_API_KEY, MATRICE_PUBLIC_BASE_URL, MATRICE_FROM_EMAIL, MATRICE_FROM_NAME, AI_MODEL_OVERRIDE_OWNER

**15 tests d acceptation globaux** : voir Notion section dediee.

**Definition done** :
- Branche feat/phase-2a-onboarding-uxlab pushee + PR ouverte vers main
- 2 migrations DB propres (Drizzle)
- Landing + pricing accessibles
- Signup -> verify email -> onboarding wizard fonctionnel
- Forgot/reset password fonctionnel
- Modules experimentaux operationnels
- Modeles IA cables par plan
- Validation Zod sur POST /api/projects
- Redirects 401/402/403 propres
- 15 tests d acceptation passes
- AGENTS_COORDINATION.md a jour
- BraveHeart a valide visuellement

**Coordination** : Codex met a jour AGENTS_COORDINATION.md a chaque etape majeure. BraveHeart valide migrations DB avant rebuild prod, fournit RESEND_API_KEY, valide visuellement avant merge dans main.

**Limitations Phase 2A** : pas de Stripe (=> Phase 2C), pas d API publique, pas de white-label.

**A NE JAMAIS toucher** : memoire creative privee (creative_memory_entries), gating viewer.role==='owner'.

---

Document complet et detaille : https://www.notion.so/359bf190fe948156924ee121003a45b9
