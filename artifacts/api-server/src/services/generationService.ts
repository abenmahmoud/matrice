/**
 * Generation Service — deterministic mock generation based on project data.
 * TODO: Replace mock generation with real AI providers (OpenAI, Claude, Mistral, local models)
 * Each function has a clear comment indicating where to plug in the AI provider.
 */

type Project = {
  id: string;
  title: string;
  rawIdea: string;
  inputType?: string | null;
  genre: string;
  tone: string;
  targetFormat: string;
  temporalLogic?: string | null;
  realityLevel?: string | null;
  targetAudience?: string | null;
  artisticAmbition?: string | null;
};

type NarrativeMatrix = {
  centralConcept: string;
  logline: string;
  shortPitch: string;
  longSynopsis: string;
  genre: string;
  tone: string;
  themes: string[];
  universeLaws: string[];
  temporalRules: string;
  spatialRules: string;
  visibleWorld: string;
  invisibleForces: string;
  centralConflict: string;
  protagonist: string;
  antagonist: string;
  emotionalStakes: string;
  symbolicMotifs: string[];
  powerObjects: string[];
  secrets: string[];
  possibleEndings: string[];
  coherenceRules: string[];
};

type EmotionalCore = {
  dominantEmotion: string;
  hiddenWound: string;
  emotionalLack: string;
  innerChildSignal: string;
  protectionMask: string;
  apparentDesire: string;
  deepNeed: string;
  centralFear: string;
  shamePoint: string;
  guiltyPoint: string;
  symbolicObject: string;
  symbolicPlace: string;
  emotionalAntagonist: string;
  emotionalContradiction: string;
  correctionPath: string;
  transformationArc: string;
  finalEmotionalState: string;
};

type ScoreCategory = {
  score: number;
  diagnostic: string;
  weaknesses: string[];
  corrections: string[];
  suggestions: string[];
  trendNotes: string;
  clicheRisk: string;
  originalityOpportunity: string;
};

const GENRE_THEMES: Record<string, string[]> = {
  thriller: ["La paranoïa du quotidien", "La vérité cachée sous la surface", "La trahison intime", "Le temps qui s'effondre"],
  fantastique: ["Le monde derrière le monde", "La frontière entre réel et imaginaire", "L'ancien pouvoir qui revient", "Le sacrifice nécessaire"],
  "science-fiction": ["L'humanité face à sa propre création", "La mémoire comme identité", "Le progrès comme destruction", "L'altérité radicale"],
  drame: ["La culpabilité transmise", "L'amour impossible", "Le deuil transformateur", "La réconciliation tardive"],
  romance: ["L'amour comme révélation de soi", "La vulnérabilité comme force", "Le choix entre passion et raison", "La seconde chance"],
  horreur: ["La terreur intérieure projetée", "Le passé qui refuse de mourir", "L'innocence corrompue", "Le monstre comme miroir"],
  mystère: ["La vérité multiple", "L'identité fragmentée", "Le silence comme aveu", "Le passé comme clé"],
  expérimental: ["La forme comme sens", "La rupture narrative", "L'expérience pure", "Le spectateur comme co-créateur"],
  poétique: ["La beauté du fragment", "La langue comme monde", "La mémoire sensorielle", "L'instant éternel"],
  métaphysique: ["L'existence comme question", "La conscience face au vide", "Le sens construit", "L'au-delà du langage"],
};

const TONE_MOTIFS: Record<string, string[]> = {
  sombre: ["L'obscurité comme refuge", "La lumière comme menace", "Le silence pesant"],
  poétique: ["La métaphore filée", "L'image récurrente", "La musique des mots"],
  cinématographique: ["Le plan séquence intérieur", "Le montage temporel", "La profondeur de champ émotionnelle"],
  commercial: ["L'identification immédiate", "Le rythme haletant", "La satisfaction différée"],
  littéraire: ["La phrase comme architecture", "La voix narrative unique", "L'ellipse signifiante"],
  surréaliste: ["La logique du rêve", "L'objet animé", "Le corps comme paysage"],
  mystique: ["Le symbole vivant", "Le rituel transformateur", "Le seuil entre mondes"],
  futuriste: ["La technologie comme extension du moi", "Le passé comme anachronisme", "L'interface homme-machine"],
};

