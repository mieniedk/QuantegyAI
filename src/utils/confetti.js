import { prefersReducedMotion } from './motion';

const COLORS = ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316'];

export function fireConfetti({ intensity = 'medium' } = {}) {
  if (prefersReducedMotion() || typeof document === 'undefined') return;
  const count = intensity === 'high' ? 100 : intensity === 'low' ? 30 : 60;
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '99999',
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const pieces = Array.from({ length: count }, () => ({
    x: canvas.width * (0.3 + Math.random() * 0.4),
    y: canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 14,
    vy: -8 - Math.random() * 10,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * Math.PI * 2,
    rv: (Math.random() - 0.5) * 0.3,
    gravity: 0.18 + Math.random() * 0.08,
    opacity: 1,
  }));

  let frame;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rot += p.rv;
      p.opacity -= 0.006;
      if (p.opacity <= 0 || p.y > canvas.height + 40) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      frame = requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  frame = requestAnimationFrame(tick);

  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 4000);
}
