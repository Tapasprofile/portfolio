/* ==========================================================================
   FUTURISTIC CYBERPUNK PORTFOLIO SCRIPT - TAPAS KUMAR PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Register GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ==========================================================================
     1. PRELOADER & ASSET LOADING MANAGER
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const loaderBar = document.querySelector('.loader-bar');
  const loaderPercent = document.querySelector('.loader-percentage');
  const loaderStatus = document.querySelector('.loader-status');
  const loaderLogs = document.querySelector('.loader-logs');

  const addLogLine = (message) => {
    const line = document.createElement('span');
    line.className = 'log-line';
    line.innerText = `> ${message}`;
    loaderLogs.appendChild(line);
    loaderLogs.scrollTop = loaderLogs.scrollHeight;
  };

  // Three.js Texture Loading Manager
  const loadingManager = new THREE.LoadingManager();

  loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
    addLogLine(`Neural link established to: ${url.split('/').pop()}`);
    loaderStatus.innerText = 'ESTABLISHING HANDSHAKE PROTOCOLS...';
  };

  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    if (loaderBar) loaderBar.style.width = `${progress}%`;
    if (loaderPercent) loaderPercent.innerText = `${progress}%`;
    addLogLine(`Downloading graphics: ${itemsLoaded}/${itemsTotal} files loaded.`);
  };

  loadingManager.onLoad = () => {
    addLogLine('Decryption successful. Core assets verified.');
    loaderStatus.innerText = 'INITIALIZING GRAPHICS ENGINE...';
    
    // Smooth preloader exit animation
    setTimeout(() => {
      if (typeof gsap !== 'undefined') {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            preloader.style.display = 'none';
            // Trigger landing animation
            playHeroEntrance();
          }
        });
      } else {
        preloader.style.display = 'none';
      }
    }, 1200);
  };

  loadingManager.onError = (url) => {
    addLogLine(`CRITICAL: Connection failure on asset ${url.split('/').pop()}`);
    // Non-blocking fallback
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 2000);
  };

  const textureLoader = new THREE.TextureLoader(loadingManager);

  // Asset references - we use local paths which will be compiled
  const imageUrls = [
    'assets/images/tapas.png',
    'assets/images/tapas.png',
    'assets/images/picthree.png',
    'assets/images/pic4.png',
    'assets/images/pic5.png'
  ];

  const textures = imageUrls.map(url => {
    const tex = textureLoader.load(url);
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  });

  /* ==========================================================================
     2. THREE.JS 3D CANVAS HERO ENVIRONMENT
     ========================================================================== */
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.015);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 8); // Start slightly zoomed out for the zoom entrance

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: window.innerWidth > 768, // Disable antialiasing on mobile to speed up fill rate
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 1024 ? 1.2 : 1.5));

  // Particle Starfield Background
  const starCount = 1800;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const colorCyan = new THREE.Color('#00f2fe');
  const colorPurple = new THREE.Color('#7f00ff');

  for (let i = 0; i < starCount * 3; i += 3) {
    // Spatial positioning in a massive sphere shell
    const radius = 20 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i+1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i+2] = radius * Math.cos(phi);

    // Cyan / Purple color interpolation
    const mixRatio = Math.random();
    const tempColor = colorCyan.clone().lerp(colorPurple, mixRatio);
    starColors[i] = tempColor.r;
    starColors[i+1] = tempColor.g;
    starColors[i+2] = tempColor.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 0.28, // Increased size for glowing sparks visibility
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // 3D Carousel Setup
  const carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

  const cardsCount = 5;
  const carouselRadius = 4.2;
  const cardMeshes = [];
  const cardWidth = 2.4;
  const cardHeight = 3.2;

  // Create 3D planes for each project image card
  for (let i = 0; i < cardsCount; i++) {
    const geom = new THREE.PlaneGeometry(cardWidth, cardHeight);
    
    // Custom sci-fi glassmorphic basic materials for full texture visibility
    const mat = new THREE.MeshBasicMaterial({
      map: textures[i],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new THREE.Mesh(geom, mat);
    
    // Position cards evenly in a circle coordinates system
    const angle = (i / cardsCount) * Math.PI * 2;
    mesh.position.x = Math.cos(angle) * carouselRadius;
    mesh.position.z = Math.sin(angle) * carouselRadius;
    
    // Face the center of the carousel
    mesh.lookAt(0, 0, 0);
    
    // Custom references to handle rotational angles
    mesh.userData = {
      baseAngle: angle,
      index: i
    };

    carouselGroup.add(mesh);
    cardMeshes.push(mesh);
  }

  // Dynamic Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.PointLight(0x00f2fe, 2.5, 25);
  mainLight.position.set(0, 3, 5);
  scene.add(mainLight);

  const secondaryLight = new THREE.PointLight(0x7f00ff, 2, 25);
  secondaryLight.position.set(0, -3, -5);
  scene.add(secondaryLight);

  // Drag Carousel Variables
  let isDragging = false;
  let startX = 0;
  let targetRotationY = 0;
  let currentRotationY = 0;
  const dampingFactor = 0.05; // Lerp inertia factor
  const rotationSensitivity = 0.003;

  // Mouse Interaction (Damping & Hover Tilting)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999);
  let hoveredCard = null;

  const onPointerDown = (e) => {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX);
  };

  const onPointerMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    
    if (isDragging) {
      const deltaX = clientX - startX;
      targetRotationY += deltaX * rotationSensitivity;
      startX = clientX;
    }

    // Set mouse coordinates for raycasting
    const pointerX = e.clientX || (e.touches && e.touches[0].clientX);
    const pointerY = e.clientY || (e.touches && e.touches[0].clientY);
    mouse.x = (pointerX / window.innerWidth) * 2 - 1;
    mouse.y = -(pointerY / window.innerHeight) * 2 + 1;

    // Shift point light slightly relative to cursor position
    mainLight.position.x = mouse.x * 6;
    mainLight.position.y = mouse.y * 6 + 2;
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  window.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Adjust canvas on window resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 1024 ? 1.2 : 1.5));
  });

  // Entrance Camera Animation via GSAP
  const playHeroEntrance = () => {
    if (typeof gsap !== 'undefined') {
      // Zoom camera in
      gsap.from(camera.position, {
        z: 14,
        duration: 2.2,
        ease: 'power3.out'
      });
      // Slide up and glitch title
      gsap.from('#hero-title-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.3
      });
      gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5
      });
      gsap.from('.hero-description', {
        opacity: 0,
        duration: 1.5,
        delay: 0.8
      });
      gsap.from('.hero-actions', {
        y: 20,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 1.0
      });
    }
  };

  // IntersectionObserver for Hero WebGL Canvas (Skip rendering when offscreen)
  let isHeroVisible = true;
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isHeroVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });

  const heroSec = document.getElementById('hero');
  if (heroSec) {
    heroObserver.observe(heroSec);
  }

  // Rendering Game Loop
  const animate = () => {
    requestAnimationFrame(animate);

    if (!isHeroVisible) return; // Save GPU/CPU cycles when offscreen!

    // Apply damping inertia to rotation Y
    currentRotationY += (targetRotationY - currentRotationY) * dampingFactor;
    carouselGroup.rotation.y = currentRotationY;

    // Rotate starfield slowly for cosmic atmosphere
    starField.rotation.y += 0.0006;
    starField.rotation.x += 0.0003;

    // Raycast intersections for card hovers
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      if (hoveredCard !== intersectedObject) {
        // Reset old hover card scale
        if (hoveredCard) {
          gsap.to(hoveredCard.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          hoveredCard.material.opacity = 0.9;
        }
        
        hoveredCard = intersectedObject;
        // Scale up active hover card
        gsap.to(hoveredCard.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3 });
        hoveredCard.material.opacity = 1.0;
      }
      
      // Dynamic mouse pointer tracking for card tilt
      const point = intersects[0].uv; // UV coordinates: 0.0 to 1.0
      if (point) {
        const tiltX = (point.x - 0.5) * 0.4;
        const tiltY = (point.y - 0.5) * -0.4;
        // Tilt mesh relative to base angle
        hoveredCard.rotation.y = hoveredCard.userData.baseAngle + Math.PI + tiltX;
        hoveredCard.rotation.x = tiltY;
      }
    } else {
      if (hoveredCard) {
        // Fade out scaling
        gsap.to(hoveredCard.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        gsap.to(hoveredCard.rotation, {
          x: 0,
          y: hoveredCard.userData.baseAngle + Math.PI,
          z: 0,
          duration: 0.4
        });
        hoveredCard.material.opacity = 0.9;
        hoveredCard = null;
      }
    }

    // Keep non-hovered cards aligned to center circle
    cardMeshes.forEach(mesh => {
      if (mesh !== hoveredCard) {
        mesh.rotation.y = mesh.userData.baseAngle + Math.PI;
        mesh.rotation.x = 0;
      }
    });

    renderer.render(scene, camera);
  };

  animate();

  /* ==========================================================================
     3. SERVICES CARD 3D MOUSE TILT EFFECT
     ========================================================================== */
  const cards = document.querySelectorAll('.service-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate rotation factor: -15deg to 15deg max
      const rotateX = ((y / height) - 0.5) * -20;
      const rotateY = ((x / width) - 0.5) * 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Update mouse light highlighting position
      const pctX = (x / width) * 100;
      const pctY = (y / height) * 100;
      card.style.setProperty('--mouse-x', `${pctX}%`);
      card.style.setProperty('--mouse-y', `${pctY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* ==========================================================================
     4. CYBER BREAKER MINI-GAME ENGINE
     ========================================================================== */
  const gameCanvas = document.getElementById('game-canvas');
  if (gameCanvas) {
    const ctx = gameCanvas.getContext('2d');
    const startBtn = document.getElementById('start-game-btn');
    const gameOverlay = document.getElementById('game-overlay');
    const gameLevelLabel = document.getElementById('game-level');
    const gameScoreLabel = document.getElementById('game-score');
    const gameLivesLabel = document.getElementById('game-lives');

    // Programmatic Web Audio Synthesizer
    let audioCtx = null;

    const initAudio = () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };

    const playTone = (frequency, duration, type = 'sine', decay = true) => {
      if (!audioCtx) return;
      
      try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        if (decay) {
          gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        } else {
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        }

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (err) {
        // Safe check
      }
    };

    // Game Core State
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameActive = false;
    let ballLaunched = false;

    // Paddle Parameters
    const paddle = {
      x: gameCanvas.width / 2 - 40,
      y: gameCanvas.height - 25,
      width: 80,
      height: 8,
      color: '#7f00ff',
      targetWidth: 80
    };

    // Ball/Core Parameters
    let balls = []; // Support multi-balls powerup

    const createBall = (x, y, dx = 0, dy = 0) => {
      return {
        x: x,
        y: y,
        radius: 5,
        dx: dx,
        dy: dy,
        speed: 3.5 + level * 0.5,
        color: '#00f2fe'
      };
    };

    // Bricks parameters
    const brickRows = 4;
    const brickCols = 6;
    const brickPadding = 10;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 25;
    const brickWidth = 65;
    const brickHeight = 15;
    let bricks = [];

    // Bricks Colors by Rows
    const brickColors = ['#f107a3', '#7f00ff', '#4facfe', '#00f2fe'];

    // Power-ups Parameters
    let powerups = [];
    const powerupTypes = ['WIDE_SHIELD', 'LASER_SHIELD', 'MULTI_CORE', 'SHIELD_LIFE'];
    const powerupColors = {
      'WIDE_SHIELD': '#39ff14',
      'LASER_SHIELD': '#f107a3',
      'MULTI_CORE': '#00f2fe',
      'SHIELD_LIFE': '#e5e7eb'
    };

    // Active power-up states
    let laserShieldActive = false;
    let laserTimer = 0;
    let lasers = [];
    let wideShieldTimer = 0;

    // Particles array for brick smash explosions
    let particles = [];

    const spawnParticles = (x, y, color) => {
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 2 + 1.5,
          color: color,
          alpha: 1.0,
          decay: Math.random() * 0.03 + 0.015
        });
      }
    };

    // Grid System Init
    const initBricks = () => {
      bricks = [];
      for (let r = 0; r < brickRows; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickCols; c++) {
          bricks[r][c] = {
            x: 0,
            y: 0,
            status: 1,
            color: brickColors[r]
          };
        }
      }
    };

    const resetGame = () => {
      score = 0;
      lives = 3;
      level = 1;
      balls = [createBall(gameCanvas.width / 2, paddle.y - 6)];
      ballLaunched = false;
      lasers = [];
      powerups = [];
      particles = [];
      laserShieldActive = false;
      paddle.width = 80;
      paddle.targetWidth = 80;
      initBricks();
      updateLabels();
    };

    const updateLabels = () => {
      gameLevelLabel.innerText = String(level).padStart(2, '0');
      gameScoreLabel.innerText = String(score).padStart(4, '0');
      gameLivesLabel.innerText = String(lives);
    };

    // Controls listeners (with coordinate scaling)
    const getCanvasMouseX = (clientX) => {
      const rect = gameCanvas.getBoundingClientRect();
      // Calculate scaling factor between drawing size (480) and client layout display
      const scaleX = gameCanvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      return Math.max(0, Math.min(gameCanvas.width, x));
    };

    const movePaddle = (clientX) => {
      const canvasX = getCanvasMouseX(clientX);
      paddle.x = canvasX - paddle.width / 2;
      // Clamp boundaries
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > gameCanvas.width) {
        paddle.x = gameCanvas.width - paddle.width;
      }
    };

    gameCanvas.addEventListener('mousemove', (e) => {
      movePaddle(e.clientX);
    });

    gameCanvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        movePaddle(e.touches[0].clientX);
      }
    }, { passive: true });

    const launchCore = () => {
      initAudio();
      if (gameActive && !ballLaunched && balls.length > 0) {
        ballLaunched = true;
        balls[0].dx = (Math.random() - 0.5) * 3; // Slanted launch
        balls[0].dy = -balls[0].speed;
        playTone(320, 0.15, 'sawtooth');
      }
    };

    gameCanvas.addEventListener('click', launchCore);
    gameCanvas.addEventListener('touchstart', (e) => {
      launchCore();
    }, { passive: true });

    startBtn.addEventListener('click', () => {
      initAudio();
      resetGame();
      gameActive = true;
      gameOverlay.classList.remove('active');
      startBtn.blur(); // Remove focus to block event trigger hijacks
    });

    const triggerWin = () => {
      ballLaunched = false;
      level++;
      playTone(520, 0.2, 'triangle');
      setTimeout(() => { playTone(650, 0.3, 'triangle'); }, 120);
      balls = [createBall(gameCanvas.width / 2, paddle.y - 6)];
      lasers = [];
      powerups = [];
      laserShieldActive = false;
      paddle.width = 80;
      paddle.targetWidth = 80;
      initBricks();
      updateLabels();
    };

    const triggerGameOver = () => {
      gameActive = false;
      playTone(180, 0.5, 'sine', false);
      // Change Overlay content
      gameOverlay.querySelector('h3').innerText = 'CORE BREACH / GAME OVER';
      gameOverlay.querySelector('p').innerText = `Your node was decommissioned at Sector ${String(level).padStart(2, '0')} with score ${score}.`;
      gameOverlay.querySelector('.btn-text').innerText = 'REBOOT INTRUDER';
      gameOverlay.classList.add('active');
    };

    // Main Game Calculations
    const runGamePhysics = () => {
      if (!gameActive) return;

      // Handle paddle width changes
      if (paddle.width !== paddle.targetWidth) {
        paddle.width += (paddle.targetWidth - paddle.width) * 0.1;
      }

      // Handle power-up timers
      if (wideShieldTimer > 0) {
        wideShieldTimer--;
        if (wideShieldTimer === 0) paddle.targetWidth = 80;
      }
      if (laserTimer > 0) {
        laserTimer--;
        if (laserTimer === 0) laserShieldActive = false;
      }

      // Auto-shoot lasers if active
      if (laserShieldActive && laserTimer % 45 === 0) {
        lasers.push({ x: paddle.x + 8, y: paddle.y - 5 });
        lasers.push({ x: paddle.x + paddle.width - 8, y: paddle.y - 5 });
        playTone(700, 0.08, 'square');
      }

      // 1. Move Ball(s)
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];

        if (!ballLaunched) {
          // Keep ball positioned on top of center paddle
          b.x = paddle.x + paddle.width / 2;
          b.y = paddle.y - b.radius - 1;
          continue;
        }

        b.x += b.dx;
        b.y += b.dy;

        // Bounces off walls
        if (b.x + b.dx > gameCanvas.width - b.radius || b.x + b.dx < b.radius) {
          b.dx = -b.dx;
          playTone(280, 0.06, 'sine');
        }
        if (b.y + b.dy < b.radius) {
          b.dy = -b.dy;
          playTone(280, 0.06, 'sine');
        }

        // Paddle deflections
        if (b.y + b.dy > paddle.y - b.radius && b.x > paddle.x && b.x < paddle.x + paddle.width) {
          // Adjust deflection angle based on where ball hits the shield
          const hitPoint = (b.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          b.dx = hitPoint * b.speed * 0.8;
          b.dy = -Math.sqrt(b.speed * b.speed - b.dx * b.dx); // Keep constant speed vector
          playTone(380, 0.08, 'sawtooth');
        }

        // Core out of screen
        if (b.y + b.dy > gameCanvas.height) {
          balls.splice(i, 1);
          continue;
        }

        // Brick Collisions
        let bricksLeft = false;
        for (let r = 0; r < brickRows; r++) {
          for (let c = 0; c < brickCols; c++) {
            const brick = bricks[r][c];
            if (brick.status === 1) {
              bricksLeft = true;
              
              // Collision check
              if (b.x > brick.x && b.x < brick.x + brickWidth && b.y > brick.y && b.y < brick.y + brickHeight) {
                brick.status = 0;
                b.dy = -b.dy;
                score += 50;
                updateLabels();
                spawnParticles(brick.x + brickWidth / 2, brick.y + brickHeight / 2, brick.color);
                playTone(450, 0.1, 'triangle');

                // Randomly spawn powerups (20% chance)
                if (Math.random() < 0.25) {
                  const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                  powerups.push({
                    x: brick.x + brickWidth / 2,
                    y: brick.y + brickHeight,
                    type: type,
                    color: powerupColors[type],
                    radius: 7,
                    speed: 1.5
                  });
                }
              }
            }
          }
        }

        if (!bricksLeft) {
          triggerWin();
          return;
        }
      }

      // Check if all balls are lost
      if (balls.length === 0) {
        lives--;
        updateLabels();
        if (lives <= 0) {
          triggerGameOver();
        } else {
          // Respawn single ball
          balls = [createBall(gameCanvas.width / 2, paddle.y - 6)];
          ballLaunched = false;
          laserShieldActive = false;
          paddle.targetWidth = 80;
        }
      }

      // 2. Move Lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.y -= 5;
        
        // Out of bounds
        if (l.y < 0) {
          lasers.splice(i, 1);
          continue;
        }

        // Brick collision
        for (let r = 0; r < brickRows; r++) {
          for (let c = 0; c < brickCols; c++) {
            const brick = bricks[r][c];
            if (brick.status === 1) {
              if (l.x > brick.x && l.x < brick.x + brickWidth && l.y > brick.y && l.y < brick.y + brickHeight) {
                brick.status = 0;
                lasers.splice(i, 1);
                score += 50;
                updateLabels();
                spawnParticles(brick.x + brickWidth / 2, brick.y + brickHeight / 2, brick.color);
                playTone(450, 0.1, 'triangle');
                return;
              }
            }
          }
        }
      }

      // 3. Move Power-ups
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.y += p.speed;

        // Catch powerup
        if (p.y > paddle.y && p.y < paddle.y + paddle.height && p.x > paddle.x && p.x < paddle.x + paddle.width) {
          playTone(600, 0.25, 'sine');
          setTimeout(() => { playTone(800, 0.15, 'sine'); }, 100);
          
          if (p.type === 'WIDE_SHIELD') {
            paddle.targetWidth = 130;
            wideShieldTimer = 600; // 10 seconds at 60fps
          } else if (p.type === 'LASER_SHIELD') {
            laserShieldActive = true;
            laserTimer = 480; // 8 seconds at 60fps
          } else if (p.type === 'MULTI_CORE') {
            // Spawn 2 extra balls at the paddle
            balls.push(createBall(paddle.x + paddle.width / 2, paddle.y - 10, -2, -3));
            balls.push(createBall(paddle.x + paddle.width / 2, paddle.y - 10, 2, -3));
          } else if (p.type === 'SHIELD_LIFE') {
            lives++;
            updateLabels();
          }

          powerups.splice(i, 1);
          continue;
        }

        // Out of screen
        if (p.y > gameCanvas.height) {
          powerups.splice(i, 1);
        }
      }

      // 4. Update explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const part = particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.decay;

        if (part.alpha <= 0) {
          particles.splice(i, 1);
        }
      }
    };

    // Draw Loop
    const drawGame = () => {
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

      // Draw grid background
      ctx.strokeStyle = 'rgba(127, 0, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < gameCanvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameCanvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < gameCanvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameCanvas.width, y);
        ctx.stroke();
      }

      if (!gameActive) return;

      // 1. Draw Bricks
      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          const brick = bricks[r][c];
          if (brick.status === 1) {
            const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const by = r * (brickHeight + brickPadding) + brickOffsetTop;
            brick.x = bx;
            brick.y = by;

            // Neon Brick styling
            ctx.shadowBlur = 10;
            ctx.shadowColor = brick.color;
            ctx.fillStyle = brick.color;
            ctx.fillRect(bx, by, brickWidth, brickHeight);
            
            // Highlight inner border
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx + 1, by + 1, brickWidth - 2, brickHeight - 2);
          }
        }
      }

      // 2. Draw Paddle
      ctx.shadowBlur = 12;
      ctx.shadowColor = paddle.color;
      ctx.fillStyle = paddle.color;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      
      // Draw Laser Turrets if laser shield is active
      if (laserShieldActive) {
        ctx.shadowColor = '#f107a3';
        ctx.fillStyle = '#f107a3';
        ctx.fillRect(paddle.x + 3, paddle.y - 4, 8, 4);
        ctx.fillRect(paddle.x + paddle.width - 11, paddle.y - 4, 8, 4);
      }
      ctx.shadowBlur = 0;

      // 3. Draw Ball(s)
      balls.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.closePath();
      });
      ctx.shadowBlur = 0;

      // 4. Draw Lasers
      ctx.fillStyle = '#f107a3';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#f107a3';
      lasers.forEach(l => {
        ctx.fillRect(l.x - 1, l.y, 2, 8);
      });
      ctx.shadowBlur = 0;

      // 5. Draw Power-ups
      powerups.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.closePath();
        
        // Draw inner label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type[0], p.x, p.y);
      });

      // 6. Draw particles
      particles.forEach(part => {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.alpha;
        ctx.fill();
        ctx.closePath();
      });
      ctx.globalAlpha = 1.0; // Reset
    };

    // IntersectionObserver for Game Section (Pause physics/drawing when offscreen)
    let isGameVisible = false;
    const gameObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isGameVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    const gameSecElement = document.getElementById('game-section');
    if (gameSecElement) {
      gameObserver.observe(gameSecElement);
    }

    // Game Animation Loop
    const gameLoop = () => {
      if (isGameVisible) {
        runGamePhysics();
        drawGame();
      }
      requestAnimationFrame(gameLoop);
    };

    initBricks();
    gameLoop();
  }

  /* ==========================================================================
     5. CODE-TO-DESIGN SPLIT SCREEN SLIDER
     ========================================================================== */
  const splitContainer = document.getElementById('split-container');
  const splitHandle = document.getElementById('split-handle');
  const rightPane = document.getElementById('right-pane');
  const diagnosticsBtn = document.getElementById('run-diagnostics-btn');
  const simulatedGlobe = document.getElementById('simulated-globe');

  if (splitContainer && splitHandle && rightPane) {
    let isMoving = false;

    const updateSplitPosition = (clientX) => {
      const rect = splitContainer.getBoundingClientRect();
      const offset = clientX - rect.left;
      const percentage = (offset / rect.width) * 100;
      
      // Clamp values between 15% and 85% to maintain visibility
      const clampedPct = Math.max(15, Math.min(85, percentage));
      
      // Apply clip path and shift handle bar position
      splitHandle.style.left = `${clampedPct}%`;
      rightPane.style.clipPath = `polygon(${clampedPct}% 0%, 100% 0%, 100% 100%, ${clampedPct}% 100%)`;
    };

    const onStartMove = (e) => {
      isMoving = true;
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isMoving) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      updateSplitPosition(clientX);
    };

    const onEndMove = () => {
      isMoving = false;
    };

    splitHandle.addEventListener('mousedown', onStartMove);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEndMove);

    splitHandle.addEventListener('touchstart', onStartMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEndMove);

    // Live render logic for HTML/CSS editors
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const liveUI = document.querySelector('.live-rendered-ui');

    if (htmlEditor && cssEditor && liveUI) {
      const tabHTML = document.getElementById('tab-html');
      const tabCSS = document.getElementById('tab-css');

      if (tabHTML && tabCSS) {
        tabHTML.addEventListener('click', () => {
          tabHTML.classList.add('active');
          tabHTML.classList.remove('inactive');
          tabCSS.classList.remove('active');
          tabCSS.classList.add('inactive');

          htmlEditor.classList.remove('hidden');
          cssEditor.classList.add('hidden');
        });

        tabCSS.addEventListener('click', () => {
          tabCSS.classList.add('active');
          tabCSS.classList.remove('inactive');
          tabHTML.classList.remove('active');
          tabHTML.classList.add('inactive');

          cssEditor.classList.remove('hidden');
          htmlEditor.classList.add('hidden');
        });
      }

      // Append dynamic style element to document head
      let dynamicStyle = document.getElementById('playground-live-css');
      if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'playground-live-css';
        document.head.appendChild(dynamicStyle);
      }

      // IntersectionObserver for Playground Section (Pause canvas loops when offscreen)
      let isPlaygroundVisible = false;
      const playgroundObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isPlaygroundVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });

      const playgroundSecElement = document.getElementById('playground');
      if (playgroundSecElement) {
        playgroundObserver.observe(playgroundSecElement);
      }

      let globeAnimId = null;

      const updateLiveRender = () => {
        // 1. Inject live CSS editor style
        dynamicStyle.textContent = cssEditor.value;

        // 2. Inject live HTML editor content
        liveUI.innerHTML = htmlEditor.value;

        // 3. Clean up any existing canvas loop
        if (globeAnimId) {
          cancelAnimationFrame(globeAnimId);
          globeAnimId = null;
        }

        // 4. Initialize wireframe globe animation if canvas is present in HTML
        const playgroundCanvas = document.getElementById('spinning-globe');
        if (playgroundCanvas) {
          const pCtx = playgroundCanvas.getContext('2d');
          let rotationAngle = 0;

          const resizePlaygroundCanvas = () => {
            const rect = playgroundCanvas.getBoundingClientRect();
            playgroundCanvas.width = rect.width || 130;
            playgroundCanvas.height = rect.height || 130;
          };
          resizePlaygroundCanvas();

          const drawPlaygroundGlobe = () => {
            if (!document.getElementById('spinning-globe')) return; // Stop loop if element removed

            if (isPlaygroundVisible) {
              pCtx.clearRect(0, 0, playgroundCanvas.width, playgroundCanvas.height);
              const cx = playgroundCanvas.width / 2;
              const cy = playgroundCanvas.height / 2;
              const radius = Math.min(cx, cy) - 10;

              // Draw outer glowing ring
              pCtx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
              pCtx.shadowBlur = 10;
              pCtx.shadowColor = '#00f2fe';
              pCtx.lineWidth = 1.5;
              pCtx.beginPath();
              pCtx.arc(cx, cy, radius, 0, Math.PI * 2);
              pCtx.stroke();
              pCtx.shadowBlur = 0;

              // Longitudes rotation increment
              rotationAngle += 0.015;
              pCtx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
              pCtx.lineWidth = 1;

              // Draw horizontal latitude ellipses
              for (let i = 1; i < 5; i++) {
                const latRadius = radius * Math.sin((i / 5) * Math.PI);
                const latY = cy + radius * Math.cos((i / 5) * Math.PI);
                pCtx.beginPath();
                pCtx.ellipse(cx, latY, latRadius, latRadius * 0.2, 0, 0, Math.PI * 2);
                pCtx.stroke();
              }

              // Draw vertical longitude ellipses rotating
              for (let i = 0; i < 4; i++) {
                const angleOffset = rotationAngle + (i / 4) * Math.PI;
                const longRadius = radius * Math.sin(angleOffset);
                pCtx.beginPath();
                pCtx.ellipse(cx, cy, Math.abs(longRadius), radius, 0, 0, Math.PI * 2);
                pCtx.stroke();
              }

              // Draw rotating radar sweep line
              pCtx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
              pCtx.beginPath();
              pCtx.moveTo(cx, cy);
              const scanX = cx + radius * Math.cos(rotationAngle * 1.5);
              const scanY = cy + radius * Math.sin(rotationAngle * 1.5);
              pCtx.lineTo(scanX, scanY);
              pCtx.stroke();

              // Radar sweep sweep tip point
              pCtx.fillStyle = 'rgba(0, 242, 254, 0.8)';
              pCtx.beginPath();
              pCtx.arc(scanX, scanY, 3, 0, Math.PI * 2);
              pCtx.fill();
            }

            globeAnimId = requestAnimationFrame(drawPlaygroundGlobe);
          };
          drawPlaygroundGlobe();
        }
      };

      // Run on startup
      updateLiveRender();

      // Hook keystrokes/inputs
      htmlEditor.addEventListener('input', updateLiveRender);
      cssEditor.addEventListener('input', updateLiveRender);
    }
  }

  /* ==========================================================================
     6. GSAP PORTFOLIO SCROLL ANIMATION & IMAGE PARALLAX
     ========================================================================== */
  if (typeof gsap !== 'undefined') {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
      // Slide detailed section up on scroll
      gsap.from(item.querySelector('.project-details'), {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 80,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out'
      });

      gsap.from(item.querySelector('.project-view-wrap'), {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      });

      // Simple Parallax scroll mapping on project window image
      const img = item.querySelector('.parallax-img');
      if (img) {
        gsap.to(img, {
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          },
          y: -25,
          ease: 'none'
        });
      }
    });
  }

  /* ==========================================================================
     7. ACCORDION FAQs DYNAMIC LINES TOGGLE
     ========================================================================== */
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.faq-body');
      const isActive = item.classList.contains('active');
      
      // Close other open FAQ panels
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-body').style.maxHeight = '0px';
        }
      });

      if (isActive) {
        item.classList.remove('active');
        body.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        // Set dynamic height from offset scrollHeight
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
    });
  });

  /* ==========================================================================
     8. HOLOGRAPHIC CONTACT FORM (AJAX & CONSOLE TERMINAL LOGS)
     ========================================================================== */
  const contactForm = document.getElementById('cyber-contact-form');
  const consoleLogs = document.getElementById('form-console-logs');
  const submitBtn = document.getElementById('submit-form-btn');

  const addConsoleLine = (text, type = 'normal') => {
    if (!consoleLogs) return;
    const line = document.createElement('span');
    line.className = 'console-line';
    
    if (type === 'error') {
      line.style.color = '#f107a3';
    } else if (type === 'success') {
      line.style.color = '#39ff14';
    }
    
    line.innerText = `> ${text}`;
    consoleLogs.appendChild(line);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  };

  if (contactForm && consoleLogs) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const accessKey = contactForm.querySelector('input[name="access_key"]').value;
      if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
        addConsoleLine('ERROR: Communication Key mismatch. Form rejected.', 'error');
        addConsoleLine('Please configure your Access Key in index.html (Line 499) to send emails.', 'error');
        alert("Web3Forms Email Transmission Key is not configured. Please get a free key from web3forms.com and paste it in index.html inside <input name=\"access_key\">.");
        return;
      }

      // Disable submission click trigger
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').innerText = 'TRANSMITTING PACKETS...';
      
      addConsoleLine('Access key authorized. Splicing text variables...');
      addConsoleLine('Establishing P2P tunnel connection...');
      
      const formData = new FormData(contactForm);
      const dataObj = Object.fromEntries(formData.entries());

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataObj)
      })
      .then(async (response) => {
        const json = await response.json();
        if (response.status == 200) {
          addConsoleLine('Transmission packet successfully dispatched!', 'success');
          addConsoleLine('Handshake completed: DVDTHEPOWER system synced.', 'success');
          submitBtn.querySelector('.btn-text').innerText = 'DISPATCH COMPLETED';
          
          // Trigger reward confetti burst
          if (typeof confetti !== 'undefined') {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#00f2fe', '#7f00ff', '#f107a3', '#39ff14']
            });
          }
          
          contactForm.reset();
        } else {
          addConsoleLine(`Intrusion rejected. Code: ${response.status}`, 'error');
          addConsoleLine(`Response details: ${json.message}`, 'error');
          submitBtn.querySelector('.btn-text').innerText = 'DISPATCH FAILED';
        }
      })
      .catch(err => {
        addConsoleLine('CRITICAL: Server timed out during handshake.', 'error');
        addConsoleLine(err.message, 'error');
        submitBtn.querySelector('.btn-text').innerText = 'DISPATCH FAILED';
      })
      .finally(() => {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.querySelector('.btn-text').innerText = 'INITIATE SEND PROTOCOL';
        }, 4000);
      });
    });
  }

  /* ==========================================================================
     9. RESPONSIVE MOBILE NAVIGATION DRAWER & AUTO-CLOSE FIXES
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');

  if (mobileToggle && navLinks) {
    // 1. Toggle mobile menu on burger click
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileToggle.classList.toggle('open');
      navLinks.classList.toggle('active', isOpen);
    });

    // 2. Auto-close navigation drawer on link selection
    navItems.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navLinks.classList.remove('active');
        
        // Update active class state inline
        navItems.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // 3. Close menu when clicking outside of navbar container
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active')) {
        const isClickInside = navLinks.contains(e.target) || mobileToggle.contains(e.target);
        if (!isClickInside) {
          mobileToggle.classList.remove('open');
          navLinks.classList.remove('active');
        }
      }
    });
  }

  // Scroll Spy to highlight navbar link based on visible section and style header
  const sections = document.querySelectorAll('section');
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    // 1. Toggle scrolled class for header backdrop block
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. Active link highlight
    let current = '';
    const scrollPos = window.scrollY + 120; // Offset spacing

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    if (current) {
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
          item.classList.add('active');
        }
      });
    }
  });

  /* ==========================================================================
     10. CUSTOM CYBERNETIC CURSOR TRAILING ANIMATION
     ========================================================================== */
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorOutline = document.querySelector('.custom-cursor-outline');

  if (cursorDot && cursorOutline) {
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let isMoving = false;

    let lastSparkTime = 0;

    const createSpark = (x, y) => {
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      
      const colors = ['var(--cyber-cyan)', 'var(--neon-pink)', 'var(--neon-purple)', '#ffffff'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      spark.style.setProperty('--spark-color', randomColor);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 15 + Math.random() * 25;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity;
      
      spark.style.setProperty('--dest-x', `${destX}px`);
      spark.style.setProperty('--dest-y', `${destY}px`);
      
      const size = 3 + Math.random() * 4;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      
      document.body.appendChild(spark);
      
      setTimeout(() => {
        spark.remove();
      }, 700);
    };

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Show cursors on first mouse move
      if (!isMoving) {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
        isMoving = true;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;

      // Spark generation rate limiting
      const now = Date.now();
      if (now - lastSparkTime > 18) {
        createSpark(mouseX, mouseY);
        lastSparkTime = now;
      }
    });

    // Outline follow interpolation (smooth lag)
    const animateCursor = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover classes for interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, select, input, textarea, [data-tilt], .faq-header, .mobile-menu-toggle, #game-canvas')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, select, input, textarea, [data-tilt], .faq-header, .mobile-menu-toggle, #game-canvas')) {
        document.body.classList.remove('cursor-hover');
      }
    });

    // Hide cursors when mouse leaves window bounds
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
      isMoving = false;
    });
  }

});