// TODO: Replace with AI provider call — generateNarrativeMatrix(project, aiClient)
export function generateNarrativeMatrix(project: Project): NarrativeMatrix {
  const themes = GENRE_THEMES[project.genre] ?? GENRE_THEMES["drame"];
  const motifs = TONE_MOTIFS[project.tone] ?? TONE_MOTIFS["cinématographique"];
  const idea = project.rawIdea.slice(0, 80);

  return {
    centralConcept: `Au cœur de "${project.title}" se trouve une question fondamentale : ${idea.endsWith("?") ? idea : idea + "."} Une œuvre de genre ${project.genre}, ${project.tone} dans son essence, qui interroge notre rapport à ${themes[0].toLowerCase()}.`,
    logline: `Dans un monde où ${themes[1].toLowerCase()}, ${project.title.toLowerCase()} tente de découvrir la vérité sur ${idea.slice(0, 50).toLowerCase()}... avant que tout ne s'effondre.`,
    shortPitch: `"${project.title}" est un ${project.genre} ${project.tone} sur ${idea}. Une œuvre destinée à ${project.targetFormat}, pour un public qui cherche ${project.targetAudience ?? "une expérience narrative intense"}.`,
    longSynopsis: `${project.title} commence là où tout s'effondre. L'idée centrale — ${project.rawIdea} — devient le moteur d'une exploration profonde de ${themes[0].toLowerCase()} et de ${themes[2].toLowerCase()}.\n\nLe récit se déploie selon une logique ${project.temporalLogic ?? "linéaire"}, dans un niveau de réalité ${project.realityLevel ?? "réaliste"}. Chaque scène est construite autour d'une tension fondamentale : la distance entre ce que les personnages veulent et ce dont ils ont besoin.\n\nL'ambition artistique — ${project.artisticAmbition ?? "créer une œuvre qui résonne durablement"} — guide chaque choix narratif. Le récit ne se contente pas de raconter : il transforme.`,
    genre: project.genre,
    tone: project.tone,
    themes: themes,
    universeLaws: [
      `Dans cet univers, ${themes[1].toLowerCase()} n'est jamais gratuit — chaque action a un coût émotionnel`,
      `La vérité existe, mais elle est toujours partielle, fragmentée, accessible uniquement par couches`,
      `Les personnages ne peuvent échapper à leur blessure fondamentale — ils peuvent seulement la transformer`,
      `Le passé est vivant dans cet univers — il agit sur le présent de manière concrète`,
    ],
    temporalRules: `Logique ${project.temporalLogic ?? "linéaire"} : le temps se déplace selon la pression émotionnelle des personnages. Les souvenirs ont le même poids que le présent.`,
    spatialRules: `Les espaces reflètent les états intérieurs. Le lieu visible et le lieu invisible coexistent. Chaque lieu a une mémoire.`,
    visibleWorld: `Le monde de surface de ${project.title} est celui que les personnages habitent quotidiennement : familier, ancré, porteur des signes du genre ${project.genre}.`,
    invisibleForces: `Sous la surface opère ${themes[3].toLowerCase()}. Ces forces invisibles — désirs, blessures, prophéties, forces structurantes — façonnent chaque décision.`,
    centralConflict: `Le conflit central oppose le désir apparent (ce que le protagoniste croit vouloir) au besoin profond (ce dont il a réellement besoin). Ce conflit se matérialise dans chaque scène.`,
    protagonist: `Le protagoniste de ${project.title} est quelqu'un qui croit contrôler sa vie mais qui est fondamentalement gouverné par une blessure non résolue. Il/elle commence le récit en possession d'un masque parfaitement ajusté.`,
    antagonist: `La force d'opposition n'est pas simplement maléfique — elle représente la tentation de rester blessé, de ne jamais se transformer. Elle offre une solution facile qui détruirait le protagoniste.`,
    emotionalStakes: `L'enjeu émotionnel véritable : est-il possible de se transformer sans perdre ce qui nous définit ? Le protagoniste risque non sa vie, mais son identité.`,
    symbolicMotifs: motifs,
    powerObjects: [
      `Un objet hérité qui contient la mémoire du traumatisme originel`,
      `Un élément naturel ou artificiel qui marque les seuils de transformation`,
    ],
    secrets: [
      `Le protagoniste sait quelque chose qu'il refuse d'admettre, même à lui-même`,
      `Une vérité sur l'antagoniste qui renverse la compréhension du conflit`,
      `Ce que le monde cache sur sa propre origine`,
    ],
    possibleEndings: [
      `Transformation complète : le protagoniste intègre sa blessure et accède à une identité nouvelle`,
      `Sacrifice lucide : le protagoniste choisit autrui en pleine conscience de ce qu'il perd`,
      `Ouverture ambiguë : la transformation est amorcée mais son issue reste suspendue`,
    ],
    coherenceRules: [
      `Chaque révélation doit avoir été préparée en amont par au moins trois signes`,
      `Les lois de l'univers ne peuvent pas être violées — même par les antagonistes`,
      `L'arc émotionnel du protagoniste doit être cohérent avec sa blessure initiale`,
      `Aucun personnage secondaire ne doit exister sans affecter l'arc principal`,
    ],
  };
}

// TODO: Replace with AI provider call — generateEmotionalCore(project, matrix, aiClient)
export function generateEmotionalCore(project: Project, matrix: NarrativeMatrix): EmotionalCore {
  const genreEmotions: Record<string, string> = {
    thriller: "La terreur sourde de ne jamais être en sécurité",
    fantastique: "L'émerveillement teinté d'angoisse face à l'inconnu",
    "science-fiction": "La solitude de celui qui voit trop loin",
    drame: "La douleur silencieuse de l'amour non dit",
    romance: "La peur d'être vraiment vu et vraiment aimé",
    horreur: "La honte d'avoir survécu",
    mystère: "L'obsession de comprendre ce qu'on préférerait ignorer",
    expérimental: "Le vertige de l'absence de sens cherché",
    poétique: "La nostalgie d'un monde qui n'a jamais existé",
    métaphysique: "L'angoisse existentielle transformée en quête",
  };

  return {
    dominantEmotion: genreEmotions[project.genre] ?? "La peur fondamentale de ne pas être suffisant",
    hiddenWound: `Une blessure ancienne liée à ${matrix.themes[0].toLowerCase()} — quelque chose qui s'est passé avant le début du récit et qui gouverne tout`,
    emotionalLack: `Le protagoniste manque de la capacité à accepter ${matrix.themes[1].toLowerCase()} sans vouloir le contrôler ou le fuir`,
    innerChildSignal: `Chaque fois que la situation rappelle la blessure originelle, le protagoniste régresse vers un comportement d'enfant : fuite, colère disproportionnée, ou paralysie`,
    protectionMask: `Le masque de protection est la compétence principale du protagoniste — ce en quoi il/elle excelle est exactement ce qui lui évite d'affronter sa blessure`,
    apparentDesire: `Ce que le protagoniste croit vouloir : résoudre le mystère, accomplir la mission, obtenir l'amour — le moteur visible du récit`,
    deepNeed: `Ce dont le protagoniste a réellement besoin : être vu tel qu'il/elle est, avec sa blessure, et être accepté`,
    centralFear: `La peur centrale : si je laisse tomber le masque, je serai abandonné(e), détruit(e), ou je constaterai que je n'existe pas vraiment`,
    shamePoint: `Il/elle a honte d'avoir ${matrix.themes[2].toLowerCase()} — de l'avoir voulu, causé, ou simplement laissé se produire`,
    guiltyPoint: `La culpabilité concerne quelqu'un d'autre : quelqu'un qui a souffert à cause de lui/elle, ou qu'il/elle n'a pas su protéger`,
    symbolicObject: matrix.powerObjects[0] ?? "Un objet ordinaire chargé d'une mémoire extraordinaire",
    symbolicPlace: `Un lieu qui concentre toute la blessure — où tout a commencé, où tout devra se terminer`,
    emotionalAntagonist: `La force qui personnifie la tentation de rester blessé — elle offre exactement ce que le protagoniste croit vouloir`,
    emotionalContradiction: `Le protagoniste veut être aimé mais repousse tout ce qui s'approche trop. Il/elle veut la vérité mais détruit les preuves. Cette contradiction est le moteur du récit.`,
    correctionPath: `Le chemin de correction passe par une série de confrontations avec la blessure — d'abord symboliques, puis directes, jusqu'à la confrontation finale qui ne peut être évitée`,
    transformationArc: `De la protection parfaite à la vulnérabilité choisie. Le protagoniste commence comme quelqu'un qui ne peut pas être blessé et finit comme quelqu'un qui a choisi d'être humain.`,
    finalEmotionalState: `L'état émotionnel final n'est pas le bonheur — c'est la paix. Une paix gagnée, fragile, réelle. Le personnage peut désormais vivre avec ce qui s'est passé.`,
  };
}

