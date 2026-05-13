--
-- PostgreSQL database dump
--

\restrict peiQI85fgAcGS3j0kywebyQIMlEs9drzAhiAyM26YPormMS5h7DV0fW9PpbnjKs

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_skills; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.ai_skills (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 50 NOT NULL,
    injection_contexts jsonb DEFAULT '[]'::jsonb NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_skills OWNER TO matrice;

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.app_users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    generations_used integer DEFAULT 0 NOT NULL,
    projects_created integer DEFAULT 0 NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email_verification_token text,
    email_verification_sent_at timestamp without time zone,
    password_reset_token text,
    password_reset_expires_at timestamp without time zone,
    onboarding_completed_at timestamp without time zone
);


ALTER TABLE public.app_users OWNER TO matrice;

--
-- Name: atmosphere_data; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.atmosphere_data (
    id text NOT NULL,
    project_id text NOT NULL,
    color_palette jsonb DEFAULT '[]'::jsonb NOT NULL,
    lighting_style text DEFAULT ''::text NOT NULL,
    music_references jsonb DEFAULT '[]'::jsonb NOT NULL,
    cinematic_style text DEFAULT ''::text NOT NULL,
    textures jsonb DEFAULT '[]'::jsonb NOT NULL,
    sensory_notes jsonb DEFAULT '{"smell": "", "sound": "", "touch": ""}'::jsonb NOT NULL,
    visual_references jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.atmosphere_data OWNER TO matrice;

--
-- Name: book_outlines; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.book_outlines (
    id text NOT NULL,
    project_id text NOT NULL,
    title_ideas jsonb DEFAULT '[]'::jsonb NOT NULL,
    back_cover_pitch text DEFAULT ''::text NOT NULL,
    short_synopsis text DEFAULT ''::text NOT NULL,
    long_synopsis text DEFAULT ''::text NOT NULL,
    table_of_contents jsonb DEFAULT '[]'::jsonb NOT NULL,
    structure text DEFAULT ''::text NOT NULL,
    narrative_voice text DEFAULT ''::text NOT NULL,
    opening_line text DEFAULT ''::text NOT NULL,
    closing_line text DEFAULT ''::text NOT NULL,
    chapters jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.book_outlines OWNER TO matrice;

--
-- Name: characters; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.characters (
    id text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    nature text,
    external_objective text,
    inner_need text,
    wound text,
    fear text,
    secret text,
    contradiction text,
    transformation_arc text,
    visual_identity text,
    voice_style text,
    link_to_conflict text,
    backstory text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.characters OWNER TO matrice;

--
-- Name: cinema_knowledge; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.cinema_knowledge (
    id text NOT NULL,
    country text NOT NULL,
    region text DEFAULT ''::text NOT NULL,
    era text NOT NULL,
    movement text DEFAULT ''::text NOT NULL,
    director text DEFAULT ''::text NOT NULL,
    films jsonb DEFAULT '[]'::jsonb NOT NULL,
    techniques jsonb DEFAULT '[]'::jsonb NOT NULL,
    cultural_context text DEFAULT ''::text NOT NULL,
    narrative_signatures text DEFAULT ''::text NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cinema_knowledge OWNER TO matrice;

--
-- Name: cinq_piliers; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.cinq_piliers (
    id text NOT NULL,
    project_id text NOT NULL,
    pillars jsonb DEFAULT '[]'::jsonb NOT NULL,
    dominant_pillar text DEFAULT ''::text NOT NULL,
    weakest_pillar text DEFAULT ''::text NOT NULL,
    global_balance text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cinq_piliers OWNER TO matrice;

--
-- Name: content_versions; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.content_versions (
    id text NOT NULL,
    project_id text NOT NULL,
    content_type text NOT NULL,
    content_key text DEFAULT 'full'::text NOT NULL,
    label text NOT NULL,
    data jsonb NOT NULL,
    word_count integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_versions OWNER TO matrice;

--
-- Name: creative_memory_entries; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.creative_memory_entries (
    id text NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    priority integer DEFAULT 50 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.creative_memory_entries OWNER TO matrice;

--
-- Name: echo_temps; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.echo_temps (
    id text NOT NULL,
    project_id text NOT NULL,
    mythic_resonances jsonb DEFAULT '[]'::jsonb NOT NULL,
    historical_parallels jsonb DEFAULT '[]'::jsonb NOT NULL,
    cultural_echoes jsonb DEFAULT '[]'::jsonb NOT NULL,
    temporal_anchor text DEFAULT ''::text NOT NULL,
    universal_wound text DEFAULT ''::text NOT NULL,
    future_resonance text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.echo_temps OWNER TO matrice;

--
-- Name: emotional_cores; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.emotional_cores (
    id text NOT NULL,
    project_id text NOT NULL,
    dominant_emotion text DEFAULT ''::text NOT NULL,
    hidden_wound text DEFAULT ''::text NOT NULL,
    emotional_lack text DEFAULT ''::text NOT NULL,
    inner_child_signal text DEFAULT ''::text NOT NULL,
    protection_mask text DEFAULT ''::text NOT NULL,
    apparent_desire text DEFAULT ''::text NOT NULL,
    deep_need text DEFAULT ''::text NOT NULL,
    central_fear text DEFAULT ''::text NOT NULL,
    shame_point text DEFAULT ''::text NOT NULL,
    guilty_point text DEFAULT ''::text NOT NULL,
    symbolic_object text DEFAULT ''::text NOT NULL,
    symbolic_place text DEFAULT ''::text NOT NULL,
    emotional_antagonist text DEFAULT ''::text NOT NULL,
    emotional_contradiction text DEFAULT ''::text NOT NULL,
    correction_path text DEFAULT ''::text NOT NULL,
    transformation_arc text DEFAULT ''::text NOT NULL,
    final_emotional_state text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emotional_cores OWNER TO matrice;

--
-- Name: emotional_paths; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.emotional_paths (
    id text NOT NULL,
    project_id text NOT NULL,
    stages jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emotional_paths OWNER TO matrice;

--
-- Name: experimental_modules; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.experimental_modules (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    minimum_plan text DEFAULT 'studio'::text NOT NULL,
    is_owner_only boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.experimental_modules OWNER TO matrice;

--
-- Name: film_data; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.film_data (
    id text NOT NULL,
    project_id text NOT NULL,
    concept text DEFAULT ''::text NOT NULL,
    logline text DEFAULT ''::text NOT NULL,
    tagline text DEFAULT ''::text NOT NULL,
    short_synopsis text DEFAULT ''::text NOT NULL,
    long_synopsis text DEFAULT ''::text NOT NULL,
    treatment text DEFAULT ''::text NOT NULL,
    target_duration text DEFAULT ''::text NOT NULL,
    film_format text DEFAULT ''::text NOT NULL,
    visual_promise text DEFAULT ''::text NOT NULL,
    emotional_promise text DEFAULT ''::text NOT NULL,
    dramatic_question text DEFAULT ''::text NOT NULL,
    central_image text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.film_data OWNER TO matrice;

--
-- Name: film_scenes; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.film_scenes (
    id text NOT NULL,
    project_id text NOT NULL,
    scene_number integer DEFAULT 1 NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    int_ext text DEFAULT 'INT.'::text NOT NULL,
    location text DEFAULT ''::text NOT NULL,
    time_of_day text DEFAULT ''::text NOT NULL,
    characters_present jsonb DEFAULT '[]'::jsonb NOT NULL,
    protagonist_objective text DEFAULT ''::text NOT NULL,
    obstacle text DEFAULT ''::text NOT NULL,
    visible_conflict text DEFAULT ''::text NOT NULL,
    emotional_subtext text DEFAULT ''::text NOT NULL,
    opening_beat text DEFAULT ''::text NOT NULL,
    dramatic_turn text DEFAULT ''::text NOT NULL,
    closing_beat text DEFAULT ''::text NOT NULL,
    emotion_before text DEFAULT ''::text NOT NULL,
    emotion_after text DEFAULT ''::text NOT NULL,
    strong_image text DEFAULT ''::text NOT NULL,
    sound_or_silence text DEFAULT ''::text NOT NULL,
    symbolic_object text DEFAULT ''::text NOT NULL,
    action_description text DEFAULT ''::text NOT NULL,
    dialogue_fragment text DEFAULT ''::text NOT NULL,
    narrative_function text DEFAULT ''::text NOT NULL,
    suspense_level real DEFAULT 0 NOT NULL,
    humour_level real DEFAULT 0 NOT NULL,
    emotional_power_level real DEFAULT 0 NOT NULL,
    attractiveness_level real DEFAULT 0 NOT NULL,
    hpsa_check jsonb DEFAULT '{}'::jsonb NOT NULL,
    link_to_emotional_core text DEFAULT ''::text NOT NULL,
    director_note text DEFAULT ''::text NOT NULL,
    camera_suggestion text DEFAULT ''::text NOT NULL,
    risk_of_cliche text DEFAULT ''::text NOT NULL,
    original_alternative text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.film_scenes OWNER TO matrice;

--
-- Name: hpsa_scores; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.hpsa_scores (
    id text NOT NULL,
    project_id text NOT NULL,
    humour jsonb DEFAULT '{"score": 0, "diagnostic": "", "weaknesses": [], "corrections": []}'::jsonb NOT NULL,
    pleur jsonb DEFAULT '{"score": 0, "diagnostic": "", "weaknesses": [], "corrections": []}'::jsonb NOT NULL,
    suspense jsonb DEFAULT '{"score": 0, "diagnostic": "", "weaknesses": [], "corrections": []}'::jsonb NOT NULL,
    attractivite jsonb DEFAULT '{"score": 0, "diagnostic": "", "weaknesses": [], "corrections": []}'::jsonb NOT NULL,
    global_score real DEFAULT 0 NOT NULL,
    priority_fixes jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hpsa_scores OWNER TO matrice;

--
-- Name: knowledge_dossiers; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.knowledge_dossiers (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    category text NOT NULL,
    cover_insight text DEFAULT ''::text NOT NULL,
    entry_ids json DEFAULT '[]'::json NOT NULL,
    skill_ids json DEFAULT '[]'::json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.knowledge_dossiers OWNER TO matrice;

--
-- Name: manuscript_analyses; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.manuscript_analyses (
    id text NOT NULL,
    title text NOT NULL,
    project_id text,
    content_excerpt text DEFAULT ''::text NOT NULL,
    word_count integer DEFAULT 0 NOT NULL,
    global_score integer DEFAULT 0 NOT NULL,
    structure_score integer DEFAULT 0 NOT NULL,
    emotion_score integer DEFAULT 0 NOT NULL,
    archetype_score integer DEFAULT 0 NOT NULL,
    originality_score integer DEFAULT 0 NOT NULL,
    coherence_score integer DEFAULT 0 NOT NULL,
    strengths json DEFAULT '[]'::json NOT NULL,
    weaknesses json DEFAULT '[]'::json NOT NULL,
    detected_archetypes json DEFAULT '[]'::json NOT NULL,
    detected_emotions json DEFAULT '[]'::json NOT NULL,
    applied_techniques json DEFAULT '[]'::json NOT NULL,
    missing_techniques json DEFAULT '[]'::json NOT NULL,
    coherence_validations json DEFAULT '[]'::json NOT NULL,
    coherence_issues json DEFAULT '[]'::json NOT NULL,
    comparable_works json DEFAULT '[]'::json NOT NULL,
    structure_analysis text DEFAULT ''::text NOT NULL,
    emotion_analysis text DEFAULT ''::text NOT NULL,
    recommendations text DEFAULT ''::text NOT NULL,
    coherence_analysis text DEFAULT ''::text NOT NULL,
    verdict text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.manuscript_analyses OWNER TO matrice;

--
-- Name: miroir_artistique; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.miroir_artistique (
    id text NOT NULL,
    project_id text NOT NULL,
    true_theme text DEFAULT ''::text NOT NULL,
    shadow_story text DEFAULT ''::text NOT NULL,
    blind_spots jsonb DEFAULT '[]'::jsonb NOT NULL,
    resonance_gaps jsonb DEFAULT '[]'::jsonb NOT NULL,
    artistic_invitations jsonb DEFAULT '[]'::jsonb NOT NULL,
    mirror_phrase text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.miroir_artistique OWNER TO matrice;

--
-- Name: narrative_matrices; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.narrative_matrices (
    id text NOT NULL,
    project_id text NOT NULL,
    central_concept text DEFAULT ''::text NOT NULL,
    logline text DEFAULT ''::text NOT NULL,
    short_pitch text DEFAULT ''::text NOT NULL,
    long_synopsis text DEFAULT ''::text NOT NULL,
    genre text DEFAULT ''::text NOT NULL,
    tone text DEFAULT ''::text NOT NULL,
    themes jsonb DEFAULT '[]'::jsonb NOT NULL,
    universe_laws jsonb DEFAULT '[]'::jsonb NOT NULL,
    temporal_rules text DEFAULT ''::text NOT NULL,
    spatial_rules text DEFAULT ''::text NOT NULL,
    visible_world text DEFAULT ''::text NOT NULL,
    invisible_forces text DEFAULT ''::text NOT NULL,
    central_conflict text DEFAULT ''::text NOT NULL,
    protagonist text DEFAULT ''::text NOT NULL,
    antagonist text DEFAULT ''::text NOT NULL,
    emotional_stakes text DEFAULT ''::text NOT NULL,
    symbolic_motifs jsonb DEFAULT '[]'::jsonb NOT NULL,
    power_objects jsonb DEFAULT '[]'::jsonb NOT NULL,
    secrets jsonb DEFAULT '[]'::jsonb NOT NULL,
    possible_endings jsonb DEFAULT '[]'::jsonb NOT NULL,
    coherence_rules jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.narrative_matrices OWNER TO matrice;

--
-- Name: narrative_skills; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.narrative_skills (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    prompt_content text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_global boolean DEFAULT true NOT NULL,
    validation_count integer DEFAULT 1 NOT NULL,
    validation_sources json DEFAULT '[]'::json NOT NULL,
    is_universal boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.narrative_skills OWNER TO matrice;

--
-- Name: note_intention; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.note_intention (
    id text NOT NULL,
    project_id text NOT NULL,
    vision text DEFAULT ''::text NOT NULL,
    parti_pris_mise_en_scene text DEFAULT ''::text NOT NULL,
    personnages_vision jsonb DEFAULT '[]'::jsonb NOT NULL,
    univers_visuel text DEFAULT ''::text NOT NULL,
    musique_et_son text DEFAULT ''::text NOT NULL,
    positionnement text DEFAULT ''::text NOT NULL,
    pourquoi_maintenant text DEFAULT ''::text NOT NULL,
    mot_final text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.note_intention OWNER TO matrice;

--
-- Name: pitch_documents; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.pitch_documents (
    id text NOT NULL,
    project_id text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    format text DEFAULT ''::text NOT NULL,
    genre text DEFAULT ''::text NOT NULL,
    target_audience text DEFAULT ''::text NOT NULL,
    comparable_references jsonb DEFAULT '[]'::jsonb NOT NULL,
    visual_direction text DEFAULT ''::text NOT NULL,
    author_note text DEFAULT ''::text NOT NULL,
    intention_note text DEFAULT ''::text NOT NULL,
    why_now text DEFAULT ''::text NOT NULL,
    characters text DEFAULT ''::text NOT NULL,
    world text DEFAULT ''::text NOT NULL,
    film_season_arc text DEFAULT ''::text NOT NULL,
    selling_points jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pitch_documents OWNER TO matrice;

--
-- Name: project_skills; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.project_skills (
    id text NOT NULL,
    project_id text NOT NULL,
    skill_id text NOT NULL,
    activated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_skills OWNER TO matrice;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.projects (
    id text NOT NULL,
    title text NOT NULL,
    raw_idea text NOT NULL,
    input_type text,
    genre text NOT NULL,
    tone text NOT NULL,
    target_format text NOT NULL,
    temporal_logic text,
    reality_level text,
    target_audience text,
    artistic_ambition text,
    visual_moods jsonb DEFAULT '[]'::jsonb NOT NULL,
    cinematic_references text DEFAULT ''::text NOT NULL,
    inspiration_sources text DEFAULT ''::text NOT NULL,
    manuscript_excerpt text DEFAULT ''::text NOT NULL,
    progression real DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_user_id text
);


ALTER TABLE public.projects OWNER TO matrice;

--
-- Name: relationships; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.relationships (
    id text NOT NULL,
    project_id text NOT NULL,
    character_a_id text,
    character_b_id text,
    character_a_name text NOT NULL,
    character_b_name text NOT NULL,
    relationship_type text NOT NULL,
    emotional_tension text,
    hidden_truth text,
    conflict text,
    evolution text,
    symbolic_meaning text
);


ALTER TABLE public.relationships OWNER TO matrice;

--
-- Name: research_data; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.research_data (
    id text NOT NULL,
    project_id text NOT NULL,
    reference_works jsonb DEFAULT '[]'::jsonb NOT NULL,
    critical_notes jsonb DEFAULT '[]'::jsonb NOT NULL,
    success_signals jsonb DEFAULT '[]'::jsonb NOT NULL,
    current_trends jsonb DEFAULT '[]'::jsonb NOT NULL,
    cliche_risks jsonb DEFAULT '[]'::jsonb NOT NULL,
    originality_opportunities jsonb DEFAULT '[]'::jsonb NOT NULL,
    creation_notes text DEFAULT ''::text NOT NULL,
    abstract_mechanics jsonb DEFAULT '[]'::jsonb NOT NULL,
    humor_patterns jsonb DEFAULT '[]'::jsonb NOT NULL,
    suspense_patterns jsonb DEFAULT '[]'::jsonb NOT NULL,
    tear_triggers jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.research_data OWNER TO matrice;

--
-- Name: research_entries; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.research_entries (
    id text NOT NULL,
    title text NOT NULL,
    research_type text DEFAULT 'standard'::text NOT NULL,
    era text DEFAULT ''::text NOT NULL,
    era_label text DEFAULT ''::text NOT NULL,
    era_start integer,
    era_end integer,
    culture text DEFAULT ''::text NOT NULL,
    culture_label text DEFAULT ''::text NOT NULL,
    culture2 text DEFAULT ''::text NOT NULL,
    culture2_label text DEFAULT ''::text NOT NULL,
    medium text DEFAULT ''::text NOT NULL,
    custom_input text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    key_techniques json DEFAULT '[]'::json NOT NULL,
    emotional_principles json DEFAULT '[]'::json NOT NULL,
    cultural_context text DEFAULT ''::text NOT NULL,
    notable_works json DEFAULT '[]'::json NOT NULL,
    narrative_lessons text DEFAULT ''::text NOT NULL,
    themes json DEFAULT '[]'::json NOT NULL,
    universal_score integer DEFAULT 0 NOT NULL,
    skills_extracted boolean DEFAULT false NOT NULL,
    extracted_skill_ids json DEFAULT '[]'::json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.research_entries OWNER TO matrice;

--
-- Name: screenplays; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.screenplays (
    id text NOT NULL,
    project_id text NOT NULL,
    logline text DEFAULT ''::text NOT NULL,
    tagline text DEFAULT ''::text NOT NULL,
    cinematic_synopsis text DEFAULT ''::text NOT NULL,
    treatment text DEFAULT ''::text NOT NULL,
    beats jsonb DEFAULT '[]'::jsonb NOT NULL,
    scenes jsonb DEFAULT '[]'::jsonb NOT NULL,
    fountain_script text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.screenplays OWNER TO matrice;

--
-- Name: sequencier; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.sequencier (
    id text NOT NULL,
    project_id text NOT NULL,
    sequences jsonb DEFAULT '[]'::jsonb NOT NULL,
    total_duree real DEFAULT 0 NOT NULL,
    structure text DEFAULT ''::text NOT NULL,
    note_globale text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sequencier OWNER TO matrice;

--
-- Name: series_data; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.series_data (
    id text NOT NULL,
    project_id text NOT NULL,
    format text DEFAULT ''::text NOT NULL,
    logline_serie text DEFAULT ''::text NOT NULL,
    season_concept text DEFAULT ''::text NOT NULL,
    series_potential text DEFAULT ''::text NOT NULL,
    long_arcs jsonb DEFAULT '[]'::jsonb NOT NULL,
    episodes jsonb DEFAULT '[]'::jsonb NOT NULL,
    progressive_revelations jsonb DEFAULT '[]'::jsonb NOT NULL,
    secondary_characters jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.series_data OWNER TO matrice;

--
-- Name: sru_scores; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.sru_scores (
    id text NOT NULL,
    project_id text NOT NULL,
    etincelle real DEFAULT 0 NOT NULL,
    etincelle_comment text DEFAULT ''::text NOT NULL,
    vibration real DEFAULT 0 NOT NULL,
    vibration_comment text DEFAULT ''::text NOT NULL,
    profondeur real DEFAULT 0 NOT NULL,
    profondeur_comment text DEFAULT ''::text NOT NULL,
    maitrise real DEFAULT 0 NOT NULL,
    maitrise_comment text DEFAULT ''::text NOT NULL,
    sru real DEFAULT 0 NOT NULL,
    traditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    synthese_globale text DEFAULT ''::text NOT NULL,
    niveau_resonance text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sru_scores OWNER TO matrice;

--
-- Name: tension_arcs; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.tension_arcs (
    id text NOT NULL,
    project_id text NOT NULL,
    acts jsonb DEFAULT '[]'::jsonb NOT NULL,
    overall_shape text DEFAULT ''::text NOT NULL,
    recommendation text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tension_arcs OWNER TO matrice;

--
-- Name: world_data; Type: TABLE; Schema: public; Owner: matrice
--

CREATE TABLE public.world_data (
    id text NOT NULL,
    project_id text NOT NULL,
    locations jsonb DEFAULT '[]'::jsonb NOT NULL,
    atmospheres jsonb DEFAULT '[]'::jsonb NOT NULL,
    temporal_rules text DEFAULT ''::text NOT NULL,
    timeline_events jsonb DEFAULT '[]'::jsonb NOT NULL,
    parallel_timelines jsonb DEFAULT '[]'::jsonb NOT NULL,
    dream_layers jsonb DEFAULT '[]'::jsonb NOT NULL,
    forbidden_rules jsonb DEFAULT '[]'::jsonb NOT NULL,
    cause_effect_logic text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.world_data OWNER TO matrice;

--
-- Data for Name: ai_skills; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.ai_skills (id, name, category, description, content, is_active, priority, injection_contexts, usage_count, created_at, updated_at) FROM stdin;
3bb05c46-8a1c-4544-822c-a971ae0a4103	Plan-séquence et respiration narrative	technique-narrative	L'art du plan long qui force la présence et l'intensité	Le plan-séquence n'est pas un exploit technique — c'est une décision narrative. Kubrick dans "Shining", Welles dans "Citizen Kane", Iñárritu dans "Birdman" : le plan long impose une présence irréfutable à la scène. En littérature, cela se traduit par la phrase-fleuve qui ne lâche pas le lecteur, le paragraphe sans respiration qui mime l'angoisse ou l'extase. Techniques à intégrer : 1) Une seule coupe = une seule pause de souffle pour le lecteur. 2) Le temps réel crée plus de tension que l'ellipse dans les scènes de confrontation. 3) L'espace devient personnage quand la caméra — ou la prose — ne le quitte pas.	t	85	["scenario", "roman", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
1b816155-4eb5-436d-b583-aa843b50c722	Ellipse temporelle et montage mental	technique-narrative	Ce qu'on ne montre pas est souvent plus puissant que ce qu'on montre	Godard, Resnais, Kubrick ont enseigné que l'ellipse n'est pas une omission mais une invitation : le spectateur/lecteur complète lui-même le saut, et ce qu'il imagine est toujours plus fort que ce qu'on lui montre. Techniques clés : 1) Sauter par-dessus la scène attendue — atterrir après les conséquences. 2) Le flash-back fragmenté (Resnais dans "Hiroshima mon amour") où passé et présent ne se distinguent que progressivement. 3) L'ellipse émotionnelle : on coupe juste avant la larme, l'aveu, le cri — le silence après vaut plus que le moment lui-même.	t	90	["scenario", "roman", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
a2f920e5-ae94-4f2a-8594-2074f791d08a	Montage dialectique et collision des idées	technique-narrative	La juxtaposition crée une idée troisième, absente des deux originales	Eisenstein a théorisé ce que tout grand auteur pratique intuitivement : juxtaposer deux images, deux scènes, deux moments crée une signification nouvelle absente de chacun. Le champ-contrechamp n'est pas symétrique — c'est une confrontation de deux vérités. Techniques : 1) La scène de joie montée contre une scène de deuil crée l'ironie tragique. 2) L'objet insignifiant filmé après un moment intense devient symbole. 3) En prose : alterner deux voix narratives opposées crée une troisième lecture. 4) Le montage parallèle de Griffith — deux actions simultanées — génère une tension que la linéarité ne peut pas produire.	t	88	["scenario", "roman", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
5a37ad8e-da8e-480e-8923-a2aadc0f5f45	Corps comme langage — la performance intérieure	technique-narrative	L'émotion passe par le corps avant les mots	Cassavetes, Fassbinder, les frères Dardenne : leurs acteurs ne jouent pas un texte, ils habitent une vérité physique. En écriture, cela se traduit par : les personnages qui parlent avec leurs corps avant leurs mots. Techniques : 1) Décrire d'abord le geste, puis la pensée qui y a conduit — jamais l'inverse. 2) La tension entre ce que le corps fait et ce que le personnage dit est la définition dramatique du sous-texte. 3) Un personnage qui ne pleure pas mais dont les mains tremblent est plus bouleversant qu'un personnage qui sanglote. 4) L'espace entre deux corps — distance physique — dit tout sur leur relation émotionnelle.	t	87	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
ca476f0e-a7dc-4193-bda1-f223480196c1	Silence et ma construction du vide	technique-narrative	Ozu, Bergman, Kiarostami : le silence est une parole	Ozu ne remplit jamais un plan — il laisse des espaces. Bergman fait durer le silence après la réplique décisive. Kiarostami filme les routes vides plus longtemps que nécessaire. Ce vide n'est pas une absence : c'est la résonance de ce qui vient d'être dit ou fait. En écriture : 1) Le paragraphe court après le long crée un silence visuel sur la page. 2) La répétition du même mot à intervalle régulier bat comme un cœur — ou une obsession. 3) La scène d'un personnage seul, sans dialogue, sans action, révèle plus que toute confrontation. 4) Résistez à l'envie d'expliquer : si l'émotion est là, le lecteur l'a déjà sentie avant vos mots.	t	82	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
b5dbdae1-7d07-4fd9-a5ce-7103c486acb7	Narration fragmentée et vérité reconstituée	technique-narrative	Tarantino, Nolan, Almodóvar : l'ordre chronologique est un choix, pas une obligation	La narration non-linéaire n'est pas un artifice : c'est un choix qui dit quelque chose sur la façon dont les personnages — et les humains en général — vivent le temps. Tarantino place la fin au début pour montrer que le "comment" importe plus que le "quoi". Nolan fragmente la mémoire parce que la mémoire elle-même est fragmentée. Techniques : 1) Commencer in medias res — au cœur de l'action — puis remonter. 2) L'analepse (flash-back) ne doit jamais expliquer, elle doit transformer la lecture de ce qu'on a déjà vu. 3) La prolepse (flash-forward) crée une tension irréversible — on sait que quelque chose va arriver, pas comment. 4) Chaque fragment doit être autonome narrativement ET dépendant émotionnellement.	t	83	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
f14092d3-be4f-4971-b1f1-38e685d35d77	Le regard subjectif — Tarkovsky et la perception intérieure	technique-narrative	Rendre visible ce que le personnage ressent, pas ce qu'il voit	Tarkovsky ne filme pas la réalité : il filme la perception intérieure d'une réalité. Dans "Stalker", l'espace change de couleur selon l'état émotionnel. Dans "Le Miroir", passé et présent coexistent dans le même plan. En écriture, le regard subjectif signifie : 1) Les descriptions qui révèlent l'état du personnage plus que l'objet décrit. 2) La même scène racontée deux fois par deux personnages différents donne deux vérités incompatibles, toutes deux vraies. 3) La conscience du narrateur contamine la langue elle-même — un personnage anxieux décrit le monde avec des mots d'anxiété. 4) L'hallucination, le rêve, le souvenir déformé sont aussi réels narrativement que le présent.	t	86	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
1fc94a34-07c3-4c29-9d40-dfff2b236020	Réalisme magique — le merveilleux ancré dans le quotidien	technique-narrative	García Márquez, Buñuel, Apichatpong : le surnaturel comme évidence	Le réalisme magique ne justifie jamais le miracle — il l'accepte comme fait. Dans "Cent ans de solitude", des femmes montent au ciel avec leur linge — les villageois regardent sans s'étonner. C'est l'absence de surprise qui produit l'effet. Techniques : 1) Présenter l'élément impossible au même niveau de réalité que l'élément banal — même syntaxe, même ton. 2) L'étrangeté doit avoir des règles internes cohérentes. 3) L'ancrage culturel est essentiel : le magique émerge d'une réalité sociale très précise. 4) Les personnages qui ne s'étonnent pas du merveilleux forcent le lecteur à s'interroger sur ses propres catégories de réel. 5) Utilisé pour parler de traumatismes collectifs (guerre, colonisation) qui résistent à la narration réaliste.	t	84	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
6fc9af8d-e69a-4cbb-86e9-7d11ea7b2e1c	Héritage de la Nouvelle Vague française	histoire-cinema	Godard, Truffaut, Varda : la caméra comme stylo	La Nouvelle Vague (1958-1968) a inventé l'auteur au cinéma. Principes fondateurs toujours pertinents : 1) La caméra-stylo (Astruc) — le réalisateur écrit avec sa caméra comme le romancier avec sa plume. 2) Rejeter le "cinéma de papa" — les conventions narratives peuvent et doivent être brisées quand elles deviennent des mensonges. 3) Godard : rupture du 4e mur, jump cut, personnages qui commentent leur propre situation. 4) Truffaut : l'autofiction comme matière première, l'enfance comme blessure structurante. 5) Varda : la forme documentaire infuse la fiction, le réel déborde. 6) Rohmer : la parole comme action dramatique — ce que les personnages disent révèle ce qu'ils ne comprennent pas d'eux-mêmes.	t	80	["scenario", "roman", "pitch", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
a34d4aad-3bbe-4563-845d-9ca476962498	Cinéma coréen contemporain — tension sociale et violence refoulée	histoire-cinema	Bong Joon-ho, Park Chan-wook, Lee Chang-dong : la Corée comme miroir du monde	Le cinéma coréen des années 1990-2020 est le plus pertinent du monde pour explorer les inégalités, la violence systémique, et la culpabilité collective. Caractéristiques narratives : 1) Bong Joon-ho ("Parasite", "Memories of Murder") : le genre comme véhicule de critique sociale radicale. Le thriller, l'horreur, la comédie noire — chaque genre peut contenir une analyse marxiste. 2) Park Chan-wook ("Oldboy", "La Servante") : la vengeance comme labyrinthe moral où le vengeur devient ce qu'il hait. 3) Lee Chang-dong ("Oasis", "Burning") : le réalisme social poussé jusqu'à l'irrémédiable, les personnages qui ne peuvent pas échapper à leur classe. 4) Principe commun : la violence naît des structures sociales, pas de la nature humaine. 5) L'espace fermé (la maison, la cave, l'appartement) comme métaphore de l'enfermement de classe.	t	79	["scenario", "roman", "pitch", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
c436a57f-6b54-4dc0-be0f-84fbdfe46c26	Cinéma iranien — poésie et contrainte	histoire-cinema	Kiarostami, Farhadi, Panahi : dire le monde par métaphore	Le cinéma iranien post-révolutionnaire a développé, sous contrainte de censure, un langage d'une richesse formelle exceptionnelle. Leçons pour tout auteur : 1) Kiarostami ("Le Vent nous emportera", "Close-Up") : le doute sur la réalité de ce qu'on voit est une position narrative, pas un défaut. Les routes vides, les détours, sont la pensée elle-même. 2) Farhadi ("Une séparation", "Le Client") : la tragédie naît de personnages tous moralement cohérents dans leur propre logique — il n'y a pas de méchant, seulement des vérités incompatibles. 3) Panahi : filmer l'impossibilité de filmer devient le sujet du film. 4) La contrainte formelle comme générateur de créativité — ne pas pouvoir montrer force à inventer des formes nouvelles. 5) L'enfant comme porteur de la vérité que les adultes refusent de voir.	t	78	["scenario", "roman", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
b64dc2ef-0b00-4400-8178-5aa1b87e78a6	Néoréalisme italien — la dignité du quotidien	histoire-cinema	Rossellini, De Sica, Visconti : filmer la réalité pour changer le monde	Le néoréalisme (1945-1952) est né des décombres — littéralement. Leçons fondamentales : 1) De Sica ("Voleur de bicyclette") : la dignité d'un homme se mesure à la plus petite de ses possessions. Un objet ordinaire peut porter la tragédie d'une civilisation. 2) Rossellini ("Rome ville ouverte") : tourner dans les décombres réels parce que les studios sont des mensonges. La réalité physique du lieu infuse la fiction d'une vérité inaccessible autrement. 3) Visconti : le néoréalisme peut être aristocratique et tragique — il n'est pas réservé aux pauvres. 4) Acteurs non professionnels pour leur vérité physique, leur présence non-performative. 5) L'histoire collective (la guerre, l'occupation, la pauvreté) vécue à travers les gestes quotidiens des personnages.	t	77	["scenario", "roman", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
25e99f43-d914-4129-966b-05b551e2742c	Montage soviétique — construire le sens par collision	histoire-cinema	Eisenstein, Vertov, Poudovkine : le montage comme idéologie	Le montage soviétique (1920-1934) reste la théorie narrative la plus radicale jamais développée. Concepts opérationnels : 1) Eisenstein — montage attractionnel : chaque image doit "frapper" le spectateur comme un ring en boxe. La juxtaposition crée une signification nouvelle absente des deux images. 2) Vertov ("L'Homme à la caméra") : le montage peut organiser le temps, l'espace, la conscience — simultanément. 3) L'escalier d'Odessa dans "Le Cuirassé Potemkine" : le découpage rallonge le temps réel — 4 minutes filmées en 6 minutes — pour maximiser l'impact émotionnel. 4) Poudovkine : le montage de construction (assembler pour créer une continuité) vs. montage de collision d'Eisenstein. 5) Chaque scène de confrontation, de révolution, de foule peut s'inspirer de ces principes de montage.	t	76	["scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
26c0dff7-4a96-4b60-a786-1ce188f01131	L'antagoniste comme miroir — la philosophie du méchant	structure-dramatique	Le meilleur antagoniste est celui qui a raison	L'antagoniste révèle ce que le protagoniste refuse de voir en lui-même. Principes : 1) Thanos dans "Infinity War" est plus cohérent que les héros — c'est ce qui le rend terrifying. L'antagoniste doit avoir une logique interne irréfutable. 2) "No Country for Old Men" (Cormac McCarthy/Coen Brothers) : Anton Chigurh n'est pas méchant, il est une force cosmique — ni la fuir ni le combattre, seulement accepter. 3) Le meilleur antagoniste ne veut pas détruire le protagoniste — il veut le convaincre. 4) Dialectique nécessaire : si l'antagoniste a complètement tort, le protagoniste n'a rien à apprendre. La vraie tension naît quand l'antagoniste a au moins 30% raison. 5) L'antagoniste intérieur (la part sombre du protagoniste) est souvent plus puissant que l'antagoniste extérieur.	t	89	["roman", "scenario", "pitch", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
d99c7d1a-45b1-47bd-91fc-fabc6e7c54c8	L'espace comme personnage — la géographie intérieure	structure-dramatique	Chaque lieu doit avoir une psychologie	Dans "Le Parrain", la Sicile est une autre époque. Dans "Blade Runner", Los Angeles 2019 est une dépression. Dans "Parasite", les deux maisons sont deux classes sociales matérialisées. L'espace narratif : 1) Chaque lieu dans une histoire doit avoir une règle émotionnelle : ce qu'il permet, ce qu'il interdit, ce qu'il révèle. 2) La transition entre deux espaces = transition psychologique. Un personnage qui traverse le seuil est un personnage qui change. 3) L'espace peut mentir : la maison belle qui cache la violence, la ville grise qui cache la tendresse. 4) La verticalité (escaliers, sous-sols, penthouses) est la métaphore sociale universelle. 5) L'espace fermé contre l'espace ouvert comme tension narrative : l'enfermement vs. la fuite. 6) Construire la carte spatiale du récit avant d'écrire — chaque lieu doit avoir son atmosphère irréductible.	t	85	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
7c236aa0-e477-4a53-8ad2-670aba6b8000	L'autofiction comme universalité — le je qui atteint le nous	style-auteur	Proust, Truffaut, Varda, Bergman : le particulier comme universel	Le paradoxe de l'autofiction : plus on est précis dans le particulier de sa propre expérience, plus on touche à l'universel. Truffaut confesse son enfance difficile dans "Les 400 Coups" — et des millions d'enfants du monde entier s'y reconnaissent. Techniques : 1) Le détail biographique exact, inavouable, honteux — c'est lui qui touche, pas le détail "littéraire". 2) Ne pas chercher à être universel : chercher à être précis. L'universalité est un sous-produit de la précision. 3) Bergman dans "Scènes de la vie conjugale" : filmer ses propres démons relationnels sans se protéger. Le courage de l'exposition. 4) Annie Ernaux : l'écriture de soi comme archéologie sociale — la honte de classe, le désir, la perte. 5) Le "je" de l'autofiction n'est pas narcissique : il est un instrument d'observation du monde.	t	82	["roman", "pitch", "note-intention", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
161f822b-234d-45a7-b811-cc368c48b9a9	La signature visuelle — développer un style reconnaissable	style-auteur	Wong Kar-wai, Kubrick, Almodovar : l'esthétique comme éthique	Un style n'est pas décoratif — c'est une position éthique matérialisée. Wong Kar-wai : le flou, la ralentie, les couleurs saturées disent que le temps et la mémoire sont irréels, que le désir ne trouve jamais son objet. Kubrick : la symétrie parfaite dit que l'univers est mathématiquement indifférent à la souffrance humaine. Almodovar : le kitsch assume sa provenance populaire et fait de la vulgarité une aristocratie. Construire sa signature : 1) Identifier une tension formelle récurrente (rapide/lent, couleur/noir et blanc, voix off/silence). 2) Cette tension doit correspondre à une tension thématique centrale dans votre travail. 3) La contrainte stylistique que vous vous imposez vous force à trouver des solutions narratives nouvelles. 4) Le style doit servir l'histoire — mais parfois, le style EST l'histoire.	t	80	["scenario", "roman", "note-intention", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
219153ea-2c84-44fe-8fea-cbf461fbe5b3	Cinéma africain — la mémoire collective et la parole	culture-regionale	Sembène, Sissako, Mambéty : l'Afrique qui se raconte elle-même	Ousmane Sembène a créé le cinéma africain comme acte politique : raconter l'Afrique en langues africaines, depuis les perspectives africaines. Leçons fondamentales : 1) Sembène ("Xala", "Mooladé") : la satire politique comme arme — le colonisé qui retourne les outils du colonisateur. 2) Abderrahmane Sissako ("Timbuktu", "Bamako") : le temps africain dans le récit — le présent peut coexister avec des siècles de passé sans hiérarchie. 3) Djibril Diop Mambéty ("Touki Bouki") : formalisme radical, mythologie yoruba et modernité urbaine — les temporalités ne sont pas linéaires. 4) La tradition orale (griots) comme modèle narratif : le conteur est visible, il interpelle, il juge, il rit. 5) La communauté comme protagoniste collectif — contre l'individualisme du héros occidental.	t	74	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
cbbbedc4-b242-45e4-ab00-12c56b5e6b89	Cinema Novo brésilien — la faim comme esthétique	culture-regionale	Glauber Rocha, Nelson Pereira dos Santos : une esthétique de la faim	Glauber Rocha a formulé l'esthétique du Cinema Novo brésilien (1960-1970) : "une idée dans la tête et une caméra dans la main". La pauvreté des moyens devient force expressive. Concepts clés : 1) L'esthétique de la faim — les conditions matérielles de production (pas d'argent, pas d'équipement professionnel) génèrent une esthétique de la nécessité qui dit la réalité sociale mieux que tout studio. 2) Le sertão nordestino (l'arrière-pays sec et pauvre) comme espace mythologique — la sécheresse, la violence, la mystique religieuse, le cangaçeiro. 3) Mélange de documentaire et de fiction, de réalisme et de baroque tropical. 4) La violence révolutionnaire comme réponse à la violence coloniale — position morale assumée. 5) Héritage contemporain : "Cidade de Deus" (Meirelles) comme descendant direct.	t	73	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
bb086439-c4b9-427a-bfd7-e02b8b9d3070	Cinéma japonais classique — le temps et l'impermanence	culture-regionale	Ozu, Kurosawa, Mizoguchi : trois façons d'être japonais	Le cinéma japonais classique offre trois approches narratives fondamentalement différentes : 1) Ozu (mono no aware — la mélancolie des choses) : les pillow shots (plans de vases, de murs, de ciel) ne sont pas des transitions — ce sont des respirations, des moments de contemplation de l'impermanence. La caméra basse, au niveau du tapis, dit que les personnages sont ancrés dans leur condition. 2) Kurosawa : la violence comme test moral — le guerrier face à lui-même. La pluie dans les scènes de combat n'est pas réaliste, elle est émotionnelle. La multicaméra et le téléobjectif compressent l'espace et augmentent la tension. 3) Mizoguchi : le plan-séquence qui suit les femmes à distance — témoin sans jugement d'un destin social inévitable. La tragédie des femmes sous le patriarcat japonais comme tragédie humaine universelle.	t	78	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
70a2669a-8626-4868-8142-b42621c6c67e	Nouveau cinéma roumain — l'attente comme dramaturgie	culture-regionale	Mungiu, Puiu, Porumboiu : l'ennui bureaucratique comme tragédie	Le Nouveau Cinéma Roumain (2000-2015) est l'un des mouvements les plus originaux de l'histoire du cinéma. Caractéristiques : 1) Cristian Puiu ("La Mort de Dante Lazarescu") : le temps réel, sans musique, sans montage dramatique — la mort d'un homme baladé d'hôpital en hôpital dure 2h30 en temps quasi-réel. L'ennui du spectateur EST le sujet. 2) Cristian Mungiu ("4 mois, 3 semaines, 2 jours") : huis clos d'une journée, une seule décision impossible, aucun manichéisme. 3) Corneliu Porumboiu ("Police, adjective") : un film sur un mot du dictionnaire. Le langage bureaucratique comme cage. 4) Principes communs : refus du montage expressif, plans longs, acteurs non professionnels, absence de musique extra-diégétique, refus du happy ending. 5) La bureaucratie héritée du communisme comme personnage central invisible.	t	75	["roman", "scenario", "all"]	0	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
8e128753-887a-4e8d-b4af-f55049a2a325	Format Fountain et standards scénario professionnel	standards-pro	Les conventions du scénario professionnel en France et à l'international	Le format Fountain est le standard open-source du scénario numérique. Règles : 1) INT./EXT. + LIEU + MOMENT (JOUR/NUIT/AUBE/CRÉPUSCULE) — toujours en majuscules. 2) Le nom des personnages centré, en majuscules, avant chaque réplique. 3) Les actions en minuscules, au présent, à la voix active — pas "la porte fut ouverte" mais "Paul ouvre la porte". 4) Une page Fountain ≈ une minute de film — référence pour estimer la durée. 5) Les parenthèses (instructions de jeu) doivent être rares — les meilleures répliques contiennent leur propre direction. 6) TRANSITION (FONDU ENCHAÎNÉ, COUPE) : utilisé avec parcimonie, seulement quand ça ajoute un sens narratif. 7) Convention française : les répliques peuvent être plus longues qu'en Hollywood — la tradition du "film parlant" français assume la parole comme acte dramatique.	t	93	["scenario", "all"]	15	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
446a50bf-a2ab-4c19-a9f2-15afbc08c8fc	Standards professionnels français — CNC et SACD	standards-pro	Ce que les comités de sélection français attendent réellement	Pour qu'un projet soit finançable par le CNC (Centre National du Cinéma) ou soutenu par la SACD : 1) L'originalité de la voix auteur doit être identifiable dès le synopsis — pas l'originalité du concept mais du regard. 2) L'ancrage social ou psychologique doit être précis et documenté — le CNC finance des œuvres qui parlent de réalités françaises ou de l'universel par le particulier français. 3) Le format de la note d'intention : 1) La genèse personnelle du projet (pourquoi vous, pourquoi maintenant), 2) La forme choisie et pourquoi elle est la seule possible, 3) Les références cinématographiques assumées (pas de honte à citer ses influences). 4) L'avance sur recettes CNC : œuvre de qualité + potentiel commercial (pas opposés). 5) SACD : droits d'auteur, importance de l'inscription des œuvres, cahier des charges des séries TV françaises.	t	92	["pitch", "note-intention", "all"]	15	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
47915e1f-8356-4306-bbf6-74d43ba37e78	La structure des trois actes réinventée	structure-dramatique	Au-delà du schéma McKee : les variations culturelles de la structure dramatique	La structure en trois actes est une moyenne, pas une loi. Variations essentielles : 1) Structure coréenne/asiatique — le 4e acte (han) : après la résolution apparente, une dernière vague émotionnelle qui ne résout rien mais accepte. 2) Structure iranienne — le dispositif : mettre en scène la mise en scène, interroger la frontière fiction/réel. 3) Structure européenne d'art — l'anti-climax volontaire : le point culminant est délibérément évité, ce qui génère une tension permanente. 4) Structure documentaire dans la fiction (Dogme 95) : la caméra qui tremble dit "je suis là" et rompt l'illusion. 5) La structure en spirale (Lynch) : retourner toujours au même point mais à un niveau de profondeur différent. 6) Principes universels malgré tout : le désir du protagoniste, un obstacle, une transformation — même si leur forme varie.	t	91	["roman", "scenario", "pitch", "all"]	15	2026-05-05 07:28:15.455336	2026-05-05 07:28:15.455336
\.


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.app_users (id, email, password_hash, display_name, role, plan, status, stripe_customer_id, stripe_subscription_id, generations_used, projects_created, is_email_verified, created_at, updated_at, email_verification_token, email_verification_sent_at, password_reset_token, password_reset_expires_at, onboarding_completed_at) FROM stdin;
fcf0cc13-b38b-4358-98ca-05fc133710db	adel.bm@hotmail.fr	e79f7ced1a2150882b34664273b2ac24:ff133557675aba1c31979847e627fb6dcb9b555a9e25019bb89446f09d466fd0028ac41f8e1a44b5f53ea2fcf4086f2c3abf8e4ec0e510ac0868bf92e4000572	Adelbm	user	studio	active	\N	\N	0	0	f	2026-05-12 14:54:34.470337	2026-05-12 15:41:11.129	nTWHMZidoRljmMVhCQTKO25F0q5oZxAHj-QhCYqPYs4	2026-05-12 15:41:11.129	\N	\N	\N
8f1c0335-bf27-46c6-8cfa-4c398943580a	am.ad.bm@gmail.com	eb329ab441b5d73b4101e09a9ecd628d:05a93964883151211fbab7249163750beb15ea8d6d9dd18488e49ab08bf63970e071b7c2e2d42291b81e63ffa2b4dd74807ba0c5997fb8ce1034a260cf9a4d5b	BraveHeart	user	free	active	\N	\N	0	0	f	2026-05-12 15:44:07.588949	2026-05-12 15:44:07.588949	Js2WdoUSSepv8N_hpj37VeXLBAFEtaKJQ3hM3T1NhMA	2026-05-12 15:44:07.587	\N	\N	\N
\.


