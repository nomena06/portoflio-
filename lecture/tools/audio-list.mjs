// Liste tous les enregistrements audio attendus (pour faire enregistrer les voix).
// Usage : node tools/audio-list.mjs > audio-a-enregistrer.csv
// Un fichier présent dans app/audio/ doit être déclaré dans app/audio/manifest.json : { "audio/words/papa.mp3": true }
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'data');
console.log('id;fichier;texte à dire');
for (const n of ['letters', 'syllables', 'words', 'outils', 'sentences', 'texts']) {
  for (const it of JSON.parse(readFileSync(join(dir, n + '.json'), 'utf8'))) console.log([it.id, it.audio, String(it.say).replace(/;/g, ',')].join(';'));
}
