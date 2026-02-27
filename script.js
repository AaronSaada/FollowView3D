// --- Typewriter animation ---
document.fonts.ready.then(() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const items     = document.querySelectorAll('.taglines li');
  const durations = [0.3, 0.3, 0.4];
  const steps     = [18, 19, 30];
  const gap       = 0.05;

  let currentDelay = 0.4;

  items.forEach((li, i) => {
    const style = window.getComputedStyle(li);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const width = ctx.measureText(li.textContent.trim()).width;
    li.style.setProperty('--text-width', `${Math.ceil(width)}px`);

    const typingEnd = currentDelay + durations[i];
    li.style.animation = `
      typing     ${durations[i]}s steps(${steps[i]}, end) ${currentDelay}s forwards,
      hideCursor 0s ${typingEnd}s forwards
    `;
    currentDelay = typingEnd + gap;
  });
});

// --- Shapes animation ---
const isDesktop = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Config par forme : sélecteur, parallaxe, amplitude flottement, vitesse, décalage de phase
const shapesConfig = [
  { selector: '.cube-deco',     parallax: 0.05, floatAmp: 5,  floatSpeed: 0.0004, phase: 0 },
  { selector: '.triangle-deco', parallax: 0.08, floatAmp: 7,  floatSpeed: 0.0003, phase: 1.5 },
  { selector: '.circle-deco',   parallax: 0.03, floatAmp: 4,  floatSpeed: 0.0005, phase: 3.0 },
];

const shapes = shapesConfig.map(cfg => ({
  el:         document.querySelector(cfg.selector),
  parallax:   cfg.parallax,
  floatAmp:   cfg.floatAmp,
  floatSpeed: cfg.floatSpeed,
  phase:      cfg.phase,
  currentX:   0, currentY:  0,
  velocityX:  0, velocityY: 0,
  targetX:    0, targetY:   0,
}));

const STIFFNESS = 0.04;
const DAMPING   = 0.85;

let mouseActive = false;
let mouseX = 0, mouseY = 0;
let originX = 0, originY = 0;
let lastTime = null;
let floatTime = 0;

function initOrigins() {
  // On prend le centre du conteneur comme référence
  const phone = document.querySelector('.phone');
  const rect = phone.getBoundingClientRect();
  originX = rect.left + rect.width  / 2;
  originY = rect.top  + rect.height / 2;
}

window.addEventListener('load', () => {
  shapes.forEach(s => s.el.style.animation = 'none');
  initOrigins();
  requestAnimationFrame(tick);
});

window.addEventListener('resize', initOrigins);

function tick(timestamp) {
  const dt = lastTime ? timestamp - lastTime : 16;
  lastTime = timestamp;
  floatTime += dt;

  shapes.forEach(s => {
    if (mouseActive) {
      s.targetX = (mouseX - originX) * s.parallax;
      s.targetY = (mouseY - originY) * s.parallax;
    } else {
      s.targetX = 0;
      s.targetY = 0;
    }

    const forceX = (s.targetX - s.currentX) * STIFFNESS;
    const forceY = (s.targetY - s.currentY) * STIFFNESS;

    s.velocityX = (s.velocityX + forceX) * DAMPING;
    s.velocityY = (s.velocityY + forceY) * DAMPING;

    s.currentX += s.velocityX;
    s.currentY += s.velocityY;

    // Flottement indépendant par forme (phase différente)
    const floatY = Math.sin(floatTime * s.floatSpeed * Math.PI * 2 + s.phase) * s.floatAmp;

    s.el.style.transform = `translate(${s.currentX}px, ${s.currentY + floatY}px)`;
  });

  requestAnimationFrame(tick);
}

document.addEventListener('mousemove', (e) => {
  if (!isDesktop()) return;
  mouseActive = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.addEventListener('mouseleave', () => {
  if (!isDesktop()) return;
  mouseActive = false;
});


// --- Scroll reveal ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // déclenche une seule fois
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => {
  observer.observe(el);
});