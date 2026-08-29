/* ── LE BANC D'ESSAI ──────────────────────────────────────────────────────────
   Fait tourner `game.js` hors navigateur : un DOM minimal, les identifiants lus dans
   `index.html`, et de quoi appeler n'importe quelle fonction du jeu depuis Node.

   C'EST LA SEULE FAÇON DE VÉRIFIER QUOI QUE CE SOIT ICI. Le projet n'ouvre jamais de
   navigateur, donc tout ce qui n'est pas lu à l'œil passe par ce fichier. Il a longtemps
   vécu dans un dossier temporaire, refabriqué de mémoire à chaque session : il est
   maintenant dans le dépôt, et `node tools/test.js` le fait tourner.

   DEUX CHOSES QU'IL FAUT SAVOIR EN L'UTILISANT :

   Le DOM est faux. Il tient juste assez pour que le rendu s'exécute sans lever — classes,
   `hidden`, `textContent`, quelques enfants. Il ne mesure rien, ne met rien en page, et ne
   dira jamais si quelque chose est joli, superposé ou illisible. Ce qu'il prouve, c'est
   qu'une valeur arrive au bon endroit.

   Les écouteurs ne font rien. `addEventListener` est un trou noir : on appelle les fonctions
   du jeu directement, jamais en simulant un clic. */

'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');

const html = lire('index.html');
const IDS = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

const noeuds = new Map();
const inconnus = [];

function el(tag) {
  return {
    tagName: (tag || 'div').toUpperCase(),
    children: [], _text: '', _html: '',
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => x && this._s.add(x)); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      toggle(c, v) {
        if (v === undefined) return this._s.has(c) ? this._s.delete(c) : this._s.add(c);
        return v ? this._s.add(c) : this._s.delete(c);
      },
      contains(c) { return this._s.has(c); },
      get length() { return this._s.size; },
      [Symbol.iterator]() { return this._s[Symbol.iterator](); },
    },
    style: { setProperty() {}, filter: '', width: '', fontSize: '' },
    dataset: {}, hidden: false, disabled: false, title: '', value: '', alt: '', type: 'button',
    parent: null,
    _attrs: {},
    get className() { return [...this.classList._s].join(' '); },
    set className(v) { this.classList._s = new Set(String(v).split(/\s+/).filter(Boolean)); },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); this.children = []; },
    get innerHTML() { return this._html; },
    set innerHTML(v) {
      this._html = String(v);
      // assez pour carteEl : on recrée les enfants nommés par leur classe
      this.children = [...String(v).matchAll(/class="([^"]+)"/g)].map(m => {
        const c = el('span'); c.className = m[1]; return c;
      });
    },
    get firstElementChild() { return this.children[0] || null; },
    /* CHAQUE NŒUD CONNAÎT SON PÈRE, et `remove()` fait vraiment quelque chose. C'était un
       no-op, si bien que le banc ne pouvait pas voir une vignette QUITTER la bande : elle
       s'accumulait, et un scénario qui comptait les enfants d'une bande comptait des fantômes.
       Trois lignes de plus, et tout ce qui se retire devient observable. */
    appendChild(c) { c.parent = this; this.children.push(c); return c; },
    append(...cs) { cs.forEach(c => { c.parent = this; this.children.push(c); }); },
    replaceChildren(...cs) { cs.forEach(c => { c.parent = this; }); this.children = cs; },
    remove() { if (this.parent) this.parent.removeChild(this); },
    insertBefore(n, ref) {
      const i = ref ? this.children.indexOf(ref) : -1;
      const j = this.children.indexOf(n);
      if (j !== -1) this.children.splice(j, 1);
      n.parent = this;
      if (i === -1) this.children.push(n); else this.children.splice(i, 0, n);
      return n;
    },
    removeChild(n) {
      const i = this.children.indexOf(n);
      if (i !== -1) this.children.splice(i, 1);
      if (n.parent === this) n.parent = null;
      return n;
    },
    addEventListener() {}, removeEventListener() {},
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return this._attrs[k] === undefined ? null : this._attrs[k]; },
    removeAttribute(k) { delete this._attrs[k]; },
    closest() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 10, height: 10 }; },
    querySelector(sel) {
      const cls = sel.replace(/^\./, '');
      const trouve = n => n.classList.contains(cls) ? n
        : n.children.reduce((r, x) => r || trouve(x), null);
      return this.children.reduce((r, x) => r || trouve(x), null);
    },
    querySelectorAll(sel) {
      const cls = sel.replace(/^\./, ''), out = [];
      const marche = n => { if (n.classList.contains(cls)) out.push(n); n.children.forEach(marche); };
      this.children.forEach(marche);
      return out;
    },
  };
}

/* On reprend l'état `hidden` écrit dans index.html : sans ça le banc voit tous les panneaux
   ouverts alors que le joueur en voit trois, et les tests de dévoilement passent à tort. */
