(function(){
        const canvas = document.getElementById('shader-canvas');
        function syncSize(){ const w=canvas.clientWidth||1280,h=canvas.clientHeight||720; if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;} }
        if(typeof ResizeObserver!=='undefined') new ResizeObserver(syncSize).observe(canvas);
        syncSize();
        const gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');
        if(!gl) return;
        const vs=`attribute vec2 a_position; varying vec2 v_texCoord; void main(){ v_texCoord=a_position*0.5+0.5; gl_Position=vec4(a_position,0.0,1.0); }`;
        const fs=`precision highp float; uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse; varying vec2 v_texCoord;
        void main(){
          vec2 uv=v_texCoord;
          float noise=sin(uv.x*10.0+u_time*0.5)*cos(uv.y*8.0-u_time*0.3);
          noise+=sin(uv.y*12.0+u_time*0.7)*cos(uv.x*6.0+u_time*0.4);
          vec3 magenta=vec3(1.0,0.0,1.0); vec3 deepBlack=vec3(0.0,0.0,0.0);
          float intensity=smoothstep(-1.0,1.0,noise); intensity*=(1.0-length(uv-0.5)*1.2);
          vec3 color=mix(deepBlack,magenta*0.15,intensity);
          float bits=pow(fract(sin(dot(uv+u_time*0.01,vec2(12.9898,78.233)))*43758.5453),20.0);
          color+=magenta*bits*0.3;
          gl_FragColor=vec4(color,1.0);
        }`;
        function cs(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
        const prog=gl.createProgram();
        gl.attachShader(prog,cs(gl.VERTEX_SHADER,vs));
        gl.attachShader(prog,cs(gl.FRAGMENT_SHADER,fs));
        gl.linkProgram(prog); gl.useProgram(prog);
        const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        const pos=gl.getAttribLocation(prog,'a_position');
        gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
        const uTime=gl.getUniformLocation(prog,'u_time'),uRes=gl.getUniformLocation(prog,'u_resolution'),uMouse=gl.getUniformLocation(prog,'u_mouse');
        let mouse={x:640,y:360};
        window.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();if(r.width&&r.height){mouse.x=(e.clientX-r.left)/r.width*canvas.width;mouse.y=(1-(e.clientY-r.top)/r.height)*canvas.height;}});
        function render(t){if(typeof ResizeObserver==='undefined') syncSize(); gl.viewport(0,0,canvas.width,canvas.height); if(uTime) gl.uniform1f(uTime,t*0.001); if(uRes) gl.uniform2f(uRes,canvas.width,canvas.height); if(uMouse) gl.uniform2f(uMouse,mouse.x,mouse.y); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); requestAnimationFrame(render);}
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
        pages.forEach(p => { p.classList.remove('active','visible'); });
        document.getElementById('nav-home').className = 'text-label-md font-label-md transition-colors cursor-pointer ' + (name==='home' ? 'nav-active' : 'nav-inactive');
        document.getElementById('nav-about').className = 'text-label-md font-label-md transition-colors cursor-pointer ' + (name==='about' ? 'nav-active' : 'nav-inactive');
        document.getElementById('nav-products').className = 'text-label-md font-label-md transition-colors cursor-pointer nav-inactive';
        document.getElementById('nav-dashboard').className = 'text-label-md font-label-md transition-colors cursor-pointer nav-inactive';
        const mobileHome = document.getElementById('mobile-nav-home');
        const mobileAbout = document.getElementById('mobile-nav-about');
        if(mobileHome) mobileHome.style.color = name==='home' ? '#ff00ff' : '';
        if(mobileAbout) mobileAbout.style.color = name==='about' ? '#ff00ff' : '';
        const target = document.getElementById('page-' + name);
        if(target) {
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
        if(!isOpen) { answer.classList.add('open'); icon.classList.add('open'); }
      }

      function handleProblemUpload(input) {
        const file = input.files && input.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
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

      const hiwObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('in-view'); hiwObserver.unobserve(e.target); } });
      }, { threshold: 0.15 });
      document.querySelectorAll('.hiw-step').forEach(el => hiwObserver.observe(el));

      document.addEventListener('DOMContentLoaded', () => {
        const home = document.getElementById('page-home');
        requestAnimationFrame(() => requestAnimationFrame(() => home.classList.add('visible')));
      });