// TODO: Replace with AI provider call — generateEmotionalPath(project, matrix, emotionalCore, aiClient)
export function generateEmotionalPath(_project: Project, _matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  return [
    { stage: "blessure", label: "Blessure initiale", description: emotionalCore.hiddenWound },
    { stage: "masque", label: "Masque de protection", description: emotionalCore.protectionMask },
    { stage: "desir", label: "Désir apparent", description: emotionalCore.apparentDesire },
    { stage: "conflit", label: "Conflit central", description: `${emotionalCore.emotionalContradiction}` },
    { stage: "confrontation", label: "Confrontation symbolique", description: `Le protagoniste est forcé de regarder sa blessure en face pour la première fois` },
    { stage: "effondrement", label: "Effondrement", description: `Le masque se brise. Ce qui tenait tout ensemble disparaît. Le personnage touche le fond.` },
    { stage: "verite", label: "Vérité", description: `La vérité sur la blessure émerge — pas la version défensive, mais la vérité nue` },
    { stage: "correction", label: "Correction émotionnelle", description: emotionalCore.correctionPath },
    { stage: "transformation", label: "Transformation", description: emotionalCore.transformationArc },
  ];
}

// TODO: Replace with AI provider call — generateCharacters(project, matrix, emotionalCore, aiClient)
export function generateCharacters(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  return [
    {
      name: `Le/La Protagoniste de ${project.title}`,
      role: "Protagoniste",
      nature: "humain",
      externalObjective: matrix.centralConflict.slice(0, 100),
      innerNeed: emotionalCore.deepNeed,
      wound: emotionalCore.hiddenWound,
      fear: emotionalCore.centralFear,
      secret: matrix.secrets[0],
      contradiction: emotionalCore.emotionalContradiction,
      transformationArc: emotionalCore.transformationArc,
      visualIdentity: `Apparence soignée qui masque une tension intérieure permanente. Le corps porte les traces de la blessure sans les révéler.`,
      voiceStyle: `Voix mesurée, économe en émotions visibles. Parle par couches — dit une chose, veut dire une autre, cache une troisième.`,
      linkToConflict: `Le protagoniste est l'incarnation vivante du conflit central : sa résolution personnelle est identique à la résolution narrative`,
    },
    {
      name: "La Force d'Opposition",
      role: "Antagoniste",
      nature: "humain",
      externalObjective: `Empêcher le protagoniste d'atteindre son objectif apparent`,
      innerNeed: `Être compris dans sa propre blessure`,
      wound: `Une blessure similaire à celle du protagoniste, mais dont la réponse a été différente`,
      fear: `Que le protagoniste réussisse là où l'antagoniste a échoué`,
      secret: matrix.secrets[1],
      contradiction: `Fait le mal en croyant faire le bien. Protège quelque chose en détruisant autre chose.`,
      transformationArc: `Miroir inversé du protagoniste — ce que le protagoniste aurait pu devenir`,
      visualIdentity: `Présence qui impose. Quelque chose dans son apparence est trop parfait ou trop brisé.`,
      voiceStyle: `Voix qui séduit et menace simultanément. Dit la vérité d'une manière qui fait mal.`,
      linkToConflict: `L'antagoniste n'est pas le problème — il/elle est le symptôme. Éliminer l'antagoniste ne résoudrait rien.`,
    },
    {
      name: "Le/La Témoin",
      role: "Secondaire",
      nature: "humain",
      externalObjective: `Accompagner le protagoniste sans résoudre ses problèmes à sa place`,
      innerNeed: `Être enfin vu comme quelqu'un de capable, pas seulement de loyal`,
      wound: `A sacrifié quelque chose d'important pour rester aux côtés du protagoniste`,
      fear: `Perdre la seule relation qui lui donne un sens`,
      secret: `Sait quelque chose sur le protagoniste que celui-ci ignore`,
      contradiction: `Aide le protagoniste à se protéger alors qu'il/elle sait que cette protection est nocive`,
      transformationArc: `Apprend à poser ses propres limites — son arc est l'acquisition de la parole`,
      visualIdentity: `Présence douce mais solide. Le corps qui absorbe les chocs sans en montrer les marques.`,
      voiceStyle: `Parle avec des questions plutôt que des affirmations. Écoute plus qu'il/elle ne parle.`,
      linkToConflict: `Représente ce que le protagoniste pourrait avoir — une vraie connexion — s'il/elle accepte sa vulnérabilité`,
    },
  ];
}

// TODO: Replace with AI provider call — generateRelationships(project, characters, aiClient)
export function generateRelationships(projectId: string, characters: Array<{ id: string; name: string; role: string }>) {
  const rels = [];
  if (characters.length >= 2) {
    rels.push({
      projectId,
      characterAId: characters[0].id,
      characterBId: characters[1].id,
      characterAName: characters[0].name,
      characterBName: characters[1].name,
      relationshipType: "Conflit central",
      emotionalTension: "Une attraction et une répulsion simultanées — ils se reconnaissent mutuellement comme le miroir de leur propre blessure",
      hiddenTruth: "Ils ont besoin l'un de l'autre pour se transformer, même si leur relation semble destructrice",
      conflict: "Chaque interaction pousse l'autre à révéler ce qu'il/elle préfère cacher",
      evolution: "De l'opposition frontale à une reconnaissance mutuelle douloureuse",
      symbolicMeaning: "Représente le conflit intérieur du protagoniste extériorisé dans une relation",
    });
  }
  if (characters.length >= 3) {
    rels.push({
      projectId,
      characterAId: characters[0].id,
      characterBId: characters[2].id,
      characterAName: characters[0].name,
      characterBName: characters[2].name,
      relationshipType: "Alliance fragile",
      emotionalTension: "Une confiance méritée mais jamais entièrement accordée — la loyauté coexiste avec le secret",
      hiddenTruth: "Le/la témoin sait quelque chose que le protagoniste refuse de voir",
      conflict: "Jusqu'où peut-on aider quelqu'un qui ne veut pas être aidé ?",
      evolution: "De la loyauté inconditionnelle à une vérité prononcée à voix haute",
      symbolicMeaning: "Ce que le protagoniste pourrait devenir s'il/elle choisissait la connexion plutôt que la protection",
    });
  }
  return rels;
}

