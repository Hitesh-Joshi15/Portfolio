// ===================================
// MAIN INTERACTIVE FEATURES
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavigation();
    initScrollEffects();
    initTypingEffect();
    initCommandPalette();
    initThemeToggle();
    initProjectCardTilt();
    initProjectCarousels();
    initSkillsVisualization();
    initSkillBubbles();
    initSkillBars();
    initTechStack();
    initStatCounters();
    initFormParticles();
    initSmoothScroll();
    initIntersectionObserver();
    initResumeDownload();
    initProfileImageSwitcher();
    
    // Ensure tech stats are updated after a brief delay
    setTimeout(() => {
        if (window.updateTechStats) {
            window.updateTechStats();
        }
    }, 500);
});

// ===================================
// RESUME DOWNLOAD HANDLER
// ===================================
function initResumeDownload() {
    const resumeBtn = document.getElementById('resumeDownload');
    if (!resumeBtn) return;
    
    resumeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const url = resumeBtn.getAttribute('href');
        const filename = 'Hitesh_Joshi_Resume.pdf';
        
        try {
            // Try to fetch and download with correct filename
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Create temporary link and trigger download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            } else {
                // Fallback: open in new tab
                window.open(url, '_blank');
            }
        } catch (error) {
            // CORS error or network issue - fallback to opening in new tab
            console.log('Download via fetch failed, opening in new tab:', error);
            window.open(url, '_blank');
        }
    });
}

// ===================================
// PROFILE IMAGE SWITCHER
// ===================================
function initProfileImageSwitcher() {
    const profileImages = document.querySelectorAll('.profile-image');
    if (profileImages.length < 2) return;
    
    let currentIndex = 0;
    
    function switchImage() {
        // Remove active class from current image
        profileImages[currentIndex].classList.remove('active');
        
        // Move to next image (loop back to 0 if at end)
        currentIndex = (currentIndex + 1) % profileImages.length;
        
        // Add active class to new image
        profileImages[currentIndex].classList.add('active');
    }
    
    // Switch images every 4 seconds
    setInterval(switchImage, 4000);
}

// ===================================
// LOADER
// ===================================
function initLoader() {
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2000);
    });
}

// ===================================
// NAVIGATION
// ===================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');
    const dots = document.querySelectorAll('.nav-dots .dot');
    
    // Consolidated scroll handler (passive for performance)
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(() => {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                updateActiveNav();
                updateScrollProgress();
                scrollTicking = false;
            });
        }
    }, { passive: true });
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Update active navigation
    function updateActiveNav() {
        const sections = document.querySelectorAll('.section, .hero');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('href') === `#${current}`) {
                dot.classList.add('active');
            }
        });
    }
}

// ===================================
// SCROLL EFFECTS
// ===================================
function initScrollEffects() {
    // Scroll progress is now handled by the consolidated scroll handler in initNavigation
}

function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
}

// ===================================
// TYPING EFFECT
// ===================================
function initTypingEffect() {
    const typedText = document.querySelector('.typed-text');
    const words = [
        'AI Integration Specialist',
        'Full Stack Developer', 
        'Healthcare Tech Innovator',
        'Software Engineer',
        'MUMPS Developer',
        'Problem Solver',
        'Tech Enthusiast'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typedText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }
    
    type();
}

