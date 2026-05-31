export function resolveAuthorDisplayName(input: {
  projectAuthorDisplayName?: string | null;
  userDisplayName?: string | null;
  userEmail?: string | null;
  fallback?: string;
}): string {
  const projectName = input.projectAuthorDisplayName?.trim();
  if (projectName) return projectName;
  const displayName = input.userDisplayName?.trim();
  if (displayName) return displayName;
  const email = input.userEmail?.trim();
  if (email) return email;
  return input.fallback ?? "Anonyme";
}

export function resolveExportAuthorName(input: {
  pseudonym?: string | null;
  passportDisplayedAuthor?: string | null;
  projectAuthorDisplayName?: string | null;
  userDisplayName?: string | null;
  userEmail?: string | null;
  fallback?: string;
}): string {
  const pseudonym = input.pseudonym?.trim();
  if (pseudonym) return pseudonym;

  const projectName = input.projectAuthorDisplayName?.trim();
  if (projectName) return projectName;

  const passportAuthor = input.passportDisplayedAuthor?.trim();
  if (passportAuthor) return passportAuthor;

  return resolveAuthorDisplayName(input);
}
