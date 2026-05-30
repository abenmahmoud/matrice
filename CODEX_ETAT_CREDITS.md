# Etat reprise credits Matrice

## 2026-05-31 - Commit 3 backend

- Generation IA : `productAccessMiddleware` verifie le solde avant les endpoints de generation et debite 1 credit apres reponse 2xx/3xx.
- Exports : les routes d'export verifient le solde avant creation du job et debitent 5 credits une fois le fichier genere.
- Lentille Marche : l'analyse garde son gating Studio/Premium existant, verifie le solde avant appel DeepSeek et debite 10 credits apres persistance du resultat.
- Erreur standard si solde insuffisant : HTTP 402 `{ error: "INSUFFICIENT_CREDITS", needed, balance }`.
- Owner/admin restent exemptes du debit pour garder les audits et tests internes fluides.

