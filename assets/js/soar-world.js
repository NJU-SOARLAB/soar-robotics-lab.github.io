/*
 * SOARLAB 3D world
 *
 * A low-poly flight range rendered behind every page. The SOAR flying humanoid
 * cruises on autopilot (next to the hero on the homepage). Any [data-soar-play]
 * element, the floating mascot, or the hero logo turns the page into a playable
 * 3D shooter: the page fades away and the visitor flies the robot through
 * research problems, form gates, and three bosses.
 *
 * three.js (r170) is loaded lazily from ./three/three.module.min.js.
 */

const doc = document.documentElement;
const host = document.getElementById("soar-world");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const touchDevice = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
const isZh = (doc.lang || "").toLowerCase().startsWith("zh") || window.location.pathname.startsWith("/zh/");
const isHome = document.body.classList.contains("soar-page-home");
const saveData = Boolean(navigator.connection && navigator.connection.saveData);
const BEST_KEY = "soarlab-world-best";
const SOUND_KEY = "soarlab-world-sound";
const ROBOT_MODEL_URL = "/assets/models/soar-robot.glb?v=2026-10-31";

const TEXT = isZh
  ? {
      kicker: "SOARLAB 隐藏关卡",
      title: "飞行通用智能 · 科研通关",
      summary: "驾驶 SOAR 飞行人形机器人，在主页背后的试飞场里击破科研难题：审稿人 2 号、代码 Bug、DDL 陨石……最终攻下发表城堡。",
      controls: [
        ["WASD / 方向键 / 鼠标", "移动（自动射击）"],
        ["F / Shift", "切换飞行 / 行走形态"],
        ["空格 / E", "Agent 冲击波：清屏，需要充能"],
        ["P · M · Esc", "暂停 · 音效 · 回到主页"],
      ],
      touchControls: [
        ["拖动屏幕", "移动（自动射击）"],
        ["变形", "切换飞行 / 行走形态"],
        ["冲击波", "清屏，需要充能"],
      ],
      forms:
        "飞行形态：快，双联光束，可穿过空中试飞门为冲击波充能。行走形态：慢，重炮自动俯仰瞄准，可通过地面装配区修复生命；飞行形态撞上装配区会受损。",
      loading: "正在加载 3D 场景……",
      noWebgl: "当前浏览器不支持 WebGL，暂时无法运行 3D 小游戏。",
      start: "开始",
      restart: "再来一局",
      resume: "继续",
      exit: "回到主页",
      paused: "已暂停",
      score: "SCORE",
      best: "最高分",
      kills: "击破",
      timeLabel: "用时",
      newBest: "新纪录！",
      wave: "第 {n} 关",
      lives: "生命",
      pulse: "冲击波",
      flight: "飞行",
      walk: "行走",
      transformBtn: "变形",
      pulseBtn: "冲击波",
      pause: "暂停",
      sound: "音效",
      combo: "{n} 连击 · ×{m}",
      airGate: "空中试飞门",
      groundGate: "地面装配区",
      gateAirClear: "试飞门通过 · 冲击波 +1",
      gateGroundClear: "装配完成 · 生命 +1",
      gateCrash: "飞行形态撞上装配区！",
      gateMiss: "错过试飞门",
      bossIncoming: "{name} 来袭！",
      bossDown: "{name} 已击破！",
      stageStart: "第 {n} 关",
      pulseEmpty: "冲击波未充能：穿过空中试飞门",
      formFlight: "飞行形态",
      formWalk: "行走形态",
      powers: {
        coffee: ["咖啡", "生命 +1"],
        token: ["AI Token", "散射 8 秒"],
        shield: ["护盾", "6 秒无敌"],
        gpu: ["GPU 加速", "射速提升 8 秒"],
      },
      winTitle: "论文接收！",
      winText: "发表城堡已攻下，飞行通用智能又往前推了一步。",
      loseTitle: "这次被拒稿了",
      loseText: "换个 baseline，再投一次。",
    }
  : {
      kicker: "SOARLAB hidden level",
      title: "SOAR Research Flight",
      summary:
        "Fly the SOAR humanoid through the test range behind this page. Clear Reviewer #2, code bugs, and deadline meteors, then take the Publish Citadel.",
      controls: [
        ["WASD / arrows / mouse", "Move (auto-fire)"],
        ["F / Shift", "Switch flight / walk form"],
        ["Space / E", "Agent Pulse: clears the screen, needs charge"],
        ["P · M · Esc", "Pause · sound · back to page"],
      ],
      touchControls: [
        ["Drag", "Move (auto-fire)"],
        ["Transform", "Switch flight / walk form"],
        ["Pulse", "Clear the screen, needs charge"],
      ],
      forms:
        "Flight form: fast twin beams; fly through aerial test gates to charge the Pulse. Walk form: slower heavy cannon that aims itself; drive through ground assembly bays to repair. Hitting a bay in flight form hurts.",
      loading: "Loading the 3D scene…",
      noWebgl: "This browser does not support WebGL, so the 3D game cannot run here.",
      start: "Start",
      restart: "Play again",
      resume: "Resume",
      exit: "Back to page",
      paused: "Paused",
      score: "SCORE",
      best: "Best",
      kills: "Cleared",
      timeLabel: "Time",
      newBest: "New best!",
      wave: "STAGE {n}",
      lives: "Lives",
      pulse: "Pulse",
      flight: "Flight",
      walk: "Walk",
      transformBtn: "Transform",
      pulseBtn: "Pulse",
      pause: "Pause",
      sound: "Sound",
      combo: "{n} combo · ×{m}",
      airGate: "Aerial Test Gate",
      groundGate: "Ground Assembly Bay",
      gateAirClear: "Gate cleared · Pulse +1",
      gateGroundClear: "Bay cleared · Life +1",
      gateCrash: "Flight form crashed into the bay!",
      gateMiss: "Missed the gate",
      bossIncoming: "{name} incoming!",
      bossDown: "{name} defeated!",
      stageStart: "Stage {n}",
      pulseEmpty: "No Pulse charge: fly through a test gate",
      formFlight: "Flight form",
      formWalk: "Walk form",
      powers: {
        coffee: ["Coffee", "Life +1"],
        token: ["AI Token", "Spread shot 8s"],
        shield: ["Shield", "Invincible 6s"],
        gpu: ["GPU Boost", "Rapid fire 8s"],
      },
      winTitle: "Accepted!",
      winText: "The Publish Citadel has fallen. Flying general intelligence moves forward.",
      loseTitle: "Rejected this time",
      loseText: "Try another baseline and resubmit.",
    };

const ENEMY_TYPES = {
  knot: { zh: "研究难题", en: "Research Knot", hp: 1, radius: 0.85, score: 12, color: "#39c3d6" },
  bug: { zh: "代码 Bug", en: "Code Bug", hp: 1, radius: 0.75, score: 14, color: "#7ddc6a", ground: true, zigzag: true },
  reviewer: { zh: "审稿人 2 号", en: "Reviewer #2", hp: 2, radius: 0.9, score: 22, color: "#ff4b3a", hover: true, shooter: "aimed" },
  meteor: { zh: "DDL 陨石", en: "Deadline Meteor", hp: 2, radius: 0.95, score: 24, color: "#ff8a3c", fast: true },
  data: { zh: "数据混乱", en: "Dataset Chaos", hp: 2, radius: 1.0, score: 22, color: "#b28cff" },
  gpu: { zh: "算力过热", en: "GPU Overheat", hp: 4, radius: 1.05, score: 34, color: "#ff3b2f", hover: true, shooter: "spread" },
  grad: { zh: "毕业压力", en: "Graduation Pressure", hp: 3, radius: 1.0, score: 30, color: "#f2b134" },
};

const BOSS_TYPES = {
  storm: { zh: "大修风暴", en: "Revision Storm", hp: 260, radius: 2.1, score: 600, color: "#b05cff" },
  dragon: { zh: "论文巨龙", en: "Thesis Dragon", hp: 380, radius: 1.35, score: 900, color: "#3fd08f" },
  citadel: { zh: "发表城堡", en: "Publish Citadel", hp: 560, radius: 2.0, score: 1500, color: "#ffc247", final: true },
};

const STAGES = [
  { pool: ["knot", "bug", "reviewer", "knot", "bug", "data"], every: 1.1, duration: 30, boss: "storm" },
  { pool: ["knot", "bug", "reviewer", "meteor", "data", "meteor", "gpu"], every: 0.95, duration: 32, boss: "dragon" },
  { pool: ["reviewer", "meteor", "data", "gpu", "grad", "bug", "knot", "grad"], every: 0.82, duration: 34, boss: "citadel" },
];

const PALETTES = {
  light: {
    skyTop: "#6cc2e0",
    skyHorizon: "#f5e7d5",
    skyBottom: "#e6d3bb",
    sunGlow: "#ffcf8a",
    fog: "#e9ebe6",
    fogNear: 70,
    fogFar: 250,
    hemiSky: "#e8f6ff",
    hemiGround: "#a08f6e",
    hemiIntensity: 1.5,
    sunLight: "#fff2de",
    sunIntensity: 1.9,
    rimLight: "#ffc98f",
    rimIntensity: 0.9,
    valley: "#cfe6e1",
    terrainLow: "#79bcab",
    terrainMid: "#a9cf9f",
    terrainHigh: "#f1e6d0",
    grid: "#1f8ea3",
    gridOpacity: 0.32,
    beacon: "#ff7a3d",
    cloud: "#ffffff",
    cloudOpacity: 0.92,
    stars: 0,
    motes: "#1f8ea3",
  },
  dark: {
    skyTop: "#02060f",
    skyHorizon: "#14374f",
    skyBottom: "#081723",
    sunGlow: "#2f6f9f",
    fog: "#0c2131",
    fogNear: 55,
    fogFar: 220,
    hemiSky: "#6b9cc8",
    hemiGround: "#0b1620",
    hemiIntensity: 1.15,
    sunLight: "#a9dcff",
    sunIntensity: 1.25,
    rimLight: "#ff9f6a",
    rimIntensity: 0.6,
    valley: "#0e2a37",
    terrainLow: "#123544",
    terrainMid: "#1c4a5a",
    terrainHigh: "#3c6e7d",
    grid: "#5fe3f0",
    gridOpacity: 0.48,
    beacon: "#ff8a4a",
    cloud: "#2a4a64",
    cloudOpacity: 0.5,
    stars: 1,
    motes: "#78e7ff",
  },
};

/* Helpers ------------------------------------------------------------------- */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? values[key] : ""));
const themeName = () => (doc.getAttribute("data-theme") === "dark" ? "dark" : "light");

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      /* storage unavailable */
    }
  },
};

const hash2 = (x, y) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const valueNoise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

const fbm = (x, y) => {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let octave = 0; octave < 4; octave += 1) {
    sum += amplitude * valueNoise(x * frequency, y * frequency);
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return sum / 0.9375;
};

/* Sound --------------------------------------------------------------------- */

const audio = { context: null, master: null, enabled: storage.get(SOUND_KEY) !== "off", lastShot: 0 };

const ensureAudio = () => {
  if (!audio.enabled) return null;
  if (!audio.context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audio.context = new AudioContextClass();
    audio.master = audio.context.createGain();
    audio.master.gain.value = 0.16;
    audio.master.connect(audio.context.destination);
  }
  if (audio.context.state === "suspended") audio.context.resume();
  return audio.context;
};

const tone = (frequency, duration, { type = "square", volume = 0.3, slide = 0, delay = 0 } = {}) => {
  const context = ensureAudio();
  if (!context) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
};

const noise = (duration, { volume = 0.3, cutoff = 1200, delay = 0 } = {}) => {
  const context = ensureAudio();
  if (!context) return;
  const start = context.currentTime + delay;
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(audio.master);
  source.start(start);
};

const sfx = {
  shoot(heavy) {
    const now = performance.now();
    if (now - audio.lastShot < 90) return;
    audio.lastShot = now;
    if (heavy) tone(190, 0.14, { type: "sawtooth", volume: 0.09, slide: -110 });
    else tone(980, 0.05, { type: "square", volume: 0.035, slide: -420 });
  },
  boom(big) {
    noise(big ? 0.7 : 0.26, { volume: big ? 0.55 : 0.22, cutoff: big ? 650 : 1500 });
    if (big) tone(90, 0.6, { type: "sine", volume: 0.35, slide: -50 });
  },
  hit() {
    tone(320, 0.28, { type: "sawtooth", volume: 0.22, slide: -230 });
    noise(0.22, { volume: 0.28, cutoff: 900 });
  },
  power() {
    [523, 659, 784, 1046].forEach((frequency, index) => tone(frequency, 0.1, { type: "triangle", volume: 0.16, delay: index * 0.06 }));
  },
  transform() {
    tone(240, 0.26, { type: "sine", volume: 0.2, slide: 480 });
    noise(0.24, { volume: 0.1, cutoff: 2600 });
  },
  pulse() {
    tone(130, 0.7, { type: "sine", volume: 0.42, slide: -70 });
    noise(0.65, { volume: 0.32, cutoff: 520 });
  },
  slam() {
    tone(68, 0.5, { type: "sine", volume: 0.5, slide: -28 });
    noise(0.42, { volume: 0.42, cutoff: 520 });
  },
  gate() {
    [660, 990].forEach((frequency, index) => tone(frequency, 0.11, { type: "triangle", volume: 0.18, delay: index * 0.08 }));
  },
  win() {
    [523, 659, 784, 1046, 1318].forEach((frequency, index) => tone(frequency, 0.18, { type: "triangle", volume: 0.2, delay: index * 0.11 }));
  },
  lose() {
    [392, 330, 262, 196].forEach((frequency, index) => tone(frequency, 0.22, { type: "sawtooth", volume: 0.12, delay: index * 0.14 }));
  },
};

/* Game UI (HUD + panel) ------------------------------------------------------ */

const ui = {
  root: null,
  refs: {},
  toastTimer: 0,
  panelState: "",
  handlers: {},
};

const buildUI = () => {
  if (ui.root) return;
  const root = document.createElement("div");
  root.className = "soar-game-ui";
  root.innerHTML = `
    <div class="soar-hud">
      <div class="soar-hud__flash"></div>
      <div class="soar-hud__bar">
        <div class="soar-hud__score soar-hud__glass">
          <small>${TEXT.score}</small>
          <strong data-hud="score">0</strong>
          <span class="soar-hud__combo" data-hud="combo"></span>
        </div>
        <div class="soar-hud__center">
          <span class="soar-hud__wave soar-hud__glass" data-hud="wave"></span>
          <div class="soar-hud__boss" data-hud="boss" hidden>
            <span data-hud="bossName"></span>
            <div class="soar-hud__boss-bar"><i data-hud="bossFill"></i></div>
          </div>
        </div>
        <div class="soar-hud__status soar-hud__glass">
          <span class="soar-hud__lives" data-hud="lives" title="${TEXT.lives}"></span>
          <span class="soar-hud__pulse" data-hud="pulse" title="${TEXT.pulse}"></span>
          <span class="soar-hud__form soar-hud__form--flight" data-hud="form"></span>
          <button class="soar-hud__icon" type="button" data-action="sound" aria-label="${TEXT.sound}">♪</button>
          <button class="soar-hud__icon" type="button" data-action="pause" aria-label="${TEXT.pause}">❚❚</button>
          <button class="soar-hud__icon" type="button" data-action="exit" aria-label="${TEXT.exit}">✕</button>
        </div>
      </div>
      <div class="soar-hud__powers" data-hud="powers"></div>
      <div class="soar-hud__toast" data-hud="toast" aria-live="polite"></div>
      <div class="soar-hud__touch">
        <button class="soar-hud__btn--transform" type="button" data-action="transform">${TEXT.transformBtn}</button>
        <button class="soar-hud__btn--pulse" type="button" data-action="pulse">${TEXT.pulseBtn}</button>
      </div>
    </div>
    <section class="soar-panel" role="dialog" aria-modal="true" aria-labelledby="soar-panel-title">
      <p class="soar-panel__kicker">${TEXT.kicker}</p>
      <h2 id="soar-panel-title" data-panel="title"></h2>
      <p class="soar-panel__text" data-panel="text"></p>
      <dl class="soar-panel__controls" data-panel="controls"></dl>
      <p class="soar-panel__forms" data-panel="forms"></p>
      <p class="soar-panel__stats" data-panel="stats"></p>
      <div class="soar-panel__actions">
        <button class="soar-panel__primary" type="button" data-action="primary"></button>
        <button type="button" data-action="exit">${TEXT.exit}</button>
      </div>
    </section>
  `;
  document.body.appendChild(root);
  ui.root = root;
  root.querySelectorAll("[data-hud]").forEach((element) => {
    ui.refs[element.dataset.hud] = element;
  });
  root.querySelectorAll("[data-panel]").forEach((element) => {
    ui.refs[`panel_${element.dataset.panel}`] = element;
  });
  ui.refs.primary = root.querySelector('[data-action="primary"]');
  ui.refs.soundButton = root.querySelector('[data-action="sound"]');
  ui.refs.soundButton.classList.toggle("soar-hud__icon--off", !audio.enabled);
  root.classList.toggle("soar-game-ui--touch", touchDevice);

  const controls = touchDevice ? TEXT.touchControls : TEXT.controls;
  ui.refs.panel_controls.innerHTML = controls.map(([key, label]) => `<dt>${key}</dt><dd>${label}</dd>`).join("");
  ui.refs.panel_forms.textContent = TEXT.forms;

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "transform" || action === "pulse") return;
    ui.handlers[action]?.();
  });
  // Touch buttons react on pointerdown so they feel instant.
  root.querySelectorAll('[data-action="transform"], [data-action="pulse"]').forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      ui.handlers[button.dataset.action]?.();
    });
  });
};

