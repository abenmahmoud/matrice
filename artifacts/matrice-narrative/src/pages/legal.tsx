import { Link } from "wouter";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

type LegalDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
  }>;
};

const footerLinks = [
  { href: "/legal/mentions-legales", label: "Mentions legales" },
  { href: "/legal/cgu", label: "CGU" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/confidentialite", label: "Confidentialite" },
];

const documents: Record<string, LegalDocument> = {
  mentions: {
    eyebrow: "Informations legales",
    title: "Mentions legales",
    intro: "Informations d'identification de l'editeur de Matrice et du portail Essuf-Group.",
    updatedAt: "31 mai 2026",
    sections: [
      {
        title: "Editeur du service",
        paragraphs: [
          "Le site Matrice est edite par Essuf-Group SASU, societe par actions simplifiee unipersonnelle de droit francais.",
          "SIREN : 105 453 864. Siege social : 47 Rue Vivienne, 75002 Paris, France. Contact : contact@essuf.fr.",
        ],
      },
      {
        title: "Directeur de publication",
        paragraphs: [
          "Le directeur de la publication est le representant legal d'Essuf-Group SASU.",
          "Pour toute demande administrative, ecrire a contact@essuf.fr.",
        ],
      },
      {
        title: "Hebergement",
        paragraphs: [
          "Le service est heberge par Hostinger International Ltd, dont l'infrastructure technique est utilisee pour l'application Matrice et ses services associes.",
          "Les noms de domaine principaux sont essuf.fr, matrice.essuf.fr et sign.essuf.fr.",
        ],
      },
      {
        title: "Propriete intellectuelle",
        paragraphs: [
          "La marque, l'interface, les textes de presentation et les elements logiciels de Matrice appartiennent a Essuf-Group SASU ou a leurs titulaires respectifs.",
          "Les contenus creatifs importes ou rediges par les utilisateurs restent la propriete de leurs auteurs, sous reserve des droits strictement necessaires a l'execution du service.",
        ],
      },
    ],
  },
  cgu: {
    eyebrow: "Conditions d'utilisation",
    title: "Conditions generales d'utilisation",
    intro: "Regles d'utilisation de Matrice pour les comptes auteurs, beta testeurs, administrateurs et visiteurs.",
    updatedAt: "31 mai 2026",
    sections: [
      {
        title: "Objet",
        paragraphs: [
          "Matrice est une plateforme de creation, structuration, protection, export et preparation a la publication d'oeuvres narratives.",
          "L'utilisation du service suppose l'acceptation des presentes conditions par l'utilisateur.",
        ],
      },
      {
        title: "Compte utilisateur",
        paragraphs: [
          "L'utilisateur s'engage a fournir des informations exactes, a conserver la confidentialite de ses identifiants et a signaler toute utilisation non autorisee de son compte.",
          "Essuf-Group peut suspendre un compte en cas d'usage frauduleux, d'atteinte a la securite, de violation manifeste des droits de tiers ou de non-respect des presentes conditions.",
        ],
      },
      {
        title: "Contenus et paternite",
        paragraphs: [
          "L'utilisateur conserve la propriete intellectuelle et la paternite des oeuvres, textes, idees, personnages, documents, exports et fichiers qu'il cree ou importe dans Matrice.",
          "Matrice ne s'approprie jamais l'oeuvre. Les traitements realises par la plateforme servent uniquement a fournir les fonctionnalites demandees par l'utilisateur.",
        ],
      },
      {
        title: "Publication et moderation",
        paragraphs: [
          "Les espaces communautaires doivent rester respectueux, licites et utiles aux auteurs. Sont interdits les contenus haineux, diffamatoires, manifestement illicites, trompeurs ou portant atteinte aux droits de tiers.",
          "Essuf-Group peut masquer, fermer, moderer ou supprimer un contenu communautaire lorsque cela est necessaire pour proteger le service, les utilisateurs ou les droits de tiers.",
        ],
      },
      {
        title: "Disponibilite et evolutions",
        paragraphs: [
          "Matrice est un produit en evolution. Certaines fonctionnalites beta, experimentales ou connectees a des services tiers peuvent etre modifiees, suspendues ou retirees.",
          "Essuf-Group met en oeuvre des efforts raisonnables pour maintenir le service disponible, sans garantir une absence totale d'interruption.",
        ],
      },
    ],
  },
  cgv: {
    eyebrow: "Conditions de vente",
    title: "Conditions generales de vente",
    intro: "Projet de cadre commercial pour les abonnements, credits, recharges et commissions de publication.",
    updatedAt: "31 mai 2026",
    sections: [
      {
        title: "Offres et prix",
        paragraphs: [
          "Matrice propose notamment un plan Free, un plan Studio a 4,99 EUR par mois et un plan Premium a 9,99 EUR par mois, ainsi que des recharges de credits.",
          "Les prix affiches dans l'interface au moment de la commande font foi. Les offres peuvent evoluer pour les nouveaux achats.",
        ],
      },
      {
        title: "Credits et services numeriques",
        paragraphs: [
          "Les credits permettent de consommer certaines actions : generations IA, exports, analyses, operations audio ou autres modules annonces dans l'interface.",
          "Lorsqu'un service numerique est execute immediatement a la demande de l'utilisateur, il peut etre demande a l'utilisateur de reconnaitre que l'execution commence avant la fin du delai de retractation.",
        ],
      },
      {
        title: "Droit de retractation",
        paragraphs: [
          "Conformement au droit applicable aux ventes a distance, le consommateur dispose en principe d'un delai de retractation de 14 jours.",
          "Des exceptions peuvent s'appliquer pour les contenus ou services numeriques fournis sur support immateriel lorsque l'execution a commence avec l'accord prealable du consommateur et sa renonciation au droit de retractation. Cette clause doit etre validee juridiquement avant activation commerciale definitive.",
        ],
      },
      {
        title: "Paiement, remboursement et resiliation",
        paragraphs: [
          "Les paiements sont traites par Stripe. Les abonnements peuvent etre resilies selon les modalites disponibles dans l'espace facturation.",
          "Les remboursements sont etudies au regard de l'offre souscrite, de l'execution effective du service et des obligations legales applicables.",
        ],
      },
      {
        title: "Publication, ventes et commission",
        paragraphs: [
          "Lorsque l'utilisateur publie ou vend une oeuvre via les flux compatibles, il publie sous son nom d'auteur et conserve sa paternite.",
          "Le modele cible prevoit une repartition de 90% pour l'auteur et 10% pour Matrice lorsque Stripe Connect est utilise. Le parametrage fiscal, DAC7, TVA et commission doit etre valide avec le comptable et le conseil juridique avant activation live.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Donnees personnelles",
    title: "Politique de confidentialite",
    intro: "Projet de politique RGPD pour expliquer quelles donnees sont traitees et comment exercer ses droits.",
    updatedAt: "31 mai 2026",
    sections: [
      {
        title: "Responsable de traitement",
        paragraphs: [
          "Le responsable de traitement est Essuf-Group SASU, 47 Rue Vivienne, 75002 Paris, France. Contact donnees personnelles : contact@essuf.fr.",
          "Aucun delegue a la protection des donnees externe n'est designe a ce stade. Toute demande RGPD peut etre adressee a contact@essuf.fr.",
        ],
      },
      {
        title: "Donnees collectees",
        paragraphs: [
          "Matrice peut traiter les donnees de compte, email, nom affiche, informations de facturation, historique d'achat, credits, tickets support, notifications et donnees techniques de securite.",
          "Les contenus creatifs fournis par l'utilisateur sont traites pour fournir les fonctionnalites de creation, analyse, protection, export, signature, publication et support.",
        ],
      },
      {
        title: "Finalites",
        paragraphs: [
          "Les donnees servent a creer le compte, securiser l'acces, fournir les modules Matrice, traiter les paiements, envoyer les emails transactionnels, assurer le support, prevenir la fraude et respecter les obligations legales.",
          "Les analyses IA peuvent impliquer des sous-traitants techniques lorsque la fonctionnalite l'exige. Les sous-traitants identifies incluent notamment Stripe, Resend et DeepSeek, selon les modules actives.",
        ],
      },
      {
        title: "Durees de conservation",
        paragraphs: [
          "Les donnees de compte sont conservees pendant la duree d'utilisation du service puis supprimees ou anonymisees selon les obligations applicables.",
          "Certaines donnees comptables, preuves d'anteriorite, mandats, signatures, ventes et journaux necessaires a la defense de droits peuvent etre conservees pendant les durees legales obligatoires.",
        ],
      },
      {
        title: "Droits RGPD",
        paragraphs: [
          "L'utilisateur dispose de droits d'acces, rectification, effacement, limitation, opposition et portabilite lorsque ces droits sont applicables.",
          "Pour exercer ces droits, ecrire a contact@essuf.fr. Une verification d'identite peut etre demandee si necessaire.",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "Les cookies strictement necessaires au fonctionnement, a l'authentification, a la securite et au maintien des preferences peuvent etre utilises sans consentement prealable.",
          "Les cookies de mesure d'audience ou autres traceurs non essentiels sont desactives par defaut tant que l'utilisateur n'a pas donne son accord.",
        ],
      },
    ],
  },
};

function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <div className="min-h-[100dvh] bg-matrice-ivoire text-matrice-encre">
      <header className="border-b border-matrice-sable bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-matrice-or-fonce">
            Matrice
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-matrice-encre/70 hover:text-matrice-encre">
            Tarifs
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-matrice-encre/60 hover:text-matrice-encre">
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </Link>

        <section className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matrice-or-fonce">{document.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">{document.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-matrice-encre/70">{document.intro}</p>
              <p className="mt-3 text-sm text-matrice-encre/55">Derniere mise a jour : {document.updatedAt}</p>
            </div>
            <div className="rounded-xl border border-matrice-warning/25 bg-matrice-warning/10 p-4 text-sm leading-6 text-matrice-encre/75 lg:max-w-xs">
              <div className="mb-2 flex items-center gap-2 font-semibold text-matrice-encre">
                <ShieldCheck className="h-4 w-4 text-matrice-or-fonce" />
                A faire valider
              </div>
              Projet de document a faire valider par le conseil juridique d'Essuf-Group avant usage commercial definitif.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-8">
            {document.sections.map((section) => (
              <article key={section.title} className="border-b border-matrice-sable/70 pb-8 last:border-b-0 last:pb-0">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-matrice-or-fonce" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <div className="space-y-3 text-sm leading-7 text-matrice-encre/72">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-matrice-sable bg-white/65 px-4 py-6 text-sm text-matrice-encre/60 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <span>Essuf-Group SASU - Matrice</span>
          <nav className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-matrice-encre">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function LegalMentionsPage() {
  return <LegalPage document={documents.mentions} />;
}

export function LegalCguPage() {
  return <LegalPage document={documents.cgu} />;
}

export function LegalCgvPage() {
  return <LegalPage document={documents.cgv} />;
}

export function LegalPrivacyPage() {
  return <LegalPage document={documents.privacy} />;
}