// ===================================
// COMMAND PALETTE
// ===================================
function initCommandPalette() {
    const commandPalette = document.getElementById('commandPalette');
    const commandInput = document.getElementById('commandInput');
    const cmdBtn = document.querySelector('.cmd-btn');
    const commands = [
        { name: 'Home', action: () => scrollToSection('#home') },
        { name: 'About', action: () => scrollToSection('#about') },
        { name: 'Experience', action: () => scrollToSection('#experience') },
        { name: 'Projects', action: () => scrollToSection('#projects') },
        { name: 'Skills', action: () => scrollToSection('#skills') },
        { name: 'Contact', action: () => scrollToSection('#contact') },
        { name: 'Toggle Theme', action: () => toggleTheme() },
        { name: 'Download Resume', action: () => alert('Resume download feature') }
    ];
    
    // Open with Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
        
        if (e.key === 'Escape') {
            commandPalette.classList.remove('active');
        }
    });
    
    // Open with button
    if (cmdBtn) {
        cmdBtn.addEventListener('click', toggleCommandPalette);
    }
    
    function toggleCommandPalette() {
        commandPalette.classList.toggle('active');
        if (commandPalette.classList.contains('active')) {
            commandInput.focus();
        }
    }
    
    // Search and execute commands
    commandInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const results = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query)
        );
        
        displayCommandResults(results);
    });
    
    function displayCommandResults(results) {
        const resultsContainer = document.querySelector('.command-results');
        resultsContainer.innerHTML = '';
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'command-item';
            item.textContent = result.name;
            item.addEventListener('click', () => {
                result.action();
                commandPalette.classList.remove('active');
                commandInput.value = '';
            });
            resultsContainer.appendChild(item);
        });
    }
    
    // Close on outside click
    commandPalette.addEventListener('click', (e) => {
        if (e.target === commandPalette) {
            commandPalette.classList.remove('active');
        }
    });
}

function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===================================
// THEME TOGGLE
// ===================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Default to light theme for first-time users
    if (savedTheme === null) {
        document.body.classList.add('light-theme');
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    // If savedTheme === 'dark', keep body without light-theme class (default dark)
    
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    document.body.classList.toggle('light-theme');
    
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
    
    // Update radar chart colors for new theme
    updateRadarChartTheme();
}

function updateRadarChartTheme() {
    if (!window.skillsChart) return;
    
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Update chart colors based on theme
    window.skillsChart.options.scales.r.ticks.color = isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    window.skillsChart.options.scales.r.grid.color = isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    window.skillsChart.options.scales.r.pointLabels.color = isLightTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    
    // Re-render chart
    window.skillsChart.update();
}

// ===================================
// PROJECT CARD TILT EFFECT
// ===================================
function initProjectCardTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===================================
// PROJECT CAROUSEL
// ===================================
function initProjectCarousels() {
    const carousels = document.querySelectorAll('.project-carousel');
    
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-image');
        const indicators = carousel.querySelectorAll('.indicator');
        let currentIndex = 0;
        let interval;
        
        function showImage(index) {
            images.forEach(img => img.classList.remove('active'));
            indicators.forEach(ind => ind.classList.remove('active'));
            
            images[index].classList.add('active');
            indicators[index].classList.add('active');
            currentIndex = index;
        }
        
        function nextImage() {
            let newIndex = (currentIndex + 1) % images.length;
            showImage(newIndex);
        }
        
        function startAutoRotation() {
            interval = setInterval(nextImage, 4000);
        }
        
        function stopAutoRotation() {
            clearInterval(interval);
        }
        
        // Indicator click handler
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showImage(index);
                stopAutoRotation();
                startAutoRotation();
            });
        });
        
        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoRotation);
        carousel.addEventListener('mouseleave', startAutoRotation);
        
        // Start auto-rotation
        startAutoRotation();
    });
}

// ===================================
// SKILLS VISUALIZATION - RADAR CHART
// ===================================
function initSkillsVisualization() {
    const canvas = document.getElementById('skillsRadar');
    
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded or canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Detect if light theme is active
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Set colors based on theme
    const tickColor = isLightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    const gridColor = isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const labelColor = isLightTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    
    // Get core competencies from dynamic data
    const coreComp = window.SKILLS_DATA ? window.SKILLS_DATA.coreCompetencies : [
        { name: 'System Design', proficiency: 88 },
        { name: 'Problem Solving', proficiency: 92 },
        { name: 'Team Leadership', proficiency: 87 },
        { name: 'Agile/Scrum', proficiency: 86 },
        { name: 'Code Quality', proficiency: 91 },
        { name: 'Security', proficiency: 84 }
    ];
    
    const data = {
        labels: coreComp.map(c => c.name),
        datasets: [{
            label: 'Core Competencies',
            data: coreComp.map(c => c.proficiency),
            backgroundColor: 'rgba(0, 240, 255, 0.2)',
            borderColor: 'rgba(0, 240, 255, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 240, 255, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(0, 240, 255, 1)'
        }]
    };
    
    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: tickColor,
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: gridColor
                    },
                    pointLabels: {
                        color: labelColor,
                        font: {
                            size: 14,
                            family: 'Rajdhani'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };
    
    window.skillsChart = new Chart(ctx, config);
}

