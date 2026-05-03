#!/bin/bash
# ============================================================
# Crée une archive téléchargeable du projet
# Lance depuis le Shell Replit :
#   bash telecharger.sh
# Puis dans le panneau Files → clic droit sur matrice-export.zip → Download
# ============================================================

echo "📦 Création de l'archive matrice-export.zip..."

zip -r matrice-export.zip . \
  --exclude '.git/*' \
  --exclude '*/node_modules/*' \
  --exclude 'node_modules/*' \
  --exclude '*/.replit-artifact/*' \
  --exclude '*/dist/*' \
  --exclude 'dist/*' \
  --exclude '*.log' \
  --exclude '.replit' \
  --exclude 'matrice-export.zip'

SIZE=$(du -sh matrice-export.zip | cut -f1)

echo ""
echo "✅ Archive créée : matrice-export.zip ($SIZE)"
echo ""
echo "Pour télécharger :"
echo "  → Dans le panneau Files (à gauche)"
echo "  → Clic droit sur 'matrice-export.zip'"
echo "  → 'Download'"