// TODO: Replace with AI provider call — generateWorldAndTimeline(project, matrix, aiClient)
export function generateWorldAndTimeline(project: Project, matrix: NarrativeMatrix) {
  return {
    locations: [
      { name: "Le Lieu Initial", description: `Où tout commence pour ${project.title} — un espace qui semble ordinaire mais porte les traces de tout ce qui s'est passé avant le récit`, atmosphere: "Familier et légèrement étrange. Quelque chose ne va pas mais on ne saurait pas dire quoi." },
      { name: "Le Lieu du Seuil", description: "L'espace de transition où le protagoniste bascule d'un état à un autre — le point de non-retour", atmosphere: "Suspendu entre deux mondes. Ni ici ni là-bas." },
      { name: "Le Lieu de la Vérité", description: "L'endroit où la vérité finale sera révélée — chargé d'une mémoire que le protagoniste fuyait", atmosphere: "Intense, chargé, inévitable." },
    ],
    atmospheres: [
      `Tension sous-jacente qui ne se résout jamais complètement`,
      `Lumière qui change de signification selon l'état émotionnel du protagoniste`,
      `Sons qui portent la mémoire — ce que les personnages entendent les définit`,
    ],
    temporalRules: matrix.temporalRules,
    timelineEvents: [
      { date: "Avant le récit", event: "La blessure originelle", significance: "L'événement fondateur que tout le récit va travailler à résoudre ou à intégrer" },
      { date: "Début du récit", event: "Le déclencheur", significance: "Ce qui rend l'inertie impossible — le protagoniste ne peut plus éviter sa blessure" },
      { date: "Milieu du récit", event: "La confrontation symbolique", significance: "Premier face-à-face avec la vérité, mais sous forme déguisée" },
      { date: "Crise", event: "L'effondrement", significance: "Le masque se brise — le protagoniste est forcé de voir" },
      { date: "Résolution", event: "La transformation ou le refus", significance: "Le protagoniste choisit — intégrer ou fuir" },
    ],
    parallelTimelines: project.temporalLogic === "mondes parallèles" ? [
      "La ligne temporelle de ce qui aurait pu être",
      "La mémoire reconstruite vs la mémoire vécue",
    ] : [],
    dreamLayers: project.temporalLogic === "logique de rêve" || project.realityLevel === "psychologique" ? [
      "La couche consciente : ce que le protagoniste croit vivre",
      "La couche inconsciente : ce que son psychisme projette",
      "La couche symbolique : ce que le récit lui montre",
    ] : [],
    forbiddenRules: matrix.universeLaws.map(law => `INTERDIT : ${law.replace("Dans cet univers, ", "Violer la loi que ")} — toute violation doit avoir une conséquence narrative réelle`),
    causeEffectLogic: `Dans ${project.title}, chaque action émotionnelle crée une réaction narrative. La causalité n'est pas seulement physique — elle est émotionnelle. Ce que le protagoniste ressent crée des conséquences dans le monde.`,
  };
}

// TODO: Replace with AI provider call — generateResearchNotes(project, matrix, aiClient)
export function generateResearchNotes(project: Project, matrix: NarrativeMatrix) {
  return {
    referenceWorks: [
      { title: "Œuvre de référence principale", author: "À définir selon la recherche de l'auteur", medium: "Roman / Film / Série", relevance: `Partage avec ${project.title} le traitement de ${matrix.themes[0].toLowerCase()}` },
      { title: "Contre-exemple productif", author: "À définir", medium: "Genre " + project.genre, relevance: "Montre ce qu'il faut éviter — la version cliché de ce que nous cherchons à faire" },
    ],
    criticalNotes: [
      `Le genre ${project.genre} souffre actuellement d'une saturation de récits où ${matrix.themes[0].toLowerCase()} est traité de façon superficielle`,
      `Le ton ${project.tone} est souvent mal compris : il ne signifie pas absence d'émotion mais modulation précise de l'émotion`,
      `La principale critique à anticiper : le récit risque d'être perçu comme élitiste si l'entrée émotionnelle n'est pas claire`,
    ],
    successSignals: [
      `Le public cible — ${project.targetAudience ?? "lecteurs/spectateurs exigeants"} — cherche exactement ce que ce projet propose`,
      `Les œuvres combinant ${project.genre} et ${project.tone} ont une longévité culturelle supérieure à la moyenne`,
      `Le format ${project.targetFormat} est particulièrement adapté au déploiement de ${matrix.themes[1].toLowerCase()}`,
    ],
    currentTrends: [
      `Tendance forte : les récits qui refusent la résolution facile trouvent un public fidèle et critique`,
      `Émergence : la demande pour des œuvres en ${project.tone} de qualité dépasse l'offre disponible`,
      `Signal faible : le public cherche des antagonistes complexes, pas des personnages simplement mauvais`,
    ],
    clicheRisks: [
      `RISQUE : Que le protagoniste soit défini entièrement par sa blessure sans agentivité propre`,
      `RISQUE : Que le ton ${project.tone} devienne une posture esthétique sans contenu émotionnel réel`,
      `RISQUE : Que les révélations soient trop prévisibles — le public du genre ${project.genre} est sophistiqué`,
    ],
    originalityOpportunities: [
      `Traiter ${matrix.themes[2].toLowerCase()} d'une façon qui n'a pas encore été tentée dans ce format`,
      `Utiliser la logique temporelle ${project.temporalLogic ?? "linéaire"} de façon à ce qu'elle soit elle-même porteuse de sens`,
      `Créer une relation antagoniste qui soit genuinement ambiguë — ni héros ni monstre`,
    ],
    creationNotes: `Notes de création pour ${project.title} : L'ambition est ${project.artisticAmbition ?? "de créer une œuvre qui résonne durablement"}. Pour y parvenir, chaque décision narrative doit être vérifiée contre cette ambition.`,
    abstractMechanics: [
      "La révélation progressive : ne donner au lecteur/spectateur que ce dont il a besoin, quand il en a besoin",
      "La double lecture : chaque scène fonctionne en surface ET comme révélation de l'état intérieur",
      "La tension différée : promettre une résolution et la retarder jusqu'au dernier moment soutenable",
      "Le retournement émotionnel : transformer ce que le public ressent à mi-chemin",
    ],
    humorPatterns: [
      "L'humour naît de la contradiction entre le masque et la réalité",
      "Le décalage entre la gravité du protagoniste et la banalité de la situation",
      "L'humour de défense : ce que les personnages disent pour éviter de dire ce qui compte",
    ],
    suspensePatterns: [
      "L'information asymétrique : le lecteur sait quelque chose que le personnage ne sait pas",
      "La promesse narrative : établir tôt ce qui va se passer, puis différer",
      "Le compte à rebours émotionnel : le protagoniste approche d'un point de non-retour",
    ],
    tearTriggers: [
      "Le sacrifice non verbal : un personnage qui perd quelque chose de fondamental sans le dire",
      "La reconnaissance tardive : comprendre ce qu'on avait au moment de le perdre",
      "L'acte de soin invisible : être aimé d'une façon qu'on n'avait pas vue",
    ],
  };
}