for (const id of IDS) {
  const n = el();
  const balise = html.match(new RegExp('<[^>]*id="' + id + '"[^>]*>'));
  if (balise && /\shidden(\s|>|=)/.test(balise[0])) n.hidden = true;
  // les groupes de boutons portent leurs enfants : c'est ce que syncTri et syncAchat parcourent
  const bloc = html.match(new RegExp('<[^>]*id="' + id + '"[^]*?</div>'));
  if (bloc) {
    for (const b of bloc[0].matchAll(/<button[^>]*data-(\w+)="([^"]+)"[^>]*>([^<]*)</g)) {
      const enfant = el('button');
      enfant.dataset[b[1]] = b[2];
      enfant.textContent = b[3];
      n.children.push(enfant);
    }
  }
  noeuds.set(id, n);
}

global.document = {
  createElement: el,
  getElementById(id) {
    // un identifiant que game.js demande sans qu'index.html le pose : c'est un bug, on le note
    if (!noeuds.has(id)) { inconnus.push(id); noeuds.set(id, el()); }
    return noeuds.get(id);
  },
  addEventListener() {},
  hidden: false,
  body: el(),
  querySelector: () => el(),
  querySelectorAll: () => [],
};
global.window = {
  addEventListener() {}, AudioContext: null,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};
/* Recharger la page et écrire au presse-papier sont les deux gestes que le banc ne peut pas
   faire. On les remplace par des trous qui comptent, ce qui suffit à vérifier qu'ils ont été
   demandés au bon moment. */
let rechargements = 0;
global.location = { reload() { rechargements++; }, get _n() { return rechargements; } };
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.requestAnimationFrame = () => 0;
global.setInterval = () => 0;
global.confirm = () => true;

/* Une sauvegarde de départ, posée AVANT le chargement : c'est la seule façon de tester un
   retour de session, une migration ou un rattrapage hors ligne. `load()` ne met `isNewGame`
   à faux que s'il trouve quelque chose au premier appel — le poser après coup ne trompe
   personne, et catchUp sort aussitôt. */
const store = {};
const CLE = 'eclosion.jalon0';
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};

const src = lire('game.js');

/* TOUT CE QUE game.js DÉCLARE AU PREMIER NIVEAU EST EXPOSÉ. La liste était écrite à la main
   et se périmait à chaque fonction ajoutée — deux fois dans la même session, un test échouait
   parce que le nom manquait dans l'export, ce qui ressemble exactement à un bug du jeu.
   On la fabrique donc à partir de la source.

   Des accesseurs, pas des valeurs : `state` est réassigné par `load()`, et une copie prise au
   chargement pointerait sur l'ancien objet pour le reste du test. */
const declare = new Map();          // nom → réassignable ?
for (const m of src.matchAll(/^function\s+([A-Za-z_$][\w$]*)/gm)) declare.set(m[1], false);
for (const m of src.matchAll(/^(const|let|var)\s+([^\n]+)$/gm)) {
  const muable = m[1] !== 'const';
  const reste = m[2].replace(/\s*\/\/.*$/, '');
  /* Deux formes à distinguer. Terminée par `;`, la ligne peut déclarer plusieurs noms —
     `let state, nextId = 1, lastFrame = Date.now();` — et on les prend tous. Sinon la
     déclaration continue sur les lignes suivantes (`const LINES = [`) : seul le premier nom
     est sûr, et découper sur les virgules ramasserait le contenu de la table. */
  const parts = /;\s*$/.test(reste) ? reste.split(/,(?![^(]*\))/) : [reste];
  for (const part of parts) {
    const nom = part.trim().split(/[\s=(;]/)[0];
    if (/^[A-Za-z_$][\w$]*$/.test(nom)) declare.set(nom, muable);
  }
}
const acces = [...declare].map(([n, muable]) =>
  'get ' + n + '() { return ' + n + '; }' +
  (muable ? ', set ' + n + '(v) { ' + n + ' = v; }' : '')).join(', ');

const fabrique = new Function(
  'return (function () {\n' +
  src.replace(/^start\(\);\s*$/m, '') +      // le banc décide lui-même quand démarrer
  '\nreturn { ' + acces + ' };\n})()');

/* Remet le banc à zéro entre deux scénarios : un processus Node en enchaîne plusieurs, et
   sans ça la sauvegarde du précédent traîne dans le store. `graine` pose une partie déjà
   commencée avant le chargement. */
function neuf(graine) {
  rechargements = 0;
  for (const k of Object.keys(store)) delete store[k];
  if (graine) store[CLE] = JSON.stringify(graine);
  for (const n of noeuds.values()) {
    n.classList._s.clear();
    n._text = ''; n._html = ''; n.children = []; n.disabled = false;
    const balise = html.match(new RegExp('<[^>]*id="' + n_id(n) + '"[^>]*>'));
    n.hidden = !!(balise && /\shidden(\s|>|=)/.test(balise[0]));
  }
  inconnus.length = 0;
  const jeu = fabrique();
  jeu.start();
  return jeu;
}
// retrouve l'identifiant d'un nœud : la carte est petite, la recherche linéaire suffit
function n_id(n) { for (const [id, x] of noeuds) if (x === n) return id; return ''; }

module.exports = {
  neuf, noeuds, IDS, inconnus, RACINE, lire, CLE,
  // ce que le store contient vraiment, pour vérifier ce qu'une restauration a posé
  brut: () => store[CLE],
  rechargements: () => rechargements,
};
