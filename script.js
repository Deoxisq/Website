/**
 * Set your birth date/time here (ISO 8601). Include time zone for accuracy.
 * Examples:
 *   '2005-08-22T03:14:07.000-05:00'   // Houston/CDT-style offset
 *   '2005-08-22T08:14:07.000Z'        // UTC
 *
 * Until you know your exact birth time, a date is fine -- it'll just default
 * to midnight in your local zone.
 */
const BIRTH_INSTANT_ISO = "2005-08-22T03:14:07.000-05:00";

const DECIMAL_PLACES = 13;

const MS_PER_JULIAN_YEAR = 31556952000n;
const SCALE = 10n ** BigInt(DECIMAL_PLACES);

function parseBirthInstant() {
  if (!BIRTH_INSTANT_ISO || typeof BIRTH_INSTANT_ISO !== "string") {
    return null;
  }
  const t = Date.parse(BIRTH_INSTANT_ISO);
  return Number.isFinite(t) ? t : null;
}

function decimalYearsString(diffMs) {
  if (diffMs < 0) diffMs = 0;
  const diffBig = BigInt(diffMs);
  const scaled = (diffBig * SCALE) / MS_PER_JULIAN_YEAR;
  const intPart = scaled / SCALE;
  const fracPart = scaled % SCALE;
  return `${intPart.toString()}.${fracPart
    .toString()
    .padStart(DECIMAL_PLACES, "0")}`;
}

function updateAgeDisplay() {
  const decimalEl = document.getElementById("age-decimal");
  if (!decimalEl) return;

  const birthMs = parseBirthInstant();
  if (birthMs == null) {
    decimalEl.textContent = "--";
    return;
  }

  const diff = Math.max(0, Date.now() - birthMs);
  decimalEl.textContent = decimalYearsString(diff);
}

function tick() {
  updateAgeDisplay();
  requestAnimationFrame(tick);
}

const WATER_CHARS = ["·", "˙", "∙", "˚", "~", "≈", "°", "·"];
const FISH_TYPES = [
  { right: "><>", left: "<><", speed: [0.35, 0.7] },
  { right: "><°>", left: "<°><", speed: [0.25, 0.55] },
  { right: ">°°°>", left: "<°°°<", speed: [0.45, 0.85] },
  { right: "><))°>", left: "<°((><", speed: [0.3, 0.6] },
  { right: ">°))))═══>", left: "<═══°°°°<", speed: [0.2, 0.45] },
  {
    right: ["/\\_/\\", "( o.o )", " > ^ <"],
    left: ["/\\_/\\", "( o.o )", " < ^ >"],
    speed: [0.15, 0.35],
    multi: true,
  },
];

