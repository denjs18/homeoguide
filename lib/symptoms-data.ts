/**
 * Structure hiérarchique des symptômes en français
 * Navigation: Zone → Type de problème → Caractéristiques → Remèdes
 */

export interface SymptomCategory {
  id: string;
  nom: string;
  icone: string;
  description: string;
  sousCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  nom: string;
  symptomes: Symptom[];
}

export interface Symptom {
  id: string;
  nom: string;
  description?: string;
  modalites?: Modalite[];
  // Mots-clés pour recherche dans OOREP
  keywords: string[];
}

export interface Modalite {
  id: string;
  nom: string;
  type: 'aggravation' | 'amelioration' | 'caracteristique';
  keywords: string[];
}

// Modalités communes (aggravations/améliorations)
export const MODALITES_COMMUNES: Modalite[] = [
  // Température
  { id: 'agg-froid', nom: 'Aggravé par le froid', type: 'aggravation', keywords: ['cold', 'froid'] },
  { id: 'agg-chaleur', nom: 'Aggravé par la chaleur', type: 'aggravation', keywords: ['heat', 'warm', 'chaleur'] },
  { id: 'amel-froid', nom: 'Amélioré par le froid', type: 'amelioration', keywords: ['cold', 'froid', 'better'] },
  { id: 'amel-chaleur', nom: 'Amélioré par la chaleur', type: 'amelioration', keywords: ['heat', 'warm', 'chaleur', 'better'] },

  // Mouvement
  { id: 'agg-mouvement', nom: 'Aggravé par le mouvement', type: 'aggravation', keywords: ['motion', 'movement', 'mouvement'] },
  { id: 'amel-mouvement', nom: 'Amélioré par le mouvement', type: 'amelioration', keywords: ['motion', 'movement', 'better'] },
  { id: 'agg-repos', nom: 'Aggravé au repos', type: 'aggravation', keywords: ['rest', 'repos'] },
  { id: 'amel-repos', nom: 'Amélioré au repos', type: 'amelioration', keywords: ['rest', 'repos', 'better'] },

  // Position
  { id: 'agg-couche', nom: 'Aggravé en position couchée', type: 'aggravation', keywords: ['lying', 'couché'] },
  { id: 'amel-couche', nom: 'Amélioré en position couchée', type: 'amelioration', keywords: ['lying', 'couché', 'better'] },
  { id: 'agg-debout', nom: 'Aggravé debout', type: 'aggravation', keywords: ['standing', 'debout'] },
  { id: 'agg-assis', nom: 'Aggravé assis', type: 'aggravation', keywords: ['sitting', 'assis'] },

  // Moment de la journée
  { id: 'agg-matin', nom: 'Aggravé le matin', type: 'aggravation', keywords: ['morning', 'matin'] },
  { id: 'agg-soir', nom: 'Aggravé le soir', type: 'aggravation', keywords: ['evening', 'soir'] },
  { id: 'agg-nuit', nom: 'Aggravé la nuit', type: 'aggravation', keywords: ['night', 'nuit'] },

  // Pression/toucher
  { id: 'agg-pression', nom: 'Aggravé par la pression', type: 'aggravation', keywords: ['pressure', 'pression'] },
  { id: 'amel-pression', nom: 'Amélioré par la pression', type: 'amelioration', keywords: ['pressure', 'pression', 'better'] },
  { id: 'agg-toucher', nom: 'Aggravé au toucher', type: 'aggravation', keywords: ['touch', 'toucher'] },

  // Alimentation
  { id: 'agg-manger', nom: 'Aggravé en mangeant', type: 'aggravation', keywords: ['eating', 'manger', 'food'] },
  { id: 'amel-manger', nom: 'Amélioré en mangeant', type: 'amelioration', keywords: ['eating', 'manger', 'better'] },
  { id: 'agg-jeun', nom: 'Aggravé à jeun', type: 'aggravation', keywords: ['fasting', 'empty stomach'] },

  // Latéralité
  { id: 'cote-droit', nom: 'Côté droit', type: 'caracteristique', keywords: ['right', 'droit'] },
  { id: 'cote-gauche', nom: 'Côté gauche', type: 'caracteristique', keywords: ['left', 'gauche'] },
  { id: 'bilateral', nom: 'Bilatéral (les deux côtés)', type: 'caracteristique', keywords: ['both', 'bilateral'] },
];

