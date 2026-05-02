#!/bin/bash
# ============================================================
# Push Matrice Narrative → GitHub
# Lance ce script depuis le Shell Replit :
#   bash push-github.sh
# ============================================================

set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN non trouvé dans les secrets Replit."
  echo "   Va dans Secrets → ajoute GITHUB_TOKEN avec ton token GitHub."
  exit 1
fi

GITHUB_URL="https://abenmahmoud:${GITHUB_TOKEN}@github.com/abenmahmoud/matrice.git"

echo "🔧 Configuration du remote GitHub..."
git remote remove github 2>/dev/null || true
git remote add github "$GITHUB_URL"

echo "📦 Vérification des commits..."
git log --oneline -5

echo ""
echo "🚀 Push vers github.com/abenmahmoud/matrice..."
git push github main

echo ""
echo "✅ Succès ! Ton code est sur GitHub :"
echo "   https://github.com/abenmahmoud/matrice"
