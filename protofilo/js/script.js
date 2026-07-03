/**
 * Main Script for Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       0. PRELOADER — STARFIELD + EKG + REVEAL
    ========================================= */
    const preloader     = document.getElementById('preloader');
    const accessGranted = document.getElementById('access-granted');
    const starCanvas    = document.getElementById('star-canvas');

    document.body.style.overflow = 'hidden';

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       STARFIELD (runs always inside preloader)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    if (starCanvas && preloader) {
        const ctx = starCanvas.getContext('2d');
        let stars = [];

        const initStars = () => {
            starCanvas.width  = window.innerWidth;
            starCanvas.height = window.innerHeight;
            stars = Array.from({ length: 150 }, () => ({
                x:       Math.random() * starCanvas.width,
                y:       Math.random() * starCanvas.height,
                r:       Math.random() * 1.5 + 0.3,
                alpha:   Math.random(),
                dAlpha:  (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
                speed:   Math.random() * 0.15 + 0.02,
                color:   Math.random() < 0.3 ? '#38bdf8' : '#ffffff',
            }));
        };
        initStars();
        window.addEventListener('resize', initStars);

        (function tickStars() {
            if (preloader.classList.contains('done')) return; // Stop rendering when preloader closes
            ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            stars.forEach(s => {
                s.alpha += s.dAlpha;
                if (s.alpha > 1 || s.alpha < 0) s.dAlpha *= -1;
                s.alpha = Math.max(0, Math.min(1, s.alpha));

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.shadowColor = s.color;
                ctx.shadowBlur  = s.r * 4;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur  = 0;

                s.y -= s.speed;
                if (s.y < 0) { 
                    s.y = starCanvas.height; 
                    s.x = Math.random() * starCanvas.width; 
                }
            });
            requestAnimationFrame(tickStars);
        })();
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       HELPERS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const wait = ms => new Promise(r => setTimeout(r, ms));

    async function typeText(el, text, speed = 40) {
        if (!el) return;
        el.textContent = '';
        for (let i = 0; i <= text.length; i++) {
            el.textContent = text.substring(0, i);
            await wait(speed);
        }
    }

    async function glitchReveal(el, finalText, duration = 1000) {
        if (!el) return;
        const pool  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?<>/\\';
        const steps = Math.floor(duration / 40);
        for (let s = 0; s <= steps; s++) {
            const revealed = Math.floor((s / steps) * finalText.length);
            let out = '';
            for (let c = 0; c < finalText.length; c++) {
                out += c < revealed ? finalText[c] : pool[Math.floor(Math.random() * pool.length)];
            }
            el.textContent = out;
            await wait(40);
        }
        el.textContent = finalText;
    }

    function showPhase(id) {
        document.querySelectorAll('.preloader-phase').forEach(p => {
            p.style.opacity = '0';
            p.style.display = 'none';
        });
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = 'flex';
        requestAnimationFrame(() => {
            el.style.opacity = '1';
        });
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       EKG HEARTBEAT
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    function runEKG(canvasEl) {
        return new Promise(resolve => {
            const ctx = canvasEl.getContext('2d');
            const W = canvasEl.width, H = canvasEl.height, mid = H / 2;
            const amp = H * 0.38;
            const pts = [];

            const addFlat  = (x0, x1) => { for (let x = x0; x <= x1; x += 2) pts.push([x, mid]); };
            const addSpike = (sx) => {
                pts.push([sx,      mid - amp * 0.15]);
                pts.push([sx + 6,  mid + amp * 0.30]);
                pts.push([sx + 12, mid - amp]);
                pts.push([sx + 18, mid + amp * 1.5]);
                pts.push([sx + 24, mid - amp * 0.35]);
                pts.push([sx + 30, mid + amp * 0.10]);
                pts.push([sx + 36, mid]);
            };
            addFlat(0, W * 0.18);
            addSpike(W * 0.18);
            addFlat(W * 0.18 + 38, W * 0.52);
            addSpike(W * 0.52);
            addFlat(W * 0.52 + 38, W);

            let drawn = 0;
            (function draw() {
                ctx.clearRect(0, 0, W, H);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth   = 2.5;
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur  = 12;
                ctx.beginPath();
                if (pts.length) ctx.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < drawn; i++) ctx.lineTo(pts[i][0], pts[i][1]);
                ctx.stroke();

                if (drawn > 0 && drawn < pts.length) {
                    const [lx, ly] = pts[drawn - 1];
                    ctx.beginPath();
                    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
                    ctx.fillStyle  = '#fff';
                    ctx.shadowBlur = 20;
                    ctx.fill();
                }

                drawn = Math.min(drawn + 4, pts.length);
                if (drawn < pts.length) {
                    requestAnimationFrame(draw);
                } else {
                    resolve();
                }
            })();
        });
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MAIN SEQUENCE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    async function runSequence() {
        if (!preloader) return;

        await wait(500);

        /* PHASE 1 — EKG */
        showPhase('phase-ekg');
        const ekgCanvas = document.getElementById('ekg-canvas');
        const ekgLabel  = document.getElementById('ekg-label');
        
        if (ekgLabel) {
            await typeText(ekgLabel, '// INITIALIZING AI SYSTEM...', 45);
        }
        if (ekgCanvas) {
            await runEKG(ekgCanvas);
        }
        await wait(600);

        /* PHASE 2 — NAME REVEAL */
        showPhase('phase-name');
        const nameEl = document.getElementById('matrix-name');
        if (nameEl) {
            await glitchReveal(nameEl, 'ENG. MOHAMED SAMI', 1100);
        }
        await wait(600);

        /* PHASE 3 — ACCESS GRANTED */
        if (accessGranted) {
            accessGranted.classList.add('show');
        }
        await wait(1500);

        /* REVEAL SITE */
        preloader.classList.add('reveal');
        await wait(600);
        preloader.classList.add('done');
        document.body.style.overflow = '';
        setTimeout(() => { 
            if (preloader) preloader.style.display = 'none'; 
        }, 600);
    }

    // Start Sequence
    runSequence();

    /* =========================================
       1. STICKY NAVBAR & SCROLL PROGRESS
    ========================================= */
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollTopBtn = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        // Sticky Header
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }
        
        // Scroll Progress
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }
        
        // Scroll To Top Button
        if (scrollTopBtn) {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
    });

    /* =========================================
       2. MOBILE MENU TOGGLE
    ========================================= */
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (navToggle && navMenu) {
        // Toggle menu
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('show-menu')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
        
        // Close menu when link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show-menu');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            });
        });
    }

    /* =========================================
       3. ACTIVE NAVIGATION HIGHLIGHT
    ========================================= */
    const sections = document.querySelectorAll('section[id]');
    
    function scrollActive() {
        const scrollY = window.scrollY;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', scrollActive);

    /* =========================================
       4. TYPING EFFECT
    ========================================= */
    const typingText = document.getElementById('typing-text');
    const words = ['AI Student', 'Software Developer', 'Future AI Engineer', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        if (!typingText) return;
        
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; 
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; 
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1500; 
        } 
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; 
        }
        
        setTimeout(type, typingSpeed);
    }
    
    if (typingText) setTimeout(type, 1000);

    /* =========================================
       5. SMOOTH REVEAL ANIMATIONS
    ========================================= */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                if (entry.target.classList.contains('about-container')) {
                    startCounters();
                }
                
                observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    /* =========================================
       6. ANIMATED COUNTERS
    ========================================= */
    let countersStarted = false;
    
    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;
        
        const counters = document.querySelectorAll('.counter');
        const speed = 200; 
        
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    /* =========================================
       7. PROJECT FILTERING
    ========================================= */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300); 
            });
        });
    });

    /* =========================================
       8. CONTACT FORM SUBMISSION (Frontend)
    ========================================= */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
                btn.classList.remove('btn-primary');
                btn.style.backgroundColor = '#10b981'; 
                
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.add('btn-primary');
                    btn.style.backgroundColor = ''; 
                }, 3000);
            }, 1500);
        });
    }
});