/**
 * Génère les fichiers SQL pour importer les données OOREP dans Supabase
 */

import * as fs from 'fs';
import * as path from 'path';

interface Remedy {
  id: number;
  abbrev: string;
  name: string;
  nameAlt: string | null;
}

interface Rubric {
  id: number;
  abbrev: string;
  fullpath: string;
  fullpathFr: string;
  chapter: string;
  chapterFr: string;
  isMain: boolean;
}

interface RubricRemedy {
  rubricId: number;
  remedyId: number;
  weight: number;
}

// Traductions supplémentaires pour les termes anatomiques et médicaux
const ADDITIONAL_TRANSLATIONS: Record<string, string> = {
  'liver': 'foie',
  'spleen': 'rate',
  'kidney': 'rein',
  'kidneys': 'reins',
  'bladder': 'vessie',
  'heart': 'cœur',
  'lung': 'poumon',
  'lungs': 'poumons',
  'stomach': 'estomac',
  'intestine': 'intestin',
  'intestines': 'intestins',
  'bowel': 'intestin',
  'bowels': 'intestins',
  'throat': 'gorge',
  'mouth': 'bouche',
  'tongue': 'langue',
  'teeth': 'dents',
  'tooth': 'dent',
  'gum': 'gencive',
  'gums': 'gencives',
  'nose': 'nez',
  'ear': 'oreille',
  'ears': 'oreilles',
  'eye': 'œil',
  'eyes': 'yeux',
  'face': 'visage',
  'head': 'tête',
  'neck': 'cou',
  'back': 'dos',
  'spine': 'colonne vertébrale',
  'chest': 'poitrine',
  'breast': 'sein',
  'breasts': 'seins',
  'abdomen': 'abdomen',
  'pelvis': 'bassin',
  'hip': 'hanche',
  'hips': 'hanches',
  'leg': 'jambe',
  'legs': 'jambes',
  'foot': 'pied',
  'feet': 'pieds',
  'arm': 'bras',
  'arms': 'bras',
  'hand': 'main',
  'hands': 'mains',
  'finger': 'doigt',
  'fingers': 'doigts',
  'toe': 'orteil',
  'toes': 'orteils',
  'joint': 'articulation',
  'joints': 'articulations',
  'muscle': 'muscle',
  'muscles': 'muscles',
  'bone': 'os',
  'bones': 'os',
  'skin': 'peau',
  'hair': 'cheveux',
  'nail': 'ongle',
  'nails': 'ongles',
  'blood': 'sang',
  'urine': 'urine',
  'stool': 'selles',
  'sweat': 'sueur',
  'saliva': 'salive',
  'mucus': 'mucus',
  'pus': 'pus',
  'region': 'région',
  'side': 'côté',
  'upper': 'supérieur',
  'lower': 'inférieur',
  'inner': 'interne',
  'outer': 'externe',
  'anterior': 'antérieur',
  'posterior': 'postérieur',
  'inguinal': 'inguinal',
  'lumbar': 'lombaire',
  'cervical': 'cervical',
  'thoracic': 'thoracique',
  'distension': 'distension',
  'adhesion': 'adhérence',
  'foreign body': 'corps étranger',
  'ball': 'boule',
  'ascending': 'remontant',
  'bubbling': 'bouillonnement',
  'bubo': 'bubon',
  'cirrhosis': 'cirrhose',
  'clucking': 'gargouillement',
  'constriction': 'constriction',
  'contraction': 'contraction',
  'convulsion': 'convulsion',
  'colic': 'colique',
  'cramp': 'crampe',
  'discharge': 'écoulement',
  'dropsy': 'hydropisie',
  'dryness': 'sécheresse',
  'emptiness': 'vide',
  'enlargement': 'grossissement',
  'eruption': 'éruption',
  'flatus': 'flatulence',
  'fullness': 'plénitude',
  'gurgling': 'gargouillis',
  'hardness': 'dureté',
  'heaviness': 'lourdeur',
  'hernia': 'hernie',
  'induration': 'induration',
  'inflammation': 'inflammation',
  'itching': 'démangeaison',
  'lump': 'grosseur',
  'movement': 'mouvement',
  'movements': 'mouvements',
  'noises': 'bruits',
  'numbness': 'engourdissement',
  'obstruction': 'obstruction',
  'oppression': 'oppression',
  'palpitation': 'palpitation',
  'paralysis': 'paralysie',
  'perspiration': 'transpiration',
  'pulsation': 'pulsation',
  'relaxation': 'relâchement',
  'restlessness': 'agitation',
  'retraction': 'rétraction',
  'rumbling': 'grondement',
  'sensitive': 'sensible',
  'sensitiveness': 'sensibilité',
  'shaking': 'secousse',
  'shivering': 'frisson',
  'spasm': 'spasme',
  'stiffness': 'raideur',
  'stone': 'calcul',
  'stones': 'calculs',
  'suppuration': 'suppuration',
  'swelling': 'gonflement',
  'tension': 'tension',
  'throbbing': 'battement',
  'tingling': 'fourmillement',
  'trembling': 'tremblement',
  'tumor': 'tumeur',
  'twitching': 'secousse',
  'ulcer': 'ulcère',
  'ulceration': 'ulcération',
  'uncover': 'découvrir',
  'urging': 'besoin pressant',
  'wart': 'verrue',
  'warts': 'verrues',
  'weakness': 'faiblesse',
  'weight': 'poids',
  'worm': 'ver',
  'worms': 'vers',
};