const showPanel = (state, data = {}) => {
  buildUI();
  ui.panelState = state;
  const { refs } = ui;
  const showGuide = state === "menu" || state === "paused";
  refs.panel_controls.hidden = !showGuide;
  refs.panel_forms.hidden = state !== "menu";
  refs.panel_stats.hidden = !data.stats;
  refs.panel_stats.innerHTML = data.stats || "";
  refs.primary.hidden = state === "error";
  refs.primary.disabled = state === "loading";
  const titles = {
    loading: [TEXT.title, TEXT.loading, TEXT.start],
    error: [TEXT.title, TEXT.noWebgl, TEXT.start],
    menu: [TEXT.title, TEXT.summary, TEXT.start],
    paused: [TEXT.paused, "", TEXT.resume],
    over: [data.title || "", data.text || "", TEXT.restart],
  };
  const [title, text, primary] = titles[state] || titles.menu;
  refs.panel_title.textContent = title;
  refs.panel_text.textContent = text;
  refs.panel_text.hidden = !text;
  refs.primary.textContent = primary;
  ui.root.classList.add("soar-game-ui--panel");
  window.setTimeout(() => {
    if (ui.panelState === state && !refs.primary.hidden) refs.primary.focus({ preventScroll: true });
  }, 60);
};

const hidePanel = () => {
  if (!ui.root) return;
  ui.panelState = "";
  ui.root.classList.remove("soar-game-ui--panel");
};

const showToast = (message, duration = 1.7) => {
  if (!ui.refs.toast) return;
  ui.refs.toast.textContent = message;
  ui.refs.toast.classList.add("soar-hud__toast--show");
  window.clearTimeout(ui.toastTimer);
  ui.toastTimer = window.setTimeout(() => ui.refs.toast.classList.remove("soar-hud__toast--show"), duration * 1000);
};

const enterPage = () => {
  buildUI();
  document.body.classList.add("soar-in-game");
};

const leavePage = () => {
  document.body.classList.remove("soar-in-game");
  if (ui.root) ui.root.classList.remove("soar-game-ui--panel", "soar-game-ui--hud");
  hidePanel();
};

/* Page ⇄ world transition ---------------------------------------------------
 * Entering the game: the visible page splits into 3D sheets (navbar, hero,
 * sections, footer) that lift toward the viewer, then slam backward onto the
 * ground and lie flat as the runway of the game scene before fading into it.
 * Leaving the game plays the reverse: the floor stands back up into the page.
 */
const SLAM_MS = 1700;
const SLAM_IMPACT = 0.68;
const RISE_MS = 1100;
let pageFlipping = false;

const collectPagePieces = () => {
  const viewportHeight = window.innerHeight;
  const pieces = [];
  const add = (element, depth) => {
    if (!element) return;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    if (rect.bottom < 0 || rect.top > viewportHeight) {
      pieces.push({ element, offscreen: true });
      return;
    }
    pieces.push({ element, rect, depth });
  };
  const main = document.querySelector('body > .container[role="main"]');
  const home = document.body.classList.contains("soar-page-home");
  [...document.body.children].forEach((child) => {
    if (child === host || child.classList.contains("soar-game-ui")) return;
    if (["SCRIPT", "NOSCRIPT", "STYLE", "LINK", "TEMPLATE"].includes(child.tagName)) return;
    // The header only wraps the fixed navbar; transforming it would detach the navbar from the viewport.
    if (child.tagName === "HEADER") {
      add(child.querySelector("#navbar"), 1);
      return;
    }
    // On the homepage each section becomes its own sheet so they can separate in depth.
    if (home && child === main) return;
    add(child, child === main ? 0 : 1);
  });
  if (home && main) {
    main.querySelectorAll("article > .clearfix > *, article > section, article > .social").forEach((element, index) => add(element, 1 + index));
  }
  return pieces;
};

// One rigid sheet: every piece rotates about the bottom edge of the viewport and is
// projected with the same perspective centre, so the pieces move together.
const sheetTransform = (rect, angle, pop = 0, lift = 0, scale = 1, turn = 0) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const perspective = Math.round(clamp(height * 1.15, 700, 1400));
  const cx = width / 2 - rect.left;
  const cy = height * 0.45 - rect.top;
  const px = width / 2 - rect.left;
  const py = height - rect.top;
  return (
    `translate(${cx}px, ${cy}px) perspective(${perspective}px) translate(${-cx}px, ${-cy}px) ` +
    `translate(${px}px, ${py - lift}px) rotateX(${angle}deg) rotateY(${turn}deg) scale(${scale}) translate(${-px}px, ${-py}px) translateZ(${pop}px)`
  );
};

const slamFrames = (piece) => {
  const pop = 36 + piece.depth * 24;
  const frame = (offset, angle, depth, lift, scale, opacity, easing, turn = 0) => ({
    offset,
    transform: sheetTransform(piece.rect, angle, depth, lift, scale, turn),
    opacity,
    easing,
  });
  return [
    frame(0, 0, 0, 0, 1, 1, "cubic-bezier(.2,.75,.3,1)"),
    frame(0.27, -9, pop, 28, 0.94, 1, "linear", -7),
    frame(0.37, -7, pop * 1.1, 32, 0.94, 1, "cubic-bezier(.55,0,1,.45)", -5),
    frame(SLAM_IMPACT, 87, 0, 0, 1, 1, "cubic-bezier(.25,.8,.45,1)"),
    frame(0.74, 80, 0, 0, 1, 1, "cubic-bezier(.55,0,.85,.45)"),
    frame(0.79, 87, 0, 0, 1, 1, "ease-in"),
    frame(1, 87, 0, 0, 1, 0, "linear"),
  ];
};

const riseFrames = (piece) => {
  const frame = (offset, angle, depth, lift, scale, opacity, easing) => ({
    offset,
    transform: sheetTransform(piece.rect, angle, depth, lift, scale),
    opacity,
    easing,
  });
  return [
    frame(0, 87, 0, 0, 1, 0, "ease-out"),
    frame(0.2, 87, 0, 0, 1, 1, "cubic-bezier(.2,.7,.35,1)"),
    frame(0.72, -5, 24, 12, 0.97, 1, "ease-in-out"),
    frame(1, 0, 0, 0, 1, 1, "linear"),
  ];
};

const animatePieces = (pieces, framesFor, duration) =>
  pieces.map((piece) => {
    const { element } = piece;
    if (piece.offscreen) {
      element.style.visibility = "hidden";
      return null;
    }
    element.classList.add("soar-sheet");
    element.style.transformOrigin = "0 0";
    const viewportHeight = window.innerHeight;
    if (piece.rect.height > viewportHeight * 1.2) {
      // Tall pages: only the visible slice becomes the sheet.
      const top = Math.max(0, -piece.rect.top);
      const bottom = Math.max(0, piece.rect.bottom - viewportHeight);
      element.style.clipPath = `inset(${top}px 0 ${bottom}px 0)`;
    }
    return element.animate(framesFor(piece), { duration, fill: "both" });
  });

const resetPieces = (pieces, animations) => {
  animations.forEach((animation) => animation?.cancel());
  pieces.forEach(({ element }) => {
    element.classList.remove("soar-sheet");
    element.style.removeProperty("transform-origin");
    element.style.removeProperty("clip-path");
    element.style.removeProperty("visibility");
  });
};

const slamPage = (onImpact) =>
  new Promise((resolve) => {
    pageFlipping = true;
    buildUI();
    document.body.classList.add("soar-page-flipping");
    const pieces = collectPagePieces();
    const animations = animatePieces(pieces, slamFrames, SLAM_MS);
    window.setTimeout(() => onImpact?.(), SLAM_MS * SLAM_IMPACT);
    Promise.all(animations.map((animation) => animation?.finished.catch(() => null))).then(() => {
      enterPage();
      resetPieces(pieces, animations);
      document.body.classList.remove("soar-page-flipping");
      pageFlipping = false;
      resolve();
    });
  });

const risePage = () =>
  new Promise((resolve) => {
    pageFlipping = true;
    document.body.classList.add("soar-page-flipping");
    leavePage();
    const pieces = collectPagePieces();
    const animations = animatePieces(pieces, riseFrames, RISE_MS);
    Promise.all(animations.map((animation) => animation?.finished.catch(() => null))).then(() => {
      resetPieces(pieces, animations);
      document.body.classList.remove("soar-page-flipping");
      pageFlipping = false;
      resolve();
    });
  });

/* World ---------------------------------------------------------------------- */

