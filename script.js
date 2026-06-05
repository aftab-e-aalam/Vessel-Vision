const canvas = document.getElementById('particleCanvas');
          const ctx = canvas.getContext('2d');
          let particles = [];
          const particleCount = 60;

          function resize() {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
          }

          class Particle {
              constructor() {
                  this.init();
              }

              init() {
                  this.x = Math.random() * canvas.width;
                  this.y = canvas.height + Math.random() * 100;
                  this.size = Math.random() * 1.5 + 0.5;
                  this.speedY = Math.random() * 0.5 + 0.2;
                  this.opacity = Math.random() * 0.5 + 0.1;
                  this.drift = (Math.random() - 0.5) * 0.3;
              }

              update() {
                  this.y -= this.speedY;
                  this.x += this.drift;
                  if (this.y < -10) {
                      this.init();
                  }
              }

              draw() {
                  ctx.fillStyle = `rgba(255, 8, 226, ${this.opacity})`;
                  ctx.beginPath();
                  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                  ctx.fill();
                  // Suble glow
                  ctx.shadowBlur = 4;
                  ctx.shadowColor = '#FF08E2';
              }
          }

          function createParticles() {
              for (let i = 0; i < particleCount; i++) {
                  particles.push(new Particle());
              }
          }

          function animate() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              particles.forEach(p => {
                  p.update();
                  p.draw();
              });
              requestAnimationFrame(animate);
          }

          window.addEventListener('resize', resize);
          resize();
          createParticles();
          animate();

          // Intersection Observer for Entrance Animations
          const observerOptions = {
              threshold: 0.1,
              rootMargin: '0px 0px -50px 0px'
          };

          const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      entry.target.classList.add('active');
                      observer.unobserve(entry.target);
                  }
              });
          }, observerOptions);

          document.querySelectorAll('.reveal').forEach(el => {
              observer.observe(el);
          });

          window.addEventListener('load', () => {
              setTimeout(() => {
                document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
              }, 100);
          });