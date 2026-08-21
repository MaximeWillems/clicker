/* Écrit le prompt d'une lignée, prêt à coller dans un générateur d'images.

     node tools/prompt.js poisson
     node tools/prompt.js --liste

   Les noms des formes sont lus dans game.js, donc ils ne peuvent pas dériver. Ce qui est
   décrit ici, ce sont les PROPORTIONS de chaque stade — jamais les ornements. C'est la
   leçon la plus chère de la lignée du crapaud : cinq bêtes qui ne diffèrent que par leur
   décor se ressemblent toutes, quelle que soit la qualité du dessin. */
'use strict';
const fs = require('fs');

// ── les noms viennent du jeu, jamais recopiés à la main ───────────────────
const src = fs.readFileSync('game.js', 'utf8');
const debut = src.indexOf('const LINES = [');
const bloc = src.slice(debut, src.indexOf('\n];', debut) + 3);
const LINES = eval('(' + bloc.replace('const LINES =', '').replace(/;\s*$/, '') + ')');

const ENTETE = `Sprite sheet of 5 evolution stages of the same creature, left to right on one row,
evenly spaced.

TRUE 32x32 pixel art, upscaled with nearest-neighbor only. Readable at 24 pixels tall.

CUTE MASCOT STYLE — this is the most important instruction:
- baby proportions: the head is at least half the whole creature
- huge round eyes, set low and wide apart, each about one third of the face width,
  with one single white highlight dot
- tiny simple smiling mouth, never a wide slit, never fangs
- small pink blush oval on each cheek
- everything rounded and soft, no sharp angles, no spikes, no horns, no claws
- chubby bean-shaped or egg-shaped bodies, tiny stubby feet
- friendly, sleepy, harmless expression on every stage

STRICT: maximum 6 flat colors per creature including the outline.
No texture, no dithering, no noise, no gradients, no glow. Simple geometric shapes.

Front-facing, centered, full body. Transparent background. No shadow, no ground line,
no background, no text, no frame.`;

/* Cinq descriptions par lignée. On décrit la MASSE et la POSTURE, pas les accessoires.
   Le dernier stade garde toujours un petit visage endormi : c'est ce qui rend une bête
   énorme attachante plutôt qu'inquiétante. */