function createWorld(THREE) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch (_error) {
    return null;
  }
  if (!renderer.getContext()) return null;

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 60, 230);
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 700);
  camera.position.set(0, 5, 11);

  const toColors = (palette) =>
    Object.fromEntries(Object.entries(palette).map(([key, value]) => [key, typeof value === "string" ? new THREE.Color(value) : value]));
  const palettes = { light: toColors(PALETTES.light), dark: toColors(PALETTES.dark) };
  let palette = palettes[themeName()];

  /* Lights */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(24, 40, 36);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xffd2a0, 0.8);
  rim.position.set(-30, 18, -60);
  scene.add(rim);

  /* Sky */
  const skyUniforms = {
    top: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
    bottom: { value: new THREE.Color() },
    sunColor: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(-0.38, 0.16, -1).normalize() },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 horizon;
        uniform vec3 bottom;
        uniform vec3 sunColor;
        uniform vec3 sunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 color = mix(horizon, top, smoothstep(0.0, 0.62, h));
          color = mix(color, bottom, smoothstep(0.0, -0.25, h));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          color += sunColor * (pow(s, 64.0) * 0.9 + pow(s, 5.0) * 0.24);
          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }`,
    })
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i += 1) {
    const theta = rand(0, Math.PI * 2);
    const phi = Math.acos(rand(0.05, 1));
    starPositions.set([Math.sin(phi) * Math.cos(theta) * 450, Math.cos(phi) * 450, Math.sin(phi) * Math.sin(theta) * 450], i * 3);
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false, depthWrite: false })
  );
  stars.frustumCulled = false;
  scene.add(stars);

  /* Terrain */
  const CHUNK_LEN = 80;
  const CHUNK_W = 220;
  const CHUNK_COUNT = 4;
  const GROUND_Y = 0.98;
  const terrainMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const scratchColor = new THREE.Color();

  const heightAt = (x, s) => {
    const ax = Math.abs(x);
    const side = smoothstep(12, 34, ax);
    if (side <= 0) return -0.12;
    const n = fbm(x * 0.032 + 17.1, s * 0.032);
    const far = smoothstep(42, 100, ax);
    return -0.12 + side * (1.5 + n * n * 30 + far * 26 * n);
  };

  const colorForHeight = (h, out) => {
    if (h < 0.4) return out.copy(palette.valley);
    if (h < 9) return out.lerpColors(palette.terrainLow, palette.terrainMid, (h - 0.4) / 8.6);
    if (h < 24) return out.lerpColors(palette.terrainMid, palette.terrainHigh, (h - 9) / 15);
    return out.copy(palette.terrainHigh);
  };

  const paintChunk = (chunk) => {
    const colors = chunk.mesh.geometry.attributes.color;
    for (let v = 0; v < colors.count; v += 1) {
      colorForHeight(chunk.heights[v], scratchColor);
      colors.setXYZ(v, scratchColor.r, scratchColor.g, scratchColor.b);
    }
    colors.needsUpdate = true;
  };

  const buildChunk = (chunk) => {
    const position = chunk.mesh.geometry.attributes.position;
    for (let v = 0; v < position.count; v += 1) {
      const s = chunk.index * CHUNK_LEN - position.getZ(v);
      const h = heightAt(position.getX(v), s);
      position.setY(v, h);
      chunk.heights[v] = h;
    }
    position.needsUpdate = true;
    chunk.mesh.geometry.computeBoundingSphere();
    paintChunk(chunk);
  };

  const chunks = [];
  for (let i = 0; i < CHUNK_COUNT; i += 1) {
    const geometry = new THREE.PlaneGeometry(CHUNK_W, CHUNK_LEN, 66, 26);
    geometry.rotateX(-Math.PI / 2);
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
    const mesh = new THREE.Mesh(geometry, terrainMaterial);
    scene.add(mesh);
    const chunk = { mesh, index: i, heights: new Float32Array(geometry.attributes.position.count) };
    buildChunk(chunk);
    chunks.push(chunk);
  }

  /* Test-range grid and beacons */
  const gridPositions = [];
  for (let x = -10.5; x <= 10.51; x += 3.5) gridPositions.push(x, 0.02, 30, x, 0.02, -265);
  for (let z = 30; z >= -265; z -= 5) gridPositions.push(-10.5, 0.02, z, 10.5, 0.02, z);
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
  const gridMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.3 });
  const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
  scene.add(grid);

  const beaconMaterial = new THREE.MeshBasicMaterial();
  const beacons = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), beaconMaterial, 62);
  const beaconMatrix = new THREE.Matrix4();
  let beaconIndex = 0;
  for (let z = 30; z >= -270 && beaconIndex < 62; z -= 10) {
    [-11.6, 11.6].forEach((x) => {
      if (beaconIndex >= 62) return;
      beaconMatrix.makeTranslation(x, 0.2, z);
      beacons.setMatrixAt(beaconIndex, beaconMatrix);
      beaconIndex += 1;
    });
  }
  beacons.count = beaconIndex;
  beacons.instanceMatrix.needsUpdate = true;
  beacons.frustumCulled = false;
  scene.add(beacons);

  /* Clouds */
  const cloudMaterial = new THREE.MeshLambertMaterial({ flatShading: true, transparent: true, opacity: 0.9 });
  const cloudGeometry = new THREE.IcosahedronGeometry(1, 1);
  const resetCloud = (cloud, z) => {
    const side = Math.random() < 0.5 ? -1 : 1;
    cloud.position.set(side * rand(22, 120), rand(14, 42), z);
    cloud.scale.setScalar(rand(0.8, 1.7));
  };
  const clouds = Array.from({ length: 12 }, () => {
    const cloud = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < puffs; j += 1) {
      const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
      const size = rand(1.6, 3.2);
      puff.position.set(j * 2.2 - puffs, Math.random() * 1.2, Math.random() * 1.5);
      puff.scale.set(size * 1.3, size * 0.72, size);
      cloud.add(puff);
    }
    resetCloud(cloud, rand(-290, 20));
    scene.add(cloud);
    return cloud;
  });

  /* Motes: drifting data specks that sell the speed */
  const MOTES = 240;
  const motePositions = new Float32Array(MOTES * 3);
  for (let i = 0; i < MOTES; i += 1) motePositions.set([rand(-28, 28), rand(0.5, 18), rand(-220, 20)], i * 3);
  const moteGeometry = new THREE.BufferGeometry();
  moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMaterial = new THREE.PointsMaterial({ size: 0.13, transparent: true, opacity: 0.6, depthWrite: false });
  const motes = new THREE.Points(moteGeometry, moteMaterial);
  motes.frustumCulled = false;
  scene.add(motes);

  /* Shared textures and helpers */
  const radialTexture = (stops, size = 64) => {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = size;
    textureCanvas.height = size;
    const context = textureCanvas.getContext("2d");
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };
  const glowTexture = radialTexture([
    [0, "rgba(255,255,255,1)"],
    [0.22, "rgba(255,255,255,0.6)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  const shadowTexture = radialTexture([
    [0, "rgba(0,0,0,0.55)"],
    [1, "rgba(0,0,0,0)"],
  ]);

  const glowMaterials = new Map();
  const makeGlow = (color, scale, opacity = 0.85) => {
    const key = `${color}:${opacity}`;
    let material = glowMaterials.get(key);
    if (!material) {
      material = new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      glowMaterials.set(key, material);
    }
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(scale);
    return sprite;
  };

  const roundedRect = (context, x, y, width, height, radius) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  };

  const labelCache = new Map();
  const makeLabel = (text, tone = "default") => {
    const key = `${tone}:${text}`;
    let entry = labelCache.get(key);
    if (!entry) {
      const labelCanvas = document.createElement("canvas");
      const context = labelCanvas.getContext("2d");
      const font = '700 34px "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif';
      context.font = font;
      const width = Math.ceil(context.measureText(text).width) + 40;
      const height = 58;
      labelCanvas.width = width;
      labelCanvas.height = height;
      context.font = font;
      roundedRect(context, 2, 2, width - 4, height - 4, 26);
      context.fillStyle = tone === "boss" ? "rgba(72, 10, 10, 0.8)" : tone === "gate" ? "rgba(10, 34, 52, 0.78)" : "rgba(6, 20, 32, 0.74)";
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = tone === "boss" ? "rgba(255, 128, 96, 0.85)" : tone === "gate" ? "rgba(255, 196, 110, 0.75)" : "rgba(120, 229, 236, 0.6)";
      context.stroke();
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, width / 2, height / 2 + 1);
      const texture = new THREE.CanvasTexture(labelCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false, fog: false });
      entry = { material, aspect: width / height };
      labelCache.set(key, entry);
    }
    const sprite = new THREE.Sprite(entry.material);
    sprite.center.set(0.5, 0);
    const height = tone === "boss" ? 0.8 : 0.5;
    sprite.scale.set(height * entry.aspect, height, 1);
    sprite.renderOrder = 30;
    sprite.visible = mode !== "ambient";
    labels.add(sprite);
    return sprite;
  };
  const labels = new Set();

  /* Shared geometry and materials */
  const GEO = {
    sphere: new THREE.SphereGeometry(1, 18, 14),
    box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 10),
    cone: new THREE.ConeGeometry(1, 1, 10),
    knot: new THREE.TorusKnotGeometry(0.52, 0.16, 90, 10, 2, 3),
    rock: new THREE.DodecahedronGeometry(1, 0),
    ico: new THREE.IcosahedronGeometry(1, 0),
    ring: new THREE.TorusGeometry(1, 0.05, 8, 40),
    paper: new THREE.PlaneGeometry(0.85, 1.1),
    gateRing: new THREE.TorusGeometry(1.85, 0.14, 10, 56),
    gateDisc: new THREE.CircleGeometry(1.75, 40),
    bolt: new THREE.CapsuleGeometry(0.07, 0.7, 3, 8),
    heavy: new THREE.IcosahedronGeometry(0.3, 1),
    shot: new THREE.SphereGeometry(0.22, 12, 8),
    octa: new THREE.OctahedronGeometry(1, 0),
    crown: new THREE.CylinderGeometry(0.42, 0.48, 0.38, 16),
    coin: new THREE.CylinderGeometry(0.45, 0.45, 0.1, 28),
    mug: new THREE.CylinderGeometry(0.3, 0.26, 0.55, 18),
    handle: new THREE.TorusGeometry(0.16, 0.05, 8, 16),
  };

  const standard = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.15, ...options });
  const basic = (color, options = {}) => new THREE.MeshBasicMaterial({ color, ...options });
  const additive = (color, opacity = 0.9) =>
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: THREE.DoubleSide,
    });

  const paperTexture = (() => {
    const paperCanvas = document.createElement("canvas");
    paperCanvas.width = 128;
    paperCanvas.height = 166;
    const context = paperCanvas.getContext("2d");
    context.fillStyle = "#fbfaf6";
    context.fillRect(0, 0, 128, 166);
    context.fillStyle = "#9aa6ae";
    for (let y = 22; y < 150; y += 11) context.fillRect(12, y, rand(70, 104), 3);
    context.strokeStyle = "#e0322a";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(88, 70, 22, 0, Math.PI * 2);
    context.stroke();
    context.font = "800 20px system-ui, sans-serif";
    context.fillStyle = "#e0322a";
    context.save();
    context.translate(64, 128);
    context.rotate(-0.25);
    context.fillText("MAJOR REV.", -58, 6);
    context.restore();
    const texture = new THREE.CanvasTexture(paperCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })();

  const MAT = {
    knot: standard("#29b3c6", { emissive: "#0d5560", emissiveIntensity: 0.7, roughness: 0.32 }),
    bugShell: standard("#59c96b", { emissive: "#123d18", emissiveIntensity: 0.4 }),
    bugDark: standard("#1d3b25"),
    eyeWhite: standard("#f7f7f2", { roughness: 0.25 }),
    eyeRed: basic("#ff3b2f"),
    iris: standard("#2c6fd6", { roughness: 0.2 }),
    pupil: basic("#060a10"),
    navy: standard("#10304a", { roughness: 0.3, metalness: 0.3 }),
    redGlow: additive("#ff4b3a", 0.85),
    rock: standard("#4d3b31", { emissive: "#ff4a12", emissiveIntensity: 0.45, flatShading: true }),
    dataWire: new THREE.MeshBasicMaterial({ color: "#b28cff", wireframe: true }),
    cubes: ["#ffb248", "#29b3c6", "#e8562a", "#9be36b", "#b28cff"].map((color) => standard(color, { emissive: color, emissiveIntensity: 0.25 })),
    pcb: standard("#1d2a33", { roughness: 0.6 }),
    hot: standard("#ff3b2f", { emissive: "#ff2a1a", emissiveIntensity: 1.2 }),
    gold: standard("#f2b134", { metalness: 0.45, roughness: 0.3, emissive: "#7a4a00", emissiveIntensity: 0.4 }),
    capBlack: standard("#17171f", { roughness: 0.6 }),
    stormCore: standard("#ff3355", { emissive: "#ff1f4a", emissiveIntensity: 1.1 }),
    stormRing: standard("#7b3fe4", { emissive: "#4f1fa8", emissiveIntensity: 0.9, roughness: 0.3 }),
    paper: new THREE.MeshBasicMaterial({ map: paperTexture, side: THREE.DoubleSide }),
    dragon: standard("#2a8f6a", { flatShading: true, roughness: 0.55 }),
    dragonLight: standard("#3fb585", { flatShading: true, roughness: 0.55 }),
    dragonSpike: standard("#f2b134", { flatShading: true }),
    dragonEye: basic("#ffe14a"),
    ringTeal: standard("#39c3d6", { emissive: "#1f8ea3", emissiveIntensity: 0.8 }),
    ringOrange: standard("#ff8a3c", { emissive: "#e8562a", emissiveIntensity: 0.8 }),
    shieldWire: new THREE.MeshBasicMaterial({
      color: "#7ff0ff",
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    gateAir: standard("#3fd8f0", { emissive: "#24b8d6", emissiveIntensity: 1.1 }),
    gateAirFill: additive("#57d8ff", 0.12),
    gateFrame: standard("#10304a", { roughness: 0.4 }),
    gateStripe: standard("#ffb248", { emissive: "#ff8a3c", emissiveIntensity: 1 }),
    gateGroundFill: additive("#ff9a4a", 0.2),
    bolt: basic("#bff8ff"),
    heavy: basic("#ffc56b"),
    shot: basic("#ff5a40"),
    mug: standard("#f4f1ea", { roughness: 0.3 }),
    coffee: basic("#5a3420"),
    chip: standard("#2f9e57", { emissive: "#1b6b38", emissiveIntensity: 0.5 }),
    shieldPower: new THREE.MeshBasicMaterial({ color: "#7ff0ff", wireframe: true }),
  };

  /* SOAR robot (flying humanoid, built from primitives) */
  const robotMaterials = {
    teal: standard("#2a9bb0", { roughness: 0.4 }),
    tealDark: standard("#1b6b80", { roughness: 0.45 }),
    navy: standard("#10304a", { roughness: 0.3, metalness: 0.3 }),
    orange: standard("#e8562a", { roughness: 0.45 }),
    wing: standard("#ee5d2c", { roughness: 0.5, side: THREE.DoubleSide }),
    wingInner: standard("#c43f19", { roughness: 0.5, side: THREE.DoubleSide }),
    visor: standard("#0a2034", { roughness: 0.12, metalness: 0.6 }),
    glow: basic("#ffc247"),
    flame: additive("#ff9a3c", 0.85),
    flameCore: additive("#fff1c2", 0.95),
  };

  // Rocket exhaust: a flame cone pointing down the parent's -Y axis, scaled per frame by poseRobot.
  const flameGeometry = new THREE.ConeGeometry(1, 1, 16);
  flameGeometry.rotateX(Math.PI);
  flameGeometry.translate(0, -0.5, 0);
  const makeJet = (width, length, parent, y) => {
    const jet = new THREE.Group();
    jet.position.y = y;
    const outer = new THREE.Mesh(flameGeometry, robotMaterials.flame);
    outer.scale.set(width, length, width);
    const core = new THREE.Mesh(flameGeometry, robotMaterials.flameCore);
    core.scale.set(width * 0.5, length * 0.62, width * 0.5);
    const glow = makeGlow("#ff9a3c", width * 7, 0.55);
    glow.position.y = -length * 0.25;
    jet.add(outer, core, glow);
    parent.add(jet);
    return jet;
  };

  // Fallback robot built from primitives; replaced by the Blender model once it loads.
  const makeRobot = () => {
    const M = robotMaterials;
    const capsule = (radius, length, material) => new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 12), material);

    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.26), M.tealDark);
    body.add(pelvis);
    const torso = new THREE.Group();
    torso.position.y = 0.1;
    body.add(torso);
    const chest = capsule(0.25, 0.3, M.teal);
    chest.position.y = 0.34;
    chest.scale.set(1.25, 1, 0.85);
    const abdomen = capsule(0.17, 0.12, M.tealDark);
    abdomen.position.y = 0.06;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.08), M.tealDark);
    plate.position.set(0, 0.44, -0.2);
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.055, 18), M.glow);
    core.position.set(0, 0.44, -0.245);
    core.rotation.y = Math.PI;
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.14), M.navy);
    pack.position.set(0, 0.36, 0.25);
    torso.add(chest, abdomen, plate, core, pack);
    const packJets = [-0.09, 0.09].map((x) => {
      const holder = new THREE.Group();
      holder.position.set(x, 0.17, 0.27);
      torso.add(holder);
      return makeJet(0.06, 0.5, holder, 0);
    });

    const head = new THREE.Group();
    head.position.y = 0.74;
    torso.add(head);
    const neck = capsule(0.07, 0.06, M.navy);
    neck.position.y = -0.08;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.235, 24, 18), M.teal);
    helmet.position.y = 0.12;
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.243, 24, 10, Math.PI * 1.05, Math.PI * 0.9, Math.PI * 0.36, Math.PI * 0.24), M.visor);
    visor.position.y = 0.12;
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.03), M.glow);
    slit.position.set(0.085, 0.13, -0.232);
    head.add(neck, helmet, visor, slit);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 16), M.navy);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(side * 0.235, 0.12, 0);
      head.add(ear);
    });

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.3, 0.38, 0.8, 0.58, 1.38, 0.66);
    wingShape.lineTo(1.2, 0.4);
    wingShape.lineTo(1.3, 0.3);
    wingShape.lineTo(1.0, 0.17);
    wingShape.lineTo(1.08, 0.06);
    wingShape.lineTo(0.72, -0.02);
    wingShape.lineTo(0.76, -0.13);
    wingShape.lineTo(0.34, -0.12);
    wingShape.lineTo(0, 0);
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, { depth: 0.04, bevelEnabled: false });
    wingGeometry.translate(0, 0, -0.02);
    const wings = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.12, 0.46, 0.3);
      const outer = new THREE.Mesh(wingGeometry, M.wing);
      outer.scale.x = side;
      const inner = new THREE.Mesh(wingGeometry, M.wingInner);
      inner.scale.set(side * 0.7, 0.7, 1.4);
      inner.position.set(side * 0.05, 0.02, 0.012);
      pivot.add(outer, inner);
      torso.add(pivot);
      return { pivot, side };
    });

    const arms = [1, -1].map((side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.37, 0.52, 0);
      torso.add(shoulder);
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), M.tealDark);
      const upper = capsule(0.08, 0.24, M.teal);
      upper.position.y = -0.18;
      const elbow = new THREE.Group();
      elbow.position.y = -0.36;
      const fore = capsule(0.078, 0.22, M.teal);
      fore.position.y = -0.14;
      const fist = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), M.orange);
      fist.position.y = -0.32;
      fist.scale.set(1, 1.05, 1.1);
      elbow.add(fore, fist);
      shoulder.add(pad, upper, elbow);
      return { shoulder, elbow, side };
    });

    const legs = [1, -1].map((side) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.13, -0.06, 0);
      body.add(hip);
      const thigh = capsule(0.1, 0.26, M.teal);
      thigh.position.y = -0.2;
      const knee = new THREE.Group();
      knee.position.y = -0.42;
      const shin = capsule(0.09, 0.24, M.teal);
      shin.position.y = -0.17;
      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.2, 14), M.orange);
      boot.position.y = -0.4;
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.07, 14), M.navy);
      nozzle.position.y = -0.53;
      knee.add(shin, boot, nozzle);
      hip.add(thigh, knee);
      const jet = makeJet(0.09, 0.62, knee, -0.565);
      return { hip, knee, jet, side };
    });

    const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 2), MAT.shieldWire);
    shield.position.y = 0.2;
    shield.visible = false;
    root.add(shield);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.6 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.035;
    scene.add(shadow);

    scene.add(root);
    return { root, body, torso, head, wings, arms, legs, packJets, shield, shadow };
  };

  let robot = makeRobot();
  // Keep the fallback out of view while the detailed model loads.
  scene.remove(robot.root);
  let robotModelReady = false;
  const showFallbackRobot = () => {
    if (!robotModelReady && !robot.root.parent) scene.add(robot.root);
  };
  const fallbackTimer = window.setTimeout(showFallbackRobot, 3000);

  // Detailed SOAR rocket robot, modelled in Blender (_scripts/blender/soar_robot.py).
  // Its joints are named nodes, so the same poses drive it as the fallback robot.
  const loadRobotModel = async () => {
    const [{ GLTFLoader }, { RoomEnvironment }] = await Promise.all([import("./three/GLTFLoader.js"), import("./three/RoomEnvironment.js")]);
    const gltf = await new GLTFLoader().loadAsync(ROBOT_MODEL_URL);
    const model = gltf.scene;
    const node = (name) => {
      const found = model.getObjectByName(name);
      if (!found) throw new Error(`SOAR model is missing node ${name}`);
      return found;
    };
    const pmrem = new THREE.PMREMGenerator(renderer);
    const reflections = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.material.envMap = reflections;
      child.material.envMapIntensity = 0.9;
    });
    const root = new THREE.Group();
    root.add(model);
    const next = {
      root,
      body: node("body"),
      torso: node("torso"),
      head: node("head"),
      arms: [
        { shoulder: node("shoulder_R"), elbow: node("elbow_R"), side: 1 },
        { shoulder: node("shoulder_L"), elbow: node("elbow_L"), side: -1 },
      ],
      legs: [
        { hip: node("hip_R"), knee: node("knee_R"), jet: makeJet(0.1, 0.64, node("bootJet_R"), 0), side: 1 },
        { hip: node("hip_L"), knee: node("knee_L"), jet: makeJet(0.1, 0.64, node("bootJet_L"), 0), side: -1 },
      ],
      wings: [
        { pivot: node("wing_R"), side: 1 },
        { pivot: node("wing_L"), side: -1 },
      ],
      packJets: [makeJet(0.075, 0.55, node("packJet_R"), 0), makeJet(0.075, 0.55, node("packJet_L"), 0)],
      shield: robot.shield,
      shadow: robot.shadow,
    };
    root.add(next.shield);
    root.position.copy(robot.root.position);
    root.rotation.copy(robot.root.rotation);
    scene.remove(robot.root);
    scene.add(root);
    robot = next;
    robotModelReady = true;
    window.clearTimeout(fallbackTimer);
    if (!running) renderStill();
  };
  loadRobotModel().catch((error) => {
    console.warn("SOAR robot model unavailable, using the built-in robot:", error);
    showFallbackRobot();
  });

  const poseRobot = (t) => {
    const f = player.flight;
    const w = 1 - f;
    const h = player.hover;
    const run = player.runPhase;
    const s = Math.sin(run);

    robot.body.rotation.x = lerp(-0.12, lerp(-1.36, -0.42, h), f);
    robot.body.position.y = w * Math.abs(s) * 0.07;
    robot.head.rotation.x = lerp(0.04, lerp(1.05, 0.28, h), f);

    const [right, left] = robot.arms;
    right.shoulder.rotation.x = lerp(s * 0.85, lerp(2.95, 0.45, h), f);
    right.shoulder.rotation.z = lerp(0.08, lerp(0.12, 0.62, h), f);
    right.elbow.rotation.x = lerp(0.55 + Math.max(0, s) * 0.35, lerp(0.05, 0.5, h), f);
    left.shoulder.rotation.x = lerp(-s * 0.85, lerp(-0.35, 0.45, h), f);
    left.shoulder.rotation.z = lerp(-0.08, lerp(-0.3, -0.62, h), f);
    left.elbow.rotation.x = lerp(0.55 + Math.max(0, -s) * 0.35, lerp(0.15, 0.5, h), f);

    const [rightLeg, leftLeg] = robot.legs;
    rightLeg.hip.rotation.x = lerp(-s * 0.8, lerp(0.05, 0.25, h), f);
    rightLeg.knee.rotation.x = lerp(-Math.max(0, -s) * 1.15 - 0.1, lerp(-0.18, -0.55, h), f);
    leftLeg.hip.rotation.x = lerp(s * 0.8, lerp(0.12, 0.08, h), f);
    leftLeg.knee.rotation.x = lerp(-Math.max(0, s) * 1.15 - 0.1, lerp(-0.3, -0.25, h), f);
    rightLeg.hip.rotation.z = lerp(0.02, 0.07, f);
    leftLeg.hip.rotation.z = -lerp(0.02, 0.07, f);

    const flap = Math.sin(t * 5.5) * 0.12 * f * (1 - h * 0.5);
    robot.wings.forEach(({ pivot, side }) => {
      pivot.rotation.y = -side * lerp(1.2, lerp(0.1 + flap, 0.42 + flap, h), f);
      pivot.rotation.z = -side * lerp(0.38, lerp(0.22, -0.32, h), f);
      pivot.scale.setScalar(lerp(0.82, 1, f));
    });

    const flicker = 1 + Math.sin(t * 47) * 0.12 + Math.sin(t * 31) * 0.08;
    robot.legs.forEach(({ jet }) => jet.scale.set(1, lerp(0.22, 1, f) * flicker, 1));
    robot.packJets.forEach((jet) => jet.scale.set(1, lerp(0.2, 0.9, f) * flicker, 1));
  };

  /* Particles (single Points draw call) */
  const MAX_PARTICLES = 1400;
  const particlePositions = new Float32Array(MAX_PARTICLES * 3);
  const particleColors = new Float32Array(MAX_PARTICLES * 3);
  const particleSizes = new Float32Array(MAX_PARTICLES);
  const particleAlpha = new Float32Array(MAX_PARTICLES);
  const particleVelocity = new Float32Array(MAX_PARTICLES * 3);
  const particleLife = new Float32Array(MAX_PARTICLES);
  const particleMaxLife = new Float32Array(MAX_PARTICLES);
  let particleCursor = 0;
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("aColor", new THREE.BufferAttribute(particleColors, 3));
  particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));
  particleGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(particleAlpha, 1));
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 300 } },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vAlpha = aAlpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, d) * vAlpha);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.frustumCulled = false;
  particles.renderOrder = 12;
  scene.add(particles);

  const emit = (x, y, z, vx, vy, vz, life, size, color) => {
    const i = particleCursor;
    particleCursor = (particleCursor + 1) % MAX_PARTICLES;
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    particleVelocity[i * 3] = vx;
    particleVelocity[i * 3 + 1] = vy;
    particleVelocity[i * 3 + 2] = vz;
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
    particleSizes[i] = size;
    particleLife[i] = life;
    particleMaxLife[i] = life;
    particleAlpha[i] = 1;
  };

  const colorCache = new Map();
  const toColor = (value) => {
    if (value instanceof THREE.Color) return value;
    let color = colorCache.get(value);
    if (!color) {
      color = new THREE.Color(value);
      colorCache.set(value, color);
    }
    return color;
  };

  const burst = (position, color, count = 18, speed = 7, life = 0.7, size = 0.35) => {
    const c = toColor(color);
    for (let i = 0; i < count; i += 1) {
      const theta = rand(0, Math.PI * 2);
      const phi = Math.acos(rand(-1, 1));
      const v = speed * rand(0.35, 1);
      emit(
        position.x,
        position.y,
        position.z,
        Math.sin(phi) * Math.cos(theta) * v,
        Math.cos(phi) * v,
        Math.sin(phi) * Math.sin(theta) * v,
        life * rand(0.6, 1.2),
        size * rand(0.6, 1.4),
        c
      );
    }
  };

  const updateParticles = (dt) => {
    const drag = Math.exp(-2.2 * dt);
    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      if (particleLife[i] <= 0) {
        particleAlpha[i] = 0;
        continue;
      }
      particleLife[i] -= dt;
      particleVelocity[i * 3] *= drag;
      particleVelocity[i * 3 + 1] *= drag;
      particleVelocity[i * 3 + 2] *= drag;
      particlePositions[i * 3] += particleVelocity[i * 3] * dt;
      particlePositions[i * 3 + 1] += particleVelocity[i * 3 + 1] * dt;
      particlePositions[i * 3 + 2] += (particleVelocity[i * 3 + 2] + scrollSpeed * 0.35) * dt;
      particleAlpha[i] = Math.max(0, particleLife[i] / particleMaxLife[i]);
    }
    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.aColor.needsUpdate = true;
    particleGeometry.attributes.aSize.needsUpdate = true;
    particleGeometry.attributes.aAlpha.needsUpdate = true;
  };

  /* Shockwave rings */
  const ringGeometry = new THREE.RingGeometry(0.86, 1, 48);
  const rings = Array.from({ length: 22 }, () => {
    const mesh = new THREE.Mesh(ringGeometry, additive("#ffffff", 0));
    mesh.visible = false;
    mesh.renderOrder = 11;
    scene.add(mesh);
    return { mesh, life: 0, maxLife: 1, size: 1 };
  });
  let ringCursor = 0;
  const shockwave = (position, color, size = 3, life = 0.5) => {
    const ring = rings[ringCursor];
    ringCursor = (ringCursor + 1) % rings.length;
    ring.mesh.position.copy(position);
    ring.mesh.material.color.copy(toColor(color));
    ring.mesh.visible = true;
    ring.life = life;
    ring.maxLife = life;
    ring.size = size;
  };
  const updateRings = (dt) => {
    rings.forEach((ring) => {
      if (ring.life <= 0) return;
      ring.life -= dt;
      const progress = 1 - Math.max(0, ring.life) / ring.maxLife;
      ring.mesh.scale.setScalar(0.2 + ring.size * (1 - (1 - progress) ** 3));
      ring.mesh.material.opacity = (1 - progress) * 0.9;
      ring.mesh.quaternion.copy(camera.quaternion);
      ring.mesh.position.z += scrollSpeed * 0.3 * dt;
      if (ring.life <= 0) ring.mesh.visible = false;
    });
  };

  /* Pools for bullets and enemy shots */
  const makePool = (factory) => {
    const free = [];
    return {
      acquire() {
        const mesh = free.pop() || factory();
        mesh.visible = true;
        return mesh;
      },
      release(mesh) {
        mesh.visible = false;
        free.push(mesh);
      },
    };
  };
  const boltPool = makePool(() => {
    const mesh = new THREE.Mesh(GEO.bolt, MAT.bolt);
    mesh.rotation.x = Math.PI / 2;
    mesh.add(makeGlow("#5fe3f0", 1.1, 0.8));
    scene.add(mesh);
    return mesh;
  });
  const heavyPool = makePool(() => {
    const mesh = new THREE.Mesh(GEO.heavy, MAT.heavy);
    mesh.add(makeGlow("#ff9a3c", 1.9, 0.85));
    scene.add(mesh);
    return mesh;
  });
  const shotPool = makePool(() => {
    const mesh = new THREE.Mesh(GEO.shot, MAT.shot);
    mesh.add(makeGlow("#ff3b2f", 1.3, 0.8));
    scene.add(mesh);
    return mesh;
  });

  /* Enemy, boss, gate, and power-up builders */
  const BUILD = {
    knot() {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(GEO.knot, MAT.knot);
      group.add(mesh, makeGlow("#39c3d6", 2.4, 0.3));
      return { group, spin: mesh };
    },
    bug() {
      const group = new THREE.Group();
      const shell = new THREE.Mesh(GEO.sphere, MAT.bugShell);
      shell.scale.set(0.5, 0.34, 0.62);
      const seam = new THREE.Mesh(GEO.box, MAT.bugDark);
      seam.scale.set(0.035, 0.36, 1.12);
      seam.position.y = 0.04;
      const head = new THREE.Mesh(GEO.sphere, MAT.bugDark);
      head.scale.setScalar(0.27);
      head.position.set(0, 0.02, 0.62);
      group.add(shell, seam, head);
      [-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(GEO.sphere, MAT.eyeRed);
        eye.scale.setScalar(0.07);
        eye.position.set(side * 0.12, 0.1, 0.84);
        const antenna = new THREE.Mesh(GEO.cylinder, MAT.bugDark);
        antenna.scale.set(0.02, 0.45, 0.02);
        antenna.position.set(side * 0.12, 0.3, 0.84);
        antenna.rotation.set(0.6, 0, side * 0.35);
        group.add(eye, antenna);
      });
      const legs = [];
      [-1, 1].forEach((side) => {
        for (let i = 0; i < 3; i += 1) {
          const leg = new THREE.Mesh(GEO.cylinder, MAT.bugDark);
          leg.scale.set(0.035, 0.46, 0.035);
          leg.position.set(side * 0.46, -0.14, (i - 1) * 0.32);
          leg.rotation.z = side * 1.05;
          leg.userData.side = side;
          leg.userData.phase = i * 2.1 + (side > 0 ? 0 : Math.PI);
          group.add(leg);
          legs.push(leg);
        }
      });
      return { group, legs };
    },
    reviewer() {
      const group = new THREE.Group();
      const eye = new THREE.Group();
      const ball = new THREE.Mesh(GEO.sphere, MAT.eyeWhite);
      ball.scale.setScalar(0.62);
      const iris = new THREE.Mesh(GEO.sphere, MAT.iris);
      iris.scale.set(0.34, 0.34, 0.16);
      iris.position.z = 0.52;
      const pupil = new THREE.Mesh(GEO.sphere, MAT.pupil);
      pupil.scale.set(0.16, 0.16, 0.08);
      pupil.position.z = 0.64;
      const brow = new THREE.Mesh(GEO.box, MAT.navy);
      brow.scale.set(0.74, 0.11, 0.14);
      brow.position.set(0, 0.6, 0.3);
      brow.rotation.z = 0.28;
      eye.add(ball, iris, pupil, brow);
      const ring = new THREE.Mesh(GEO.ring, MAT.redGlow);
      ring.scale.setScalar(0.98);
      group.add(eye, ring, makeGlow("#ff4b3a", 2.2, 0.25));
      return { group, eye, ring };
    },
    meteor() {
      const group = new THREE.Group();
      const rock = new THREE.Mesh(GEO.rock, MAT.rock);
      rock.scale.setScalar(0.8);
      group.add(rock, makeGlow("#ff7a2a", 3.2, 0.5));
      return { group, spin: rock };
    },
    data() {
      const group = new THREE.Group();
      const core = new THREE.Mesh(GEO.ico, MAT.dataWire);
      core.scale.setScalar(0.45);
      group.add(core);
      const cubes = Array.from({ length: 9 }, () => {
        const cube = new THREE.Mesh(GEO.box, pick(MAT.cubes));
        cube.scale.setScalar(0.24);
        cube.userData = { r: rand(0.55, 0.95), a: rand(0, Math.PI * 2), speed: rand(1.4, 2.8), tilt: rand(-0.9, 0.9) };
        group.add(cube);
        return cube;
      });
      return { group, cubes, spin: core };
    },
    gpu() {
      const group = new THREE.Group();
      const chip = new THREE.Group();
      chip.rotation.x = 1.1;
      const base = new THREE.Mesh(GEO.box, MAT.pcb);
      base.scale.set(1.2, 0.16, 1.2);
      const die = new THREE.Mesh(GEO.box, MAT.hot);
      die.scale.set(0.55, 0.12, 0.55);
      die.position.y = 0.12;
      chip.add(base, die);
      for (let side = 0; side < 4; side += 1) {
        for (let i = 0; i < 5; i += 1) {
          const pin = new THREE.Mesh(GEO.box, MAT.gold);
          pin.scale.set(0.08, 0.05, 0.16);
          const offset = (i - 2) * 0.22;
          const angle = (side * Math.PI) / 2;
          pin.position.set(Math.cos(angle) * 0.66 - Math.sin(angle) * offset, 0, Math.sin(angle) * 0.66 + Math.cos(angle) * offset);
          pin.rotation.y = -angle;
          chip.add(pin);
        }
      }
      group.add(chip, makeGlow("#ff3b2f", 2.6, 0.4));
      return { group, chip };
    },
    grad() {
      const group = new THREE.Group();
      const cap = new THREE.Group();
      cap.rotation.x = 0.55;
      const board = new THREE.Mesh(GEO.box, MAT.capBlack);
      board.scale.set(1.2, 0.07, 1.2);
      board.position.y = 0.2;
      board.rotation.y = Math.PI / 4;
      const crown = new THREE.Mesh(GEO.crown, MAT.capBlack);
      crown.position.y = -0.02;
      const button = new THREE.Mesh(GEO.sphere, MAT.gold);
      button.scale.setScalar(0.06);
      button.position.y = 0.26;
      const cord = new THREE.Mesh(GEO.cylinder, MAT.gold);
      cord.scale.set(0.018, 0.5, 0.018);
      cord.position.set(0.62, 0.0, 0);
      const tassel = new THREE.Mesh(GEO.cone, MAT.gold);
      tassel.scale.set(0.07, 0.2, 0.07);
      tassel.position.set(0.62, -0.32, 0);
      tassel.rotation.x = Math.PI;
      cap.add(board, crown, button, cord, tassel);
      group.add(cap, makeGlow("#f2b134", 2.2, 0.22));
      return { group, cap };
    },
    storm() {
      const group = new THREE.Group();
      const core = new THREE.Mesh(GEO.sphere, MAT.stormCore);
      core.scale.setScalar(1.15);
      const vortex = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.32, 12, 48), MAT.stormRing);
      const vortex2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.16, 10, 56), MAT.stormRing);
      vortex2.rotation.x = 1.1;
      const papers = Array.from({ length: 12 }, (_, i) => {
        const paper = new THREE.Mesh(GEO.paper, MAT.paper);
        paper.userData = { a: (i / 12) * Math.PI * 2, r: rand(3.0, 3.8), y: rand(-1, 1), speed: rand(0.8, 1.3) };
        group.add(paper);
        return paper;
      });
      group.add(core, vortex, vortex2, makeGlow("#b05cff", 8, 0.32));
      return { group, core, vortex, vortex2, papers };
    },
    dragon() {
      const group = new THREE.Group();
      const head = new THREE.Group();
      const skull = new THREE.Mesh(GEO.cone, MAT.dragon);
      skull.scale.set(0.95, 2.1, 0.8);
      skull.rotation.x = Math.PI / 2;
      const jaw = new THREE.Mesh(GEO.cone, MAT.dragonLight);
      jaw.scale.set(0.6, 1.5, 0.45);
      jaw.rotation.x = Math.PI / 2 + 0.25;
      jaw.position.set(0, -0.42, 0.1);
      head.add(skull, jaw);
      [-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(GEO.sphere, MAT.dragonEye);
        eye.scale.setScalar(0.16);
        eye.position.set(side * 0.42, 0.32, 0.15);
        const horn = new THREE.Mesh(GEO.cone, MAT.dragonSpike);
        horn.scale.set(0.16, 0.9, 0.16);
        horn.position.set(side * 0.42, 0.62, -0.55);
        horn.rotation.set(-1.0, 0, side * -0.3);
        head.add(eye, horn);
      });
      head.add(makeGlow("#3fd08f", 4, 0.25));
      group.add(head);
      const segments = Array.from({ length: 16 }, (_, i) => {
        const segment = new THREE.Mesh(GEO.sphere, i % 2 ? MAT.dragon : MAT.dragonLight);
        const size = lerp(0.9, 0.34, i / 15);
        segment.scale.setScalar(size);
        segment.userData.size = size;
        const spike = new THREE.Mesh(GEO.cone, MAT.dragonSpike);
        spike.scale.set(0.32, 0.8, 0.32);
        spike.position.y = 1.05;
        segment.add(spike);
        group.add(segment);
        return segment;
      });
      return { group, head, segments };
    },
    citadel() {
      const group = new THREE.Group();
      const core = new THREE.Mesh(GEO.octa, MAT.gold);
      core.scale.setScalar(1.6);
      const ringsList = [2.6, 3.2, 3.8].map((radius, index) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.11, 8, 64), index === 1 ? MAT.ringOrange : MAT.ringTeal);
        ring.rotation.set(rand(0, Math.PI), rand(0, Math.PI), 0);
        group.add(ring);
        return ring;
      });
      const turrets = Array.from({ length: 4 }, () => {
        const turret = new THREE.Group();
        const box = new THREE.Mesh(GEO.box, MAT.navy);
        box.scale.setScalar(0.62);
        const barrel = new THREE.Mesh(GEO.cylinder, MAT.gateStripe);
        barrel.scale.set(0.1, 0.6, 0.1);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = 0.45;
        turret.add(box, barrel);
        group.add(turret);
        return turret;
      });
      const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(4.6, 2), MAT.shieldWire);
      group.add(core, shield, makeGlow("#ffc247", 9, 0.28));
      return { group, core, rings: ringsList, turrets, shield };
    },
    airGate() {
      const group = new THREE.Group();
      const ring = new THREE.Mesh(GEO.gateRing, MAT.gateAir);
      const disc = new THREE.Mesh(GEO.gateDisc, MAT.gateAirFill);
      group.add(ring, disc, makeGlow("#57d8ff", 5.5, 0.22));
      return { group, ring };
    },
    groundGate() {
      const group = new THREE.Group();
      [-1, 1].forEach((side) => {
        const pillar = new THREE.Mesh(GEO.box, MAT.gateFrame);
        pillar.scale.set(0.42, 2.5, 0.5);
        pillar.position.set(side * 1.98, 1.25, 0);
        const stripe = new THREE.Mesh(GEO.box, MAT.gateStripe);
        stripe.scale.set(0.44, 0.16, 0.52);
        stripe.position.set(side * 1.98, 1.9, 0);
        group.add(pillar, stripe);
      });
      const lintel = new THREE.Mesh(GEO.box, MAT.gateFrame);
      lintel.scale.set(4.4, 0.42, 0.5);
      lintel.position.y = 2.6;
      const lintelStripe = new THREE.Mesh(GEO.box, MAT.gateStripe);
      lintelStripe.scale.set(3.6, 0.12, 0.52);
      lintelStripe.position.y = 2.6;
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3), MAT.gateGroundFill);
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0.05;
      group.add(lintel, lintelStripe, pad, makeGlow("#ff9a4a", 4.5, 0.18));
      return { group };
    },
    coffee() {
      const group = new THREE.Group();
      const mug = new THREE.Mesh(GEO.mug, MAT.mug);
      const top = new THREE.Mesh(new THREE.CircleGeometry(0.27, 18), MAT.coffee);
      top.rotation.x = -Math.PI / 2;
      top.position.y = 0.26;
      const handle = new THREE.Mesh(GEO.handle, MAT.mug);
      handle.position.x = 0.32;
      group.add(mug, top, handle, makeGlow("#ffffff", 1.8, 0.35));
      return { group };
    },
    token() {
      const group = new THREE.Group();
      const coin = new THREE.Mesh(GEO.coin, MAT.gold);
      coin.rotation.x = Math.PI / 2;
      group.add(coin, makeGlow("#ffc247", 2.2, 0.45));
      return { group };
    },
    shield() {
      const group = new THREE.Group();
      const ball = new THREE.Mesh(GEO.ico, MAT.shieldPower);
      ball.scale.setScalar(0.5);
      group.add(ball, makeGlow("#7ff0ff", 2, 0.45));
      return { group };
    },
    gpuPower() {
      const group = new THREE.Group();
      const board = new THREE.Mesh(GEO.box, MAT.chip);
      board.scale.set(0.75, 0.1, 0.75);
      board.rotation.x = 1.1;
      const die = new THREE.Mesh(GEO.box, MAT.pcb);
      die.scale.set(0.34, 0.12, 0.34);
      die.rotation.x = 1.1;
      die.position.z = 0.05;
      group.add(board, die, makeGlow("#7dff9a", 2, 0.4));
      return { group };
    },
  };

  /* State */
  let mode = "ambient";
  let time = 0;
  let travel = 0;
  let scrollSpeed = 13;
  let shake = 0;
  let autoTimer = 12;
  let ambientSpawn = 1.5;
  let hudTimer = 0;
  let pixelQuality = 1;
  let ambientDisabled = false;
  const keys = new Set();
  const pointer = { active: false, x: 0, y: 3, touch: null };
  const player = {
    pos: new THREE.Vector3(0, 3.3, 0),
    vel: new THREE.Vector2(),
    form: "flight",
    flight: 1,
    hover: 0,
    yaw: 0,
    runPhase: 0,
    invuln: 0,
    fireCooldown: 0,
    formCooldown: 0,
  };
  const game = {};
  const enemies = [];
  const bullets = [];
  const shots = [];
  const gates = [];
  const powers = [];
  const camPos = new THREE.Vector3(0, 6, 12);
  const camLook = new THREE.Vector3(0, 3, -8);
  const view = { x: 0, y: 0 };
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const center = new THREE.Vector3();

  const resetGame = () => {
    Object.assign(game, {
      score: 0,
      lives: 3,
      pulse: 1,
      combo: 0,
      comboTimer: 0,
      stage: 0,
      stageTime: 0,
      spawnTimer: 1.2,
      gateTimer: 8,
      nextGate: "air",
      boss: null,
      spread: 0,
      rapid: 0,
      shield: 0,
      time: 0,
      kills: 0,
      winTimer: 0,
      over: false,
    });
  };
  resetGame();

  // Portrait screens see a narrower slice of the valley, so the play lanes shrink with the aspect ratio.
  const lane = () => clamp((window.innerWidth / Math.max(1, window.innerHeight)) * 1.2, 0.55, 1);
  const playerCenter = (out) => out.set(player.pos.x, player.pos.y + (player.form === "walk" ? 0.3 : 0), player.pos.z);
  const multiplier = () => 1 + Math.min(5, Math.floor(game.combo / 8));

  /* Entity management */
  const removeEntity = (list, entity) => {
    const index = list.indexOf(entity);
    if (index >= 0) list.splice(index, 1);
    if (entity.group) {
      entity.group.traverse((child) => {
        if (child.isSprite) labels.delete(child);
      });
      scene.remove(entity.group);
    }
  };

  const clearField = (explode) => {
    [...enemies].forEach((enemy) => {
      if (explode) burst(enemy.pos, enemy.type.color, 14, 6, 0.6, 0.35);
      removeEntity(enemies, enemy);
    });
    [...gates].forEach((gate) => removeEntity(gates, gate));
    [...powers].forEach((power) => removeEntity(powers, power));
    bullets.forEach((bullet) => bullet.pool.release(bullet.mesh));
    bullets.length = 0;
    shots.forEach((shot) => shotPool.release(shot.mesh));
    shots.length = 0;
    game.boss = null;
  };

  const spawnEnemy = (kind, z = -150) => {
    const type = ENEMY_TYPES[kind];
    const built = BUILD[kind]();
    const live = mode === "playing";
    const enemy = {
      ...built,
      kind,
      type,
      hp: live ? type.hp + (type.hp > 1 ? game.stage : 0) : 1,
      radius: type.radius,
      pos: built.group.position,
      vel: new THREE.Vector3(),
      t: rand(0, 10),
      state: "approach",
      hoverZ: rand(-34, -24),
      hoverTime: 0,
      shootTimer: rand(1.2, 2.4),
    };
    enemy.pos.set(rand(-8, 8) * lane(), type.ground ? 0.55 : rand(1.4, 6.8), z);
    const baseSpeed = live ? 15 + game.stage * 2.5 : 9;
    enemy.vel.set(0, 0, baseSpeed * (type.fast ? 1.9 : 1));
    if (type.fast && live) {
      playerCenter(tmp)
        .sub(enemy.pos)
        .normalize()
        .multiplyScalar(baseSpeed * 1.9);
      enemy.vel.copy(tmp);
    }
    const label = makeLabel(isZh ? type.zh : type.en);
    label.position.y = type.radius + 0.25;
    built.group.add(label);
    scene.add(built.group);
    enemies.push(enemy);
    return enemy;
  };

  const spawnBoss = (kind) => {
    const type = BOSS_TYPES[kind];
    const built = BUILD[kind]();
    const boss = {
      ...built,
      kind,
      type,
      boss: true,
      hp: type.hp,
      maxHp: type.hp,
      radius: type.radius,
      pos: kind === "dragon" ? built.head.position : built.group.position,
      t: 0,
      fireTimer: 2,
      aimTimer: 1.5,
      lungeTimer: 8,
      lunge: 0,
      lungeTarget: new THREE.Vector3(),
      shielded: false,
      shieldTimer: 3,
      spiral: 0,
      spiralTimer: 0,
    };
    boss.pos.set(0, 5, -150);
    if (kind === "dragon") built.segments.forEach((segment, i) => segment.position.set(0, 5, -150 - i));
    const label = makeLabel(isZh ? type.zh : type.en, "boss");
    label.position.y = kind === "dragon" ? 1.2 : type.radius + 2.4;
    (kind === "dragon" ? built.head : built.group).add(label);
    scene.add(built.group);
    enemies.push(boss);
    game.boss = boss;
    const name = isZh ? type.zh : type.en;
    showToast(format(TEXT.bossIncoming, { name }), 2.2);
    if (ui.refs.boss) {
      ui.refs.boss.hidden = false;
      ui.refs.bossName.textContent = name;
      ui.refs.bossFill.style.transform = "scaleX(1)";
    }
    shake = Math.max(shake, 0.35);
    return boss;
  };

  const spawnGate = (kind) => {
    const built = kind === "air" ? BUILD.airGate() : BUILD.groundGate();
    const gate = { ...built, kind, pos: built.group.position, resolved: false };
    if (kind === "air") gate.pos.set(rand(-5.5, 5.5) * lane(), rand(3.6, 6.2), -150);
    else gate.pos.set(rand(-5, 5) * lane(), 0, -150);
    const label = makeLabel(kind === "air" ? TEXT.airGate : TEXT.groundGate, "gate");
    label.position.y = kind === "air" ? 2.2 : 3.0;
    built.group.add(label);
    scene.add(built.group);
    gates.push(gate);
  };

  const POWER_KINDS = ["coffee", "token", "token", "shield", "gpu", "gpu"];
  const spawnPower = (position, kind = pick(POWER_KINDS)) => {
    const built = kind === "gpu" ? BUILD.gpuPower() : BUILD[kind]();
    const power = { ...built, kind, pos: built.group.position, t: rand(0, 6) };
    power.pos.copy(position);
    power.pos.y = clamp(power.pos.y, 1.2, 6.5);
    const label = makeLabel(TEXT.powers[kind][0]);
    label.position.y = 0.7;
    built.group.add(label);
    scene.add(built.group);
    powers.push(power);
  };

  const fireBullet = (heavy, x, y, z, vx, vy) => {
    const pool = heavy ? heavyPool : boltPool;
    const mesh = pool.acquire();
    mesh.position.set(x, y, z);
    bullets.push({
      mesh,
      pool,
      pos: mesh.position,
      vel: new THREE.Vector3(vx, vy, heavy ? -72 : -96),
      damage: heavy ? 4 : 1,
      radius: heavy ? 0.5 : 0.32,
      heavy,
    });
  };

  const fireShot = (from, direction, speed, size = 0.22) => {
    const mesh = shotPool.acquire();
    mesh.position.copy(from);
    mesh.scale.setScalar(size / 0.22);
    shots.push({ mesh, pos: mesh.position, vel: direction.clone().normalize().multiplyScalar(speed), radius: size });
  };

  const aimDirection = (from, spread = 0, out = new THREE.Vector3()) => {
    playerCenter(out).sub(from).normalize();
    if (spread) {
      const cos = Math.cos(spread);
      const sin = Math.sin(spread);
      const x = out.x * cos - out.z * sin;
      out.z = out.x * sin + out.z * cos;
      out.x = x;
    }
    return out;
  };

  const findAimTarget = () => {
    let best = null;
    let bestScore = Infinity;
    enemies.forEach((enemy) => {
      if (enemy.dead) return;
      if (enemy.pos.z > -3 || enemy.pos.z < -95) return;
      const dx = Math.abs(enemy.pos.x - player.pos.x);
      if (dx > (enemy.boss ? 4 : 3.2)) return;
      const score = dx + Math.abs(enemy.pos.z) * 0.02;
      if (score < bestScore) {
        bestScore = score;
        best = enemy;
      }
    });
    return best;
  };

  const tryFire = (auto) => {
    if (player.fireCooldown > 0) return;
    const rapid = game.rapid > 0;
    const spread = game.spread > 0;
    const { x, y } = player.pos;
    if (player.form === "flight") {
      fireBullet(false, x - 0.42, y + 0.05, -0.8, 0, 0);
      fireBullet(false, x + 0.42, y + 0.05, -0.8, 0, 0);
      if (spread) {
        fireBullet(false, x - 0.5, y, -0.6, -13, 0);
        fireBullet(false, x + 0.5, y, -0.6, 13, 0);
      }
      player.fireCooldown = rapid ? 0.07 : 0.12;
    } else {
      const target = findAimTarget();
      const y0 = y + 0.55;
      let vy = 0;
      if (target) {
        const flightTime = Math.max(0.12, -target.pos.z / 72);
        vy = clamp((target.pos.y - y0) / flightTime, -14, 24);
      }
      fireBullet(true, x, y0, -0.6, 0, vy);
      if (spread) {
        fireBullet(true, x - 0.3, y0, -0.6, -9, vy);
        fireBullet(true, x + 0.3, y0, -0.6, 9, vy);
      }
      player.fireCooldown = rapid ? 0.2 : 0.32;
    }
    if (auto) player.fireCooldown *= 2.4;
    else sfx.shoot(player.form === "walk");
  };

  const setForm = (form, silent) => {
    if (player.form === form) return;
    player.form = form;
    player.formCooldown = 0.3;
    playerCenter(tmp);
    shockwave(tmp, form === "flight" ? "#57d8ff" : "#ffb248", 2.6, 0.45);
    burst(tmp, form === "flight" ? "#57d8ff" : "#ffb248", 22, 6, 0.5, 0.3);
    if (!silent) {
      sfx.transform();
      showToast(form === "flight" ? TEXT.formFlight : TEXT.formWalk, 1);
      updateHud(true);
    }
  };

  const toggleForm = () => {
    if (mode !== "playing" || player.formCooldown > 0) return;
    setForm(player.form === "flight" ? "walk" : "flight", false);
  };

  const firePulse = () => {
    if (mode !== "playing") return;
    if (game.pulse <= 0) {
      showToast(TEXT.pulseEmpty, 1.4);
      return;
    }
    game.pulse -= 1;
    playerCenter(tmp);
    shockwave(tmp, "#7ff0ff", 26, 0.9);
    shockwave(tmp, "#ffb248", 18, 0.7);
    burst(tmp, "#7ff0ff", 60, 18, 0.9, 0.45);
    shots.forEach((shot) => {
      burst(shot.pos, "#ff8a5a", 4, 3, 0.35, 0.25);
      shotPool.release(shot.mesh);
    });
    shots.length = 0;
    [...enemies].forEach((enemy) => {
      if (enemy.pos.z < -100) return;
      damageEnemy(enemy, enemy.boss ? 28 : 30, enemy.pos);
    });
    player.invuln = Math.max(player.invuln, 0.6);
    shake = Math.max(shake, 0.7);
    sfx.pulse();
    updateHud(true);
  };

  const killEnemy = (enemy, scored = true) => {
    if (enemy.dead) return;
    enemy.dead = true;
    const big = Boolean(enemy.boss);
    burst(enemy.pos, enemy.type.color, big ? 120 : 22, big ? 16 : 8, big ? 1.4 : 0.7, big ? 0.7 : 0.4);
    burst(enemy.pos, "#fff3c4", big ? 50 : 10, big ? 10 : 5, 0.5, 0.3);
    shockwave(enemy.pos, enemy.type.color, big ? 12 : 2.8, big ? 0.9 : 0.45);
    sfx.boom(big);
    shake = Math.max(shake, big ? 1 : 0.12);
    if (mode === "playing" && scored) {
      game.score += enemy.type.score * multiplier();
      game.kills += 1;
      game.combo += 1;
      game.comboTimer = 2.6;
      if (big) {
        for (let i = 0; i < 3; i += 1) spawnPower(tmp.copy(enemy.pos).add(tmp2.set(rand(-2.5, 2.5), rand(-1, 1), rand(-1, 1))));
      } else if (Math.random() < 0.09) {
        spawnPower(enemy.pos);
      }
    }
    if (big) {
      const name = isZh ? enemy.type.zh : enemy.type.en;
      if (ui.refs.boss) ui.refs.boss.hidden = true;
      game.boss = null;
      if (enemy.type.final) {
        game.winTimer = 2;
      } else if (mode === "playing") {
        showToast(format(TEXT.bossDown, { name }), 2);
        game.stage += 1;
        game.stageTime = 0;
        game.spawnTimer = 2.5;
        window.setTimeout(() => {
          if (mode === "playing") showToast(format(TEXT.stageStart, { n: game.stage + 1 }), 1.6);
        }, 2100);
      }
    }
    removeEntity(enemies, enemy);
  };

  function damageEnemy(enemy, damage, at) {
    if (enemy.dead) return;
    if (enemy.boss && enemy.pos.z < -60) {
      burst(at, "#ffffff", 3, 3, 0.25, 0.2);
      return;
    }
    enemy.hp -= damage;
    enemy.flash = 0.08;
    burst(at, enemy.type.color, 4, 4, 0.3, 0.25);
    if (enemy.boss && ui.refs.bossFill) ui.refs.bossFill.style.transform = `scaleX(${Math.max(0, enemy.hp / enemy.maxHp)})`;
    if (enemy.hp <= 0) killEnemy(enemy);
  }

  const hitPlayer = () => {
    if (mode !== "playing" || player.invuln > 0 || game.shield > 0) return;
    game.lives -= 1;
    game.combo = 0;
    player.invuln = 1.6;
    shake = Math.max(shake, 0.6);
    playerCenter(tmp);
    burst(tmp, "#ff5a45", 30, 9, 0.6, 0.4);
    sfx.hit();
    if (ui.root) {
      const hud = ui.root.querySelector(".soar-hud");
      hud.classList.add("soar-hud--hit");
      window.setTimeout(() => hud.classList.remove("soar-hud--hit"), 140);
    }
    updateHud(true);
    if (game.lives <= 0) endGame(false);
  };

  const collectPower = (power) => {
    const kind = power.kind;
    if (kind === "coffee") game.lives = Math.min(5, game.lives + 1);
    if (kind === "token") game.spread = 8;
    if (kind === "shield") game.shield = 6;
    if (kind === "gpu") game.rapid = 8;
    const [name, effect] = TEXT.powers[kind];
    showToast(`${name} · ${effect}`, 1.4);
    burst(power.pos, "#ffe08a", 24, 7, 0.6, 0.35);
    shockwave(power.pos, "#ffe08a", 2.4, 0.4);
    sfx.power();
    removeEntity(powers, power);
    updateHud(true);
  };

  /* HUD */
  const updateHud = (force) => {
    if (!ui.root || (!force && hudTimer > 0)) return;
    hudTimer = 0.1;
    const { refs } = ui;
    refs.score.textContent = game.score.toLocaleString("en-US");
    refs.combo.textContent = game.combo >= 3 ? format(TEXT.combo, { n: game.combo, m: multiplier() }) : "";
    refs.wave.textContent = format(TEXT.wave, { n: game.stage + 1 });
    refs.lives.textContent = "♥".repeat(Math.max(0, game.lives)) || "·";
    refs.pulse.textContent = `◆${game.pulse}`;
    const flight = player.form === "flight";
    refs.form.textContent = flight ? TEXT.flight : TEXT.walk;
    refs.form.classList.toggle("soar-hud__form--flight", flight);
    refs.form.classList.toggle("soar-hud__form--walk", !flight);
    const active = [];
    if (game.spread > 0) active.push(`${TEXT.powers.token[0]} ${Math.ceil(game.spread)}s`);
    if (game.rapid > 0) active.push(`${TEXT.powers.gpu[0]} ${Math.ceil(game.rapid)}s`);
    if (game.shield > 0) active.push(`${TEXT.powers.shield[0]} ${Math.ceil(game.shield)}s`);
    refs.powers.innerHTML = active.map((item) => `<span>${item}</span>`).join("");
  };

  /* Mode transitions */
  const setLabelsVisible = (visible) => labels.forEach((label) => (label.visible = visible));

  const openMenu = ({ deferUi = false } = {}) => {
    buildUI();
    if (!deferUi) enterPage();
    mode = "menu";
    clearField(true);
    resetGame();
    setForm("flight", true);
    player.pos.set(0, 3.2, 0);
    player.invuln = 0;
    robot.root.visible = true;
    ui.root.classList.remove("soar-game-ui--hud");
    if (!deferUi) revealMenu();
    if (ui.refs.boss) ui.refs.boss.hidden = true;
    setLabelsVisible(true);
    startLoop();
  };

  function revealMenu() {
    enterPage();
    showPanel("menu", { stats: game.best ? `${TEXT.best} <strong>${game.best}</strong>` : "" });
  }

  // The page sheet hits the ground: shake the camera and kick up dust along the runway.
  const impact = () => {
    shake = Math.max(shake, 1.15);
    const dust = toColor(palette.grid);
    const white = toColor("#ffffff");
    for (let i = 0; i < 150; i += 1) {
      const x = rand(-10, 10);
      emit(x, 0.15, rand(-14, 6), x * 0.35 + rand(-1.5, 1.5), rand(1.5, 5.5), rand(-2, 2), rand(0.6, 1.2), rand(0.35, 0.85), i % 3 ? dust : white);
    }
    shockwave(tmp.set(camera.position.x, 0.4, camera.position.z - 7), palette.grid, 14, 0.7);
    sfx.slam();
  };

  const startGame = () => {
    ensureAudio();
    enterPage();
    clearField(false);
    resetGame();
    mode = "playing";
    setForm("flight", true);
    player.pos.set(0, 3.2, 0);
    player.vel.set(0, 0);
    player.invuln = 1.2;
    robot.root.visible = true;
    keys.clear();
    pointer.active = false;
    hidePanel();
    ui.root.classList.add("soar-game-ui--hud");
    if (ui.refs.boss) ui.refs.boss.hidden = true;
    setLabelsVisible(true);
    updateHud(true);
    showToast(format(TEXT.stageStart, { n: 1 }), 1.6);
    canvas.focus?.({ preventScroll: true });
    startLoop();
  };

  const pauseGame = () => {
    if (mode !== "playing") return;
    mode = "paused";
    keys.clear();
    stopLoop();
    renderStill();
    showPanel("paused");
  };

  const resumeGame = () => {
    if (mode !== "paused") return;
    mode = "playing";
    hidePanel();
    lastTime = performance.now();
    startLoop();
  };

  const togglePause = () => {
    if (mode === "playing") pauseGame();
    else if (mode === "paused") resumeGame();
  };

  function endGame(won) {
    if (game.over) return;
    game.over = true;
    mode = "over";
    keys.clear();
    if (won) {
      clearField(true);
      sfx.win();
      playerCenter(tmp);
      for (let i = 0; i < 6; i += 1) burst(tmp, pick(["#ffc247", "#57d8ff", "#ff8a4a", "#7dff9a"]), 30, 14, 1.4, 0.45);
    } else {
      playerCenter(tmp);
      burst(tmp, "#ff5a45", 70, 12, 1, 0.5);
      shockwave(tmp, "#ff5a45", 6, 0.7);
      sfx.lose();
    }
    const previousBest = game.best;
    const newBest = game.score > previousBest;
    if (newBest) {
      game.best = game.score;
      storage.set(BEST_KEY, String(game.score));
    }
    const minutes = Math.floor(game.time / 60);
    const seconds = String(Math.floor(game.time % 60)).padStart(2, "0");
    const stats = [
      `${TEXT.score} <strong>${game.score}</strong>`,
      `${TEXT.best} <strong>${game.best}</strong>${newBest && game.score > 0 ? ` · ${TEXT.newBest}` : ""}`,
      `${TEXT.kills} <strong>${game.kills}</strong>`,
      `${TEXT.timeLabel} <strong>${minutes}:${seconds}</strong>`,
    ].join("<br>");
    window.setTimeout(
      () => {
        if (mode === "over") {
          showPanel("over", { title: won ? TEXT.winTitle : TEXT.loseTitle, text: won ? TEXT.winText : TEXT.loseText, stats });
        }
      },
      won ? 600 : 900
    );
  }

  const exitGame = () => {
    mode = "ambient";
    keys.clear();
    pointer.active = false;
    clearField(false);
    setForm("flight", true);
    robot.root.visible = true;
    setLabelsVisible(false);
    if (reducedMotion) leavePage();
    else risePage();
    if (!shouldAnimate()) {
      stopLoop();
      renderStill();
    }
  };

  game.best = Number(storage.get(BEST_KEY)) || 0;

  /* Per-frame updates */
  const updateEnvironment = (dt) => {
    travel += scrollSpeed * dt;
    chunks.forEach((chunk) => {
      let z = travel - chunk.index * CHUNK_LEN;
      if (z - CHUNK_LEN / 2 > 30) {
        chunk.index += CHUNK_COUNT;
        buildChunk(chunk);
        z = travel - chunk.index * CHUNK_LEN;
      }
      chunk.mesh.position.z = z;
    });
    grid.position.z = travel % 5;
    beacons.position.z = travel % 10;
    clouds.forEach((cloud) => {
      cloud.position.z += scrollSpeed * 0.55 * dt;
      if (cloud.position.z > 40) resetCloud(cloud, -300);
    });
    const motePosition = moteGeometry.attributes.position;
    for (let i = 0; i < MOTES; i += 1) {
      let z = motePosition.getZ(i) + scrollSpeed * dt;
      if (z > 20) {
        z -= 240;
        motePosition.setX(i, rand(-28, 28));
        motePosition.setY(i, rand(0.5, 18));
      }
      motePosition.setZ(i, z);
    }
    motePosition.needsUpdate = true;
  };

  const updateAutopilot = (dt) => {
    let target = null;
    let best = Infinity;
    enemies.forEach((enemy) => {
      const dz = -enemy.pos.z;
      if (dz < 8 || dz > 90) return;
      const score = Math.abs(enemy.pos.x - player.pos.x) + dz * 0.05;
      if (score < best) {
        best = score;
        target = enemy;
      }
    });
    let tx = Math.sin(time * 0.33) * 3.2 + Math.sin(time * 0.11) * 1.6;
    let ty = 3.4 + Math.sin(time * 0.47) * 1.1;
    if (target) {
      tx = target.pos.x;
      ty = target.pos.y;
    }
    const speed = 6;
    player.vel.x = damp(player.vel.x, clamp((tx - player.pos.x) * 2.2, -speed, speed), 4, dt);
    player.vel.y = damp(player.vel.y, clamp((ty - player.pos.y) * 2.2, -speed, speed), 4, dt);
    player.pos.x = clamp(player.pos.x + player.vel.x * dt, -7, 7);
    if (player.form === "flight") player.pos.y = clamp(player.pos.y + player.vel.y * dt, 1.4, 6.5);
    if (target && Math.abs(target.pos.x - player.pos.x) < 1.1 && (player.form === "walk" || Math.abs(target.pos.y - player.pos.y) < 1.1)) {
      tryFire(true);
    }
    autoTimer -= dt;
    if (autoTimer <= 0) {
      setForm(player.form === "flight" ? "walk" : "flight", true);
      autoTimer = player.form === "walk" ? 6 : 14;
    }
    ambientSpawn -= dt;
    if (ambientSpawn <= 0) {
      spawnEnemy(pick(["knot", "bug", "data", "grad", "knot", "reviewer"]), -160);
      ambientSpawn = rand(2.2, 3.4);
    }
  };

  const updatePlayerControl = (dt) => {
    const maxSpeed = player.form === "flight" ? 12.5 : 8.5;
    let ix = 0;
    let iy = 0;
    if (keys.has("left")) ix -= 1;
    if (keys.has("right")) ix += 1;
    if (keys.has("up")) iy += 1;
    if (keys.has("down")) iy -= 1;
    let vx = 0;
    let vy = 0;
    if (ix || iy) {
      const length = Math.hypot(ix, iy);
      vx = (ix / length) * maxSpeed;
      vy = (iy / length) * maxSpeed;
      pointer.active = false;
    } else if (pointer.active) {
      vx = clamp((pointer.x - player.pos.x) * 7, -maxSpeed, maxSpeed);
      vy = clamp((pointer.y - player.pos.y) * 7, -maxSpeed, maxSpeed);
    }
    player.vel.x = damp(player.vel.x, vx, 14, dt);
    player.vel.y = damp(player.vel.y, vy, 14, dt);
    const limit = 8.6 * lane();
    player.pos.x = clamp(player.pos.x + player.vel.x * dt, -limit, limit);
    if (player.form === "flight") player.pos.y = clamp(player.pos.y + player.vel.y * dt, 1.1, 7.6);
    tryFire(false);
  };

  const updatePlayerBody = (dt) => {
    player.flight = damp(player.flight, player.form === "flight" ? 1 : 0, 7, dt);
    if (player.form === "walk") player.pos.y = damp(player.pos.y, GROUND_Y, 9, dt);
    const posing = mode === "menu" || mode === "over";
    player.hover = damp(player.hover, posing ? 1 : 0, 4, dt);
    player.yaw = damp(player.yaw, posing ? Math.PI : 0, 3.2, dt);
    player.runPhase += dt * (player.form === "walk" ? 10 : 2);
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.formCooldown = Math.max(0, player.formCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    if (posing) {
      player.pos.x = damp(player.pos.x, 0, 2.5, dt);
      player.pos.y = damp(player.pos.y, 3.1, 2.5, dt);
    }

    robot.root.position.copy(player.pos);
    robot.root.position.y += Math.sin(time * 2.3) * 0.08 * player.flight;
    robot.root.rotation.set(0, player.yaw, -player.vel.x * 0.05 * (0.35 + player.flight * 0.65));
    poseRobot(time);
    const blink = mode === "playing" && player.invuln > 0 && Math.floor(time * 14) % 2 === 0;
    robot.body.visible = !blink && !(mode === "over" && game.lives <= 0);
    robot.shield.visible = game.shield > 0 && mode === "playing";
    robot.shield.rotation.y += dt * 1.5;

    const altitude = clamp((player.pos.y - 0.9) / 7, 0, 1);
    robot.shadow.position.x = player.pos.x;
    robot.shadow.position.z = player.pos.z + 0.1;
    robot.shadow.scale.setScalar(lerp(1.6, 2.6, altitude));
    robot.shadow.material.opacity = lerp(0.55, 0.15, altitude) * (robot.body.visible ? 1 : 0);
  };

  const updateGameRules = (dt) => {
    game.time += dt;
    hudTimer -= dt;
    game.spread = Math.max(0, game.spread - dt);
    game.rapid = Math.max(0, game.rapid - dt);
    game.shield = Math.max(0, game.shield - dt);
    if (game.comboTimer > 0) {
      game.comboTimer -= dt;
      if (game.comboTimer <= 0) game.combo = 0;
    }
    if (game.winTimer > 0) {
      game.winTimer -= dt;
      if (game.winTimer <= 0) endGame(true);
      return;
    }
    const stage = STAGES[Math.min(game.stage, STAGES.length - 1)];
    game.spawnTimer -= dt;
    if (!game.boss) {
      game.stageTime += dt;
      if (game.spawnTimer <= 0) {
        spawnEnemy(pick(stage.pool));
        game.spawnTimer = stage.every * rand(0.75, 1.25);
      }
      if (game.stageTime >= stage.duration) spawnBoss(stage.boss);
    } else if (game.spawnTimer <= 0) {
      spawnEnemy(pick(["knot", "bug"]));
      game.spawnTimer = 3.4;
    }
    game.gateTimer -= dt;
    if (game.gateTimer <= 0) {
      spawnGate(game.nextGate);
      game.nextGate = game.nextGate === "air" ? "ground" : "air";
      game.gateTimer = game.boss ? rand(12, 15) : rand(8, 11);
    }
    updateHud(false);
  };

  const enemyFire = (enemy) => {
    if (enemy.type.shooter === "aimed") fireShot(enemy.pos, aimDirection(enemy.pos, rand(-0.05, 0.05)), 20);
    if (enemy.type.shooter === "spread") [-0.2, 0, 0.2].forEach((offset) => fireShot(enemy.pos, aimDirection(enemy.pos, offset), 18));
  };

  const updateBoss = (boss, dt) => {
    const entering = boss.pos.z < -60;
    if (boss.kind === "storm") {
      boss.pos.z = entering ? boss.pos.z + 34 * dt : damp(boss.pos.z, -32, 2, dt);
      boss.pos.x = damp(boss.pos.x, Math.sin(boss.t * 0.55) * 5.2 * lane(), 2, dt);
      boss.pos.y = damp(boss.pos.y, 4.6 + Math.sin(boss.t * 0.9) * 1.3, 2, dt);
      boss.vortex.rotation.z += dt * 2.4;
      boss.vortex2.rotation.y += dt * 1.6;
      boss.core.scale.setScalar(1.15 + Math.sin(boss.t * 6) * 0.06);
      boss.papers.forEach((paper) => {
        const data = paper.userData;
        data.a += data.speed * dt;
        paper.position.set(Math.cos(data.a) * data.r, data.y + Math.sin(data.a * 2) * 0.4, Math.sin(data.a) * data.r * 0.6);
        paper.rotation.set(data.a, data.a * 1.3, 0);
      });
      if (!entering && mode === "playing") {
        const enraged = boss.hp < boss.maxHp / 2;
        boss.fireTimer -= dt;
        if (boss.fireTimer <= 0) {
          const count = enraged ? 16 : 12;
          const offset = rand(0, Math.PI * 2);
          for (let i = 0; i < count; i += 1) {
            const angle = offset + (i / count) * Math.PI * 2;
            fireShot(boss.pos, tmp.set(Math.cos(angle) * 0.33, Math.sin(angle) * 0.33, 1), 15, 0.28);
          }
          boss.fireTimer = enraged ? 1.7 : 2.3;
        }
        boss.aimTimer -= dt;
        if (boss.aimTimer <= 0) {
          fireShot(boss.pos, aimDirection(boss.pos), 21);
          boss.aimTimer = 1.1;
        }
      }
    } else if (boss.kind === "dragon") {
      if (entering) {
        boss.pos.z += 30 * dt;
        boss.pos.x = damp(boss.pos.x, Math.sin(boss.t * 0.75) * 6.5 * lane(), 2, dt);
      } else {
        boss.lungeTimer -= dt;
        if (boss.lungeTimer <= 0 && boss.lunge <= 0) {
          boss.lunge = 1.5;
          boss.lungeTimer = rand(7, 10);
          playerCenter(boss.lungeTarget);
          boss.lungeTarget.z = -5;
        }
        if (boss.lunge > 0) {
          boss.lunge -= dt;
          boss.pos.x = damp(boss.pos.x, boss.lungeTarget.x, 3, dt);
          boss.pos.y = damp(boss.pos.y, boss.lungeTarget.y, 3, dt);
          boss.pos.z = damp(boss.pos.z, boss.lungeTarget.z, 2.4, dt);
        } else {
          boss.pos.x = damp(boss.pos.x, Math.sin(boss.t * 0.75) * 6.5 * lane(), 2.5, dt);
          boss.pos.y = damp(boss.pos.y, 3.8 + Math.sin(boss.t * 1.25) * 2.4, 2.5, dt);
          boss.pos.z = damp(boss.pos.z, -30 + Math.sin(boss.t * 0.4) * 6, 1.6, dt);
        }
      }
      playerCenter(tmp);
      tmp.z = Math.max(tmp.z, boss.pos.z + 4);
      boss.head.lookAt(tmp);
      let previous = boss.pos;
      boss.segments.forEach((segment) => {
        tmp2.subVectors(segment.position, previous);
        const length = tmp2.length() || 1;
        const spacing = 1.0 * Math.max(0.55, segment.userData.size + 0.25);
        if (length > spacing) segment.position.copy(previous).addScaledVector(tmp2, spacing / length);
        segment.position.y += Math.sin(boss.t * 3 + segment.position.z) * 0.01;
        previous = segment.position;
      });
      if (!entering && mode === "playing") {
        boss.fireTimer -= dt;
        if (boss.fireTimer <= 0) {
          [-0.16, 0, 0.16].forEach((offset) => fireShot(boss.pos, aimDirection(boss.pos, offset), 19));
          boss.fireTimer = boss.hp < boss.maxHp / 2 ? 1.0 : 1.4;
        }
        boss.aimTimer -= dt;
        if (boss.aimTimer <= 0) {
          const segment = pick(boss.segments);
          fireShot(segment.position, aimDirection(segment.position), 16);
          boss.aimTimer = 2.4;
        }
      }
    } else if (boss.kind === "citadel") {
      boss.pos.z = entering ? boss.pos.z + 30 * dt : damp(boss.pos.z, -40, 1.6, dt);
      boss.pos.x = damp(boss.pos.x, Math.sin(boss.t * 0.35) * 3.2 * lane(), 1.5, dt);
      boss.pos.y = damp(boss.pos.y, 4.4 + Math.sin(boss.t * 0.7) * 0.8, 1.5, dt);
      boss.core.rotation.y += dt * 0.9;
      boss.rings.forEach((ring, index) => {
        ring.rotation.x += dt * (0.4 + index * 0.25);
        ring.rotation.y += dt * (0.3 - index * 0.12);
      });
      boss.turrets.forEach((turret, index) => {
        const angle = boss.t * 0.8 + (index * Math.PI) / 2;
        turret.position.set(Math.cos(angle) * 3.4, Math.sin(angle) * 2.1, 0.8);
        turret.lookAt(player.pos);
      });
      boss.shieldTimer -= dt;
      if (boss.shieldTimer <= 0) {
        boss.shielded = !boss.shielded;
        boss.shieldTimer = boss.shielded ? 3.5 : 4.5;
      }
      boss.shield.visible = boss.shielded;
      boss.shield.rotation.y += dt * 0.6;
      boss.core.material.emissiveIntensity = boss.shielded ? 0.2 : 0.8 + Math.sin(boss.t * 10) * 0.3;
      if (!entering && mode === "playing") {
        boss.fireTimer -= dt;
        if (boss.fireTimer <= 0) {
          boss.turrets.forEach((turret) => {
            tmp.copy(turret.position).add(boss.pos);
            fireShot(tmp, aimDirection(tmp, rand(-0.06, 0.06)), 18);
          });
          boss.fireTimer = 1.3;
        }
        if (boss.hp < boss.maxHp / 2) {
          boss.spiralTimer -= dt;
          if (boss.spiralTimer <= 0) {
            boss.spiral += 0.55;
            fireShot(boss.pos, tmp.set(Math.cos(boss.spiral) * 0.3, Math.sin(boss.spiral) * 0.3, 1), 14, 0.26);
            boss.spiralTimer = 0.22;
          }
        }
      }
    }
  };

  const updateEnemies = (dt) => {
    const live = mode === "playing";
    playerCenter(center);
    [...enemies].forEach((enemy) => {
      if (enemy.dead) return;
      enemy.t += dt;
      if (enemy.flash > 0) enemy.flash -= dt;
      const pop = enemy.flash > 0 ? 1.12 : 1;
      if (!enemy.boss || enemy.kind !== "dragon") enemy.group.scale.setScalar(damp(enemy.group.scale.x, pop, 20, dt));

      if (enemy.boss) {
        updateBoss(enemy, dt);
      } else {
        const type = enemy.type;
        if (type.hover && enemy.state === "approach" && enemy.pos.z > enemy.hoverZ && live) {
          enemy.state = "hover";
          enemy.hoverTime = rand(2.8, 4);
        }
        if (enemy.state === "hover") {
          enemy.hoverTime -= dt;
          enemy.pos.x += Math.sin(enemy.t * 1.6) * 2.2 * dt;
          enemy.pos.z += 1.2 * dt;
          if (enemy.hoverTime <= 0) enemy.state = "leave";
        } else {
          enemy.pos.addScaledVector(enemy.vel, dt);
        }
        if (type.zigzag) enemy.pos.x += Math.sin(enemy.t * 4) * 3 * dt;
        enemy.pos.x = clamp(enemy.pos.x, -10 * lane(), 10 * lane());

        if (enemy.kind === "knot" || enemy.kind === "meteor") {
          enemy.spin.rotation.x += dt * 1.3;
          enemy.spin.rotation.y += dt * 1.9;
        }
        if (enemy.kind === "meteor" && Math.random() < 0.7) {
          emit(
            enemy.pos.x + rand(-0.3, 0.3),
            enemy.pos.y + rand(-0.3, 0.3),
            enemy.pos.z - 0.6,
            rand(-1, 1),
            rand(-1, 1),
            -6,
            0.5,
            0.5,
            toColor("#ff8a3c")
          );
        }
        if (enemy.kind === "bug") enemy.legs.forEach((leg) => (leg.rotation.x = Math.sin(enemy.t * 14 + leg.userData.phase) * 0.45));
        if (enemy.kind === "reviewer") {
          enemy.eye.lookAt(center);
          enemy.ring.rotation.z += dt * 1.5;
        }
        if (enemy.kind === "data") {
          enemy.spin.rotation.y += dt * 1.2;
          enemy.cubes.forEach((cube) => {
            const data = cube.userData;
            data.a += data.speed * dt;
            cube.position.set(Math.cos(data.a) * data.r, Math.sin(data.a * 1.3) * data.r * 0.5 + data.tilt * 0.3, Math.sin(data.a) * data.r);
            cube.rotation.x += dt * 2;
            cube.rotation.y += dt * 1.5;
          });
        }
        if (enemy.kind === "gpu") {
          enemy.chip.rotation.z = Math.sin(enemy.t * 2) * 0.15;
          MAT.hot.emissiveIntensity = 0.9 + Math.sin(time * 9) * 0.5;
        }
        if (enemy.kind === "grad") {
          enemy.cap.rotation.y += dt * 1.4;
          enemy.pos.y += Math.sin(enemy.t * 2.2) * 0.6 * dt;
        }

        if (live && type.shooter && enemy.pos.z > -72 && enemy.pos.z < -8) {
          enemy.shootTimer -= dt;
          if (enemy.shootTimer <= 0) {
            enemyFire(enemy);
            enemy.shootTimer = type.shooter === "spread" ? rand(2, 2.6) : rand(1.6, 2.4);
          }
        }
        if (enemy.pos.z > 12) {
          removeEntity(enemies, enemy);
          return;
        }
        if (live && player.invuln <= 0 && game.shield <= 0 && enemy.pos.distanceTo(center) < enemy.radius * 0.72 + 0.5) {
          hitPlayer();
          killEnemy(enemy, false);
        }
      }
    });
  };

  const segmentStart = new THREE.Vector3();
  const segmentDelta = new THREE.Vector3();
  const closest = new THREE.Vector3();
  // Squared distance from point c to the segment [segmentStart, segmentStart + segmentDelta].
  const sweptDistanceSq = (c) => {
    const lengthSq = segmentDelta.lengthSq();
    let t = 0;
    if (lengthSq > 0) t = clamp(closest.subVectors(c, segmentStart).dot(segmentDelta) / lengthSq, 0, 1);
    closest.copy(segmentStart).addScaledVector(segmentDelta, t);
    return closest.distanceToSquared(c);
  };

  const updateBullets = (dt) => {
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const bullet = bullets[i];
      segmentStart.copy(bullet.pos);
      segmentDelta.copy(bullet.vel).multiplyScalar(dt);
      bullet.pos.add(segmentDelta);
      if (bullet.heavy) bullet.mesh.rotation.x += dt * 8;
      let hit = false;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (enemy.boss && enemy.kind === "citadel" && enemy.shielded) {
          if (sweptDistanceSq(enemy.pos) < 4.6 * 4.6) {
            bullet.pos.copy(closest);
            burst(bullet.pos, "#7ff0ff", 3, 4, 0.25, 0.22);
            hit = true;
            break;
          }
          continue;
        }
        const reach = enemy.radius + bullet.radius;
        if (sweptDistanceSq(enemy.pos) < reach * reach) {
          bullet.pos.copy(closest);
          damageEnemy(enemy, bullet.damage, bullet.pos);
          hit = true;
          break;
        }
        if (enemy.boss && enemy.kind === "dragon") {
          const blocked = enemy.segments.some((segment) => {
            const r = segment.userData.size + bullet.radius;
            return sweptDistanceSq(segment.position) < r * r;
          });
          if (blocked) {
            burst(bullet.pos, "#c9ffe6", 3, 4, 0.25, 0.22);
            hit = true;
            break;
          }
        }
      }
      if (hit || bullet.pos.z < -150 || Math.abs(bullet.pos.x) > 30 || bullet.pos.y > 30 || bullet.pos.y < -1) {
        bullet.pool.release(bullet.mesh);
        bullets.splice(i, 1);
      }
    }
  };

  const updateShots = (dt) => {
    playerCenter(center);
    const live = mode === "playing";
    for (let i = shots.length - 1; i >= 0; i -= 1) {
      const shot = shots[i];
      shot.pos.addScaledVector(shot.vel, dt);
      let gone = shot.pos.z > 14 || Math.abs(shot.pos.x) > 40 || shot.pos.y < -2 || shot.pos.y > 30;
      if (!gone && live) {
        const distance = shot.pos.distanceTo(center);
        if (game.shield > 0 && distance < 1.4) {
          burst(shot.pos, "#7ff0ff", 6, 4, 0.3, 0.25);
          gone = true;
        } else if (distance < shot.radius + 0.48) {
          hitPlayer();
          gone = true;
        }
      }
      if (gone) {
        shotPool.release(shot.mesh);
        shots.splice(i, 1);
      }
    }
    if (live && game.boss && game.boss.kind === "dragon" && player.invuln <= 0 && game.shield <= 0) {
      const dragon = game.boss;
      if (dragon.pos.distanceTo(center) < 1.5) hitPlayer();
      else if (dragon.segments.some((segment) => segment.position.distanceTo(center) < segment.userData.size + 0.4)) hitPlayer();
    }
  };

  const updateGates = (dt) => {
    playerCenter(center);
    [...gates].forEach((gate) => {
      gate.pos.z += scrollSpeed * dt;
      if (gate.ring) gate.ring.rotation.z += dt * 1.2;
      if (!gate.resolved && gate.pos.z >= 0 && mode === "playing") {
        gate.resolved = true;
        const multiplierValue = multiplier();
        if (gate.kind === "air") {
          const inside = player.flight > 0.5 && Math.hypot(center.x - gate.pos.x, center.y - gate.pos.y) < 1.8;
          if (inside) {
            game.score += 90 * multiplierValue;
            game.pulse = Math.min(3, game.pulse + 1);
            showToast(TEXT.gateAirClear, 1.4);
            shockwave(gate.pos, "#57d8ff", 5, 0.6);
            burst(gate.pos, "#57d8ff", 30, 8, 0.6, 0.35);
            sfx.gate();
          } else {
            showToast(TEXT.gateMiss, 0.9);
          }
        } else {
          const inArch = Math.abs(center.x - gate.pos.x) < 2.0 && player.pos.y < 2.7;
          if (inArch && player.form === "walk") {
            game.score += 120 * multiplierValue;
            game.lives = Math.min(5, game.lives + 1);
            showToast(TEXT.gateGroundClear, 1.4);
            shockwave(center, "#ffb248", 4, 0.6);
            burst(center, "#ffb248", 30, 8, 0.6, 0.35);
            sfx.gate();
          } else if (inArch) {
            showToast(TEXT.gateCrash, 1.4);
            hitPlayer();
          }
        }
        updateHud(true);
      }
      if (gate.pos.z > 14) removeEntity(gates, gate);
    });
  };

  const updatePowers = (dt) => {
    playerCenter(center);
    [...powers].forEach((power) => {
      power.t += dt;
      power.pos.z += scrollSpeed * 0.8 * dt;
      power.group.rotation.y += dt * 2.2;
      power.group.position.y += Math.sin(power.t * 3) * 0.4 * dt;
      if (mode === "playing" && power.pos.distanceTo(center) < 1.45) {
        collectPower(power);
        return;
      }
      if (power.pos.z > 12) removeEntity(powers, power);
    });
  };

  const updateCamera = (dt) => {
    const p = player.pos;
    const wide = window.innerWidth >= 992;
    const portrait = window.innerWidth < window.innerHeight;
    let fov = 52;
    let rate = 3;
    let shiftX = 0;
    let shiftY = 0;
    if (mode === "ambient") {
      const scroll = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1.6);
      const orbit = Math.sin(time * 0.06) * 0.42;
      const distance = isHome ? 6.6 : 10.5;
      tmp.set(p.x + Math.sin(orbit) * distance, p.y + 2.2 + scroll * 2.6, p.z + Math.cos(orbit) * distance);
      tmp2.set(p.x * 0.6, p.y + 0.6 - scroll * 0.9, p.z - 8);
      if (isHome && wide) shiftX = 0.2;
      else if (isHome) shiftY = window.innerWidth < 576 ? 0.3 : 0.24;
      rate = 1.6;
    } else if (mode === "menu" || mode === "over") {
      tmp.set(p.x + 1.0, p.y + 0.5, p.z + (portrait ? 6.8 : 4.7));
      tmp2.set(p.x - 0.3, p.y + 0.12, p.z);
      if (window.innerWidth >= 768) shiftX = 0.2;
      else shiftY = -0.2;
      rate = 2.6;
    } else {
      tmp.set(p.x * 0.55, p.y * 0.5 + (portrait ? 3.4 : 2.75), portrait ? 10.2 : 8.1);
      tmp2.set(p.x * 0.78, p.y * 0.72 + 0.7, -16);
      if (portrait) fov = 66;
      rate = 6;
    }
    camPos.x = damp(camPos.x, tmp.x, rate, dt);
    camPos.y = damp(camPos.y, tmp.y, rate, dt);
    camPos.z = damp(camPos.z, tmp.z, rate, dt);
    camLook.x = damp(camLook.x, tmp2.x, rate, dt);
    camLook.y = damp(camLook.y, tmp2.y, rate, dt);
    camLook.z = damp(camLook.z, tmp2.z, rate, dt);
    camera.position.copy(camPos);
    if (shake > 0) {
      camera.position.x += rand(-1, 1) * shake * 0.35;
      camera.position.y += rand(-1, 1) * shake * 0.35;
      shake = Math.max(0, shake - dt * 2.2);
    }
    camera.lookAt(camLook);
    camera.fov = damp(camera.fov, fov, 3, dt);
    view.x = damp(view.x, shiftX, 3, dt);
    view.y = damp(view.y, shiftY, 3, dt);
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (Math.abs(view.x) > 0.001 || Math.abs(view.y) > 0.001) camera.setViewOffset(width, height, -view.x * width, -view.y * height, width, height);
    else camera.clearViewOffset();
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
  };

  const update = (dt) => {
    time += dt;
    const targetSpeed = mode === "playing" ? 26 + game.stage * 2 : mode === "menu" || mode === "over" ? 7 : 13;
    scrollSpeed = damp(scrollSpeed, targetSpeed, 1.5, dt);
    updateEnvironment(dt);
    if (mode === "ambient") updateAutopilot(dt);
    if (mode === "playing") {
      updatePlayerControl(dt);
      updateGameRules(dt);
    }
    updatePlayerBody(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateShots(dt);
    updateGates(dt);
    updatePowers(dt);
    updateParticles(dt);
    updateRings(dt);
    updateCamera(dt);
  };

  /* Theme */
  const applyPalette = () => {
    palette = palettes[themeName()];
    scene.fog.color.copy(palette.fog);
    scene.fog.near = palette.fogNear;
    scene.fog.far = palette.fogFar;
    renderer.setClearColor(palette.fog);
    skyUniforms.top.value.copy(palette.skyTop);
    skyUniforms.horizon.value.copy(palette.skyHorizon);
    skyUniforms.bottom.value.copy(palette.skyBottom);
    skyUniforms.sunColor.value.copy(palette.sunGlow);
    hemi.color.copy(palette.hemiSky);
    hemi.groundColor.copy(palette.hemiGround);
    hemi.intensity = palette.hemiIntensity;
    sun.color.copy(palette.sunLight);
    sun.intensity = palette.sunIntensity;
    rim.color.copy(palette.rimLight);
    rim.intensity = palette.rimIntensity;
    chunks.forEach(paintChunk);
    gridMaterial.color.copy(palette.grid);
    gridMaterial.opacity = palette.gridOpacity;
    beaconMaterial.color.copy(palette.beacon);
    cloudMaterial.color.copy(palette.cloud);
    cloudMaterial.opacity = palette.cloudOpacity;
    stars.visible = palette.stars > 0;
    moteMaterial.color.copy(palette.motes);
  };

  /* Rendering loop */
  let rafId = 0;
  let lastTime = performance.now();
  let running = false;
  let slowFrames = 0;
  let sampledFrames = 0;

  const pixelRatio = () => {
    const dpr = window.devicePixelRatio || 1;
    return mode === "ambient" ? Math.min(dpr, 1.25) * pixelQuality : Math.min(dpr, 1.75);
  };

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    particleMaterial.uniforms.uScale.value = height * renderer.getPixelRatio() * 0.5;
  };

  const shouldAnimate = () => mode !== "ambient" || (!reducedMotion && !ambientDisabled && !document.hidden);

  const renderStill = () => {
    resize();
    renderer.render(scene, camera);
  };

  const loop = (now) => {
    rafId = window.requestAnimationFrame(loop);
    const elapsed = (now - lastTime) / 1000;
    if (mode === "ambient" && elapsed < 1 / 32) return;
    lastTime = now;
    if (mode === "paused") return;
    // rAF timestamps can precede the performance.now() taken in startLoop, so clamp at zero.
    const dt = clamp(elapsed, 0, 1 / 20);
    update(dt);
    renderer.render(scene, camera);

    if (mode === "ambient") {
      sampledFrames += 1;
      if (elapsed > 0.055) slowFrames += 1;
      if (sampledFrames >= 150) {
        if (slowFrames > 90) {
          pixelQuality *= 0.72;
          if (pixelQuality < 0.5) {
            ambientDisabled = true;
            stopLoop();
          }
          resize();
        }
        sampledFrames = 0;
        slowFrames = 0;
      }
    }
  };

  function startLoop() {
    resize();
    if (mode === "paused") {
      // Resizing clears the canvas; keep the frozen frame visible behind the pause panel.
      renderer.render(scene, camera);
      return;
    }
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = window.requestAnimationFrame(loop);
  }

  function stopLoop() {
    running = false;
    window.cancelAnimationFrame(rafId);
  }

  /* Input */
  const keyMap = {
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
  };

  window.addEventListener("keydown", (event) => {
    if (mode === "ambient" || pageFlipping) return;
    const key = event.key;
    if (key === "Escape") {
      event.preventDefault();
      exitGame();
      return;
    }
    if (key === "m" || key === "M") {
      toggleSound();
      return;
    }
    const onButton = event.target instanceof HTMLElement && event.target.closest(".soar-game-ui button");
    if (mode === "menu" || mode === "over") {
      if (!onButton && (key === "Enter" || key === " ")) {
        event.preventDefault();
        startGame();
      }
      return;
    }
    if (key === "p" || key === "P") {
      togglePause();
      return;
    }
    if (mode !== "playing") return;
    if (keyMap[key]) {
      keys.add(keyMap[key]);
      event.preventDefault();
    } else if (key === "f" || key === "F" || key === "Shift") {
      event.preventDefault();
      if (!event.repeat) toggleForm();
    } else if (key === " " || key === "e" || key === "E") {
      event.preventDefault();
      if (!event.repeat) firePulse();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (keyMap[event.key]) keys.delete(keyMap[event.key]);
  });
  // Losing focus only releases held keys; hiding the tab pauses (see visibilitychange).
  window.addEventListener("blur", () => keys.clear());

  const raycaster = new THREE.Raycaster();
  const playerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  canvas.addEventListener("pointermove", (event) => {
    if (mode !== "playing") return;
    if (event.pointerType === "touch") {
      const touch = pointer.touch;
      if (!touch || touch.id !== event.pointerId) return;
      pointer.x = touch.px + (event.clientX - touch.sx) * (20 / window.innerWidth);
      pointer.y = touch.py - (event.clientY - touch.sy) * (12 / window.innerHeight);
      pointer.active = true;
      return;
    }
    ndc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(playerPlane, tmp)) {
      pointer.x = tmp.x;
      pointer.y = tmp.y;
      pointer.active = true;
    }
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (mode !== "playing" || event.pointerType !== "touch") return;
    pointer.touch = { id: event.pointerId, sx: event.clientX, sy: event.clientY, px: player.pos.x, py: player.pos.y };
    pointer.x = player.pos.x;
    pointer.y = player.pos.y;
    pointer.active = true;
  });
  const endTouch = (event) => {
    if (pointer.touch && pointer.touch.id === event.pointerId) {
      pointer.touch = null;
      pointer.active = false;
    }
  };
  canvas.addEventListener("pointerup", endTouch);
  canvas.addEventListener("pointercancel", endTouch);

  const toggleSound = () => {
    audio.enabled = !audio.enabled;
    storage.set(SOUND_KEY, audio.enabled ? "on" : "off");
    if (audio.enabled) ensureAudio();
    ui.refs.soundButton?.classList.toggle("soar-hud__icon--off", !audio.enabled);
  };

  ui.handlers = {
    primary() {
      if (ui.panelState === "paused") resumeGame();
      else startGame();
    },
    exit: exitGame,
    pause: togglePause,
    sound: toggleSound,
    transform: toggleForm,
    pulse: firePulse,
  };

  window.addEventListener("resize", () => {
    if (running) resize();
    else renderStill();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (mode === "playing") pauseGame();
      stopLoop();
    } else if (shouldAnimate()) {
      startLoop();
    }
  });

  new MutationObserver(() => {
    applyPalette();
    if (!running) renderStill();
  }).observe(doc, { attributes: true, attributeFilter: ["data-theme"] });

  /* First frame */
  applyPalette();
  resize();
  for (let i = 0; i < 40; i += 1) update(1 / 30);
  renderer.render(scene, camera);
  host.classList.add("soar-world--ready");
  if (shouldAnimate()) startLoop();

  return {
    openMenu,
    revealMenu,
    impact,
    start: startGame,
    exit: exitGame,
  };
}

/* Boot ----------------------------------------------------------------------- */

let worldPromise = null;
let worldApi = null;

const loadWorld = () => {
  if (!worldPromise) {
    worldPromise = import("./three/three.module.min.js")
      .then((THREE) => {
        worldApi = createWorld(THREE);
        return worldApi;
      })
      .catch((error) => {
        console.warn("SOARLAB world unavailable:", error);
        return null;
      });
  }
  return worldPromise;
};

let opening = false;

const openGame = async () => {
  if (opening || pageFlipping || document.body.classList.contains("soar-in-game")) return;
  opening = true;
  buildUI();
  let world = worldApi;
  if (!world) {
    // Give three.js a moment; if it is still loading, show the loading panel instead of the slam.
    world = await Promise.race([loadWorld(), new Promise((resolve) => window.setTimeout(() => resolve("slow"), 1800))]);
  }
  if (world === "slow") {
    enterPage();
    ui.handlers.exit = () => leavePage();
    showPanel("loading");
    world = await loadWorld();
    if (world && document.body.classList.contains("soar-in-game")) world.openMenu();
  } else if (world && !reducedMotion) {
    world.openMenu({ deferUi: true });
    await slamPage(() => world.impact());
    world.revealMenu();
  } else if (world) {
    world.openMenu();
  }
  if (!world) {
    enterPage();
    ui.handlers.exit = () => leavePage();
    showPanel("error");
  }
  opening = false;
};

if (host) {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-soar-play], .soar-hero__logo");
    if (!trigger) return;
    event.preventDefault();
    openGame();
  });

  document.querySelectorAll(".soar-hero__logo").forEach((logo) => {
    logo.setAttribute("role", "button");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("title", TEXT.title);
    logo.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openGame();
    });
  });

  const query = new URLSearchParams(window.location.search).get("soar-game");
  if (query === "1" || query === "play") {
    openGame().then(() => {
      if (query === "play") loadWorld().then((world) => world?.start());
    });
  } else if (!saveData) {
    const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 600));
    const kickoff = () => idle(() => loadWorld(), { timeout: 2500 });
    if (document.readyState === "complete") kickoff();
    else window.addEventListener("load", kickoff, { once: true });
  }
}
