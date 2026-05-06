/**
 * GAME OF LIFE — Conway's Game of Life Simulator
 * Preuve d'universalité computationnelle
 */

// ═══════════════════════════════════════════════════════════
//  GAME OF LIFE ENGINE
// ═══════════════════════════════════════════════════════════

const CELL = 10;
let canvas, ctx, W, H, cols, rows;
let grid, nextGrid;
let running = false;
let generation = 0;
let animId = null;
let interval = 150;
let isDrawing = false;
let drawValue = 1;

function initCanvas() {
  canvas = document.getElementById('life-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  const maxW = Math.min(700, (wrap && wrap.clientWidth) ? wrap.clientWidth - 32 : 600);
  canvas.width = Math.max(100, maxW);
  canvas.height = Math.max(100, Math.floor(canvas.width * 0.64));
  cols = Math.floor(canvas.width / CELL);
  rows = Math.floor(canvas.height / CELL);
  grid = new Uint8Array(cols * rows);
  nextGrid = new Uint8Array(cols * rows);
}

function idx(x, y) { return y * cols + x; }

function get(g, x, y) {
  if (x < 0) x += cols;
  if (x >= cols) x -= cols;
  if (y < 0) y += rows;
  if (y >= rows) y -= rows;
  return g[idx(x, y)];
}

function step() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (dx !== 0 || dy !== 0) n += get(grid, x+dx, y+dy);
      const alive = grid[idx(x,y)];
      nextGrid[idx(x,y)] = alive ? (n===2||n===3?1:0) : (n===3?1:0);
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
  generation++;
  const genEl1 = document.getElementById('gen-count');
  const genEl2 = document.getElementById('gen-count2');
  if (genEl1) genEl1.textContent = generation;
  if (genEl2) genEl2.textContent = generation;
}

function draw() {
  if (!ctx || !canvas) return;
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let live = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[idx(x,y)]) {
        live++;
        const brightness = Math.random() * 0.15 + 0.85;
        ctx.fillStyle = `rgba(0,255,157,${brightness})`;
        ctx.fillRect(x*CELL+1, y*CELL+1, CELL-1, CELL-1);
      }
    }
  }
  const liveEl = document.getElementById('live-count');
  if (liveEl) liveEl.textContent = live;
}

function loop() {
  if (!running) return;
  step();
  draw();
  animId = setTimeout(loop, interval);
}

function toggleRun() {
  running = !running;
  const btn = document.getElementById('btn-play');
  const status = document.getElementById('status-text');
  if (running) {
    if (btn) { btn.textContent = '⏸ Пауза'; btn.classList.add('active'); }
    if (status) status.textContent = 'Работает';
    loop();
  } else {
    if (btn) { btn.textContent = '▶ Пуск'; btn.classList.remove('active'); }
    if (status) status.textContent = 'Остановлен';
    clearTimeout(animId);
  }
}

// ── PATTERNS ──
const patterns = {
  glider: { cells: [[1,0],[2,1],[0,2],[1,2],[2,2]], ox:5, oy:5 },
  blinker: { cells: [[0,0],[1,0],[2,0]], ox:15, oy:10 },
  block: { cells: [[0,0],[1,0],[0,1],[1,1]], ox:15, oy:10 },
  beehive: { cells: [[1,0],[2,0],[0,1],[3,1],[1,2],[2,2]], ox:15, oy:10 },
  pulsar: {
    cells: (function(){
      const c=[];
      const arm=[[2,0],[3,0],[4,0],[0,2],[0,3],[0,4],[2,5],[3,5],[4,5],[5,2],[5,3],[5,4]];
      function quad(cells,sx,sy){cells.forEach(([x,y])=>{c.push([x*sx,y*sy]);})}
      arm.forEach(([x,y])=>{c.push([x+2,y+2],[-(x+2)+14,y+2],[x+2,-(y+2)+14],[-(x+2)+14,-(y+2)+14])});
      return c;
    })(),
    ox:5, oy:3
  },
  gun: {
    cells: [
      [0,4],[0,5],[1,4],[1,5],
      [10,4],[10,5],[10,6],[11,3],[11,7],[12,2],[12,8],[13,2],[13,8],
      [14,5],[15,3],[15,7],[16,4],[16,5],[16,6],[17,5],
      [20,2],[20,3],[20,4],[21,2],[21,3],[21,4],[22,1],[22,5],
      [24,0],[24,1],[24,5],[24,6],
      [34,2],[34,3],[35,2],[35,3]
    ],
    ox:2, oy:5
  },
  lwss: {
    cells: [[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]],
    ox:10, oy:10
  },
  eater: {
    cells: [[0,0],[1,0],[0,1],[2,1],[2,2],[3,2],[3,3]],
    ox:20, oy:5
  },
  random: null
};