--
-- Data for Name: atmosphere_data; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.atmosphere_data (id, project_id, color_palette, lighting_style, music_references, cinematic_style, textures, sensory_notes, visual_references, updated_at) FROM stdin;
\.


--
-- Data for Name: book_outlines; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.book_outlines (id, project_id, title_ideas, back_cover_pitch, short_synopsis, long_synopsis, table_of_contents, structure, narrative_voice, opening_line, closing_line, chapters, updated_at) FROM stdin;
\.


--
-- Data for Name: characters; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.characters (id, project_id, name, role, nature, external_objective, inner_need, wound, fear, secret, contradiction, transformation_arc, visual_identity, voice_style, link_to_conflict, backstory, created_at) FROM stdin;
\.


--
-- Data for Name: cinema_knowledge; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.cinema_knowledge (id, country, region, era, movement, director, films, techniques, cultural_context, narrative_signatures, tags, is_active, created_at) FROM stdin;
ce600cae-022d-45fb-bc57-9023fc9f4b3f	France	Europe	1960s	Nouvelle Vague	Jean-Luc Godard	["À bout de souffle", "Alphaville", "Pierrot le fou", "Weekend", "Le Mépris"]	["Jump cut", "Rupture du 4e mur", "Improvisation dialoguée", "Tournage en décors naturels"]	Après-guerre, existentialisme, influence américaine contestée, politique et esthétique mêlées	Les personnages commentent leur propre situation, la forme questionne le fond, le politique irrompt dans l'intime	["auteur", "politique", "modernisme", "dialogue"]	t	2026-05-05 07:28:15.464547
71cdea60-3da0-437f-bff6-2311b1210039	France	Europe	1960s	Nouvelle Vague	François Truffaut	["Les 400 Coups", "Jules et Jim", "La Nuit américaine", "L'Enfant sauvage", "La Peau douce"]	["Autofiction", "Voix off mélancolique", "Personnage en fuite permanente", "Temps de l'enfance"]	Autobiographie comme matière première, cinéma comme rédemption personnelle	L'enfance blessée comme moteur narratif, les personnages pris entre leur désir et leur incapacité à y renoncer	["autofiction", "enfance", "mélancolie", "auteur"]	t	2026-05-05 07:28:15.464547
6ba42fc4-0ee0-4694-ae40-ffde4b3fb5a1	France	Europe	1970s-1990s	Cinéma d'auteur	Agnès Varda	["Cléo de 5 à 7", "Sans toit ni loi", "Les Glaneurs et la Glaneuse", "Visages Villages"]	["Hybridation documentaire-fiction", "Regard féministe", "Présence du corps vieillissant", "La glane comme méthode"]	Féminisme, marginalité choisie, regard sur ceux qu'on ne voit pas	Le détour documentaire révèle plus que la ligne directe, les invisibles comme protagonistes	["féminisme", "documentaire", "marginalité", "humanisme"]	t	2026-05-05 07:28:15.464547
7c8cb53b-cf59-4c34-bc6d-26db774cab43	France	Europe	1960s-1980s	Cinéma politique	Chris Marker	["La Jetée", "Sans Soleil", "Le Fond de l'air est rouge", "Cuba si !"]	["Photo-roman", "Voix off mélancolique", "Temps circulaire", "Essai filmique"]	Militantisme de gauche, mémoire collective, contre-histoire	La mémoire comme reconstruction, l'essai comme forme narrative à part entière	["mémoire", "politique", "essai", "temps"]	t	2026-05-05 07:28:15.464547
19170741-fcf9-4c97-87a3-f5b2d9faeb05	Italie	Europe	1945-1952	Néoréalisme	Vittorio De Sica	["Voleur de bicyclette", "Umberto D.", "Miracle à Milan", "Shoeshine"]	["Acteurs non professionnels", "Décors réels", "Temps réel des actions", "Lumière naturelle"]	Italie détruite par la guerre, pauvreté urbaine, dignité humaine sous pression économique	La tragédie dans l'objet quotidien, la dignité de l'homme ordinaire face au système	["pauvreté", "dignité", "réalisme", "humanisme"]	t	2026-05-05 07:28:15.464547
d5bcddf2-3101-413b-b81d-9b2e90890ec5	Italie	Europe	1960s-1970s	Cinéma d'auteur	Federico Fellini	["8½", "La Dolce Vita", "Amarcord", "Satyricon", "La Strada"]	["Rêve et réalité indistincts", "Autofiction baroque", "Cirque de l'existence", "Mémoire mythifiée"]	Italie de l'après-guerre, miracle économique, nostalgie de la province, catholicisme baroque	La mémoire qui se transforme en mythe, l'artiste face au vide créatif	["autofiction", "baroque", "mémoire", "artiste"]	t	2026-05-05 07:28:15.464547
86dfd7fc-9fa3-45cb-9ca3-770d63ad7879	Italie	Europe	1960s-1970s	Cinéma politique	Pier Paolo Pasolini	["Accattone", "Mamma Roma", "Théorème", "Salò", "L'Évangile selon Matthieu"]	["Mythologie dans le contemporain", "Corps comme sacré/profane", "Marxisme et religion", "Sous-prolétariat urbain"]	Italie du miracle économique vu depuis les faubourgs, christianisme hérétique, homosexualité militante	Le sacré dans le quotidien le plus banal, la bourgeoisie comme force de mort	["politique", "corps", "religion", "marxisme"]	t	2026-05-05 07:28:15.464547
f98cf553-425b-43ef-bc77-4bfa34f6c571	Japon	Asie	1950s-1960s	Âge d'or du cinéma japonais	Akira Kurosawa	["Rashōmon", "Les Sept Samouraïs", "Ikiru", "Yojimbo", "Ran"]	["Multicaméra", "Téléobjectif compressant l'espace", "Pluie dramatique", "Géométrie des groupes"]	Japon de l'après-guerre, crise du code bushido, modernité vs tradition, honte collective	La vérité subjective de chaque témoin (Rashōmon), le samouraï comme figure du sacrifice inutile mais nécessaire	["honneur", "vérité subjective", "sacrifice", "groupe"]	t	2026-05-05 07:28:15.464547
5edfb4f4-3ef9-47b4-b07a-6dab9f9b071a	Japon	Asie	1930s-1960s	Cinéma contempltatif	Yasujirō Ozu	["Voyage à Tokyo", "Printemps tardif", "Il était un père", "Bonjour", "Fin d'automne"]	["Caméra basse (niveau tatami)", "Pillow shots", "Pas de fondu-enchaîné", "Ellipse entre deux scènes"]	Famille japonaise en mutation, conflit générations, modernisation douloureuse, mono no aware	Les fins qui ne résolvent rien mais acceptent, la beauté mélancolique de ce qui passe	["impermanence", "famille", "mélancolie", "contemplation"]	t	2026-05-05 07:28:15.464547
7b382efb-9b0d-4986-8904-b1a7ccea78be	Japon	Asie	1980s-2000s	Cinéma contemporain	Hirokazu Kore-eda	["Nobody Knows", "Tel père, tel fils", "Une affaire de famille", "Notre petite sœur", "Broker"]	["Enfants comme révélateurs du monde adulte", "Économie de moyens expressifs", "Temps non dramatique", "Famille recomposée"]	Japon contemporain, pauvreté invisible, failles du contrat social, familles qui n'en sont pas	La famille comme choix plutôt que comme biologie, l'amour qui ne se dit pas	["famille", "enfance", "société", "tendresse"]	t	2026-05-05 07:28:15.464547
c1a579f1-e95f-4b5c-ac39-d4668dc6d04f	Corée du Sud	Asie	2000s-2020s	Nouveau cinéma coréen	Bong Joon-ho	["Memories of Murder", "The Host", "Snowpiercer", "Okja", "Parasite"]	["Changement de registre générique", "Critique sociale dans le genre populaire", "Plan final qui détruit l'espoir", "Espace vertical"]	Corée post-dictature, inégalités de classe extrêmes, chaebol et sous-prolétariat, honte nationale de Gwangju	Le genre (horreur, thriller, SF) comme cheval de Troie pour la critique marxiste, les pauvres qui collaborent à leur propre destruction	["classe sociale", "genre", "critique", "vertical"]	t	2026-05-05 07:28:15.464547
9532efa0-39df-4b88-8911-c611ec1da70f	Corée du Sud	Asie	2000s-2010s	Nouveau cinéma coréen	Park Chan-wook	["JSA", "Oldboy", "Lady Vengeance", "Stoker", "La Servante"]	["Symétrie visuelle", "Violence esthétisée", "Retournement moral final", "Couleur comme signification"]	Trauma historique (guerre de Corée, dictature), vengeance comme récit national, identité déchirée	La vengeance qui transforme le vengeur en ce qu'il déteste, la beauté de la cruauté comme position morale	["vengeance", "trauma", "esthétique", "moral"]	t	2026-05-05 07:28:15.464547
ad863818-f4de-4449-a1b0-56540ca19e04	Corée du Sud	Asie	1990s-2010s	Réalisme coréen	Lee Chang-dong	["Peppermint Candy", "Oasis", "Secret Sunshine", "Poetry", "Burning"]	["Temps à rebours (Peppermint Candy)", "Corps handicapé comme vérité sociale", "Ellipse sur les moments décisifs", "Fin ouverte radicale"]	Corée post-dictature, christianisme et désespoir, classe moyenne appauvrie, jeunesse sans avenir	Les personnages qui ne peuvent pas échapper à leur origine sociale, la foi comme dernier recours avant le néant	["classe", "religion", "désespoir", "réalisme"]	t	2026-05-05 07:28:15.464547
36dbfc91-cf05-43c8-ad22-5e2bcf9a5f0c	Iran	Moyen-Orient	1990s-2010s	Nouvelle vague iranienne	Abbas Kiarostami	["Où est la maison de mon ami ?", "Close-Up", "Le Goût de la cerise", "Le Vent nous emportera", "10"]	["Routes vides et détours", "Non-professionnel qui joue son propre rôle", "Frontière fiction/documentaire", "Mort hors-champ"]	Iran post-révolution, censure comme générateur formel, campagnes vs villes, code du genre imposé	Le doute sur la nature du réel est une posture narrative, la route comme pensée en mouvement	["réel", "doute", "route", "métaphore"]	t	2026-05-05 07:28:15.464547
9e529017-6f9e-4055-92cc-8fa73bf6be1e	Iran	Moyen-Orient	2000s-2010s	Cinéma social iranien	Asghar Farhadi	["Une séparation", "À propos d'Elly", "Le Client", "Everybody Knows"]	["Ambiguïté morale totale", "Révélations progressives", "Pas de coupable", "Huis clos social"]	Classe moyenne iranienne, rapport hommes-femmes, honneur social, contrainte légale religieuse	Tous les personnages ont raison dans leur propre logique, la tragédie naît de vérités incompatibles	["ambiguïté", "moral", "famille", "vérité"]	t	2026-05-05 07:28:15.464547
aab05384-be1d-4df0-868d-05772adbd348	URSS/Russie	Europe	1920s-1930s	Montage soviétique	Sergei Eisenstein	["Le Cuirassé Potemkine", "Octobre", "La Grève", "Alexandre Nevski", "Ivan le Terrible"]	["Montage attractionnel", "Acteurs typages (pas de stars)", "Foule comme protagoniste", "Ellipse temporelle expansive"]	Révolution bolchévique, construction du socialisme, propagande comme art	La masse comme héros, le montage comme idéologie, le temps dilaté dans les moments de violence collective	["révolution", "masse", "montage", "politique"]	t	2026-05-05 07:28:15.464547
1e7fb59c-5825-4222-a5bb-9f269018951b	URSS/Russie	Europe	1960s-1980s	Cinéma poétique soviétique	Andrei Tarkovsky	["L'Enfance d'Ivan", "Andreï Roublev", "Solaris", "Le Miroir", "Stalker"]	["Plan-séquence contemplatif", "Eau et feu comme motifs obsessionnels", "Temps subjectif", "Mémoire comme présent"]	URSS brejnévienne, aspiration spirituelle réprimée, nostalgie de l'enfance, conflit art/État	Le temps qui passe sans événement EST l'événement, la conscience qui contient tous les temps	["temps", "mémoire", "spiritualité", "contemplation"]	t	2026-05-05 07:28:15.464547
326ce09a-116d-4565-abb4-5bb7291d4f14	Allemagne	Europe	1919-1933	Expressionnisme allemand	Fritz Lang / F.W. Murnau	["Metropolis", "M le Maudit", "Nosferatu", "Le Cabinet du docteur Caligari", "Faust"]	["Décors distordus", "Lumière expressionniste (ombres extrêmes)", "Architecture comme état psychologique", "Monstre comme métaphore sociale"]	République de Weimar, trauma de WWI, inflation, montée du nazisme pressentie, psychanalyse naissante	Le monstre est le reflet de la société qui l'a créé, l'espace architectural extériorise la psychologie	["expressionnisme", "ombre", "monstre", "psychologie"]	t	2026-05-05 07:28:15.464547
0fa2e5e7-d0fd-4e40-bb22-4db1aab3a2f7	Allemagne	Europe	1970s-1980s	Nouveau cinéma allemand	Rainer Werner Fassbinder	["Le Droit du plus fort", "L'Année des 13 lunes", "Ali : Peur manger l'âme", "Berlin Alexanderplatz"]	["Mélodrame de Sirk déconstruit", "Corps épuisé", "Amour comme exploitation", "Plans-tableaux statiques"]	RFA, mémoire nazie refoulée, capitalisme et désirs manipulés, marginalité sexuelle et sociale	L'amour comme rapport de pouvoir, les opprimés qui reproduisent l'oppression qu'ils subissent	["mélodrame", "pouvoir", "corps", "oppression"]	t	2026-05-05 07:28:15.464547
e3234d75-95ac-4d1a-8937-10f8911d589a	Danemark	Europe	1990s-2000s	Dogme 95	Lars von Trier / Thomas Vinterberg	["Festen", "Les Idiots", "Breaking the Waves", "Dancer in the Dark", "Melancholia"]	["Caméra portée", "Lumière naturelle uniquement", "Pas de musique non-diégétique", "Son direct"]	Réaction contre le cinéma d'effets spéciaux, retour au réel, vœu de chasteté formel	La caméra qui tremble dit 'je suis là', la contrainte formelle comme libération narrative	["réalisme", "contrainte", "corps", "souffle"]	t	2026-05-05 07:28:15.464547
3bb7301c-da16-4f14-8476-ea6137e5e6fa	Brésil	Amérique latine	1960s-1970s	Cinema Novo	Glauber Rocha	["Dieu et le Diable dans la Terre du Soleil", "Antonio das Mortes", "Terra em Transe"]	["Esthétique de la faim", "Caméra à l'épaule", "Mélange documentaire-fiction", "Violence mythologique"]	Dictature militaire, sertão nordestino, cangaçeiros et fanáticos, sous-développement comme condition narrative	La misère comme esthétique, le baroque tropical comme résistance, la violence révolutionnaire comme réponse à la violence coloniale	["révolution", "pauvreté", "baroque", "mythologie"]	t	2026-05-05 07:28:15.464547
92cff096-e9bb-4562-ac78-049d24077245	Argentine	Amérique latine	2000s-2010s	Nouveau cinéma argentin	Lucrecia Martel	["La Ciénaga", "La Sainte Fille", "La Femme sans tête", "Zama"]	["Point de vue périphérique", "Corps féminins", "Espace de classe matérialisé", "Chaleur et torpeur"]	Post-crise 2001, déclin de la classe moyenne, mémoire de la dictature, aristocratie de province	Ce que les personnages ne voient pas révèle ce qu'ils refusent de voir socialement, la torpeur comme état politique	["classe", "féminin", "point de vue", "chaleur"]	t	2026-05-05 07:28:15.464547
cd7d47eb-87b0-453a-a84c-6aada1754791	Mexique	Amérique latine	2000s-2010s	Nuevo Cine Mexicano	Carlos Reygadas	["Japón", "Batalla en el Cielo", "Luz silenciosa", "Notre temps"]	["Acteurs non professionnels", "Plans très longs", "Corps en pleine nature", "Transcendance du quotidien"]	Mexique rural et urbain, classe et corps, spiritualité anabaptiste, frontière USA-Mexique	Le divin dans le banal corporel, le temps agricole contra le temps narratif	["spiritualité", "corps", "nature", "transcendance"]	t	2026-05-05 07:28:15.464547
03f98389-4543-40ac-8173-99f7ca2ed5f5	Taïwan	Asie	1980s-2000s	Nouvelle vague taïwanaise	Hou Hsiao-hsien	["La Cité des douleurs", "Les Fleurs de Shanghai", "Millennium Mambo", "Three Times"]	["Plan fixe long", "Acteurs vus de dos ou de loin", "Temps historique stratifié", "Fenêtre comme cadre dans le cadre"]	Taïwan post-228 (massacre de 1947), identité taïwanaise vs chinoise, colonisation japonaise, modernisation	L'histoire nationale visible dans les gestes privés, l'ellipse sur les moments de violence ou d'amour	["histoire", "identité", "distance", "temps"]	t	2026-05-05 07:28:15.464547
e6ba1a93-24a2-4317-99de-bbfc86515669	Taïwan	Asie	1990s-2000s	Cinéma urbain contemporain	Edward Yang	["Yi Yi", "Terroriste", "Confucianisme peut-il sauver le capitalisme ?", "A Brighter Summer Day"]	["Plans très longs", "Multiplication de personnages-miroirs", "Architecture moderne comme cage", "Générations en conflit"]	Taïpei moderne, famille confucéenne sous pression capitaliste, jeunesse perdue, violence des gangs	La ville moderne comme désorientation existentielle, les personnages qui cherchent leur place dans un monde sans boussole	["modernité", "famille", "urbain", "désorientation"]	t	2026-05-05 07:28:15.464547
9f0544f0-9390-448d-9cce-2770a1d285a9	Chine	Asie	1980s-1990s	Cinquième génération	Zhang Yimou	["Judou", "Épouses et Concubines", "Qiu Ju, une femme chinoise", "Hero", "Vivre !"]	["Couleur comme émotion (rouge = passion/mort)", "Espace rural historique", "Corps de femme et oppression", "Plan large emblématique"]	Chine post-Révolution Culturelle, patriarcat féodal, femmes sacrifiées, modernisation douloureuse	Le corps féminin comme champ de bataille politique, la couleur comme commentaire moral	["couleur", "féminin", "histoire", "opression"]	t	2026-05-05 07:28:15.464547
9c4dac57-c5d5-493a-989d-ff171786a0ab	Chine	Asie	2000s-2010s	Sixième génération	Jia Zhangke	["Xiao Wu", "Unknown Pleasures", "Still Life", "A Touch of Sin", "Les Éternels"]	["DV puis numérique", "Ruines industrielles", "Temps mort et attente", "Pop culture comme aliénation"]	Chine de l'après-Tian'anmen, destruction créatrice capitaliste, paysans déplacés, violence économique	Les laissés-pour-compte de la modernisation, les corps épuisés dans les paysages détruits	["modernisation", "classe ouvrière", "ruine", "violence"]	t	2026-05-05 07:28:15.464547
2a216deb-c63a-45fd-b2a0-c467fb198b0c	Inde	Asie	1950s-1980s	Parallel Cinema	Satyajit Ray	["La Complainte du sentier", "Aparajito", "Le Monde d'Apu", "Charulata", "La Maison et le Monde"]	["Humanisme lyrique", "Musique de Ravi Shankar comme voix off", "Visages d'une présence exceptionnelle", "Nature bengalie"]	Inde post-indépendance, Bengale rural, Calcutta en mutation, caste et modernité	La croissance d'un enfant comme histoire d'une civilisation, la douceur face à la violence du monde	["humanisme", "enfance", "nature", "épopée personnelle"]	t	2026-05-05 07:28:15.464547
65cc0ab4-8f58-4b9c-a7ec-8cca6bae3796	Hong Kong	Asie	1990s-2000s	Cinéma de Hong Kong	Wong Kar-wai	["Chungking Express", "In the Mood for Love", "2046", "Happy Together", "Les Cendres du temps"]	["Flou et ralenti", "Musique anachronique", "Lumière filtrée saturée", "Monologue intérieur"]	Hong Kong avant la rétrocession (1997), anxiété identitaire, amours impossibles, temps qui s'enfuit	Le désir qui ne trouve jamais son objet, le temps comme substance émotionnelle, la mémoire comme seule réalité	["désir", "temps", "mémoire", "mélancolie"]	t	2026-05-05 07:28:15.464547
763b9466-a8fb-4060-a3a8-a663ac020c9d	USA	Amérique du Nord	1967-1980	New Hollywood	Francis Ford Coppola / Martin Scorsese	["Le Parrain", "Taxi Driver", "Apocalypse Now", "Raging Bull", "Mean Streets"]	["Anti-héros", "Violence non rédemptrice", "Influences européennes assumées", "Subjectivité extrême"]	Post-Vietnam, Watergate, crise de confiance américaine, contre-culture, studios qui laissent les auteurs libres	L'Amérique qui se retourne contre elle-même, le héros qui est le problème	["anti-héros", "violence", "américanité", "désillusion"]	t	2026-05-05 07:28:15.464547
96ae248b-6d03-4e89-9300-e58f09c49f47	USA	Amérique du Nord	1980s-2000s	Cinéma indépendant américain	John Cassavetes / Jim Jarmusch	["Faces", "A Woman Under the Influence", "Stranger Than Paradise", "Dead Man", "Mystery Train"]	["Improvisation", "Temps mort valorisé", "Corps et voix comme instruments", "Marginalité assumée"]	En dehors des studios, budget minimal, acteurs-collaborateurs, économie de la nécessité	L'ennui comme révélateur, les marges de la société américaine comme cœur du pays réel	["improvisation", "indie", "corps", "marginalité"]	t	2026-05-05 07:28:15.464547
dd00e8d9-c0ea-4e51-a6c5-86c1b42c1c99	Roumanie	Europe	2000s-2010s	Nouveau cinéma roumain	Cristian Mungiu	["4 mois, 3 semaines, 2 jours", "Au-delà des collines", "Bacalauréat", "R.M.N."]	["Plan long sans coupe", "Temps réel", "Pas de musique non-diégétique", "Ambiguïté morale totale"]	Roumanie post-communiste, bureaucratie héritée, Église orthodoxe, corruption institutionnelle	La décision impossible comme définition de l'existence morale, le système comme personnage invisible mais omnipotent	["bureaucratie", "moral", "temps réel", "huis clos"]	t	2026-05-05 07:28:15.464547
6f4078b7-50f1-449c-83cc-1ed3f9a381b5	Sénégal	Afrique	1960s-2000s	Cinéma africain fondateur	Ousmane Sembène	["La Noire de...", "Xala", "Ceddo", "Mooladé", "Guelwaar"]	["Wolof et langues locales", "Satire politique directe", "Corps féminins résistants", "Conte traditionnel modernisé"]	Sénégal post-indépendance, bourgeoisie africaine corrompue, impérialisme culturel français, excision	Le colonisé qui retourne les armes du colonisateur, les femmes comme forces de résistance et de changement	["postcolonialisme", "satire", "femmes", "résistance"]	t	2026-05-05 07:28:15.464547
d7660c4b-404b-4046-adcb-10e40aa4f45a	Mali/Mauritanie	Afrique	2000s	Cinéma africain contemporain	Abderrahmane Sissako	["La Vie sur Terre", "Heremakono", "Bamako", "Timbuktu"]	["Temps africain (attente et présence)", "Procès comme forme narrative", "Musique comme narration", "Solitude dans l'espace vaste"]	Mali sous occupation djihadiste, critique du FMI par un village africain qui fait son propre procès, mondialisation et culture	La dignité silencieuse face à la barbarie, le temps africain qui résiste au temps occidental	["dignité", "résistance", "temps", "communauté"]	t	2026-05-05 07:28:15.464547
3ce1f62f-8981-405f-858e-8a2f4108d481	Royaume-Uni	Europe	1960s	British New Wave / Kitchen Sink	Ken Loach / Mike Leigh	["Kes", "Naked", "I Daniel Blake", "Sorry We Missed You", "Secrets & Lies"]	["Improvisation structurée", "Acteurs non professionnels", "Classes sociales observées de l'intérieur", "Dialectes régionaux"]	Angleterre ouvrière, tatchérisme, deindustrialisation, working class comme sujet pas comme décor	Le système qui broie les gens de bonne volonté, la dignité ouvrière sous pression économique	["classe ouvrière", "réalisme", "système", "dignité"]	t	2026-05-05 07:28:15.464547
e56bcc45-18f6-4fac-9507-54a80391f19a	Suède	Europe	1950s-1980s	Cinéma bergmanien	Ingmar Bergman	["Le Septième Sceau", "Persona", "Scènes de la vie conjugale", "Cris et Chuchotements", "Fanny et Alexandre"]	["Gros plan sur les visages", "Silence prolongé", "Dieu absent", "Couples en combat", "Frontière moi/autre"]	Protestantisme suédois, culpabilité et mort, guerre froide, couple comme champ de bataille existentiel	Les personnages qui ne peuvent pas s'atteindre malgré leur désir, la foi impossible mais nécessaire	["existentialisme", "mort", "couple", "foi"]	t	2026-05-05 07:28:15.464547
\.


