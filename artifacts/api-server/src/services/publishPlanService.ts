export type SalesChannel = {
  name: string;
  url: string;
  model: "commission" | "abonnement" | "gratuit" | "soumission";
  revenueType: "vente_directe" | "abonnement_lecture" | "licence" | "placement" | "visibilite";
  note: string;
};

export type PublishChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export function mapFormatToPublishWorkType(format: string | null | undefined): string {
  const normalized = normalizeForSearch(format ?? "");
  if (normalized.includes("concept") || normalized.includes("idee") || normalized.includes("pitch") || normalized.includes("bible")) return "concept";
  if (normalized.includes("roman graphique")) return "roman-graphique";
  if (normalized.includes("bd") || normalized.includes("bande dessinee") || normalized.includes("comic")) return "bd";
  if (normalized.includes("nouvelle") || normalized.includes("short story")) return "nouvelle";
  if (normalized.includes("poesie") || normalized.includes("poeme")) return "poesie";
  if (normalized.includes("theatre") || normalized.includes("piece")) return "theatre";
  if (normalized.includes("court")) return "court-metrage";
  if (normalized.includes("scenario") || normalized.includes("scenar") || normalized.includes("screenplay")) return "scenario";
  if (normalized.includes("film") || normalized.includes("long metrage")) return "film";
  if (normalized.includes("serie") || normalized.includes("series")) return "serie";
  if (normalized.includes("roman") || normalized.includes("livre") || normalized.includes("book")) return "roman";
  return "autre";
}

export function suggestSalesChannels(workType: string): SalesChannel[] {
  const bookChannels: SalesChannel[] = [
    { name: "Amazon KDP", url: "https://kdp.amazon.com", model: "commission", revenueType: "vente_directe", note: "Ebook et impression a la demande, tres fort volume potentiel." },
    { name: "Draft2Digital", url: "https://www.draft2digital.com", model: "commission", revenueType: "vente_directe", note: "Agrégation ebook multi-librairies." },
    { name: "StreetLib", url: "https://www.streetlib.com", model: "commission", revenueType: "vente_directe", note: "Distribution ebook et print internationale." },
    { name: "IngramSpark", url: "https://www.ingramspark.com", model: "commission", revenueType: "vente_directe", note: "Réseau librairies et impression a la demande." },
  ];

  const visualChannels: SalesChannel[] = [
    { name: "Amazon KDP", url: "https://kdp.amazon.com", model: "commission", revenueType: "vente_directe", note: "BD/roman graphique en ebook ou print selon format." },
    { name: "IngramSpark", url: "https://www.ingramspark.com", model: "commission", revenueType: "vente_directe", note: "Impression a la demande et librairies." },
    { name: "Webtoon Canvas", url: "https://www.webtoons.com/en/challenge", model: "gratuit", revenueType: "visibilite", note: "Audience verticale, utile pour tester une traction." },
    { name: "Tapas", url: "https://tapas.io", model: "commission", revenueType: "abonnement_lecture", note: "Plateforme webcomic et fiction feuilletonnante." },
    { name: "GlobalComix", url: "https://globalcomix.com", model: "commission", revenueType: "abonnement_lecture", note: "Comics et romans graphiques numeriques." },
    { name: "Izneo", url: "https://www.izneo.com", model: "commission", revenueType: "abonnement_lecture", note: "BD numerique, souvent via editeurs/partenaires." },
  ];

  const videoChannels: SalesChannel[] = [
    { name: "Filmhub", url: "https://filmhub.com", model: "commission", revenueType: "licence", note: "Distribution VOD/FAST vers plateformes partenaires." },
    { name: "Amazon Prime Video Direct", url: "https://videodirect.amazon.com", model: "commission", revenueType: "licence", note: "Depot video selon disponibilite pays et criteres." },
  ];

  const screenplayChannels: SalesChannel[] = [
    { name: "The Black List", url: "https://blcklst.com", model: "abonnement", revenueType: "placement", note: "Visibilite professionnelle du scenario, pas une vente directe." },
    { name: "Coverfly", url: "https://writers.coverfly.com", model: "soumission", revenueType: "placement", note: "Concours, classements et opportunites industrie." },
    { name: "SACD", url: "https://www.sacd.fr", model: "soumission", revenueType: "placement", note: "Protection et reseau auteurs, pas canal de vente directe." },
  ];

  if (["roman", "nouvelle", "poesie", "theatre"].includes(workType)) return bookChannels;
  if (workType === "bd" || workType === "roman-graphique") return visualChannels;
  if (["film", "serie", "court-metrage"].includes(workType)) return videoChannels;
  if (workType === "scenario") return screenplayChannels;
  if (workType === "concept") return [];
  return [...bookChannels.slice(0, 1), ...screenplayChannels.slice(0, 1)];
}

export function buildPublishChecklist(workType: string): PublishChecklistItem[] {
  if (workType === "concept") {
    return [
      { id: "concept_protected", label: "Concept protege via Work Passport / OTS", required: true },
      { id: "pitch_ready", label: "Pitch court clair", required: true },
      { id: "next_format_decided", label: "Format de developpement choisi", required: false },
    ];
  }

  const common: PublishChecklistItem[] = [
    { id: "work_passport_sealed", label: "Work Passport scelle", required: true },
    { id: "export_ready", label: "Export final pret", required: true },
    { id: "metadata_ready", label: "Metadonnees pretes (titre, pitch, auteur, categorie)", required: true },
  ];

  if (["roman", "nouvelle", "poesie", "bd", "roman-graphique"].includes(workType)) {
    return [
      ...common,
      { id: "cover_ready", label: "Couverture prete", required: true },
      { id: "isbn_ready", label: "ISBN decide ou obtenu", required: false },
      { id: "price_ready", label: "Prix public decide", required: true },
    ];
  }

  if (["film", "serie", "court-metrage", "scenario"].includes(workType)) {
    return [
      ...common,
      { id: "pitch_deck_ready", label: "Dossier de pitch pret", required: true },
      { id: "rights_status_clear", label: "Droits et auteurs clarifies", required: true },
      { id: "submission_targets_selected", label: "Cibles de soumission selectionnees", required: false },
    ];
  }

  return common;
}

export function splitRevenue(grossAmountCents: number) {
  const matriceCents = Math.round(grossAmountCents * 0.1);
  return {
    grossAmountCents,
    matriceShareCents: matriceCents,
    authorShareCents: grossAmountCents - matriceCents,
  };
}

function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
