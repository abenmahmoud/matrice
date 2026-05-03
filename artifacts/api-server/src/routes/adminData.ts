import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { aiSkillsTable, cinemaKnowledgeTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── AI SKILLS ──────────────────────────────────────────────────────────────

router.get("/admin/ai-skills", async (req, res) => {
  try {
    const rows = await db.select().from(aiSkillsTable).orderBy(desc(aiSkillsTable.priority));
    res.json(rows);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/admin/ai-skills", async (req, res) => {
  try {
    const [row] = await db.insert(aiSkillsTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/admin/ai-skills/:id", async (req, res) => {
  try {
    const [row] = await db.update(aiSkillsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(aiSkillsTable.id, req.params.id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/admin/ai-skills/:id", async (req, res) => {
  try {
    await db.delete(aiSkillsTable).where(eq(aiSkillsTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ─── CINEMA KNOWLEDGE ───────────────────────────────────────────────────────

router.get("/admin/cinema", async (req, res) => {
  try {
    const rows = await db.select().from(cinemaKnowledgeTable).orderBy(cinemaKnowledgeTable.region, cinemaKnowledgeTable.era);
    res.json(rows);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/admin/cinema", async (req, res) => {
  try {
    const [row] = await db.insert(cinemaKnowledgeTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/admin/cinema/:id", async (req, res) => {
  try {
    const [row] = await db.update(cinemaKnowledgeTable)
      .set(req.body).where(eq(cinemaKnowledgeTable.id, req.params.id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/admin/cinema/:id", async (req, res) => {
  try {
    await db.delete(cinemaKnowledgeTable).where(eq(cinemaKnowledgeTable.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ─── STATS ──────────────────────────────────────────────────────────────────

router.get("/admin/stats", async (req, res) => {
  try {
    const [skillStats] = await db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where is_active = true)::int`,
      totalUsage: sql<number>`sum(usage_count)::int`,
    }).from(aiSkillsTable);

    const [cinemaStats] = await db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where is_active = true)::int`,
    }).from(cinemaKnowledgeTable);

    const topSkills = await db.select({
      id: aiSkillsTable.id,
      name: aiSkillsTable.name,
      usageCount: aiSkillsTable.usageCount,
      category: aiSkillsTable.category,
    }).from(aiSkillsTable).orderBy(desc(aiSkillsTable.usageCount)).limit(10);

    res.json({ skills: skillStats, cinema: cinemaStats, topSkills });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ─── SEED ────────────────────────────────────────────────────────────────────

router.post("/admin/seed", async (req, res) => {
  try {
    const existingSkills = await db.select({ id: aiSkillsTable.id }).from(aiSkillsTable).limit(1);
    const existingCinema = await db.select({ id: cinemaKnowledgeTable.id }).from(cinemaKnowledgeTable).limit(1);
    const { force = false } = req.body as { force?: boolean };

    if (!force && existingSkills.length > 0 && existingCinema.length > 0) {
      return res.json({ message: "Données déjà présentes — utilisez force:true pour réinitialiser", seeded: false });
    }

    if (force || existingSkills.length === 0) {
      if (force) await db.delete(aiSkillsTable);
      await db.insert(aiSkillsTable).values(AI_SKILLS_SEED);
    }
    if (force || existingCinema.length === 0) {
      if (force) await db.delete(cinemaKnowledgeTable);
      await db.insert(cinemaKnowledgeTable).values(CINEMA_KNOWLEDGE_SEED);
    }

    res.json({ message: "Seed complété", skills: AI_SKILLS_SEED.length, cinema: CINEMA_KNOWLEDGE_SEED.length });
  } catch (err) { req.log.error({ err }); res.status(500).json({ error: "Internal server error" }); }
});

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const AI_SKILLS_SEED = [
  // ── Technique narrative
  {
    name: "Plan-séquence et respiration narrative",
    category: "technique-narrative",
    description: "L'art du plan long qui force la présence et l'intensité",
    content: `Le plan-séquence n'est pas un exploit technique — c'est une décision narrative. Kubrick dans "Shining", Welles dans "Citizen Kane", Iñárritu dans "Birdman" : le plan long impose une présence irréfutable à la scène. En littérature, cela se traduit par la phrase-fleuve qui ne lâche pas le lecteur, le paragraphe sans respiration qui mime l'angoisse ou l'extase. Techniques à intégrer : 1) Une seule coupe = une seule pause de souffle pour le lecteur. 2) Le temps réel crée plus de tension que l'ellipse dans les scènes de confrontation. 3) L'espace devient personnage quand la caméra — ou la prose — ne le quitte pas.`,
    isActive: true, priority: 85, injectionContexts: ["scenario", "roman", "all"],
  },
  {
    name: "Ellipse temporelle et montage mental",
    category: "technique-narrative",
    description: "Ce qu'on ne montre pas est souvent plus puissant que ce qu'on montre",
    content: `Godard, Resnais, Kubrick ont enseigné que l'ellipse n'est pas une omission mais une invitation : le spectateur/lecteur complète lui-même le saut, et ce qu'il imagine est toujours plus fort que ce qu'on lui montre. Techniques clés : 1) Sauter par-dessus la scène attendue — atterrir après les conséquences. 2) Le flash-back fragmenté (Resnais dans "Hiroshima mon amour") où passé et présent ne se distinguent que progressivement. 3) L'ellipse émotionnelle : on coupe juste avant la larme, l'aveu, le cri — le silence après vaut plus que le moment lui-même.`,
    isActive: true, priority: 90, injectionContexts: ["scenario", "roman", "all"],
  },
  {
    name: "Montage dialectique et collision des idées",
    category: "technique-narrative",
    description: "La juxtaposition crée une idée troisième, absente des deux originales",
    content: `Eisenstein a théorisé ce que tout grand auteur pratique intuitivement : juxtaposer deux images, deux scènes, deux moments crée une signification nouvelle absente de chacun. Le champ-contrechamp n'est pas symétrique — c'est une confrontation de deux vérités. Techniques : 1) La scène de joie montée contre une scène de deuil crée l'ironie tragique. 2) L'objet insignifiant filmé après un moment intense devient symbole. 3) En prose : alterner deux voix narratives opposées crée une troisième lecture. 4) Le montage parallèle de Griffith — deux actions simultanées — génère une tension que la linéarité ne peut pas produire.`,
    isActive: true, priority: 88, injectionContexts: ["scenario", "roman", "all"],
  },
  {
    name: "Corps comme langage — la performance intérieure",
    category: "technique-narrative",
    description: "L'émotion passe par le corps avant les mots",
    content: `Cassavetes, Fassbinder, les frères Dardenne : leurs acteurs ne jouent pas un texte, ils habitent une vérité physique. En écriture, cela se traduit par : les personnages qui parlent avec leurs corps avant leurs mots. Techniques : 1) Décrire d'abord le geste, puis la pensée qui y a conduit — jamais l'inverse. 2) La tension entre ce que le corps fait et ce que le personnage dit est la définition dramatique du sous-texte. 3) Un personnage qui ne pleure pas mais dont les mains tremblent est plus bouleversant qu'un personnage qui sanglote. 4) L'espace entre deux corps — distance physique — dit tout sur leur relation émotionnelle.`,
    isActive: true, priority: 87, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Silence et ma construction du vide",
    category: "technique-narrative",
    description: "Ozu, Bergman, Kiarostami : le silence est une parole",
    content: `Ozu ne remplit jamais un plan — il laisse des espaces. Bergman fait durer le silence après la réplique décisive. Kiarostami filme les routes vides plus longtemps que nécessaire. Ce vide n'est pas une absence : c'est la résonance de ce qui vient d'être dit ou fait. En écriture : 1) Le paragraphe court après le long crée un silence visuel sur la page. 2) La répétition du même mot à intervalle régulier bat comme un cœur — ou une obsession. 3) La scène d'un personnage seul, sans dialogue, sans action, révèle plus que toute confrontation. 4) Résistez à l'envie d'expliquer : si l'émotion est là, le lecteur l'a déjà sentie avant vos mots.`,
    isActive: true, priority: 82, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Narration fragmentée et vérité reconstituée",
    category: "technique-narrative",
    description: "Tarantino, Nolan, Almodóvar : l'ordre chronologique est un choix, pas une obligation",
    content: `La narration non-linéaire n'est pas un artifice : c'est un choix qui dit quelque chose sur la façon dont les personnages — et les humains en général — vivent le temps. Tarantino place la fin au début pour montrer que le "comment" importe plus que le "quoi". Nolan fragmente la mémoire parce que la mémoire elle-même est fragmentée. Techniques : 1) Commencer in medias res — au cœur de l'action — puis remonter. 2) L'analepse (flash-back) ne doit jamais expliquer, elle doit transformer la lecture de ce qu'on a déjà vu. 3) La prolepse (flash-forward) crée une tension irréversible — on sait que quelque chose va arriver, pas comment. 4) Chaque fragment doit être autonome narrativement ET dépendant émotionnellement.`,
    isActive: true, priority: 83, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Le regard subjectif — Tarkovsky et la perception intérieure",
    category: "technique-narrative",
    description: "Rendre visible ce que le personnage ressent, pas ce qu'il voit",
    content: `Tarkovsky ne filme pas la réalité : il filme la perception intérieure d'une réalité. Dans "Stalker", l'espace change de couleur selon l'état émotionnel. Dans "Le Miroir", passé et présent coexistent dans le même plan. En écriture, le regard subjectif signifie : 1) Les descriptions qui révèlent l'état du personnage plus que l'objet décrit. 2) La même scène racontée deux fois par deux personnages différents donne deux vérités incompatibles, toutes deux vraies. 3) La conscience du narrateur contamine la langue elle-même — un personnage anxieux décrit le monde avec des mots d'anxiété. 4) L'hallucination, le rêve, le souvenir déformé sont aussi réels narrativement que le présent.`,
    isActive: true, priority: 86, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Réalisme magique — le merveilleux ancré dans le quotidien",
    category: "technique-narrative",
    description: "García Márquez, Buñuel, Apichatpong : le surnaturel comme évidence",
    content: `Le réalisme magique ne justifie jamais le miracle — il l'accepte comme fait. Dans "Cent ans de solitude", des femmes montent au ciel avec leur linge — les villageois regardent sans s'étonner. C'est l'absence de surprise qui produit l'effet. Techniques : 1) Présenter l'élément impossible au même niveau de réalité que l'élément banal — même syntaxe, même ton. 2) L'étrangeté doit avoir des règles internes cohérentes. 3) L'ancrage culturel est essentiel : le magique émerge d'une réalité sociale très précise. 4) Les personnages qui ne s'étonnent pas du merveilleux forcent le lecteur à s'interroger sur ses propres catégories de réel. 5) Utilisé pour parler de traumatismes collectifs (guerre, colonisation) qui résistent à la narration réaliste.`,
    isActive: true, priority: 84, injectionContexts: ["roman", "scenario", "all"],
  },
  // ── Histoire cinéma
  {
    name: "Héritage de la Nouvelle Vague française",
    category: "histoire-cinema",
    description: "Godard, Truffaut, Varda : la caméra comme stylo",
    content: `La Nouvelle Vague (1958-1968) a inventé l'auteur au cinéma. Principes fondateurs toujours pertinents : 1) La caméra-stylo (Astruc) — le réalisateur écrit avec sa caméra comme le romancier avec sa plume. 2) Rejeter le "cinéma de papa" — les conventions narratives peuvent et doivent être brisées quand elles deviennent des mensonges. 3) Godard : rupture du 4e mur, jump cut, personnages qui commentent leur propre situation. 4) Truffaut : l'autofiction comme matière première, l'enfance comme blessure structurante. 5) Varda : la forme documentaire infuse la fiction, le réel déborde. 6) Rohmer : la parole comme action dramatique — ce que les personnages disent révèle ce qu'ils ne comprennent pas d'eux-mêmes.`,
    isActive: true, priority: 80, injectionContexts: ["scenario", "roman", "pitch", "all"],
  },
  {
    name: "Cinéma coréen contemporain — tension sociale et violence refoulée",
    category: "histoire-cinema",
    description: "Bong Joon-ho, Park Chan-wook, Lee Chang-dong : la Corée comme miroir du monde",
    content: `Le cinéma coréen des années 1990-2020 est le plus pertinent du monde pour explorer les inégalités, la violence systémique, et la culpabilité collective. Caractéristiques narratives : 1) Bong Joon-ho ("Parasite", "Memories of Murder") : le genre comme véhicule de critique sociale radicale. Le thriller, l'horreur, la comédie noire — chaque genre peut contenir une analyse marxiste. 2) Park Chan-wook ("Oldboy", "La Servante") : la vengeance comme labyrinthe moral où le vengeur devient ce qu'il hait. 3) Lee Chang-dong ("Oasis", "Burning") : le réalisme social poussé jusqu'à l'irrémédiable, les personnages qui ne peuvent pas échapper à leur classe. 4) Principe commun : la violence naît des structures sociales, pas de la nature humaine. 5) L'espace fermé (la maison, la cave, l'appartement) comme métaphore de l'enfermement de classe.`,
    isActive: true, priority: 79, injectionContexts: ["scenario", "roman", "pitch", "all"],
  },
  {
    name: "Cinéma iranien — poésie et contrainte",
    category: "histoire-cinema",
    description: "Kiarostami, Farhadi, Panahi : dire le monde par métaphore",
    content: `Le cinéma iranien post-révolutionnaire a développé, sous contrainte de censure, un langage d'une richesse formelle exceptionnelle. Leçons pour tout auteur : 1) Kiarostami ("Le Vent nous emportera", "Close-Up") : le doute sur la réalité de ce qu'on voit est une position narrative, pas un défaut. Les routes vides, les détours, sont la pensée elle-même. 2) Farhadi ("Une séparation", "Le Client") : la tragédie naît de personnages tous moralement cohérents dans leur propre logique — il n'y a pas de méchant, seulement des vérités incompatibles. 3) Panahi : filmer l'impossibilité de filmer devient le sujet du film. 4) La contrainte formelle comme générateur de créativité — ne pas pouvoir montrer force à inventer des formes nouvelles. 5) L'enfant comme porteur de la vérité que les adultes refusent de voir.`,
    isActive: true, priority: 78, injectionContexts: ["scenario", "roman", "all"],
  },
  {
    name: "Néoréalisme italien — la dignité du quotidien",
    category: "histoire-cinema",
    description: "Rossellini, De Sica, Visconti : filmer la réalité pour changer le monde",
    content: `Le néoréalisme (1945-1952) est né des décombres — littéralement. Leçons fondamentales : 1) De Sica ("Voleur de bicyclette") : la dignité d'un homme se mesure à la plus petite de ses possessions. Un objet ordinaire peut porter la tragédie d'une civilisation. 2) Rossellini ("Rome ville ouverte") : tourner dans les décombres réels parce que les studios sont des mensonges. La réalité physique du lieu infuse la fiction d'une vérité inaccessible autrement. 3) Visconti : le néoréalisme peut être aristocratique et tragique — il n'est pas réservé aux pauvres. 4) Acteurs non professionnels pour leur vérité physique, leur présence non-performative. 5) L'histoire collective (la guerre, l'occupation, la pauvreté) vécue à travers les gestes quotidiens des personnages.`,
    isActive: true, priority: 77, injectionContexts: ["scenario", "roman", "all"],
  },
  {
    name: "Montage soviétique — construire le sens par collision",
    category: "histoire-cinema",
    description: "Eisenstein, Vertov, Poudovkine : le montage comme idéologie",
    content: `Le montage soviétique (1920-1934) reste la théorie narrative la plus radicale jamais développée. Concepts opérationnels : 1) Eisenstein — montage attractionnel : chaque image doit "frapper" le spectateur comme un ring en boxe. La juxtaposition crée une signification nouvelle absente des deux images. 2) Vertov ("L'Homme à la caméra") : le montage peut organiser le temps, l'espace, la conscience — simultanément. 3) L'escalier d'Odessa dans "Le Cuirassé Potemkine" : le découpage rallonge le temps réel — 4 minutes filmées en 6 minutes — pour maximiser l'impact émotionnel. 4) Poudovkine : le montage de construction (assembler pour créer une continuité) vs. montage de collision d'Eisenstein. 5) Chaque scène de confrontation, de révolution, de foule peut s'inspirer de ces principes de montage.`,
    isActive: true, priority: 76, injectionContexts: ["scenario", "all"],
  },
  // ── Structure dramatique
  {
    name: "La structure des trois actes réinventée",
    category: "structure-dramatique",
    description: "Au-delà du schéma McKee : les variations culturelles de la structure dramatique",
    content: `La structure en trois actes est une moyenne, pas une loi. Variations essentielles : 1) Structure coréenne/asiatique — le 4e acte (han) : après la résolution apparente, une dernière vague émotionnelle qui ne résout rien mais accepte. 2) Structure iranienne — le dispositif : mettre en scène la mise en scène, interroger la frontière fiction/réel. 3) Structure européenne d'art — l'anti-climax volontaire : le point culminant est délibérément évité, ce qui génère une tension permanente. 4) Structure documentaire dans la fiction (Dogme 95) : la caméra qui tremble dit "je suis là" et rompt l'illusion. 5) La structure en spirale (Lynch) : retourner toujours au même point mais à un niveau de profondeur différent. 6) Principes universels malgré tout : le désir du protagoniste, un obstacle, une transformation — même si leur forme varie.`,
    isActive: true, priority: 91, injectionContexts: ["roman", "scenario", "pitch", "all"],
  },
  {
    name: "L'antagoniste comme miroir — la philosophie du méchant",
    category: "structure-dramatique",
    description: "Le meilleur antagoniste est celui qui a raison",
    content: `L'antagoniste révèle ce que le protagoniste refuse de voir en lui-même. Principes : 1) Thanos dans "Infinity War" est plus cohérent que les héros — c'est ce qui le rend terrifying. L'antagoniste doit avoir une logique interne irréfutable. 2) "No Country for Old Men" (Cormac McCarthy/Coen Brothers) : Anton Chigurh n'est pas méchant, il est une force cosmique — ni la fuir ni le combattre, seulement accepter. 3) Le meilleur antagoniste ne veut pas détruire le protagoniste — il veut le convaincre. 4) Dialectique nécessaire : si l'antagoniste a complètement tort, le protagoniste n'a rien à apprendre. La vraie tension naît quand l'antagoniste a au moins 30% raison. 5) L'antagoniste intérieur (la part sombre du protagoniste) est souvent plus puissant que l'antagoniste extérieur.`,
    isActive: true, priority: 89, injectionContexts: ["roman", "scenario", "pitch", "all"],
  },
  {
    name: "L'espace comme personnage — la géographie intérieure",
    category: "structure-dramatique",
    description: "Chaque lieu doit avoir une psychologie",
    content: `Dans "Le Parrain", la Sicile est une autre époque. Dans "Blade Runner", Los Angeles 2019 est une dépression. Dans "Parasite", les deux maisons sont deux classes sociales matérialisées. L'espace narratif : 1) Chaque lieu dans une histoire doit avoir une règle émotionnelle : ce qu'il permet, ce qu'il interdit, ce qu'il révèle. 2) La transition entre deux espaces = transition psychologique. Un personnage qui traverse le seuil est un personnage qui change. 3) L'espace peut mentir : la maison belle qui cache la violence, la ville grise qui cache la tendresse. 4) La verticalité (escaliers, sous-sols, penthouses) est la métaphore sociale universelle. 5) L'espace fermé contre l'espace ouvert comme tension narrative : l'enfermement vs. la fuite. 6) Construire la carte spatiale du récit avant d'écrire — chaque lieu doit avoir son atmosphère irréductible.`,
    isActive: true, priority: 85, injectionContexts: ["roman", "scenario", "all"],
  },
  // ── Style auteur
  {
    name: "L'autofiction comme universalité — le je qui atteint le nous",
    category: "style-auteur",
    description: "Proust, Truffaut, Varda, Bergman : le particulier comme universel",
    content: `Le paradoxe de l'autofiction : plus on est précis dans le particulier de sa propre expérience, plus on touche à l'universel. Truffaut confesse son enfance difficile dans "Les 400 Coups" — et des millions d'enfants du monde entier s'y reconnaissent. Techniques : 1) Le détail biographique exact, inavouable, honteux — c'est lui qui touche, pas le détail "littéraire". 2) Ne pas chercher à être universel : chercher à être précis. L'universalité est un sous-produit de la précision. 3) Bergman dans "Scènes de la vie conjugale" : filmer ses propres démons relationnels sans se protéger. Le courage de l'exposition. 4) Annie Ernaux : l'écriture de soi comme archéologie sociale — la honte de classe, le désir, la perte. 5) Le "je" de l'autofiction n'est pas narcissique : il est un instrument d'observation du monde.`,
    isActive: true, priority: 82, injectionContexts: ["roman", "pitch", "note-intention", "all"],
  },
  {
    name: "La signature visuelle — développer un style reconnaissable",
    category: "style-auteur",
    description: "Wong Kar-wai, Kubrick, Almodovar : l'esthétique comme éthique",
    content: `Un style n'est pas décoratif — c'est une position éthique matérialisée. Wong Kar-wai : le flou, la ralentie, les couleurs saturées disent que le temps et la mémoire sont irréels, que le désir ne trouve jamais son objet. Kubrick : la symétrie parfaite dit que l'univers est mathématiquement indifférent à la souffrance humaine. Almodovar : le kitsch assume sa provenance populaire et fait de la vulgarité une aristocratie. Construire sa signature : 1) Identifier une tension formelle récurrente (rapide/lent, couleur/noir et blanc, voix off/silence). 2) Cette tension doit correspondre à une tension thématique centrale dans votre travail. 3) La contrainte stylistique que vous vous imposez vous force à trouver des solutions narratives nouvelles. 4) Le style doit servir l'histoire — mais parfois, le style EST l'histoire.`,
    isActive: true, priority: 80, injectionContexts: ["scenario", "roman", "note-intention", "all"],
  },
  // ── Culture régionale
  {
    name: "Cinéma africain — la mémoire collective et la parole",
    category: "culture-regionale",
    description: "Sembène, Sissako, Mambéty : l'Afrique qui se raconte elle-même",
    content: `Ousmane Sembène a créé le cinéma africain comme acte politique : raconter l'Afrique en langues africaines, depuis les perspectives africaines. Leçons fondamentales : 1) Sembène ("Xala", "Mooladé") : la satire politique comme arme — le colonisé qui retourne les outils du colonisateur. 2) Abderrahmane Sissako ("Timbuktu", "Bamako") : le temps africain dans le récit — le présent peut coexister avec des siècles de passé sans hiérarchie. 3) Djibril Diop Mambéty ("Touki Bouki") : formalisme radical, mythologie yoruba et modernité urbaine — les temporalités ne sont pas linéaires. 4) La tradition orale (griots) comme modèle narratif : le conteur est visible, il interpelle, il juge, il rit. 5) La communauté comme protagoniste collectif — contre l'individualisme du héros occidental.`,
    isActive: true, priority: 74, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Cinema Novo brésilien — la faim comme esthétique",
    category: "culture-regionale",
    description: "Glauber Rocha, Nelson Pereira dos Santos : une esthétique de la faim",
    content: `Glauber Rocha a formulé l'esthétique du Cinema Novo brésilien (1960-1970) : "une idée dans la tête et une caméra dans la main". La pauvreté des moyens devient force expressive. Concepts clés : 1) L'esthétique de la faim — les conditions matérielles de production (pas d'argent, pas d'équipement professionnel) génèrent une esthétique de la nécessité qui dit la réalité sociale mieux que tout studio. 2) Le sertão nordestino (l'arrière-pays sec et pauvre) comme espace mythologique — la sécheresse, la violence, la mystique religieuse, le cangaçeiro. 3) Mélange de documentaire et de fiction, de réalisme et de baroque tropical. 4) La violence révolutionnaire comme réponse à la violence coloniale — position morale assumée. 5) Héritage contemporain : "Cidade de Deus" (Meirelles) comme descendant direct.`,
    isActive: true, priority: 73, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Cinéma japonais classique — le temps et l'impermanence",
    category: "culture-regionale",
    description: "Ozu, Kurosawa, Mizoguchi : trois façons d'être japonais",
    content: `Le cinéma japonais classique offre trois approches narratives fondamentalement différentes : 1) Ozu (mono no aware — la mélancolie des choses) : les pillow shots (plans de vases, de murs, de ciel) ne sont pas des transitions — ce sont des respirations, des moments de contemplation de l'impermanence. La caméra basse, au niveau du tapis, dit que les personnages sont ancrés dans leur condition. 2) Kurosawa : la violence comme test moral — le guerrier face à lui-même. La pluie dans les scènes de combat n'est pas réaliste, elle est émotionnelle. La multicaméra et le téléobjectif compressent l'espace et augmentent la tension. 3) Mizoguchi : le plan-séquence qui suit les femmes à distance — témoin sans jugement d'un destin social inévitable. La tragédie des femmes sous le patriarcat japonais comme tragédie humaine universelle.`,
    isActive: true, priority: 78, injectionContexts: ["roman", "scenario", "all"],
  },
  {
    name: "Nouveau cinéma roumain — l'attente comme dramaturgie",
    category: "culture-regionale",
    description: "Mungiu, Puiu, Porumboiu : l'ennui bureaucratique comme tragédie",
    content: `Le Nouveau Cinéma Roumain (2000-2015) est l'un des mouvements les plus originaux de l'histoire du cinéma. Caractéristiques : 1) Cristian Puiu ("La Mort de Dante Lazarescu") : le temps réel, sans musique, sans montage dramatique — la mort d'un homme baladé d'hôpital en hôpital dure 2h30 en temps quasi-réel. L'ennui du spectateur EST le sujet. 2) Cristian Mungiu ("4 mois, 3 semaines, 2 jours") : huis clos d'une journée, une seule décision impossible, aucun manichéisme. 3) Corneliu Porumboiu ("Police, adjective") : un film sur un mot du dictionnaire. Le langage bureaucratique comme cage. 4) Principes communs : refus du montage expressif, plans longs, acteurs non professionnels, absence de musique extra-diégétique, refus du happy ending. 5) La bureaucratie héritée du communisme comme personnage central invisible.`,
    isActive: true, priority: 75, injectionContexts: ["roman", "scenario", "all"],
  },
  // ── Standards pro
  {
    name: "Standards professionnels français — CNC et SACD",
    category: "standards-pro",
    description: "Ce que les comités de sélection français attendent réellement",
    content: `Pour qu'un projet soit finançable par le CNC (Centre National du Cinéma) ou soutenu par la SACD : 1) L'originalité de la voix auteur doit être identifiable dès le synopsis — pas l'originalité du concept mais du regard. 2) L'ancrage social ou psychologique doit être précis et documenté — le CNC finance des œuvres qui parlent de réalités françaises ou de l'universel par le particulier français. 3) Le format de la note d'intention : 1) La genèse personnelle du projet (pourquoi vous, pourquoi maintenant), 2) La forme choisie et pourquoi elle est la seule possible, 3) Les références cinématographiques assumées (pas de honte à citer ses influences). 4) L'avance sur recettes CNC : œuvre de qualité + potentiel commercial (pas opposés). 5) SACD : droits d'auteur, importance de l'inscription des œuvres, cahier des charges des séries TV françaises.`,
    isActive: true, priority: 92, injectionContexts: ["pitch", "note-intention", "all"],
  },
  {
    name: "Format Fountain et standards scénario professionnel",
    category: "standards-pro",
    description: "Les conventions du scénario professionnel en France et à l'international",
    content: `Le format Fountain est le standard open-source du scénario numérique. Règles : 1) INT./EXT. + LIEU + MOMENT (JOUR/NUIT/AUBE/CRÉPUSCULE) — toujours en majuscules. 2) Le nom des personnages centré, en majuscules, avant chaque réplique. 3) Les actions en minuscules, au présent, à la voix active — pas "la porte fut ouverte" mais "Paul ouvre la porte". 4) Une page Fountain ≈ une minute de film — référence pour estimer la durée. 5) Les parenthèses (instructions de jeu) doivent être rares — les meilleures répliques contiennent leur propre direction. 6) TRANSITION (FONDU ENCHAÎNÉ, COUPE) : utilisé avec parcimonie, seulement quand ça ajoute un sens narratif. 7) Convention française : les répliques peuvent être plus longues qu'en Hollywood — la tradition du "film parlant" français assume la parole comme acte dramatique.`,
    isActive: true, priority: 93, injectionContexts: ["scenario", "all"],
  },
];

const CINEMA_KNOWLEDGE_SEED = [
  // ── France
  { country: "France", region: "Europe", era: "1960s", movement: "Nouvelle Vague", director: "Jean-Luc Godard", films: ["À bout de souffle", "Alphaville", "Pierrot le fou", "Weekend", "Le Mépris"], techniques: ["Jump cut", "Rupture du 4e mur", "Improvisation dialoguée", "Tournage en décors naturels"], culturalContext: "Après-guerre, existentialisme, influence américaine contestée, politique et esthétique mêlées", narrativeSignatures: "Les personnages commentent leur propre situation, la forme questionne le fond, le politique irrompt dans l'intime", tags: ["auteur", "politique", "modernisme", "dialogue"] },
  { country: "France", region: "Europe", era: "1960s", movement: "Nouvelle Vague", director: "François Truffaut", films: ["Les 400 Coups", "Jules et Jim", "La Nuit américaine", "L'Enfant sauvage", "La Peau douce"], techniques: ["Autofiction", "Voix off mélancolique", "Personnage en fuite permanente", "Temps de l'enfance"], culturalContext: "Autobiographie comme matière première, cinéma comme rédemption personnelle", narrativeSignatures: "L'enfance blessée comme moteur narratif, les personnages pris entre leur désir et leur incapacité à y renoncer", tags: ["autofiction", "enfance", "mélancolie", "auteur"] },
  { country: "France", region: "Europe", era: "1970s-1990s", movement: "Cinéma d'auteur", director: "Agnès Varda", films: ["Cléo de 5 à 7", "Sans toit ni loi", "Les Glaneurs et la Glaneuse", "Visages Villages"], techniques: ["Hybridation documentaire-fiction", "Regard féministe", "Présence du corps vieillissant", "La glane comme méthode"], culturalContext: "Féminisme, marginalité choisie, regard sur ceux qu'on ne voit pas", narrativeSignatures: "Le détour documentaire révèle plus que la ligne directe, les invisibles comme protagonistes", tags: ["féminisme", "documentaire", "marginalité", "humanisme"] },
  { country: "France", region: "Europe", era: "1960s-1980s", movement: "Cinéma politique", director: "Chris Marker", films: ["La Jetée", "Sans Soleil", "Le Fond de l'air est rouge", "Cuba si !"], techniques: ["Photo-roman", "Voix off mélancolique", "Temps circulaire", "Essai filmique"], culturalContext: "Militantisme de gauche, mémoire collective, contre-histoire", narrativeSignatures: "La mémoire comme reconstruction, l'essai comme forme narrative à part entière", tags: ["mémoire", "politique", "essai", "temps"] },
  // ── Italie
  { country: "Italie", region: "Europe", era: "1945-1952", movement: "Néoréalisme", director: "Vittorio De Sica", films: ["Voleur de bicyclette", "Umberto D.", "Miracle à Milan", "Shoeshine"], techniques: ["Acteurs non professionnels", "Décors réels", "Temps réel des actions", "Lumière naturelle"], culturalContext: "Italie détruite par la guerre, pauvreté urbaine, dignité humaine sous pression économique", narrativeSignatures: "La tragédie dans l'objet quotidien, la dignité de l'homme ordinaire face au système", tags: ["pauvreté", "dignité", "réalisme", "humanisme"] },
  { country: "Italie", region: "Europe", era: "1960s-1970s", movement: "Cinéma d'auteur", director: "Federico Fellini", films: ["8½", "La Dolce Vita", "Amarcord", "Satyricon", "La Strada"], techniques: ["Rêve et réalité indistincts", "Autofiction baroque", "Cirque de l'existence", "Mémoire mythifiée"], culturalContext: "Italie de l'après-guerre, miracle économique, nostalgie de la province, catholicisme baroque", narrativeSignatures: "La mémoire qui se transforme en mythe, l'artiste face au vide créatif", tags: ["autofiction", "baroque", "mémoire", "artiste"] },
  { country: "Italie", region: "Europe", era: "1960s-1970s", movement: "Cinéma politique", director: "Pier Paolo Pasolini", films: ["Accattone", "Mamma Roma", "Théorème", "Salò", "L'Évangile selon Matthieu"], techniques: ["Mythologie dans le contemporain", "Corps comme sacré/profane", "Marxisme et religion", "Sous-prolétariat urbain"], culturalContext: "Italie du miracle économique vu depuis les faubourgs, christianisme hérétique, homosexualité militante", narrativeSignatures: "Le sacré dans le quotidien le plus banal, la bourgeoisie comme force de mort", tags: ["politique", "corps", "religion", "marxisme"] },
  // ── Japon
  { country: "Japon", region: "Asie", era: "1950s-1960s", movement: "Âge d'or du cinéma japonais", director: "Akira Kurosawa", films: ["Rashōmon", "Les Sept Samouraïs", "Ikiru", "Yojimbo", "Ran"], techniques: ["Multicaméra", "Téléobjectif compressant l'espace", "Pluie dramatique", "Géométrie des groupes"], culturalContext: "Japon de l'après-guerre, crise du code bushido, modernité vs tradition, honte collective", narrativeSignatures: "La vérité subjective de chaque témoin (Rashōmon), le samouraï comme figure du sacrifice inutile mais nécessaire", tags: ["honneur", "vérité subjective", "sacrifice", "groupe"] },
  { country: "Japon", region: "Asie", era: "1930s-1960s", movement: "Cinéma contempltatif", director: "Yasujirō Ozu", films: ["Voyage à Tokyo", "Printemps tardif", "Il était un père", "Bonjour", "Fin d'automne"], techniques: ["Caméra basse (niveau tatami)", "Pillow shots", "Pas de fondu-enchaîné", "Ellipse entre deux scènes"], culturalContext: "Famille japonaise en mutation, conflit générations, modernisation douloureuse, mono no aware", narrativeSignatures: "Les fins qui ne résolvent rien mais acceptent, la beauté mélancolique de ce qui passe", tags: ["impermanence", "famille", "mélancolie", "contemplation"] },
  { country: "Japon", region: "Asie", era: "1980s-2000s", movement: "Cinéma contemporain", director: "Hirokazu Kore-eda", films: ["Nobody Knows", "Tel père, tel fils", "Une affaire de famille", "Notre petite sœur", "Broker"], techniques: ["Enfants comme révélateurs du monde adulte", "Économie de moyens expressifs", "Temps non dramatique", "Famille recomposée"], culturalContext: "Japon contemporain, pauvreté invisible, failles du contrat social, familles qui n'en sont pas", narrativeSignatures: "La famille comme choix plutôt que comme biologie, l'amour qui ne se dit pas", tags: ["famille", "enfance", "société", "tendresse"] },
  // ── Corée du Sud
  { country: "Corée du Sud", region: "Asie", era: "2000s-2020s", movement: "Nouveau cinéma coréen", director: "Bong Joon-ho", films: ["Memories of Murder", "The Host", "Snowpiercer", "Okja", "Parasite"], techniques: ["Changement de registre générique", "Critique sociale dans le genre populaire", "Plan final qui détruit l'espoir", "Espace vertical"], culturalContext: "Corée post-dictature, inégalités de classe extrêmes, chaebol et sous-prolétariat, honte nationale de Gwangju", narrativeSignatures: "Le genre (horreur, thriller, SF) comme cheval de Troie pour la critique marxiste, les pauvres qui collaborent à leur propre destruction", tags: ["classe sociale", "genre", "critique", "vertical"] },
  { country: "Corée du Sud", region: "Asie", era: "2000s-2010s", movement: "Nouveau cinéma coréen", director: "Park Chan-wook", films: ["JSA", "Oldboy", "Lady Vengeance", "Stoker", "La Servante"], techniques: ["Symétrie visuelle", "Violence esthétisée", "Retournement moral final", "Couleur comme signification"], culturalContext: "Trauma historique (guerre de Corée, dictature), vengeance comme récit national, identité déchirée", narrativeSignatures: "La vengeance qui transforme le vengeur en ce qu'il déteste, la beauté de la cruauté comme position morale", tags: ["vengeance", "trauma", "esthétique", "moral"] },
  { country: "Corée du Sud", region: "Asie", era: "1990s-2010s", movement: "Réalisme coréen", director: "Lee Chang-dong", films: ["Peppermint Candy", "Oasis", "Secret Sunshine", "Poetry", "Burning"], techniques: ["Temps à rebours (Peppermint Candy)", "Corps handicapé comme vérité sociale", "Ellipse sur les moments décisifs", "Fin ouverte radicale"], culturalContext: "Corée post-dictature, christianisme et désespoir, classe moyenne appauvrie, jeunesse sans avenir", narrativeSignatures: "Les personnages qui ne peuvent pas échapper à leur origine sociale, la foi comme dernier recours avant le néant", tags: ["classe", "religion", "désespoir", "réalisme"] },
  // ── Iran
  { country: "Iran", region: "Moyen-Orient", era: "1990s-2010s", movement: "Nouvelle vague iranienne", director: "Abbas Kiarostami", films: ["Où est la maison de mon ami ?", "Close-Up", "Le Goût de la cerise", "Le Vent nous emportera", "10"], techniques: ["Routes vides et détours", "Non-professionnel qui joue son propre rôle", "Frontière fiction/documentaire", "Mort hors-champ"], culturalContext: "Iran post-révolution, censure comme générateur formel, campagnes vs villes, code du genre imposé", narrativeSignatures: "Le doute sur la nature du réel est une posture narrative, la route comme pensée en mouvement", tags: ["réel", "doute", "route", "métaphore"] },
  { country: "Iran", region: "Moyen-Orient", era: "2000s-2010s", movement: "Cinéma social iranien", director: "Asghar Farhadi", films: ["Une séparation", "À propos d'Elly", "Le Client", "Everybody Knows"], techniques: ["Ambiguïté morale totale", "Révélations progressives", "Pas de coupable", "Huis clos social"], culturalContext: "Classe moyenne iranienne, rapport hommes-femmes, honneur social, contrainte légale religieuse", narrativeSignatures: "Tous les personnages ont raison dans leur propre logique, la tragédie naît de vérités incompatibles", tags: ["ambiguïté", "moral", "famille", "vérité"] },
  // ── Russie/URSS
  { country: "URSS/Russie", region: "Europe", era: "1920s-1930s", movement: "Montage soviétique", director: "Sergei Eisenstein", films: ["Le Cuirassé Potemkine", "Octobre", "La Grève", "Alexandre Nevski", "Ivan le Terrible"], techniques: ["Montage attractionnel", "Acteurs typages (pas de stars)", "Foule comme protagoniste", "Ellipse temporelle expansive"], culturalContext: "Révolution bolchévique, construction du socialisme, propagande comme art", narrativeSignatures: "La masse comme héros, le montage comme idéologie, le temps dilaté dans les moments de violence collective", tags: ["révolution", "masse", "montage", "politique"] },
  { country: "URSS/Russie", region: "Europe", era: "1960s-1980s", movement: "Cinéma poétique soviétique", director: "Andrei Tarkovsky", films: ["L'Enfance d'Ivan", "Andreï Roublev", "Solaris", "Le Miroir", "Stalker"], techniques: ["Plan-séquence contemplatif", "Eau et feu comme motifs obsessionnels", "Temps subjectif", "Mémoire comme présent"], culturalContext: "URSS brejnévienne, aspiration spirituelle réprimée, nostalgie de l'enfance, conflit art/État", narrativeSignatures: "Le temps qui passe sans événement EST l'événement, la conscience qui contient tous les temps", tags: ["temps", "mémoire", "spiritualité", "contemplation"] },
  // ── Allemagne
  { country: "Allemagne", region: "Europe", era: "1919-1933", movement: "Expressionnisme allemand", director: "Fritz Lang / F.W. Murnau", films: ["Metropolis", "M le Maudit", "Nosferatu", "Le Cabinet du docteur Caligari", "Faust"], techniques: ["Décors distordus", "Lumière expressionniste (ombres extrêmes)", "Architecture comme état psychologique", "Monstre comme métaphore sociale"], culturalContext: "République de Weimar, trauma de WWI, inflation, montée du nazisme pressentie, psychanalyse naissante", narrativeSignatures: "Le monstre est le reflet de la société qui l'a créé, l'espace architectural extériorise la psychologie", tags: ["expressionnisme", "ombre", "monstre", "psychologie"] },
  { country: "Allemagne", region: "Europe", era: "1970s-1980s", movement: "Nouveau cinéma allemand", director: "Rainer Werner Fassbinder", films: ["Le Droit du plus fort", "L'Année des 13 lunes", "Ali : Peur manger l'âme", "Berlin Alexanderplatz"], techniques: ["Mélodrame de Sirk déconstruit", "Corps épuisé", "Amour comme exploitation", "Plans-tableaux statiques"], culturalContext: "RFA, mémoire nazie refoulée, capitalisme et désirs manipulés, marginalité sexuelle et sociale", narrativeSignatures: "L'amour comme rapport de pouvoir, les opprimés qui reproduisent l'oppression qu'ils subissent", tags: ["mélodrame", "pouvoir", "corps", "oppression"] },
  // ── Danemark
  { country: "Danemark", region: "Europe", era: "1990s-2000s", movement: "Dogme 95", director: "Lars von Trier / Thomas Vinterberg", films: ["Festen", "Les Idiots", "Breaking the Waves", "Dancer in the Dark", "Melancholia"], techniques: ["Caméra portée", "Lumière naturelle uniquement", "Pas de musique non-diégétique", "Son direct"], culturalContext: "Réaction contre le cinéma d'effets spéciaux, retour au réel, vœu de chasteté formel", narrativeSignatures: "La caméra qui tremble dit 'je suis là', la contrainte formelle comme libération narrative", tags: ["réalisme", "contrainte", "corps", "souffle"] },
  // ── Amérique Latine
  { country: "Brésil", region: "Amérique latine", era: "1960s-1970s", movement: "Cinema Novo", director: "Glauber Rocha", films: ["Dieu et le Diable dans la Terre du Soleil", "Antonio das Mortes", "Terra em Transe"], techniques: ["Esthétique de la faim", "Caméra à l'épaule", "Mélange documentaire-fiction", "Violence mythologique"], culturalContext: "Dictature militaire, sertão nordestino, cangaçeiros et fanáticos, sous-développement comme condition narrative", narrativeSignatures: "La misère comme esthétique, le baroque tropical comme résistance, la violence révolutionnaire comme réponse à la violence coloniale", tags: ["révolution", "pauvreté", "baroque", "mythologie"] },
  { country: "Argentine", region: "Amérique latine", era: "2000s-2010s", movement: "Nouveau cinéma argentin", director: "Lucrecia Martel", films: ["La Ciénaga", "La Sainte Fille", "La Femme sans tête", "Zama"], techniques: ["Point de vue périphérique", "Corps féminins", "Espace de classe matérialisé", "Chaleur et torpeur"], culturalContext: "Post-crise 2001, déclin de la classe moyenne, mémoire de la dictature, aristocratie de province", narrativeSignatures: "Ce que les personnages ne voient pas révèle ce qu'ils refusent de voir socialement, la torpeur comme état politique", tags: ["classe", "féminin", "point de vue", "chaleur"] },
  { country: "Mexique", region: "Amérique latine", era: "2000s-2010s", movement: "Nuevo Cine Mexicano", director: "Carlos Reygadas", films: ["Japón", "Batalla en el Cielo", "Luz silenciosa", "Notre temps"], techniques: ["Acteurs non professionnels", "Plans très longs", "Corps en pleine nature", "Transcendance du quotidien"], culturalContext: "Mexique rural et urbain, classe et corps, spiritualité anabaptiste, frontière USA-Mexique", narrativeSignatures: "Le divin dans le banal corporel, le temps agricole contra le temps narratif", tags: ["spiritualité", "corps", "nature", "transcendance"] },
  // ── Taïwan
  { country: "Taïwan", region: "Asie", era: "1980s-2000s", movement: "Nouvelle vague taïwanaise", director: "Hou Hsiao-hsien", films: ["La Cité des douleurs", "Les Fleurs de Shanghai", "Millennium Mambo", "Three Times"], techniques: ["Plan fixe long", "Acteurs vus de dos ou de loin", "Temps historique stratifié", "Fenêtre comme cadre dans le cadre"], culturalContext: "Taïwan post-228 (massacre de 1947), identité taïwanaise vs chinoise, colonisation japonaise, modernisation", narrativeSignatures: "L'histoire nationale visible dans les gestes privés, l'ellipse sur les moments de violence ou d'amour", tags: ["histoire", "identité", "distance", "temps"] },
  { country: "Taïwan", region: "Asie", era: "1990s-2000s", movement: "Cinéma urbain contemporain", director: "Edward Yang", films: ["Yi Yi", "Terroriste", "Confucianisme peut-il sauver le capitalisme ?", "A Brighter Summer Day"], techniques: ["Plans très longs", "Multiplication de personnages-miroirs", "Architecture moderne comme cage", "Générations en conflit"], culturalContext: "Taïpei moderne, famille confucéenne sous pression capitaliste, jeunesse perdue, violence des gangs", narrativeSignatures: "La ville moderne comme désorientation existentielle, les personnages qui cherchent leur place dans un monde sans boussole", tags: ["modernité", "famille", "urbain", "désorientation"] },
  // ── Chine
  { country: "Chine", region: "Asie", era: "1980s-1990s", movement: "Cinquième génération", director: "Zhang Yimou", films: ["Judou", "Épouses et Concubines", "Qiu Ju, une femme chinoise", "Hero", "Vivre !"], techniques: ["Couleur comme émotion (rouge = passion/mort)", "Espace rural historique", "Corps de femme et oppression", "Plan large emblématique"], culturalContext: "Chine post-Révolution Culturelle, patriarcat féodal, femmes sacrifiées, modernisation douloureuse", narrativeSignatures: "Le corps féminin comme champ de bataille politique, la couleur comme commentaire moral", tags: ["couleur", "féminin", "histoire", "opression"] },
  { country: "Chine", region: "Asie", era: "2000s-2010s", movement: "Sixième génération", director: "Jia Zhangke", films: ["Xiao Wu", "Unknown Pleasures", "Still Life", "A Touch of Sin", "Les Éternels"], techniques: ["DV puis numérique", "Ruines industrielles", "Temps mort et attente", "Pop culture comme aliénation"], culturalContext: "Chine de l'après-Tian'anmen, destruction créatrice capitaliste, paysans déplacés, violence économique", narrativeSignatures: "Les laissés-pour-compte de la modernisation, les corps épuisés dans les paysages détruits", tags: ["modernisation", "classe ouvrière", "ruine", "violence"] },
  // ── Inde
  { country: "Inde", region: "Asie", era: "1950s-1980s", movement: "Parallel Cinema", director: "Satyajit Ray", films: ["La Complainte du sentier", "Aparajito", "Le Monde d'Apu", "Charulata", "La Maison et le Monde"], techniques: ["Humanisme lyrique", "Musique de Ravi Shankar comme voix off", "Visages d'une présence exceptionnelle", "Nature bengalie"], culturalContext: "Inde post-indépendance, Bengale rural, Calcutta en mutation, caste et modernité", narrativeSignatures: "La croissance d'un enfant comme histoire d'une civilisation, la douceur face à la violence du monde", tags: ["humanisme", "enfance", "nature", "épopée personnelle"] },
  // ── Hong Kong
  { country: "Hong Kong", region: "Asie", era: "1990s-2000s", movement: "Cinéma de Hong Kong", director: "Wong Kar-wai", films: ["Chungking Express", "In the Mood for Love", "2046", "Happy Together", "Les Cendres du temps"], techniques: ["Flou et ralenti", "Musique anachronique", "Lumière filtrée saturée", "Monologue intérieur"], culturalContext: "Hong Kong avant la rétrocession (1997), anxiété identitaire, amours impossibles, temps qui s'enfuit", narrativeSignatures: "Le désir qui ne trouve jamais son objet, le temps comme substance émotionnelle, la mémoire comme seule réalité", tags: ["désir", "temps", "mémoire", "mélancolie"] },
  // ── USA
  { country: "USA", region: "Amérique du Nord", era: "1967-1980", movement: "New Hollywood", director: "Francis Ford Coppola / Martin Scorsese", films: ["Le Parrain", "Taxi Driver", "Apocalypse Now", "Raging Bull", "Mean Streets"], techniques: ["Anti-héros", "Violence non rédemptrice", "Influences européennes assumées", "Subjectivité extrême"], culturalContext: "Post-Vietnam, Watergate, crise de confiance américaine, contre-culture, studios qui laissent les auteurs libres", narrativeSignatures: "L'Amérique qui se retourne contre elle-même, le héros qui est le problème", tags: ["anti-héros", "violence", "américanité", "désillusion"] },
  { country: "USA", region: "Amérique du Nord", era: "1980s-2000s", movement: "Cinéma indépendant américain", director: "John Cassavetes / Jim Jarmusch", films: ["Faces", "A Woman Under the Influence", "Stranger Than Paradise", "Dead Man", "Mystery Train"], techniques: ["Improvisation", "Temps mort valorisé", "Corps et voix comme instruments", "Marginalité assumée"], culturalContext: "En dehors des studios, budget minimal, acteurs-collaborateurs, économie de la nécessité", narrativeSignatures: "L'ennui comme révélateur, les marges de la société américaine comme cœur du pays réel", tags: ["improvisation", "indie", "corps", "marginalité"] },
  // ── Roumanie
  { country: "Roumanie", region: "Europe", era: "2000s-2010s", movement: "Nouveau cinéma roumain", director: "Cristian Mungiu", films: ["4 mois, 3 semaines, 2 jours", "Au-delà des collines", "Bacalauréat", "R.M.N."], techniques: ["Plan long sans coupe", "Temps réel", "Pas de musique non-diégétique", "Ambiguïté morale totale"], culturalContext: "Roumanie post-communiste, bureaucratie héritée, Église orthodoxe, corruption institutionnelle", narrativeSignatures: "La décision impossible comme définition de l'existence morale, le système comme personnage invisible mais omnipotent", tags: ["bureaucratie", "moral", "temps réel", "huis clos"] },
  // ── Afrique
  { country: "Sénégal", region: "Afrique", era: "1960s-2000s", movement: "Cinéma africain fondateur", director: "Ousmane Sembène", films: ["La Noire de...", "Xala", "Ceddo", "Mooladé", "Guelwaar"], techniques: ["Wolof et langues locales", "Satire politique directe", "Corps féminins résistants", "Conte traditionnel modernisé"], culturalContext: "Sénégal post-indépendance, bourgeoisie africaine corrompue, impérialisme culturel français, excision", narrativeSignatures: "Le colonisé qui retourne les armes du colonisateur, les femmes comme forces de résistance et de changement", tags: ["postcolonialisme", "satire", "femmes", "résistance"] },
  { country: "Mali/Mauritanie", region: "Afrique", era: "2000s", movement: "Cinéma africain contemporain", director: "Abderrahmane Sissako", films: ["La Vie sur Terre", "Heremakono", "Bamako", "Timbuktu"], techniques: ["Temps africain (attente et présence)", "Procès comme forme narrative", "Musique comme narration", "Solitude dans l'espace vaste"], culturalContext: "Mali sous occupation djihadiste, critique du FMI par un village africain qui fait son propre procès, mondialisation et culture", narrativeSignatures: "La dignité silencieuse face à la barbarie, le temps africain qui résiste au temps occidental", tags: ["dignité", "résistance", "temps", "communauté"] },
  // ── UK
  { country: "Royaume-Uni", region: "Europe", era: "1960s", movement: "British New Wave / Kitchen Sink", director: "Ken Loach / Mike Leigh", films: ["Kes", "Naked", "I Daniel Blake", "Sorry We Missed You", "Secrets & Lies"], techniques: ["Improvisation structurée", "Acteurs non professionnels", "Classes sociales observées de l'intérieur", "Dialectes régionaux"], culturalContext: "Angleterre ouvrière, tatchérisme, deindustrialisation, working class comme sujet pas comme décor", narrativeSignatures: "Le système qui broie les gens de bonne volonté, la dignité ouvrière sous pression économique", tags: ["classe ouvrière", "réalisme", "système", "dignité"] },
  // ── Scandinavie
  { country: "Suède", region: "Europe", era: "1950s-1980s", movement: "Cinéma bergmanien", director: "Ingmar Bergman", films: ["Le Septième Sceau", "Persona", "Scènes de la vie conjugale", "Cris et Chuchotements", "Fanny et Alexandre"], techniques: ["Gros plan sur les visages", "Silence prolongé", "Dieu absent", "Couples en combat", "Frontière moi/autre"], culturalContext: "Protestantisme suédois, culpabilité et mort, guerre froide, couple comme champ de bataille existentiel", narrativeSignatures: "Les personnages qui ne peuvent pas s'atteindre malgré leur désir, la foi impossible mais nécessaire", tags: ["existentialisme", "mort", "couple", "foi"] },
];

export default router;