--
-- Data for Name: cinq_piliers; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.cinq_piliers (id, project_id, pillars, dominant_pillar, weakest_pillar, global_balance, updated_at) FROM stdin;
\.


--
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.content_versions (id, project_id, content_type, content_key, label, data, word_count, created_at) FROM stdin;
\.


--
-- Data for Name: creative_memory_entries; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.creative_memory_entries (id, category, title, content, tags, priority, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: echo_temps; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.echo_temps (id, project_id, mythic_resonances, historical_parallels, cultural_echoes, temporal_anchor, universal_wound, future_resonance, updated_at) FROM stdin;
\.


--
-- Data for Name: emotional_cores; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.emotional_cores (id, project_id, dominant_emotion, hidden_wound, emotional_lack, inner_child_signal, protection_mask, apparent_desire, deep_need, central_fear, shame_point, guilty_point, symbolic_object, symbolic_place, emotional_antagonist, emotional_contradiction, correction_path, transformation_arc, final_emotional_state, updated_at) FROM stdin;
\.


--
-- Data for Name: emotional_paths; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.emotional_paths (id, project_id, stages, updated_at) FROM stdin;
\.


--
-- Data for Name: experimental_modules; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.experimental_modules (id, slug, name, description, minimum_plan, is_owner_only, is_enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: film_data; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.film_data (id, project_id, concept, logline, tagline, short_synopsis, long_synopsis, treatment, target_duration, film_format, visual_promise, emotional_promise, dramatic_question, central_image, updated_at) FROM stdin;
\.


--
-- Data for Name: film_scenes; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.film_scenes (id, project_id, scene_number, title, int_ext, location, time_of_day, characters_present, protagonist_objective, obstacle, visible_conflict, emotional_subtext, opening_beat, dramatic_turn, closing_beat, emotion_before, emotion_after, strong_image, sound_or_silence, symbolic_object, action_description, dialogue_fragment, narrative_function, suspense_level, humour_level, emotional_power_level, attractiveness_level, hpsa_check, link_to_emotional_core, director_note, camera_suggestion, risk_of_cliche, original_alternative, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hpsa_scores; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.hpsa_scores (id, project_id, humour, pleur, suspense, attractivite, global_score, priority_fixes, updated_at) FROM stdin;
\.


--
-- Data for Name: knowledge_dossiers; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.knowledge_dossiers (id, name, description, category, cover_insight, entry_ids, skill_ids, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: manuscript_analyses; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.manuscript_analyses (id, title, project_id, content_excerpt, word_count, global_score, structure_score, emotion_score, archetype_score, originality_score, coherence_score, strengths, weaknesses, detected_archetypes, detected_emotions, applied_techniques, missing_techniques, coherence_validations, coherence_issues, comparable_works, structure_analysis, emotion_analysis, recommendations, coherence_analysis, verdict, created_at) FROM stdin;
\.


--
-- Data for Name: miroir_artistique; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.miroir_artistique (id, project_id, true_theme, shadow_story, blind_spots, resonance_gaps, artistic_invitations, mirror_phrase, updated_at) FROM stdin;
\.


--
-- Data for Name: narrative_matrices; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.narrative_matrices (id, project_id, central_concept, logline, short_pitch, long_synopsis, genre, tone, themes, universe_laws, temporal_rules, spatial_rules, visible_world, invisible_forces, central_conflict, protagonist, antagonist, emotional_stakes, symbolic_motifs, power_objects, secrets, possible_endings, coherence_rules, updated_at) FROM stdin;
\.


--
-- Data for Name: narrative_skills; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.narrative_skills (id, name, description, category, prompt_content, is_active, is_global, validation_count, validation_sources, is_universal, created_at, updated_at) FROM stdin;
684fb168-0e2d-473f-9e0a-e3d0acd9f36a	Incorporation de l'Onirisme	Fusionner le rêve et la réalité pour enrichir le récit.	theme	Incorporez des éléments oniriques dans votre pièce en introduisant des scènes ou des dialogues qui ne respectent pas les lois de la logique, mais qui servent à révéler un aspect profond des personnages ou de l'intrigue. Impliquez un sens de mystère et de magie qui reste malgré tout ancré dans les émotions humaines.	f	t	1	[]	f	2026-05-05 08:06:05.814426	2026-05-05 08:06:05.814426
44e32352-dd8f-4f9d-8739-537d5f0fc3c4	Personnages des Limites	Créer des personnages à la lisière de deux mondes (réel et fantastique).	character	Développez un personnage dont l'arrière-plan ou les expériences sont à cheval entre réalité et mysticisme. Utilisez des détails sensoriels ou historiques pour l'ancrer dans son environnement tout en lui donnant des qualités ambiguës qui permettent le doute et l'interprétation multiples.	f	t	1	[]	f	2026-05-05 08:06:05.818673	2026-05-05 08:06:05.818673
eb926ac6-1922-4a59-b935-57365b6b77f4	Narration Polyphonique	Développer un récit qui intègre de multiples perspectives.	technique	Écrivez un dialogue où plusieurs personnages racontent un même événement de différentes manières. Assurez-vous que chaque récit révèle quelque chose de distinct, créant un ensemble de perspectives qui enrichit l'intrigue globale.	f	t	1	[]	f	2026-05-06 00:06:20.605744	2026-05-06 00:06:20.605744
557f6a07-8d82-4bc1-8691-1e99099f4e42	Emotional Reciprocity	Fostering empathy through two-way story exchanges.	emotion	Craft a scene where two characters from distinct backgrounds share stories that reflect their personal histories, allowing for emotional vulnerability and a reconciling of differences. Use close-ups to highlight emotional responses and weave in ambient sounds that resonate with the themes of memory and identity.	f	t	1	["50afafb9-a594-4ad0-9a7b-2387748a5f61"]	f	2026-05-06 09:57:10.973089	2026-05-06 09:57:10.973089
c4cc111f-5c3f-4ac0-be2e-8daa4eebc376	Dharma vs Artha	Contraster les valeurs éthiques avec les ambitions personnelles.	technique	Imaginez un personnage principal en conflit entre son devoir moral et son désir de réussite personnelle. Développez une scène où ce dilemme atteint son paroxysme, et suggérez une résolution qui intègre les deux aspects de manière surprenante.	f	t	1	["5781930e-0197-4f00-babd-1e998fe9e0bb"]	f	2026-05-06 09:58:19.452771	2026-05-06 09:58:19.452771
2310eacd-7312-4436-83a1-6259fb8d547b	Chronologie Structurellement Flexible	Technique de narration non-linéaire pour approfondir le thème de l'amour intemporel.	structure	Développez un récit où les lignes temporelles croisées révèlent des couches émotionnelles. Envisagez des flashbacks non marqués ou des prémonitions pour exprimer la continuité intemporelle de l'amour. Reliez habilement les scènes pour que chaque temporalité ajoute une dimension au développement des personnages.	f	t	1	["a5ba33c8-4101-4ec7-ad3b-6263b6b0ae50"]	f	2026-05-06 10:00:01.152157	2026-05-06 10:00:01.152157
08bd26b0-e183-46bf-b515-29f7e641efa3	Symbolisme Culturel	Utiliser des symboles riches en signification culturellement spécifique.	theme	Concevez une scène où des objets visibles ou symboliques transportent un poids culturel précis. Faites en sorte que ces symboles ajoutent des couches de sens à l'histoire, en les liant directement aux thèmes centraux de votre pièce.	t	t	1	[]	f	2026-05-06 00:06:20.608425	2026-05-06 10:44:48.309
4718c1dd-c6a5-4362-ba8c-fae0ccf6e05d	Symbolisme visuel	Utilisation de symboles visuels pour enrichir la narration.	style	Intégrez des couleurs et motifs spécifiques pour renforcer l'émotion clé de vos scènes. Par exemple, utilisez le rouge pour symboliser la passion ou le danger, et répétez-le dans le décor et les costumes pour souligner l'intensité émotionnelle des moments cruciaux.	f	t	1	[]	f	2026-05-07 17:28:16.384769	2026-05-07 17:28:16.384769
b22b8020-10e8-4f10-bfc1-976ee7ca76cb	Ambiguïté morale	Création de personnages aux choix moralement complexes.	character	Concevez vos personnages principaux avec des motivations qui ne sont ni totalement bonnes ni mauvaises. Par exemple, donnez-leur des dilemmes qui forcent le spectateur à remettre en question leur soutien. Utilisez ces traits pour enrichir le débat éthique central de votre œuvre.	f	t	1	[]	f	2026-05-07 17:28:16.389836	2026-05-07 17:28:16.389836
1f679633-fdd5-4ed8-ac32-ad179a755d49	Narration fragmentée	Récit organisé en fragments temporels.	structure	Construisez votre histoire en utilisant une chronologie non linéaire. Faites des retours en arrière ou en avant pour révéler des couches supplémentaires d'information progressivement. Assurez-vous que cette structure renforce l'intrigue centrale et maintient l'intérêt du public par la surprise et la complexité.	f	t	1	[]	f	2026-05-07 17:28:16.392091	2026-05-07 17:28:16.392091
75f19cd1-f730-41cf-893b-c0edc66a5488	Subversion des Archétypes	Exploitez la structure d'archetypes classiques tout en les réinterprétant dans un contexte moderne.	character	Réinventez un héros classique en modifiant ses motivations ou son cadre culturel, de sorte que les valeurs et défis modernes redéfinissent son arc traditionnel. Quelles caractéristiques spéciales intégrerez-vous pour susciter une connexion plus forte avec le lecteur contemporain ?	f	t	1	["b33768ce-9657-48b4-b6bd-db7e95a2a6fc"]	f	2026-05-07 19:18:58.250888	2026-05-07 19:18:58.250888
ae784725-9c85-4e00-a433-91a7c5a498ce	Multinarrativité	Technique imbricatée d'histoires entremêlées explorant des perspectives variées.	structure	Concevez un récit intégrant plusieurs points de vue d'une manière fluide, reflet d'une réalité complexe, avec une cohésion narrative accrue. Comment chaque perspective apporte-t-elle une compréhension unique du thème central ?	f	t	1	["b33768ce-9657-48b4-b6bd-db7e95a2a6fc"]	f	2026-05-07 19:18:58.252774	2026-05-07 19:18:58.252774
bb519150-3c36-498b-b95a-661479caec48	intégration de symbolisme culturel	Intercaler des symboles culturels pour enrichir le récit.	theme	Identifiez des symboles spécifiques à votre culture d'origine et concevez une scène où ces symboles prennent vie à travers les actions et les dialogues des personnages, enrichissant ainsi le thème narratif sous-jacent.	f	t	1	[]	f	2026-05-08 08:54:12.096124	2026-05-08 08:54:12.096124
4f35ba00-2fcb-45b7-8930-4ded55ee46b4	Métissage narratif	Mélanger les récits culturels locaux avec des structures narratives universelles	structure	Crée une scène en utilisant différents points de vue : alterne les perspectives de plusieurs personnages pour raconter une même histoire, en y intégrant des éléments spécifiques de leur culture. Assure-toi que chaque voix apporte une dimension unique à la narration.	f	t	1	[]	f	2026-05-09 14:08:03.635331	2026-05-09 14:08:03.635331
1f753b35-9b08-4e64-895e-064ef101deee	Emotion Éphémère	Créer des connexions émotionnelles à travers des moments fugaces mais puissants.	emotion	Incorpore des scènes où l'émotion est subtile mais latente. Utilise des interactions discrètes et des moments transitoires pour exprimer des rêves, regrets ou souhaits. Élaborer des histoires où les personnages découvrent de nouvelles facettes de leurs émotions à travers des expériences quotidiennes, transformant le banal en poignant.	f	t	1	[]	f	2026-05-10 14:08:04.902728	2026-05-10 14:08:04.902728
f286abc2-8cfa-4c42-aca3-dba78c3808f5	Construction d'une Frustration Accumulée	Amplifie les tensions en juxtaposant espoir croissant et société restrictive.	structure	Crée une série de scènes où le protagoniste se rapproche de son désir, seulement pour voir tous ses progrès annulés par des éléments externes ou sa propre hésitation. Introduis un personnage secondaire qui incarne un succès échappé, symbolisant ce que le protagoniste pourrait atteindre. Termine chaque cycle avec un gain de profondeurs personnelles plutôt que matérielles.	f	t	1	["f6df1e64-0af2-402c-a4fc-5fb4c77eb1cb"]	f	2026-05-10 22:11:36.465746	2026-05-10 22:11:36.465746
a0a7b0ab-cc8d-459c-89a8-4612939f5ae9	Cinéma Algorithmique	Optimiser la structure narrative grâce aux données de visionnage.	technique	Collectez et analysez les données démographiques et de visionnage de votre public cible. Utilisez ces insights pour structurer le rythme et l'évolution des personnages dans votre scénario. Intégrez des points de pivot narratifs qui répondent aux moments d'engagement élevés identifiés précédemment.	f	t	1	[]	f	2026-05-11 20:25:07.307914	2026-05-11 20:25:07.307914
ae27a4e8-9799-4f58-85d7-9ab64b4ae982	Récit par Emboîtement	Utilise des récits imbriqués pour créer de la profondeur.	structure	Construit ton récit principal en intégrant des histoires secondaires qui enrichissent et commentent le thème central. Réfléchis à la manière dont ces histoires se reflètent et se répondent, en renforçant les enjeux émotionnels et narratifs. Assure-toi que chaque sous-récit ajoute une couche de compréhension ou de tension au contenu principal, créant ainsi une symphonie narrative.	f	t	1	[]	f	2026-05-12 15:38:51.908179	2026-05-12 15:38:51.908179
e377eea1-6a86-46a6-83fc-6f41bafa2696	Adaptation Algorithmiquement Informatique	Adapter les récits en fonction des informations tirées des algorithmes de streaming.	technique	Examinez un scénario ou une histoire récente que vous avez créée. Identifiez trois points de données clés de l'analyse d'audience qui pourraient influencer l'arc de l'intrigue ou le développement des personnages. Ensuite, apportez deux modifications spécifiques au scénario en fonction de ces données, tout en conservant l'intégrité narrative et le style personnel.	f	t	1	[]	f	2026-05-13 00:00:25.886514	2026-05-13 00:00:25.886514
\.


--
-- Data for Name: note_intention; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.note_intention (id, project_id, vision, parti_pris_mise_en_scene, personnages_vision, univers_visuel, musique_et_son, positionnement, pourquoi_maintenant, mot_final, updated_at) FROM stdin;
\.


--
-- Data for Name: pitch_documents; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.pitch_documents (id, project_id, title, format, genre, target_audience, comparable_references, visual_direction, author_note, intention_note, why_now, characters, world, film_season_arc, selling_points, updated_at) FROM stdin;
\.


--
-- Data for Name: project_skills; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.project_skills (id, project_id, skill_id, activated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.projects (id, title, raw_idea, input_type, genre, tone, target_format, temporal_logic, reality_level, target_audience, artistic_ambition, visual_moods, cinematic_references, inspiration_sources, manuscript_excerpt, progression, created_at, updated_at, owner_user_id) FROM stdin;
\.


--
-- Data for Name: relationships; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.relationships (id, project_id, character_a_id, character_b_id, character_a_name, character_b_name, relationship_type, emotional_tension, hidden_truth, conflict, evolution, symbolic_meaning) FROM stdin;
\.


--
-- Data for Name: research_data; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.research_data (id, project_id, reference_works, critical_notes, success_signals, current_trends, cliche_risks, originality_opportunities, creation_notes, abstract_mechanics, humor_patterns, suspense_patterns, tear_triggers, updated_at) FROM stdin;
\.


--
-- Data for Name: research_entries; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.research_entries (id, title, research_type, era, era_label, era_start, era_end, culture, culture_label, culture2, culture2_label, medium, custom_input, summary, key_techniques, emotional_principles, cultural_context, notable_works, narrative_lessons, themes, universal_score, skills_extracted, extracted_skill_ids, created_at) FROM stdin;
44d9d0c3-553f-4ee1-8d3b-d5a54e8ff0b3	La Fusion des Rêves : Réalisme Magique Latino-Américain et Théâtre Classique	standard	golden_age	Âge d'or	1930	1960	latin	Latino-américaine			theater		L'ère de l'âge d'or d'Hollywood, marquée par le système des studios et des genres cinématographiques bien définis, se juxtapose de manière fascinante avec la montée du réalisme magique dans la littérature latino-américaine. Alors que les cinéastes des années 1930 à 1960 ont perfectionné les récits archétypaux ancrés dans la psyché collective, les auteurs latino-américains comme Borges ont déstabilisé ces récits avec des éléments qui transgressent les frontières de la réalité. Dans le théâtre, cette tension se traduit par des œuvres qui mêlent stabilité structurelle et surprises oniriques, transformant ainsi la scène en un lieu où le familier rencontre l'inexplicable. La pertinence contemporaine de cette approche réside dans sa capacité à enrichir les récits actuels en favorisant une suspension volontaire d'incrédulité, essentielle à la navigation des vérités multiples de notre époque. Le néoréalisme italien, avec son approche terre-à-terre, offre une contrepartie aux récits enchanteurs latino-américains, suggérant un dialogue fertile entre l'illusion et la réalité dans le médium théâtral.	["TECHNIQUE 1 — Fragmentations Narratives : Introduire intentionnellement des ruptures narratives pour surprendre le public (aujourd'hui, cela peut être appliqué pour dynamiser les performances théâtrales classiques en ajoutant des éléments de surprise ou des intrigues non-linéaires).","TECHNIQUE 2 — Personnages Mélancoliques : Incorporer des personnages qui incarnent à la fois l'ordinaire et le fantastique, tel que préfiguré par les protagonistes de Borges, pour créer une connexion émotionnelle plus riche.","TECHNIQUE 3 — Mise en Scène Déroutante : Utiliser des décors évolutifs qui changent subtilement pour refléter l'instabilité de la réalité perçue, un écho aux transitions fluide du cinéma classique.","TECHNIQUE 4 — Dialogues Symboliques : Développer des dialogues chargés de symbolisme, inspirés des telenovelas, pour introduire des niveaux de significations ajoutés.","TECHNIQUE 5 — Transcendance du Temps : Embrasser une temporalité non-linéaire pour évoquer l'éternité et le rêve, permettant une expérimentation au théâtre moderne qui engage le spectateur actif."]	["PRINCIPE ÉMOTIONNEL 1 — L'Étrangement Familier : Créez des situations où le connu devient bizarre pour inciter à la réflexion sur la condition humaine.","PRINCIPE 2 — La Nostalgie de l'Inatteignable : Évoquer un sentiment de manque pour satisfaire l'appétit universel pour des récits nostalgiques et intangibles.","PRINCIPE 3 — La Dualité de L'Existence : Explorer les conflits internes des personnages pour exposer l'humanité dans sa complexité et sa contradiction."]	La culture latino-américaine, imprégnée de mythes, de spiritualité et d'une histoire de colonisation, crée un terreau fertile pour le réalisme magique et ses récits enchanteurs. Cette tradition puise dans les croyances indigènes et africaines, mélangées à l'héritage colonial, pour favoriser des histoires où l'étrange est banal. Le bon récit ici aborde des vérités subjectives et identitaires, jouant avec le merveilleux et le quotidien sans distinction claire. Parallèlement, le théâtre classique hollywoodien consolide des genres qui s'étendent du film noir aux comédies musicales, chacun avec ses propres conventions. Ce dualisme culturel, où la structure rigide rencontre l'imaginaire fluide, élargit la définition même d'une 'bonne histoire', incitant les créateurs contemporains à ne plus seulement chercher la cohérence mais l'évasion imaginative.	["Bodas de Sangre (1933) par Federico García Lorca — Un drame poétique explorant la fatalité et le destin avec des éléments lyriques.","La Casa de Bernarda Alba (1936) par Federico García Lorca — Une pièce sur le despotisme familial et l'oppression, révélant la culture patriarcale espagnole.","Un Chien Andalou (1929) par Luis Buñuel et Salvador Dalí — Un court métrage surréaliste qui bouleverse les normes narratives avec des images frappantes.","Requiem por un Campesino Español (1953) par Ramón J. Sender — Une pièce qui traite des tensions sociales et politiques avec une charge émotive intense."]	Pour les auteurs d'aujourd'hui, la leçon majeure tirée de cette époque est l'importance de mélanger la réalité et l'imaginaire pour créer des œuvres qui résonnent sur plusieurs niveaux émotionnels. Le théâtre peut capitaliser sur l'ambiguïté du réel, à la manière de Borges, en incorporant des éléments fantastiques dans des récits personnels ou sociaux, brouillant la frontière entre vécu et rêvé. En outre, les récits légendaires peuvent être renforcés par les structures solides des genres classiques, permettant une prise de risque mesurée tout en explorant des thèmes audacieux, comme l'identité, le pouvoir et l'aliénation. L'audace de transgresser les attentes narratives est essentielle pour réinventer des histoires qui parlent à un public mondial diversifié.	[]	0	t	["684fb168-0e2d-473f-9e0a-e3d0acd9f36a","44e32352-dd8f-4f9d-8739-537d5f0fc3c4"]	2026-05-05 08:06:05.80672
0d52391c-3175-4297-b04e-eb30aad5f814	Entre Déserts et Révolutions : Modernité Théâtrale et Héritage Oriental	standard	new_waves	Nouvelles Vagues	1960	1980	arabic	Arabe & Moyen-Orient			theater		L'ère des Nouvelles Vagues (1960-1980) a vu émerger une rupture moderniste initiée par des cinéastes comme Jean-Luc Godard, Akira Kurosawa ou Satyajit Ray, qui a inspiré une réinvention théâtrale dans le monde arabe. Cette période coïncide avec un conflit interne entre l'héritage d'Al-Andalus et la modernité, où des figures comme Naguib Mahfouz demeuraient centrales. Le théâtre arabe, influencé par ces dynamiques, adopte des éléments de narration non-linéaire et de sujets sociopolitiques profonds. En fusionnant les structures narratives des 1001 Nuits avec les enjeux contemporains, le théâtre de cette époque cherche à exprimer les dilemmes identitaires et politiques des sociétés arabes. La rupture moderniste, incarnée par une recherche d'authenticité et de reformulation des récits traditionnels, a permis d'élaborer un dialogue entre le passé glorieux et les incertitudes présentes. Les créateurs actuels peuvent s'inspirer de cette période pour explorer les tensions entre tradition et innovation, et trouver de nouvelles voies d'expression culturelle.	["Fracture Narrative — Nom : utiliser des récits non-linéaires inspirés des 1001 Nuits pour déconstruire les attentes et surprendre le spectateur moderne (explorer des moyens d'intégrer plusieurs lignes narratives interconnectées).","Espaces Linguistiques — Nom : intégrer différents registres de langue (classique, dialectal, et moderne) pour enrichir les dialogues et captiver un public diversifié (expérimenter avec des dialogues où les personnages changent de registre selon leur évolution émotionnelle).","Symbolisme Allusif — Nom : exploiter des symboles puisés dans le patrimoine arabe tel que l'oasis ou le désert pour transmettre des tensions psychologiques (utiliser des éléments visuels récurrents pour renforcer les thèmes clés de l'œuvre).","Réalisme Magique — Nom : incorporer des éléments magiques ou irrationnels dans des contextes réalistes pour évoquer la richesse du subconscient culturel (ordonner des scènes où le réel et le surréaliste se rencontrent sans avertissement).","Récit Polyphonique — Nom : orchestrer plusieurs voix narratives pour représenter une pluralité de perspectives, inspirée des cités cosmopolites d'Al-Andalus (concevoir des scripts où différents personnages offrent des récits parallèles sur un événement commun)."]	["Alchimie de l'Identité — Mécanisme : faire converger les dilemmes identitaires personnels avec les contextes sociaux, application : créer des protagonistes tiraillés entre leur héritage et le monde moderne.","Ambiguïté Émotionnelle — Mécanisme : conserver une incertitude émotive chez le public, application : construire des scènes où les motivations des personnages restent délibérément floues.","Dépaysement Culturel — Mécanisme : transporter le public dans une expérience étrangère, application : intégrer des éléments exotiques ou anciens dans les décors qui contrastent avec ceux contemporains."]	Le théâtre du Moyen-Orient des années 1960 à 1980 est profondément marqué par la quête de réconciliation entre un riche passé culturel et les aspirations de modernité. Dans un espace géopolitique complexe, l'art théâtral devient une forme d'expression des tensions identitaires résultant des héritages de la colonisation et des pressions de mondialisation. L'héritage d'Al-Andalus, avec ses vestiges de tolérance et de convolutions artistiques, fournit un modèle de mélange culturel et esthétique que les dramaturges cherchent à réinterpréter.\nSimultanément, la montée du cinématographe égyptien et la littérature de figures telles que Naguib Mahfouz brossent le tableau d'une société en mouvance, en proie à ses contradictions. Les thèmes relevant du défi contre les structures patriarcales, de l'interaction entre tradition et modernité, ainsi que de la lutte pour l'identité nationale, sont omniprésents dans les pièces de théâtre de l'époque, créant un riche terreau de réflexion pour les artistes d'aujourd'hui.	["La Marche de Fès (1975) — une pièce charnière qui explore les révoltes étudiantes à travers une perspective magique et politique.","Egypte 68 (1968) — une étude introspective des tensions post-révolutionnaires dans la société égyptienne.","Qamar al-Zaman (1973) — une réinvention moderniste basée sur le conte des 1001 Nuits introduisant des allégories politiques.","Le Pont des Souvenirs (1980) — une exploration poétique de la mémoire et de l'identité dans un contexte urbain en mutation."]	Pour les créateurs contemporains, s'inspirer de l'ère des Nouvelles Vagues dans le contexte du théâtre arabe offre la possibilité de briser les contraintes des formes narratives conventionnelles. La richesse historique et le pluralisme esthétique permettent aux dramaturges de questionner non seulement la culture contemporaine mais aussi d'explorer la dynamique intemporelle entre tradition et rupture. En exploitant les récits mythiques, légendaires et modernes, les artistes peuvent redéfinir les narratifs engagés qui capturent les esprits de leur époque. En suivant cet exemple, incorporez diverses perspectives narratives pour créer des œuvres profondes et multi-dimensionnelles qui reflètent les enjeux complexes du monde actuel.	[]	0	t	["eb926ac6-1922-4a59-b935-57365b6b77f4","08bd26b0-e183-46bf-b515-29f7e641efa3"]	2026-05-06 00:06:20.599478
50afafb9-a594-4ad0-9a7b-2387748a5f61	Les Voix Invisibles : Croisement des Récits Orato-Cinématographiques à Hollywood et en Afrique	standard	golden_age	Âge d'or	1930	1960	african	Africaine			cinema		L'âge d'or d'Hollywood, une époque marquée par la codification des genres et une structure de studios rigide, semble à première vue très éloigné des récits oraux africains, incarnés par les griots et l'émergence du cinéma africain sous Sembène Ousmane. Pourtant, un dialogue fascinant se dessine entre ces deux traditions, notamment dans l'utilisation du médium cinématographique pour véhiculer des récits riches. Au centre du néoréalisme italien qui a influencé l'esthétique d'après-guerre à Hollywood, se trouve une recherche d'authenticité qui résonne avec la tradition orale yoruba, où chaque histoire est un miroir de la communauté et de ses histoires vivantes. Cette convergence met en lumière une perception intéressante de l'Ubuntu dans la narration visuelle, soulignant l'interconnexion humaine également propice à l'époque du studio system hollywoodien, qui, même dans sa nature fortement commerciale, cherchait des points communs universels dans ses récits. Aujourd'hui, alors que Nollywood s'impose sur la scène mondiale, les racines des récits africains et les techniques de narration hollywoodienne offrent de nouvelles perspectives pour créer des films qui captivent un public global tout en honorant les spécificités culturelles.	["Transposition orale — Traduire les qualités dynamiques du récit oral griotique en cinéma visuel, en utilisant des métaphores vivantes et un rythme proactif","Personnages-studio — Incorporer des archétypes stables typiques du studio system mais nourris de motivations communautaires inspirées par les valeurs d'Ubuntu","Récit multi-perspectiviste — Intégrer les récits parallèles, typiques des structures orales africaines, pour augmenter la profondeur narrative","Contextualisation historique — Ancrer les récits dans un contexte socio-historique précis, une approche centrale du néoréalisme, essentielle pour une authenticité convaincante","Expression émotive visuelle — Exploiter l'imagerie symbolique africaine pour informer l'approche expressive de la mise en scène, enrichissant l'émotionnel par la dimension visuelle"]	["Réciprocité narrative — Encourager l'empathie en reflétant la tradition d'une réciprocité d'histoires des réunions communautaires yoruba","Résilience collective — Dépeindre des arcs émotionnels où la communauté triomphe ensemble, soulignant la force d'Ubuntu","Cérémonialité — Utiliser des rituels et des symboles profondément enracinés pour susciter une résonance émotionnelle, en servant de point de rassemblement pour l'auditoire"]	Les récits oraux africains, et particulièrement ceux déplacés dans le cinéma, reposent sur une compréhension complexe de la collectivité. Le griot, figure centrale, est bien plus qu’un conteur. Il est le gardien de l’histoire, imprégnant ses récits d'une sagesse et d'une mémoire vivantes qui engagent chaque auditeur à devenir une partie prenante de l'histoire. Cela contraste avec le système hollywoodien où la création de mondes fictifs visait à transporter le public loin de son quotidien dans une évasion consommable. \nLa tension qui offre une richesse narrative est à la fois dans la résistance africaine à l'homogénéisation culturelle et dans la capacité des cinéastes d'Hollywood classique à construire des mythologies universellement compréhensibles. Les valeurs africaines comme l'Ubuntu, qui insistent sur l'interconnexion humaine et la solidarité, contrastent et complémentent la quête hollywoodienne de héros individuellement puissants, créant ainsi une synthèse intrigante dans la narration cinématographique.	["Orfeu Negro (1959) — Une fusion poétique de mythologie africaine et de mélancolie moderne","La Noire de… (1966) — Un film de Sembène Ousmane sur l'aliénation et la lutte post-coloniale","Casablanca (1942) — Hollywood classique illustrant la profondeur des archétypes humains dans une toile internationale","Tsotsi (2005) — Une narration moderne de rédemption et de communauté dans le contexte sud-africain"]	Pour les créateurs d'aujourd'hui, la leçon la plus précieuse à tirer de cette analyse est l'importance de l'authenticité dans l'émotion et la véritté sociale. En tissant des histoires qui respectent les valeurs culturelles profondes tout en adoptant des techniques innovantes de narration cinématographique, il est possible de capturer l'essence de ce qui connecte chaque spectateur, indépendamment de l'éloignement de leur culture d'origine. La fusion des perspectives permet non seulement de diversifier les récits mais renforce également leur impact global.\nExtrapoler les enjeux locaux pour toucher à l'universel est essentiel. Le cinéma actuel bénéficie de la richesse d'une tradition orale africaine robuste associée à la structure narrative solide de l'âge classique de Hollywood, inspirant non seulement à raconter des histoires qui divertissent, mais aussi à engager, à éduquer et à unir.	["Identité culturelle et mémoire","Communauté et individualisme","Libération et captivité émotionnelle"]	8	t	["557f6a07-8d82-4bc1-8691-1e99099f4e42"]	2026-05-06 09:57:10.954722
5781930e-0197-4f00-babd-1e998fe9e0bb	Les Tissages du Dharma : La Grammaire des Conflits en Inde et Bollywood	conflict_grammar			\N	\N	indian	Indienne & Bollywood					La culture cinématographique et narrative de l'Inde, enracinée dans des textes anciens comme le Mahabharata et le Ramayana, met en scène des conflits qui ne sont pas seulement des oppositions de forces mais des explorations profondes du dharma, ou du devoir moral. Contrairement à d'autres traditions où le conflit peut être un simple duel ou affrontement direct, ici, il est souvent une quête de signification, d'identité et d'équilibre entre le bien individuel et collectif. Le cinéma indien, en particulier à travers Bollywood, réinterprète ces archétypes pour aborder des thèmes modernes tout en conservant des résolutions qui privilégient la transformation intérieure, le sacrifice, et la réconciliation cathartique. Les œuvres de Satyajit Ray et les récits épiques dravidiens infusent une richesse qui permet aux auteurs contemporains de puiser des dynamiques narratives puissantes qui sont autant ancrées dans la tradition que dans l'universalité des émotions humaines.	["TECHNIQUE 1 — Dharma vs Artha : En juxtaposant les valeurs éthiques et les gains matériels, permettez aux personnages de naviguer entre leur devoir et leurs ambitions.","TECHNIQUE 2 — Les Multiples Facettes de l'Adversaire : Introduisez des adversaires complexes montrant des qualités autant que des défauts, soulignant la dualité des émotions humaines.","TECHNIQUE 3 — Le Pacte de Silence : Utilisez le silence stratégique pour intensifier la tension dramatique et dévoiler lentement les vérités émotionnelles.","TECHNIQUE 4 — Sacrifice pour le Plus Grand Bien : Incarnez le sacrifice personnel de manière à ce qu'il résonne avec des implications universelles.","TECHNIQUE 5 — Catharsis à Travers la Danse et la Musique : Intégrez des séquences musicales pour articuler et résoudre les conflits émotionnels sous-jacents."]	["PRINCIPE ÉMOTIONNEL 1 — Dharma : Réfléchissez aux dilemmes moraux de manière à toucher des thèmes universels du devoir et de l'humanité.","PRINCIPE 2 — Réconciliation : Proposez une résolution qui se concentre sur la compréhension mutuelle et l'harmonie retrouvée.","PRINCIPE 3 — Transformation de l'Intérieur : Permettez aux personnages de changer profondément, impactant le monde extérieur indirectement par leur croissance personnelle."]	En Inde, le concept de 'dharma' joue un rôle primordial dans la définition du conflit. Les histoires ne sont pas seulement des histoires de héros contre vilains mais des études de la moralité où chaque personnage, même antagoniste, a sa place dans l'ordre cosmique. Cette perspective mène souvent à des conflits internes autant qu'externes, où les choix personnels doivent être balancés avec les attentes sociales et communautaires. Ces récits, tels que vus dans l'industrie cinématographique Bollywood, mettent en valeur la tension entre tradition et modernité, entre engagements familiaux et aspirations personnelles.	["Mahabharata (texte ancien) — Un récit épique explorant le dharma à travers la guerre, la famille et le destin.","Ramayana (texte ancien) — Une histoire de loyauté, d'exil et de retour qui examine le conflit entre devoir et émotion.","Pather Panchali (1955, Satyajit Ray) — Un portrait réaliste de la vie rurale en Inde, centrée sur les luttes des protagonistes pour la survie et la dignité.","Lagaan (2001) — Un film Bollywood qui réinvente le conflit colonial à travers une trame sportive, symbolisant la lutte pour l'identité et la solidarité."]	Pour les auteurs d'aujourd'hui, la richesse des récits indiens offre des possibilités d'interroger le statut quo plutôt que de simplement se hâter vers le climax. Les histoires peuvent être utilisées pour explorer les dilemmes moraux et les vérités complexes au-delà des solutions simplistes. Intégrant le chant et la danse dans la trame narrative, un conteur moderne peut transmettre des émotions intenses tout en exposant des tensions sociales sous-jacentes. En se basant sur ces modèles, les écrivains peuvent s'efforcer de tisser des récits où les personnages, peu importe leur statut de 'héros' ou 'antagoniste', sont réels, nuancés, et responsables de leurs choix, élargissant ainsi l'impact émotionnel et intellectuel de leurs œuvres.	["Dharma et Moralité","Loyauté vs Ambition","Transformation par le Sacrifice"]	8	t	["c4cc111f-5c3f-4ac0-be2e-8daa4eebc376"]	2026-05-06 09:58:19.446978
a5ba33c8-4101-4ec7-ad3b-6263b6b0ae50	Entre Passion et Illusion : Amour à travers le prisme gréco-latin	synthesis			\N	\N	western	Occidentale	latin	Latino-américaine		Amour et attachement 	L'amour et l'attachement sont des thèmes universels traités différemment par la tradition occidentale et latino-américaine. En Occident, de Platon à Sartre, l'amour souvent questionne la dualité âme-corps et est fréquemment sublimé par des perspectives philosophiques et religieuses, comme dans le christianisme où l'amour inconditionnel est valorisé. La modernité, avec les Lumières et le modernisme, se concentre plus sur les aspects rationnels et existentiels de l'amour. À l'inverse, la culture latino-américaine, avec le réalisme magique et les telenovelas, explore l'amour à travers des récits où la passion intense et les dimensions extraordinaires sont essentiels. Les œuvres d'Iñárritu et Borges démontrent que l'amour est vécu comme un mystère enchevêtré dans le quotidien miraculeux. Ce croisement révèle le potentiel de créer des récits universels qui montrent l'amour à travers le prisme du banal et de l'extraordinaire, tout en restant profondément ancrés dans des vérités humaines essentielles.	["TECHNIQUE 1 — La Distorsion Chronologique : Mélangez lignes temporelles disjointes pour exprimer la nature atemporelle de l'amour, en lien avec les souvenirs et les réminiscences.","TECHNIQUE 2 — L'Évocation du Sacré : Impliquez un symbolisme religieux infusé de magie pour renforcer les attachements émotionnels.","TECHNIQUE 3 — Le Paradoxe Emotionnel : Mettez en lumière des sentiments contradictoires pour exprimer la complexité des attachements humains.","TECHNIQUE 4 — Fusion des Genres : Intégrez des éléments de mélodrame et de philosophie pour créer des récits profondément empathiques et intellectuels.","TECHNIQUE 5 — Personnages-Univers : Dépeigne l’amour comme un personnage-foyer autour duquel gravitent d’autres personnages, permettant une exploration continue et renouvelée de l’attachement."]	["PRINCIPE ÉMOTIONNEL 1 — L'Ambivalence : Représenter la complexité émotionnelle des personnages à travers des situations qui révèlent à la fois vulnérabilité et désir.","PRINCIPE 2 — Réalisme Magique : Utiliser des éléments surnaturels pour amplifier l'impact émotionnel des expériences d'amours impossibles ou perdus.","PRINCIPE 3 — L'Intemporel : Nourrir une sensation de durée infinie dans les relations amoureuses, par des répétitions cycliques et des motifs récurrents."]	Les traditions occidentales ont longtemps balancé entre la raison et l'émotion dans le traitement de l'amour, où la philosophie grecque voit l'amour comme une quête de complétude divine et transcendantale. Le christianisme valorise l'amour altruiste et le sacrifice, tandis que le modernisme met en avant le questionnement de ces idéaux face à l'individualité contemporaine. Simultanément, la culture latino-américaine est ancrée dans la vivacité des sentiments humains et des récits dynamiques où la passion peut transcender la réalité physique. Dans le réalisme magique, l'intégration du surnaturel démontre que l’amour est supérieur aux contraintes terrestres. La tension entre ces deux foyers culturels — la raison contre l'émotion, le banal contre le magique — crée un espace fertile pour des récits qui défient les catégorisations strictes de ce que signifie l'amour.	["Symposium de Platon (IVe siècle av. J.-C.) — Un dialogue philosophique explorant la nature transcendante de l'amour.","L'Amour aux temps du choléra de Gabriel García Márquez (1985) — L'histoire d'un amour intemporel porté par le réalisme magique.","Amour de Michel Haneke (2012) — Une exploration moderne de l'intimité amoureuse face à la vieillesse et la mortalité.","Le Labyrinthe des esprits de Carlos Ruiz Zafón (2016) — Un enchevêtrement de mystères et d'amours magiques dans une Barcelone enchanteresse."]	Les auteurs contemporains peuvent puiser dans une compréhension profonde des tensions entre passion et raison pour créer des récits qui résonnent sur plusieurs niveaux. En exploitant à la fois la rationalité occidentale et le mysticisme émotionnel latino, ils peuvent rendre l'universel tangible et vivant. Expérimenter avec la temporalité narrative et intégrer des éléments symboliques religieux et philosophiques offre la possibilité d'ancrer une histoire d'amour dans une plus grande perspective humaine. Ce faisant, les récits peuvent résonner davantage en capturant à la fois l'intellect et le cœur des lecteurs modernes.	["Dualité âme et corps","Sacrifice et rédemption","Passion transcendantale"]	8	t	["2310eacd-7312-4436-83a1-6259fb8d547b"]	2026-05-06 10:00:01.136721
c61a913f-bf67-4407-983b-d9b0db4f68a3	Entre Tradition et Réinvention: L'Évolution du Cinéma Parlant en Asie de l'Est	standard	contemporary	Contemporain	2015	2024	east_asian	Asie de l'Est			cinema		Au cours de la dernière décennie, le cinéma asiatique, en particulier en Asie de l'Est, a vu une expansion phénoménale grâce à la montée en puissance des plateformes de streaming globales. Cette période contemporaine a marqué une convergence rare de voix émergentes et de narrations diversifiées, portées par des cinéastes comme Park Chan-wook et Zhang Yimou. La richesse des récits va de pair avec un ensemble complexe de techniques cinématographiques qui fusionne tradition et innovation, comme les récits non linéaires, la mise en valeur des paysages naturels, et l'incorporation d'éléments mythologiques modernes. Les algorithmes jouent désormais un rôle crucial dans la diffusion et la découverte de ces œuvres, créant une nouvelle dynamique d'accès qui démocratise les histoires tout en dictant certaines lignes directrices commerciales. Dans ce contexte, les récits des cinéastes d'Asie de l'Est se distinguent par leur capacité à commenter des thématiques contemporaines telles que l'identité culturelle, l'évolution technologique et les tensions intergénérationnelles.	["TECHNIQUE 1 — Symbolisme visuel : Utiliser des couleurs et motifs récurrents pour représenter des états émotionnels et thèmes narratifs. Intégrer ces éléments pour enrichir la profondeur émotionnelle.","TECHNIQUE 2 — Hybridation des genres : Combiner le wuxia traditionnel avec le thriller moderne pour subvertir les attentes narratives.","TECHNIQUE 3 — Narration fragmentée : Structurer le récit en fragments temporels pour déstabiliser le spectateur et maintenir l'engagement.","TECHNIQUE 4 — Ambiguïté morale : Développer des personnages dont les choix ne sont ni complètement bons ni mauvais, permettant une exploration complexe de la moralité.","TECHNIQUE 5 — Utilisation des paysages naturels : Exploiter les environnements naturels pour renforcer l'atmosphère et bien ancrer l'histoire dans ses racines culturelles."]	["PRINCIPE ÉMOTIONNEL 1 — Catharsis à travers la violence stylisée : Traiter la violence non seulement comme un outil narratif, mais comme un moyen de catharsis émotionnelle pour le spectateur.","PRINCIPE 2 — Nostalgie culturelle : Évoquer une connexion émotionnelle en intégrant des éléments culturels historiques ou traditionnels qui rappellent une identité collective.","PRINCIPE 3 — Tension dramatique par le silence : Utiliser des pauses silencieuses pour amplifier la tension émotionnelle, permettant au spectateur de ressentir pleinement chaque interaction."]	Le cinéma en Asie de l'Est, et en particulier en Corée du Sud et en Chine, se nourrit d'une riche tradition narrative où les récits sont profondément liés aux valeurs de l'honneur, de la famille, et de la communauté. Ces histoires reflètent souvent des tensions entre modernité et tradition, abordant des questions contemporaines par le prisme de récits ancrés dans une mythologie ancienne ou une histoire nationale particulière. La société contemporaine, confrontée à la rapide urbanisation et à la mondialisation, voit dans ces films une manière de réfléchir sur son identité en mutation. Les récits provenant de cette région servent souvent à questionner et réévaluer les croyances traditionnelles, tout en offrant des miroirs aux défis imposés par les changements sociaux et économiques rapides.	["The Handmaiden (2016) — Un thriller psychologique de Park Chan-wook qui explore la manipulation et le désir à travers une lentille historique.","Shadow (2018) — Réalisé par Zhang Yimou, un wuxia dont les visuels monochromes marient tradition et modernité.","Train to Busan (2016) — Un film de zombie coréen qui mêle habilement l'horreur avec une critique sociale contemporaine.","Parasite (2019) — Réalisé par Bong Joon-ho, il brouille les lignes entre les classes sociales avec une narration innovante et une critique poignante de la société moderne."]	Les créateurs peuvent tirer profit de l'intégration des éléments culturels locaux dans une perspective narrative globale, reflétant ainsi de manière authentique et riche des aspects de leur propre société tout en rendant leurs œuvres accessibles à un public international. Le contraste entre tradition et modernité, fortement présent dans le cinéma d'Asie de l'Est, peut inspirer les auteurs à explorer des conflits similaires dans leurs contextes culturels. En expérimentant avec des structures narratives non conventionnelles, comme le fait le cinéma coréen, les créateurs peuvent captiver et surprendre leur public, tout en utilisant la familiarité pour garantir une expérience émotionnelle complice. La montée de l'IA et des algorithmes dans le cinéma en streaming peut aussi être vue comme une opportunité d'expérimenter et de tester des formes narratives interactives et personnalisées pour enrichir l'engagement de l'audience.	[]	0	t	["4718c1dd-c6a5-4362-ba8c-fae0ccf6e05d","b22b8020-10e8-4f10-bfc1-976ee7ca76cb","1f679633-fdd5-4ed8-ac32-ad179a755d49"]	2026-05-07 17:28:16.377174
b33768ce-9657-48b4-b6bd-db7e95a2a6fc	Entre Lumières et Ombres : Narratives de l'Âge d'or et Pensée Européenne	standard	golden_age	Âge d'or	1930	1960	western	Occidentale			literature		L'âge d'or d'Hollywood, de 1930 à 1960, a laissé une empreinte indélébile sur le récit littéraire et filmique. Dès l'émergence des studios, un système rigide mais fertile a favorisé la création d'œuvres marquantes qui reflètent et renforcent les idéaux occidentaux. En parallèle, la philosophie européenne, irriguée par l'héritage grec, le christianisme et les Lumières, cristallise une quête de l'individualité et de la raison confrontée aux forces de la modernité. Ce contexte nourrit la création d'histoires profondément ancrées dans les tensions entre le collectif et l'individu, entre foi et doute, entre idéalisme et réalisme. Aujourd'hui, ces récits continuent à résonner car ils interrogent l'existence et l'identité dans des sociétés technologiquement avancées mais en quête de sens.	["Évolution des Archétypes — modèle archétypal et arc de transformation : Plongez dans un modèle de personnage aux racines profondes, inspiré des mythes, et appliquez-le à un arc de personnage moderne en intégrant les transformations sociales contemporaines.","Dualité Réaliste/Idéaliste — juxtaposition réaliste : Intégrez des tensions entre ce qui est et ce qui devrait être, un marqueur de l'efficacité néoréaliste, pour générer des conflits internes et externes complexes.","Narration Polyphonique — dialogue et divers points de vue : Enrichissez votre récit avec plusieurs perspectives narratives pour refléter la complexité et l'hétérogénéité des voix européennes.","Symbolisme Chrétien — sous-texte symbolique : Utilisez subtilement l'imagerie chrétienne pour explorer des thèmes de rédemption et de sacrifice, réinterprétés sous un prisme moderniste.","Rhétorique de la Lumière — juxtaposition théorique : Adoptez la structuration claire et rationnelle des Lumières pour éclairer des questions morales et philosophiques d'actualité."]	["Catharsis Intellectuelle — libération par la pensée : Genérez une libération émotionnelle chez le public en provoquant leur réflexion sur des dilemmes éthiques et philosophiques.","Tension-Relâchement — modulation rythmique : Maintenez l'intérêt du spectateur grâce à une alternance minutée entre moments de haute tension et résolution apaisante.","Identification Empathique — immersion avec multiplicité : Permettez au lecteur de se connecter émotionnellement à des personnages aux perspectives diverses, amplifiant la portée émotionnelle par une richesse narrative."]	L'impulsion première de l'âge d'or hollywoodien est marquée par des valeurs narratives qui oscillent entre les idéaux collectifs et la célébration de l'individualité. Ces films, souvent construits autour de héros qui incarnaient l'esprit de résilience et d'aspiration, trouvaient leurs racines et leur inspiration dans une culture américaine influencée par l'Europe. Au sein de la littérature, la philosophie grecque apportait une structure héroïque, le christianisme une dimension morale de rédemption et les Lumières une quête incessante de la logique et de la raison.\n\nDans le même temps, l'Europe connaissait un tumultueux bouleversement de certitudes, traversant des crises d'identité post-guerre tout en jonglant avec les menaces atomiques et les débuts de la décolonisation. Ce contexte infuse les œuvres littéraires d'une introspection et d'une pluralité de voix, reflet d'une société en évolution, à la recherche de nouvelles vérités et d'une compréhension renouvelée de l'existence humaine.	["Citizen Kane (1941) — Un exemple paradigmatique de la mise en abyme narrative et d'une critique acerbe des dynamiques de pouvoir.","La strada (1954) — Une exploration néoréaliste de la dignité humaine face à la cruauté, tissée de symbolisme chrétien.","À bout de souffle (1960) — Un manifeste du modernisme cinématographique influencé par la littérature existentialiste.","La dolce vita (1960) — Un riche tissu narratif entre le néo-réalisme et le symbolisme, reflétant les crises morales de la modernité."]	Pour l'auteur d'aujourd'hui, il est vital de capter les dualités intrinsèques à la condition humaine, enrichissant toute trame narrative par une opposition fertile entre idéalisme et réalisme. En intégrant des thèmes empruntant à la philosophie classique, mais réinterprétés dans un cadre contemporain, l'artiste peut converger des traditions narratives anciennes avec des préoccupations modernes. Aussi, en diversifiant les points de vue et en harmonisant les ambitions dramatiques et subtilement intellectuelles, l'écrivain renforce l'impact émotionnel et intemporel de son œuvre.\n\nPour donner vie à un récit puissant, il faut être attentif à la crédulité du symbolisme et sa résonance dans l'expérience humaine partagée. L'embrigadement d'arcs de personnages réalistes mariés à une exploration des dilemmes moraux permet une exploration raffinée des complexités modernes, tout en assurant que les récits restent accessibles et émotionnellement engageants pour un public diversifié.	["Identité individuelle et collective","Tension entre foi et raison","Idéalisme vs pragmatisme"]	8	t	["75f19cd1-f730-41cf-893b-c0edc66a5488","ae784725-9c85-4e00-a433-91a7c5a498ce"]	2026-05-07 19:18:58.243288
f6df1e64-0af2-402c-a4fc-5fb4c77eb1cb	La Quête Inassouvie : L'Art de Capturer le Désir Insatisfait	emotional_atlas			\N	\N						Désir insatisfait	Le désir insatisfait est une émotion narrative puissante qui englobe l'aspiration intense mais inaboutie d'un protagoniste envers un objectif, une personne, ou une idée. Historiquement, cette émotion a été exploitée dans diverses cultures pour souligner la condition humaine de tension entre espoir et désillusion. Les œuvres classiques de la littérature romantique européenne, comme celles de Goethe et de Flaubert, ou les films néoréalistes italiens, illustrent ce thème magnifiquement grâce à des techniques narratives qui font résonner les aspirations humaines universelles. Dans un contexte moderne, comprendre et utiliser ces ressorts émotionnels permettent aux auteurs de relater des récits profonds qui trouvent un écho même dans les sociétés actuelles fragmentées et précaires.	["TECHNIQUE 1 — L'Objet Imposible : Place un obstacle insurmontable entre le protagoniste et l'objet de son désir (légumes de 'Gatsby le Magnifique').","TECHNIQUE 2 — Le Retour à Zéro : Construit une situation où le protagoniste semble se rapprocher du désir, avant d'être brutalement repoussé à son point de départ ('Madame Bovary').","TECHNIQUE 3 — La Promesse Brisée : Établis une promesse explicite ou implicite qui est inévitablement échouée ('Les ailes du désir').","TECHNIQUE 4 — L'Effondrement des Illusions : Développe une prise de conscience progressive où l'objet du désir perd de son éclat (parfois lié à la maturation du protagoniste).","TECHNIQUE 5 — L'Échéance fatidique : Inscris le récit dans un temps clos où chaque tentative d'atteindre le désir s'achemine vers une échéance inévitable (inspiration du théâtre grec)."]	["PRINCIPE ÉMOTIONNEL 1 — Frustration Accumulée : L'effet est décuplé par une construction progressive et répétée des espoirs, suivie de déceptions.","PRINCIPE 2 — Identification Empathique : Le désir est amplifié lorsque le lecteur se voit transférer dans les aspirations du protagoniste.","PRINCIPE 3 — Inéluctabilité Tragique : Le public doit pressentir l'impossibilité du succès, créant un sentiment de tragédie inéluctable."]	Les cultures européennes, notamment durant la période romantique, ont excellé dans la représentation du désir insatisfait, souvent par une subtile critique de la société bourgeoise et ses conventions restrictives. Le désir devient un vecteur de critique sociale tout autant qu'un drame personnel, révélant les conflits entre l'individu et les normes culturelles. De son côté, le cinéma néoréaliste italien, à travers sa peinture des rêves des gens ordinaires contre un décor de désillusion post-guerre, a capturé les tensions entre aspirations personnelles et réalités socio-économiques impitoyables.	["Le Rouge et le Noir de Stendhal (1830) — Un jeune provincial désire réussir socialement mais se heurte aux limites de classe et à son propre caractère.","Madame Bovary de Gustave Flaubert (1857) — La quête romantique et insatisfaite d'Emma pour une vie plus exaltée que son quotidien provincial.","Les Lumières de la ville de Charlie Chaplin (1931) — Le 'Petite Tramp' poursuit l'amour avec espoir malgré des malentendus constants et des obstacles sociaux.","Ladri di biciclette de Vittorio De Sica (1948) — Un simple ouvrier cherche à retrouver son vélo volé, essentiel pour sa survie, symbolisant un désir insatisfait de dignité."]	Pour l'auteur contemporain, tisser une histoire autour du désir insatisfait signifie capturer la perception fluide de la réalité que vivent beaucoup de lecteurs modernes. Dans un monde où les structures de stabilité (emploi, identité, sécurité) sont souvent incertaines, ce thème résonne fortement. L'auteur doit manier habilement l'équilibre entre l'espérance insufflée et la réalité implacable pour maintenir l'intérêt tout en procurant une catharsis par l'acceptation ou la fuite en avant vers de nouvelles aspirations. Exploiter des perspectives marginales ou des contextes culturels diversifiés peut enrichir la portée d'un tel récit.	["Conflit entre aspiration et réalité","Illusion et désillusion","Persévérance et acceptation"]	9	t	["f286abc2-8cfa-4c42-aca3-dba78c3808f5"]	2026-05-10 22:11:36.454453
ffc57a3b-73be-4f4a-a05e-87f10407d467	Réécrire l'épopée : Le Renouveau du Mythe Indien dans le Cinéma Contemporain	standard	contemporary	Contemporain	2015	2024	indian	Indienne & Bollywood			cinema		Au cœur de l'ère numérique, le cinéma indien se réapproprie ses mythes fondateurs tout en embrassant la modernité apportée par la globalisation et les plateformes de streaming. Cette période voit une résurgence des récits inspirés de la Mahabharata et du Ramayana, intégrés dans des contextes modernes pour aborder des thématiques contemporaines comme les inégalités sociales et les conflits identitaires. Avec des voix émergentes qui cherchent à défier les stéréotypes bollywoodiens, il y a un effort concerté pour redéfinir la représentation culturelle à travers une lentille internationale. Cette transformation est accentuée par l'utilisation d'algorithmes de streaming qui permettent une diffusion plus large et diversifiée des œuvres, apportant ainsi une nouvelle audience mondiale aux traditions narratives indiennes.	["TECHNIQUE 1 — narration non linéaire : Utiliser des sauts temporels inspirés de la structure complexe de la Mahabharata pour surprendre le spectateur moderne et maintenir son engagement.","TECHNIQUE 2 — juxtaposition culturelle : Intégrer des éléments dravidiens dans des récits contemporains pour enrichir la diversité narrative et créer des mondes plus authentiques.","TECHNIQUE 3 — musique narrative : Exploiter la tradition musicale de Bollywood de manière à commenter l'action narrative ou le développement des personnages.","TECHNIQUE 4 — symbolisme visuel : Appliquer des symboles classiques retirés des fresques mythologiques pour évoquer des émotions profondes et créer une résonance culturelle.","TECHNIQUE 5 — dialogues poétiques : Utiliser le style poétique des épopées classiques pour donner une profondeur émotionnelle et philosophique aux dialogues cinématographiques."]	["PRINCIPE ÉMOTIONNEL 1 — dualité émotionnelle : Créer des personnages aux motivations complexes pour refléter les dilemmes moraux présents dans les textes épiques.","PRINCIPE 2 — quête identitaire : Exploiter les thèmes de quête personnelle pour générer une réflexion sur la diversité et l'acceptation de soi.","PRINCIPE 3 — empathie universelle : Raconter des histoires qui touchent à l'universalité des expériences humaines, même à travers un prisme culturel spécifique."]	Bollywood, plus qu'un simple outil de divertissement, sert souvent de miroir socioculturel en Inde et à l'étranger. Alors que les récits épiques comme le Mahabharata et le Ramayana racontent les luttes humaines intemporelles, le cinéma contemporain utilise ces histoires pour aborder des sujets modernes tels que la corruption, les luttes de caste, et la politique de genre. Dans cette constellation narrative, les mythes classiques retrouvent une nouvelle vie, transformés pour refléter les valeurs contemporaines comme l'égalité, la tolérance et la quête de justice. Cependant, cette réécriture n'est pas sans tensions ; les créateurs doivent naviguer entre tradition et innovation, respect des coutumes et critique sociale. En offrant une plateforme à des voix marginalisées, le cinéma indien moderne ouvre des dialogues sur des questions pressantes et universelles. Ainsi, la définition d'une 'bonne histoire' dans ce contexte devient synonyme de pertinence sociétale et de profondeur émotionnelle, tout en étant ancrée dans des valeurs culturelles éternelles.	["Baahubali: The Beginning + 2015 + Une saga épique qui mélange tradition mythologique et effets spéciaux modernes.","Dangal + 2016 + Un récit inspirant de conquête personnelle et de défis sociétaux à travers le sport.","Tumbbad + 2018 + Une exploration horrifique des mythes locaux alliée à une cinématographie poétique.","Article 15 + 2019 + Un thriller policier qui aborde les inégalités de caste en s'inspirant d'événements réels."]	Les créateurs du cinéma indien contemporain doivent réussir l'équilibre délicat entre tradition et innovation. Dans un monde où les frontières narratives s'effacent, l'ancrage dans une culture riche et un patrimoine mythologique devient un atout distinctif. Cependant, pour capter l'imaginaire d'un public global, il est essentiel de voir ces histoires à travers une lentille humaniste qui transcende les barrières culturelles. Les thématiques éternelles des mythes indiens, telles que le destin, le devoir, et l'amour, doivent être réinterprétées par des perspectives modernes, tout en conservant leur essence universelle.	[]	0	t	["bb519150-3c36-498b-b95a-661479caec48"]	2026-05-08 08:54:12.086547
f2f78616-69ee-406c-875a-b19ed6fd2584	Fusion Mystique : La Quête de Réalisme Magique dans le Streaming Contemporain	standard	contemporary	Contemporain	2015	2024	latin	Latino-américaine			cinema		Dans le paysage audiovisuel contemporain dominé par les plateformes de streaming, les voix émergentes latino-américaines se distinguent par une exploration renouvelée du réalisme magique. Inspirés par les traditions littéraires de Borges et les innovations cinématographiques de Buñuel et Iñárritu, ces narrateurs revisitent les légendes et les réalités de leur culture pour les audiences globales. Cela pose des questions essentielles sur la diversité narrative et l'évolution des algorithmes qui, tout en encourageant la diversité, tendent à homogénéiser les récits. Les créateurs explorent la fine ligne entre réalité et imaginaire, métissée de préoccupations contemporaines telles que l'identité post-coloniale et la résistance culturelle face à la mondialisation.	["TECHNIQUE 1 — Métissage narratif : mélange de réalités individuelles et collectives en une seule trame, par l'utilisation de divers points de vue et de non-linéarité narrative pour refléter la complexité de la vie latino-américaine d'aujourd'hui","TECHNIQUE 2 — Symbolisme visuel : créer un langage visuel chargé de signes culturels locaux qui transmettent émotion et contexte sans dialogue explicite","TECHNIQUE 3 — Polyphonie culturelle : intégrer des dialogues dans différentes langues et dialectes pour enrichir l'authenticité et la profondeur des personnages","TECHNIQUE 4 — Temporalité fluide : employer des sauts temporels et des ellipses pour simuler une temporalité hors du temps perçue dans les contes et la mémoire collective","TECHNIQUE 5 — Mythologie contemporaine : utiliser les mythes ancestraux dans un contexte moderne pour offrir des métaphores de défis actuels tels que la migration et la lutte pour la justice sociale"]	["PRINCIPE ÉMOTIONNEL 1 — Intersection de la réalité et du mysticisme : exploiter la tension entre le cognitif et le mystérieux pour provoquer une catharsis collective","PRINCIPE 2 — Empathie interculturelle : créer des arcs émotionnels universels qui penchent vers les particularismes culturels pour encourager une compréhension profonde chez des audiences mondiales","PRINCIPE 3 — Résonance du familier et de l'étrange : jouer avec le connu et l'inhabituel pour mettre le spectateur dans un état de découverte perpétuelle"]	La culture latino-américaine est riche en histoires tissées depuis des siècles, où la vérité et la fable se chevauchent. Familiarité et mystère se rencontrent dans des récits célébrant l'identité, l'endurance et la résilience face aux oppressions historiques. Dans cet espace, la 'bonne histoire' est celle qui réussit à combiner les éléments indélébiles du passé et ceux du présent en un récit homogène et puissant. Les tensions entre modernité et tradition, entre l'endogène et l'exogène, se reflètent continuellement dans les œuvres contemporaines.	["Birdman (2014) par Alejandro Iñárritu — explore les méandres psychologiques et transcende la métaphysique de l'art dans un univers urbain pourtant claustrophobe","Roma (2018) par Alfonso Cuarón — tisse un récit beau et poignant de l'enfance et des classes sociales au Mexique à travers la lenteur et le détail","The Shape of Water (2017) par Guillermo del Toro — allégorie moderne de l'amour et de la marginalité à travers la mise en scène d’une créature mythologique","Embrace of the Serpent (2015) par Ciro Guerra — une épopée de la mémoire culturelle confrontant le colonialisme dans des jungles oniriques"]	Pour les auteurs contemporains, il est crucial de comprendre que la singularité culturelle n'est pas seulement un ornement narratif, mais un moyen d'universalité. Les plateformes globales offrent l’opportunité de partager des récits personnels qui résonnent sur des thèmes universels. En utilisant les mythologies inhérentes et les récits locaux comme outils plutôt que comme fins en soi, les auteurs peuvent captiver un public mondial tout en préservant l'intégrité culturelle. Intégrer l'identité culturelle tout en naviguant dans les contraintes des algorithmes dominants nécessite une stratégie narrative consciente, qui équilibre particularisme et accessibilité.	[]	0	t	["4f35ba00-2fcb-45b7-8930-4ded55ee46b4"]	2026-05-09 14:08:03.618744
8828893d-ab47-4306-86ae-5887fb4f85d3	Entre Algorithmes et Ambiances: La Nouvelle Vague Japonaise Stratégique	standard	contemporary	Contemporain	2015	2024	japanese	Japonaise			cinema		Le cinéma japonais contemporain, dans le contexte de la domination des plateformes de streaming globales et des algorithmes, interagit avec une diversité narrative plus rayonnante que jamais. En s'appropriant les traditions du manga et de l'anime, ainsi que les esthétiques de cinéastes comme Kurosawa et Ozu, les réalisateurs japonais explorent des thèmes allant de l'intimité domestique aux récits épiques, tout ceci dans le cadre de notre ère interconnectée. Le cinéma parlant japonais moderne intègre le minimalisme wabi-sabi avec des éléments visuels hypermoderne, créant une narration fluide entre passé et présent. Cette interaction dynamique évoque à la fois une sensibilité nostalgique et une innovation technologique, posant la question de l'authenticité et de l'artisanat dans un monde saturé par la technologie. Avec des voix émergentes et diversifiées prenant le devant de la scène, l'univers narratif japonais devient une tapisserie vibrante de tensions et de résolutions.	["TECHNIQUE 1 — Mono no Aware : Articuler des émotions subtiles à travers des scènes visuellement calmes mais puissantes, capturant la beauté éphémère de la vie — utiliser dans des scènes d'émotion accrues pour renforcer la profondeur narrative.","TECHNIQUE 2 — Ma : Utilisation du timing et des silences pour créer rythme et tension — incorporer pour permettre aux spectateurs d'interpréter l'ineffable.","TECHNIQUE 3 — Kintsugi Narratif : Intégration des imperfections de personnages pour tisser des arcs narratifs de rédemption et renouveau — appliquer dans le développement de personnages complexes.","TECHNIQUE 4 — Cadre Architecturé : Utilisation de compositions visuelles précises influencées par le design spatial traditionnel — appliquer pour renforcer l'expérience immersive.","TECHNIQUE 5 — Wii-no-Michi : Équilibrer la tradition et l'innovation pour capturer l'essence d'une histoire — application pour articuler une narration autour des conflits générationnels."]	["PRINCIPE ÉMOTIONNEL 1 — Empathie Prolongée : Susciter une connexion émotionnelle profonde par des portraits intimes et détaillés de la vie quotidienne.","PRINCIPE 2 — Contradiction Harmonique : Intégrer des éléments contradictoires d'émotion pour créer des personnages réalistes et dynamiques.","PRINCIPE 3 — Résonance Temporelle : Employer des structures temporelles multiformes pour éveiller des émotions liées au souvenir et au passage du temps."]	Le cinéma japonais contemporain est profondément enraciné dans les philosophies esthétiques du wabi-sabi, valorisant la beauté dans l'imperfection et la transience, et du ma, qui célèbre le vide et la pause intentionnelle. Ces valeurs culturelles offrent une perspective unique sur la narration qui met l'accent sur la subtilité et la profondeur émotionnelle plutôt que sur l'action rapide. Cette approche contraste avec la narration souvent linéaire et axée sur l'action des récits hollywoodiens, mettant en avant un rythme plus contemplatif. \nLe rôle des plateformes de streaming global amplifie l'accès à une audience mondiale, accentuant la nécessité pour le cinéma japonais de naviguer entre la préservation de son identité culturelle et l'adaptation aux goûts universels. Les récits intimes et introspectifs deviennent ainsi des ponts transculturels, traduisant des expériences humaines universelles à travers une lentille culturelle unique.	["Your Name. (2016) + exploration des thèmes de la mémoire et de l'identité à travers l'animation.","Shoplifters (2018) + portrait nuancé d'une famille en marge de la société moderne.","Weathering With You (2019) + tensions entre nature et société à l'ère du changement climatique.","Drive My Car (2021) + reflet sur la perte personnelle et la résilience à travers une adaptation littéraire."]	Pour les créateurs contemporains, étudier le cinéma japonais moderne offre des leçons précieuses sur l'équilibrage des influences culturelles locales avec la narration universelle. Souligner l'importance de la nuance et de la lenteur dans un monde précipité, les artistes peuvent apprendre à utiliser le silence et l'espace comme outils narratifs puissants. Comprendre la profondeur des interactions humaines et la dynamique des émotions fugaces peut transformer des histoires ordinaires en récits captivants. \nLa tradition japonaise de l'artisanat et du détail subtil rappelle que même dans un contexte globalisé, ancrer une histoire dans la culture locale peut prêter une authenticité qui résonne au-delà des frontières. Les créateurs doivent rester attentifs à l'évolution des préférences des spectateurs tout en gardant leur voix unique, naviguant habilement entre ces dualités.	[]	0	t	["1f753b35-9b08-4e64-895e-064ef101deee"]	2026-05-10 14:08:04.880527
784b14e1-77f4-452f-b3ef-ebdfbb735815	Échos Modernes : Narration, Diversité et Résonance Philosophique	standard	contemporary	Contemporain	2015	2024	western	Occidentale			cinema		À l'ère du streaming global, le cinéma occidental contemporain s'efforce d'intégrer les voix émergentes avec une sensibilité aux algorithmes qui façonnent le paysage médiatique. Ces voix puisent dans un riche héritage culturel — de la philosophie grecque à l'humanisme des Lumières — pour réinventer des récits qui touchent à la fois les racines historiques et les préoccupations postmodernes. Le paradigme de la narration dans cette époque valorise la diversité, non seulement en termes de représentation à l'écran, mais aussi dans les structures narratives elles-mêmes, bousculant les conventions traditionnelles pour s'accorder avec les attentes changeantes des spectateurs mondiaux.\n\nLa pertinence contemporaine réside dans la capacité des récits à dialoguer avec les préoccupations présentes telles que l'identité, la technologie et l'écologie. Le cinéma devient alors un médium réflexif qui questionne et résout les tensions entre l'histoire culturelle occidentale et la multiplicité des voix qui enrichissent aujourd'hui ce socle. L'élément dialectique fondé sur les principes de dialectique et de synthèse hérité de la philosophie grecque trouve ici une application pratique pour construire des récits métissés dont la force réside dans l'équilibre entre particularité et universalité.\n\nLes créateurs naviguent ces nouvelles eaux en embrassant les technologies de diffusion et d'analyse de données numériques, favorisant des expériences cinématographiques adaptées aux sensibilités variées. Cela nécessite une réévaluation constante des techniques narratives traditionnelles pour maintenir une résonance à la fois immédiate et durable.	["TECHNIQUE 1 — Cinéma Algorithmique : Utiliser les données de visionnage pour ajuster la structure narrative, maximisant l'engagement en temps réel.","TECHNIQUE 2 — Voix Polyphoniques : Intégrer des perspectives diverses dans le récit, soutenues par des dialogues qui croisent les contextes culturels.","TECHNIQUE 3 — Symbolisme Écologique : Incarner des thèmes environnementaux à travers des métaphores visuelles insistantes, parlant aux inquiétudes contemporaines.","TECHNIQUE 4 — Dialectique Narrative : Incorporer des éléments de thèse, antithèse et synthèse pour impliquer activement le spectateur dans le développement du récit.","TECHNIQUE 5 — Réalisme Magique Filmique : Intégrer des éléments surnaturels dans un contexte réaliste pour canaliser des vérités émotionnelles subliminales."]	["PRINCIPE ÉMOTIONNEL 1 — Résonance Émotionnelle Transcendante : Créer une connexion émotionnelle en entremêlant des récits personnels avec des idées philosophiques universelles.","PRINCIPE 2 — Introspection Collective : Utiliser les personnages comme miroirs des préoccupations sociales contemporaines pour générer une introspection chez les spectateurs.","PRINCIPE 3 — Tension Créative : Favoriser un conflit interne entre des valeurs traditionnelles et modernes, permettant une exploration cathartique et nuancée."]	Le cinéma occidental contemporain s'enracine dans un socle complexement tissé par la philosophie grecque, le christianisme puisant ses thèmes universels, et les Lumières valorisant la rationalité et l'humanisme. Ces influences ont fourni un cadre solide pour le modernisme, dont les approches innovantes ont cherché à réarticuler les mythes fondateurs de l'Occident en réponse aux bouleversements technologiques et sociaux. Ainsi, le cinéma d'aujourd'hui doit refléter ce dialogue constant entre tradition et innovation.\n\nL'ère numérique a renforcé ces dynamiques en invitant les créateurs à s'adapter à un public mondial dont les attentes incluent à la fois une fidélité culturelle et une ouverture à la diversité. Les plateformes de streaming ont comblé les fossés géographiques, exposant le public occidental à des récits multiculturels, réinterprétant les valeurs humanistes et chrétiennes à la lumière de perspectives nouvelles, enrichissant le discours narratif avec une multiplicité de voix.	["The Favourite (2018) : Un drame historique mêlant satire et tragédie, explorant les relations de pouvoir avec un regard esthétiquement moderne.","Roma (2018) : Un drame intimiste et autobiographique qui met en lumière des thèmes socioéconomiques universels à travers une cinématographie saisissante.","Portrait de la jeune fille en feu (2019) : Un film qui traite de l'amour et de l'art avec une approche narrative contemplative et historique.","The Handmaiden (2016) : Une fusion de thriller et de romance, utilisant des tournures narratives complexes pour explorer des thèmes de domination et de libération."]	Pour les auteurs d'aujourd'hui, il est primordial de comprendre et de naviguer la tension entre l'universalité et la particularité dans leurs récits. Puisant dans la richesse des traditions occidentales tout en incorporant une multitude de voix contemporaines, la narration peut atteindre une profondeur émotionnelle et intellectuelle qui résonne au-delà des frontières culturelles. L'utilisation judicieuse de symboles et de thèmes majeurs permet d'éclairer les dilemmes modernes tout en restant ancrée dans des valeurs humanistes éternelles.\n\nLes techniques empruntées à diverses traditions philosophiques et narratives doivent être réexaminées et retranscrites pour capturer les nuances de notre époque numérique. Opter pour des récits ouverts qui reconnaissent la complexité des identités actuelles et les dures réalités de la globalisation assure une résonance avec une audience mondiale en quête d'authenticité et de sensibilité.	[]	0	t	["a0a7b0ab-cc8d-459c-89a8-4612939f5ae9"]	2026-05-11 20:25:07.297987
8199faaf-2bb6-4ff8-93a8-3adfc93a31ba	Réinventer les Traditions : La Renaissance du Récit Africain Moderne	standard	contemporary	Contemporain	2015	2024	african	Africaine			cinema		L'ère contemporaine du cinéma africain, traversant une décennie marquée par l'essor des plateformes de streaming et l'expansion des algorithmes, voit l'émergence de narrations dynamiques influencées par les racines culturelles diverses du continent. En opérant cette synthèse entre des éléments traditionnels tels que les griots et les contes oraux Yoruba, et des réalités modernes comme le cinéma digital et Nollywood, les cinéastes africains proposent des récits engagés, humanistes et universels. Ce renouveau se caractérise par un besoin d'authenticité et de diversité narrative, tout en se confrontant à la tension entre tradition et modernité. La pertinence contemporaine de ce mouvement réside dans sa capacité à aborder les thématiques d'unité et de diversité, inscrivant ainsi le cinéma africain dans un dialogue mondial autour de l'identité, de la mémoire et de la résilience, unissant les cultures à travers un langage cinématographique innovant.	["TECHNIQUE 1 — Chronique Griotique : Incorporer les techniques de récitation et de transmission orale des griots pour enrichir les dialogues et la narration (utiliser cette technique pour structurer les monologues et relier les arcs narratifs au passé culturel des personnages).","TECHNIQUE 2 — Esthétique Ubuntu : Construire des cadres narratifs qui privilégient la communauté et l'interconnexion, en intégrant des scènes qui montrent la cohésion sociale face à l'adversité (utilisable dans la construction des relations interpersonnelles).","TECHNIQUE 3 — Filtre Nollywood : Exploiter l'énergie dynamique et l'expressivité visuelle propres à Nollywood pour intensifier les émotions et capturer les nuances locales (intégrer des séquences vibrantes et des couleurs fortes).","TECHNIQUE 4 — Symbolisme Yoruba : Utiliser les symboles et les mythes Yoruba pour enrichir les univers des personnages et leur attribuer une dimension sacrée (insérer ces éléments dans les décors et les scénographies).","TECHNIQUE 5 — Récit par Emboîtement : Créer des récits imbriqués reflétant la complexité des récits oraux, permettant de multiples niveaux de signification et de perception (faire apparaître des histoires dans l'histoire principale)."]	["PRINCIPE ÉMOTIONNEL 1 — Nostalgie Collective : Évoquer une sensation de perte et de continuité à travers les générations (à utiliser pour relier le public à ses propres histoires familiales).","PRINCIPE 2 — Résilience Radicale : Montrer le triomphe de l'esprit humain face à l'adversité en utilisant des personnages résilients (créer des arcs narratifs basés sur la survie et la détermination).","PRINCIPE 3 — Catharsis Communautaire : Induire un sentiment de libération émotionnelle partagée (construire des scènes de résolution collective qui unifient le récit)."]	Dans le contexte africain contemporain, le cinéma devient le réceptacle des mythes et des histoires qui ont été portées par les griots à travers les âges. Le socle philosophique de l'Ubuntu, qui pose l'accent sur l'interconnexion humaine et la solidarité, se répercute dans les récits qui valorisent la communauté, l'entraide et le respect des lignées. Ces valeurs, bien qu'éprouvées par les forces de la modernisation et de la mondialisation, demeurent piliers dans la conception d'histoires qui se veulent à la fois miroir et modèle.\n\nCependant, le cinéma africain se trouve à la croisée des chemins entre la préservation de ces traditions ancestrales et l'adaptation à un marché mondial en perpétuelle mutation. Les tensions entre folklore et innovation technologique imposent une réinvention des codes et ouvrent une brèche pour les voix émergentes. À travers ce prisme, les nouvelles réalisations cinématographiques engendrent un espace hybride où coexistent les anciens récits et les récits modernes, formant ainsi une tapisserie riche et diverse qui redéfinit ce que raconte une 'bonne histoire'.	["La Noire de... + 1966 + Premier long métrage africain primé à l'international, par Sembène Ousmane, explorant l'identité post-coloniale.","Cœur de Lion + 2015 + Cette production Nollywoodienne aborde les dynamiques familiales contemporaines au Nigéria avec passion.","The Burial of Kojo + 2018 + Un récit poétique du réalisateur Blitz Bazawule, mélangeant rêve et réalité pour explorer les dynamiques familiales ghanéennes.","Atlantique + 2019 + Un film de Mati Diop qui, sous la bannière du surnaturel, examine les effets de l'émigration sur la communauté sénégalaise."]	Pour les auteurs contemporains évoluant dans l'industrie cinématographique mondiale, puiser dans la richesse des traditions narratives africaines offre une perspective unique et une profondeur émotionnelle qui peuvent transcender les cultures. En comprenant le rôle des conteurs traditionnels comme les griots, un créateur peut infuser dans son travail la même authenticité, tout en répondant aux attentes modernes des audiences globalisées qui recherchent à la fois le familier et l'inattendu.\n\nLes défis résident dans l'équilibre délicat entre maintien des identités culturelles et adoption d'un storytelling plus universel. Créer une narration qui résonne mondialement tout en honorant ses racines demande une sensibilité particulière et un engagement à explorer des structures alternatives. Cultiver une empathie globale, en racontant d'abord des histoires locales, devient non seulement réalisable, mais nécessaire pour établir des connexions significatives à l'échelle mondiale.	[]	0	t	["ae27a4e8-9799-4f58-85d7-9ab64b4ae982"]	2026-05-12 15:38:51.901728
205b8083-fa1f-4c18-977b-04b0b0d679a0	Voix du Flux Numérique : Diversité Narratologique et Algorithmes Cinématographiques	standard	contemporary	Contemporain	2015	2024	western	Occidentale			cinema		L'ère contemporaine du cinéma, dominée par les plateformes de streaming, a vu la montée d'une diversité narrative transmise par des algorithmes de recommandation sophistiqués. Ce qui pourrait sembler être un paradoxe de l'uniformité algorithmique a en fait ouvert des portes à des voix marginalisées, redéfinissant ce que signifie raconter une histoire dans un contexte occidental fortement influencé par des siècles de philosophie grecque, de christianisme et d'idéaux des Lumières. La richesse du modernisme, intégrée dans cette évolution, joue un rôle crucial en soulignant l'incertitude et les conflits psychologiques, donnant naissance à des récits qui, bien que globaux dans leur diffusion, sont profondément enracinés dans les dualités de la pensée occidentale.\nLes systèmes de streaming d'aujourd'hui, en priorisant des récits qui capturent des critères d'engagement mesurables, posent un défi aux narrateurs : comment maintenir l'authenticité tout en s'adaptant aux impératifs numériques ? Cette tension pousse à la fois à l'innovation et à la réitération des thèmes anciens, tels que le questionnement moral et la lutte pour la vérité objective, hérités des Lumières, mais reformulés par la subjectivité moderne.\nLes algorithmes ne font pas qu'influencer la distribution, ils modifient aussi le processus créatif, favorisant des récits fragmentés et multiformes qui réfléchissent le monde complexe dans lequel nous vivons. Dans ce contexte, le cinéma parlant contemporain devient un espace d'expérimentation où les histoires résolvent les tensions ancestrales entre raison et émotion avec une perspective contemporaine, reflétant à la fois la continuité et la rupture avec les paradigmes historiques.	["TECHNIQUE 1 — Filtrage Algorithmiquement Personnalisé : Personnaliser le contenu cinématographique de manière à fusionner les attentes des spectateurs avec des voix émergentes, en utilisant des données d'engagement pour ajuster l'intensité et le rythme de la narration.","TECHNIQUE 2 — Cadre Narratif Modulaire : Créer des récits multiplicatifs qui se connectent à travers des thèmes communs tout en permettant une autonomie d'épisodes individuels qui répondent à la préférence auditive-algorithmique.","TECHNIQUE 3 — Intertextualité Éclairée : Intégrer des références philosophiques et littéraires occidentales pour approfondir la maîtrise du contenu tout en s'assurant que ces références amplifient la compréhension et l'attrait universel.","TECHNIQUE 4 — Emploi de la Trope de Prise de Conscience : Utiliser des tropes philosophiques pour ramener à la surface des dilemmes moraux complexes, en se concentrant sur des personnages confrontés à des choix éclairés par le rationalisme et les valeurs religieuses.","TECHNIQUE 5 — Polyphonie Visuelle et Sonore : Utiliser une riche combinaison de textures visuelles et auditives pour créer un récit multisensoriel, stimulant l'engagement intellectuel par la dissonance cognitive."]	["PRINCIPE ÉMOTIONNEL 1 — Convergence de l'Introspection : Encourager une connexion émotionnelle en dépeignant des personnages en quête de vérité à travers des luttes internes complexes, stimulant la résonance personnelle.","PRINCIPE 2 — Activation du Débat Éthique : Provoquer une réflexion morale intense à travers des dilemmes couvrant la justice et la vérité, héritages directs des Lumières et du modernisme.","PRINCIPE 3 — Émotion Comme Moteur Narratif : Utiliser les émotions fondamentales que sont l'espoir et l'anxiété afin de structurer le récit autour d'une oscillation entre ombre dramatique et résolution cathartique."]	Dans l'espace occidental européen, les récits contemporains sont façonnés par une riche tradition historico-philosophique s'étendant des anciens Grecs aux Lumières modernes. La valorisation de la raison, l'interrogation constante sur la nature de la connaissance et du bien, ainsi que les tensions inhérentes entre foi et empirisme, confèrent un gravitas distinct aux histoires qui émergent. Les narrations sont souvent animées par un mélange de scepticisme post-moderniste et de quête d'authenticité personnelle, capturant les transitions permanentes entre le rationalisme éclairé et les incertitudes de l'ère numérique.\nAinsi, dans le cinéma contemporain, les personnages et les récits sont des vaisseaux à travers lesquels se reflètent les luttes culturelles contre la superficialité et la manipulation. L'animation par des algorithmes dans les plates-formes de streaming permet à des récits plus diversifiés d'atteindre des publics plus larges, mais met également en exergue le défi de maintenir des récits culturellement pertinents qui captivent en exploitant des émotions universelles. Cette dynamique rend le cinéma unilingue un forum où les idéaux séculaires sont continuellement revisités et réimagés.	["Black Mirror (2011–2019) : Série anthologique britannique qui utilise des récits autonomes pour explorer les tensions entre technologie moderne et expérience humaine.","Call Me by Your Name (2017) : Film italo-franco-américain dramatisant une connexion humaine profondément sensuelle étayée par un décor européen et des thèmes de passage à l'âge adulte.","The Favourite (2018) : Comédie noire historique devenue un phénomène culturel grâce à une réinvention stylistique de la période georgienne à travers une lentille moderne.","Roma (2018) : Film en noir et blanc acclamé par la critique, réalisé par Alfonso Cuarón, qui mêle récits autobiographiques et critiques socio-politiques du Mexique des années 1970."]	Pour les créateurs contemporains, la narrative leçon primordiale est l'intégration des techniques numériques non comme contraintes, mais en tant que moyens d'amplifier la portée et la diversité des récits. Les auteurs doivent naviguer dans l'espace entre l'originalité et l'accessibilité, l'authenticité et la popularité, grâce à une utilisation judicieuse des données qui informent de manière dynamique la narration. Les récits doivent s'efforcer de représenter la complexité actuelle de l'existence humaine tout en offrant des perspectives uniques qui dialoguent avec les idéaux philosophiques et religieux.\nUne autre leçon importante est l'adoption de la modularité dans la narration, embrassant la fragmentation comme un outil pour captiver les publics aux intérêts divers, mais aussi comme un moyen de s'adapter à une consommation médiatique de plus en plus non linéaire. Enfin, l'engagement émotionnel devient crucial dans un paysage dominé par l'information, car il construit des ponts de compréhension et d'empathie à une époque où les connectivités sont plus numériques qu'humaines.	[]	0	t	["e377eea1-6a86-46a6-83fc-6f41bafa2696"]	2026-05-13 00:00:25.874376
\.


--
-- Data for Name: screenplays; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.screenplays (id, project_id, logline, tagline, cinematic_synopsis, treatment, beats, scenes, fountain_script, updated_at) FROM stdin;
\.


--
-- Data for Name: sequencier; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.sequencier (id, project_id, sequences, total_duree, structure, note_globale, updated_at) FROM stdin;
\.


--
-- Data for Name: series_data; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.series_data (id, project_id, format, logline_serie, season_concept, series_potential, long_arcs, episodes, progressive_revelations, secondary_characters, updated_at) FROM stdin;
\.


--
-- Data for Name: sru_scores; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.sru_scores (id, project_id, etincelle, etincelle_comment, vibration, vibration_comment, profondeur, profondeur_comment, maitrise, maitrise_comment, sru, traditions, synthese_globale, niveau_resonance, updated_at) FROM stdin;
\.


--
-- Data for Name: tension_arcs; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.tension_arcs (id, project_id, acts, overall_shape, recommendation, updated_at) FROM stdin;
\.


--
-- Data for Name: world_data; Type: TABLE DATA; Schema: public; Owner: matrice
--

COPY public.world_data (id, project_id, locations, atmospheres, temporal_rules, timeline_events, parallel_timelines, dream_layers, forbidden_rules, cause_effect_logic, updated_at) FROM stdin;
\.


--
-- Name: ai_skills ai_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.ai_skills
    ADD CONSTRAINT ai_skills_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_email_unique UNIQUE (email);


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: atmosphere_data atmosphere_data_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.atmosphere_data
    ADD CONSTRAINT atmosphere_data_pkey PRIMARY KEY (id);


--
-- Name: book_outlines book_outlines_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.book_outlines
    ADD CONSTRAINT book_outlines_pkey PRIMARY KEY (id);


--
-- Name: characters characters_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_pkey PRIMARY KEY (id);


--
-- Name: cinema_knowledge cinema_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.cinema_knowledge
    ADD CONSTRAINT cinema_knowledge_pkey PRIMARY KEY (id);


--
-- Name: cinq_piliers cinq_piliers_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.cinq_piliers
    ADD CONSTRAINT cinq_piliers_pkey PRIMARY KEY (id);


--
-- Name: content_versions content_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_pkey PRIMARY KEY (id);


--
-- Name: creative_memory_entries creative_memory_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.creative_memory_entries
    ADD CONSTRAINT creative_memory_entries_pkey PRIMARY KEY (id);


--
-- Name: echo_temps echo_temps_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.echo_temps
    ADD CONSTRAINT echo_temps_pkey PRIMARY KEY (id);


--
-- Name: emotional_cores emotional_cores_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.emotional_cores
    ADD CONSTRAINT emotional_cores_pkey PRIMARY KEY (id);


--
-- Name: emotional_paths emotional_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.emotional_paths
    ADD CONSTRAINT emotional_paths_pkey PRIMARY KEY (id);


--
-- Name: experimental_modules experimental_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.experimental_modules
    ADD CONSTRAINT experimental_modules_pkey PRIMARY KEY (id);


--
-- Name: experimental_modules experimental_modules_slug_key; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.experimental_modules
    ADD CONSTRAINT experimental_modules_slug_key UNIQUE (slug);


--
-- Name: film_data film_data_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.film_data
    ADD CONSTRAINT film_data_pkey PRIMARY KEY (id);


--
-- Name: film_scenes film_scenes_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.film_scenes
    ADD CONSTRAINT film_scenes_pkey PRIMARY KEY (id);


--
-- Name: hpsa_scores hpsa_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.hpsa_scores
    ADD CONSTRAINT hpsa_scores_pkey PRIMARY KEY (id);


--
-- Name: knowledge_dossiers knowledge_dossiers_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.knowledge_dossiers
    ADD CONSTRAINT knowledge_dossiers_pkey PRIMARY KEY (id);


--
-- Name: manuscript_analyses manuscript_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.manuscript_analyses
    ADD CONSTRAINT manuscript_analyses_pkey PRIMARY KEY (id);


--
-- Name: miroir_artistique miroir_artistique_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.miroir_artistique
    ADD CONSTRAINT miroir_artistique_pkey PRIMARY KEY (id);


--
-- Name: narrative_matrices narrative_matrices_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.narrative_matrices
    ADD CONSTRAINT narrative_matrices_pkey PRIMARY KEY (id);


--
-- Name: narrative_skills narrative_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.narrative_skills
    ADD CONSTRAINT narrative_skills_pkey PRIMARY KEY (id);


--
-- Name: note_intention note_intention_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.note_intention
    ADD CONSTRAINT note_intention_pkey PRIMARY KEY (id);


--
-- Name: pitch_documents pitch_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.pitch_documents
    ADD CONSTRAINT pitch_documents_pkey PRIMARY KEY (id);


--
-- Name: project_skills project_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: relationships relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT relationships_pkey PRIMARY KEY (id);


--
-- Name: research_data research_data_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.research_data
    ADD CONSTRAINT research_data_pkey PRIMARY KEY (id);


--
-- Name: research_entries research_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.research_entries
    ADD CONSTRAINT research_entries_pkey PRIMARY KEY (id);


--
-- Name: screenplays screenplays_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.screenplays
    ADD CONSTRAINT screenplays_pkey PRIMARY KEY (id);


--
-- Name: sequencier sequencier_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.sequencier
    ADD CONSTRAINT sequencier_pkey PRIMARY KEY (id);


--
-- Name: series_data series_data_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.series_data
    ADD CONSTRAINT series_data_pkey PRIMARY KEY (id);


--
-- Name: sru_scores sru_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.sru_scores
    ADD CONSTRAINT sru_scores_pkey PRIMARY KEY (id);


--
-- Name: tension_arcs tension_arcs_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.tension_arcs
    ADD CONSTRAINT tension_arcs_pkey PRIMARY KEY (id);


--
-- Name: world_data world_data_pkey; Type: CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.world_data
    ADD CONSTRAINT world_data_pkey PRIMARY KEY (id);


--
-- Name: atmosphere_data atmosphere_data_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.atmosphere_data
    ADD CONSTRAINT atmosphere_data_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: book_outlines book_outlines_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.book_outlines
    ADD CONSTRAINT book_outlines_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: characters characters_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: cinq_piliers cinq_piliers_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.cinq_piliers
    ADD CONSTRAINT cinq_piliers_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: content_versions content_versions_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: echo_temps echo_temps_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.echo_temps
    ADD CONSTRAINT echo_temps_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: emotional_cores emotional_cores_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.emotional_cores
    ADD CONSTRAINT emotional_cores_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: emotional_paths emotional_paths_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.emotional_paths
    ADD CONSTRAINT emotional_paths_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: film_data film_data_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.film_data
    ADD CONSTRAINT film_data_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: film_scenes film_scenes_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.film_scenes
    ADD CONSTRAINT film_scenes_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: hpsa_scores hpsa_scores_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.hpsa_scores
    ADD CONSTRAINT hpsa_scores_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: miroir_artistique miroir_artistique_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.miroir_artistique
    ADD CONSTRAINT miroir_artistique_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: narrative_matrices narrative_matrices_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.narrative_matrices
    ADD CONSTRAINT narrative_matrices_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: note_intention note_intention_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.note_intention
    ADD CONSTRAINT note_intention_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: pitch_documents pitch_documents_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.pitch_documents
    ADD CONSTRAINT pitch_documents_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_skills project_skills_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_skills project_skills_skill_id_narrative_skills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_skill_id_narrative_skills_id_fk FOREIGN KEY (skill_id) REFERENCES public.narrative_skills(id) ON DELETE CASCADE;


--
-- Name: relationships relationships_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT relationships_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: research_data research_data_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.research_data
    ADD CONSTRAINT research_data_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: screenplays screenplays_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.screenplays
    ADD CONSTRAINT screenplays_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: sequencier sequencier_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.sequencier
    ADD CONSTRAINT sequencier_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: series_data series_data_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.series_data
    ADD CONSTRAINT series_data_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: sru_scores sru_scores_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.sru_scores
    ADD CONSTRAINT sru_scores_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tension_arcs tension_arcs_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.tension_arcs
    ADD CONSTRAINT tension_arcs_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: world_data world_data_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: matrice
--

ALTER TABLE ONLY public.world_data
    ADD CONSTRAINT world_data_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict peiQI85fgAcGS3j0kywebyQIMlEs9drzAhiAyM26YPormMS5h7DV0fW9PpbnjKs

