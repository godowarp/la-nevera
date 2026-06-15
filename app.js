const routes = {
  '/': 'homeTemplate',
  '/trivial': 'trivialTemplate',
  '/barbaridad': 'barbaridadTemplate',
  '/runner': 'runnerTemplate'
};

const state = {
  sound: false,
  runner: null
};

const view = document.querySelector('#view');
const backButton = document.querySelector('#backButton');
const soundButton = document.querySelector('#soundButton');
const toast = document.querySelector('#toast');
let toastTimer;

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  return routes[hash] ? hash : '/';
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
  backButton.style.visibility = route === '/' ? 'hidden' : 'visible';
}

function render() {
  const route = getRoute();
  const templateId = routes[route];
  const template = document.querySelector(`#${templateId}`);
  view.innerHTML = '';
  view.appendChild(template.content.cloneNode(true));
  setActiveNav(route);
  view.focus({ preventScroll: true });
  bindCommonActions();
  if (route === '/runner') initRunner();
}

function bindCommonActions() {
  document.querySelectorAll('[data-toast]').forEach((item) => {
    item.addEventListener('click', () => showToast(item.dataset.toast));
  });

  document.querySelectorAll('.category-card').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach((card) => card.classList.remove('active'));
      item.classList.add('active');
      showToast(`${item.dataset.category}: categoría preparada para v2.`);
    });
  });
}

backButton.addEventListener('click', () => {
  if (getRoute() !== '/') window.location.hash = '#/';
});

soundButton.addEventListener('click', () => {
  state.sound = !state.sound;
  soundButton.textContent = state.sound ? '♫' : '♪';
  showToast(state.sound ? 'Sonido simbólico activado.' : 'Sonido simbólico desactivado.');
});

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  if (!window.location.hash) window.location.hash = '#/';
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => undefined);
  }
});

function initRunner() {
  const canvas = document.querySelector('#runnerCanvas');
  const overlay = document.querySelector('#runnerOverlay');
  const startButton = document.querySelector('#startRunner');
  const leftButton = document.querySelector('#moveLeft');
  const rightButton = document.querySelector('#moveRight');
  const scoreEl = document.querySelector('#runnerScore');
  const ctx = canvas.getContext('2d');
  const lanes = [90, 180, 270];

  const runner = {
    active: false,
    lane: 1,
    score: 0,
    speed: 2.4,
    ticks: 0,
    objects: [],
    touchStartX: null,
    animationId: null
  };

  state.runner = runner;

  function reset() {
    runner.active = true;
    runner.lane = 1;
    runner.score = 0;
    runner.speed = 2.4;
    runner.ticks = 0;
    runner.objects = [];
    scoreEl.textContent = '0';
    overlay.classList.add('hidden');
    cancelAnimationFrame(runner.animationId);
    loop();
  }

  function move(dir) {
    runner.lane = Math.max(0, Math.min(2, runner.lane + dir));
  }

  function spawn() {
    const isGood = Math.random() > 0.48;
    runner.objects.push({
      lane: Math.floor(Math.random() * 3),
      y: -40,
      type: isGood ? 'good' : 'bad',
      label: isGood ? ['★', '☕', '📼', '🧲'][Math.floor(Math.random() * 4)] : ['!', '☁', '💬', '🚩'][Math.floor(Math.random() * 4)]
    });
  }

  function drawBackground() {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, '#6d4acf');
    grd.addColorStop(0.55, '#f59bd0');
    grd.addColorStop(1, '#ffd08a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,.22)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 67 + runner.ticks * 0.4) % canvas.width;
      const y = (i * 41 + runner.ticks * 0.8) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 2.2 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(64, 25, 92, .28)';
    ctx.beginPath();
    ctx.moveTo(70, canvas.height);
    ctx.lineTo(150, 90);
    ctx.lineTo(210, 90);
    ctx.lineTo(290, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.42)';
    ctx.lineWidth = 2;
    [130, 230].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(175 + (x - 180) * 0.22, 95);
      ctx.stroke();
    });
  }

  function drawPlayer() {
    const x = lanes[runner.lane];
    const y = 440;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#241232';
    ctx.beginPath();
    ctx.roundRect(-21, -26, 42, 58, 16);
    ctx.fill();
    ctx.fillStyle = '#ff4fa3';
    ctx.beginPath();
    ctx.arc(0, -39, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe8f5';
    ctx.font = '700 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('C', 0, -33);
    ctx.restore();
  }

  function drawObject(obj) {
    const x = lanes[obj.lane];
    ctx.save();
    ctx.translate(x, obj.y);
    ctx.fillStyle = obj.type === 'good' ? '#ffe082' : '#ff4fa3';
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-22, -22, 44, 44, 15);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = obj.type === 'good' ? '#4b2a00' : '#fff';
    ctx.font = '800 22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.label, 0, 1);
    ctx.restore();
  }

  function checkCollision(obj) {
    return obj.lane === runner.lane && Math.abs(obj.y - 440) < 34;
  }

  function endRun(text) {
    runner.active = false;
    cancelAnimationFrame(runner.animationId);
    overlay.querySelector('strong').textContent = text;
    overlay.querySelector('p').textContent = `Puntuación provisional: ${runner.score}. La lógica de niveles quedará afinada en v2.`;
    startButton.textContent = 'Reiniciar prueba';
    overlay.classList.remove('hidden');
  }

  function loop() {
    runner.ticks += 1;
    runner.score += 1;
    scoreEl.textContent = runner.score.toLocaleString('es-ES');
    if (runner.ticks % 58 === 0) spawn();
    if (runner.ticks % 420 === 0) runner.speed += 0.18;

    drawBackground();
    runner.objects.forEach((obj) => {
      obj.y += runner.speed;
      drawObject(obj);
    });
    drawPlayer();

    runner.objects = runner.objects.filter((obj) => {
      if (checkCollision(obj)) {
        if (obj.type === 'good') {
          runner.score += 80;
          return false;
        }
        endRun('Drama ajeno detectado');
        return false;
      }
      return obj.y < canvas.height + 50;
    });

    if (runner.active) runner.animationId = requestAnimationFrame(loop);
  }

  startButton.addEventListener('click', reset);
  leftButton.addEventListener('click', () => move(-1));
  rightButton.addEventListener('click', () => move(1));

  window.addEventListener('keydown', (event) => {
    if (getRoute() !== '/runner') return;
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });

  canvas.addEventListener('touchstart', (event) => {
    runner.touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  canvas.addEventListener('touchend', (event) => {
    if (runner.touchStartX === null) return;
    const diff = event.changedTouches[0].clientX - runner.touchStartX;
    if (Math.abs(diff) > 30) move(diff > 0 ? 1 : -1);
    runner.touchStartX = null;
  }, { passive: true });

  drawBackground();
  drawPlayer();
}
