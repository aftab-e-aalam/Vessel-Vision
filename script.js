(function () {
  const canvas = document.getElementById('shader-canvas');
  function syncSize() { const w = canvas.clientWidth || 1280, h = canvas.clientHeight || 720; if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncSize).observe(canvas);
  syncSize();
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main(){ v_texCoord=a_position*0.5+0.5; gl_Position=vec4(a_position,0.0,1.0); }`;
  const fs = `precision highp float; uniform float u_time; uniform vec2 u_resolution; varying vec2 v_texCoord;
void main(){
  vec2 uv = v_texCoord;
  
  // 1. Foundation: Deep Charcoal/Black Base (The "60% Black" background)
  vec3 baseColor = vec3(0.02, 0.01, 0.03); 
  
  // 2. Glow: Soft top-center arc (The "30% Purple" accent)
  // Shifted to the top center, similar to the landing page header glow
  vec2 glowPos = uv - vec2(0.5, 0.95); 
  float dist = length(glowPos) * 1.5;
  float glow = smoothstep(0.7, 0.0, dist);
  
  // Vibrant but restrained purple highlight
  vec3 purpleHighlight = vec3(0.5, 0.0, 0.7);
  
  // Combine: 70% Base, 30% Purple
  vec3 finalColor = mix(baseColor, purpleHighlight, glow * 0.3);
  
  // 3. Ultra-subtle Grain: Keeps the black from looking 'flat'
  float noise = fract(sin(dot(uv + u_time * 0.001, vec2(12.9898, 78.233))) * 43758.5453);
  finalColor += noise * 0.015;
  
  gl_FragColor = vec4(finalColor, 1.0);
}`;
  function cs(t, s) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time'), uRes = gl.getUniformLocation(prog, 'u_resolution'), uMouse = gl.getUniformLocation(prog, 'u_mouse');
  let mouse = { x: 640, y: 360 };
  window.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); if (r.width && r.height) { mouse.x = (e.clientX - r.left) / r.width * canvas.width; mouse.y = (1 - (e.clientY - r.top) / r.height) * canvas.height; } });
  function render(t) { if (typeof ResizeObserver === 'undefined') syncSize(); gl.viewport(0, 0, canvas.width, canvas.height); if (uTime) gl.uniform1f(uTime, t * 0.001); if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height); if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(render); }
  render(0);
})();

(function () {
  var video = document.getElementById('hero-bone-video');
  if (!video) return;

  function tryPlay() {
    if (!video.paused) return; // already mid-playback — let it finish, ignore this scroll tick
    video.currentTime = 0;
    video.play().catch(function () {
      var resume = function () {
        video.currentTime = 0;
        video.play();
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
    });
  }

  window.addEventListener('scroll', tryPlay, { passive: true });

  // Reset back to frame 0 the instant the video finishes
  video.addEventListener('ended', function () {
    video.currentTime = 0;
  });
})();

function showPage(name) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => { p.classList.remove('active', 'visible'); });
  document.getElementById('nav-home').className = 'text-label-md font-label-md transition-colors cursor-pointer ' + (name === 'home' ? 'nav-active' : 'nav-inactive');
  document.getElementById('nav-about').className = 'text-label-md font-label-md transition-colors cursor-pointer ' + (name === 'about' ? 'nav-active' : 'nav-inactive');
  document.getElementById('nav-products').className = 'text-label-md font-label-md transition-colors cursor-pointer nav-inactive';
  document.getElementById('nav-dashboard').className = 'text-label-md font-label-md transition-colors cursor-pointer nav-inactive';
  const mobileHome = document.getElementById('mobile-nav-home');
  const mobileAbout = document.getElementById('mobile-nav-about');
  if (mobileHome) mobileHome.style.color = name === 'home' ? '#ff00ff' : '';
  if (mobileAbout) mobileAbout.style.color = name === 'about' ? '#ff00ff' : '';
  const target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('visible')));
  }
}

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const icon = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));
  if (!isOpen) { answer.classList.add('open'); icon.classList.add('open'); }
}

function handleProblemUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const thumb = document.getElementById('upload-thumb');
    const icon = document.getElementById('upload-icon');
    const text = document.getElementById('upload-text');
    thumb.src = e.target.result;
    thumb.classList.remove('hidden');
    icon.classList.add('hidden');
    text.textContent = file.name;
  };
  reader.readAsDataURL(file);
}

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { 
    if (entry.isIntersecting) { 
      entry.target.classList.add('in-view'); 
      scrollObserver.unobserve(entry.target); 
    } 
  });
}, { threshold: 0.10 }); // Triggers slightly earlier (10% visibility) for a smoother feel

// This tells the script to watch BOTH your original '.hiw-step' items AND any new '.scroll-animate' items
document.querySelectorAll('.hiw-step, .scroll-animate').forEach(el => scrollObserver.observe(el));

document.addEventListener('DOMContentLoaded', () => {
  const home = document.getElementById('page-home');
  requestAnimationFrame(() => requestAnimationFrame(() => home.classList.add('visible')));
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set up the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add the 'show' class when it enters the screen
                entry.target.classList.add('show');
            } else {
                // Remove the class when it leaves so it animates again when scrolling back up
                entry.target.classList.remove('show');
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before the bottom of the screen
    });

    // 2. Grab all elements with the 'observe-me' class
    const animatedElements = document.querySelectorAll('.observe-me');

    // 3. Tell the observer to watch each one
    animatedElements.forEach((el) => {
        observer.observe(el);
    });
});