// ===================================
// SKILL BUBBLES WITH WATER RIPPLE PHYSICS
// ===================================
let bubbleData = [];
let ripples = [];
let animationId = null;

function initSkillBubbles() {
    const container = document.getElementById('skillBubbles');
    
    if (!container) return;
    
    // Get top skills dynamically
    const skills = window.getTopSkills ? window.getTopSkills(8) : [
        { name: 'System Design', size: 92 },
        { name: 'Agile/Scrum', size: 90 },
        { name: 'Leadership', size: 87 },
        { name: 'Code Review', size: 93 },
        { name: 'API Design', size: 92 },
        { name: 'Testing/TDD', size: 86 },
        { name: 'Documentation', size: 91 },
        { name: 'Security', size: 84 }
    ];
    
    bubbleData = [];
    ripples = [];
    
    skills.forEach((skill, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'skill-bubble';
        bubble.textContent = skill.name;
        bubble.style.fontSize = `${skill.size / 8}px`;
        
        // Random position
        const maxX = container.offsetWidth - 150;
        const maxY = container.offsetHeight - 60;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.animationDelay = `${index * 0.2}s`;
        
        // Remove float animation to prevent conflict with transform
        bubble.style.animation = 'none';
        
        // Store bubble data for wave physics
        bubbleData.push({
            element: bubble,
            originalX: x,
            originalY: y,
            currentX: x,
            currentY: y,
            velocityX: 0,
            velocityY: 0,
            width: 150,
            height: 60
        });
        
        container.appendChild(bubble);
    });
    
    // Add ripple effect on click
    container.addEventListener('click', createRipple);
    
    // Start animation loop
    animateBubbles();
}

function createRipple(e) {
    const container = document.getElementById('skillBubbles');
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Create visual ripple rings
    createRippleVisual(clickX, clickY, container);
    
    // Add ripple data for wave physics
    ripples.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 400,
        speed: 200, // pixels per second
        strength: 8, // displacement strength (reduced for gentle movement)
        startTime: Date.now(),
        duration: 2000 // 2 seconds
    });
}

function createRippleVisual(x, y, container) {
    // Create 3 expanding rings for visual effect
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-wave';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            container.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 2000);
        }, i * 150);
    }
}

