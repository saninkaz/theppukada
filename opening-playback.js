/* The first downward scroll plays the existing opening once, independent of scroll distance. */
window.createTheppuPlayback = (hero, motionPreference, onUpdate) => {
  const duration = 3000;
  const finalFrame = .8; // The existing artwork has fully revealed the tagline by .785.
  const inputs = new AbortController();
  let state = 'idle', progress = 0, startedAt = 0, frame = 0, touchY = null;
  const pin = () => window.scrollTo({top: hero.offsetTop, behavior: 'instant'});
  const nearTop = () => Math.abs(hero.getBoundingClientRect().top) < 3;
  const interactive = target => target instanceof Element &&
    target.closest('a, button, input, textarea, select, [contenteditable="true"], [role="button"]');

  function finish() {
    cancelAnimationFrame(frame);
    state = 'complete';
    progress = finalFrame;
    inputs.abort();
    onUpdate();
  }

  function tick(now) {
    progress = Math.min(finalFrame, (now - startedAt) / duration * finalFrame);
    onUpdate();
    if (progress >= finalFrame) finish();
    else frame = requestAnimationFrame(tick);
  }

  function start() {
    if (state !== 'idle') return;
    if (motionPreference.matches) { finish(); return; }
    state = 'playing';
    startedAt = performance.now();
    pin();
    frame = requestAnimationFrame(tick);
  }

  function consume(event, downward) {
    if (state === 'idle' && downward && nearTop()) start();
    if (state === 'playing' && event.cancelable) event.preventDefault();
  }

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    consume(event, event.deltaY > 0);
  }, {passive: false, signal: inputs.signal});
  window.addEventListener('touchstart', event => {
    touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
  }, {passive: true, signal: inputs.signal});
  window.addEventListener('touchmove', event => {
    if (touchY === null || event.touches.length !== 1) return;
    consume(event, touchY - event.touches[0].clientY > 4);
  }, {passive: false, signal: inputs.signal});
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state === 'playing') { finish(); return; }
    if (interactive(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
    const downward = ['ArrowDown', 'PageDown', 'End'].includes(event.key) ||
      (event.key === ' ' && !event.shiftKey);
    if (downward || ['ArrowUp', 'PageUp', 'Home', ' '].includes(event.key)) consume(event, downward);
  }, {signal: inputs.signal});
  window.addEventListener('scroll', () => {
    if (state === 'playing') { if (!nearTop()) pin(); return; }
    if (state !== 'idle' || window.scrollY <= hero.offsetTop + 2) return;
    // Preserve restored positions and links into later sections; catch scrollbar scrolling in the hero.
    if (window.scrollY >= hero.offsetTop + hero.offsetHeight || (location.hash && location.hash !== '#top')) finish();
    else start();
  }, {passive: true, signal: inputs.signal});
  motionPreference.addEventListener('change', event => { if (event.matches) finish(); });
  window.addEventListener('pagehide', () => { if (state === 'playing') finish(); });

  if (motionPreference.matches || window.scrollY > hero.offsetTop + 2 ||
      (location.hash && location.hash !== '#top')) finish();
  return {get progress() { return progress; }, finish};
};
