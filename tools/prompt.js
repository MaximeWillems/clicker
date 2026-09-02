/* Écrit le prompt d'une lignée, prêt à coller dans un générateur d'images.

     node tools/prompt.js poisson
     node tools/prompt.js --liste

   Les noms des formes sont lus dans game.js, donc ils ne peuvent pas dériver. Ce qui est
   décrit ici, ce sont les PROPORTIONS de chaque stade — jamais les ornements. C'est la
   leçon la plus chère de la lignée du crapaud : cinq bêtes qui ne diffèrent que par leur
   décor se ressemblent toutes, quelle que soit la qualité du dessin.

   Deuxième leçon, celle de la chauve-souris : les cinq stades sont UNE bête qui grandit.
   Ce qu'un stade gagne, les suivants le gardent et l'agrandissent — le pendentif apparu au
   stade 4 avait disparu au stade 5, par oubli et non par choix. La règle se casse, mais
   alors volontairement, et en l'écrivant dans la description du stade. */
'use strict';
const fs = require('fs');

// ── les noms viennent du jeu, jamais recopiés à la main ───────────────────
const src = fs.readFileSync('game.js', 'utf8');
const debut = src.indexOf('const LINES = [');
const bloc = src.slice(debut, src.indexOf('\n];', debut) + 3);
const LINES = eval('(' + bloc.replace('const LINES =', '').replace(/;\s*$/, '') + ')');

/* ── Ce qui ne change jamais ───────────────────────────────────────────────
   La technique est commune aux deux chartes : c'est elle qui fait que 27 lignées dessinées à
   des mois d'écart appartiennent au même jeu. Ce qui change d'une charte à l'autre est le
   REGISTRE — mascotte ou idole — jamais la grille, ni le nombre de couleurs. */
const CADRE = `Sprite sheet of 5 evolution stages of the same creature, left to right on one row,
evenly spaced.

TRUE 32x32 pixel art, upscaled with nearest-neighbor only. Readable at 24 pixels tall.`;

const TECHNIQUE = `STRICT: maximum 6 flat colors per creature including the outline.
No texture, no dithering, no noise, no gradients. Simple geometric shapes.

Front-facing, centered, full body. Transparent background. No shadow, no ground line,
no background, no text, no frame.`;

/* ── Charte 1 : la mascotte ────────────────────────────────────────────────
   Communes, rares, épiques. Le principe Magicarpe : on part minable, on finit glorieux, et
   c'est l'écart qui rend l'évolution mémorable. */
const ENTETE = `${CADRE}

CUTE MASCOT STYLE — this is the most important instruction:
- baby proportions: the head is at least half the whole creature
- huge round eyes, set low and wide apart, each about one third of the face width,
  with one single white highlight dot
- tiny simple smiling mouth, never a wide slit, never fangs
- small pink blush oval on each cheek
- everything rounded and soft, no sharp angles, no spikes, no horns, no talons
- chubby bean-shaped or egg-shaped bodies, tiny stubby feet
- friendly, sleepy, harmless expression on every stage

CONTINUITY — the five stages are ONE animal growing up, not five animals:
- same palette, same outline color, same eye shape from stage 1 to stage 5
- every feature a stage gains, all LATER stages keep and grow: ears stay big,
  a marking stays in the same place, a shell keeps the same spiral
- later stages only ADD. Nothing is ever dropped from one stage to the next
- stage 5 must still contain stage 1 — one should be able to point at what it kept

${TECHNIQUE.replace('No gradients.', 'No gradients, no glow.')}`;

/* ── Charte 2 : l'idole ────────────────────────────────────────────────────
   Mythiques et merveilleuses. Elles naissent accomplies, et l'évolution ne les transforme
   pas : elle leur ajoute des attributs.

   La première version se contentait d'ajouter « c'est un dieu » PAR-DESSUS la charte
   mascotte. Ça ne marche pas : les joues roses, les yeux ronds énormes et le petit sourire
   gagnent toujours, et on obtenait un dieu adorable — ce qui n'est pas un dieu. Le registre
   se remplace en entier.

   Ce qui reste identique, et c'est tout ce qui compte pour la cohérence : la grille de 32,
   les six couleurs à plat, le contour, l'absence de dégradé. Un mythique doit être RECONNU
   comme appartenant au même jeu qu'un crapaud, sans lui ressembler. */