function animateBubbles() {
    const currentTime = Date.now();
    
    // Update ripples
    ripples = ripples.filter(ripple => {
        const elapsed = currentTime - ripple.startTime;
        const progress = elapsed / ripple.duration;
        
        if (progress >= 1) return false; // Remove finished ripples
        
        // Expand ripple radius
        ripple.radius = ripple.maxRadius * progress;
        return true;
    });
    
    // Apply wave forces to bubbles
    bubbleData.forEach(bubble => {
        const centerX = bubble.originalX + bubble.width / 2;
        const centerY = bubble.originalY + bubble.height / 2;
        
        let forceX = 0;
        let forceY = 0;
        
        // Calculate combined force from all active ripples
        ripples.forEach(ripple => {
            const dx = centerX - ripple.x;
            const dy = centerY - ripple.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if wave is near this bubble
            const distanceFromWaveFront = Math.abs(distance - ripple.radius);
            
            if (distanceFromWaveFront < 100 && distance > 10) {
                // Wave strength decreases as it expands
                const waveStrength = 1 - (ripple.radius / ripple.maxRadius);
                const proximity = 1 - (distanceFromWaveFront / 100);
                
                const power = waveStrength * proximity * 0.3; // Much gentler force
                
                // Push outward from ripple center
                const angle = Math.atan2(dy, dx);
                forceX += Math.cos(angle) * power;
                forceY += Math.sin(angle) * power;
            }
        });
        
        // Apply forces gently
        bubble.velocityX += forceX * 0.5;
        bubble.velocityY += forceY * 0.5;
        
        // Add gentle random drift for floating effect
        bubble.velocityX += (Math.random() - 0.5) * 0.15;
        bubble.velocityY += (Math.random() - 0.5) * 0.15;
        
        // Stronger friction for slower, smoother movement
        bubble.velocityX *= 0.97;
        bubble.velocityY *= 0.97;
        
        // Update position
        bubble.currentX += bubble.velocityX;
        bubble.currentY += bubble.velocityY;
        
        // Soft boundaries - gentle bounce off edges
        const maxX = document.getElementById('skillBubbles').offsetWidth - bubble.width;
        const maxY = document.getElementById('skillBubbles').offsetHeight - bubble.height;
        
        if (bubble.currentX < 0) {
            bubble.currentX = 0;
            bubble.velocityX = Math.abs(bubble.velocityX) * 0.3; // Very soft bounce
        }
        if (bubble.currentX > maxX) {
            bubble.currentX = maxX;
            bubble.velocityX = -Math.abs(bubble.velocityX) * 0.3;
        }
        if (bubble.currentY < 0) {
            bubble.currentY = 0;
            bubble.velocityY = Math.abs(bubble.velocityY) * 0.3;
        }
        if (bubble.currentY > maxY) {
            bubble.currentY = maxY;
            bubble.velocityY = -Math.abs(bubble.velocityY) * 0.3;
        }
        
        // Update DOM
        const offsetX = bubble.currentX - bubble.originalX;
        const offsetY = bubble.currentY - bubble.originalY;
        bubble.element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
    
    animationId = requestAnimationFrame(animateBubbles);
}

// ===================================
// STAT COUNTERS
// ===================================
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-card .stat-number');
    
    // Update dynamic stats
    stats.forEach(stat => {
        const label = stat.nextElementSibling;
        if (label && label.textContent.includes('Years Experience')) {
            if (window.calculateTotalWorkExperience) {
                const yearsExp = window.calculateTotalWorkExperience();
                const target = Math.round(yearsExp);
                stat.setAttribute('data-target', target);
                stat.textContent = target; // Set initial value
            }
        }
        if (label && label.textContent.includes('Technologies')) {
            if (window.getAllSkills) {
                const totalTech = window.getAllSkills().length;
                stat.setAttribute('data-target', totalTech);
                stat.textContent = totalTech; // Set initial value
            }
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                // Reset to 0 before animating
                entry.target.textContent = '0';
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }); // Reduced threshold for earlier trigger
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    if (!target || isNaN(target)) {
        element.textContent = '0';
        return;
    }
    
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    const suffix = element.getAttribute('data-suffix') !== null ? element.getAttribute('data-suffix') : '+';
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// ===================================
// DYNAMIC SKILL BARS
// ===================================
function initSkillBars() {
    const container = document.querySelector('.skill-bars');
    if (!container || !window.SKILLS_DATA) return;

    // Define skill categories with icons and what to display
    const categories = [
        {
            title: 'Programming Languages',
            icon: 'fas fa-code',
            skills: window.getSkillsForDisplay('languages', false), // include inactive
            showYears: true
        },
        {
            title: 'Backend & Databases',
            icon: 'fas fa-server',
            skills: window.getSkillsForDisplay('backend'),
            showYears: true
        },
        {
            title: 'AI & Machine Learning',
            icon: 'fas fa-brain',
            skills: window.getSkillsForDisplay('ai'),
            showYears: true
        },
        {
            title: 'Development Tools',
            icon: 'fas fa-tools',
            skills: window.getSkillsForDisplay('tools'),
            showYears: false // Show proficiency for tools
        },
        {
            title: 'Core Concepts',
            icon: 'fas fa-lightbulb',
            skills: window.getSkillsForDisplay('concepts'),
            showYears: false
        },
        {
            title: 'Methodologies',
            icon: 'fas fa-project-diagram',
            skills: window.getSkillsForDisplay('methodologies'),
            showYears: false
        }
    ];

    container.innerHTML = '';

    categories.forEach(category => {
        if (category.skills.length === 0) return;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category glass-effect';
        
        let html = `<h3><i class="${category.icon}"></i> ${category.title}</h3>`;
        
        category.skills.forEach(skill => {
            const value = skill.value || 0;
            const displayValue = skill.displayType === 'years'
                ? `${value} year${value !== 1 ? 's' : ''}` 
                : `${value}%`;
            
            // Determine progress bar value (0-100)
            const progressValue = skill.displayType === 'years'
                ? Math.min(Math.round((value / 10) * 100), 100) // Years normalized to 10-year scale
                : value; // Proficiency already 0-100
            
            // Create status indicators
            let statusIndicator = '';
            if (skill.past) {
                statusIndicator = '<span class="skill-status past" title="Previous experience">⚠️</span>';
            } else if (skill.learning) {
                statusIndicator = '<span class="skill-status learning" title="Currently learning">📚</span>';
            } else if (!skill.active && skill.occasional) {
                statusIndicator = '<span class="skill-status occasional" title="Occasional use">⭐</span>';
            }
            
            // Add dim class for inactive/past skills
            const dimClass = (!skill.active || skill.past) ? 'skill-dimmed' : '';
            
            html += `
                <div class="skill-bar-item ${dimClass}">
                    <div class="skill-info">
                        <span>${skill.name} ${statusIndicator}</span>
                        <span class="skill-percentage">${displayValue}</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" data-progress="${progressValue}"></div>
                    </div>
                </div>
            `;
        });
        
        categoryDiv.innerHTML = html;
        container.appendChild(categoryDiv);
    });

    // Animate skill bars on visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll('.skill-progress');
                progressBars.forEach((bar, index) => {
                    setTimeout(() => {
                        const progress = bar.getAttribute('data-progress');
                        bar.style.width = progress + '%';
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const categories_observed = container.querySelectorAll('.skill-category');
    categories_observed.forEach(cat => observer.observe(cat));
}

// ===================================
// DYNAMIC TECH STACK
// ===================================
function initTechStack() {
    const container = document.querySelector('.tech-layers');
    if (!container || !window.SKILLS_DATA) return;

    // Map skills to tech icon classes
    const techIcons = {
        'JavaScript': 'fab fa-js',
        'Python': 'fab fa-python',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'MUMPS': 'fas fa-code',
        'C': 'fas fa-copyright',
        'C++': 'fas fa-plus',
        'Java': 'fab fa-java',
        'Node.js': 'fab fa-node-js',
        'MongoDB': 'fas fa-database',
        'MySQL': 'fas fa-database',
        'PostgreSQL': 'fas fa-database',
        'TensorFlow': 'fas fa-brain',
        'PyTorch': 'fas fa-fire',
        'OpenCV': 'fas fa-eye',
        'Git': 'fab fa-git-alt',
        'VS Code': 'fas fa-code',
        'PyCharm': 'fab fa-python',
        'Unity': 'fab fa-unity',
        'Unreal Engine': 'fas fa-cubes',
        'Postman': 'fas fa-bolt',
        'Jupyter': 'fas fa-book',
        'Linux': 'fab fa-linux',
        'Wireshark': 'fas fa-network-wired',
        'GitHub': 'fab fa-github',
        'REST API': 'fas fa-cogs'
    };

    // Define tech stack layers
    const layers = [
        {
            name: 'Languages',
            icon: 'fas fa-code',
            categories: ['languages'],
            color: '#00f0ff'
        },
        {
            name: 'Backend & Databases',
            icon: 'fas fa-server', 
            categories: ['backend'],
            color: '#aa00ff'
        },
        {
            name: 'AI & Machine Learning',
            icon: 'fas fa-brain',
            categories: ['ai'],
            color: '#ff6b6b'
        },
        {
            name: 'Development Tools',
            icon: 'fas fa-tools',
            categories: ['tools'],
            color: '#4caf50'
        }
    ];

    container.innerHTML = '';

    layers.forEach(layer => {
        // Gather skills for this layer
        const skills = [];
        layer.categories.forEach(cat => {
            const categorySkills = window.getSkillsForDisplay(cat, false); // include inactive
            skills.push(...categorySkills);
        });

        if (skills.length === 0) return;

        const layerDiv = document.createElement('div');
        layerDiv.className = 'tech-layer glass-effect';
        layerDiv.setAttribute('data-layer', layer.name.toLowerCase().replace(/\s+/g, '-'));

        let html = `
            <div class="layer-header">
                <div class="layer-icon">
                    <i class="${layer.icon}"></i>
                </div>
                <h3>${layer.name}</h3>
                <span class="layer-badge">${skills.length} Technologies</span>
            </div>
            <div class="layer-content">
                <div class="tech-items">
        `;

        skills.forEach(skill => {
            const icon = techIcons[skill.name] || 'fas fa-code';
            const value = skill.value || 0;
            const yearsText = skill.displayType === 'years' 
                ? `${value} yr${value !== 1 ? 's' : ''}` 
                : `${value}%`;
            
            // Calculate proficiency percentage for the bar (0-100)
            const proficiency = skill.displayType === 'years'
                ? Math.min(Math.round((value / 10) * 100), 100)
                : value;
            
            // Determine status
            let statusClass = '';
            if (!skill.active || skill.past) {
                statusClass = 'tech-inactive';
            } else if (skill.learning) {
                statusClass = 'tech-learning';
            }

            html += `
                <div class="tech-item ${statusClass}" data-experience="${value}">
                    <div class="tech-icon">
                        <i class="${icon}"></i>
                    </div>
                    <span class="tech-name">${skill.name}</span>
                    <span class="tech-years">${yearsText}</span>
                    <div class="tech-proficiency">
                        <div class="proficiency-bar" data-progress="${proficiency}"></div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        layerDiv.innerHTML = html;
        container.appendChild(layerDiv);
    });

    // Animate proficiency bars on visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.proficiency-bar');
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        const progress = bar.getAttribute('data-progress');
                        bar.style.width = progress + '%';
                    }, index * 50);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const layers_observed = container.querySelectorAll('.tech-layer');
    layers_observed.forEach(layer => observer.observe(layer));

    // Update tech stats summary
    updateTechStats();
}

// Make updateTechStats available globally for debugging and delayed calls
window.updateTechStats = updateTechStats;

function updateTechStats() {
    if (!window.SKILLS_DATA) {
        console.warn('SKILLS_DATA not loaded');
        return;
    }

    // Count total technologies
    const allSkills = window.getAllSkills();
    const totalTechCount = allSkills.length;
    
    // Get work experience (intern + full-time, not including college)
    const workYears = window.calculateTotalWorkExperience ? window.calculateTotalWorkExperience() : 3;
    
    // Update stat numbers in tech-stats-summary section
    const statsContainer = document.querySelector('.tech-stats-summary');
    if (statsContainer) {
        const statNumbers = statsContainer.querySelectorAll('.stat-number');
        console.log('Updating tech stats, found', statNumbers.length, 'stat elements');
        if (statNumbers[0]) {
            statNumbers[0].textContent = totalTechCount;
            console.log('Set Technologies to:', totalTechCount);
        }
        if (statNumbers[1]) {
            statNumbers[1].textContent = Math.floor(workYears) + '+';
            console.log('Set Years to:', Math.floor(workYears) + '+');
        }
        if (statNumbers[2]) {
            statNumbers[2].textContent = '50+';
            console.log('Set Projects to: 50+');
        }
        if (statNumbers[3]) {
            statNumbers[3].textContent = '3';
            console.log('Set Wins to: 3');
        }
    } else {
        console.error('tech-stats-summary container not found');
    }
}

// ===================================
// FORM PARTICLES
// ===================================
function initFormParticles() {
    const canvas = document.querySelector('.form-particles');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    class FormParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push(new FormParticle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Animate skill bars
                if (entry.target.classList.contains('skill-progress')) {
                    const progress = entry.target.getAttribute('data-progress');
                    entry.target.style.width = progress + '%';
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToObserve = document.querySelectorAll(
        '.section-header, .project-card, .skill-category, .contact-card, .about-image, .terminal-window, .philosophy-canvas-wrapper'
    );
    
    elementsToObserve.forEach(el => observer.observe(el));
    
    // Observe skill bars separately
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => observer.observe(bar));
}

// ===================================
// FORM SUBMISSION
// ===================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
        
        // Reset form
        contactForm.reset();
        
        // Here you would typically send the data to a server
        // console.log('Form data:', data);
    });
}

// ===================================
// PERFORMANCE MONITORING
// ===================================
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        // console.log(`Page loaded in ${pageLoadTime}ms`);
    });
}
