/**
 * Import direct des données OOREP dans Supabase via PostgreSQL
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Set DATABASE_URL environment variable with your Supabase PostgreSQL connection string
// Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
const CONNECTION_STRING = process.env.DATABASE_URL;

if (!CONNECTION_STRING) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

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

// Traductions complètes
const TRANSLATIONS: Record<string, string> = {
  // Chapitres
  'Mind': 'Psychisme',
  'Vertigo': 'Vertiges',
  'Head': 'Tête',
  'Eye': 'Yeux',
  'Vision': 'Vision',
  'Ear': 'Oreilles',
  'Hearing': 'Audition',
  'Nose': 'Nez',
  'Face': 'Visage',
  'Mouth': 'Bouche',
  'Teeth': 'Dents',
  'Throat': 'Gorge',
  'External Throat': 'Gorge externe',
  'Stomach': 'Estomac',
  'Abdomen': 'Abdomen',
  'Rectum': 'Rectum',
  'Stool': 'Selles',
  'Bladder': 'Vessie',
  'Kidneys': 'Reins',
  'Prostate Gland': 'Prostate',
  'Urethra': 'Urètre',
  'Urine': 'Urine',
  'Genitalia Male': 'Organes génitaux masculins',
  'Genitalia Female': 'Organes génitaux féminins',
  'Larynx and Trachea': 'Larynx et trachée',
  'Respiration': 'Respiration',
  'Cough': 'Toux',
  'Expectoration': 'Expectoration',
  'Chest': 'Poitrine',
  'Back': 'Dos',
  'Extremities': 'Extrémités',
  'Sleep': 'Sommeil',
  'Dreams': 'Rêves',
  'Chill': 'Frissons',
  'Fever': 'Fièvre',
  'Perspiration': 'Transpiration',
  'Skin': 'Peau',
  'Generalities': 'Généralités',
  // Termes courants
  'pain': 'douleur', 'aching': 'endolori', 'burning': 'brûlant', 'cutting': 'coupant',
  'pressing': 'pressant', 'stitching': 'lancinant', 'tearing': 'déchirant', 'throbbing': 'pulsatif',
  'morning': 'matin', 'afternoon': 'après-midi', 'evening': 'soir', 'night': 'nuit',
  'before': 'avant', 'after': 'après', 'during': 'pendant',
  'amel.': 'amélioré par', 'agg.': 'aggravé par', 'worse': 'aggravé', 'better': 'amélioré',
  'eating': 'manger', 'drinking': 'boire', 'walking': 'marcher',
  'sitting': 'assis', 'lying': 'couché', 'standing': 'debout',
  'motion': 'mouvement', 'rest': 'repos', 'cold': 'froid', 'heat': 'chaleur',
  'warm': 'chaud', 'warmth': 'chaleur', 'pressure': 'pression', 'touch': 'toucher',
  'extending': 'irradiant vers', 'left': 'gauche', 'right': 'droit',
  'acute': 'aigu', 'chronic': 'chronique', 'sudden': 'soudain',
  'constant': 'constant', 'intermittent': 'intermittent', 'violent': 'violent',
  'severe': 'sévère', 'mild': 'léger', 'dull': 'sourd', 'sharp': 'vif',
  'swelling': 'gonflement', 'inflammation': 'inflammation', 'redness': 'rougeur',
  'itching': 'démangeaison', 'numbness': 'engourdissement', 'weakness': 'faiblesse',
  'stiffness': 'raideur', 'cramping': 'crampe', 'spasm': 'spasme', 'trembling': 'tremblement',
  'coldness': 'froideur', 'sensation': 'sensation', 'anxiety': 'anxiété',
  'fear': 'peur', 'sadness': 'tristesse', 'anger': 'colère', 'irritability': 'irritabilité',
  'restlessness': 'agitation', 'confusion': 'confusion', 'memory': 'mémoire',
  'appetite': 'appétit', 'thirst': 'soif', 'nausea': 'nausée', 'vomiting': 'vomissement',
  'diarrhea': 'diarrhée', 'constipation': 'constipation', 'cough': 'toux',
  'dry': 'sec', 'wet': 'humide', 'headache': 'mal de tête', 'fever': 'fièvre',
  'discharge': 'écoulement', 'bleeding': 'saignement', 'ulcer': 'ulcère',
  'eruption': 'éruption', 'abscess': 'abcès',
  'liver': 'foie', 'spleen': 'rate', 'kidney': 'rein', 'heart': 'cœur',
  'lung': 'poumon', 'stomach': 'estomac', 'intestine': 'intestin',
  'tongue': 'langue', 'tooth': 'dent', 'gum': 'gencive', 'ear': 'oreille',
  'eye': 'œil', 'face': 'visage', 'head': 'tête', 'neck': 'cou', 'back': 'dos',
  'chest': 'poitrine', 'breast': 'sein', 'abdomen': 'abdomen',
  'hip': 'hanche', 'leg': 'jambe', 'foot': 'pied', 'arm': 'bras',
  'hand': 'main', 'finger': 'doigt', 'toe': 'orteil',
  'joint': 'articulation', 'muscle': 'muscle', 'bone': 'os', 'skin': 'peau',
  'blood': 'sang', 'urine': 'urine', 'stool': 'selles', 'sweat': 'sueur',
  'region': 'région', 'side': 'côté', 'upper': 'supérieur', 'lower': 'inférieur',
  'distension': 'distension', 'constriction': 'constriction', 'colic': 'colique',
  'fullness': 'plénitude', 'heaviness': 'lourdeur', 'hernia': 'hernie',
  'palpitation': 'palpitation', 'paralysis': 'paralysie', 'pulsation': 'pulsation',
  'sensitive': 'sensible', 'tumor': 'tumeur', 'wart': 'verrue',
};

function translatePath(path: string): string {
  let result = path;
  for (const [en, fr] of Object.entries(TRANSLATIONS)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, fr);
  }
  return result;
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

async function main() {
  const dataDir = path.join(__dirname, '../../data/oorep');

  console.log('Loading data...');
  const remedies: Remedy[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'remedies.json'), 'utf-8'));
  const rubrics: Rubric[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'rubrics.json'), 'utf-8'));
  const associations: RubricRemedy[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'associations.json'), 'utf-8'));

  console.log(`Loaded: ${remedies.length} remedies, ${rubrics.length} rubrics, ${associations.length} associations`);

  console.log('\nConnecting to Supabase PostgreSQL...');
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();
    console.log('Connected!\n');

    // Step 1: Clear existing OOREP data (keep original mock data)
    console.log('Step 1: Clearing previous OOREP import...');
    await client.query(`DELETE FROM symptomes_remedes WHERE symptome_id::text LIKE '________-1111-%'`);
    await client.query(`DELETE FROM symptomes WHERE id::text LIKE '________-1111-%'`);
    await client.query(`DELETE FROM remedes WHERE id::text LIKE '________-0000-%'`);
    console.log('Done.\n');

    // Step 2: Insert remedies
    console.log('Step 2: Inserting remedies...');
    let count = 0;
    for (const r of remedies) {
      const id = `${r.id.toString().padStart(8, '0')}-0000-4000-8000-000000000000`;
      const nom = escapeSQL(r.abbrev);
      const nomComplet = escapeSQL(r.name);

      try {
        await client.query(`
          INSERT INTO remedes (id, nom, nom_complet, dilutions, forme_galenique)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (nom) DO NOTHING
        `, [id, nom, nomComplet, ['5CH', '7CH', '9CH', '15CH', '30CH'], ['granules']]);
        count++;
      } catch (e) {
        // Skip duplicates
      }

      if (count % 500 === 0) process.stdout.write(`\r  ${count}/${remedies.length}`);
    }
    console.log(`\r  Inserted ${count} remedies\n`);

    // Step 3: Insert rubrics (symptoms)
    console.log('Step 3: Inserting symptoms/rubrics...');
    count = 0;
    const validRubricIds = new Set<number>();

    for (const r of rubrics) {
      const id = `${r.id.toString().padStart(8, '0')}-1111-4000-8000-000000000000`;
      const translatedPath = translatePath(r.fullpathFr);
      const nom = escapeSQL(translatedPath);
      const categorie = escapeSQL(r.chapterFr);
      const motsCles = r.fullpath.toLowerCase().split(', ').slice(0, 5);

      try {
        await client.query(`
          INSERT INTO symptomes (id, nom, categorie, mots_cles)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (nom) DO NOTHING
        `, [id, nom, categorie, motsCles]);
        validRubricIds.add(r.id);
        count++;
      } catch (e) {
        // Skip duplicates
      }

      if (count % 1000 === 0) process.stdout.write(`\r  ${count}/${rubrics.length}`);
    }
    console.log(`\r  Inserted ${count} symptoms\n`);

    // Step 4: Insert associations (limit to 100k for performance)
    console.log('Step 4: Inserting remedy-symptom associations...');
    count = 0;
    const limitedAssocs = associations.slice(0, 100000);

    // Get valid remedy IDs
    const remedyIdSet = new Set(remedies.map(r => r.id));

    for (const a of limitedAssocs) {
      if (!validRubricIds.has(a.rubricId) || !remedyIdSet.has(a.remedyId)) continue;

      const symptomeId = `${a.rubricId.toString().padStart(8, '0')}-1111-4000-8000-000000000000`;
      const remedeId = `${a.remedyId.toString().padStart(8, '0')}-0000-4000-8000-000000000000`;
      const grade = Math.min(a.weight, 3);

      try {
        await client.query(`
          INSERT INTO symptomes_remedes (symptome_id, remede_id, profils, grade, dilution_recommandee, posologie_adulte)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [symptomeId, remedeId, ['adulte'], grade, '9CH', '5 granules 3 fois par jour']);
        count++;
      } catch (e) {
        // Skip errors
      }

      if (count % 5000 === 0) process.stdout.write(`\r  ${count}/${limitedAssocs.length}`);
    }
    console.log(`\r  Inserted ${count} associations\n`);

    console.log('=== Import Complete ===');
    console.log(`Remedies: ${remedies.length}`);
    console.log(`Symptoms: ${rubrics.length}`);
    console.log(`Associations: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

main().catch(console.error);