const ENTETE_REVELATION = `${CADRE}

FLAT CARTOON, NEVER AN ILLUSTRATION — read this before anything else:
this is the SAME drawing technique as every other sheet in this game. Only the
REGISTER changes — solemn instead of cute. The technique does not change at all.
- flat blocks of color with one hard outline. Every color is ONE solid tone
- NO shading, NO soft light, NO airbrush, NO glossy highlight, NO reflection
- NO drawn scales, NO surface texture, NO engraved detail, NO fine linework
- hard pixel edges, no anti-aliasing, no blur
- never a painting, never concept art, never a realistic or photographic object

IDOL REGISTER — what the creature IS:
- ALREADY ACCOMPLISHED at stage 1: not a baby, not a hatchling. A small complete god
- adult proportions, calm and settled. The head is a normal head
- NO blush marks. NO wide smile. NO kawaii. This is NOT a mascot
- eyes are NARROW and half-lidded, almond or slit-shaped, calm and aware —
  never huge round eyes, at most one small highlight
- mouth closed and neutral, or simply doing what the creature does
- expression: composed, ancient, faintly imperious. Serene, never friendly, never sleepy
- shapes may be ANGULAR where it means something — a defined jaw, a crown, a fin —
  but they stay flat and FEW. Angular never means detailed. Never gore, never fangs
- the pose is ALIVE, never heraldic: the weight sits on one side, the body turns,
  the head is set off the centre line. Never a flat symmetrical emblem, never a logo
- ornament is INSIGNIA, not decoration: rings, bands, glyphs, banded marks — drawn
  as a FEW LARGE FLAT SHAPES, never fine engraving, never polka dots, never confetti
- palette: deep and rich, with ONE metallic accent used sparingly — gold, jade or bone.
  Never a bright candy palette

REVELATION — the five stages are ONE being waking up, not one growing up:
- what is already right at stage 1 is its IDENTITY: same species, same face, same
  attributes. NOT its pose
- the POSE CHANGES AT EVERY STAGE, and visibly: the body turns, coils, rises, leans.
  If stage 3 could be stage 1 scaled up, the sheet has failed — redraw it
- what the being GAINS is an attribute, a mark, a flat glow, sheer size
- same palette, same outline color, same eye shape throughout
- later stages only ADD. Nothing is ever dropped from one stage to the next
- stage 5 must be overwhelming in SCALE and COMPOSITION, never in menace:
  no snarl, no weapon, no threat. The awe comes from what surrounds it

${TECHNIQUE.replace('Front-facing, centered, full body.',
`Centered, full body, seen at a slight three-quarter angle — never flat-on.
Depth comes from parts of the body passing IN FRONT of and BEHIND other parts,
with a clean outline at every crossing.`)}
Light and glow are allowed ONLY as one extra FLAT pale shape with a clean edge —
never a blur, never a gradient, and it still counts toward the 6 colors.

Last instruction, and it overrides every word above: 6 flat colors, hard outline,
no shading, no texture. Between grandeur and flatness, choose FLATNESS.`;

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

  /* Le fil de l'escargot : la coquille en spirale et les deux tentacules oculaires, présents
     dès le premier stade et jamais perdus — c'est la coquille qui grossit, pas la bête. */
  escargot: [
    'tiny soft snail hatchling, almost all head, two short eye stalks with huge round eyes, one small pale translucent spiral shell',
    'small round garden snail, the same spiral shell now solid and banded, the same two eye stalks longer, soft cream foot',
    'plump achatina snail, the same banded shell now tall and heavy on its back, same two eye stalks, thick cream foot, calm eyes',
    'tower bearer snail, the same shell grown into a tall rounded tower with soft round moss patches, same two eye stalks, same cream foot, drowsy eyes',
    'ammon, enormous snail, the same spiral now a huge smooth dome marked with soft golden rings, same two eye stalks, tiny sleepy face low at the front'],

  /* Le fil du crabe : deux pinces arrondies dont la droite est la plus grosse, des yeux sur
     tiges, et une carapace bombée qui s'élargit de stade en stade. */
  crabe: [
    'tiny zoea larva, almost all head, two huge round stalked eyes, one tiny pair of rounded mitten pincers, small curled tail',
    'small round crab, the same two rounded mitten pincers now bigger with the right one larger than the left, same stalked eyes, smooth domed carapace, six dot legs',
    'plump brown tourteau crab, the same asymmetric rounded pincers now thick and heavy, same stalked eyes, wider domed carapace, calm face',
    'reef crab, the same thick asymmetric pincers held close to the body, same stalked eyes, the domed carapace now TALL and humped, crusted with small round coral bumps, drowsy eyes',
    'karkinos, enormous crab much WIDER than tall, the same asymmetric pincers now massive and raised high on each side, same stalked eyes, a low broad carapace covered in round coral bumps and a few small round star marks, tiny sleepy face in the middle'],

  /* LE FIL DE WUKONG : LE MASQUE D'OPÉRA, et l'armure qui n'arrive qu'au quatrième âge. Les
     quatre premiers stades sont ceux de la planche d'origine, recopiés tels quels — ils sont
     bons et on n'y retouche pas.

     LE CINQUIÈME A ÉTÉ REFAIT, et pour une raison qui se lit dans la charte elle-même : elle
     exige cinq masses sans collision, et l'ancien stade 5 était « vertical sur socle » quand
     le stade 2 est « vertical et étroit ». Deux fois la même silhouette à vingt-quatre
     pixels — le climax ressemblait à la deuxième forme. Le bâton planté, les deux plumes
     hautes et l'armure complète en faisaient de surcroît une grappe verticale illisible.

     Il prend donc la seule masse que personne n'occupe : LARGE. Le seul des cinq plus large
     que haut, bâton en travers et non planté, nuage étalé bien au-delà des épaules.

     Et le dessin porte sa CONTRAINTE D'ANIMATION : c'est le stade qu'on animera, avec un
     budget d'une quarantaine de cellules qui bougent. Tout ce qui doit bouger est donc aux
     BORDS — le nuage et la pointe des plumes — et le corps reste immobile au centre. Une pose
     dont le mouvement serait au milieu ne s'animerait pas dans ce budget. */
  wukong: [
    'a SMALL monkey, just out of the stone. He is crouched low and compact, and the broken stone egg is still around him — two or three large flat shards, clearly separate from his body. Bare, no armour, no staff, no cap. The pale opera mask is ALREADY there and already large: it is his identity from the first frame. Narrow eyes. Nothing behind him',
    'STANDING, and the mass changes completely: upright, weight on one leg, a plain cape or a fur wrap across one shoulder, a simple flat circlet. No armour yet, no staff. He is a king of animals, not of heaven. Nothing behind him',
    'AIRBORNE, and this is the ONLY stage with no support under him. He has just learned the cloud somersault: the body is on a clear DIAGONAL, legs folded up, one arm extended forward, the tail streaming out behind, and one small flat wisp of cloud under his feet — a wisp, not a base. Still no armour, still no staff, still the plain circlet. The mask stays calm: he is travelling, not straining',
    'UNDER THE MOUNTAIN, AND HE IS PUSHING. The silhouette inverts and this is the only stage where he is not upright. The mountain fills the TOP of the frame — one big flat mass with two or three plane changes, no texture, no drawn rocks. He occupies the LOWER HALF and he is unmistakably present: one shoulder and BOTH arms out from under the stone, the body visibly straining upward, the pale mask high in the frame and perfectly calm. He is trapped, never buried. This is where the ARMOUR first appears: one flat shoulder plate and the phoenix-feather cap show from beneath the mountain. One flat gold seal shape on the stone',
    'AT REST, STANDING, seen from the front, and it reads as the release of stage 4. He stands on ONE WIDE FLAT CLOUD drawn as a single simple shape — the cloud is the widest thing here and spreads well past his shoulders on both sides, making the whole stage wider than tall. Both arms are open and low, palms out. The staff is held DIAGONALLY across his body from hip to shoulder and it is SHORT: both ends stop well INSIDE his silhouette, it never spans the image and it is never planted upright. Armour and cap complete, the two plumes curving OUT sideways, not up. The body is still and centered; everything that could read as motion sits at the EDGES — the cloud and the plume tips. NOTHING behind him: no background, no glow, no halo, no light, no gradient — plain empty space, exactly like the other four stages',
  ],

  /* LE FIL DU KITSUNE : LE MASQUE ET LES QUEUES. Le piège de cette lignée est écrit dans son
     nom — cinq formes qui ne diffèrent que par le NOMBRE de queues se ressemblent toutes, et
     c'est exactement la faute du crapaud : cinq bêtes qui ne diffèrent que par leur décor.

     Le compte de queues est donc le signe SECONDAIRE. Ce qui sépare les cinq, c'est la masse :
     ramassée, triangle, diagonale, éventail, colonne. Aucune ne se répète, et la dernière est
     la seule qui MONTE — c'est ce qui en fait un climax et non une cinquième pose.

     Le fil continu, présent dès le premier âge : le museau fin, les oreilles hautes et
     pointues, et une marque pâle sur le front. Jamais un renard réaliste. */
  kitsune: [
    'a young kitsune LYING DOWN and curled, a low rounded mass, one single tail wrapped around the front paws. Narrow half-lidded eyes, a slender pointed muzzle, two tall pointed ears, one pale flame-shaped mark on the forehead. Already composed, never a cub',
    'the same kitsune now SITTING UPRIGHT, forming a clear TRIANGLE — wide at the haunches, narrowing to the head. THREE tails held close together behind it in a single tight bundle, never spread. Same muzzle, same tall ears, same forehead mark. One flat pale collar of fur at the chest',
    'the same kitsune RUNNING, the body stretched into a clear DIAGONAL across the frame, front legs reaching forward and hind legs pushed back. FIVE tails streaming behind in one flowing trail, all pointing the same way. Same muzzle and ears laid back by the speed. The only one with no ground contact',
    'the same kitsune SEATED FACING THE VIEWER, and SEVEN tails spread WIDE behind it like an open fan, evenly spaced in a half circle. This one is clearly WIDER THAN TALL — the widest of the five. The body itself is small and centered at the bottom of the fan, same muzzle, same ears, same mark',
    'the same kitsune STANDING on her hind legs and seen FROM THE FRONT, and the NINE tails now form ONE SINGLE CLOSED RING all around her — a flat halo of even thickness, like a mandorla. The nine tails are only suggested by NINE SHALLOW NOTCHES on the outer edge of that ring: never nine separate tails, never a bush, never a fan. Inside the ring the fox is LARGE and fills it — head, chest and forelegs, not a small figure lost in fur. One small plain torii gate at her feet, low and clearly IN FRONT of the ring. Same slender muzzle, same tall ears, the forehead mark now a small flat disc. The mass is a CIRCLE, and no other stage is round',
  ],

  /* Le fil de l'ouroboros : LA MORSURE. Il se mord la queue dès le premier âge et ne lâche
     jamais — la silhouette est un anneau FERMÉ du début à la fin, jamais une ligne, jamais une
     courbe ouverte. C'est ce qui le sépare du serpent-plume et du ver d'un seul coup d'œil,
     même en vignette de 32 pixels.

     Ce qui grandit n'est pas la bête, c'est CE QUE L'ANNEAU CONTIENT. Le centre est vide au
     premier âge, il s'éclaire au quatrième, il porte un monde au cinquième. Le grandiose vient
     de là, et non d'une créature devenue menaçante.

     La première planche a raté sur un mot : « concentrique ». Un cercle parfait n'a pas de
     pose, et des anneaux emboîtés lisent comme une rondelle — on obtenait cinq fois le même
     dessin à cinq tailles. La boucle reste FERMÉE, c'est le fil, mais elle est faite par un
     corps qui s'enroule et se croise, jamais par un cercle imprimé. Ce qui change d'un âge à
     l'autre, c'est la POSE de la boucle.

     La deuxième planche a raté sur le registre : la pose était bonne, mais le générateur a
     rendu une illustration peinte — écailles dessinées, reflets, une Terre photographique.
     Les mots de l'idole (« dieu », « ancien », « insigne », « or ») tirent tous vers la
     fantasy détaillée, et rien dans la charte ne tirait vers le plat. La charte mascotte s'en
     sortait parce que « cute » est lui-même corrélé au dessin plat. Il a fallu écrire l'ancre
     à la main, en tête de prompt : même technique que toutes les autres planches, seul le
     registre change.

     Enfin, cette lignée CASSE le registre serein de la charte, et c'est voulu : un dieu qui
     se dévore n'est pas serein. La morsure s'aggrave d'âge en âge — propre aux deux premiers,
     malsaine ensuite. Le dégoût passe par la FORME et rien d'autre : une mâchoire décrochée,
     et une bosse qui court le long du corps là où la queue avalée se trouve. Ni sang, ni
     plaie, ni bave — c'est plat, ça tient en six couleurs, et c'est lisible en vignette. La
     dérogation est écrite dans NOTES, donc elle ne déteint pas sur les autres mythiques. */
  ouroboros: [
    'a serpent ALREADY biting its own tail, forming one closed loop — but a LIVING one: a tilted oval seen at an angle, never a flat circle. The head is raised at the upper left and turned down onto the tail, the neck passing IN FRONT of the body at the crossing. Slender body, narrow half-lidded eyes, one banded mark along the back. A plain SNAKE head — smooth and rounded, no horns, no crest, never a dragon head',
    'the same bite and the same closed loop, now TWISTED: the body makes one clear S-bend before it closes, so the loop is pinched on one side and swings wide on the other. Thicker body carrying a few LARGE FLAT bands, never a scale texture, the same snake head and narrow eyes, a pale line along the inside edge',
    'the same bite, the body now long enough to loop TWICE — the second coil crossing the first diagonally like a figure of eight, one loop clearly in front and one behind. Never two nested circles. The same flat bands. HERE THE BITE TURNS WRONG: the jaw is stretched open wider than the neck and the tail is forced past it, with a first bulge swelling just behind the head. The eyes narrow and strain',
    'the same bite, the body coiling three times in a wide spiral seen at an angle, like a spring laid on its side, the head lifted high above the coils and the tail drawn down and across. The jaw is now UNHINGED wide, the tail swallowed deep, and a long clear bulge runs down the neck and into the first coil — the body visibly full of its own body. The eyes narrow and angry. In the space the coils enclose, one flat pale disc of light — the coil has begun to hold something',
    'ouroboros, enormous, the same bite, the coils now sweeping around the frame like an orbit — one coil passing clearly IN FRONT of what it holds, the others behind. At the centre a small world drawn as ONE flat circle with two or three simple blob continents in the same flat colors — never a realistic globe, never a photograph of Earth — and two plain round dots for moons. A few large flat gold rings set into the back like insignia. The head high and GORGING on itself: the jaw stretched to its absolute limit around a huge length of its own body, and the bulge travelling visibly through several coils. The eyes narrow and furious. The awe is the composition and the wrongness of the bite — never a roar, never a weapon'],

  /* Le fil de l'araignée : huit pattes courtes et rondes, un abdomen bulbeux marqué d'un
     sablier pâle, et une masse qui passe des pattes au ventre de stade en stade. */
  araignee: [
    'tiny round spiderling, almost all abdomen, eight very short stubby legs, two huge round eyes with four tiny dot eyes above, one pale hourglass mark on the back',
    'small round spider, the same eight legs now longer and still rounded, the same bulbous abdomen with the same pale hourglass mark, same eye arrangement, soft fuzzy body',
    'plump black widow, the same eight rounded legs thicker, the same hourglass mark now bright and larger on a glossy round abdomen, same eyes, calm face',
    'shadow weaver spider, the same eight legs held close under a much BIGGER abdomen, the same hourglass mark, a soft cloudy silk tuft on the back, drowsy eyes',
    'arachne, enormous spider, the same eight rounded legs now short against a huge dome-shaped abdomen filling the frame, the same hourglass mark grown into soft golden threads, tiny sleepy face low at the front'],

  /* Le fil du cerf : une ramure qui pousse par branches — jamais pointue — et des taches
     pâles sur le dos, présentes dès le faon et gardées jusqu'au bout. */
  cerf: [
    'tiny fawn, huge head and huge round eyes, four thin wobbly legs, soft pale spots on the back, two tiny rounded bumps where antlers will grow',
    'small round deer, the same pale spots, the same two bumps now short rounded antler stubs, thicker legs, gentle eyes',
    'great stag, the same pale spots, the same antlers now a small rounded branching crown, broader chest, calm eyes',
    'mist stag, the same spots, the same antlers grown into a wide rounded crown with soft moss on it, heavier body, short legs, drowsy eyes',
    'cernunnos, enormous deer lying down, the same pale spots, the same rounded antlers now a huge soft canopy with tiny leaves, tiny sleepy face beneath'],

  /* Le fil de l'ours : la masse. Une bête qui ne gagne aucun ornement, seulement du volume,
     avec la même tache pâle en croissant sur la poitrine. */
  ours: [
    'tiny bear cub, huge round head, tiny round ears, four stubby paws, one pale crescent patch on the chest',
    'small round bear sitting, the same tiny round ears, the same pale crescent patch, thick soft fur, friendly eyes',
    'cave bear, the same ears and the same crescent patch, much broader shoulders, heavy round body, calm eyes',
    'forest guardian bear, the same ears and crescent patch, an enormous round body with short legs, soft moss tufts on the shoulders, drowsy eyes',
    'artio, colossal bear lying down and filling the frame, the same round ears, the same crescent patch now glowing soft gold, tiny sleepy face resting on huge front paws'],

  /* Le fil du papillon : deux paires d'ailes rondes portant le MÊME ocelle, qui grandit avec
     elles. Le corps reste minuscule — c'est l'aile qui fait la masse. */
  papillon: [
    'tiny plump caterpillar, segmented round body, huge round eyes, two tiny antennae with round tips, one small pale eyespot on the side',
    'small butterfly, small round body, two pairs of small rounded wings bearing the same pale eyespot, the same round-tipped antennae',
    'moon moth, the same round-tipped antennae now feathery, the same eyespot bigger on broader rounded wings, soft fuzzy body',
    'mist wing moth, the same antennae, the same eyespot now large and pale on very WIDE rounded wings with soft cloudy edges, small body, drowsy eyes',
    'psyche, enormous moth, the same feathery antennae, the same eyespot grown into a huge soft glowing ring on immense rounded wings filling the frame, tiny sleepy face at the center'],

  /* Le fil de la tortue : une carapace à écailles hexagonales qui s'élargit sans jamais
     monter — la tortue reste BASSE, c'est ce qui la distingue de l'escargot. */
  tortue: [
    'tiny hatchling turtle, huge head and huge round eyes, one small soft shell with a simple hexagon pattern, four tiny flipper feet',
    'small round turtle, the same hexagon-patterned shell now firm and low, the same four flipper feet, gentle eyes',
    'ancient turtle, the same hexagon pattern on a much WIDER low shell, thick stubby legs, calm wrinkled face',
    'island turtle, the same hexagon pattern, the shell now very wide and flat with soft round moss patches and a tiny tree, short legs, drowsy eyes',
    'kurma, enormous turtle, the same hexagon pattern on a vast LOW shell filling the width of the frame, soft green patches on top, tiny sleepy face at the front'],

  /* Le fil du chat : de grandes oreilles triangulaires arrondies et des rayures sur la queue,
     comptées et gardées. La bête s'allonge et s'alourdit sans jamais se hérisser. */
  chat: [
    'tiny kitten, huge round head, two big rounded triangular ears, huge round eyes, short tail with three pale stripes',
    'small round cat sitting, the same big rounded ears, the same three-striped tail now longer and fluffier, soft round body',
    'lynx, the same rounded ears now with small soft tufts at the tips, the same three-striped tail short and thick, broader chest, calm eyes',
    'mist panther, the same tufted rounded ears, the same three stripes on a long heavy tail, a much bigger low round body, soft cloudy markings, drowsy eyes',
    'bastet, enormous cat lying down, the same tufted rounded ears, the same three-striped tail curled around the body, soft golden rings on the shoulders, tiny sleepy face on folded paws'],
};