// TODO: Replace with AI provider call — generateHpsaScore(project, matrix, emotionalCore, aiClient)
export function generateHpsaScore(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore): Record<string, ScoreCategory> {
  const baseScore = (genre: string, tone: string, category: string): number => {
    const genreBonus: Record<string, Record<string, number>> = {
      humour: { drame: 35, thriller: 45, fantastique: 55, "science-fiction": 50, romance: 60, horreur: 40, mystère: 50, expérimental: 65, poétique: 45, métaphysique: 40 },
      pleur: { drame: 80, thriller: 55, fantastique: 65, "science-fiction": 60, romance: 75, horreur: 50, mystère: 58, expérimental: 60, poétique: 70, métaphysique: 65 },
      suspense: { drame: 55, thriller: 90, fantastique: 70, "science-fiction": 72, romance: 50, horreur: 85, mystère: 88, expérimental: 45, poétique: 35, métaphysique: 40 },
    };
    const toneBonus: Record<string, number> = {
      sombre: category === "pleur" ? 10 : -5,
      poétique: category === "pleur" ? 8 : category === "humour" ? -8 : 0,
      cinématographique: category === "suspense" ? 8 : 5,
      commercial: 10,
      littéraire: category === "pleur" ? 8 : category === "profondeur" ? 15 : 3,
    };
    const base = genreBonus[category]?.[genre] ?? 60;
    const toneAdj = toneBonus[tone] ?? 0;
    return Math.min(100, Math.max(20, base + toneAdj + Math.floor(Math.random() * 10 - 5)));
  };

  const humourScore = baseScore(project.genre, project.tone, "humour");
  const pleurScore = baseScore(project.genre, project.tone, "pleur");
  const suspenseScore = baseScore(project.genre, project.tone, "suspense");

  return {
    humour: {
      score: humourScore,
      diagnostic: humourScore > 60 ? `L'humour est présent et ancré dans la contradiction des personnages` : `L'humour est sous-développé — le projet risque d'être perçu comme hermétique`,
      weaknesses: humourScore < 50 ? [`L'humour est absent là où la tension le rendrait nécessaire`, `Le masque des personnages n'est pas encore exploité comme source comique`] : [`L'humour risque de désamorcer des moments qui nécessitent la pleine intensité`],
      corrections: [`Exploiter la blessure comme source d'humour involontaire`, `Utiliser la contradiction entre le masque et la réalité`, `Créer des moments où la gravité du protagoniste rencontre la banalité`],
      suggestions: [`Inspiration : l'humour de ${matrix.themes[0].toLowerCase()} vu par Beckett — le rire devant l'absurde, pas à côté de lui`],
      trendNotes: `Le public contemporain apprécie l'humour qui naît de la vérité plutôt que de la performance`,
      clicheRisk: `Éviter l'humour de situation prévisible — l'humour doit naître de la psychologie, pas du scénario`,
      originalityOpportunity: `Créer un humour qui ne peut exister que dans ce récit spécifique — lié à la blessure unique du protagoniste`,
    },
    pleur: {
      score: pleurScore,
      diagnostic: pleurScore > 65 ? `Le potentiel émotionnel est réel et ancré dans des vérités universelles` : `Les déclencheurs émotionnels existent mais ne sont pas encore suffisamment préparés`,
      weaknesses: [`Les moments de larmes risquent d'être téléphonés si la préparation émotionnelle est insuffisante`],
      corrections: [`Installer les déclencheurs 3 à 5 scènes avant qu'ils n'opèrent`, `Utiliser l'understatement — les personnages ne pleurent pas, mais le lecteur/spectateur pleure pour eux`],
      suggestions: [`S'inspirer de ${emotionalCore.dominantEmotion.slice(0, 40)} — la laisser monter très lentement`],
      trendNotes: `Les déclencheurs émotionnels les plus efficaces actuellement : la reconnaissance tardive et le sacrifice invisible`,
      clicheRisk: `Éviter la musique qui dit au public quoi ressentir — laisser la scène faire le travail`,
      originalityOpportunity: `Créer une scène qui déclenche les larmes sans qu'on sache exactement pourquoi — la tristesse comme révélation`,
    },
    suspense: {
      score: suspenseScore,
      diagnostic: suspenseScore > 70 ? `Le suspense est structurellement solide` : `Le suspense nécessite davantage de promesses narratives établies tôt`,
      weaknesses: [`La tension émotionnelle et la tension narrative ne sont pas encore synchronisées`],
      corrections: [`Établir des promesses de révélation au plus tard à 25% du récit`, `Utiliser l'information asymétrique — donner au public ce que les personnages n'ont pas`],
      suggestions: [`Chaque chapitre/scène doit finir sur une question, pas une réponse`],
      trendNotes: `Le public sophistiqué du ${project.genre} préfère le suspense psychologique au suspense d'action`,
      clicheRisk: `Éviter le faux suspense — les menaces qui n'ont aucune conséquence réelle`,
      originalityOpportunity: `Créer un suspense émotionnel — "survivra-t-il/elle à sa propre transformation ?" — plus puissant que le suspense physique`,
    },
    attractivite: {
      score: Math.min(100, Math.floor((humourScore + pleurScore + suspenseScore) / 3) + 5),
      diagnostic: `L'attractivité globale du projet est conditionnée par la clarté de son entrée émotionnelle`,
      weaknesses: [`Le projet peut sembler trop ambitieux pour un public non initié`],
      corrections: [`Créer une porte d'entrée émotionnelle immédiatement compréhensible dès la première page/scène`],
      suggestions: [`La logline doit contenir une promesse émotionnelle claire en moins de 25 mots`],
      trendNotes: `Le marché du ${project.targetFormat} est favorable aux projets qui combinent ambition artistique et accessibilité émotionnelle`,
      clicheRisk: `Éviter l'obscurité comme posture — la complexité doit servir l'émotion, pas l'impressionner`,
      originalityOpportunity: `Ce projet peut devenir une référence de genre si son identité visuelle et tonale est suffisamment distincte`,
    },
    profondeurEmotionnelle: {
      score: Math.min(100, pleurScore + 10),
      diagnostic: emotionalCore.hiddenWound ? `La profondeur émotionnelle est bien ancrée dans une blessure spécifique et crédible` : `La profondeur émotionnelle reste générique — la blessure doit être plus précise`,
      weaknesses: [`Le risque est de traiter les émotions de façon illustrative plutôt que transformatrice`],
      corrections: [`Chaque émotion doit avoir une cause narrative précise, pas seulement une atmosphère`],
      suggestions: [`S'assurer que l'arc de transformation est visible scène par scène, pas seulement à la fin`],
      trendNotes: `La profondeur émotionnelle est le principal critère de sélection pour les prix littéraires et cinématographiques actuels`,
      clicheRisk: `La profondeur émotionnelle ne signifie pas noirceur — éviter la tristesse comme fin en soi`,
      originalityOpportunity: `Explorer une émotion complexe et rare — pas la tristesse ou la joie, mais quelque chose entre les deux`,
    },
    originalite: {
      score: 72,
      diagnostic: `Le projet présente un potentiel d'originalité réel, conditionné par l'exécution`,
      weaknesses: [`L'originalité peut être diluée par une trop grande fidélité aux codes du genre`],
      corrections: [`Identifier un élément structural unique à ce projet et le pousser jusqu'à son extrême logique`],
      suggestions: [`Trouver ce qui n'a encore jamais été dit sur ${matrix.themes[0].toLowerCase()} — c'est là que se trouve l'originalité`],
      trendNotes: `L'originalité perçue augmente quand le projet peut être décrit en une phrase unique et irréductible`,
      clicheRisk: `L'originalité de surface (forme expérimentale, structure non-linéaire) sans originalité de fond est rapidement perçue`,
      originalityOpportunity: `Ce projet a une voix unique si ${project.artisticAmbition ?? "son ambition"} est réellement mise au service du récit`,
    },
    coherence: {
      score: 78,
      diagnostic: `La cohérence interne du projet est satisfaisante pour cette phase de développement`,
      weaknesses: [`Certaines lois de l'univers ne sont pas encore vérifiées contre tous les personnages secondaires`],
      corrections: [`Vérifier chaque personnage secondaire contre les lois de l'univers`, `S'assurer que chaque révélation a été préparée en amont`],
      suggestions: [`Créer une bible de cohérence interne consultable lors de chaque ajout narratif`],
      trendNotes: `Les lecteurs/spectateurs contemporains sont très attentifs à la cohérence — les incohérences sont immédiatement repérées et signalées`,
      clicheRisk: `La cohérence ne doit pas devenir rigidité — certaines surprises légitimes peuvent paraître incohérentes avant la révélation finale`,
      originalityOpportunity: `Utiliser la cohérence comme surprise narrative — montrer que tout était préparé depuis le début crée un effet de révélation profonde`,
    },
  };
}

