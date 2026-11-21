/* =========================================================
   VANSH.SYS — interactions & motion
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- text scramble ---------------- */
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFX";
  function scramble(el, finalText, dur = 900) {
    const start = performance.now();
    const len = finalText.length;
    return new Promise((res) => {
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const fixed = Math.floor(p * len);
        let out = "";
        for (let i = 0; i < len; i++) {
          if (i < fixed || finalText[i] === " ") out += finalText[i];
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(tick); else { el.textContent = finalText; res(); }
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------------- boot sequence ---------------- */
  const bootLines = [
    ['<span class="vi">VANSH.SYS</span> v2026.11 — secure boot', 120],
    ["[ <span class=\"ok\">OK</span> ] mounting /projects ........ 6 found", 160],
    ["[ <span class=\"ok\">OK</span> ] loading LLM weights ........ done", 160],
    ["[ <span class=\"ok\">OK</span> ] indexing 10,600 passages ... pgvector ready", 170],
    ["[ <span class=\"warn\">!!</span> ] scanning for prompt injection ... 0 threats", 190],
    ["[ <span class=\"ok\">OK</span> ] calibrating curiosity ...... 100%", 160],
    ["", 80],
    ["&gt; access granted. welcome.", 260],
  ];
  const boot = $("#boot"), log = $("#bootLog"), bar = $("#bootBar");
  let booted = false;
  function finishBoot() {
    if (booted) return; booted = true;
    document.body.classList.remove("is-loading");
    if (!hasGSAP || reduce) { boot.remove(); startHero(); return; }
    const tl = gsap.timeline();
    tl.to("#curtain span", { scaleY: 1, duration: .45, stagger: .06, ease: "power3.in" })
      .set(boot, { display: "none" })
      .set("#curtain span", { transformOrigin: "top" })
      .to("#curtain span", { scaleY: 0, duration: .55, stagger: .06, ease: "power3.out" })
      .add(startHero, "-=.45");
  }
  async function runBoot() {
    if (sessionStorage.getItem("booted") || reduce) { finishBoot(); return; }
    sessionStorage.setItem("booted", "1");
    let html = "";
    for (let i = 0; i < bootLines.length; i++) {
      if (booted) return;
      html += bootLines[i][0] + "\n";
      log.innerHTML = html;
      bar.style.width = `${((i + 1) / bootLines.length) * 100}%`;
      await new Promise((r) => setTimeout(r, bootLines[i][1]));
    }
    setTimeout(finishBoot, 250);
  }
  $("#bootSkip").addEventListener("click", finishBoot);
  addEventListener("keydown", (e) => { if (!booted && (e.key === "Enter" || e.key === "Escape")) finishBoot(); });

  /* ---------------- hero ---------------- */
  const roles = ["LLM apps", "RAG systems", "AI agents", "secure AI", "security tools", "things that ship"];

  /* ---------------- holographic HUD ---------------- */
  function initHud() {
    const hero = $("#hero"), cv = $("#hud"), box = $("#heroName");
    if (!cv || !box) return;
    const ctx = cv.getContext("2d");
    const DPR = Math.min(devicePixelRatio || 1, 2);
    const TAU = Math.PI * 2;
    let W = 0, H = 0, cx = 0, cy = 0, R = 0, visible = true;
    const t0 = performance.now();
    function size() {
      const hb = hero.getBoundingClientRect(), bb = box.getBoundingClientRect();
      W = hb.width; H = hb.height;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = bb.left - hb.left + bb.width / 2; cy = bb.top - hb.top + bb.height / 2;
      R = Math.min(H * .38, W * .46, 400);
    }
    const isLight = () => document.documentElement.dataset.theme === "light";
    let rgb = "90,220,255";
    const col = (a) => `rgba(${rgb},${a})`;
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    function ring(r, a0, a1, w, a) { ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), a0, a1); ctx.lineWidth = w; ctx.strokeStyle = col(a); ctx.stroke(); }
    function draw(now) {
      if (!reduce) requestAnimationFrame(draw);
      if (!visible) return;
      const t = (now - t0) / 1000, k = reduce ? 1 : ease(t / 2.4), light = isLight();
      rgb = light ? "40,70,120" : "170,205,240";
      const A = (light ? .7 : .75) * k;                       // everything stays quiet
      ctx.clearRect(0, 0, W, H);
      // faint core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
      g.addColorStop(0, col((light ? .04 : .06) * k)); g.addColorStop(1, col(0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const r = R * (.92 + .08 * k);
      // outer tick ring — hairlines, very slow
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .012);
      ctx.strokeStyle = col(.35 * A); ctx.lineWidth = .75; ctx.beginPath();
      for (let i = 0; i < 120; i++) {
        const a = i / 120 * TAU, len = i % 10 === 0 ? 10 : 4;
        ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * (r - len), Math.sin(a) * (r - len));
      }
      ctx.stroke(); ctx.restore();
      ring(r + 10, 0, TAU, .75, .2 * A);
      // two slow arcs
      const a2 = -t * .05;
      ring(r * .88, a2, a2 + 1.6, 1.2, .5 * A);
      ring(r * .88, a2 + Math.PI, a2 + Math.PI + 1.6, 1.2, .5 * A);
      // fine dotted ring
      ctx.setLineDash([1, 9]); ctx.lineDashOffset = -t * 4;
      ring(r * .76, 0, TAU, 1, .45 * A);
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      // soft breathing ring
      ring(r * .64, 0, TAU, .75, (.22 + .1 * Math.sin(t * .8)) * A);
      ring(r * .52, t * .08, t * .08 + 2.4, .9, .35 * A);
      // four small markers
      ctx.fillStyle = col(.5 * A);
      for (let i = 0; i < 4; i++) {
        const a = t * .03 + i * TAU / 4;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * .88, cy + Math.sin(a) * r * .88, 1.8, 0, TAU); ctx.fill();
      }
    }
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 150); });
    size(); requestAnimationFrame(draw);
    window.__hudRedraw = () => reduce && requestAnimationFrame(draw);
  }

  /* HUD side panels: visitor's local time */
  function initHudPanels() {
    const clock = $("#hudClock");
    if (!clock) return;
    const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  /* greeting line + soft waveform */
  function initVoice() {
    const wave = $("#hudWave"), say = $("#hudSay");
    if (!wave || !say) return;
    const bars = Array.from({ length: 24 }, () => wave.appendChild(document.createElement("span")));
    let speaking = false;
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const lines = [`${greet}, and welcome.`, "Scroll to explore my work."];
    if (reduce) { say.textContent = lines[1]; return; }
    (function animate() {
      if (!document.hidden) {
        const t = performance.now() / 1000;
        bars.forEach((b, i) => {
          const c = Math.abs(i - (bars.length - 1) / 2) / (bars.length / 2);
          const amp = speaking ? (.35 + .65 * Math.abs(Math.sin(t * 9 + i * .9))) * (1 - c * .8) : .12 + .05 * Math.sin(t * 1.6 + i * .5);
          b.style.height = (2 + amp * 14).toFixed(1) + "px";
        });
      }
      setTimeout(animate, 90);
    })();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1600);
      for (const l of lines) {
        speaking = true; say.textContent = "";
        for (const ch of l) { say.textContent += ch; await sleep(ch === " " ? 30 : 45); }
        speaking = false;
        if (l !== lines[lines.length - 1]) await sleep(2200);
      }
    })();
  }

  function startHero() {
    initHud(); initHudPanels(); initVoice();
    // split the name into letters inside clip boxes for a clean rise-in
    const name = $("#heroName");
    $$(".hero__word", name).forEach((w) => {
      w.innerHTML = [...w.textContent].map((c) => `<span class="hero__clip" aria-hidden="true"><span class="hero__ch">${c}</span></span>`).join("");
    });
    if (hasGSAP && !reduce) {
      gsap.from(".hero__ch", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: .045, delay: .35 });
      gsap.from([".hero__eyebrow", ".hud-voice", ".hero__tags", ".hero__role", ".hero__cta .btn"],
        { y: 24, opacity: 0, duration: .9, ease: "power3.out", stagger: .08, delay: .9 });
      gsap.from(".nav", { y: -80, opacity: 0, duration: 1, ease: "expo.out", delay: .1 });
      gsap.from(".hud-panel--l", { x: -40, opacity: 0, duration: 1, ease: "expo.out", delay: 1.5 });
      gsap.from(".hud-panel--r", { x: 40, opacity: 0, duration: 1, ease: "expo.out", delay: 1.6 });
      gsap.from(".hud-frame i", { opacity: 0, duration: 1.2, ease: "power2.out", stagger: .08, delay: .6 });
    }
    let r = 0;
    const rot = $("#rotator");
    setInterval(() => { r = (r + 1) % roles.length; scramble(rot, roles[r], 650); }, 2400);
  }

  /* ---------------- WebGL aurora ---------------- */
  (function aurora() {
    const c = $("#aurora");
    const gl = c.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) { c.style.background = "radial-gradient(circle at 30% 20%,#1d1660,#07091a 60%)"; return; }
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `precision highp float;
      uniform vec2 r; uniform float t; uniform vec2 m; uniform float s; uniform float L;
      vec3 hash3(vec2 p){ return fract(sin(vec3(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)),dot(p,vec2(419.2,371.9))))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        float a=dot(hash3(i).xy,vec2(.5)), b=dot(hash3(i+vec2(1,0)).xy,vec2(.5)), c=dot(hash3(i+vec2(0,1)).xy,vec2(.5)), d=dot(hash3(i+vec2(1,1)).xy,vec2(.5));
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
      float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy / r; vec2 p = (gl_FragCoord.xy - .5*r) / r.y;
        float tt = t*.06;
        vec2 q = vec2(fbm(p*1.4 + tt), fbm(p*1.4 - tt + 5.2));
        vec2 w = vec2(fbm(p*1.8 + q*2. + vec2(1.7,9.2) + tt*1.3), fbm(p*1.8 + q*2. + vec2(8.3,2.8) - tt));
        float f = fbm(p*1.6 + w*2.2 + (m-.5)*.6);
        vec3 vio = vec3(.56,.48,1.), cy = vec3(.21,.88,.82), am = vec3(.94,.63,.24);
        float k1 = smoothstep(.3,.8,f)*.85, k2 = smoothstep(.5,.9,w.x)*.75, k3 = smoothstep(.55,.95,q.y)*.55;
        float glow = .18/ (length(p - (m-.5)*vec2(r.x/r.y,1.)) + .35);
        float vig = smoothstep(1.35,.2,length(uv-.5));
        float sd = smoothstep(.2,1.,s);
        // dark: aurora glowing out of true black
        vec3 cd = vec3(0.);
        cd = mix(cd, vio*.85, k1); cd = mix(cd, cy*.65, k2); cd = mix(cd, am*.7, k3);
        cd += vio*glow*.28; cd *= .62; cd *= 1. - .45*sd; cd *= vig;
        // light: soft pastel wash over warm paper
        vec3 base = vec3(.965,.957,.937);
        vec3 cl = base;
        cl = mix(cl, vec3(.80,.76,1.), k1*.55); cl = mix(cl, vec3(.72,.95,.92), k2*.45); cl = mix(cl, vec3(1.,.86,.68), k3*.4);
        cl = mix(cl, vec3(.84,.80,1.), clamp(glow*.25,0.,.4));
        cl = mix(cl, base, .55*sd); cl = mix(base, cl, .55 + .45*vig);
        gl_FragColor = vec4(mix(cd, cl, L), 1.);
      }`;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { c.style.background = "#07091a"; return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uM = gl.getUniformLocation(pr, "m"), uS = gl.getUniformLocation(pr, "s"), uL = gl.getUniformLocation(pr, "L");
    const isLight = () => (document.documentElement.dataset.theme === "light" ? 1 : 0);
    let light = isLight();
    let mx = .5, my = .5, tmx = .5, tmy = .5;
    addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth; tmy = 1 - e.clientY / innerHeight; });
    const DPR = Math.min(devicePixelRatio || 1, 1.5) * .6;  // render at reduced res: soft & fast
    const resize = () => { c.width = innerWidth * DPR; c.height = innerHeight * DPR; gl.viewport(0, 0, c.width, c.height); };
    resize(); addEventListener("resize", resize);
    const t0 = performance.now();
    const frame = (now) => {
      mx += (tmx - mx) * .04; my += (tmy - my) * .04;
      const sc = Math.min(1, scrollY / (innerHeight * 1.2));
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, reduce ? 0 : (now - t0) / 1000);
      light += (isLight() - light) * .12;
      gl.uniform2f(uM, mx, my); gl.uniform1f(uS, sc); gl.uniform1f(uL, light);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduce) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    if (reduce) window.__redrawAurora = () => { light = isLight(); requestAnimationFrame(frame); };
  })();

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    if (hasGSAP) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href")); if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: -20, duration: 1.4 }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------------- progress bar ---------------- */
  const prog = $("#progress");
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- cursor + magnetic ---------------- */
  if (fine && !reduce) {
    const cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; });
    const loop = () => { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    $$("a,button,[data-tilt],input").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        cur.classList.add("is-hover");
        const l = el.dataset.cursor || el.closest("[data-cursor]")?.dataset.cursor;
        if (l) { label.textContent = l; cur.classList.add("has-label"); }
      });
      el.addEventListener("pointerleave", () => { cur.classList.remove("is-hover", "has-label"); });
    });
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        el.style.transform = `translate(${dx * .28}px,${dy * .35}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transition = "transform .5s cubic-bezier(.2,.9,.3,1.4)"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 500); });
    });
    $$("[data-scramble]").forEach((el) => { const t = el.textContent; el.addEventListener("pointerenter", () => scramble(el, t, 420)); });
  }

  /* ---------------- 3D tilt + spotlight ---------------- */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - py) * 9}deg) rotateY(${(px - .5) * 11}deg)`;
        el.style.setProperty("--mx", `${px * 100}%`); el.style.setProperty("--my", `${py * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 600); });
    });
  }

  /* ---------------- marquee with scroll-velocity skew ---------------- */
  $$(".marquee__row").forEach((row) => {
    const track = $(".marquee__track", row);
    row.appendChild(track.cloneNode(true)); row.appendChild(track.cloneNode(true));
    const dir = +row.dataset.dir;
    let pos = 0, speed = 0.6, w = track.offsetWidth;
    addEventListener("resize", () => (w = track.offsetWidth));
    let vel = 0, last = scrollY;
    const step = () => {
      const d = scrollY - last; last = scrollY; vel += (d - vel) * .1;
      pos -= (speed + Math.abs(vel) * .35) * dir;
      if (pos <= -w) pos += w; if (pos > 0) pos -= w;
      row.style.transform = `skewX(${Math.max(-12, Math.min(12, vel * -.4))}deg)`;
      $$(".marquee__track", row).forEach((t) => (t.style.transform = `translateX(${pos}px)`));
      if (!reduce) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ---------------- about: word-by-word light-up ---------------- */
  const st = $("#statement");
  st.innerHTML = st.textContent.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
  if (hasGSAP && !reduce) {
    gsap.to("#statement .w", { opacity: 1, stagger: .1, ease: "none",
      scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 45%", scrub: true } });
  } else $$("#statement .w").forEach((w) => (w.style.opacity = 1));

  /* ---------------- counters ---------------- */
  const fmt = (n) => n.toLocaleString("en-IN");
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const run = () => {
      const t0 = performance.now(), D = 1600;
      const tick = (now) => { const p = Math.min(1, (now - t0) / D); el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 4)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    };
    if (hasGSAP) ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: run }); else el.textContent = fmt(end);
  });

  /* ---------------- section titles + reveals ---------------- */
  if (hasGSAP && !reduce) {
    $$(".section-title").forEach((t) => {
      gsap.from($$(".split", t), { yPercent: 100, opacity: 0, rotate: 4, duration: 1, ease: "expo.out", stagger: .1,
        scrollTrigger: { trigger: t, start: "top 85%" } });
    });
    $$(".section-tag").forEach((t) => {
      const txt = t.textContent;
      ScrollTrigger.create({ trigger: t, start: "top 90%", once: true, onEnter: () => scramble(t, txt, 700) });
    });
    $$(".tl-item").forEach((it) => gsap.from(it, { x: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: it, start: "top 85%" } }));
    gsap.from(".cert", { y: 50, opacity: 0, duration: 1, stagger: .15, ease: "power3.out", scrollTrigger: { trigger: ".certs__grid", start: "top 85%" } });
    gsap.from(".terminal", { y: 80, opacity: 0, scale: .96, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".terminal", start: "top 88%" } });
    gsap.from(".contact__big span", { yPercent: 100, duration: 1.2, ease: "expo.out", stagger: .12, scrollTrigger: { trigger: ".contact__big", start: "top 85%" } });
    gsap.from(".stat", { y: 60, opacity: 0, duration: 1, ease: "power3.out", stagger: .1, scrollTrigger: { trigger: ".stats", start: "top 88%" } });
    gsap.from(".orbit", { scale: .6, opacity: 0, rotate: -40, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".orbit", start: "top 85%" } });

    // timeline line draws as you scroll
    const path = $("#tlPath"); const L = 1000;
    path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
    gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true } });
  }

  /* ---------------- projects: horizontal pinned scroll ---------------- */
  if (hasGSAP && !reduce) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 821px)", () => {
      const track = $("#track");
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".projects", start: "top top", end: () => `+=${dist()}`, pin: ".projects__pin", scrub: 1, invalidateOnRefresh: true } });
      $$(".pcard", track).forEach((card) => {
        gsap.from(card, { rotateY: -25, opacity: .3, scale: .9, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true } });
      });
      return () => tween.kill();
    });
  }

  /* ---------------- theme colours (cached; refreshed on toggle) ---------------- */
  const themeColors = {};
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    ["art1", "art2", "violet", "cyan", "amber", "rose", "ink", "bg2"].forEach((k) => (themeColors[k] = cs.getPropertyValue(`--${k}`).trim()));
  }
  readTheme();

  /* ---------------- theme toggle (circular reveal) ---------------- */
  const toggle = $("#themeToggle");
  const metaTheme = $('meta[name="theme-color"]');
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    toggle.setAttribute("aria-label", t === "light" ? "Switch to dark mode" : "Switch to light mode");
    metaTheme.setAttribute("content", t === "light" ? "#f6f4ef" : "#000000");
    readTheme();
    window.__hudRedraw && window.__hudRedraw();
    if (reduce) { arts.forEach((cv) => drawArt(cv, 1)); window.__redrawAurora && window.__redrawAurora(); }
  }
  toggle.setAttribute("aria-label", document.documentElement.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  toggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    if (!document.startViewTransition || reduce || document.hidden) return applyTheme(next);
    const b = toggle.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => applyTheme(next));
    vt.ready.then(() => document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
      { duration: 750, easing: "cubic-bezier(.7,0,.2,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
    vt.finished.catch(() => {});
  });

  /* ---------------- AI core: rotating neural globe ---------------- */
  (function globe() {
    const cv = $("#globe"); if (!cv) return;
    const ctx = cv.getContext("2d");
    const N = 360, pts = [];
    for (let i = 0; i < N; i++) {                       // Fibonacci sphere
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963;
      pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]);
    }
    const links = [];                                    // fixed neighbour pairs, computed once
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
      if (dx * dx + dy * dy + dz * dz < .035) links.push([i, j]);
    }
    let W = 0, H = 0, ay = 0, ax = .35, tx = 0, ty = 0;
    const size = () => { const b = cv.getBoundingClientRect(); W = cv.width = b.width * devicePixelRatio; H = cv.height = b.height * devicePixelRatio; };
    size(); addEventListener("resize", size);
    addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth - .5) * .9; ty = (e.clientY / innerHeight - .5) * .6; });
    const hexA = (hex, a) => { const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
    const proj = new Array(N);
    const draw = (now) => {
      ay += .0035 + tx * .01; ax += (.35 + ty - ax) * .05;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const R = Math.min(W, H) * .36, ox = W / 2, oy = H / 2;
      const pulse = 1 + Math.sin(now / 900) * .02;
      for (let i = 0; i < N; i++) {
        let [x, y, z] = pts[i];
        let x1 = x * cy - z * sy, z1 = x * sy + z * cy;          // rotate Y
        let y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;        // rotate X
        const pz = 2.6 / (2.6 + z2);
        proj[i] = [ox + x1 * R * pz * pulse, oy + y1 * R * pz * pulse, z2];
      }
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = devicePixelRatio * .7;
      for (const [a, b] of links) {
        const za = (proj[a][2] + proj[b][2]) / 2; const al = .08 + (1 - (za + 1) / 2) * .35;
        ctx.strokeStyle = hexA(themeColors.cyan, al);
        ctx.beginPath(); ctx.moveTo(proj[a][0], proj[a][1]); ctx.lineTo(proj[b][0], proj[b][1]); ctx.stroke();
      }
      for (let i = 0; i < N; i++) {
        const [px, py, pz] = proj[i]; const front = 1 - (pz + 1) / 2;
        ctx.fillStyle = hexA(i % 9 === 0 ? themeColors.amber : themeColors.violet, .25 + front * .75);
        ctx.beginPath(); ctx.arc(px, py, (.6 + front * 2.2) * devicePixelRatio, 0, 7); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------------- generative project art ---------------- */
  const arts = $$(".pcard__art");
  function drawArt(cv, t) {
    const ctx = cv.getContext("2d"); const W = cv.width, H = cv.height;
    const card = cv.closest(".pcard"); const A = getComputedStyle(card).getPropertyValue("--a").trim(), B = getComputedStyle(card).getPropertyValue("--b").trim();
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, themeColors.art1); g.addColorStop(1, themeColors.art2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const kind = cv.dataset.art;
    ctx.lineWidth = 1.2 * devicePixelRatio;
    if (kind === "rag") {                                  // embedding constellation
      for (let i = 0; i < 70; i++) {
        const a = i * 2.399 + t * .15, rr = Math.sqrt(i / 70) * Math.min(W, H) * .46;
        const x = W / 2 + Math.cos(a) * rr * 1.5, y = H / 2 + Math.sin(a) * rr;
        ctx.fillStyle = i % 3 ? A : B; ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t + i));
        ctx.beginPath(); ctx.arc(x, y, (1.5 + (i % 4)) * devicePixelRatio, 0, 7); ctx.fill();
        if (i % 7 === 0) { ctx.strokeStyle = A; ctx.globalAlpha = .25; ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(x, y); ctx.stroke(); }
      }
    } else if (kind === "scan") {                          // radar sweep over code lines
      ctx.globalAlpha = .35; ctx.fillStyle = A;
      for (let i = 0; i < 14; i++) { const w = (30 + ((i * 53) % 60)) / 100 * W * .7; ctx.fillRect(W * .08, H * .1 + i * H * .058, w, 3 * devicePixelRatio); }
      const sx = ((t * .25) % 1) * W; const sg = ctx.createLinearGradient(sx - W * .3, 0, sx, 0);
      sg.addColorStop(0, "transparent"); sg.addColorStop(1, B); ctx.globalAlpha = .55; ctx.fillStyle = sg; ctx.fillRect(sx - W * .3, 0, W * .3, H);
      ctx.globalAlpha = 1; ctx.fillStyle = B; ctx.fillRect(sx, 0, 2 * devicePixelRatio, H);
    } else if (kind === "swipe") {                         // stacked phone feed sliding up
      for (let i = 0; i < 4; i++) {
        const off = ((t * .35 + i) % 4) / 4; const y = H * (1.1 - off * 1.4);
        ctx.globalAlpha = 1 - Math.abs(off - .5) * 1.6; ctx.strokeStyle = i % 2 ? A : B; ctx.lineWidth = 2 * devicePixelRatio;
        const w = W * .28, h = H * .55; roundRect(ctx, W / 2 - w / 2, y - h / 2, w, h, 14 * devicePixelRatio); ctx.stroke();
        ctx.fillStyle = i % 2 ? A : B; ctx.globalAlpha *= .25; roundRect(ctx, W / 2 - w / 2 + 8, y - h / 2 + 8, w - 16, h * .55, 10); ctx.fill();
      }
    } else if (kind === "hand") {                          // hand-tracking skeleton
      const pts = [[0, 0], [-.5, -.6], [-.6, -1.2], [-.2, -.9], [-.15, -1.6], [.15, -.95], [.15, -1.75], [.45, -.85], [.5, -1.55], [.75, -.55], [.95, -1.1]];
      const cx = W / 2, cy = H * .82, s = H * .38;
      const sway = Math.sin(t * 1.3) * .08;
      const P = pts.map(([x, y]) => [cx + (x + sway * y) * s, cy + y * s]);
      ctx.strokeStyle = A; ctx.globalAlpha = .8;
      [[0, 1], [1, 2], [0, 3], [3, 4], [0, 5], [5, 6], [0, 7], [7, 8], [0, 9], [9, 10]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...P[a]); ctx.lineTo(...P[b]); ctx.stroke(); });
      P.forEach(([x, y], i) => { ctx.fillStyle = i % 2 ? B : A; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 4 * devicePixelRatio, 0, 7); ctx.fill(); });
    } else if (kind === "shield") {                        // pulsing shield rings
      for (let i = 0; i < 6; i++) {
        const k = ((t * .4 + i / 6) % 1); ctx.globalAlpha = 1 - k; ctx.strokeStyle = i % 2 ? A : B;
        const s = 20 + k * Math.min(W, H) * .5; shield(ctx, W / 2, H / 2, s); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = A; shield(ctx, W / 2, H / 2, 22 * devicePixelRatio); ctx.fill();
    } else if (kind === "phish") {                         // URL tokens, one flagged
      ctx.font = `${12 * devicePixelRatio}px JetBrains Mono, monospace`;
      const urls = ["paypa1-login.secure-verify.co", "github.com/vansh-mahajan1", "amaz0n-gift.claim-now.xyz", "iilm.edu", "bank-0tp-update.info"];
      urls.forEach((u, i) => {
        const y = H * (.18 + i * .17) ; const x = W * .08 + Math.sin(t + i) * 6;
        const bad = /1|0/.test(u.replace("vansh-mahajan1", "")) && !u.includes("github");
        ctx.globalAlpha = .9; ctx.fillStyle = bad ? B : A; ctx.fillText((bad ? "✕ " : "✓ ") + u, x, y);
      });
    }
    ctx.globalAlpha = 1;
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function shield(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .85, y - s * .6); ctx.lineTo(x + s * .7, y + s * .45); ctx.quadraticCurveTo(x, y + s * 1.05, x, y + s * 1.05); ctx.quadraticCurveTo(x, y + s * 1.05, x - s * .7, y + s * .45); ctx.lineTo(x - s * .85, y - s * .6); ctx.closePath(); }
  const sizeArts = () => arts.forEach((cv) => { const b = cv.getBoundingClientRect(); cv.width = b.width * devicePixelRatio; cv.height = b.height * devicePixelRatio; });
  sizeArts(); addEventListener("resize", sizeArts);
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  arts.forEach((a) => io.observe(a));
  const artLoop = (now) => { visible.forEach((cv) => drawArt(cv, now / 1000)); requestAnimationFrame(artLoop); };
  if (reduce) arts.forEach((cv) => drawArt(cv, 1)); else requestAnimationFrame(artLoop);

  /* ---------------- skills orbit layout ---------------- */
  function layoutOrbit() {
    $$(".orbit__ring").forEach((ring) => {
      const spans = $$("span", ring); const r = ring.offsetWidth / 2;
      spans.forEach((s, i) => {
        if (!s.querySelector("i")) s.innerHTML = `<i>${s.textContent}</i>`;
        s.style.setProperty("--a", `${(360 / spans.length) * i + (ring.classList.contains("r2") ? 20 : 0)}deg`);
        s.style.setProperty("--r", `${r}px`);
      });
    });
  }
  layoutOrbit(); addEventListener("resize", layoutOrbit);
  $$(".orbit__ring").forEach((ring) => $$("span", ring).forEach((s) => s.style.setProperty("--t", getComputedStyle(ring).getPropertyValue("--t"))));

  /* ---------------- terminal ---------------- */
  const out = $("#termOut"), input = $("#termIn"), body = $("#termBody");
  const C = {
    help: () => `available commands:
  <span class="cy">whoami</span>      who is vansh?
  <span class="cy">projects</span>    things I've built
  <span class="cy">skills</span>      my stack
  <span class="cy">experience</span>  where I've worked
  <span class="cy">certs</span>       certifications
  <span class="cy">contact</span>     how to reach me
  <span class="cy">resume</span>      quick summary
  <span class="cy">clear</span>       clean the screen
  …and maybe a few secrets. try <span class="am">sudo</span>.`,
    whoami: () => `<span class="hl">Vansh Mahajan</span> — B.Tech CSE @ IILM University (2025–2029).
Building LLM apps, RAG systems and AI agents, and learning how to <span class="ro">break</span> them so they can be made <span class="cy">secure</span>.
Ex-AI Intern @ LeewayHertz. Based in Delhi, India.`,
    projects: () => `<span class="am">01</span> SARTHI ............ RAG over 10,600 Gita passages  <a href="https://sarthi-sandy.vercel.app/chat" target="_blank" rel="noopener">demo</a>
<span class="am">02</span> AI Sec Scanner .... vuln analysis on local LLMs
<span class="am">03</span> EachSwipe ......... AI video lessons (pipeline)  <a href="https://testflight.apple.com/join/acPB4Sex" target="_blank" rel="noopener">beta</a>
<span class="am">04</span> GestureQuest ...... MediaPipe gesture tasks   <a href="https://questgesture.netlify.app/" target="_blank" rel="noopener">demo</a>
<span class="am">05</span> CyberGuard ........ Python security toolkit   <a href="https://github.com/vansh-mahajan1/cyberguard" target="_blank" rel="noopener">code</a>
<span class="am">06</span> Phishing Detector . URL risk scoring          <a href="https://phishing-url-detector-zeta-lake.vercel.app" target="_blank" rel="noopener">live</a>`,
    skills: () => `<span class="hl">languages</span>  Python · TypeScript · JavaScript · SQL · HTML/CSS
<span class="hl">ai/ml</span>      LLMs · RAG · AI agents · embeddings · vector search · local LLMs · MediaPipe
<span class="hl">security</span>   AI security · prompt injection · vuln analysis of code & APIs
<span class="hl">web/data</span>   Next.js · Tailwind · PostgreSQL · pgvector · Prisma · Auth.js · Vercel`,
    experience: () => `<span class="am">Jun–Jul 2026</span>  AI Intern @ LeewayHertz — AI agents on ZBrain, QA, Python
<span class="am">2026</span>          EachSwipe — AI video-generation pipeline
<span class="am">2025–2029</span>     B.Tech CSE @ IILM University`,
    certs: () => `✓ CS50's Introduction to Programming with Python — Harvard  <a href="https://cs50.harvard.edu/certificates/6d573cd9-81a6-4bbe-a956-aafd5b7ea910" target="_blank" rel="noopener">verify</a>
✓ Introduction to Python — Centri (ID 683690742)`,
    contact: () => `email     <a href="mailto:vanshmahajan1601@gmail.com">vanshmahajan1601@gmail.com</a>
linkedin  <a href="https://www.linkedin.com/in/vansh-mahajan-80b88a33b/" target="_blank" rel="noopener">/in/vansh-mahajan-80b88a33b</a>
github    <a href="https://github.com/vansh-mahajan1" target="_blank" rel="noopener">github.com/vansh-mahajan1</a>`,
    resume: () => `${C.whoami()}\n\n${C.experience()}\n\n${C.certs()}`,
    "sudo hire vansh": () => `[sudo] password for recruiter: ********
<span class="cy">✓ permission granted.</span> initiating hire sequence…
<span class="am">→</span> drop a line at <a href="mailto:vanshmahajan1601@gmail.com?subject=Let's%20talk">vanshmahajan1601@gmail.com</a> 🚀`,
    sudo: () => `usage: sudo hire vansh`,
    ls: () => `about/  projects/  skills/  certs/  contact/  secrets.txt`,
    "cat secrets.txt": () => `nice try. <span class="ro">this incident will be reported</span> 🛡️ (to my sense of humour)`,
    "rm -rf /": () => `<span class="ro">blocked:</span> prompt injection detected. good instinct though.`,
    date: () => new Date().toString(),
    echo: (a) => a,
    hello: () => `hey 👋 type <span class="cy">help</span> to look around.`,
  };
  const history = []; let hi = 0;
  function print(cmd, res) {
    const div = document.createElement("div");
    div.innerHTML = `<div class="cmd"><b>vansh@portfolio</b>:~$ ${cmd.replace(/</g, "&lt;")}</div><pre style="white-space:pre-wrap;font:inherit;margin:2px 0 14px">${res}</pre>`;
    out.appendChild(div); body.scrollTop = body.scrollHeight;
  }
  function exec(raw) {
    const cmd = raw.trim(); if (!cmd) return;
    history.push(cmd); hi = history.length;
    if (cmd === "clear") { out.innerHTML = ""; return; }
    const lower = cmd.toLowerCase();
    let fn = C[lower];
    if (!fn && lower.startsWith("echo ")) return print(cmd, cmd.slice(5).replace(/</g, "&lt;"));
    print(cmd, fn ? fn() : `command not found: ${lower.replace(/</g, "&lt;")} — try <span class="cy">help</span>`);
  }
  $("#termForm").addEventListener("submit", (e) => { e.preventDefault(); exec(input.value); input.value = ""; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); input.value = history[hi] || ""; e.preventDefault(); }
    if (e.key === "ArrowDown") { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; e.preventDefault(); }
  });
  $("#term").addEventListener("click", () => input.focus({ preventScroll: true }));
  $$(".term-quick button").forEach((b) => b.addEventListener("click", () => exec(b.dataset.cmd)));
  print("hello", C.hello());

  /* ---------------- footer clock ---------------- */
  const clock = $("#clock"); $("#year").textContent = new Date().getFullYear();
  const tickClock = () => (clock.textContent = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
  tickClock(); setInterval(tickClock, 1000);

  /* ---------------- go ---------------- */
  addEventListener("load", () => { if (hasGSAP) ScrollTrigger.refresh(); });
  runBoot();
})();