/* ── Les exceptions, écrites ───────────────────────────────────────────────
   Une lignée peut avoir besoin de casser une règle de sa charte. Tant que la charte est
   la même pour tout le monde, la seule façon honnête de le faire est de l'écrire : la note
   se glisse entre l'en-tête et les cinq stades, elle ne vaut que pour cette lignée, et les
   autres n'en héritent pas. Sans ce créneau, casser une règle obligeait à la casser POUR
   TOUS — et une charte qu'on assouplit pour un cas ne tient plus personne. */
const NOTES = {
  ouroboros: `THIS LINE BREAKS THE SERENE REGISTER, ON PURPOSE — this paragraph overrides
"never in menace", "no snarl" and "mouth closed and neutral" above, for this creature only:
- the ouroboros is EATING itself, and it gets worse at every stage
- stages 1 and 2 are still neat: the jaw simply closed on the tail, effortless
- from stage 3 on it turns WRONG: the jaw stretches open far wider than the neck, the tail
  is forced down the throat, and a clear BULGE swells along the body where the swallowed
  tail sits — the body visibly full of itself
- the eyes go from calm, to strained, to narrow and FURIOUS. Never sleepy, never serene
- by stage 5 it is gorging: the jaw stretched to its limit, the bulge running through
  several coils
Keep it FLAT and bloodless: no blood, no wound, no gore, no drool. The open mouth is ONE
flat dark shape — no rendered teeth, no tongue detail. The horror is the SHAPE — a
distended jaw and a swelling body — never gore, and never at the cost of the 6 flat colors.`,
};

