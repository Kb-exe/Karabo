import { Grade12Subject, PastPaper } from '../types';

export const GRADE_12_SUBJECTS: Grade12Subject[] = [
  // --- Languages (Home Language & First Additional Language) ---
  {
    id: 'eng_hl',
    name: 'English Home Language (HL)',
    category: 'Languages',
    papers: ['Paper 1 (Language & Comprehension)', 'Paper 2 (Literature & Poetry)', 'Paper 3 (Creative Writing)'],
    iconName: 'Languages',
    examDate: '24 October 2026',
    targetPercent: 82,
    currentMastery: 75,
    pastPapersCount: 14,
    description: 'Comprehension, summary, poetry, prescribed novel/drama, and transactional writing.'
  },
  {
    id: 'eng_fal',
    name: 'English First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Paper 1 (Language in Context)', 'Paper 2 (Literature)', 'Paper 3 (Writing)'],
    iconName: 'Languages',
    examDate: '24 October 2026',
    targetPercent: 80,
    currentMastery: 78,
    pastPapersCount: 12,
    description: 'Language structures, summary, short stories, drama, and formal writing.'
  },
  {
    id: 'zulu_hl',
    name: 'isiZulu Home Language (HL)',
    category: 'Languages',
    papers: ['Iphepha 1 (Ulimi)', 'Iphepha 2 (Ubuciko)', 'Iphepha 3 (Ukubhala)'],
    iconName: 'Languages',
    examDate: '27 October 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 10,
    description: 'Uzwisisa, ukufingqa, izinkondlo, inoveli, nesiZulu sokuxhumana.'
  },
  {
    id: 'zulu_fal',
    name: 'isiZulu First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Iphepha 1', 'Iphepha 2', 'Iphepha 3'],
    iconName: 'Languages',
    examDate: '27 October 2026',
    targetPercent: 80,
    currentMastery: 74,
    pastPapersCount: 8,
    description: 'Ukufunda nokuqonda, izakhi zolimi, nemibhalo yobuciko.'
  },
  {
    id: 'xhosa_hl',
    name: 'isiXhosa Home Language (HL)',
    category: 'Languages',
    papers: ['Iphepha 1 (Ulwimi)', 'Iphepha 2 (Uncwadi)', 'Iphepha 3 (Ukubhala)'],
    iconName: 'Languages',
    examDate: '28 October 2026',
    targetPercent: 85,
    currentMastery: 77,
    pastPapersCount: 8,
    description: 'Ukuqonda, izincwadi zesiXhosa, isihobe, nezincoko.'
  },
  {
    id: 'xhosa_fal',
    name: 'isiXhosa First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Iphepha 1', 'Iphepha 2', 'Iphepha 3'],
    iconName: 'Languages',
    examDate: '28 October 2026',
    targetPercent: 80,
    currentMastery: 72,
    pastPapersCount: 8,
    description: 'Ulwimi nokuqonda kwisiXhosa njengolwimi olongezelelweyo.'
  },
  {
    id: 'afr_ht',
    name: 'Afrikaans Huistaal (HT)',
    category: 'Languages',
    papers: ['Vraestel 1 (Taal & Begrip)', 'Vraestel 2 (Letterkunde)', 'Vraestel 3 (Skryfwerk)'],
    iconName: 'Languages',
    examDate: '26 October 2026',
    targetPercent: 80,
    currentMastery: 75,
    pastPapersCount: 10,
    description: 'Leesbegrip, opsomming, gedigte, voorgeskrewe drama/roman en kreatiewe skryfwerk.'
  },
  {
    id: 'afr_eat',
    name: 'Afrikaans Eerste Addisionele Taal (EAT)',
    category: 'Languages',
    papers: ['Vraestel 1 (Taal)', 'Vraestel 2 (Letterkunde)', 'Vraestel 3 (Skryfwerk)'],
    iconName: 'Languages',
    examDate: '26 October 2026',
    targetPercent: 80,
    currentMastery: 76,
    pastPapersCount: 12,
    description: 'Taalstrukture, kortverhale, gedigte en transaksionele tekste.'
  },
  {
    id: 'sepedi_hl',
    name: 'Sepedi Home Language (HL)',
    category: 'Languages',
    papers: ['Pampiri 1 (Polelo)', 'Pampiri 2 (Dingwalo)', 'Pampiri 3 (Tlhamo)'],
    iconName: 'Languages',
    examDate: '29 October 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 8,
    description: 'Kwetlego ya polelo, theto, papadi, dikanegelotshweu le direto tša Sepedi.'
  },
  {
    id: 'sepedi_fal',
    name: 'Sepedi First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Pampiri 1', 'Pampiri 2', 'Pampiri 3'],
    iconName: 'Languages',
    examDate: '29 October 2026',
    targetPercent: 80,
    currentMastery: 70,
    pastPapersCount: 6,
    description: 'Sepedi bjalo ka leleme la tlaleletšo la pele.'
  },
  {
    id: 'sesotho_hl',
    name: 'Sesotho Home Language (HL)',
    category: 'Languages',
    papers: ['Pampiri 1', 'Pampiri 2', 'Pampiri 3'],
    iconName: 'Languages',
    examDate: '30 October 2026',
    targetPercent: 85,
    currentMastery: 78,
    pastPapersCount: 8,
    description: 'Kutlwisiso, kgutsufatso, le dingolwa tsa Sesotho.'
  },
  {
    id: 'setswana_hl',
    name: 'Setswana Home Language (HL)',
    category: 'Languages',
    papers: ['Pampiri 1', 'Pampiri 2', 'Pampiri 3'],
    iconName: 'Languages',
    examDate: '30 October 2026',
    targetPercent: 85,
    currentMastery: 76,
    pastPapersCount: 8,
    description: 'Tiriso ya puo, ditlhamo, maboko le dikwalo tsa Setswana.'
  },
  {
    id: 'xitsonga_hl',
    name: 'Xitsonga Home Language (HL)',
    category: 'Languages',
    papers: ['Phepha 1', 'Phepha 2', 'Phepha 3'],
    iconName: 'Languages',
    examDate: '02 November 2026',
    targetPercent: 85,
    currentMastery: 78,
    pastPapersCount: 8,
    description: 'Ririmi ra manana, switlhokovetselo, novhele na mintlango ya Xitsonga.'
  },
  {
    id: 'siswati_hl',
    name: 'SiSwati Home Language (HL)',
    category: 'Languages',
    papers: ['Leliphepha 1', 'Leliphepha 2', 'Leliphepha 3'],
    iconName: 'Languages',
    examDate: '03 November 2026',
    targetPercent: 85,
    currentMastery: 78,
    pastPapersCount: 8,
    description: 'Kuviva lulwimi, buciko bemibhalo nesakhiwo seSiSwati.'
  },
  {
    id: 'tshivenda_hl',
    name: 'Tshivenda Home Language (HL)',
    category: 'Languages',
    papers: ['Bammbiri 1', 'Bammbiri 2', 'Bammbiri 3'],
    iconName: 'Languages',
    examDate: '04 November 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 8,
    description: 'Kupfesese, mikhwa ya tshirevhenda, na maanea.'
  },
  {
    id: 'ndebele_hl',
    name: 'isiNdebele Home Language (HL)',
    category: 'Languages',
    papers: ['Iphepha 1', 'Iphepha 2', 'Iphepha 3'],
    iconName: 'Languages',
    examDate: '04 November 2026',
    targetPercent: 85,
    currentMastery: 75,
    pastPapersCount: 6,
    description: 'Ukuzwisisa, izakhi zelimini, nemitlolo yesiNdebele.'
  },
  {
    id: 'sasl_hl',
    name: 'South African Sign Language (SASL HL)',
    category: 'Languages',
    papers: ['Paper 1 (Signed Comprehension)', 'Paper 2 (Literature)', 'Paper 3 (Signed Production)'],
    iconName: 'Languages',
    examDate: '05 November 2026',
    targetPercent: 85,
    currentMastery: 82,
    pastPapersCount: 6,
    description: 'Official South African 12th language: visual signed grammar, poetry, and narrative signing.'
  },
  {
    id: 'sesotho_fal',
    name: 'Sesotho First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Pampiri 1', 'Pampiri 2', 'Pampiri 3'],
    iconName: 'Languages',
    examDate: '30 October 2026',
    targetPercent: 80,
    currentMastery: 75,
    pastPapersCount: 6,
    description: 'Sesotho puo ya tlaleletso ya pele.'
  },
  {
    id: 'setswana_fal',
    name: 'Setswana First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Pampiri 1', 'Pampiri 2', 'Pampiri 3'],
    iconName: 'Languages',
    examDate: '30 October 2026',
    targetPercent: 80,
    currentMastery: 74,
    pastPapersCount: 6,
    description: 'Setswana puo ya tlaleletso ya ntlha.'
  },
  {
    id: 'xitsonga_fal',
    name: 'Xitsonga First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Phepha 1', 'Phepha 2', 'Phepha 3'],
    iconName: 'Languages',
    examDate: '02 November 2026',
    targetPercent: 80,
    currentMastery: 73,
    pastPapersCount: 6,
    description: 'Xitsonga ririmi ro engetela ro sungula.'
  },
  {
    id: 'siswati_fal',
    name: 'SiSwati First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Leliphepha 1', 'Leliphepha 2', 'Leliphepha 3'],
    iconName: 'Languages',
    examDate: '03 November 2026',
    targetPercent: 80,
    currentMastery: 74,
    pastPapersCount: 6,
    description: 'SiSwati lulwimi lwekwengetela lwekucala.'
  },
  {
    id: 'tshivenda_fal',
    name: 'Tshivenda First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Bammbiri 1', 'Bammbiri 2', 'Bammbiri 3'],
    iconName: 'Languages',
    examDate: '04 November 2026',
    targetPercent: 80,
    currentMastery: 73,
    pastPapersCount: 6,
    description: 'Tshivenda luambo lwa u engedza lwa u thoma.'
  },
  {
    id: 'ndebele_fal',
    name: 'isiNdebele First Additional Language (FAL)',
    category: 'Languages',
    papers: ['Iphepha 1', 'Iphepha 2', 'Iphepha 3'],
    iconName: 'Languages',
    examDate: '04 November 2026',
    targetPercent: 80,
    currentMastery: 72,
    pastPapersCount: 6,
    description: 'isiNdebele ilimi lokwengeza lokuthoma.'
  },
  {
    id: 'french_sal',
    name: 'French Second Additional Language (SAL)',
    category: 'Languages',
    papers: ['Paper 1 (Reading & Comprehension)', 'Paper 2 (Writing)'],
    iconName: 'Languages',
    examDate: '06 November 2026',
    targetPercent: 85,
    currentMastery: 78,
    pastPapersCount: 6,
    description: 'French grammar, comprehension, and communicative writing.'
  },
  {
    id: 'german_sal',
    name: 'German Second Additional Language (SAL)',
    category: 'Languages',
    papers: ['Paper 1 (Leseverstehen & Grammatik)', 'Paper 2 (Schriftlicher Ausdruck)'],
    iconName: 'Languages',
    examDate: '06 November 2026',
    targetPercent: 85,
    currentMastery: 77,
    pastPapersCount: 6,
    description: 'German reading comprehension, written production, and grammar.'
  },
  {
    id: 'portuguese_sal',
    name: 'Portuguese Second Additional Language (SAL)',
    category: 'Languages',
    papers: ['Paper 1 (Compreensão)', 'Paper 2 (Expressão Escrita)'],
    iconName: 'Languages',
    examDate: '06 November 2026',
    targetPercent: 85,
    currentMastery: 76,
    pastPapersCount: 6,
    description: 'Portuguese text analysis, grammatical competence, and composition.'
  },

  // --- Life Orientation (Compulsory) ---
  {
    id: 'lo',
    name: 'Life Orientation (LO)',
    category: 'Core Compulsory',
    papers: ['National Common Assessment Task (CAT Part A & B)'],
    iconName: 'Award',
    examDate: '02 September 2026',
    targetPercent: 88,
    currentMastery: 82,
    pastPapersCount: 10,
    description: 'Development of self in society, physical education, study skills, career choices, and democracy.'
  },

  // --- Mathematics Stream ---
  {
    id: 'maths',
    name: 'Mathematics (Pure)',
    category: 'Mathematics',
    papers: ['Paper 1 (Algebra, Calculus, Functions, Finance, Probability)', 'Paper 2 (Statistics, Trigonometry, Analytical & Euclidean Geometry)'],
    iconName: 'Calculator',
    examDate: '31 October 2026',
    targetPercent: 85,
    currentMastery: 72,
    pastPapersCount: 16,
    description: 'National Senior Certificate Mathematics Paper 1 & Paper 2 revision hub.'
  },
  {
    id: 'mathlit',
    name: 'Mathematical Literacy',
    category: 'Mathematics',
    papers: ['Paper 1 (Finance, Measurement, Data Handling)', 'Paper 2 (Maps, Plans, Scale, Measurement & Probability)'],
    iconName: 'Calculator',
    examDate: '31 October 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 14,
    description: 'Real-world financial maths, tax, interest, measurements, floor plans, and statistical data.'
  },
  {
    id: 'techmaths',
    name: 'Technical Mathematics',
    category: 'Mathematics',
    papers: ['Paper 1 (Algebra, Complex Numbers, Functions, Calculus)', 'Paper 2 (Geometry, Trigonometry, Circles & Angles)'],
    iconName: 'Calculator',
    examDate: '31 October 2026',
    targetPercent: 80,
    currentMastery: 70,
    pastPapersCount: 8,
    description: 'Applied technical mathematics for technical high schools and STEM trades.'
  },

  // --- Natural & Agricultural Sciences ---
  {
    id: 'physci',
    name: 'Physical Sciences',
    category: 'Sciences',
    papers: ['Paper 1: Physics (Mechanics, Doppler, Work-Energy, Electrodynamics)', 'Paper 2: Chemistry (Organic, Reaction Rates, Equilibrium, Acids & Bases)'],
    iconName: 'Zap',
    examDate: '07 November 2026',
    targetPercent: 80,
    currentMastery: 65,
    pastPapersCount: 14,
    description: 'Mechanics, Newton laws, electrodynamics, organic chemistry and equilibrium.'
  },
  {
    id: 'lifesci',
    name: 'Life Sciences (Biology)',
    category: 'Sciences',
    papers: ['Paper 1 (Reproduction, Endocrine System, Homeostasis, Response to Environment)', 'Paper 2 (DNA, Meiosis, Genetics, Evolution)'],
    iconName: 'Dna',
    examDate: '14 November 2026',
    targetPercent: 88,
    currentMastery: 78,
    pastPapersCount: 12,
    description: 'Genetics, DNA code of life, human endocrine system, and evolution.'
  },
  {
    id: 'techsci',
    name: 'Technical Sciences',
    category: 'Sciences',
    papers: ['Paper 1 (Physics for Technical Schools)', 'Paper 2 (Chemistry & Material Technology)'],
    iconName: 'Zap',
    examDate: '07 November 2026',
    targetPercent: 80,
    currentMastery: 72,
    pastPapersCount: 8,
    description: 'Applied physics, hydraulics, electronics, and materials for technical schools.'
  },
  {
    id: 'agrisci',
    name: 'Agricultural Sciences',
    category: 'Sciences',
    papers: ['Paper 1 (Animal Nutrition, Reproduction, Protection)', 'Paper 2 (Plant Physiology, Genetics, Agricultural Economics)'],
    iconName: 'BookOpen',
    examDate: '10 November 2026',
    targetPercent: 80,
    currentMastery: 75,
    pastPapersCount: 8,
    description: 'Soil science, crop production, animal physiology, and sustainable farm management.'
  },
  {
    id: 'agrimanage',
    name: 'Agricultural Management Practices',
    category: 'Sciences',
    papers: ['Paper 1 (Farm Management & Agribusiness)'],
    iconName: 'BookOpen',
    examDate: '10 November 2026',
    targetPercent: 80,
    currentMastery: 72,
    pastPapersCount: 6,
    description: 'Farm planning, animal husbandry, crop management, and agribusiness economics.'
  },
  {
    id: 'agritech',
    name: 'Agricultural Technology',
    category: 'Sciences',
    papers: ['Paper 1 (Structural Engineering, Irrigation, Energy)'],
    iconName: 'Wrench',
    examDate: '10 November 2026',
    targetPercent: 80,
    currentMastery: 70,
    pastPapersCount: 6,
    description: 'Agricultural implements, tractors, irrigation hydraulics, electrical fence systems, and GPS farm tools.'
  },

  // --- Business, Commerce & Management ---
  {
    id: 'accounting',
    name: 'Accounting',
    category: 'Commerce',
    papers: ['Paper 1 (Financial Reporting, Fixed Assets, Corporate Governance)', 'Paper 2 (Cost Accounting, Budgeting, Internal Controls)'],
    iconName: 'FileSpreadsheet',
    examDate: '18 November 2026',
    targetPercent: 75,
    currentMastery: 69,
    pastPapersCount: 8,
    description: 'Financial statements, cash flow statements, cost accounting, and reconciliation.'
  },
  {
    id: 'busstudies',
    name: 'Business Studies',
    category: 'Commerce',
    papers: ['Paper 1 (Business Environments & Operations)', 'Paper 2 (Business Ventures & Roles)'],
    iconName: 'Briefcase',
    examDate: '21 November 2026',
    targetPercent: 80,
    currentMastery: 74,
    pastPapersCount: 10,
    description: 'Legislation, macro environments, human resources, conflict management, and ethics.'
  },
  {
    id: 'economics',
    name: 'Economics',
    category: 'Commerce',
    papers: ['Paper 1 (Macroeconomics & Economic Pursuits)', 'Paper 2 (Microeconomics & Contemporary Issues)'],
    iconName: 'FileSpreadsheet',
    examDate: '16 November 2026',
    targetPercent: 80,
    currentMastery: 71,
    pastPapersCount: 10,
    description: 'Circular flow, business cycles, public sector, foreign exchange, market structures, and inflation.'
  },

  // --- Humanities & Social Sciences ---
  {
    id: 'geography',
    name: 'Geography',
    category: 'Humanities',
    papers: ['Paper 1 (Climate, Weather, Geomorphology, Mapwork)', 'Paper 2 (Settlement & Economic Geography of SA)'],
    iconName: 'MapPin',
    examDate: '12 November 2026',
    targetPercent: 82,
    currentMastery: 76,
    pastPapersCount: 10,
    description: 'Mid-latitude cyclones, tropical cyclones, rural-urban settlements, GIS, and South African economic geography.'
  },
  {
    id: 'history',
    name: 'History',
    category: 'Humanities',
    papers: ['Paper 1 (Cold War, Vietnam, Civil Rights, Black Consciousness)', 'Paper 2 (Collapse of USSR, End of Apartheid, Globalisation)'],
    iconName: 'BookOpen',
    examDate: '17 November 2026',
    targetPercent: 85,
    currentMastery: 79,
    pastPapersCount: 10,
    description: 'Source-based questions and discursive essays on South African and world history.'
  },
  {
    id: 'religion',
    name: 'Religion Studies',
    category: 'Humanities',
    papers: ['Paper 1 (Variety of Religions)', 'Paper 2 (Topical Issues & History)'],
    iconName: 'BookOpen',
    examDate: '19 November 2026',
    targetPercent: 85,
    currentMastery: 82,
    pastPapersCount: 6,
    description: 'Comparative study of world religions, moral teachings, and community cohesion.'
  },

  // --- Services, Technology & Engineering ---
  {
    id: 'cat',
    name: 'Computer Applications Technology (CAT)',
    category: 'Technology',
    papers: ['Paper 1 (Practical: Word, Excel, Access, HTML)', 'Paper 2 (Theory: Systems, Networks, Security)'],
    iconName: 'Laptop',
    examDate: '21 October 2026',
    targetPercent: 85,
    currentMastery: 83,
    pastPapersCount: 10,
    description: 'Office suites, spreadsheet calculations, database queries, web design, and ICT concepts.'
  },
  {
    id: 'it',
    name: 'Information Technology (IT)',
    category: 'Technology',
    papers: ['Paper 1 (Practical: Java / Delphi Programming & OOP)', 'Paper 2 (Theory: Hardware, Software, Databases, Social Implications)'],
    iconName: 'Laptop',
    examDate: '22 October 2026',
    targetPercent: 85,
    currentMastery: 77,
    pastPapersCount: 8,
    description: 'Object-oriented programming, algorithms, database management, and network architecture.'
  },
  {
    id: 'egd',
    name: 'Engineering Graphics & Design (EGD)',
    category: 'Technology',
    papers: ['Paper 1 (Civil Drawing, Perspective, Analytical)', 'Paper 2 (Mechanical Drawing, Assembly, Loci, Cams)'],
    iconName: 'FileCode',
    examDate: '11 November 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 8,
    description: 'First & third angle orthographic projection, mechanical isometric, civil floor plans, and cam design.'
  },
  {
    id: 'tourism',
    name: 'Tourism',
    category: 'Services',
    papers: ['Paper 1 (Mapwork, Tour Planning, Culture, Heritage, Marketing)'],
    iconName: 'Compass',
    examDate: '13 November 2026',
    targetPercent: 88,
    currentMastery: 84,
    pastPapersCount: 8,
    description: 'World time zones, itineraries, foreign exchange, UNESCO World Heritage Sites, and customer care.'
  },
  {
    id: 'consumer',
    name: 'Consumer Studies',
    category: 'Services',
    papers: ['Paper 1 (The Consumer, Food & Nutrition, Clothing, Housing, Entrepreneurship)'],
    iconName: 'ShoppingBag',
    examDate: '15 November 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 8,
    description: 'Consumer rights, financial management, food production, textiles, and business enterprise.'
  },
  {
    id: 'hospitality',
    name: 'Hospitality Studies',
    category: 'Services',
    papers: ['Paper 1 (Hospitality Sectors, Food & Beverage, Nutrition, Safety)'],
    iconName: 'Coffee',
    examDate: '15 November 2026',
    targetPercent: 85,
    currentMastery: 81,
    pastPapersCount: 8,
    description: 'Menu planning, culinary techniques, food commodities, hospitality hygiene, and costing.'
  },
  {
    id: 'civiltech',
    name: 'Civil Technology',
    category: 'Technology',
    papers: ['Paper 1 (Construction / Woodworking / Civil Services)'],
    iconName: 'Hammer',
    examDate: '17 November 2026',
    targetPercent: 80,
    currentMastery: 75,
    pastPapersCount: 6,
    description: 'Building materials, foundations, brickwork, roofing trusses, plumbing, and safety regulations.'
  },
  {
    id: 'electech',
    name: 'Electrical Technology',
    category: 'Technology',
    papers: ['Paper 1 (Power Systems / Electronics / Digital)'],
    iconName: 'Zap',
    examDate: '18 November 2026',
    targetPercent: 80,
    currentMastery: 73,
    pastPapersCount: 6,
    description: 'RLC circuits, transformers, operational amplifiers, PLC programming, and electrical machines.'
  },
  {
    id: 'mechtech',
    name: 'Mechanical Technology',
    category: 'Technology',
    papers: ['Paper 1 (Automotive / Fitting & Machining / Welding)'],
    iconName: 'Wrench',
    examDate: '19 November 2026',
    targetPercent: 80,
    currentMastery: 74,
    pastPapersCount: 6,
    description: 'Forces, engines, gear systems, hydraulic presses, welding procedures, and safety standards.'
  },

  // --- Arts & Culture ---
  {
    id: 'visarts',
    name: 'Visual Arts',
    category: 'Arts',
    papers: ['Paper 1 (Visual Culture Studies & South African Art History)'],
    iconName: 'Palette',
    examDate: '20 November 2026',
    targetPercent: 85,
    currentMastery: 82,
    pastPapersCount: 6,
    description: 'South African artists, resistance art, post-apartheid identity, international movements, and visual analysis.'
  },
  {
    id: 'drama',
    name: 'Dramatic Arts',
    category: 'Arts',
    papers: ['Paper 1 (Play Texts, Theatre History, Cultural Performance)'],
    iconName: 'Film',
    examDate: '20 November 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 6,
    description: 'South African play texts (e.g. Woza Albert!, Sophiatown), Theatre of the Absurd, Realism, and Epic Theatre.'
  },
  {
    id: 'music',
    name: 'Music',
    category: 'Arts',
    papers: ['Paper 1 (Music Literacy, General Music Knowledge & Analysis)'],
    iconName: 'Music',
    examDate: '23 November 2026',
    targetPercent: 85,
    currentMastery: 78,
    pastPapersCount: 6,
    description: 'Harmony, counterpoint, indigenous African music, jazz, and Western art music.'
  },
  {
    id: 'dance',
    name: 'Dance Studies',
    category: 'Arts',
    papers: ['Paper 1 (Dance History, Anatomy & Healthcare)'],
    iconName: 'Activity',
    examDate: '24 November 2026',
    targetPercent: 85,
    currentMastery: 80,
    pastPapersCount: 6,
    description: 'South African dance forms, choreographic analysis, anatomy, injury prevention, and music for dance.'
  },
  {
    id: 'design',
    name: 'Design',
    category: 'Arts',
    papers: ['Paper 1 (Design Literacy & History of Design)'],
    iconName: 'Layout',
    examDate: '25 November 2026',
    targetPercent: 85,
    currentMastery: 82,
    pastPapersCount: 6,
    description: 'Socially responsible design, environmental sustainability, indigenous crafts, and contemporary design.'
  }
];

