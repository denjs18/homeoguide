/**
 * Script d'extraction et traduction des données OOREP
 * Extrait les remèdes et rubriques du dump SQL OOREP
 * Traduit en français les termes principaux
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Mapping de traduction anglais -> français pour les chapitres/catégories
const CHAPTER_TRANSLATIONS: Record<string, string> = {
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
};

// Mapping de traduction pour les termes courants dans les rubriques
const TERM_TRANSLATIONS: Record<string, string> = {
  'pain': 'douleur',
  'aching': 'endolori',
  'burning': 'brûlant',
  'cutting': 'coupant',
  'pressing': 'pressant',
  'stitching': 'lancinant',
  'tearing': 'déchirant',
  'throbbing': 'pulsatif',
  'morning': 'matin',
  'afternoon': 'après-midi',
  'evening': 'soir',
  'night': 'nuit',
  'midnight': 'minuit',
  'before': 'avant',
  'after': 'après',
  'during': 'pendant',
  'amel.': 'amélioré par',
  'agg.': 'aggravé par',
  'worse': 'aggravé',
  'better': 'amélioré',
  'eating': 'manger',
  'drinking': 'boire',
  'walking': 'marcher',
  'sitting': 'assis',
  'lying': 'couché',
  'standing': 'debout',
  'motion': 'mouvement',
  'rest': 'repos',
  'cold': 'froid',
  'heat': 'chaleur',
  'warm': 'chaud',
  'open air': 'air frais',
  'warmth': 'chaleur',
  'pressure': 'pression',
  'touch': 'toucher',
  'extending': 'irradiant vers',
  'left': 'gauche',
  'right': 'droit',
  'both': 'bilatéral',
  'acute': 'aigu',
  'chronic': 'chronique',
  'sudden': 'soudain',
  'gradual': 'progressif',
  'constant': 'constant',
  'intermittent': 'intermittent',
  'periodic': 'périodique',
  'violent': 'violent',
  'severe': 'sévère',
  'mild': 'léger',
  'dull': 'sourd',
  'sharp': 'vif',
  'swelling': 'gonflement',
  'inflammation': 'inflammation',
  'redness': 'rougeur',
  'itching': 'démangeaison',
  'numbness': 'engourdissement',
  'weakness': 'faiblesse',
  'stiffness': 'raideur',
  'cramping': 'crampe',
  'spasm': 'spasme',
  'trembling': 'tremblement',
  'coldness': 'froideur',
  'heat': 'chaleur',
  'sensation': 'sensation',
  'as if': 'comme si',
  'anxiety': 'anxiété',
  'fear': 'peur',
  'sadness': 'tristesse',
  'anger': 'colère',
  'irritability': 'irritabilité',
  'restlessness': 'agitation',
  'confusion': 'confusion',
  'memory': 'mémoire',
  'concentration': 'concentration',
  'sleep': 'sommeil',
  'dreams': 'rêves',
  'appetite': 'appétit',
  'thirst': 'soif',
  'nausea': 'nausée',
  'vomiting': 'vomissement',
  'diarrhea': 'diarrhée',
  'constipation': 'constipation',
  'cough': 'toux',
  'dry': 'sec',
  'wet': 'humide',
  'loose': 'grasse',
  'headache': 'mal de tête',
  'fever': 'fièvre',
  'chill': 'frisson',
  'perspiration': 'transpiration',
  'discharge': 'écoulement',
  'bleeding': 'saignement',
  'ulcer': 'ulcère',
  'eruption': 'éruption',
  'abscess': 'abcès',
  'tumor': 'tumeur',
};

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

function translatePath(englishPath: string): string {
  let frenchPath = englishPath;

  // Translate chapter (first part)
  for (const [en, fr] of Object.entries(CHAPTER_TRANSLATIONS)) {
    const regex = new RegExp(`^${en}\\b`, 'i');
    frenchPath = frenchPath.replace(regex, fr);
  }

  // Translate common terms
  for (const [en, fr] of Object.entries(TERM_TRANSLATIONS)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    frenchPath = frenchPath.replace(regex, fr);
  }

  return frenchPath;
}

function getChapterFromPath(fullpath: string): string {
  const parts = fullpath.split(', ');
  return parts[0] || 'General';
}

async function extractRemedies(sqlFilePath: string): Promise<Remedy[]> {
  const remedies: Remedy[] = [];
  const fileStream = fs.createReadStream(sqlFilePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inRemedySection = false;

  for await (const line of rl) {
    if (line.startsWith('COPY public.remedy ')) {
      inRemedySection = true;
      continue;
    }

    if (inRemedySection) {
      if (line === '\\.') {
        break;
      }

      const parts = line.split('\t');
      if (parts.length >= 3) {
        remedies.push({
          id: parseInt(parts[0]),
          abbrev: parts[1],
          name: parts[2],
          nameAlt: parts[3] === '\\N' ? null : parts[3],
        });
      }
    }
  }

  console.log(`Extracted ${remedies.length} remedies`);
  return remedies;
}

async function extractRubrics(sqlFilePath: string): Promise<Rubric[]> {
  const rubrics: Rubric[] = [];
  const fileStream = fs.createReadStream(sqlFilePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inRubricSection = false;
  let count = 0;

  for await (const line of rl) {
    if (line.startsWith('COPY public.rubric ')) {
      inRubricSection = true;
      continue;
    }

    if (inRubricSection) {
      if (line === '\\.') {
        break;
      }

      // Only process 'publicum' repertory (English)
      if (!line.startsWith('publicum\t')) {
        continue;
      }

      const parts = line.split('\t');
      // abbrev, id, mother, ismother, chapterid, fullpath, path, textt
      if (parts.length >= 6 && parts[5] && parts[5] !== '\\N') {
        const fullpath = parts[5];
        const chapter = getChapterFromPath(fullpath);

        // Only include main rubrics (depth <= 3) for manageable size
        const depth = fullpath.split(', ').length;
        if (depth <= 3) {
          rubrics.push({
            id: parseInt(parts[1]),
            abbrev: parts[0],
            fullpath: fullpath,
            fullpathFr: translatePath(fullpath),
            chapter: chapter,
            chapterFr: CHAPTER_TRANSLATIONS[chapter] || chapter,
            isMain: depth === 1,
          });
          count++;
        }
      }
    }

    // Progress indicator
    if (count % 10000 === 0 && count > 0) {
      process.stdout.write(`\rProcessed ${count} rubrics...`);
    }
  }

  console.log(`\nExtracted ${rubrics.length} rubrics (depth <= 3)`);
  return rubrics;
}

async function extractRubricRemedies(sqlFilePath: string, validRubricIds: Set<number>): Promise<RubricRemedy[]> {
  const associations: RubricRemedy[] = [];
  const fileStream = fs.createReadStream(sqlFilePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inAssocSection = false;
  let count = 0;

  for await (const line of rl) {
    if (line.startsWith('COPY public.rubricremedy ')) {
      inAssocSection = true;
      continue;
    }

    if (inAssocSection) {
      if (line === '\\.') {
        break;
      }

      // Only process 'publicum' repertory
      if (!line.startsWith('publicum\t')) {
        continue;
      }

      const parts = line.split('\t');
      // abbrev, rubricid, remedyid, weight, chapterid
      if (parts.length >= 4) {
        const rubricId = parseInt(parts[1]);

        // Only include if rubric is in our filtered set
        if (validRubricIds.has(rubricId)) {
          associations.push({
            rubricId: rubricId,
            remedyId: parseInt(parts[2]),
            weight: parseInt(parts[3]) || 1,
          });
          count++;
        }
      }
    }

    if (count % 50000 === 0 && count > 0) {
      process.stdout.write(`\rProcessed ${count} associations...`);
    }
  }

  console.log(`\nExtracted ${associations.length} remedy-rubric associations`);
  return associations;
}

async function main() {
  const oorepSqlPath = path.join(__dirname, '../../oorep-repo/oorep.sql');
  const outputDir = path.join(__dirname, '../../data/oorep');

  if (!fs.existsSync(oorepSqlPath)) {
    console.error('OOREP SQL file not found:', oorepSqlPath);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log('=== Extracting OOREP Data ===\n');

  // Extract remedies
  console.log('1. Extracting remedies...');
  const remedies = await extractRemedies(oorepSqlPath);
  fs.writeFileSync(
    path.join(outputDir, 'remedies.json'),
    JSON.stringify(remedies, null, 2)
  );

  // Extract rubrics
  console.log('\n2. Extracting rubrics (this may take a while)...');
  const rubrics = await extractRubrics(oorepSqlPath);
  fs.writeFileSync(
    path.join(outputDir, 'rubrics.json'),
    JSON.stringify(rubrics, null, 2)
  );

  // Extract associations
  console.log('\n3. Extracting remedy-rubric associations...');
  const validRubricIds = new Set(rubrics.map(r => r.id));
  const associations = await extractRubricRemedies(oorepSqlPath, validRubricIds);
  fs.writeFileSync(
    path.join(outputDir, 'associations.json'),
    JSON.stringify(associations, null, 2)
  );

  // Summary
  console.log('\n=== Extraction Complete ===');
  console.log(`Remedies: ${remedies.length}`);
  console.log(`Rubrics: ${rubrics.length}`);
  console.log(`Associations: ${associations.length}`);
  console.log(`\nOutput files saved to: ${outputDir}`);
}

main().catch(console.error);