function initAquarium() {
  const canvas = document.getElementById("aquarium");
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const cell = 14;
  let cols = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let water = [];
  let fish = [];
  let bubbles = [];
  let seaweed = [];
  let frame = 0;
  let rafId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / cell) + 2;
    rows = Math.ceil(height / cell) + 2;
    buildScene();
  }

  function buildScene() {
    water = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const depth = y / rows;
        const chance = 0.12 + depth * 0.22;
        if (Math.random() > chance) continue;
        water.push({
          x,
          y,
          char: WATER_CHARS[(x * 7 + y * 3) % WATER_CHARS.length],
          phase: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.015,
        });
      }
    }

    const fishCount = Math.max(6, Math.floor((width * height) / 90000));
    fish = Array.from({ length: fishCount }, (_, i) => {
      const type = FISH_TYPES[i % FISH_TYPES.length];
      const dir = Math.random() > 0.5 ? 1 : -1;
      const speed =
        type.speed[0] +
        Math.random() * (type.speed[1] - type.speed[0]);
      return {
        type,
        x: Math.random() * width,
        y: height * (0.18 + Math.random() * 0.62),
        dir,
        speed: speed * (reducedMotion ? 0.25 : 1),
        waveAmp: 8 + Math.random() * 18,
        waveFreq: 0.004 + Math.random() * 0.006,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.35 + Math.random() * 0.45,
      };
    });

    const bubbleCount = Math.max(10, Math.floor(width / 90));
    bubbles = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * height,
      r: 1 + Math.random() * 2.5,
      speed: 0.25 + Math.random() * 0.55,
      wobble: Math.random() * Math.PI * 2,
    }));

    const plantCount = Math.max(8, Math.floor(width / 110));
    seaweed = Array.from({ length: plantCount }, (_, i) => {
      const segments = 4 + Math.floor(Math.random() * 5);
      const chars = ["|", "¦", "│", "╽", "╿"];
      return {
        x: (i + 0.5) * (width / plantCount) + (Math.random() - 0.5) * 30,
        segments,
        char: chars[i % chars.length],
        phase: Math.random() * Math.PI * 2,
        sway: 0.008 + Math.random() * 0.012,
      };
    });
  }

  function drawWater(t) {
    ctx.font = `${cell}px "DM Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    for (const p of water) {
      const drift = Math.sin(t * 0.001 + p.phase) * 0.4 + p.drift * t;
      const alpha = 0.06 + (p.y / rows) * 0.1;
      ctx.fillStyle = `rgba(140, 175, 190, ${alpha})`;
      ctx.fillText(p.char, p.x * cell + drift, p.y * cell);
    }
  }

  function drawSeaweed(t) {
    ctx.font = `${cell}px "DM Mono", ui-monospace, monospace`;
    ctx.textBaseline = "bottom";
    for (const plant of seaweed) {
      for (let s = 0; s < plant.segments; s++) {
        const sway = Math.sin(t * plant.sway + plant.phase + s * 0.6) * 6;
        const alpha = 0.14 + s * 0.04;
        ctx.fillStyle = `rgba(95, 130, 105, ${alpha})`;
        ctx.fillText(
          plant.char,
          plant.x + sway * (s / plant.segments),
          height - s * cell - 4
        );
      }
    }
  }

  function drawFish(t) {
    ctx.font = `500 ${cell}px "DM Mono", ui-monospace, monospace`;
    ctx.textBaseline = "middle";
    for (const f of fish) {
      if (!reducedMotion) {
        f.x += f.speed * f.dir;
        if (f.x < -80) {
          f.x = width + 40;
          f.y = height * (0.18 + Math.random() * 0.62);
        } else if (f.x > width + 80) {
          f.x = -40;
          f.y = height * (0.18 + Math.random() * 0.62);
        }
      }

      const bob = Math.sin(t * f.waveFreq + f.phase) * f.waveAmp;
      const label = f.dir > 0 ? f.type.right : f.type.left;
      const lines = Array.isArray(label) ? label : [label];

      ctx.save();
      ctx.globalAlpha = f.opacity;
      ctx.fillStyle = "rgba(235, 240, 245, 0.9)";
      lines.forEach((line, i) => {
        const lineOffset = (i - (lines.length - 1) / 2) * cell;
        ctx.fillText(line, f.x, f.y + bob + lineOffset);
      });
      ctx.restore();
    }
  }

  function drawBubbles(t) {
    for (const b of bubbles) {
      if (!reducedMotion) {
        b.y -= b.speed;
        b.x += Math.sin(t * 0.003 + b.wobble) * 0.25;
        if (b.y < -10) {
          b.y = height + 10;
          b.x = Math.random() * width;
        }
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(170, 200, 215, ${0.12 + b.r * 0.06})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  function drawFrame(t) {
    frame++;
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      width * 0.1,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, "rgba(12, 18, 22, 0.35)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.85)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    drawWater(t);
    drawSeaweed(t);
    drawBubbles(t);
    drawFish(t);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(drawFrame);
    }
  }

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) drawFrame(0);
  });
  drawFrame(0);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
  };
}

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.querySelectorAll(".section, .hero, .site-header").forEach((el) => {
    el.classList.add("reveal");
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  initAquarium();
  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