function translateFullPath(path: string): string {
  let result = path;

  // Apply all translations
  for (const [en, fr] of Object.entries(ADDITIONAL_TRANSLATIONS)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, fr);
  }

  return result;
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function generateRemediesSQL(remedies: Remedy[]): string {
  const lines: string[] = [
    '-- Suppression des anciennes données',
    'TRUNCATE TABLE symptomes_remedes CASCADE;',
    'TRUNCATE TABLE symptomes CASCADE;',
    'TRUNCATE TABLE remedes CASCADE;',
    '',
    '-- Insertion des remèdes OOREP',
    'INSERT INTO remedes (id, nom, nom_complet, description, dilutions, forme_galenique) VALUES'
  ];

  const values = remedies.map((r, i) => {
    const id = `'${r.id.toString().padStart(8, '0')}-0000-4000-8000-000000000000'`;
    const nom = escapeSQL(r.abbrev);
    const nomComplet = escapeSQL(r.name);
    const dilutions = "ARRAY['5CH', '7CH', '9CH', '15CH', '30CH']";
    const formes = "ARRAY['granules']";

    return `(${id}, '${nom}', '${nomComplet}', NULL, ${dilutions}, ${formes})${i < remedies.length - 1 ? ',' : ';'}`;
  });

  return lines.join('\n') + '\n' + values.join('\n');
}

function generateRubricsSQL(rubrics: Rubric[]): string {
  const lines: string[] = [
    '',
    '-- Insertion des symptômes/rubriques OOREP',
    'INSERT INTO symptomes (id, nom, categorie, description, mots_cles) VALUES'
  ];

  const values = rubrics.map((r, i) => {
    const id = `'${r.id.toString().padStart(8, '0')}-1111-4000-8000-000000000000'`;
    const translatedPath = translateFullPath(r.fullpathFr);
    const nom = escapeSQL(translatedPath);
    const categorie = escapeSQL(r.chapterFr);
    const motsCles = r.fullpath.toLowerCase().split(', ').map(s => `'${escapeSQL(s)}'`).join(', ');

    return `(${id}, '${nom}', '${categorie}', NULL, ARRAY[${motsCles}])${i < rubrics.length - 1 ? ',' : ';'}`;
  });

  return lines.join('\n') + '\n' + values.join('\n');
}

function generateAssociationsSQL(associations: RubricRemedy[]): string {
  const lines: string[] = [
    '',
    '-- Insertion des associations symptômes-remèdes',
    'INSERT INTO symptomes_remedes (symptome_id, remede_id, profils, grade, dilution_recommandee, posologie_adulte) VALUES'
  ];

  // Limit to first 50000 for initial import (Supabase SQL editor has limits)
  const limitedAssocs = associations.slice(0, 50000);

  const values = limitedAssocs.map((a, i) => {
    const symptomeId = `'${a.rubricId.toString().padStart(8, '0')}-1111-4000-8000-000000000000'`;
    const remedeId = `'${a.remedyId.toString().padStart(8, '0')}-0000-4000-8000-000000000000'`;
    const profils = "ARRAY['adulte']";
    const grade = Math.min(a.weight, 3);
    const dilution = "'9CH'";
    const posologie = "'5 granules 3 fois par jour'";

    return `(${symptomeId}, ${remedeId}, ${profils}, ${grade}, ${dilution}, ${posologie})${i < limitedAssocs.length - 1 ? ',' : ';'}`;
  });

  return lines.join('\n') + '\n' + values.join('\n');
}