// TODO: Replace with AI provider call — generateBookOutline(project, matrix, emotionalCore, aiClient)
export function generateBookOutline(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  return {
    titleIdeas: [
      project.title,
      matrix.themes[0].split(" ").slice(-2).join(" "),
      `Le ${matrix.symbolicMotifs[0]?.split(" ").pop() ?? "Silence"}`,
      `Ce qui reste de ${project.title.split(" ")[0]}`,
      `${matrix.themes[1].split(" ").slice(0, 3).join(" ")}`,
    ],
    backCoverPitch: `${matrix.shortPitch}\n\nUn ${project.genre} ${project.tone} sur ${emotionalCore.dominantEmotion.toLowerCase()}. Pour lecteurs qui ne veulent pas seulement lire — ils veulent être transformés.`,
    shortSynopsis: matrix.shortPitch,
    longSynopsis: matrix.longSynopsis,
    tableOfContents: ["Partie I : Le masque", "Partie II : La fissure", "Partie III : L'effondrement", "Partie IV : La vérité", "Épilogue : Ce qui reste"],
    structure: "Structure en 4 parties avec épilogue — arc émotionnel en miroir de l'arc narratif",
    chapters: [
      { number: 1, title: "Le monde avant", summary: `Introduction du protagoniste dans son état de protection. Le masque est parfait. Quelque chose s'apprête à le briser.` },
      { number: 2, title: "Le déclencheur", summary: `L'événement qui rend l'inertie impossible. Le protagoniste est forcé d'agir, de bouger, de changer d'espace.` },
      { number: 3, title: "La première résistance", summary: `Le protagoniste utilise ses stratégies habituelles. Elles fonctionnent — mais pas complètement.` },
      { number: 4, title: "La rencontre", summary: `Premier contact avec la force d'opposition. Reconnaissance mutuelle inconsciente.` },
      { number: 5, title: "La fissure", summary: `Quelque chose dans le masque se fissure. Le protagoniste le répare mais cela laisse une trace.` },
      { number: 6, title: "Ce qui ne peut pas être ignoré", summary: `Une vérité partiellement révélée. Le protagoniste choisit de ne pas voir — mais le lecteur a vu.` },
      { number: 7, title: "Le point de non-retour", summary: `L'action irréversible. Après cette scène, le monde du protagoniste ne peut plus être le même.` },
      { number: 8, title: "L'effondrement", summary: emotionalCore.transformationArc.slice(0, 120) },
      { number: 9, title: "La vérité nue", summary: `Ce que le protagoniste a toujours su et toujours refusé de voir. La scène la plus difficile à écrire.` },
      { number: 10, title: "La transformation ou le refus", summary: `Le choix final. Pas une bataille — une décision intérieure qui a les conséquences d'une bataille.` },
    ],
  };
}

