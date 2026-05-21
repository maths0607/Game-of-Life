/**
 * GAME OF LIFE — Proof of Universality (A1 Russian)
 * Engine with BOUNDARY DEATH (no wrapping) + pattern demos + logic gates
 */

// ═══════════════════════════════════════════════════════════
//  GAME OF LIFE ENGINE — avec mort aux bords
// ═══════════════════════════════════════════════════════════

class GameOfLife {
  constructor(canvas, cellSize = 10) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = cellSize;
    
    // Dimensions de la grille (en cellules)
    this.cols = Math.floor(canvas.width / cellSize);
    this.rows = Math.floor(canvas.height / cellSize);
    
    // Grille 2D : grid[y][x] = 0 ou 1
    this.grid = this.createEmptyGrid();
    
    // État de la simulation
    this.running = false;
    this.interval = 150;  // ms entre chaque génération
    this.timer = null;
    
    // Zone de "mort" aux bords (optionnel : tue les cellules trop proches du bord)
    this.boundaryMargin = 0;  // 0 = mort exacte au bord, >0 = marge de sécurité
    
    this.setupEvents();
  }
  
  // Crée une grille vide (toutes mortes)
  createEmptyGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }
  
  // ✅ Compte les voisins SANS wrapping — mort aux bords
  countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <=  1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;  // colonne voisine
        const ny = y + dy;  // ligne voisine
        
        // ✅ BORNES STRICTES : si hors grille → on ignore (pas de comptage)
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          count += this.grid[ny][nx];
        }
      }
    }
    return count;
  }
  
  // ✅ Une génération : applique les règles de Conway AVEC mort aux bords
  step() {
    const newGrid = this.createEmptyGrid();
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const neighbors = this.countNeighbors(x, y);
        const alive = this.grid[y][x];
        
        // Règles de Conway : B3/S23
        if (alive) {
          // Survie : 2 ou 3 voisins
          newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
        } else {
          // Naissance : exactement 3 voisins
          newGrid[y][x] = (neighbors === 3) ? 1 : 0;
        }
      }
    }
    
    this.grid = newGrid;
    
    // ✅ OPTIONNEL : tuer les cellules dans la marge de bord
    if (this.boundaryMargin > 0) {
      this.applyBoundaryKill();
    }
  }
  
  // ✅ Tue les cellules trop proches des bords (zone de sécurité)
  applyBoundaryKill() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (x < this.boundaryMargin || x >= this.cols - this.boundaryMargin ||
            y < this.boundaryMargin || y >= this.rows - this.boundaryMargin) {
          this.grid[y][x] = 0;  // force la mort
        }
      }
    }
  }
  
  // Dessine la grille sur le canvas
  draw(color = '#00ff9d') {
    if (!this.ctx) return;
    
    // Fond noir
    this.ctx.fillStyle = '#0d0d14';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dessine les cellules vivantes
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x]) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            x * this.cellSize + 1,
            y * this.cellSize + 1,
            this.cellSize - 2,
            this.cellSize - 2
          );
        }
      }
    }
  }
  
  // Boucle principale de la simulation
  loop() {
    if (!this.running) return;
    this.step();
    this.draw();
    this.timer = setTimeout(() => this.loop(), this.interval);
  }
  
  // Contrôles de la simulation
  start() { 
    if (this.running) return; 
    this.running = true; 
    this.loop(); 
  }
  
  stop() { 
    this.running = false; 
    if (this.timer) clearTimeout(this.timer); 
  }
  
  toggle() { 
    this.running ? this.stop() : this.start(); 
  }
  
  clear() { 
    this.stop(); 
    this.grid = this.createEmptyGrid(); 
    this.draw(); 
  }
  
  // ✅ Définit une cellule — avec vérification des bornes
  setCell(x, y, value) {
    // Bornes strictes : si hors grille → on ignore (pas de création)
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return;  // cellule hors bornes → ignorée
    }
    this.grid[y][x] = value ? 1 : 0;
  }
  
  // Bascule l'état d'une cellule (vivante ↔ morte)
  toggleCell(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return;
    }
    this.grid[y][x] = this.grid[y][x] ? 0 : 1;
    this.draw();
  }
  
  // Gestion des clics sur le canvas
  setupEvents() {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.cellSize);
      const y = Math.floor((e.clientY - rect.top) / this.cellSize);
      this.toggleCell(x, y);
    });
  }
  
  // Charge un pattern à une position donnée (avec centrage optionnel)
  loadPattern(pattern, offsetX = null, offsetY = null) {
    // Si pas de position donnée → centre le pattern
    const cx = offsetX !== null ? offsetX : Math.floor(this.cols / 2) - Math.floor((pattern[0]?.length || 0) / 2);
    const cy = offsetY !== null ? offsetY : Math.floor(this.rows / 2) - Math.floor(pattern.length / 2);
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 'o' || pattern[y][x] === 1) {
          this.setCell(cx + x, cy + y, 1);
        }
      }
    }
    this.draw();  // Rafraîchir après chargement
  }
}

