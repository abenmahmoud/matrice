# Etat reprise credits Matrice

## 2026-05-31 - Commit 3 backend

- Generation IA : `productAccessMiddleware` verifie le solde avant les endpoints de generation et debite 1 credit apres reponse 2xx/3xx.
- Exports : les routes d'export verifient le solde avant creation du job et debitent 5 credits une fois le fichier genere.
- Lentille Marche : l'analyse garde son gating Studio/Premium existant, verifie le solde avant appel DeepSeek et debite 10 credits apres persistance du resultat.
- Erreur standard si solde insuffisant : HTTP 402 `{ error: "INSUFFICIENT_CREDITS", needed, balance }`.
- Owner/admin restent exemptes du debit pour garder les audits et tests internes fluides.

## 2026-05-31 - Commit 4 frontend

- Page `/pricing` remplace les anciens paliers Pro/Publish par Free, Studio et Premium, avec toggle mensuel/annuel et checkout Stripe.
- Packs de recharge visibles et relies a `/api/payments/recharge`.
- Page `/billing` affiche solde mensuel/achete/total, historique ledger, abonnement, portail Stripe, changement de plan et factures.
- Header applicatif affiche le solde credits et pointe vers la facturation.
- Les erreurs 402 `INSUFFICIENT_CREDITS` ne redirigent plus vers `/upgrade` : elles declenchent une banniere claire avec bouton "Recharger".
