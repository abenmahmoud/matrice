#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${MATRICE_DB_CONTAINER:-matrice-postgres-1}"
DB_USER="${MATRICE_DB_USER:-matrice}"
DB_NAME="${MATRICE_DB_NAME:-matrice_narrative}"
BACKUP_DIR="${MATRICE_BACKUP_DIR:-/opt/matrice/backups}"
RETENTION_DAYS="${MATRICE_BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMP_DUMP="$(mktemp)"
OUTPUT_FILE="${BACKUP_DIR}/matrice-${DB_NAME}-${TIMESTAMP}.dump.gpg"

cleanup() {
  rm -f "${TMP_DUMP}"
}
trap cleanup EXIT

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

docker exec "${CONTAINER_NAME}" pg_dump \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --no-owner \
  --no-acl > "${TMP_DUMP}"

if [[ -n "${MATRICE_BACKUP_GPG_RECIPIENT:-}" ]]; then
  gpg --batch --yes --encrypt --recipient "${MATRICE_BACKUP_GPG_RECIPIENT}" --output "${OUTPUT_FILE}" "${TMP_DUMP}"
elif [[ -n "${MATRICE_BACKUP_PASSPHRASE:-}" ]]; then
  gpg --batch --yes --pinentry-mode loopback --passphrase "${MATRICE_BACKUP_PASSPHRASE}" \
    --symmetric --cipher-algo AES256 --output "${OUTPUT_FILE}" "${TMP_DUMP}"
else
  echo "Backup aborted: set MATRICE_BACKUP_GPG_RECIPIENT or MATRICE_BACKUP_PASSPHRASE." >&2
  exit 2
fi

chmod 600 "${OUTPUT_FILE}"
find "${BACKUP_DIR}" -type f -name "matrice-${DB_NAME}-*.dump.gpg" -mtime +"${RETENTION_DAYS}" -delete

echo "Backup created: ${OUTPUT_FILE}"