// Structure complète des symptômes
export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  // ============================================
  // TÊTE
  // ============================================
  {
    id: 'tete',
    nom: 'Tête',
    icone: '🗣️',
    description: 'Maux de tête, migraines, vertiges',
    sousCategories: [
      {
        id: 'tete-douleurs',
        nom: 'Maux de tête et migraines',
        symptomes: [
          { id: 'cephalee-frontale', nom: 'Mal de tête frontal', description: 'Douleur au niveau du front', keywords: ['head', 'pain', 'frontal', 'forehead', 'tête', 'douleur', 'front'] },
          { id: 'cephalee-occipitale', nom: 'Mal de tête à l\'arrière', description: 'Douleur à l\'arrière de la tête (occiput)', keywords: ['head', 'pain', 'occipital', 'back'] },
          { id: 'cephalee-temporale', nom: 'Mal de tête aux tempes', description: 'Douleur sur les côtés de la tête', keywords: ['head', 'pain', 'temporal', 'temple'] },
          { id: 'cephalee-vertex', nom: 'Mal de tête au sommet', description: 'Douleur au sommet du crâne', keywords: ['head', 'pain', 'vertex', 'top'] },
          { id: 'migraine', nom: 'Migraine', description: 'Douleur intense, souvent d\'un seul côté', keywords: ['migraine', 'headache', 'one-sided'] },
          { id: 'cephalee-pulsatile', nom: 'Mal de tête pulsatif', description: 'Douleur qui bat comme le cœur', keywords: ['head', 'throbbing', 'pulsating'] },
          { id: 'cephalee-constrictive', nom: 'Mal de tête en étau', description: 'Sensation de tête serrée', keywords: ['head', 'pressing', 'constricting'] },
          { id: 'cephalee-tension', nom: 'Céphalée de tension', description: 'Liée au stress et à la tension musculaire', keywords: ['tension', 'headache', 'stress'] },
        ]
      },
      {
        id: 'tete-vertiges',
        nom: 'Vertiges et étourdissements',
        symptomes: [
          { id: 'vertige-rotatoire', nom: 'Vertige rotatoire', description: 'Sensation que tout tourne', keywords: ['vertigo', 'spinning', 'rotating'] },
          { id: 'vertige-lever', nom: 'Vertige en se levant', description: 'Vertige au passage de la position couchée à debout', keywords: ['vertigo', 'rising', 'standing'] },
          { id: 'etourdissement', nom: 'Étourdissement', description: 'Sensation de tête légère', keywords: ['dizziness', 'lightheaded'] },
          { id: 'vertige-hauteur', nom: 'Vertige des hauteurs', description: 'Vertige en regardant vers le bas', keywords: ['vertigo', 'height', 'looking down'] },
        ]
      },
      {
        id: 'tete-autres',
        nom: 'Autres problèmes de tête',
        symptomes: [
          { id: 'tete-lourde', nom: 'Sensation de tête lourde', keywords: ['head', 'heavy', 'heaviness'] },
          { id: 'tete-vide', nom: 'Sensation de tête vide', keywords: ['head', 'empty', 'hollow'] },
          { id: 'tete-chaleur', nom: 'Chaleur à la tête', description: 'Tête chaude, congestionnée', keywords: ['head', 'heat', 'hot', 'congestion'] },
          { id: 'cheveux-chute', nom: 'Chute de cheveux', keywords: ['hair', 'falling', 'loss'] },
          { id: 'cuir-chevelu-sensible', nom: 'Cuir chevelu sensible', keywords: ['scalp', 'sensitive', 'tender'] },
        ]
      }
    ]
  },

  // ============================================
  // YEUX
  // ============================================
  {
    id: 'yeux',
    nom: 'Yeux',
    icone: '👁️',
    description: 'Problèmes oculaires, vision',
    sousCategories: [
      {
        id: 'yeux-douleurs',
        nom: 'Douleurs oculaires',
        symptomes: [
          { id: 'yeux-brulure', nom: 'Brûlure des yeux', keywords: ['eye', 'burning'] },
          { id: 'yeux-pression', nom: 'Pression dans les yeux', keywords: ['eye', 'pressure'] },
          { id: 'yeux-fatigue', nom: 'Fatigue oculaire', description: 'Yeux fatigués après lecture/écran', keywords: ['eye', 'strain', 'fatigue', 'tired'] },
          { id: 'yeux-picotement', nom: 'Picotements des yeux', keywords: ['eye', 'stinging', 'prickling'] },
        ]
      },
      {
        id: 'yeux-inflammation',
        nom: 'Inflammations et infections',
        symptomes: [
          { id: 'conjonctivite', nom: 'Conjonctivite', description: 'Œil rouge avec écoulement', keywords: ['conjunctivitis', 'eye', 'red', 'discharge'] },
          { id: 'orgelet', nom: 'Orgelet', description: 'Petit bouton sur la paupière', keywords: ['stye', 'eyelid'] },
          { id: 'chalazion', nom: 'Chalazion', description: 'Kyste de la paupière', keywords: ['chalazion', 'eyelid', 'cyst'] },
          { id: 'blepharitre', nom: 'Blépharite', description: 'Inflammation des paupières', keywords: ['blepharitis', 'eyelid', 'inflammation'] },
        ]
      },
      {
        id: 'yeux-ecoulements',
        nom: 'Écoulements et larmoiement',
        symptomes: [
          { id: 'larmoiement', nom: 'Larmoiement excessif', keywords: ['eye', 'watering', 'lacrimation', 'tears'] },
          { id: 'yeux-secs', nom: 'Yeux secs', keywords: ['eye', 'dry', 'dryness'] },
          { id: 'yeux-ecoulement-jaune', nom: 'Écoulement jaune/purulent', keywords: ['eye', 'discharge', 'yellow', 'pus'] },
        ]
      },
      {
        id: 'yeux-vision',
        nom: 'Troubles de la vision',
        symptomes: [
          { id: 'vision-floue', nom: 'Vision floue', keywords: ['vision', 'blurred', 'blurry'] },
          { id: 'vision-double', nom: 'Vision double', keywords: ['vision', 'double', 'diplopia'] },
          { id: 'photophobie', nom: 'Sensibilité à la lumière', keywords: ['photophobia', 'light', 'sensitive'] },
          { id: 'mouches-volantes', nom: 'Mouches volantes', description: 'Points ou filaments dans le champ visuel', keywords: ['floaters', 'spots', 'vision'] },
        ]
      }
    ]
  },

  // ============================================
  // OREILLES
  // ============================================
  {
    id: 'oreilles',
    nom: 'Oreilles',
    icone: '👂',
    description: 'Otites, acouphènes, audition',
    sousCategories: [
      {
        id: 'oreilles-douleurs',
        nom: 'Douleurs d\'oreille',
        symptomes: [
          { id: 'otite', nom: 'Otite (douleur d\'oreille)', keywords: ['ear', 'pain', 'otalgia', 'otitis'] },
          { id: 'otite-externe', nom: 'Otite externe', description: 'Infection du conduit auditif', keywords: ['ear', 'external', 'otitis'] },
          { id: 'otite-moyenne', nom: 'Otite moyenne', description: 'Infection de l\'oreille moyenne', keywords: ['ear', 'middle', 'otitis'] },
        ]
      },
      {
        id: 'oreilles-audition',
        nom: 'Troubles de l\'audition',
        symptomes: [
          { id: 'acouphenes', nom: 'Acouphènes', description: 'Bourdonnements, sifflements', keywords: ['tinnitus', 'ringing', 'buzzing', 'ear'] },
          { id: 'surdite', nom: 'Baisse d\'audition', keywords: ['hearing', 'loss', 'deafness'] },
          { id: 'oreille-bouchee', nom: 'Oreille bouchée', keywords: ['ear', 'blocked', 'fullness'] },
          { id: 'hyperacousie', nom: 'Sensibilité aux bruits', keywords: ['hearing', 'sensitive', 'noise'] },
        ]
      },
      {
        id: 'oreilles-ecoulements',
        nom: 'Écoulements',
        symptomes: [
          { id: 'otorrhee', nom: 'Écoulement d\'oreille', keywords: ['ear', 'discharge', 'otorrhea'] },
          { id: 'cerumen', nom: 'Excès de cérumen', keywords: ['ear', 'wax', 'cerumen'] },
        ]
      }
    ]
  },

  // ============================================
  // NEZ
  // ============================================
  {
    id: 'nez',
    nom: 'Nez',
    icone: '👃',
    description: 'Rhume, sinusite, allergies',
    sousCategories: [
      {
        id: 'nez-ecoulements',
        nom: 'Écoulements nasaux',
        symptomes: [
          { id: 'rhinite', nom: 'Rhume / Rhinite', keywords: ['nose', 'running', 'coryza', 'rhinitis'] },
          { id: 'ecoulement-aqueux', nom: 'Écoulement clair et liquide', keywords: ['nose', 'watery', 'discharge', 'clear'] },
          { id: 'ecoulement-epais', nom: 'Écoulement épais et jaune/vert', keywords: ['nose', 'thick', 'yellow', 'green', 'discharge'] },
          { id: 'ecoulement-posterieur', nom: 'Écoulement postérieur', description: 'Mucus qui coule dans la gorge', keywords: ['post-nasal', 'drip'] },
        ]
      },
      {
        id: 'nez-obstruction',
        nom: 'Obstruction nasale',
        symptomes: [
          { id: 'nez-bouche', nom: 'Nez bouché', keywords: ['nose', 'blocked', 'congestion', 'stuffed'] },
          { id: 'nez-bouche-alternant', nom: 'Nez bouché alternant', description: 'Un côté puis l\'autre', keywords: ['nose', 'alternating', 'obstruction'] },
          { id: 'nez-sec', nom: 'Nez sec', keywords: ['nose', 'dry', 'dryness'] },
        ]
      },
      {
        id: 'nez-autres',
        nom: 'Autres problèmes nasaux',
        symptomes: [
          { id: 'sinusite', nom: 'Sinusite', description: 'Douleur et pression aux sinus', keywords: ['sinus', 'sinusitis', 'pain'] },
          { id: 'eternuements', nom: 'Éternuements fréquents', keywords: ['sneezing', 'sneeze'] },
          { id: 'saignement-nez', nom: 'Saignement de nez', keywords: ['nose', 'bleeding', 'epistaxis'] },
          { id: 'perte-odorat', nom: 'Perte d\'odorat', keywords: ['smell', 'loss', 'anosmia'] },
          { id: 'allergie-nasale', nom: 'Allergie nasale / Rhinite allergique', keywords: ['allergy', 'hay fever', 'allergic'] },
        ]
      }
    ]
  },

  // ============================================
  // GORGE ET BOUCHE
  // ============================================
  {
    id: 'gorge-bouche',
    nom: 'Gorge et Bouche',
    icone: '👄',
    description: 'Angine, aphtes, dents',
    sousCategories: [
      {
        id: 'gorge-douleurs',
        nom: 'Maux de gorge',
        symptomes: [
          { id: 'angine', nom: 'Angine / Mal de gorge', keywords: ['throat', 'pain', 'sore', 'angina'] },
          { id: 'gorge-seche', nom: 'Gorge sèche', keywords: ['throat', 'dry'] },
          { id: 'gorge-brulure', nom: 'Brûlure de gorge', keywords: ['throat', 'burning'] },
          { id: 'gorge-serree', nom: 'Gorge serrée', description: 'Sensation de boule dans la gorge', keywords: ['throat', 'constriction', 'lump'] },
          { id: 'deglutition-difficile', nom: 'Difficulté à avaler', keywords: ['swallowing', 'difficult', 'dysphagia'] },
          { id: 'amygdalite', nom: 'Amygdalite', description: 'Amygdales gonflées et rouges', keywords: ['tonsils', 'tonsillitis', 'swollen'] },
          { id: 'pharyngite', nom: 'Pharyngite', keywords: ['pharynx', 'pharyngitis'] },
          { id: 'laryngite', nom: 'Laryngite', description: 'Extinction de voix', keywords: ['larynx', 'laryngitis', 'hoarse', 'voice'] },
        ]
      },
      {
        id: 'bouche-problemes',
        nom: 'Problèmes de bouche',
        symptomes: [
          { id: 'aphtes', nom: 'Aphtes', description: 'Petites ulcérations buccales', keywords: ['mouth', 'ulcer', 'aphthae', 'canker'] },
          { id: 'stomatite', nom: 'Stomatite', description: 'Inflammation de la bouche', keywords: ['mouth', 'stomatitis', 'inflammation'] },
          { id: 'bouche-seche', nom: 'Bouche sèche', keywords: ['mouth', 'dry'] },
          { id: 'salivation-excessive', nom: 'Salivation excessive', keywords: ['saliva', 'excess', 'drooling'] },
          { id: 'mauvaise-haleine', nom: 'Mauvaise haleine', keywords: ['breath', 'bad', 'halitosis'] },
          { id: 'gout-metallique', nom: 'Goût métallique', keywords: ['taste', 'metallic'] },
          { id: 'langue-chargee', nom: 'Langue chargée (blanche)', keywords: ['tongue', 'coated', 'white'] },
        ]
      },
      {
        id: 'dents-gencives',
        nom: 'Dents et gencives',
        symptomes: [
          { id: 'mal-dents', nom: 'Mal de dents', keywords: ['tooth', 'pain', 'toothache'] },
          { id: 'dents-sensibles', nom: 'Dents sensibles', keywords: ['tooth', 'sensitive'] },
          { id: 'gencives-gonflees', nom: 'Gencives gonflées', keywords: ['gum', 'swollen', 'gingivitis'] },
          { id: 'gencives-saignantes', nom: 'Gencives qui saignent', keywords: ['gum', 'bleeding'] },
          { id: 'abces-dentaire', nom: 'Abcès dentaire', keywords: ['tooth', 'abscess'] },
          { id: 'poussee-dentaire', nom: 'Poussée dentaire (bébé)', keywords: ['teething', 'dentition'] },
        ]
      }
    ]
  },

  // ============================================
  // SYSTÈME DIGESTIF
  // ============================================
  {
    id: 'digestif',
    nom: 'Système digestif',
    icone: '🍽️',
    description: 'Estomac, intestins, digestion',
    sousCategories: [
      {
        id: 'estomac',
        nom: 'Estomac',
        symptomes: [
          { id: 'nausees', nom: 'Nausées', keywords: ['nausea', 'sick', 'nausée', 'nausées', 'nauséeux'] },
          { id: 'vomissements', nom: 'Vomissements', keywords: ['vomiting', 'vomit', 'vomissement', 'vomir', 'stomach'] },
          { id: 'brulures-estomac', nom: 'Brûlures d\'estomac', keywords: ['stomach', 'burning', 'heartburn'] },
          { id: 'reflux', nom: 'Reflux gastrique', keywords: ['reflux', 'acid', 'regurgitation'] },
          { id: 'indigestion', nom: 'Indigestion', keywords: ['indigestion', 'dyspepsia'] },
          { id: 'estomac-lourd', nom: 'Estomac lourd après repas', keywords: ['stomach', 'heavy', 'full'] },
          { id: 'estomac-douleur', nom: 'Douleur à l\'estomac', keywords: ['stomach', 'pain', 'gastralgia'] },
          { id: 'crampes-estomac', nom: 'Crampes d\'estomac', keywords: ['stomach', 'cramp'] },
          { id: 'appetit-perte', nom: 'Perte d\'appétit', keywords: ['appetite', 'loss'] },
          { id: 'appetit-excessif', nom: 'Appétit excessif', keywords: ['appetite', 'increased', 'hunger'] },
          { id: 'soif-excessive', nom: 'Soif excessive', keywords: ['thirst', 'excessive'] },
          { id: 'soif-absente', nom: 'Absence de soif', keywords: ['thirst', 'absent', 'thirstless'] },
        ]
      },
      {
        id: 'intestins',
        nom: 'Intestins',
        symptomes: [
          { id: 'diarrhee', nom: 'Diarrhée', keywords: ['diarrhea', 'diarrhoea', 'loose stool', 'diarrhée', 'selles liquides', 'stool'] },
          { id: 'constipation', nom: 'Constipation', keywords: ['constipation', 'stool', 'selles', 'rectum'] },
          { id: 'ballonnements', nom: 'Ballonnements', keywords: ['bloating', 'distension', 'gas'] },
          { id: 'flatulences', nom: 'Flatulences / Gaz', keywords: ['flatulence', 'gas', 'wind'] },
          { id: 'coliques', nom: 'Coliques', keywords: ['colic', 'colicky'] },
          { id: 'crampes-abdominales', nom: 'Crampes abdominales', keywords: ['abdomen', 'cramp'] },
          { id: 'douleur-abdominale', nom: 'Douleur abdominale', keywords: ['abdomen', 'pain'] },
          { id: 'coliques-nourrisson', nom: 'Coliques du nourrisson', keywords: ['colic', 'infant', 'baby'] },
          { id: 'syndrome-intestin-irritable', nom: 'Syndrome de l\'intestin irritable', keywords: ['irritable', 'bowel', 'IBS'] },
        ]
      },
      {
        id: 'foie-vesicule',
        nom: 'Foie et vésicule',
        symptomes: [
          { id: 'foie-douleur', nom: 'Douleur au foie', keywords: ['liver', 'pain'] },
          { id: 'nausees-biliaires', nom: 'Nausées avec bile', keywords: ['bile', 'bilious', 'nausea'] },
          { id: 'colique-hepatique', nom: 'Colique hépatique', keywords: ['liver', 'colic', 'gallbladder'] },
          { id: 'jaunisse', nom: 'Jaunisse', keywords: ['jaundice', 'yellow'] },
        ]
      },
      {
        id: 'rectum-anus',
        nom: 'Rectum et anus',
        symptomes: [
          { id: 'hemorroides', nom: 'Hémorroïdes', keywords: ['hemorrhoids', 'piles'] },
          { id: 'fissure-anale', nom: 'Fissure anale', keywords: ['anal', 'fissure'] },
          { id: 'prurit-anal', nom: 'Démangeaisons anales', keywords: ['anal', 'itching', 'pruritus'] },
          { id: 'prolapsus-rectal', nom: 'Prolapsus rectal', keywords: ['rectum', 'prolapse'] },
        ]
      }
    ]
  },

  // ============================================
  // SYSTÈME RESPIRATOIRE
  // ============================================
  {
    id: 'respiratoire',
    nom: 'Système respiratoire',
    icone: '🫁',
    description: 'Toux, bronchite, asthme',
    sousCategories: [
      {
        id: 'toux',
        nom: 'Toux',
        symptomes: [
          { id: 'toux-seche', nom: 'Toux sèche', keywords: ['cough', 'dry', 'toux', 'sèche', 'sec'] },
          { id: 'toux-grasse', nom: 'Toux grasse (productive)', keywords: ['cough', 'wet', 'productive', 'loose', 'toux', 'grasse', 'expectoration'] },
          { id: 'toux-aboyante', nom: 'Toux aboyante', description: 'Comme un chien', keywords: ['cough', 'barking', 'croup'] },
          { id: 'toux-quinteuse', nom: 'Quintes de toux', keywords: ['cough', 'paroxysmal', 'fit'] },
          { id: 'toux-nocturne', nom: 'Toux nocturne', keywords: ['cough', 'night'] },
          { id: 'toux-matin', nom: 'Toux matinale', keywords: ['cough', 'morning'] },
          { id: 'toux-chatouillante', nom: 'Toux avec chatouillement', keywords: ['cough', 'tickling'] },
          { id: 'coqueluche', nom: 'Coqueluche', keywords: ['whooping', 'cough', 'pertussis'] },
        ]
      },
      {
        id: 'expectoration',
        nom: 'Expectoration',
        symptomes: [
          { id: 'expecto-claire', nom: 'Expectoration claire', keywords: ['expectoration', 'clear', 'white'] },
          { id: 'expecto-jaune', nom: 'Expectoration jaune', keywords: ['expectoration', 'yellow'] },
          { id: 'expecto-verte', nom: 'Expectoration verte', keywords: ['expectoration', 'green'] },
          { id: 'expecto-sanguinolente', nom: 'Expectoration avec sang', keywords: ['expectoration', 'blood', 'bloody'] },
          { id: 'expecto-difficile', nom: 'Expectoration difficile', keywords: ['expectoration', 'difficult'] },
        ]
      },
      {
        id: 'respiration',
        nom: 'Respiration',
        symptomes: [
          { id: 'essoufflement', nom: 'Essoufflement', keywords: ['breath', 'short', 'dyspnea'] },
          { id: 'asthme', nom: 'Asthme', keywords: ['asthma', 'wheezing'] },
          { id: 'respiration-sifflante', nom: 'Respiration sifflante', keywords: ['wheezing', 'whistling'] },
          { id: 'oppression-thoracique', nom: 'Oppression thoracique', keywords: ['chest', 'tight', 'oppression'] },
          { id: 'bronchite', nom: 'Bronchite', keywords: ['bronchitis', 'bronchi'] },
          { id: 'pneumonie', nom: 'Pneumonie', keywords: ['pneumonia', 'lung'] },
        ]
      }
    ]
  },

  // ============================================
  // SYSTÈME URINAIRE
  // ============================================
  {
    id: 'urinaire',
    nom: 'Système urinaire',
    icone: '💧',
    description: 'Cystite, reins, miction',
    sousCategories: [
      {
        id: 'vessie',
        nom: 'Vessie',
        symptomes: [
          { id: 'cystite', nom: 'Cystite / Infection urinaire', keywords: ['bladder', 'cystitis', 'urinary', 'infection'] },
          { id: 'brulure-urinaire', nom: 'Brûlure en urinant', keywords: ['urination', 'burning'] },
          { id: 'envie-frequente', nom: 'Envies fréquentes d\'uriner', keywords: ['urination', 'frequent', 'urgency'] },
          { id: 'incontinence', nom: 'Incontinence urinaire', keywords: ['incontinence', 'urine', 'leak'] },
          { id: 'retention-urine', nom: 'Rétention urinaire', keywords: ['retention', 'urine', 'difficulty'] },
          { id: 'enuresie', nom: 'Énurésie (pipi au lit)', keywords: ['bedwetting', 'enuresis'] },
        ]
      },
      {
        id: 'reins',
        nom: 'Reins',
        symptomes: [
          { id: 'colique-nephretique', nom: 'Colique néphrétique', keywords: ['kidney', 'stone', 'colic', 'renal'] },
          { id: 'douleur-renale', nom: 'Douleur aux reins', keywords: ['kidney', 'pain'] },
          { id: 'calculs-renaux', nom: 'Calculs rénaux', keywords: ['kidney', 'stone', 'calculus'] },
        ]
      },
      {
        id: 'urine',
        nom: 'Urine',
        symptomes: [
          { id: 'urine-foncee', nom: 'Urine foncée', keywords: ['urine', 'dark'] },
          { id: 'urine-trouble', nom: 'Urine trouble', keywords: ['urine', 'cloudy'] },
          { id: 'sang-urine', nom: 'Sang dans les urines', keywords: ['urine', 'blood', 'hematuria'] },
          { id: 'urine-odeur', nom: 'Urine malodorante', keywords: ['urine', 'odor', 'smell'] },
        ]
      }
    ]
  },

  // ============================================
  // SYSTÈME GÉNITAL
  // ============================================
  {
    id: 'genital',
    nom: 'Système génital',
    icone: '⚧️',
    description: 'Règles, prostate, infections',
    sousCategories: [
      {
        id: 'feminin',
        nom: 'Problèmes féminins',
        symptomes: [
          { id: 'regles-douloureuses', nom: 'Règles douloureuses', keywords: ['menstruation', 'painful', 'dysmenorrhea'] },
          { id: 'regles-abondantes', nom: 'Règles abondantes', keywords: ['menstruation', 'heavy', 'menorrhagia'] },
          { id: 'regles-irregulieres', nom: 'Règles irrégulières', keywords: ['menstruation', 'irregular'] },
          { id: 'regles-absentes', nom: 'Absence de règles', keywords: ['amenorrhea', 'absent', 'period'] },
          { id: 'syndrome-premenstruel', nom: 'Syndrome prémenstruel', keywords: ['PMS', 'premenstrual'] },
          { id: 'bouffees-chaleur', nom: 'Bouffées de chaleur', keywords: ['hot', 'flash', 'menopause'] },
          { id: 'menopause', nom: 'Troubles de la ménopause', keywords: ['menopause', 'climacteric'] },
          { id: 'pertes-blanches', nom: 'Pertes blanches', keywords: ['discharge', 'leucorrhea', 'white'] },
          { id: 'mycose-vaginale', nom: 'Mycose vaginale', keywords: ['yeast', 'infection', 'candida', 'vaginal'] },
          { id: 'douleur-ovulation', nom: 'Douleur à l\'ovulation', keywords: ['ovulation', 'pain'] },
        ]
      },
      {
        id: 'masculin',
        nom: 'Problèmes masculins',
        symptomes: [
          { id: 'prostate', nom: 'Problèmes de prostate', keywords: ['prostate', 'enlarged'] },
          { id: 'impuissance', nom: 'Troubles de l\'érection', keywords: ['impotence', 'erectile', 'dysfunction'] },
          { id: 'ejaculation-precoce', nom: 'Éjaculation précoce', keywords: ['ejaculation', 'premature'] },
          { id: 'douleur-testicules', nom: 'Douleur aux testicules', keywords: ['testicle', 'pain'] },
        ]
      },
      {
        id: 'grossesse',
        nom: 'Grossesse',
        symptomes: [
          { id: 'nausees-grossesse', nom: 'Nausées de grossesse', keywords: ['pregnancy', 'nausea', 'morning sickness'] },
          { id: 'vomissements-grossesse', nom: 'Vomissements de grossesse', keywords: ['pregnancy', 'vomiting'] },
          { id: 'contractions', nom: 'Contractions prématurées', keywords: ['labor', 'contractions', 'premature'] },
          { id: 'mal-dos-grossesse', nom: 'Mal de dos pendant grossesse', keywords: ['pregnancy', 'back', 'pain'] },
        ]
      }
    ]
  },

  // ============================================
  // PEAU
  // ============================================
  {
    id: 'peau',
    nom: 'Peau',
    icone: '🩹',
    description: 'Eczéma, urticaire, plaies',
    sousCategories: [
      {
        id: 'eruptions',
        nom: 'Éruptions cutanées',
        symptomes: [
          { id: 'eczema', nom: 'Eczéma', keywords: ['eczema', 'skin', 'rash'] },
          { id: 'psoriasis', nom: 'Psoriasis', keywords: ['psoriasis', 'skin'] },
          { id: 'urticaire', nom: 'Urticaire', keywords: ['urticaria', 'hives', 'nettle'] },
          { id: 'acne', nom: 'Acné', keywords: ['acne', 'pimple'] },
          { id: 'zona', nom: 'Zona', keywords: ['shingles', 'herpes zoster'] },
          { id: 'herpes', nom: 'Herpès', keywords: ['herpes', 'cold sore'] },
          { id: 'impetigo', nom: 'Impétigo', keywords: ['impetigo'] },
          { id: 'varicelle', nom: 'Varicelle', keywords: ['chickenpox', 'varicella'] },
          { id: 'rougeole', nom: 'Rougeole', keywords: ['measles', 'rubeola'] },
          { id: 'rubeole', nom: 'Rubéole', keywords: ['rubella', 'german measles'] },
        ]
      },
      {
        id: 'demangeaisons',
        nom: 'Démangeaisons',
        symptomes: [
          { id: 'prurit', nom: 'Démangeaisons (prurit)', keywords: ['itching', 'pruritus', 'itch'] },
          { id: 'prurit-generalise', nom: 'Démangeaisons généralisées', keywords: ['itching', 'generalized', 'whole body'] },
          { id: 'prurit-localise', nom: 'Démangeaisons localisées', keywords: ['itching', 'local'] },
        ]
      },
      {
        id: 'lesions',
        nom: 'Lésions cutanées',
        symptomes: [
          { id: 'verrues', nom: 'Verrues', keywords: ['wart'] },
          { id: 'cors', nom: 'Cors et durillons', keywords: ['corn', 'callus'] },
          { id: 'furoncle', nom: 'Furoncle', keywords: ['boil', 'furuncle'] },
          { id: 'abces', nom: 'Abcès cutané', keywords: ['abscess', 'skin'] },
          { id: 'plaie', nom: 'Plaie / Blessure', keywords: ['wound', 'injury', 'cut'] },
          { id: 'brulure', nom: 'Brûlure', keywords: ['burn'] },
          { id: 'ecchymose', nom: 'Ecchymose / Bleu', keywords: ['bruise', 'contusion'] },
          { id: 'cicatrisation', nom: 'Cicatrisation difficile', keywords: ['healing', 'scar', 'wound'] },
        ]
      },
      {
        id: 'peau-autres',
        nom: 'Autres problèmes de peau',
        symptomes: [
          { id: 'peau-seche', nom: 'Peau sèche', keywords: ['skin', 'dry'] },
          { id: 'peau-grasse', nom: 'Peau grasse', keywords: ['skin', 'oily'] },
          { id: 'transpiration-excessive', nom: 'Transpiration excessive', keywords: ['sweat', 'perspiration', 'excessive'] },
          { id: 'transpiration-malodorante', nom: 'Transpiration malodorante', keywords: ['sweat', 'odor', 'offensive'] },
          { id: 'mycose-peau', nom: 'Mycose cutanée', keywords: ['fungal', 'ringworm', 'tinea'] },
          { id: 'pied-athlete', nom: 'Pied d\'athlète', keywords: ['athlete foot', 'tinea pedis'] },
        ]
      }
    ]
  },

  // ============================================
  // MUSCLES ET ARTICULATIONS
  // ============================================
  {
    id: 'muscles-articulations',
    nom: 'Muscles et articulations',
    icone: '💪',
    description: 'Douleurs, rhumatismes, crampes',
    sousCategories: [
      {
        id: 'douleurs-articulaires',
        nom: 'Douleurs articulaires',
        symptomes: [
          { id: 'arthrose', nom: 'Arthrose', keywords: ['arthritis', 'osteoarthritis', 'joint'] },
          { id: 'arthrite', nom: 'Arthrite inflammatoire', keywords: ['arthritis', 'inflammation', 'joint'] },
          { id: 'rhumatisme', nom: 'Rhumatismes', keywords: ['rheumatism', 'rheumatic'] },
          { id: 'goutte', nom: 'Goutte', keywords: ['gout', 'uric acid'] },
          { id: 'douleur-genou', nom: 'Douleur au genou', keywords: ['knee', 'pain'] },
          { id: 'douleur-hanche', nom: 'Douleur à la hanche', keywords: ['hip', 'pain'] },
          { id: 'douleur-epaule', nom: 'Douleur à l\'épaule', keywords: ['shoulder', 'pain'] },
          { id: 'douleur-coude', nom: 'Douleur au coude', keywords: ['elbow', 'pain'] },
          { id: 'douleur-poignet', nom: 'Douleur au poignet', keywords: ['wrist', 'pain'] },
          { id: 'douleur-cheville', nom: 'Douleur à la cheville', keywords: ['ankle', 'pain'] },
          { id: 'douleur-doigts', nom: 'Douleur aux doigts', keywords: ['finger', 'pain'] },
        ]
      },
      {
        id: 'dos',
        nom: 'Dos',
        symptomes: [
          { id: 'lumbago', nom: 'Lumbago / Lombalgie', keywords: ['back', 'pain', 'lumbar', 'lumbago'] },
          { id: 'sciatique', nom: 'Sciatique', keywords: ['sciatica', 'sciatic'] },
          { id: 'torticolis', nom: 'Torticolis', keywords: ['neck', 'stiff', 'torticollis'] },
          { id: 'douleur-cervicales', nom: 'Douleur aux cervicales', keywords: ['neck', 'cervical', 'pain'] },
          { id: 'douleur-dorsale', nom: 'Douleur dorsale', keywords: ['back', 'dorsal', 'pain'] },
        ]
      },
      {
        id: 'muscles',
        nom: 'Muscles',
        symptomes: [
          { id: 'courbatures', nom: 'Courbatures', keywords: ['muscle', 'ache', 'soreness'] },
          { id: 'crampes', nom: 'Crampes musculaires', keywords: ['cramp', 'muscle'] },
          { id: 'contractures', nom: 'Contractures musculaires', keywords: ['contracture', 'muscle', 'tension'] },
          { id: 'tendinite', nom: 'Tendinite', keywords: ['tendinitis', 'tendon'] },
          { id: 'entorse', nom: 'Entorse', keywords: ['sprain'] },
          { id: 'dechirure-musculaire', nom: 'Déchirure musculaire', keywords: ['muscle', 'tear', 'strain'] },
          { id: 'raideur-musculaire', nom: 'Raideur musculaire', keywords: ['muscle', 'stiffness', 'stiff'] },
          { id: 'faiblesse-musculaire', nom: 'Faiblesse musculaire', keywords: ['muscle', 'weakness', 'weak'] },
        ]
      },
      {
        id: 'extremites',
        nom: 'Extrémités',
        symptomes: [
          { id: 'mains-froides', nom: 'Mains froides', keywords: ['hand', 'cold'] },
          { id: 'pieds-froids', nom: 'Pieds froids', keywords: ['foot', 'cold'] },
          { id: 'engourdissement', nom: 'Engourdissements', keywords: ['numbness', 'tingling'] },
          { id: 'fourmillements', nom: 'Fourmillements', keywords: ['tingling', 'pins and needles'] },
          { id: 'jambes-lourdes', nom: 'Jambes lourdes', keywords: ['leg', 'heavy', 'heaviness'] },
          { id: 'jambes-sans-repos', nom: 'Jambes sans repos', keywords: ['restless', 'leg'] },
          { id: 'oedeme-jambes', nom: 'Œdème des jambes', keywords: ['leg', 'swelling', 'edema'] },
          { id: 'varices', nom: 'Varices', keywords: ['varicose', 'vein'] },
        ]
      }
    ]
  },

  // ============================================
  // SYSTÈME NERVEUX ET MENTAL
  // ============================================
  {
    id: 'nerveux-mental',
    nom: 'Nerveux et mental',
    icone: '🧠',
    description: 'Stress, anxiété, sommeil, fatigue',
    sousCategories: [
      {
        id: 'anxiete-stress',
        nom: 'Anxiété et stress',
        symptomes: [
          { id: 'anxiete', nom: 'Anxiété', keywords: ['anxiety', 'anxious', 'worry', 'anxiété', 'angoisse', 'peur', 'mind'] },
          { id: 'stress', nom: 'Stress', keywords: ['stress', 'tension', 'nerveux', 'mind'] },
          { id: 'angoisse', nom: 'Angoisse', keywords: ['anguish', 'distress'] },
          { id: 'panique', nom: 'Attaque de panique', keywords: ['panic', 'attack'] },
          { id: 'phobies', nom: 'Phobies', keywords: ['phobia', 'fear'] },
          { id: 'trac', nom: 'Trac / Appréhension', keywords: ['stage fright', 'anticipation', 'anxiety'] },
          { id: 'nervosité', nom: 'Nervosité', keywords: ['nervous', 'restless'] },
        ]
      },
      {
        id: 'humeur',
        nom: 'Troubles de l\'humeur',
        symptomes: [
          { id: 'tristesse', nom: 'Tristesse', keywords: ['sadness', 'sad', 'grief'] },
          { id: 'depression', nom: 'Dépression légère', keywords: ['depression', 'depressed'] },
          { id: 'irritabilite', nom: 'Irritabilité', keywords: ['irritability', 'irritable', 'anger'] },
          { id: 'colere', nom: 'Colère', keywords: ['anger', 'rage'] },
          { id: 'hypersensibilite', nom: 'Hypersensibilité émotionnelle', keywords: ['sensitive', 'emotional', 'weeping'] },
          { id: 'deuil', nom: 'Deuil / Chagrin', keywords: ['grief', 'loss', 'mourning'] },
          { id: 'nostalgie', nom: 'Nostalgie / Mal du pays', keywords: ['homesickness', 'nostalgia'] },
        ]
      },
      {
        id: 'sommeil',
        nom: 'Sommeil',
        symptomes: [
          { id: 'insomnie', nom: 'Insomnie', keywords: ['insomnia', 'sleepless', 'sleep', 'sommeil', 'dormir'] },
          { id: 'difficulte-endormissement', nom: 'Difficulté d\'endormissement', keywords: ['sleep', 'falling asleep', 'difficulty'] },
          { id: 'reveils-nocturnes', nom: 'Réveils nocturnes', keywords: ['waking', 'night'] },
          { id: 'cauchemars', nom: 'Cauchemars', keywords: ['nightmare', 'dream'] },
          { id: 'somnambulisme', nom: 'Somnambulisme', keywords: ['sleepwalking'] },
          { id: 'sommeil-agite', nom: 'Sommeil agité', keywords: ['sleep', 'restless'] },
          { id: 'somnolence', nom: 'Somnolence excessive', keywords: ['drowsy', 'sleepy'] },
        ]
      },
      {
        id: 'fatigue',
        nom: 'Fatigue',
        symptomes: [
          { id: 'fatigue-generale', nom: 'Fatigue générale', keywords: ['fatigue', 'tired', 'exhaustion'] },
          { id: 'fatigue-matinale', nom: 'Fatigue au réveil', keywords: ['fatigue', 'morning', 'waking'] },
          { id: 'epuisement', nom: 'Épuisement / Burn-out', keywords: ['exhaustion', 'burnout'] },
          { id: 'convalescence', nom: 'Convalescence', keywords: ['recovery', 'convalescence'] },
          { id: 'surmenage', nom: 'Surmenage', keywords: ['overwork', 'strain'] },
        ]
      },
      {
        id: 'concentration',
        nom: 'Concentration et mémoire',
        symptomes: [
          { id: 'concentration-difficile', nom: 'Difficulté de concentration', keywords: ['concentration', 'focus', 'attention'] },
          { id: 'memoire-faible', nom: 'Troubles de mémoire', keywords: ['memory', 'forgetful'] },
          { id: 'confusion-mentale', nom: 'Confusion mentale', keywords: ['confusion', 'mental'] },
          { id: 'brouillard-mental', nom: 'Brouillard mental', keywords: ['brain fog', 'mental fog'] },
        ]
      }
    ]
  },

  // ============================================
  // FIÈVRE ET ÉTATS GÉNÉRAUX
  // ============================================
  {
    id: 'general',
    nom: 'États généraux',
    icone: '🌡️',
    description: 'Fièvre, frissons, faiblesse',
    sousCategories: [
      {
        id: 'fievre',
        nom: 'Fièvre',
        symptomes: [
          { id: 'fievre-legere', nom: 'Fièvre légère', keywords: ['fever', 'low'] },
          { id: 'fievre-elevee', nom: 'Fièvre élevée', keywords: ['fever', 'high'] },
          { id: 'fievre-soudaine', nom: 'Fièvre soudaine', keywords: ['fever', 'sudden'] },
          { id: 'fievre-intermittente', nom: 'Fièvre intermittente', keywords: ['fever', 'intermittent'] },
          { id: 'frissons', nom: 'Frissons', keywords: ['chill', 'chills', 'shivering'] },
          { id: 'sueurs-fievre', nom: 'Sueurs avec fièvre', keywords: ['fever', 'sweat', 'perspiration'] },
        ]
      },
      {
        id: 'infections',
        nom: 'Infections et immunité',
        symptomes: [
          { id: 'grippe', nom: 'Grippe', keywords: ['flu', 'influenza'] },
          { id: 'rhume', nom: 'Rhume', keywords: ['cold', 'common cold'] },
          { id: 'ganglions', nom: 'Ganglions enflés', keywords: ['gland', 'lymph', 'swollen'] },
          { id: 'infections-repetees', nom: 'Infections à répétition', keywords: ['infection', 'recurrent'] },
          { id: 'contagion', nom: 'Prévention contagion', keywords: ['contagion', 'prevention'] },
        ]
      },
      {
        id: 'traumatismes',
        nom: 'Traumatismes et accidents',
        symptomes: [
          { id: 'choc-traumatisme', nom: 'Choc / Traumatisme', keywords: ['trauma', 'injury', 'shock'] },
          { id: 'contusion', nom: 'Contusion / Coup', keywords: ['bruise', 'contusion', 'blow'] },
          { id: 'chute', nom: 'Suite de chute', keywords: ['fall', 'falling'] },
          { id: 'accident', nom: 'Suite d\'accident', keywords: ['accident', 'injury'] },
          { id: 'chirurgie', nom: 'Pré/post chirurgie', keywords: ['surgery', 'operation'] },
          { id: 'fracture', nom: 'Fracture (consolidation)', keywords: ['fracture', 'bone', 'healing'] },
        ]
      },
      {
        id: 'allergies',
        nom: 'Allergies',
        symptomes: [
          { id: 'allergie-generale', nom: 'Allergie (général)', keywords: ['allergy', 'allergic'] },
          { id: 'rhume-des-foins', nom: 'Rhume des foins', keywords: ['hay fever', 'pollen'] },
          { id: 'allergie-alimentaire', nom: 'Allergie alimentaire', keywords: ['food', 'allergy'] },
          { id: 'allergie-piqure', nom: 'Réaction aux piqûres', keywords: ['insect', 'bite', 'sting'] },
        ]
      }
    ]
  },

  // ============================================
  // COEUR ET CIRCULATION
  // ============================================
  {
    id: 'coeur-circulation',
    nom: 'Cœur et circulation',
    icone: '❤️',
    description: 'Palpitations, tension, circulation',
    sousCategories: [
      {
        id: 'coeur',
        nom: 'Cœur',
        symptomes: [
          { id: 'palpitations', nom: 'Palpitations', keywords: ['palpitation', 'heart', 'racing'] },
          { id: 'tachycardie', nom: 'Cœur qui bat vite', keywords: ['tachycardia', 'heart', 'fast'] },
          { id: 'douleur-poitrine', nom: 'Douleur à la poitrine', keywords: ['chest', 'pain'] },
          { id: 'oppression-coeur', nom: 'Oppression cardiaque', keywords: ['heart', 'oppression', 'tight'] },
        ]
      },
      {
        id: 'circulation',
        nom: 'Circulation',
        symptomes: [
          { id: 'hypertension', nom: 'Tension élevée', keywords: ['hypertension', 'blood pressure', 'high'] },
          { id: 'hypotension', nom: 'Tension basse', keywords: ['hypotension', 'blood pressure', 'low'] },
          { id: 'circulation-mauvaise', nom: 'Mauvaise circulation', keywords: ['circulation', 'poor'] },
          { id: 'bouffees-chaleur-circ', nom: 'Bouffées de chaleur', keywords: ['hot', 'flush', 'face'] },
          { id: 'extremites-froides', nom: 'Extrémités froides', keywords: ['cold', 'extremities'] },
        ]
      },
      {
        id: 'hemorragies',
        nom: 'Saignements',
        symptomes: [
          { id: 'saignement-facile', nom: 'Tendance aux saignements', keywords: ['bleeding', 'easy'] },
          { id: 'hemorragie', nom: 'Hémorragie', keywords: ['hemorrhage', 'bleeding'] },
        ]
      }
    ]
  },

  // ============================================
  // ENFANTS ET BÉBÉS
  // ============================================
  {
    id: 'enfants',
    nom: 'Enfants et bébés',
    icone: '👶',
    description: 'Problèmes spécifiques pédiatriques',
    sousCategories: [
      {
        id: 'nourrisson',
        nom: 'Nourrisson',
        symptomes: [
          { id: 'coliques-bebe', nom: 'Coliques du nourrisson', keywords: ['colic', 'infant', 'baby', 'crying'] },
          { id: 'poussee-dentaire-bebe', nom: 'Poussée dentaire', keywords: ['teething', 'tooth'] },
          { id: 'reflux-bebe', nom: 'Reflux / Régurgitations', keywords: ['reflux', 'regurgitation', 'baby'] },
          { id: 'erytheme-fessier', nom: 'Érythème fessier', keywords: ['diaper', 'rash', 'nappy'] },
          { id: 'croutes-lait', nom: 'Croûtes de lait', keywords: ['cradle cap'] },
        ]
      },
      {
        id: 'enfant',
        nom: 'Enfant',
        symptomes: [
          { id: 'otites-repetition', nom: 'Otites à répétition', keywords: ['ear', 'infection', 'recurrent'] },
          { id: 'terreurs-nocturnes', nom: 'Terreurs nocturnes', keywords: ['night', 'terror', 'fear'] },
          { id: 'pipi-lit', nom: 'Pipi au lit', keywords: ['bedwetting', 'enuresis'] },
          { id: 'peur-noir', nom: 'Peur du noir', keywords: ['fear', 'dark', 'night'] },
          { id: 'hyperactivite', nom: 'Hyperactivité', keywords: ['hyperactive', 'ADHD'] },
          { id: 'croissance', nom: 'Douleurs de croissance', keywords: ['growing', 'pain', 'growth'] },
        ]
      },
      {
        id: 'maladies-enfantines',
        nom: 'Maladies infantiles',
        symptomes: [
          { id: 'varicelle-enfant', nom: 'Varicelle', keywords: ['chickenpox'] },
          { id: 'rougeole-enfant', nom: 'Rougeole', keywords: ['measles'] },
          { id: 'oreillons', nom: 'Oreillons', keywords: ['mumps'] },
          { id: 'scarlatine', nom: 'Scarlatine', keywords: ['scarlet fever'] },
          { id: 'coqueluche-enfant', nom: 'Coqueluche', keywords: ['whooping cough'] },
        ]
      }
    ]
  },
];

// Fonction pour rechercher des symptômes
export function searchSymptoms(query: string): Symptom[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const results: Symptom[] = [];

  for (const category of SYMPTOM_CATEGORIES) {
    for (const subCategory of category.sousCategories) {
      for (const symptom of subCategory.symptomes) {
        const normalizedNom = symptom.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedDesc = (symptom.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (normalizedNom.includes(normalizedQuery) ||
            normalizedDesc.includes(normalizedQuery) ||
            symptom.keywords.some(k => k.toLowerCase().includes(normalizedQuery))) {
          results.push(symptom);
        }
      }
    }
  }

  return results;
}

// Fonction pour obtenir les mots-clés OOREP depuis un symptôme
export function getOorepKeywords(symptomId: string): string[] {
  for (const category of SYMPTOM_CATEGORIES) {
    for (const subCategory of category.sousCategories) {
      for (const symptom of subCategory.symptomes) {
        if (symptom.id === symptomId) {
          return symptom.keywords;
        }
      }
    }
  }
  return [];
}