const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cle = process.argv[2];
/* REFAIRE UN SEUL STADE. Une planche de cinq coûte un jeton, et un climax raté n'en gâche
   qu'un cinquième : demander les cinq pour en corriger un ferait DÉRIVER les quatre autres,
   qui vont bien. Le mode rend le même prompt, la même charte, le même fil de lignée, mais
   n'en décrit qu'un — et la ligne de découpe qui va avec, en `--stades 1`. */
const stadeSeul = (() => {
  const i = process.argv.indexOf('--stade');
  return i === -1 ? 0 : parseInt(process.argv[i + 1], 10) || 0;
})();

/* Le prompt est TOUJOURS écrit dans un fichier, en plus du terminal. Lancée depuis un
   bouton de la conversation, une commande n'affiche pas forcément son retour — et un
   prompt qu'on ne retrouve pas ne sert à rien. */
function ecrire(ligne) {
  const stades = STADES[ligne.key];
  /* Le suffixe de fichier vient du nom, mais l'arc de la révélation garde le MÊME nom aux cinq
     âges : « Ouroboros » et « Ouroboros, la boucle du monde » donnaient deux fois `ouroboros`,
     et la commande de découpe annonçait des noms en double. Quand le premier bout est déjà
     pris, on descend sur l'épithète — ce qui suit la virgule est justement ce qui distingue. */
  const vus = new Set();
  const suffixes = ligne.forms.map(f => {
    const bouts = f[0].split(',').map(x => x.trim());
    let su = sansAccents(bouts[0]);
    if (vus.has(su) && bouts[1]) su = sansAccents(bouts[1]);
    while (vus.has(su)) su += '-bis';
    vus.add(su);
    return su;
  });
  /* Une mythique naît accomplie : elle ne suit pas la charte des bêtes qui grandissent.
     LA CLÉ EST « merveilleuse », PAS « merveilleux » — le test ne pouvait donc jamais être
     vrai pour le rang qui en avait le plus besoin, et les trois merveilles auraient reçu la
     charte mascotte. Personne ne s'en est aperçu : aucune des trois n'était décrite ici. */
  const entete = ligne.rarity === 'mythique' || ligne.rarity === 'merveilleuse'
               ? ENTETE_REVELATION : ENTETE;
  const l = [entete];
  if (NOTES[ligne.key]) l.push('', NOTES[ligne.key]);
  /* UN STADE REFAIT NE SE DEMANDE JAMAIS SEUL. La première tentative l'a demandé isolé, et
     la technique a dérivé en une seule génération : fond dégradé, halo, ombrages, alors que
     les quatre autres stades sont plats sur fond vide. Une planche porte sa charte dans ses
     propres images ; une image seule n'a rien à quoi se tenir.

     Le voisin part donc avec, INCHANGÉ et annoncé comme tel : il ancre la technique, et il met
     les deux masses côte à côte — ce qui est exactement le contrôle qu'elles doivent passer. */
  if (stadeSeul) {
    const i = stadeSeul - 1;
    const ancre = i > 0 ? i - 1 : i + 1;
    l.push('', 'TWO creatures on ONE row, side by side, evenly spaced, on plain empty background.');
    l.push('The FIRST one already exists and must be redrawn EXACTLY as described — it is here');
    l.push('only to anchor the technique. All the effort goes into the SECOND one.');
    l.push('');
    l.push('LEFT (reference, unchanged): ' + stades[ancre]);
    l.push('');
    l.push('RIGHT (the one that matters): ' + stades[i]);
    l.push('');
    l.push('Both in the SAME flat technique: flat blocks of color, one hard outline, no shading,');
    l.push('no glow, no gradient, no background of any kind. If the two do not look like they');
    l.push('come from the same sheet, the image has failed.');
    l.push('', '', '--- une fois l’image enregistrée dans art/source-' + ligne.key + '-'
                 + stadeSeul + '.png ---', '');
    l.push('node tools/pixel.js importer art/source-' + ligne.key + '-' + stadeSeul + '.png '
           + ligne.key + '-' + stadeSeul + ' --stades 2 --grille 64');
    l.push('', '  Deux grilles en sortent : on ne garde que la SECONDE, la première n’était');
    l.push('  qu’une ancre. La palette, elle, est calculée sur les deux ensemble — c’est');
    l.push('  justement ce qui la rapproche de celle de la lignée.');
    l.push('', '  Puis la grille remplace le stade ' + stadeSeul + ' de art/grilles/'
             + ligne.key + '.txt.');
    l.push('  ATTENTION : une image seule fait calculer SA palette, qui ne sera pas celle des');
    l.push('  quatre autres. Recopier la ligne « palette: » du stade 1 sur le stade neuf avant');
    l.push('  de relancer « rendre » — sinon la lignée change de couleurs au dernier âge.');
    const texte0 = l.join('\n');
    if (!fs.existsSync('prompts')) fs.mkdirSync('prompts');
    const chemin0 = 'prompts/' + ligne.key + '-' + stadeSeul + '.txt';
    fs.writeFileSync(chemin0, texte0);
    return { chemin: chemin0, texte: texte0 };
  }
  l.push('', 'The 5 stages, in order:');
  ligne.forms.forEach((f, i) => l.push((i + 1) + '. ' + stades[i]));
  l.push('', '', '--- une fois la planche enregistrée dans art/source-' + ligne.key + '.png ---', '');
  l.push('python tools/decouper.py art/source-' + ligne.key + '.png ' + ligne.key + ' ' + suffixes.join(','));
  l.push('', '--- puis dans la table ART, en haut de game.js ---', '');
  l.push('  ' + ligne.key + ': {');
  ligne.forms.forEach((f, i) =>
    l.push('    ' + (i + 1) + ": '" + ligne.key + '-' + (i + 1) + '-' + suffixes[i] + ".png',   // " + f[0]));
  l.push('  },', '');

  const texte = l.join('\n');
  if (!fs.existsSync('prompts')) fs.mkdirSync('prompts');
  const chemin = 'prompts/' + ligne.key + '.txt';
  fs.writeFileSync(chemin, texte);
  return { chemin, texte };
}

if (cle === '--tout') {
  const faits = LINES.filter(l => STADES[l.key]).map(l => ecrire(l).chemin);
  console.log('\n' + faits.length + ' prompts écrits :\n');
  faits.forEach(c => console.log('  ' + c));
  console.log('');
  process.exit(0);
}

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

const { chemin, texte } = ecrire(ligne);

console.log('\n' + '='.repeat(78));
console.log('  ' + ligne.name + ' — ' + ligne.rarity);
console.log('='.repeat(78) + '\n');
console.log(texte);
console.log('='.repeat(78));
console.log('  Écrit dans ' + chemin + ' — ouvre ce fichier et copie tout.');
console.log('='.repeat(78) + '\n');