async function main() {
  const dataDir = path.join(__dirname, '../../data/oorep');
  const outputDir = path.join(__dirname, '../../data/sql');

  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Loading extracted data...');

  const remedies: Remedy[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'remedies.json'), 'utf-8')
  );

  const rubrics: Rubric[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'rubrics.json'), 'utf-8')
  );

  const associations: RubricRemedy[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'associations.json'), 'utf-8')
  );

  console.log(`Loaded: ${remedies.length} remedies, ${rubrics.length} rubrics, ${associations.length} associations`);

  // Generate SQL files (split for Supabase limits)
  console.log('\nGenerating SQL files...');

  // File 1: Remedies
  const remediesSQL = generateRemediesSQL(remedies);
  fs.writeFileSync(path.join(outputDir, '01_remedies.sql'), remediesSQL);
  console.log('Generated: 01_remedies.sql');

  // File 2: Rubrics (split into chunks of 5000)
  const chunkSize = 5000;
  for (let i = 0; i < rubrics.length; i += chunkSize) {
    const chunk = rubrics.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const header = i === 0 ? '-- Insertion des symptômes/rubriques OOREP\n' : '';
    const prefix = i === 0 ? '' : '\n';

    const lines = chunk.map((r, j) => {
      const id = `'${r.id.toString().padStart(8, '0')}-1111-4000-8000-000000000000'`;
      const translatedPath = translateFullPath(r.fullpathFr);
      const nom = escapeSQL(translatedPath);
      const categorie = escapeSQL(r.chapterFr);
      const motsCles = r.fullpath.toLowerCase().split(', ').map(s => `'${escapeSQL(s)}'`).join(', ');
      const isLast = i + j === rubrics.length - 1 || j === chunk.length - 1;

      return `INSERT INTO symptomes (id, nom, categorie, description, mots_cles) VALUES (${id}, '${nom}', '${categorie}', NULL, ARRAY[${motsCles}]);`;
    });

    fs.writeFileSync(
      path.join(outputDir, `02_rubrics_${chunkNum.toString().padStart(2, '0')}.sql`),
      lines.join('\n')
    );
    console.log(`Generated: 02_rubrics_${chunkNum.toString().padStart(2, '0')}.sql`);
  }

  // File 3: Associations (split into chunks of 10000)
  const assocChunkSize = 10000;
  for (let i = 0; i < Math.min(associations.length, 100000); i += assocChunkSize) {
    const chunk = associations.slice(i, i + assocChunkSize);
    const chunkNum = Math.floor(i / assocChunkSize) + 1;

    const lines = chunk.map((a) => {
      const symptomeId = `'${a.rubricId.toString().padStart(8, '0')}-1111-4000-8000-000000000000'`;
      const remedeId = `'${a.remedyId.toString().padStart(8, '0')}-0000-4000-8000-000000000000'`;
      const grade = Math.min(a.weight, 3);

      return `INSERT INTO symptomes_remedes (symptome_id, remede_id, profils, grade, dilution_recommandee, posologie_adulte) VALUES (${symptomeId}, ${remedeId}, ARRAY['adulte'], ${grade}, '9CH', '5 granules 3 fois par jour') ON CONFLICT DO NOTHING;`;
    });

    fs.writeFileSync(
      path.join(outputDir, `03_associations_${chunkNum.toString().padStart(2, '0')}.sql`),
      lines.join('\n')
    );
    console.log(`Generated: 03_associations_${chunkNum.toString().padStart(2, '0')}.sql`);
  }

  console.log(`\nSQL files saved to: ${outputDir}`);
  console.log('\nNext steps:');
  console.log('1. Execute 01_remedies.sql in Supabase SQL Editor');
  console.log('2. Execute 02_rubrics_*.sql files in order');
  console.log('3. Execute 03_associations_*.sql files in order');
}

main().catch(console.error);