// TODO: Replace with AI provider call — generateScreenplay(project, matrix, emotionalCore, aiClient)
export function generateScreenplay(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  const scenes = [
    { number: 1, heading: `INT. LIEU INITIAL - JOUR`, description: `Le protagoniste dans son environnement habituel. Tout semble normal. Un détail cloche.`, dialogueDraft: `` },
    { number: 2, heading: `EXT. ESPACE DE TRANSITION - MÊME JOUR`, description: `Le déclencheur se produit. Pas de préambule. Direct.`, dialogueDraft: `PROTAGONISTE\n(à lui/elle-même)\nÇa ne peut pas être en train d'arriver.` },
    { number: 3, heading: `INT. LIEU DU CONFLIT - NUIT`, description: `Première confrontation avec la force d'opposition. Chacun évalue l'autre.`, dialogueDraft: `ANTAGONISTE\nVous n'êtes pas obligé(e) de faire ça.\n\nPROTAGONISTE\n(sans le regarder)\nJe sais.` },
    { number: 4, heading: `INT. ESPACE INTIME - NUIT`, description: `Le protagoniste seul avec sa blessure. Le masque commence à peser.`, dialogueDraft: `` },
    { number: 5, heading: `EXT. LE SEUIL - AUBE`, description: `Le passage du point de non-retour. Le protagoniste fait un choix.`, dialogueDraft: `VOIX (V.O.)\nCe que j'allais faire n'avait pas de nom. Mais j'avais appris à faire sans.` },
  ];

  const fountainScript = `Title: ${project.title}
Author: [Auteur]
Draft: 1.0

FONDU ENCHAÎNÉ SUR :

${scenes.map(s => `${s.heading}\n\n${s.description}\n\n${s.dialogueDraft ? s.dialogueDraft + "\n\n" : ""}`).join("\n")}

FONDU AU NOIR.

FIN`;

  return {
    logline: matrix.logline,
    cinematicSynopsis: `${project.title} : ${matrix.shortPitch} Visuellement, le film habite le registre du ${project.tone} — chaque plan est une décision sur ce qu'on montre et ce qu'on cache.`,
    treatment: `TRAITEMENT — ${project.title.toUpperCase()}\n\nFORMAT : ${project.targetFormat}\nTON : ${project.tone}\nGENRE : ${project.genre}\n\n${matrix.longSynopsis}\n\nDIRECTION VISUELLE :\nCaméra proche, presque inconfortable. Lumière qui révèle ce que les personnages voudraient cacher. Montage rythmé par la psychologie, pas par l'action.`,
    beats: [
      { number: 1, description: "IMAGE D'OUVERTURE : Le monde du protagoniste dans son état de protection" },
      { number: 2, description: "THÈME ÉNONCÉ : Quelqu'un dit à voix haute ce dont le protagoniste a besoin d'entendre — et qu'il/elle rejette" },
      { number: 3, description: "MISE EN PLACE : Le monde ordinaire est établi avec suffisamment de détails pour que sa destruction soit ressentie" },
      { number: 4, description: "DÉCLENCHEUR : L'événement qui rend l'inertie impossible" },
      { number: 5, description: "DÉBAT : Le protagoniste hésite — entrer dans l'aventure ou fuir" },
      { number: 6, description: "PASSAGE AU ACTE : La décision de s'engager" },
      { number: 7, description: "SOUS-INTRIGUE : Introduction de la relation secondaire qui reflète le thème principal" },
      { number: 8, description: "AMUSEMENT ET JEUX : Le protagoniste semble maîtriser son monde nouveau — avant que ça ne se retourne" },
      { number: 9, description: "POINT MÉDIAN : Victoire apparente ou fausse défaite — changement de la nature du conflit" },
      { number: 10, description: "LES MÉCHANTS PROGRESSENT : Les forces d'opposition se rapprochent" },
      { number: 11, description: "TOUT EST PERDU : Le moment le plus sombre" },
      { number: 12, description: "AME SOMBRE DE LA NUIT : Le protagoniste seul avec sa blessure nue" },
      { number: 13, description: "PERCÉE : La révélation qui permet la transformation" },
      { number: 14, description: "CLIMAX : L'affrontement final — pas physique, émotionnel" },
      { number: 15, description: "IMAGE FINALE : Le monde après la transformation — en miroir de l'image d'ouverture" },
    ],
    scenes,
    fountainScript,
  };
}

