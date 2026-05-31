# Audit dependances production

Derniere passe: grand chantier correction 31/05/2026.

## Corrections appliquees

`pnpm audit --prod` signalait initialement 4 vulnerabilites critiques et 6 elevees, principalement via `javascript-opentimestamps` et quelques transitifs d'Express.

Les vulnerabilites critiques/elevees ont ete corrigees par overrides pnpm:

- `path-to-regexp` -> `8.4.2`
- `qs` -> `6.15.2`
- `crypto-js` -> `4.2.0`
- `elliptic` -> `6.6.1`
- `form-data` -> `2.5.5`
- `lodash` -> `4.18.1`
- `tough-cookie` -> `4.1.4`
- `bn.js` -> `4.12.3`
- `brace-expansion` -> `2.0.3`

## Reste a traiter

Audit restant apres correction: 2 moderates, 2 lows.

- `request <=2.88.2` (moderate SSRF), via `javascript-opentimestamps`. Aucun patch publie pour `request`.
- `uuid <11.1.1` (moderate), via `request`. Ne pas forcer `uuid@11` dans `request`, car cette ancienne librairie importe les chemins legacy.
- `web3 <=1.5.2` (low), via `javascript-opentimestamps`. Aucun patch compatible dans la chaine actuelle.
- `elliptic <=6.6.1` (low), via `bitcore-lib`. Aucun patch publie pour cet avis.

TODO technique: remplacer `javascript-opentimestamps` par une integration OpenTimestamps maintenue ou un client interne minimal, afin de supprimer `request`, `web3`, `bitcore-lib` et leurs transitifs abandonnes.

Commande de verification:

```bash
corepack pnpm audit --prod
```
