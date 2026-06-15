const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
let toastTimer;
let runnerLane = 1;
let runnerTimer;
let runnerScore = 0;

const templates = {
  home: 'home-template',
  trivial: 'trivial-template',
  barbaridad: 'barbaridad-template',
  runner: 'runner-template'
};

function routeFromHash() {
  const route = (window.location.hash || '#home').replace('#', '');
  return templates[route] ? route : 'home';
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function navigate(route) {
  window.location.hash = route;
}

function render() {
  clearInterval(runnerTimer);
  runnerTimer = null;
  const route = routeFromHash();
  const template = document.querySelector(`#${templates[route]}`);
  app.innerHTML = '';
  app.appendChild(template.content.cloneNode(true));
  app.focus({ preventScroll: true });
  bindCommonActions();
  if (route === 'runner') initRunner();
}

function bindCommonActions() {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.route));
  });

  document.querySelectorAll('[data-toast]').forEach((el) => {
    el.addEventListener('click', () => showToast(el.dataset.toast));
  });
}

function initRunner() {
  runnerLane = 1;
  runnerScore = 0;
  const character = document.querySelector('#runnerCharacter');
  const score = document.querySelector('#runnerScore');
  const left = document.querySelector('#runnerLeft');
  const right = document.querySelector('#runnerRight');
  const board = document.querySelector('#runnerBoard');

  function paint() {
    const positions = ['16.6%', '50%', '83.4%'];
    character.style.left = `calc(${positions[runnerLane]} - 28px)`;
  }

  function move(delta) {
    runnerLane = Math.max(0, Math.min(2, runnerLane + delta));
    paint();
  }

  left.addEventListener('click', () => move(-1));
  right.addEventListener('click', () => move(1));

  let startX = null;
  board.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  board.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const diff = event.clientX - startX;
    if (Math.abs(diff) > 30) move(diff > 0 ? 1 : -1);
    startX = null;
  });

  document.onkeydown = (event) => {
    if (routeFromHash() !== 'runner') return;
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  };

  runnerTimer = setInterval(() => {
    runnerScore += 10;
    score.textContent = runnerScore.toLocaleString('es-ES');
  }, 450);

  paint();
}

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  if (!window.location.hash) window.location.hash = 'home';
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
