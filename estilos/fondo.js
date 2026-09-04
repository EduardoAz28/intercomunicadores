(function () {
  const canvas = document.getElementById('fondo-animado');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let ancho, alto, nodos = [];
  const DENSIDAD = 14000; // px² por nodo
  const DISTANCIA_MAX = 160;
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function medir() {
    ancho = canvas.width = window.innerWidth * devicePixelRatio;
    alto = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function crearNodos() {
    const cantidad = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / DENSIDAD));
    nodos = [];
    for (let i = 0; i < cantidad; i++) {
      nodos.push({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        r: (Math.random() * 1.6 + 1) * devicePixelRatio,
        fase: Math.random() * Math.PI * 2,
      });
    }
  }

  function paso(t) {
    ctx.clearRect(0, 0, ancho, alto);

    const distanciaMaxPx = DISTANCIA_MAX * devicePixelRatio;

    // conexiones
    for (let i = 0; i < nodos.length; i++) {
      for (let j = i + 1; j < nodos.length; j++) {
        const a = nodos[i], b = nodos[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < distanciaMaxPx) {
          const op = (1 - dist / distanciaMaxPx) * 0.18;
          ctx.strokeStyle = `rgba(63,193,255,${op})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodos con latido
    for (const n of nodos) {
      if (!reducirMovimiento) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > ancho) n.vx *= -1;
        if (n.y < 0 || n.y > alto) n.vy *= -1;
      }
      const latido = 1 + Math.sin(t / 900 + n.fase) * 0.35;
      const radio = n.r * latido;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,122,41,0.55)';
      ctx.arc(n.x, n.y, radio, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(63,193,255,0.75)';
      ctx.arc(n.x, n.y, radio * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reducirMovimiento) {
      requestAnimationFrame(paso);
    }
  }

  medir();
  crearNodos();
  requestAnimationFrame(paso);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      medir();
      crearNodos();
      if (reducirMovimiento) paso(0);
    }, 180);
  });

  if (reducirMovimiento) paso(0);
})();