// ═══════════════════════════════════════════════════════════
//  PATTERNS (from PDF CA_part14)
// ═══════════════════════════════════════════════════════════

const PATTERNS = {
  // ── Formes stables (cycle = 1) ──
  block: ['oo', 'oo'],
  beehive: ['.oo.', 'o..o', '.oo.'],
  loaf: ['.oo.', 'o..o', '.o.o', '..o.'],
  tub: ['.o.', 'o.o', '.o.'],
  
  // ── Oscillateurs (cycle = 2) ──
  blinker: ['ooo'],
  toad: ['.ooo', 'ooo.'],
  beacon: ['oooo', 'oooo', 'oo..', 'oo..'],
  
  // ── Glider (se déplace ↘) ──
  glider: ['.o.', '..o', 'ooo'],
  
  // ── Vaisseaux spatiaux (cycle = 4, se déplacent →) ──
   // ── Lightweight spaceship (LWSS) ──
  lwss: [ '.o..o', 'o....', 'o...o', 'oooo.' ],

  // ── Middleweight spaceship (MWSS) ──
  mwss: [ '...o..', '.o...o', 'o.....', 'o....o', 'ooooo.' ],

  // ── Heavyweight spaceship (HWSS) ──
  hwss: [ '...oo..','o.....o','.......o', 'o......o', '.oooooo.'],  
  // ── Mangeur (eater) ──
  eater: ['oo.', 'o.o', '..o', '..oo'],
  
  // ── Puissance : Gosper Glider Gun (simplifié pour démo) ──
  gun: [
    '........................o...........',
    '......................o.o...........',
    '............oo......oo............oo',
    '...........o...o....oo............oo',
    'oo........o.....o...oo..............',
    'oo........o...o.oo....o.o...........',
    '..........o.....o.......o...........',
    '...........o...o....................',
    '............oo......................'
  ]
};