// TODO: Replace with AI provider call — generateSeries(project, matrix, emotionalCore, aiClient)
export function generateSeries(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  return {
    format: "Série limitée — 6 à 8 épisodes de 45-52 minutes",
    seasonConcept: `Saison 1 de ${project.title} : Le voyage de la protection vers la vulnérabilité. ${matrix.shortPitch} Chaque épisode est une couche supplémentaire retirée du masque.`,
    longArcs: [
      `Arc A : L'arc du protagoniste — de la protection parfaite à la vulnérabilité choisie`,
      `Arc B : L'arc de la relation centrale — de la méfiance à la reconnaissance mutuelle`,
      `Arc C : L'arc du monde — révélation progressive de ce qui se cache sous la surface`,
    ],
    episodes: [
      { number: 1, title: "Le masque parfait", summary: `Introduction. Tout fonctionne. Un détail cloche. Fin : le déclencheur.`, cliffhanger: `La dernière image montre quelque chose que le protagoniste ne devrait pas voir`, emotionalEvolution: `Le protagoniste est en pleine protection — confortable dans son masque` },
      { number: 2, title: "La première fissure", summary: `Le protagoniste utilise ses stratégies habituelles. La première ne fonctionne pas.`, cliffhanger: `Une vérité partielle révélée — mais par accident`, emotionalEvolution: `Première anxiété réelle sous le masque` },
      { number: 3, title: "Ce qu'on ne peut pas ignorer", summary: `La force d'opposition entre pleinement dans le récit.`, cliffhanger: `Le protagoniste fait une découverte qui change sa compréhension de tout ce qui précède`, emotionalEvolution: `Le protagoniste commence à douter de son propre récit` },
      { number: 4, title: "Le point de non-retour", summary: `L'action irréversible. Fin du premier acte de la série.`, cliffhanger: `Une trahison — réelle ou perçue`, emotionalEvolution: emotionalCore.emotionalContradiction.slice(0, 100) },
      { number: 5, title: "L'effondrement", summary: `Tout ce que le protagoniste construisait s'effondre.`, cliffhanger: `Le protagoniste se retrouve seul face à sa blessure`, emotionalEvolution: `Effondrement complet du masque` },
      { number: 6, title: "La vérité", summary: `La révélation centrale. Ce qui gouvernait tout depuis le début.`, cliffhanger: `Le protagoniste fait un choix dont les conséquences sont inconnues`, emotionalEvolution: `Acceptation douloureuse mais réelle` },
      { number: 7, title: "La transformation", summary: `Le protagoniste choisit. Pas la solution facile.`, cliffhanger: `Résolution du conflit principal — mais ouverture d'une nouvelle question`, emotionalEvolution: `Transformation active — le personnage agit depuis sa blessure intégrée` },
      { number: 8, title: "Ce qui reste", summary: `Épilogue dramatique. Le monde après. La transformation visible dans les détails.`, cliffhanger: project.targetFormat.includes("transmedia") ? `Un signal indiquant que le monde est plus grand que ce qu'on a vu` : undefined, emotionalEvolution: emotionalCore.finalEmotionalState },
    ],
    progressiveRevelations: [
      `Ep 1 : La blessure existe — on ne sait pas encore de quoi il s'agit`,
      `Ep 3 : La blessure a une origine — on commence à la deviner`,
      `Ep 5 : La blessure a eu des conséquences sur autrui — le poids de la culpabilité`,
      `Ep 6 : La vérité complète sur la blessure`,
      `Ep 8 : Ce que la blessure a rendu possible — la transformation`,
    ],
    secondaryCharacters: [
      `Le/La témoin — celui/celle qui a tout vu depuis le début`,
      `Le passé vivant — un personnage qui représente ce que le protagoniste était avant`,
      `L'innocence — un personnage qui ne comprend pas encore les règles du jeu et pose les questions que personne n'ose poser`,
    ],
  };
}

// TODO: Replace with AI provider call — generatePitch(project, matrix, emotionalCore, aiClient)
export function generatePitch(project: Project, matrix: NarrativeMatrix, emotionalCore: EmotionalCore) {
  return {
    title: project.title,
    format: project.targetFormat,
    genre: project.genre,
    targetAudience: project.targetAudience ?? "Lecteurs/spectateurs adultes, 25-45 ans, cherchant des œuvres qui les transforment",
    comparableReferences: [
      `Dans la veine de [référence à définir] mais avec l'identité unique de ${project.title}`,
      `Pour le public qui a aimé [titre comparable dans le genre ${project.genre}]`,
    ],
    visualDirection: `Un univers visuel ${project.tone} — où chaque image porte une décision sur ce qui est montré et ce qui est caché. Palette chromatique qui évolue avec l'état émotionnel du protagoniste. Lumière comme révélation, ombre comme protection.`,
    authorNote: `"${project.title}" est né de ${project.rawIdea.slice(0, 100)}. C'est une histoire sur ${emotionalCore.dominantEmotion.toLowerCase()} — ce que ça fait de la porter, de s'en protéger, et de choisir de s'en libérer.`,
    intentionNote: `L'intention est de créer une œuvre qui ne se contente pas d'illustrer ${matrix.themes[0].toLowerCase()} mais de le faire vivre au lecteur/spectateur. Pas une démonstration — une expérience. L'ambition : ${project.artisticAmbition ?? "créer quelque chose qui reste"}.`,
    whyNow: `Nous vivons un moment où ${matrix.themes[0].toLowerCase()} est au centre de la conversation culturelle. Ce projet n'exploite pas cette tendance — il la précède. Les œuvres qui durent ne suivent pas le moment, elles le définissent.`,
    characters: `${matrix.protagonist}\n\nCONTRE : ${matrix.antagonist}`,
    world: `${matrix.visibleWorld}\n\nSous la surface : ${matrix.invisibleForces}`,
    filmSeasonArc: matrix.longSynopsis.slice(0, 300),
    sellingPoints: [
      `Un concept fort et immédiatement compréhensible : ${matrix.logline}`,
      `Une profondeur émotionnelle rare dans le genre ${project.genre}`,
      `Un univers narratif extensible — ${project.targetFormat.includes("transmedia") ? "conçu dès l'origine pour le transmedia" : "adaptable en " + project.targetFormat}`,
      `Une voix d'auteur distincte : ${project.tone}, précise, mémorable`,
      `Un public cible identifié et en demande`,
    ],
  };
}

// TODO: Replace with AI provider call — checkCoherence(project, matrix, aiClient)
export function checkCoherence(matrix: NarrativeMatrix): { score: number; issues: string[]; suggestions: string[]; isCoherent: boolean } {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!matrix.centralConcept) issues.push("Le concept central n'est pas défini");
  if (!matrix.protagonist) issues.push("Le protagoniste n'est pas développé");
  if (!matrix.antagonist) issues.push("La force d'opposition n'est pas définie");
  if (matrix.themes.length < 2) issues.push("Au moins 2 thèmes doivent être définis pour assurer la cohérence");
  if (matrix.universeLaws.length === 0) issues.push("Les lois de l'univers ne sont pas définies — risque d'incohérence narrative");
  if (!matrix.emotionalStakes) issues.push("Les enjeux émotionnels ne sont pas clairement formulés");

  if (matrix.protagonist && matrix.antagonist && matrix.centralConflict) {
    suggestions.push("Vérifier que la résolution du protagoniste et celle de l'antagoniste sont vraiment irréductibles");
  }
  if (matrix.secrets.length > 0) {
    suggestions.push("S'assurer que chaque secret a été préparé par au moins 3 indices visibles en amont");
  }
  if (matrix.possibleEndings.length > 1) {
    suggestions.push("Vérifier que toutes les fins possibles sont cohérentes avec l'arc émotionnel établi");
  }
  suggestions.push("Tester la cohérence avec ce test : si vous retirez un personnage, est-ce que le récit s'effondre ? Si non, ce personnage est en trop.");

  const score = Math.max(40, 100 - issues.length * 15 + suggestions.length * 2);
  return {
    score: Math.min(100, score),
    issues,
    suggestions,
    isCoherent: issues.length === 0,
  };
}
