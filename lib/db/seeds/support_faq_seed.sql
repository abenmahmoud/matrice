INSERT INTO support_faq (id, category, question, answer) VALUES
('faq_001', 'general', 'Comment creer mon premier projet ?', 'Va sur /projects/new, choisis le format (roman, scenario, BD), donne un titre et une idee brute. Tu pourras affiner ensuite etape par etape.'),
('faq_002', 'general', 'Mes donnees sont-elles privees ?', 'Oui. Tes oeuvres restent dans ton compte, les preuves de protection reposent sur des hash, et personne d''autre que toi n''y a acces hors support autorise.'),
('faq_003', 'mandate', 'Qu''est-ce qu''un mandat de representation ?', 'C''est un contrat qui autorise Essuf-Group a representer ton oeuvre commercialement. Il est non exclusif par defaut, sauf si tu choisis un niveau exclusif.'),
('faq_004', 'mandate', 'Comment signer mon mandat ?', 'Depuis ton projet, ouvre Mandat editorial, choisis les parametres, puis envoie pour signature. Essuf-Sign gere ensuite la signature electronique par lien et OTP.'),
('faq_005', 'export', 'Quels formats d''export sont disponibles ?', 'EPUB, DOCX manuscrit et PDF KDP sont disponibles depuis le passeport d''oeuvre verrouille.'),
('faq_006', 'export', 'Mon export est-il marque genere par IA ?', 'Non. L''export reprend ton contenu de projet. Les preuves de generation et de protection restent dans Matrice.'),
('faq_007', 'billing', 'Comment fonctionne la beta ?', 'Un code MATRICE-BETA donne un acces Premium gratuit pendant la duree prevue par le code. Apres la beta, tu peux rester en gratuit ou passer sur un plan payant.'),
('faq_008', 'billing', 'Quels sont les plans payants ?', 'Free, Studio, Premium, Pro et Enterprise. Les limites exactes sont affichees sur /pricing.'),
('faq_009', 'feature', 'C''est quoi la Lentille Marche ?', 'C''est une analyse de production 2026 qui evalue microdrama, IA-prod, pression spatiale, personnage deplace et hybridation.'),
('faq_010', 'account', 'Comment supprimer mon compte ?', 'Va sur /profile et utilise la section compte. Les documents ayant une obligation legale de conservation peuvent rester archives selon la loi.'),
('faq_011', 'bug', 'L''app ne repond plus, que faire ?', 'Rafraichis la page. Si le probleme continue, cree un ticket support avec ton navigateur, la page concernee et ce que tu faisais.')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  updated_at = now();
