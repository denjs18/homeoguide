/**
 * Import des données OOREP dans Supabase via l'API REST
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Set these environment variables before running:
// SUPABASE_URL - Your Supabase project URL
// SUPABASE_SERVICE_KEY - Your Supabase service role key
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

async function main() {
  const dataDir = path.join(__dirname, '../../data/oorep');

  console.log('Loading data...');
  const remedies: Remedy[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'remedies.json'), 'utf-8'));
  const rubrics: Rubric[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'rubrics.json'), 'utf-8'));
  const associations: RubricRemedy[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'associations.json'), 'utf-8'));

  console.log(`Loaded: ${remedies.length} remedies, ${rubrics.length} rubrics, ${associations.length} associations`);

  // Step 1: Clear existing OOREP data
  console.log('\nStep 1: Clearing previous OOREP data...');

  // Delete associations first (foreign key constraint)
  const { error: delAssocError } = await supabase
    .from('symptomes_remedes')
    .delete()
    .like('symptome_id', '________-1111-%');

  if (delAssocError) console.log('Note: Could not delete associations:', delAssocError.message);

  // Delete symptoms
  const { error: delSympError } = await supabase
    .from('symptomes')
    .delete()
    .like('id', '________-1111-%');

  if (delSympError) console.log('Note: Could not delete symptoms:', delSympError.message);

  // Delete remedies
  const { error: delRemError } = await supabase
    .from('remedes')
    .delete()
    .like('id', '________-0000-%');

  if (delRemError) console.log('Note: Could not delete remedies:', delRemError.message);

  console.log('Done clearing.\n');

  // Step 2: Insert remedies in batches
  console.log('Step 2: Inserting remedies...');
  const remedyData = remedies.map(r => ({
    id: `${r.id.toString().padStart(8, '0')}-0000-4000-8000-000000000000`,
    nom: r.abbrev,
    nom_complet: r.name,
    dilutions: ['5CH', '7CH', '9CH', '15CH', '30CH'],
    forme_galenique: ['granules']
  }));

  // Insert in batches of 500
  let insertedRemedies = 0;
  for (let i = 0; i < remedyData.length; i += 500) {
    const batch = remedyData.slice(i, i + 500);
    const { error } = await supabase.from('remedes').upsert(batch, { onConflict: 'nom' });
    if (error) {
      console.log(`Batch ${i}-${i+500} error:`, error.message);
    } else {
      insertedRemedies += batch.length;
    }
    process.stdout.write(`\r  ${Math.min(i + 500, remedyData.length)}/${remedyData.length}`);
  }
  console.log(`\n  Inserted ${insertedRemedies} remedies\n`);

  // Step 3: Insert symptoms/rubrics in batches
  console.log('Step 3: Inserting symptoms...');
  const symptomData = rubrics.map(r => {
    const translatedPath = translatePath(r.fullpathFr);
    return {
      id: `${r.id.toString().padStart(8, '0')}-1111-4000-8000-000000000000`,
      nom: translatedPath,
      categorie: r.chapterFr,
      mots_cles: r.fullpath.toLowerCase().split(', ').slice(0, 5)
    };
  });

  let insertedSymptoms = 0;
  const validRubricIds = new Set<number>();

  for (let i = 0; i < symptomData.length; i += 500) {
    const batch = symptomData.slice(i, i + 500);
    const { error } = await supabase.from('symptomes').upsert(batch, { onConflict: 'nom' });
    if (error) {
      console.log(`Batch ${i}-${i+500} error:`, error.message);
    } else {
      insertedSymptoms += batch.length;
      // Track valid IDs
      for (let j = 0; j < batch.length; j++) {
        validRubricIds.add(rubrics[i + j].id);
      }
    }
    process.stdout.write(`\r  ${Math.min(i + 500, symptomData.length)}/${symptomData.length}`);
  }
  console.log(`\n  Inserted ${insertedSymptoms} symptoms\n`);

  // Step 4: Insert associations (limit to 50k for API performance)
  console.log('Step 4: Inserting associations (limited to 50,000)...');
  const remedyIdSet = new Set(remedies.map(r => r.id));

  // Filter valid associations
  const validAssociations = associations.filter(a =>
    validRubricIds.has(a.rubricId) && remedyIdSet.has(a.remedyId)
  ).slice(0, 50000);

  const assocData = validAssociations.map(a => ({
    symptome_id: `${a.rubricId.toString().padStart(8, '0')}-1111-4000-8000-000000000000`,
    remede_id: `${a.remedyId.toString().padStart(8, '0')}-0000-4000-8000-000000000000`,
    profils: ['adulte'],
    grade: Math.min(a.weight, 3),
    dilution_recommandee: '9CH',
    posologie_adulte: '5 granules 3 fois par jour'
  }));

  let insertedAssocs = 0;
  for (let i = 0; i < assocData.length; i += 500) {
    const batch = assocData.slice(i, i + 500);
    const { error } = await supabase.from('symptomes_remedes').upsert(batch, {
      onConflict: 'symptome_id,remede_id',
      ignoreDuplicates: true
    });
    if (error) {
      // Try one by one for this batch
      for (const item of batch) {
        const { error: singleError } = await supabase.from('symptomes_remedes').upsert([item], {
          onConflict: 'symptome_id,remede_id',
          ignoreDuplicates: true
        });
        if (!singleError) insertedAssocs++;
      }
    } else {
      insertedAssocs += batch.length;
    }
    process.stdout.write(`\r  ${Math.min(i + 500, assocData.length)}/${assocData.length}`);
  }
  console.log(`\n  Inserted ${insertedAssocs} associations\n`);

  console.log('=== Import Complete ===');
  console.log(`Remedies: ${insertedRemedies}`);
  console.log(`Symptoms: ${insertedSymptoms}`);
  console.log(`Associations: ${insertedAssocs}`);
}

main().catch(console.error);