function loadPattern(name) {
  if (!grid) return;
  grid.fill(0);
  generation = 0;
  const genEl1 = document.getElementById('gen-count');
  const genEl2 = document.getElementById('gen-count2');
  if (genEl1) genEl1.textContent = 0;
  if (genEl2) genEl2.textContent = 0;

  if (name === 'random') {
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.3 ? 1 : 0;
  } else {
    const p = patterns[name];
    if (!p) return;
    const cx = Math.floor(cols/2) - 15;
    const cy = Math.floor(rows/2) - 10;
    p.cells.forEach(([x,y]) => {
      const gx = x + cx + (p.ox||0);
      const gy = y + cy + (p.oy||0);
      if (gx>=0 && gx<cols && gy>=0 && gy<rows) grid[idx(gx,gy)] = 1;
    });
  }
  draw();
}

// ── MOUSE/TOUCH DRAWING ──
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return [
    Math.floor((clientX - r.left) / CELL),
    Math.floor((clientY - r.top) / CELL)
  ];
}

if (canvas) {
  canvas.addEventListener('mousedown', e => {
    const [x,y] = canvasPos(e);
    if (x>=0&&x<cols&&y>=0&&y<rows) {
      drawValue = grid[idx(x,y)] ? 0 : 1;
      grid[idx(x,y)] = drawValue;
      isDrawing = true;
      draw();
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const [x,y] = canvasPos(e);
    if (x>=0&&x<cols&&y>=0&&y<rows) { grid[idx(x,y)] = drawValue; draw(); }
  });
  canvas.addEventListener('mouseup', () => isDrawing = false);
  canvas.addEventListener('mouseleave', () => isDrawing = false);
}

// ── CONTROLS ──
document.addEventListener('DOMContentLoaded', () => {
  const btnPlay = document.getElementById('btn-play');
  const btnStep = document.getElementById('btn-step');
  const btnClear = document.getElementById('btn-clear');
  const speedSelect = document.getElementById('speed-select');
  
  if (btnPlay) btnPlay.addEventListener('click', toggleRun);
  if (btnStep) btnStep.addEventListener('click', () => { if(!running){step();draw();} });
  if (btnClear) btnClear.addEventListener('click', () => {
    if (!grid) return;
    grid.fill(0); generation=0;
    const genEl1 = document.getElementById('gen-count');
    const genEl2 = document.getElementById('gen-count2');
    if (genEl1) genEl1.textContent=0;
    if (genEl2) genEl2.textContent=0;
    draw();
  });
  if (speedSelect) speedSelect.addEventListener('change', e => {
    interval = +e.target.value;
  });

  document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pattern-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadPattern(btn.dataset.pattern);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  HERO BACKGROUND
// ═══════════════════════════════════════════════════════════
function initHero() {
  const hc = document.getElementById('hero-canvas');
  if (!hc) return;
  const hctx = hc.getContext('2d');
  hc.width = window.innerWidth;
  hc.height = window.innerHeight;
  const hcols = Math.floor(hc.width/14);
  const hrows = Math.floor(hc.height/14);
  let hgrid = new Uint8Array(hcols*hrows);
  let hnext = new Uint8Array(hcols*hrows);
  for (let i=0;i<hgrid.length;i++) hgrid[i]=Math.random()<0.3?1:0;

  function hstep(){
    for(let y=0;y<hrows;y++){
      for(let x=0;x<hcols;x++){
        let n=0;
        for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
          if(dx||dy){
            const nx=(x+dx+hcols)%hcols, ny=(y+dy+hrows)%hrows;
            n+=hgrid[ny*hcols+nx];
          }
        }
        const a=hgrid[y*hcols+x];
        hnext[y*hcols+x]=a?(n===2||n===3?1:0):(n===3?1:0);
      }
    }
    [hgrid,hnext]=[hnext,hgrid];
  }

  function hdraw(){
    hctx.fillStyle='#0a0a0f';
    hctx.fillRect(0,0,hc.width,hc.height);
    hctx.fillStyle='#00ff9d';
    for(let y=0;y<hrows;y++) for(let x=0;x<hcols;x++)
      if(hgrid[y*hcols+x]) hctx.fillRect(x*14+1,y*14+1,12,12);
  }

  function hloop(){hstep();hdraw();requestAnimationFrame(hloop);}
  hloop();
}

// ═══════════════════════════════════════════════════════════
//  MINI PATTERN CANVASES
// ═══════════════════════════════════════════════════════════
const showcaseData = [
  { name:'Блок', type:'Стабильная', desc:'Цикл длиной 1. Простейшая устойчивая структура.',
    cells:[[0,0],[1,0],[0,1],[1,1]], size:6, w:4, h:4 },
  { name:'Мигалка', type:'Периодическая (T=2)', desc:'Осциллирует между горизонтальной и вертикальной ориентацией.',
    cells:[[1,0],[1,1],[1,2]], size:10, w:3, h:3 },
  { name:'Глайдер', type:'Космолёт', desc:'Перемещается по диагонали на 1 клетку каждые 4 поколения.',
    cells:[[1,0],[2,1],[0,2],[1,2],[2,2]], size:10, w:3, h:3 },
  { name:'Улей', type:'Стабильная', desc:'Устойчивая структура из 6 клеток.',
    cells:[[1,0],[2,0],[0,1],[3,1],[1,2],[2,2]], size:10, w:4, h:3 },
  { name:'Пульсар', type:'Периодическая (T=3)', desc:'Один из самых распространённых осцилляторов.',
    cells:[[2,0],[3,0],[4,0],[8,0],[9,0],[10,0],[0,2],[5,2],[7,2],[12,2],[0,3],[5,3],[7,3],[12,3],[0,4],[5,4],[7,4],[12,4],[2,5],[3,5],[4,5],[8,5],[9,5],[10,5],[2,7],[3,7],[4,7],[8,7],[9,7],[10,7],[0,8],[5,8],[7,8],[12,8],[0,9],[5,9],[7,9],[12,9],[0,10],[5,10],[7,10],[12,10],[2,12],[3,12],[4,12],[8,12],[9,12],[10,12]],
    size:5, w:13, h:13 },
  { name:'Глайдер-пушка', type:'Пушка', desc:'Генерирует поток глайдеров. 1 глайдер каждые 30 поколений.',
    cells:[[0,4],[0,5],[1,4],[1,5],[10,4],[10,5],[10,6],[11,3],[11,7],[12,2],[12,8],[13,2],[13,8],[14,5],[15,3],[15,7],[16,4],[16,5],[16,6],[17,5],[20,2],[20,3],[20,4],[21,2],[21,3],[21,4],[22,1],[22,5],[24,0],[24,1],[24,5],[24,6],[34,2],[34,3],[35,2],[35,3]],
    size:4, w:36, h:11 },
  { name:'Поглотитель', type:'Стабильная', desc:'Поглощает глайдер и возвращается в исходное состояние.',
    cells:[[0,0],[1,0],[0,1],[2,1],[2,2],[3,2],[3,3]], size:10, w:4, h:4 },
  { name:'LWSS', type:'Космолёт (T=4)', desc:'Лёгкий космолёт. Движется горизонтально.',
    cells:[[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]], size:10, w:5, h:4 }
];

function buildShowcase() {
  const container = document.getElementById('patterns-showcase');
  if (!container) return;
  
  showcaseData.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pattern-card';

    const wrap = document.createElement('div');
    wrap.className = 'mini-canvas-wrap';
    const mc = document.createElement('canvas');
    mc.className = 'mini-canvas';
    const S = p.size;
    mc.width = (p.w+2)*S;
    mc.height = (p.h+2)*S;
    const mctx = mc.getContext('2d');

    function drawMini(g) {
      mctx.fillStyle = '#0d0d14';
      mctx.fillRect(0,0,mc.width,mc.height);
      g.forEach(([x,y]) => {
        mctx.fillStyle = '#00ff9d';
        mctx.fillRect((x+1)*S+1, (y+1)*S+1, S-1, S-1);
      });
    }

    const animated = ['Глайдер', 'Мигалка', 'Пульсар', 'Глайдер-пушка', 'LWSS'];
    if (animated.includes(p.name)) {
      const acols = p.w+2, arows = p.h+2;
      let ag = new Uint8Array(acols*arows);
      let ang = new Uint8Array(acols*arows);
      p.cells.forEach(([x,y]) => { if(x<acols-2&&y<arows-2) ag[(y+1)*acols+(x+1)]=1; });

      function astep() {
        for(let y=0;y<arows;y++) for(let x=0;x<acols;x++){
          let n=0;
          for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
            if(dx||dy){const nx=(x+dx+acols)%acols,ny=(y+dy+arows)%arows;n+=ag[ny*acols+nx];}
          }
          const a=ag[y*acols+x];
          ang[y*acols+x]=a?(n===2||n===3?1:0):(n===3?1:0);
        }
        [ag,ang]=[ang,ag];
      }

      function adraw() {
        mctx.fillStyle='#0d0d14';
        mctx.fillRect(0,0,mc.width,mc.height);
        for(let y=0;y<arows;y++) for(let x=0;x<acols;x++)
          if(ag[y*acols+x]){mctx.fillStyle='#00ff9d';mctx.fillRect(x*S+1,y*S+1,S-1,S-1);}
      }

      let tick=0;
      function aloop(){
        tick++;
        if(tick%8===0){astep();adraw();}
        requestAnimationFrame(aloop);
      }
      adraw(); aloop();
    } else {
      drawMini(p.cells);
    }

    wrap.appendChild(mc);
    card.innerHTML = `<h4>${p.name}</h4><div class="pattern-type">${p.type}</div>`;
    card.appendChild(wrap);
    const pdesc = document.createElement('p');
    pdesc.textContent = p.desc;
    card.appendChild(pdesc);

    container.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════
//  LOGIC GATES
// ═══════════════════════════════════════════════════════════
function buildGates() {
  const container = document.getElementById('gates-grid');
  if (!container) return;
  
  const gates = [
    { name:'NOT', inputs:1, fn:([a])=>a?0:1, label:'NOT X', color:'#7c3aed' },
    { name:'AND', inputs:2, fn:([a,b])=>a&&b?1:0, label:'X AND Y', color:'#00ff9d' },
    { name:'OR', inputs:2, fn:([a,b])=>a||b?1:0, label:'X OR Y', color:'#f59e0b' },
    { name:'NAND', inputs:2, fn:([a,b])=>!(a&&b)?1:0, label:'X NAND Y', color:'#ef4444' },
    { name:'NOR', inputs:2, fn:([a,b])=>!(a||b)?1:0, label:'X NOR Y', color:'#06b6d4' },
    { name:'XOR', inputs:2, fn:([a,b])=>a!==b?1:0, label:'X XOR Y', color:'#ec4899' },
  ];

  gates.forEach(gate => {
    const card = document.createElement('div');
    card.className = 'gate-card';
    const vals = new Array(gate.inputs).fill(0);

    function render() {
      card.innerHTML = '';
      const h4 = document.createElement('h4');
      h4.innerHTML = `<span style="color:${gate.color}">${gate.name}</span> вентиль`;
      card.appendChild(h4);

      const demo = document.createElement('div');
      demo.className = 'gate-demo';

      const inp = document.createElement('div');
      inp.className = 'gate-input';
      const labels = ['X','Y'];
      vals.forEach((v,i) => {
        const row = document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:0.4rem;';
        const lbl = document.createElement('span');
        lbl.style.cssText='font-size:0.7rem;color:var(--text-dim);width:12px;';
        lbl.textContent = labels[i];
        const btn = document.createElement('button');
        btn.className = 'toggle-btn' + (v?' on':'');
        btn.textContent = v;
        btn.addEventListener('click', () => {
          vals[i] = vals[i]?0:1;
          render();
        });
        row.appendChild(lbl);
        row.appendChild(btn);
        inp.appendChild(row);
      });

      const arr = document.createElement('div');
      arr.className='gate-arrow'; arr.textContent='→';

      const out = gate.fn(vals);
      const outEl = document.createElement('div');
      outEl.className='gate-output'+(out?' on':'');
      outEl.textContent=out;

      demo.appendChild(inp);
      demo.appendChild(arr);
      demo.appendChild(outEl);
      card.appendChild(demo);

      const formula = document.createElement('div');
      formula.style.cssText='font-size:0.75rem;color:var(--text-dim);margin-top:0.5rem;';
      const inputStr = vals.slice(0,gate.inputs).join(', ');
      formula.innerHTML = `<span style="color:${gate.color}">${gate.name}</span>(${inputStr}) = <strong style="color:${out?'var(--accent)':'var(--text-dim)'}">${out}</strong>`;
      card.appendChild(formula);
    }

    render();
    container.appendChild(card);
  });
}

// ── TRUTH TABLE ──
function buildTruthTable() {
  const tbody = document.getElementById('truth-tbody');
  if (!tbody) return;
  
  for (let x=0;x<=1;x++) for (let y=0;y<=1;y++) {
    const tr = document.createElement('tr');
    const and=x&&y?1:0, or=x||y?1:0, nand=!(x&&y)?1:0, nor=!(x||y)?1:0, xor=x!==y?1:0;
    [x,y,and,or,nand,nor,xor].forEach(v=>{
      const td=document.createElement('td');
      td.textContent=v;
      td.className=v?'one':'zero';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
}

// ── SCROLL REVEAL ──
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  // Indique que la page est chargée (pour les fallbacks CSS)
  document.body.classList.add('loaded');
  
  initHero();
  initCanvas();
  buildShowcase();
  buildGates();
  buildTruthTable();
  initReveal();
  loadPattern('glider');
  draw();
});