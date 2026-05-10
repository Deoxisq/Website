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

function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.querySelectorAll(".section, .hero").forEach((el) => {
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

  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