// ═══════════════════════════════════════════════════════════
//  INITIALISATION — toutes les démos
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  
  // ── SIMULATEUR PRINCIPAL : règles de base ──
  const rulesCanvas = document.getElementById('sim-rules');
  if (rulesCanvas) {
    const rulesSim = new GameOfLife(rulesCanvas, 10);
    
    document.getElementById('btn-rules-start')?.addEventListener('click', () => rulesSim.toggle());
    document.getElementById('btn-rules-step')?.addEventListener('click', () => { 
      rulesSim.step(); 
      rulesSim.draw(); 
    });
    document.getElementById('btn-rules-clear')?.addEventListener('click', () => rulesSim.clear());
    document.getElementById('btn-rules-example')?.addEventListener('click', () => {
      rulesSim.loadPattern(PATTERNS.blinker,10 ,10);
      rulesSim.loadPattern(PATTERNS.block, 20,20);
      rulesSim.start();
    });
  }
  
  // ── FONCTION UTILITAIRE : setup d'une démo de forme ──
  function setupFormDemo(canvasId, patternName, cellSize = 8) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !PATTERNS[patternName]) return;
    
    const sim = new GameOfLife(canvas, cellSize);
    sim.loadPattern(PATTERNS[patternName]);
    sim.interval = 200;
    sim.start();
  }
  
  // ── FORMES STABLES ──
  setupFormDemo('form-block', 'block');
  setupFormDemo('form-beehive', 'beehive');
  setupFormDemo('form-loaf', 'loaf');
  
  // ── OSCILLATEURS ──
  setupFormDemo('form-blinker', 'blinker');
  setupFormDemo('form-toad', 'toad');
  setupFormDemo('form-beacon', 'beacon');
  setupFormDemo('form-lwss', 'lwss');
  setupFormDemo('form-mwss', 'mwss');
  setupFormDemo('form-hwss', 'hwss');
  
  // ── GLIDER (avec bouton de démarrage) ──
  const gliderCanvas = document.getElementById('form-glider');
  if (gliderCanvas) {
    const gliderSim = new GameOfLife(gliderCanvas, 10);
    gliderSim.loadPattern(PATTERNS.glider,0,0);
    gliderSim.interval = 150;
    
    document.getElementById('btn-rules-start-gli')?.addEventListener('click', () => gliderSim.toggle());
    document.getElementById('btn-rules-step-gli')?.addEventListener('click', () => { 
      gliderSim.step(); 
      gliderSim.draw(); 
    });
  }
  
  // ── EATER + GLIDER (collision) — CORRECTION COMPLETE ──
  const eaterCanvas = document.getElementById('form-eater');
  if (eaterCanvas) {
    const eaterSim = new GameOfLife(eaterCanvas, 8);
    
    // Positionner l'EATER (stable) au centre-droit
    const eaterX = 22;
    const eaterY = 16+5;
    const eaterPattern = PATTERNS.eater;
    for (let y = 0; y < eaterPattern.length; y++) {
      for (let x = 0; x < eaterPattern[y].length; x++) {
        if (eaterPattern[y][x] === 'o') {
          eaterSim.setCell(eaterX + x, eaterY + y, 1);
        }
      }
    }
    
    // Positionner le GLIDER au nord-ouest pour qu'il approche l'eater (↘)
    // Le glider avance de 1 cellule diagonale tous les 4 ticks
    const gliderX = eaterX - 12-5;  // 12 cellules à gauche
    const gliderY = eaterY - 12-5;  // 12 cellules au-dessus
    const gliderPattern = PATTERNS.glider;
    for (let y =  0; y < gliderPattern.length; y++) {
      for (let x = 0; x < gliderPattern[y].length; x++) {
        if (gliderPattern[y][x] === 'o') {
          eaterSim.setCell(gliderX + x, gliderY + y, 1);
        }
      }
    }
    
    eaterSim.interval = 120;  // Vitesse pour bien voir la collision
    eaterSim.draw();          // Afficher l'état initial
    
    document.querySelector('[data-form="eater"]')?.addEventListener('click', () => {
      eaterSim.start();
    });
  }
  
  // ── GLIDER GUN (simplifié) ──
  const gunCanvas = document.getElementById('form-gun');
  if (gunCanvas) {
    const gunSim = new GameOfLife(gunCanvas, 4);
    gunSim.loadPattern(PATTERNS.gun,0,0);
    gunSim.interval = 20
    const eaterX = 64+30;
    const eaterY =  50+30;
    const eaterPattern = PATTERNS.eater;
    for (let y = 0; y < eaterPattern.length; y++) {
      for (let x = 0; x < eaterPattern[y].length; x++) {
        if (eaterPattern[y][x] === 'o') {
          gunSim.setCell(eaterX + x, eaterY + y, 1);
        }
      }
    }
    
    document.querySelector('[data-form="gun"]')?.addEventListener('click', () => {
      gunSim.start();
    });
  }
  ///collisison 

  const collisionCanvas = document.getElementById('form-collision');
  if (collisionCanvas) {
    const collisionSim = new GameOfLife(collisionCanvas, 4);
    collisionSim.loadPattern(PATTERNS.gun,0,0);
    collisionSim.interval = 20
    const eaterX = 120;
    const eaterY = 1;
    const eaterPattern = PATTERNS.gun;
    for (let y = 0; y < eaterPattern.length; y++) {
      for (let x = 0; x < eaterPattern[y].length; x++) {
        if (eaterPattern[y][x] === 'o') {
          collisionSim.setCell(eaterX  - x, eaterY + y, 1);
        }
      }
    }
    
    document.querySelector('[data-form="gli-collision"]')?.addEventListener('click', () => {
      collisionSim.start();
    });
  }





  // ── BLOCS ORDINATEUR : Mémoire (blocs stables = bits) ──