export const GRADE_12_PAST_PAPERS: PastPaper[] = [
  // 1. Mathematics Paper 1 - 2024 Nov NSC
  {
    id: 'maths-2024-p1',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 2024,
    session: 'November Final (NSC)',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    questions: [
      {
        id: 'q1-1',
        questionNumber: 'Question 1.1',
        topic: 'Algebra & Equations',
        text: 'Solve for x:\n1.1.1  x(x - 7) = 0\n1.1.2  3x² - 5x - 1 = 0 (correct to TWO decimal places)\n1.1.3  √(x - 1) + 3 = x\n1.1.4  2^(x+1) + 2^(x-1) = 20',
        marks: 14,
        officialMemo: '1.1.1: x = 0 or x = 7 (2 marks)\n1.1.2: Standard quadratic formula x = (-b ± √(b² - 4ac))/(2a) = (5 ± √(25 - 4(3)(-1)))/6 = (5 ± √37)/6. Hence x = 1.85 or x = -0.18 (3 marks)\n1.1.3: √(x - 1) = x - 3 => square both sides: x - 1 = x² - 6x + 9 => x² - 7x + 10 = 0 => (x - 5)(x - 2) = 0. Testing roots: x = 5 is VALID; x = 2 is INVALID (reject root) (4 marks)\n1.1.4: 2^x(2¹ + 2⁻¹) = 20 => 2^x(2 + 0.5) = 20 => 2^x(2.5) = 20 => 2^x = 8 => 2^x = 2³ => x = 3 (4 marks).',
        hint: 'In 1.1.3 remember to isolate the surd before squaring, and always check for extraneous roots!'
      },
      {
        id: 'q1-2',
        questionNumber: 'Question 1.2',
        topic: 'Simultaneous Equations',
        text: 'Solve for x and y simultaneously:\ny + 2x = 3\nx² + 2xy + y² = 9',
        marks: 6,
        officialMemo: 'From eq (1): y = 3 - 2x. Notice eq (2) is (x + y)² = 9 => x + y = 3 or x + y = -3.\nCase A: x + (3 - 2x) = 3 => 3 - x = 3 => x = 0, y = 3.\nCase B: x + (3 - 2x) = -3 => 3 - x = -3 => x = 6, y = 3 - 2(6) = -9.\nSolutions: (0, 3) and (6, -9). [1 mark: make y subject, 2 marks: substitute or recognize perfect square, 2 marks: values of x, 1 mark: corresponding values of y].',
        hint: 'Recognizing (x + y)² = 9 saves substantial algebraic time!'
      },
      {
        id: 'q2-1',
        questionNumber: 'Question 2.1',
        topic: 'Number Patterns & Sequences',
        text: 'Given the quadratic sequence: 3 ; 9 ; 19 ; 33 ; ...\n2.1.1  Determine the next two terms of the sequence.\n2.1.2  Determine the general term Tn of the sequence in the form Tn = an² + bn + c.',
        marks: 6,
        officialMemo: '2.1.1: 1st differences: 9-3=6, 19-9=10, 33-19=14. Next differences are 18 and 22.\nNext terms: 33 + 18 = 51, and 51 + 22 = 73. (2 marks)\n2.1.2: 2nd difference: 10 - 6 = 4. Therefore 2a = 4 => a = 2.\n3a + b = 6 => 3(2) + b = 6 => b = 0.\na + b + c = 3 => 2 + 0 + c = 3 => c = 1.\nGeneral term: Tn = 2n² + 1. (4 marks)',
        hint: 'Use the 2a, 3a+b, a+b+c standard DBE formula system for quadratic sequences.'
      },
      {
        id: 'q7-1',
        questionNumber: 'Question 7.1',
        topic: 'Calculus (First Principles)',
        text: 'Determine f\'(x) from first principles if f(x) = 2x² - 3x.',
        marks: 5,
        officialMemo: 'f\'(x) = lim(h->0) [f(x + h) - f(x)] / h\n= lim(h->0) [2(x + h)² - 3(x + h) - (2x² - 3x)] / h\n= lim(h->0) [2(x² + 2xh + h²) - 3x - 3h - 2x² + 3x] / h\n= lim(h->0) [2x² + 4xh + 2h² - 3x - 3h - 2x² + 3x] / h\n= lim(h->0) [4xh + 2h² - 3h] / h\n= lim(h->0) h(4x + 2h - 3) / h\n= lim(h->0) (4x + 2h - 3)\n= 4x - 3\n[1 mark: formula, 1 mark: substitution of f(x+h), 1 mark: factorizing h, 1 mark: notation lim(h->0) maintained, 1 mark: final answer].',
        hint: 'Do NOT drop lim(h->0) before substituting h = 0, otherwise DBE markers deduct 1 notation mark.'
      },
      {
        id: 'q8-1',
        questionNumber: 'Question 8.1',
        topic: 'Calculus (Cubic Graphs & Optimization)',
        text: 'A cardboard box with an open top has a square base of side x cm and height h cm.\nThe total surface area of the box is 108 cm².\n8.1.1  Express h in terms of x.\n8.1.2  Show that the volume V of the box is given by V = 27x - 0.25x³.\n8.1.3  Determine the value of x for which the volume is a maximum.',
        marks: 9,
        officialMemo: '8.1.1: Surface Area = base area + 4(side areas) = x² + 4xh = 108 => 4xh = 108 - x² => h = (108 - x²)/(4x) (2 marks).\n8.1.2: V = base × height = x² × h = x² × [(108 - x²)/(4x)] = x(108 - x²)/4 = 27x - 0.25x³ (proved) (2 marks).\n8.1.3: For maximum volume, dV/dx = 0 => 27 - 0.75x² = 0 => 0.75x² = 27 => x² = 36 => x = 6 cm (since x > 0). Maximum volume occurs at x = 6 cm. (5 marks)',
        hint: 'Take the derivative with respect to x and set it to 0. Always reject negative dimensions with a brief reason.'
      }
    ]
  },

  // 2. Mathematics Paper 2 - 2024 Nov NSC
  {
    id: 'maths-2024-p2',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 2024,
    session: 'November Final (NSC)',
    paperNumber: 'Paper 2',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    questions: [
      {
        id: 'p2-q1',
        questionNumber: 'Question 1.1',
        topic: 'Statistics & Regression',
        text: 'The table below shows the hours studied (x) and the final test scores (y) for 10 Grade 12 learners:\nx: 3, 5, 8, 10, 12, 14, 15, 18, 20, 22\ny: 42, 50, 61, 68, 72, 79, 82, 88, 91, 95\n1.1.1 Determine the equation of the least squares regression line.\n1.1.2 Calculate the correlation coefficient r and interpret its strength.\n1.1.3 Predict the test score for a learner who studies 16 hours.',
        marks: 8,
        officialMemo: '1.1.1 Using CASIO/SHARP stat mode: a ≈ 35.84, b ≈ 2.76 => y = 35.84 + 2.76x (3 marks).\n1.1.2 r ≈ 0.994. There is a very strong, positive linear correlation between hours studied and test scores (3 marks).\n1.1.3 Substitute x = 16: y = 35.84 + 2.76(16) ≈ 80.0% (2 marks).',
        hint: 'Clear STAT memory on your calculator before inputting the 10 data pairs.'
      },
      {
        id: 'p2-q5',
        questionNumber: 'Question 5.1',
        topic: 'Trigonometry (Identities & General Solution)',
        text: '5.1.1 Prove the identity: (sin 2x) / (1 + cos 2x) = tan x\n5.1.2 Determine the general solution for: 2 cos² θ - 3 sin θ = 0',
        marks: 10,
        officialMemo: '5.1.1 LHS = (2 sin x cos x) / (1 + (2 cos² x - 1)) = (2 sin x cos x) / (2 cos² x) = sin x / cos x = tan x = RHS. (4 marks)\n5.1.2 Replace cos² θ with 1 - sin² θ: 2(1 - sin² θ) - 3 sin θ = 0 => 2 - 2 sin² θ - 3 sin θ = 0 => 2 sin² θ + 3 sin θ - 2 = 0 => (2 sin θ - 1)(sin θ + 2) = 0.\nsin θ = 1/2 or sin θ = -2 (no solution, -1 <= sin θ <= 1).\nReference angle for sin θ = 0.5 is 30°.\nQuad 1: θ = 30° + k·360°, k ∈ Z\nQuad 2: θ = 180° - 30° + k·360° = 150° + k·360°, k ∈ Z. (6 marks)',
        hint: 'Use the double angle identity cos 2x = 2 cos² x - 1 so the "+ 1" and "- 1" in the denominator cancel out.'
      },
      {
        id: 'p2-q9',
        questionNumber: 'Question 9.1',
        topic: 'Euclidean Geometry (Circle Theorems)',
        text: 'In the figure, circle ABCD has tangents EF and EG. Chord AC intersects BD at T.\nGiven: ∠A₁ = 42° and ∠B₂ = 42°.\nProve that:\n9.1.1 ABCD is a cyclic quadrilateral.\n9.1.2 AB is parallel to CD if ∠C₁ = 42°.\n9.1.3 Tan-chord theorem application on tangent EF at point A.',
        marks: 9,
        officialMemo: '9.1.1 ∠A₁ = ∠B₂ = 42° (given). Subtending line segment CD. Therefore ABCD is a cyclic quad (converse: angles in same segment equal) (3 marks).\n9.1.2 ∠B₂ = 42° and ∠C₁ = 42° => ∠B₂ = ∠C₁ = 42° (alternate angles equal => AB || CD) (3 marks).\n9.1.3 Angle between tangent EF and chord AC equals the angle in the alternate segment: ∠FAC = ∠ADC (tan-chord theorem) (3 marks).',
        hint: 'State your geometric reasons exactly according to the DBE Accepted Reasons handbook!'
      }
    ]
  },

  // 3. Physical Sciences Paper 1 (Physics) - 2024 Nov NSC
  {
    id: 'phys-2024-p1',
    subjectId: 'physci',
    subjectName: 'Physical Sciences',
    year: 2024,
    session: 'November Final (NSC)',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    questions: [
      {
        id: 'phy-q2',
        questionNumber: 'Question 2 (Mechanics)',
        topic: 'Newton\'s Laws & Free-Body Diagrams',
        text: 'A block of mass 4 kg on a rough horizontal surface is connected by a light inextensible string passing over a frictionless pulley to a hanging block of mass 6 kg.\nA horizontal force F = 50 N acts to the left on the 4 kg block. The coefficient of kinetic friction between the 4 kg block and the table is 0.25.\n2.1 Draw a fully labeled free-body diagram for the 4 kg block.\n2.2 Calculate the magnitude of the kinetic frictional force on the 4 kg block.\n2.3 Calculate the acceleration of the system.',
        marks: 11,
        officialMemo: '2.1 Free body diagram for 4 kg block: Normal force F_N (upwards), Gravitational force F_g / w (downwards), Applied force F (left), Tension T (right), Friction f_k (right). [4 marks, 1 per force]\n2.2 f_k = μ_k · N = μ_k · (m·g) = 0.25 · (4 · 9.8) = 9.8 N (3 marks)\n2.3 System equations: For 4 kg block: F_net = m·a => F - T - f_k = 4a => 50 - T - 9.8 = 4a => 40.2 - T = 4a. For 6 kg hanging block: T - m_2·g = 6a => T - (6 · 9.8) = 6a => T - 58.8 = 6a (or if falling: 58.8 - T = 6a depending on direction). Adding equations: 40.2 - 58.8 = 10a => -18.6 = 10a => a = 1.86 m·s⁻² (4 marks).',
        hint: 'Check the net driving force first to determine the exact direction of acceleration and kinetic friction.'
      },
      {
        id: 'phy-q6',
        questionNumber: 'Question 6 (Doppler Effect)',
        topic: 'Doppler Effect with Sound',
        text: 'An ambulance emitting sound at a frequency of 650 Hz travels along a straight horizontal road at a constant velocity towards a stationary listener on the sidewalk.\nThe listener detects a frequency of 710 Hz. Take the speed of sound in air as 340 m·s⁻¹.\n6.1 State the Doppler Effect in words.\n6.2 Calculate the speed of the ambulance.\n6.3 How does the pitch detected by the listener change after the ambulance passes by?',
        marks: 8,
        officialMemo: '6.1 Doppler Effect: The apparent change in frequency (or pitch) of the sound observed by a listener because the sound source and the listener are moving relative to each other. (2 marks)\n6.2 f_L = [v / (v - v_S)] · f_S => 710 = [340 / (340 - v_S)] · 650 => 710(340 - v_S) = 221000 => 241400 - 710 v_S = 221000 => 710 v_S = 20400 => v_S = 28.73 m·s⁻¹. (5 marks)\n6.3 The detected pitch (frequency) decreases / becomes lower. (1 mark)',
        hint: 'For an approaching source, denominator is (v - v_S), giving a higher apparent frequency.'
      }
    ]
  },

  // 4. Physical Sciences Paper 2 (Chemistry) - 2024 Nov NSC
  {
    id: 'chem-2024-p2',
    subjectId: 'physci',
    subjectName: 'Physical Sciences',
    year: 2024,
    session: 'November Final (NSC)',
    paperNumber: 'Paper 2',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    questions: [
      {
        id: 'ch-q2',
        questionNumber: 'Question 2 (Organic Chemistry)',
        topic: 'IUPAC Naming & Isomers',
        text: 'Consider the following organic compounds:\nCompound A: CH₃-CH(CH₃)-CH₂-COOH\nCompound B: Pentan-2-one\nCompound C: Ethyl propanoate\n2.1 Write down the IUPAC name of Compound A.\n2.2 Write down the structural formula of Compound B.\n2.3 Identify the functional group of Compound C.\n2.4 Define positional isomers and identify if Compound B has a positional isomer.',
        marks: 9,
        officialMemo: '2.1 Compound A: Longest chain with carboxyl carbon is 4 carbons (butanoic acid). Methyl group at carbon 3: 3-methylbutanoic acid. (2 marks)\n2.2 Compound B structural formula: H₃C-C(=O)-CH₂-CH₂-CH₃ showing all bonds (carbonyl on C2 of 5-carbon chain). (2 marks)\n2.3 Ester group / -COO- (1 mark)\n2.4 Positional isomers: Compounds with the same molecular formula, but different positions of the functional group, substituent, or multiple bond on the carbon chain. Compound B has a positional isomer: Pentan-3-one. (4 marks)',
        hint: 'Carbon 1 of carboxylic acid is ALWAYS the carbonyl carbon in the main chain!'
      },
      {
        id: 'ch-q6',
        questionNumber: 'Question 6 (Equilibrium)',
        topic: 'Chemical Equilibrium & Le Chatelier',
        text: 'Consider the reversible reaction in a closed container:\nN₂(g) + 3H₂(g) ⇌ 2NH₃(g)   ΔH = -92 kJ·mol⁻¹\n6.1 State Le Chatelier\'s principle.\n6.2 How will an increase in temperature affect the yield of ammonia (NH₃)? Explain using Le Chatelier\'s principle.\n6.3 Write down the expression for the equilibrium constant Kc for this reaction.',
        marks: 7,
        officialMemo: '6.1 When the equilibrium in a closed system is disturbed, the system will adjust so as to favour the reaction that counteracts the disturbance. (2 marks)\n6.2 The yield of NH₃ will decrease. Explanation: The forward reaction is exothermic (ΔH < 0). Increasing temperature favours the endothermic reaction to absorb excess heat, which is the reverse reaction. Hence the equilibrium shifts to the left, decreasing NH₃ concentration. (3 marks)\n6.3 Kc = [NH₃]² / ([N₂] · [H₂]³) (2 marks)',
        hint: 'Always relate ΔH to the forward reaction and specify which direction absorbs or releases heat.'
      }
    ]
  },

  // 5. Life Sciences Paper 2 - 2024 Nov NSC
  {
    id: 'bio-2024-p2',
    subjectId: 'lifesci',
    subjectName: 'Life Sciences',
    year: 2024,
    session: 'November Final (NSC)',
    paperNumber: 'Paper 2',
    totalMarks: 150,
    durationMinutes: 150,
    curriculum: 'CAPS / DBE',
    sourceType: 'national',
    schoolOrProvinceName: 'Department of Basic Education (National NSC)',
    questions: [
      {
        id: 'bio-q1',
        questionNumber: 'Question 1.3 (Genetics)',
        topic: 'Monohybrid Cross & Punnett Square',
        text: 'In pea plants, tall stem (T) is dominant over dwarf stem (t). A homozygous tall plant is crossed with a dwarf plant.\n1.3.1 Represent this genetic cross using a standard CAPS genetic diagram to show the F1 generation.\n1.3.2 If two plants from the F1 generation are crossed, determine the phenotypic ratio of the F2 generation.',
        marks: 8,
        officialMemo: '1.3.1:\nP1: Phenotype: Tall × Dwarf\n    Genotype: TT × tt\nMeiosis\nGametes: T, T × t, t\nFertilisation: Punnett Square showing all offspring Tt\nF1: Genotype: 100% Tt\n    Phenotype: 100% Tall pea plants\n[DBE 6 marks: P1 phenotype & genotype, Meiosis + gametes, Fertilisation, F1 genotype & phenotype].\n1.3.2 F2 cross: Tt × Tt => TT, Tt, Tt, tt. Phenotypic ratio: 3 Tall : 1 Dwarf. (2 marks)',
        hint: 'Markers look for both "Meiosis" and "Fertilisation" labels. Do not omit them!'
      },
      {
        id: 'bio-q3',
        questionNumber: 'Question 3 (Evolution)',
        topic: 'Natural Selection by Darwin',
        text: 'Explain Darwin\'s theory of evolution by natural selection as it applies to the development of antibiotic resistance in bacteria.',
        marks: 6,
        officialMemo: '1. There is natural genetic variation within a bacterial population; some bacteria have a mutation giving resistance to antibiotics.\n2. When an antibiotic is introduced, it acts as an environmental selection pressure.\n3. The non-resistant bacteria are killed.\n4. The bacteria with the resistant mutation have a survival advantage and survive.\n5. The surviving resistant bacteria reproduce.\n6. They pass on the allele for resistance to their offspring over generations, increasing the proportion of resistant bacteria in the population.\n[6 marks - 1 mark per sequential point]',
        hint: 'Use the 6-point Darwinian natural selection template: Variation -> Selection Pressure -> Survival advantage -> Reproduction -> Inheritance of favorable allele.'
      }
    ]
  },

  // 6. Other Schools / Provincial Trials: Gauteng Education Department Prelim
  {
    id: 'maths-gde-2024-prelim',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 2024,
    session: 'Gauteng Provincial Prelim Exam',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    sourceType: 'provincial_other',
    schoolOrProvinceName: 'Gauteng Department of Education (GDE)',
    questions: [
      {
        id: 'gde-m-q1',
        questionNumber: 'Question 1.1',
        topic: 'Algebra & Exponents',
        text: 'Solve for x:\n1.1.1 (x - 3)(2x + 1) = 0\n1.1.2 2x² - 4x - 5 = 0 (correct to 2 decimal places)\n1.1.3 3^(x+2) - 3^x = 72',
        marks: 10,
        officialMemo: '1.1.1 x = 3 or x = -0.5 (2 marks)\n1.1.2 x = (4 ± √(16 - 4(2)(-5)))/4 = (4 ± √56)/4 => x = 2.87 or x = -0.87 (3 marks)\n1.1.3 3^x(3² - 1) = 72 => 3^x(8) = 72 => 3^x = 9 => x = 2 (5 marks).',
        hint: 'Factor out the common base 3^x in exponential equations.'
      },
      {
        id: 'gde-m-q7',
        questionNumber: 'Question 7.1',
        topic: 'Financial Mathematics (Sinking Funds)',
        text: 'A transport business buys a fleet of minibuses for R1,500,000. The value of the vehicles depreciates at 15% per annum on the reducing balance method.\n7.1 Calculate the scrap value of the vehicles after 5 years.\n7.2 The replacement cost increases at 8% per annum inflation. Calculate the cost to replace the fleet in 5 years.',
        marks: 7,
        officialMemo: '7.1 A = P(1 - i)^n = 1500000(1 - 0.15)^5 = R665,557.03 (3 marks)\n7.2 A = P(1 + i)^n = 1500000(1 + 0.08)^5 = R2,203,992.11 (4 marks).',
        hint: 'Use (1 - i)^n for reducing balance depreciation and (1 + i)^n for inflation.'
      }
    ]
  },

  // 7. Other Schools: Western Cape Metro South Trial
  {
    id: 'phys-wced-2024-trial',
    subjectId: 'physci',
    subjectName: 'Physical Sciences',
    year: 2024,
    session: 'Western Cape Metro South Trial',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    sourceType: 'provincial_other',
    schoolOrProvinceName: 'Western Cape Education Department (WCED)',
    questions: [
      {
        id: 'wced-p-q3',
        questionNumber: 'Question 3 (Vertical Projectile Motion)',
        topic: 'Vertical Projectile Motion in 1D',
        text: 'A ball is projected vertically upwards from the edge of the roof of a 40 m tall school building with an initial velocity of 12 m·s⁻¹.\n3.1 Calculate the maximum height above the roof reached by the ball.\n3.2 Calculate the total time taken for the ball to reach the ground below.',
        marks: 8,
        officialMemo: '3.1 At max height v_f = 0: v_f² = v_i² + 2aΔy => 0 = (12)² + 2(-9.8)Δy => Δy = 144 / 19.6 = 7.35 m (3 marks)\n3.2 Taking upwards as positive: Δy = -40 m, v_i = 12 m·s⁻¹, a = -9.8 m·s⁻².\nΔy = v_i·t + 0.5a·t² => -40 = 12t - 4.9t² => 4.9t² - 12t - 40 = 0.\nt = (12 ± √(144 - 4(4.9)(-40))) / 9.8 => t = (12 ± √928)/9.8 => t = 4.33 s (reject negative time) (5 marks).',
        hint: 'Choose upwards as positive; the displacement to the ground is -40 m.'
      }
    ]
  },

  // 8. My School Past Paper: Public School Internal Examination
  {
    id: 'maths-myschool-2024-trial',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    year: 2024,
    session: 'School Prelim Trial Examination',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    sourceType: 'my_school',
    schoolOrProvinceName: 'My Registered Public School',
    questions: [
      {
        id: 'mysch-m-q1',
        questionNumber: 'Question 1.1',
        topic: 'Algebra & Inequalities',
        text: 'Solve for x:\n1.1.1 x(2x - 5) = 3\n1.1.2 2x² + 5x - 3 > 0\n1.1.3 √(2x + 5) - x = 1',
        marks: 11,
        officialMemo: '1.1.1 2x² - 5x - 3 = 0 => (2x + 1)(x - 3) = 0 => x = -0.5 or x = 3 (3 marks)\n1.1.2 (2x - 1)(x + 3) > 0. Critical values: x = 0.5, x = -3. Inequality solution: x < -3 or x > 0.5 (4 marks)\n1.1.3 √(2x + 5) = x + 1 => 2x + 5 = x² + 2x + 1 => x² = 4 => x = 2 or x = -2. Check roots: x = 2 is VALID; x = -2 gives √1 - (-2) = 3 ≠ 1 (REJECT) (4 marks).',
        hint: 'Always test both values for square-root equations to discard extraneous roots.'
      },
      {
        id: 'mysch-m-q4',
        questionNumber: 'Question 4.1',
        topic: 'Hyperbola & Inverse Functions',
        text: 'Given f(x) = 2/(x - 1) + 3 and g(x) = 2x - 4:\n4.1.1 Write down the equations of the vertical and horizontal asymptotes of f.\n4.1.2 Calculate the x- and y-intercepts of f.\n4.1.3 Determine g⁻¹(x), the inverse of g.',
        marks: 8,
        officialMemo: '4.1.1 Asymptotes: x = 1 and y = 3 (2 marks)\n4.1.2 y-intercept: f(0) = 2/(-1) + 3 = 1 => (0, 1). x-intercept: 0 = 2/(x - 1) + 3 => -3(x - 1) = 2 => x - 1 = -2/3 => x = 1/3 => (1/3, 0) (3 marks)\n4.1.3 g(x): y = 2x - 4. Swap x and y: x = 2y - 4 => 2y = x + 4 => y = (1/2)x + 2. Hence g⁻¹(x) = 0.5x + 2 (3 marks).',
        hint: 'For inverse functions, swap x and y and make y the subject.'
      }
    ]
  },

  // 9. My School Past Paper: Physical Sciences Internal Prelim
  {
    id: 'phys-myschool-2024-trial',
    subjectId: 'physci',
    subjectName: 'Physical Sciences',
    year: 2024,
    session: 'School Prelim Trial Examination',
    paperNumber: 'Paper 1',
    totalMarks: 150,
    durationMinutes: 180,
    curriculum: 'CAPS / DBE',
    sourceType: 'my_school',
    schoolOrProvinceName: 'My Registered Public School',
    questions: [
      {
        id: 'mysch-p-q4',
        questionNumber: 'Question 4 (Work-Energy Theorem)',
        topic: 'Work, Energy & Power',
        text: 'A 20 kg crate slides down a rough incline of length 6 m inclined at 30° to the horizontal. A constant frictional force of 15 N acts on the crate as it slides from rest at the top to the bottom.\n4.1 State the Work-Energy Theorem in words.\n4.2 Calculate the work done by the gravitational force on the crate.\n4.3 Use energy principles to calculate the speed of the crate at the bottom of the incline.',
        marks: 10,
        officialMemo: '4.1 The net work done on an object is equal to the change in the object\'s kinetic energy. (2 marks)\n4.2 W_g = F_g · Δx · cos θ = (m·g) · Δx · sin(30°) = (20)(9.8)(6)(0.5) = 588 J (3 marks)\n4.3 W_net = ΔK => W_g + W_f = 0.5 m (v_f² - v_i²)\nW_f = f · Δx · cos(180°) = 15(6)(-1) = -90 J\nW_net = 588 - 90 = 498 J\n498 = 0.5(20)(v_f² - 0) => 498 = 10 v_f² => v_f² = 49.8 => v_f = 7.06 m·s⁻¹ (5 marks).',
        hint: 'Remember that friction always does negative work because the angle between displacement and friction is 180°.'
      }
    ]
  }
];

export const GRADE_12_EXAM_TIPS = [
  {
    title: 'Method Marks (M) Guarantee',
    subject: 'Mathematics',
    tip: 'Even if your final arithmetic is faulty, writing the exact formula from the information sheet and showing substitution awards Method (M) and Carry-Over (CA) marks.'
  },
  {
    title: 'SI Units & Vector Direction',
    subject: 'Physical Sciences',
    tip: 'Forces, velocities, and accelerations are vectors. Always include the unit (e.g. m·s⁻², N) AND direction (e.g. \'to the right\' or \'downwards\') to avoid losing the final answer mark.'
  },
  {
    title: 'Biological Drawings & Ratios',
    subject: 'Life Sciences',
    tip: 'In genetic crosses, label both P1 and F1 generations, specify \'Meiosis\' and \'Fertilisation\', and write phenotypes in words, not letters.'
  },
  {
    title: 'Two Decimal Places Rule',
    subject: 'All Subjects',
    tip: 'Unless stated otherwise, DBE instructions require all numerical answers to be rounded off to TWO decimal places only at the very final step.'
  }
];
