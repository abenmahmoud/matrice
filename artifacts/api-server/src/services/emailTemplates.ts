function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function baseUrl(): string {
  return (process.env["MATRICE_BASE_URL"] ?? process.env["MATRICE_PUBLIC_BASE_URL"] ?? "https://matrice.essuf.fr").replace(/\/$/, "");
}

export type EmailTemplate = { subject: string; html: string; text: string };

export function baseLayout(content: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#F5F1E8;color:#2A2520;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #E8DFC9;border-radius:12px;padding:32px"><p style="margin:0 0 24px;color:#8B6F2E;font-weight:700;letter-spacing:.12em">MATRICE</p>${content}<hr style="border:0;border-top:1px solid #E8DFC9;margin:32px 0 16px"><p style="font-size:12px;color:#5a5246">Matrice par Essuf-Group. <a href="${baseUrl()}/profile/notifications" style="color:#8B6F2E">Gerer mes preferences</a></p></div></body></html>`;
}

export function welcomeEmail(input: { displayName: string; betaExpiresAt?: Date | null }): EmailTemplate {
  const name = escapeHtml(input.displayName || "createur");
  const betaLine = input.betaExpiresAt
    ? `<p>Ton acces beta Premium est actif jusqu'au <strong>${input.betaExpiresAt.toLocaleDateString("fr-FR")}</strong>.</p>`
    : "";
  return {
    subject: input.betaExpiresAt ? "Bienvenue dans la beta Matrice" : "Bienvenue sur Matrice",
    text: `Bienvenue ${input.displayName || "createur"} ! Demarre ici : ${baseUrl()}/onboarding`,
    html: baseLayout(`<h1>Bienvenue ${name}</h1><p>Tu peux maintenant creer ta premiere oeuvre, lancer une Lentille Marche et configurer tes notifications.</p>${betaLine}<p style="margin:28px 0"><a href="${baseUrl()}/onboarding" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Demarrer</a></p>`),
  };
}

export function exportReadyEmail(input: { displayName: string; projectTitle: string; format: string; downloadUrl: string }): EmailTemplate {
  return {
    subject: `Export ${input.format} pret : ${input.projectTitle}`,
    text: `Ton export ${input.format} est pret : ${input.downloadUrl}`,
    html: baseLayout(`<h1>Export pret</h1><p>${escapeHtml(input.displayName)}, ton export <strong>${escapeHtml(input.format)}</strong> de <em>${escapeHtml(input.projectTitle)}</em> est disponible.</p><p style="margin:28px 0"><a href="${input.downloadUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Telecharger</a></p>`),
  };
}

export function lentilleDoneEmail(input: { displayName: string; projectTitle: string; scoreGlobal: number; analysisUrl: string }): EmailTemplate {
  return {
    subject: `Lentille Marche terminee : ${input.projectTitle}`,
    text: `Score global ${input.scoreGlobal}/100 : ${input.analysisUrl}`,
    html: baseLayout(`<h1>Analyse terminee</h1><p>${escapeHtml(input.displayName)}, ta Lentille Marche pour <em>${escapeHtml(input.projectTitle)}</em> est prete.</p><p style="font-size:42px;text-align:center;color:#8B6F2E">${input.scoreGlobal}/100</p><p style="margin:28px 0;text-align:center"><a href="${input.analysisUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Voir l'analyse</a></p>`),
  };
}

export function mandateSignedEmail(input: { displayName: string; projectTitle: string; verifyUrl: string }): EmailTemplate {
  return {
    subject: `Mandat signe : ${input.projectTitle}`,
    text: `Ton mandat est actif : ${input.verifyUrl}`,
    html: baseLayout(`<h1>Mandat actif</h1><p>${escapeHtml(input.displayName)}, ton mandat pour <em>${escapeHtml(input.projectTitle)}</em> est signe et verifiable publiquement.</p><p style="margin:28px 0"><a href="${input.verifyUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Verifier</a></p>`),
  };
}

export function betaExpiringEmail(input: { displayName: string; daysLeft: number; upgradeUrl: string }): EmailTemplate {
  return {
    subject: input.daysLeft > 1 ? `Plus que ${input.daysLeft} jours de beta Premium` : "Dernier jour de beta Premium",
    text: `Ta beta expire bientot : ${input.upgradeUrl}`,
    html: baseLayout(`<h1>Ta beta touche a sa fin</h1><p>${escapeHtml(input.displayName)}, il reste <strong>${input.daysLeft} jour${input.daysLeft > 1 ? "s" : ""}</strong> a ton acces Premium beta.</p><p style="margin:28px 0"><a href="${input.upgradeUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Voir les plans</a></p>`),
  };
}

export function supportReplyEmail(input: { displayName: string; ticketSubject: string; replyBody: string; ticketUrl: string }): EmailTemplate {
  return {
    subject: `Reponse support : ${input.ticketSubject}`,
    text: `${input.replyBody}\n\n${input.ticketUrl}`,
    html: baseLayout(`<h1>Nouvelle reponse</h1><p>${escapeHtml(input.displayName)}, une reponse a ete ajoutee a ta demande.</p><blockquote style="border-left:3px solid #C9A961;padding-left:16px;color:#5a5246">${escapeHtml(input.replyBody)}</blockquote><p style="margin:28px 0"><a href="${input.ticketUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Voir la conversation</a></p>`),
  };
}

export function communityReplyEmail(input: { threadTitle: string; replyAuthorName: string; threadUrl: string }): EmailTemplate {
  return {
    subject: `Nouvelle reponse sur la communaute : ${input.threadTitle}`,
    text: `${input.replyAuthorName} a repondu a ton sujet "${input.threadTitle}" : ${input.threadUrl}`,
    html: baseLayout(`<h1>Nouvelle reponse communaute</h1><p><strong>${escapeHtml(input.replyAuthorName)}</strong> a repondu a ton sujet <em>${escapeHtml(input.threadTitle)}</em>.</p><p style="margin:28px 0"><a href="${input.threadUrl}" style="background:#2A2520;color:#F5F1E8;padding:14px 22px;border-radius:6px;text-decoration:none">Voir la reponse</a></p>`),
  };
}
