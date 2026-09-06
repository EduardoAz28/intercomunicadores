(function () {
  'use strict';

  // =========================================================
  // VIDEO DE FONDO GLOBAL
  // =========================================================

  const video = document.getElementById('video-fondo');

  if (video) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const reproducirVideo = () => {
      const promesa = video.play();

      if (promesa !== undefined) {
        promesa.catch(() => {
          // Algunos navegadores bloquean el autoplay inicialmente.
          // Se intentará nuevamente mediante interacción.
        });
      }
    };

    if (video.readyState >= 2) {
      reproducirVideo();
    } else {
      video.addEventListener('loadeddata', reproducirVideo, {
        once: true
      });
    }

    // Intento adicional para navegadores que retrasan el autoplay.
    window.addEventListener('load', reproducirVideo, {
      once: true
    });

    document.addEventListener('touchstart', reproducirVideo, {
      once: true,
      passive: true
    });

    document.addEventListener('click', reproducirVideo, {
      once: true
    });
  }


  // =========================================================
  // CANVAS ANIMADO
  // =========================================================

  const canvas = document.getElementById('fondo-animado');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let ancho = 0;
  let alto = 0;
  let nodos = [];

  const DENSIDAD = 14000;
  const DISTANCIA_MAX = 160;

  const reducirMovimiento =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  // =========================================================
  // MEDIR CANVAS
  // =========================================================

  function medir() {

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    ancho =
      canvas.width =
      Math.floor(window.innerWidth * dpr);

    alto =
      canvas.height =
      Math.floor(window.innerHeight * dpr);

    canvas.style.width =
      window.innerWidth + 'px';

    canvas.style.height =
      window.innerHeight + 'px';
  }


  // =========================================================
  // CREAR NODOS
  // =========================================================

  function crearNodos() {

    const cantidad = Math.min(
      90,
      Math.floor(
        (window.innerWidth * window.innerHeight) /
        DENSIDAD
      )
    );

    nodos = [];

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    for (
      let i = 0;
      i < cantidad;
      i++
    ) {

      nodos.push({

        x:
          Math.random() * ancho,

        y:
          Math.random() * alto,

        vx:
          (Math.random() - 0.5) *
          0.18 *
          dpr,

        vy:
          (Math.random() - 0.5) *
          0.18 *
          dpr,

        r:
          (Math.random() * 1.6 + 1) *
          dpr,

        fase:
          Math.random() *
          Math.PI *
          2
      });
    }
  }


  // =========================================================
  // ANIMACIÓN DEL CANVAS
  // =========================================================

  function paso(t) {

    ctx.clearRect(
      0,
      0,
      ancho,
      alto
    );


    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    const distanciaMaxPx =
      DISTANCIA_MAX * dpr;


    // =====================================================
    // CONEXIONES
    // =====================================================

    for (
      let i = 0;
      i < nodos.length;
      i++
    ) {

      for (
        let j = i + 1;
        j < nodos.length;
        j++
      ) {

        const a = nodos[i];
        const b = nodos[j];

        const dx =
          a.x - b.x;

        const dy =
          a.y - b.y;

        const dist =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        if (
          dist <
          distanciaMaxPx
        ) {

          const op =
            (1 -
              dist /
              distanciaMaxPx) *
            0.18;

          ctx.strokeStyle =
            `rgba(63,193,255,${op})`;

          ctx.lineWidth = 1;

          ctx.beginPath();

          ctx.moveTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            b.x,
            b.y
          );

          ctx.stroke();
        }
      }
    }


    // =====================================================
    // NODOS
    // =====================================================

    for (const n of nodos) {

      if (!reducirMovimiento) {

        n.x += n.vx;
        n.y += n.vy;


        if (
          n.x < 0 ||
          n.x > ancho
        ) {
          n.vx *= -1;
        }


        if (
          n.y < 0 ||
          n.y > alto
        ) {
          n.vy *= -1;
        }
      }


      const latido =
        1 +
        Math.sin(
          t / 900 +
          n.fase
        ) *
        0.35;

      const radio =
        n.r *
        latido;


      // Punto naranja
      ctx.beginPath();

      ctx.fillStyle =
        'rgba(255,122,41,0.55)';

      ctx.arc(
        n.x,
        n.y,
        radio,
        0,
        Math.PI * 2
      );

      ctx.fill();


      // Punto azul
      ctx.beginPath();

      ctx.fillStyle =
        'rgba(63,193,255,0.75)';

      ctx.arc(
        n.x,
        n.y,
        radio * 0.45,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }


    if (!reducirMovimiento) {
      requestAnimationFrame(paso);
    }
  }


  // =========================================================
  // INICIAR
  // =========================================================

  medir();

  crearNodos();

  requestAnimationFrame(paso);


  // =========================================================
  // REDIMENSIONAR
  // =========================================================

  let resizeTimeout;

  window.addEventListener(
    'resize',
    () => {

      clearTimeout(
        resizeTimeout
      );

      resizeTimeout =
        setTimeout(
          () => {

            medir();

            crearNodos();

            if (reducirMovimiento) {
              paso(0);
            }

          },
          180
        );
    }
  );


  // =========================================================
  // ACCESIBILIDAD
  // =========================================================

  if (reducirMovimiento) {
    paso(0);
  }

})();