const STADES = {
  crapaud: [
    'tiny round tadpole, almost entirely head, huge sparkling eyes, one small wiggly tail',
    'small chubby toad sitting, big round eyes, tiny smile, two stubby feet',
    'very round fat toad, soft pale belly, happy sleepy eyes, tiny feet under a huge body',
    'big round mossy toad, still chubby, soft rounded bumps on the back instead of horns, drowsy eyes',
    'enormous gentle mountain toad, a soft rounded green hill on its back with one small white snow cap, tiny sleepy face at the bottom'],

  poisson: [
    'tiny round fish fry, almost all head, huge eyes, one small transparent tail fin',
    'small plump carp, round body, tiny rounded fins, cheerful eyes',
    'very round old carp, two soft drooping whiskers, sleepy half-closed eyes, wide heavy body',
    'long sea serpent, soft body coiled once into a loose loop, small round head on top',
    'enormous leviathan, thick body coiled filling the frame, tiny sleepy face in front'],

  lezard: [
    'tiny lizard hatchling, huge head, stubby curled tail, four dot legs',
    'small round lizard, four little legs, long tail curled around the body',
    'chunky monitor lizard, thick heavy body, broad tail, calm eyes',
    'small wyvern, no front legs, two big soft rounded wings folded like a cape',
    'enormous earth dragon, round heavy body, small folded wings, two tiny rounded horns, sleepy'],

  oiseau: [
    'tiny fluffy chick, huge round head, no visible wings, two dot feet',
    'small round songbird, tiny beak, plump body, bright eyes',
    'plump little raptor, small hooked beak, wings folded close, alert round eyes',
    'giant roc, enormous round feathered body, huge folded wings, small head on top',
    'phoenix, round bird with soft flame-shaped tail feathers, warm orange and gold, gentle eyes'],

  crocodile: [
    'tiny crocodile hatchling, huge head, short rounded snout, stubby tail',
    'small chubby crocodile, four stubby legs, rounded snout, friendly eyes',
    'thick ancient crocodile, heavy armored back, broad rounded snout, half-closed eyes',
    'draco-saurian, thick crocodile body with two small rounded wings on its back',
    'enormous thunder dragon, massive round body, one small round storm cloud floating above, sleepy face'],

  salamandre: [
    'tiny glowing larva, round and legless, two huge eyes, faint warm glow',
    'small salamander, four tiny legs, round body, soft orange spots',
    'ember salamander, plump body with warm glowing patches on the back',
    'ash salamander, dark round body with soft glowing cracks, drowsy eyes',
    'ifrit, round fiery creature with a small soft flame crown, sleepy friendly face'],

  serpent: [
    'tiny round worm, simple oval body, two huge eyes',
    'small grass snake coiled once, round head, tiny smile',
    'feathered serpent, soft small feathers along a round coiled body',
    'amphithere, feathered serpent with two rounded soft wings',
    'quetzalcoatl, large coiled feathered serpent with a small soft feather crown, sleepy face'],

  kraken: [
    'tiny round plankton, one small transparent bubble body, two huge eyes',
    'small round octopus, short stubby tentacles, cheerful eyes',
    'abyssal octopus, round body with soft glowing spots, calm eyes',
    'deep trench octopus, heavy round body, long thick curling tentacles',
    'kraken, enormous round body with thick tentacles curling around it, tiny sleepy face'],

  golem: [
    'tiny floating crystal shard with two huge eyes, nothing else',
    'small pile of animated round pebbles with eyes peeking out',
    'rounded stone golem, blocky short arms, small round head',
    'large stone colossus, mossy rounded shoulders, heavy arms',
    'granite titan, mountain-shaped stone body, tiny sleepy face near the ground'],

  sphinx: [
    'tiny hairless kitten, huge ears and eyes, thin curled tail',
    'sphinx cat, slender round body, very big ears, curious eyes',
    'royal sphinx, small lion body with a soft striped headdress',
    'tomb guardian, stone lion sitting upright, heavy paws, calm face',
    'great sphinx, enormous stone lion lying down, tiny sleepy face'],

  cheval: [
    'tiny foal, huge head, wobbly thin legs, small tuft of mane',
    'small round pony, short legs, soft mane, friendly eyes',
    'sturdy warhorse, thick round body, braided mane',
    'unicorn, round white horse with one small spiral horn and a soft flowing mane',
    'pegasus, round horse with two big soft feathered wings, gentle sleepy eyes'],

  chimere: [
    'tiny two-headed runt, round fuzzy body, four huge eyes',
    'small chimera cub, round lion body with a tiny goat head on its back',
    'chimera, plump lion body, small goat head on the back, round snake tail',
    'royal chimera, larger and rounder, small golden crown, three calm faces',
    'primordial chimera, enormous fluffy body with three tiny sleepy heads'],

  behemoth: [
    'tiny bone fragment with two glowing round eyes, nothing else',
    'small round dinosaur, stubby legs, short tail, curious eyes',
    'behemoth, heavy round body, thick short legs, small head',
    'ancient behemoth, rounded armor plates along the back, drowsy eyes',
    'primordial behemoth, colossal round body filling the frame, tiny sleepy head at the bottom'],

  ouroboros: [
    'tiny shed ring of skin with two huge eyes peeking through',
    'small grey snake coiled once, round head, shy eyes',
    'world serpent, long soft body coiled into a wide loop',
    'ouroboros, serpent gently holding its own tail, forming a soft closed circle',
    'eternal ouroboros, enormous circle of coiled body, tiny sleepy face at the bottom'],

  insecte: [
    'tiny round grub, no legs, two huge eyes, soft segmented body',
    'small round beetle, shiny domed shell, six dot legs',
    'stag beetle, round shell with two small rounded mandibles',
    'titan beetle, enormous domed shell, short thick legs, small head',
    'khepri, round beetle carrying a small warm sun disc on its back, sleepy face'],

  rongeur: [
    'tiny mouse pup, huge head and ears, thin tail, eyes barely open',
    'small round rat, long thin tail, whiskers, bright eyes',
    'plump coypu, very round body, small round ears, calm face',
    'colossal rodent, enormous round body, tiny ears, short legs',
    'ratatosk, giant squirrel with an enormous fluffy tail curled around it, sleepy face'],

  chiroptere: [
    'tiny bat pup, huge ears, wings wrapped around itself like a blanket',
    'small round bat, wings folded, big ears, tiny fangs but friendly',
    'fruit bat, plump body, larger rounded wings folded',
    'night drinker, dark round bat with a small cape-like wing fold, drowsy eyes',
    'camazotz, enormous bat with wings spread wide, tiny sleepy face in the middle'],

  loup: [
    'tiny wolf pup, huge head and paws, floppy ears, big eyes',
    'small round wolf, thick fluffy fur, bushy tail, friendly eyes',
    'steppe wolf, larger and shaggier, thick neck fur, calm eyes',
    'werewolf standing upright, round belly, soft fur, harmless expression',
    'fenrir, enormous fluffy wolf lying down, tiny sleepy face, huge paws in front'],

  meduse: [
    'tiny round jellyfish, one small translucent bell, two huge eyes',
    'small jellyfish, rounded bell, four short soft tentacles',
    'abyssal jellyfish, glowing rounded bell, longer soft tentacles',
    'colossal cnidarian, huge smooth bell, many long soft tentacles',
    'world siphonophore, enormous glowing bell filling the frame, tiny sleepy face beneath'],
};

const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cle = process.argv[2];

if (!cle || cle === '--liste') {
  console.log('\nLignées disponibles :\n');
  for (const l of LINES) {
    const manque = STADES[l.key] ? '' : '   (pas encore décrite)';
    console.log('  ' + l.key.padEnd(12) + l.name.padEnd(16) + l.rarity + manque);
  }
  console.log('\n  node tools/prompt.js <lignée>\n');
  process.exit(0);
}

const ligne = LINES.find(l => l.key === cle);
if (!ligne || !STADES[cle]) {
  console.error('Lignée « ' + cle + ' » inconnue. node tools/prompt.js --liste');
  process.exit(1);
}

const stades = STADES[cle];
const suffixes = ligne.forms.map(f => sansAccents(f[0].split(',')[0]));

console.log('\n' + '='.repeat(78));
console.log('  ' + ligne.name + ' — ' + ligne.rarity);
console.log('='.repeat(78) + '\n');
console.log(ENTETE + '\n\nThe 5 stages, in order:');
ligne.forms.forEach((f, i) => console.log((i + 1) + '. ' + stades[i]));

console.log('\n' + '-'.repeat(78));
console.log('  Une fois la planche enregistrée dans art/source-' + cle + '.png :');
console.log('-'.repeat(78) + '\n');
console.log('python tools/decouper.py art/source-' + cle + '.png ' + cle + ' ' + suffixes.join(',') + '\n');
console.log('Puis ajouter dans la table ART, en haut de game.js :\n');
console.log('  ' + cle + ': {');
ligne.forms.forEach((f, i) =>
  console.log('    ' + (i + 1) + ": '" + cle + '-' + (i + 1) + '-' + suffixes[i] + ".png',   // " + f[0]));
console.log('  },\n');
