/* ============================================
   SkyPulse — Canvas Weather Animations
   ============================================ */

const canvas = document.getElementById('weather-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationId = null;
let _currentEffect = null;

/* --- Resize Canvas --- */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* --- Particle Classes --- */

class Raindrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.speed = 4 + Math.random() * 6;
    this.length = 15 + Math.random() * 20;
    this.opacity = 0.15 + Math.random() * 0.25;
    this.drift = -0.3 - Math.random() * 0.5;
  }

  update() {
    this.y += this.speed;
    this.x += this.drift;
    if (this.y > canvas.height + 20) this.reset();
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.drift * 2, this.y + this.length);
    ctx.strokeStyle = `rgba(174, 194, 224, ${this.opacity})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.radius = 1.5 + Math.random() * 3;
    this.speed = 0.5 + Math.random() * 1.5;
    this.opacity = 0.3 + Math.random() * 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.01 + Math.random() * 0.02;
    this.wobbleRange = 30 + Math.random() * 30;
  }

  update() {
    this.y += this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += Math.sin(this.wobble) * 0.5;
    if (this.y > canvas.height + 10) this.reset();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
  }
}

class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = 0.5 + Math.random() * 1.5;
    this.opacity = 0.2 + Math.random() * 0.6;
    this.twinkleSpeed = 0.005 + Math.random() * 0.015;
    this.phase = Math.random() * Math.PI * 2;
  }

  update() {
    this.phase += this.twinkleSpeed;
  }

  draw() {
    const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.phase));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

class FloatingCloud {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.y = 30 + Math.random() * (canvas.height * 0.3);
    this.width = 100 + Math.random() * 160;
    this.height = 40 + Math.random() * 40;
    this.speed = 0.15 + Math.random() * 0.35;
    this.opacity = 0.06 + Math.random() * 0.1;

    if (initial) {
      this.x = Math.random() * canvas.width;
    } else {
      this.x = -this.width - 20;
    }
  }

  update() {
    this.x += this.speed;
    if (this.x > canvas.width + this.width + 20) this.reset(false);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#fff';

    // Draw cloud shape with circles
    const cx = this.x + this.width / 2;
    const cy = this.y;

    ctx.beginPath();
    ctx.arc(cx, cy, this.height * 0.6, 0, Math.PI * 2);
    ctx.arc(cx - this.width * 0.25, cy + 5, this.height * 0.45, 0, Math.PI * 2);
    ctx.arc(cx + this.width * 0.25, cy + 5, this.height * 0.5, 0, Math.PI * 2);
    ctx.arc(cx - this.width * 0.1, cy - this.height * 0.2, this.height * 0.4, 0, Math.PI * 2);
    ctx.arc(cx + this.width * 0.15, cy - this.height * 0.15, this.height * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* --- Animation Loop --- */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  animationId = requestAnimationFrame(animate);
}

/* --- Set Weather Effect --- */
export function setWeatherEffect(weatherMain, isNight) {
  // Stop previous animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  particles = [];

  const effect = weatherMain.toLowerCase();
  _currentEffect = effect;

  switch (effect) {
    case 'rain':
    case 'drizzle': {
      const count = effect === 'drizzle' ? 50 : 120;
      for (let i = 0; i < count; i++) {
        const drop = new Raindrop();
        drop.y = Math.random() * canvas.height; // spread initial positions
        particles.push(drop);
      }
      break;
    }

    case 'snow': {
      for (let i = 0; i < 80; i++) {
        const flake = new Snowflake();
        flake.y = Math.random() * canvas.height;
        particles.push(flake);
      }
      break;
    }

    case 'thunderstorm': {
      for (let i = 0; i < 150; i++) {
        const drop = new Raindrop();
        drop.speed *= 1.5;
        drop.y = Math.random() * canvas.height;
        particles.push(drop);
      }
      // lightning handled via CSS overlay
      break;
    }

    case 'clouds': {
      for (let i = 0; i < 6; i++) {
        particles.push(new FloatingCloud());
      }
      break;
    }

    case 'clear': {
      if (isNight) {
        for (let i = 0; i < 100; i++) {
          particles.push(new Star());
        }
      } else {
        // A few gentle drifting clouds for clear day
        for (let i = 0; i < 3; i++) {
          particles.push(new FloatingCloud());
        }
      }
      break;
    }

    default: {
      // mist / haze / fog — gentle floating clouds
      for (let i = 0; i < 5; i++) {
        const cloud = new FloatingCloud();
        cloud.opacity = 0.08 + Math.random() * 0.08;
        cloud.width = 150 + Math.random() * 200;
        particles.push(cloud);
      }
      break;
    }
  }

  if (particles.length > 0) {
    animate();
  }
}

/**
 * Stop all animations and clear the canvas.
 */
export function clearEffects() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  _currentEffect = null;
}