const memCanvas = document.getElementById('sim-memory');

if (memCanvas) {
  const memSim = new GameOfLife(memCanvas, 12);
  const block = PATTERNS.block;

  // Suite de bits à afficher
  const bits = [1, 1, 0, 0, 1, 0, 1];

  for (let i = 0; i < bits.length; i++) {

    // Un bloc = bit 1
    if (bits[i] === 1) {

      for (let y = 0; y < block.length; y++) {
        for (let x = 0; x < block[y].length; x++) {

          if (block[y][x] === 'o') {
            memSim.setCell(
              i * 4 + x,
              2 + y,
              1
            );
          }
        }
      }
    }
  }

  memSim.draw();
}
  
  // ── TRANSMISSION : flux de gliders = données ──
  const txCanvas = document.getElementById('sim-transmit');
  if (txCanvas) {
    const txSim = new GameOfLife(txCanvas, 8);
    
    // Créer un flux de 4 gliders espacés (représente 1-0-1-1)
    for (let i = 0; i < 4; i++) {
      const gl = PATTERNS.glider;
      for (let y = 0; y < gl.length; y++) {
        for (let x = 0; x < gl[y].length; x++) {
          if (gl[y][x] === 'o') {
            txSim.setCell(i * 7 + x, 5 + y, 1);
          }
        }
      }
    }
    txSim.interval = 150;
    txSim.start();
  }
  
  // ── HORLOGE : pulse régulier de gliders ──
  const clockCanvas = document.getElementById('sim-clock');
  if (clockCanvas) {
    const clockSim = new GameOfLife(clockCanvas, 6);
    let clockCount = 0;
    
    function clockLoop() {
      clockSim.clear();
      
      // Émettre un glider toutes les 20 itérations (simule période 30)
      if (clockCount % 20 === 0) {
        const gl = PATTERNS.glider;
        for (let y = 0; y < gl.length; y++) {
          for (let x = 0; x < gl[y].length; x++) {
            if (gl[y][x] === 'o') {
              clockSim.setCell(4 + x, 14 + y, 1);
            }
          }
        }
      }
      
      clockSim.draw();
      clockCount++;
      setTimeout(clockLoop, 100);
    }
    clockLoop();
  }
  
  // ── PORTES LOGIQUES : tables de vérité interactives ──
  function setupGate(gateType, outputId) {
    const inputs = document.querySelectorAll(`.gate-input[data-gate="${gateType}"]`);
    const output = document.getElementById(outputId);
    if (!inputs.length || !output) return;
    
    function update() {
      const values = {};
      inputs.forEach(inp => {
        values[inp.dataset.bit] = inp.checked ? 1 : 0;
      });
      
      let result = 0;
      switch(gateType) {
        case 'and': result = (values.x && values.y) ? 1 : 0; break;
        case 'or':  result = (values.x || values.y) ? 1 : 0; break;
        case 'not': result = values.x ? 0 : 1; break;
        case 'nand': result = !(values.x && values.y) ? 1 : 0; break;
      }
      
      output.textContent = result;
      output.style.color = result ? 'var(--accent)' : 'var(--text-dim)';
    }
    
    inputs.forEach(inp => inp.addEventListener('change', update));
    update();  // Initialisation
  }
  
  setupGate('and', 'out-and');
  setupGate('or', 'out-or');
  setupGate('not', 'out-not');
  setupGate('nand', 'out-nand');
  
  // ── PORTES DANS LIFE : NOT avec gliders (démo conceptuelle) ──
  const notCanvas = document.getElementById('gate-not');
  if (notCanvas) {
    const notSim = new GameOfLife(notCanvas, 8);
    
    document.getElementById('btn-not-run')?.addEventListener('click', () => {
      const inputX = document.getElementById('not-x')?.checked;
      notSim.clear();
      
      // Flux "gun" vertical (représente le signal de référence = 1)
      for (let i = 0; i < 10; i++) {
        notSim.setCell(14, i * 3, 1);
      }
      
      // Glider d'entrée si x=1 (vient du sud-ouest)
      if (inputX) {
        const gl = PATTERNS.glider;
        for (let y = 0; y < gl.length; y++) {
          for (let x = 0; x < gl[y].length; x++) {
            if (gl[y][x] === 'o') {
              notSim.setCell(7 + x, 12 + y, 1);
            }
          }
        }
      }
      
      notSim.draw();
      notSim.interval = 150;
      notSim.start();
      
      // Résultat simulé après "collision"
      setTimeout(() => {
        const result = inputX ? 0 : 1;
        const resultEl = document.getElementById('not-result');
        if (resultEl) {
          resultEl.textContent = result;
          resultEl.style.color = result ? 'var(--accent)' : 'var(--text-dim)';
        }
      }, 1500);
    });
  }
  
  // ── PORTE AND dans Life (démo conceptuelle) ──
  const andCanvas = document.getElementById('gate-and');
  if (andCanvas) {
    const andSim = new GameOfLife(andCanvas, 6);
    
    document.getElementById('btn-and-run')?.addEventListener('click', () => {
      const inputX = document.getElementById('and-x')?.checked;
      const inputY = document.getElementById('and-y')?.checked;
      andSim.clear();
      
      // Flux gun de référence
      for (let i = 0; i < 10; i++) {
        andSim.setCell(20, i * 4, 1);
      }
      
      // Entrée x (si activée)
      if (inputX) {
        for (let i = 0; i < 3; i++) andSim.setCell(12 + i, 14, 1);
      }
      // Entrée y (si activée)
      if (inputY) {
        for (let i = 0; i < 3; i++) andSim.setCell(26 + i, 18, 1);
      }
      
      andSim.draw();
      andSim.interval = 150;
      andSim.start();
      
      // Résultat simulé
      setTimeout(() => {
        const result = (inputX && inputY) ? 1 : 0;
        const resultEl = document.getElementById('and-result');
        if (resultEl) {
          resultEl.textContent = result;
          resultEl.style.color = result ? 'var(--accent)' : 'var(--text-dim)';
        }
      }, 2000);
    });
  }
  
  // ── NAND placeholder ──
  const nandCanvas = document.getElementById('gate-nand');
  if (nandCanvas) {
    const nandSim = new GameOfLife(nandCanvas, 6);
    nandSim.loadPattern(PATTERNS.blinker);  // Démo visuelle simple
    nandSim.draw();
  }
  
  // ── MACHINE DE RENDELL (simplifiée) : ruban + tête ──
  const rendellCanvas = document.getElementById('sim-rendell');
  if (rendellCanvas) {
    const rendellSim = new GameOfLife(rendellCanvas, 8);
    
    function rendellLoop() {
      rendellSim.clear();
      
      // Ruban : blocs stables = bits de mémoire (10101...)
      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {  // bit = 1
          const bl = PATTERNS.block;
          for (let y = 0; y < bl.length; y++) {
            for (let x = 0; x < bl[y].length; x++) {
              if (bl[y][x] === 'o') {
                rendellSim.setCell(i * 5 + x, 10 + y, 1);
              }
            }
          }
        }
      }
      
      // Tête de lecture : un glider qui "scanne" le ruban
      const gl = PATTERNS.glider;
      for (let y = 0; y < gl.length; y++) {
        for (let x = 0; x < gl[y].length; x++) {
          if (gl[y][x] === 'o') {
            rendellSim.setCell(16 + x, 3 + y, 1);
          }
        }
      }
      
      rendellSim.draw();
      setTimeout(rendellLoop, 400);  // Animation lente pour visibilité
    }
    rendellLoop();
  }
  
});