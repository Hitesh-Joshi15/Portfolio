// ===================================
// 3D SPIRAL TIMELINE FOR EXPERIENCE
// ===================================

class SpiralTimeline3D {
    constructor() {
        this.svg = document.getElementById('spiralTimeline');
        this.container = document.querySelector('.timeline-events');
        this.expandedCard = null;
        
        // Timeline data - from bottom (education) to top (current)
        this.experiences = [
            {
                date: 'April 2015 - May 2016',
                title: 'High School (10th Standard)',
                company: 'Kendriya Vidyalaya Tirmalagiri, Secunderabad',
                type: 'education',
                summary: 'CGPA: 10',
                description: 'Completed secondary education with perfect 10 CGPA, demonstrating strong academic foundation.',
                details: [
                    'CGPA: 10/10',
                    'Strong foundation in Mathematics and Science',
                    'Active participant in school competitions',
                    'Developed early interest in computers and technology'
                ]
            },
            {
                date: 'June 2016 - May 2018',
                title: 'Intermediate (11th - 12th), Science (PCM)',
                company: 'New Chaitanya Junior College, Hyderabad',
                type: 'education',
                summary: '93.8%',
                description: 'Completed higher secondary education with 93.8% in Physics, Chemistry, and Mathematics stream.',
                details: [
                    'Percentage: 93.8%',
                    'Stream: Science (Physics, Chemistry, Mathematics)',
                    'Developed strong analytical and problem-solving skills',
                    'Participated in science exhibitions and technical events'
                ]
            },
            {
                date: 'July 2018 - August 2022',
                title: 'B.Tech in Computer Science and Engineering',
                company: 'Institute of Aeronautical Engineering, Hyderabad',
                type: 'education',
                summary: 'CGPA: 8.22',
                description: 'Graduated with CGPA 8.22. Completed final year project on Handwritten Digit Recognition using CNN. Served as Class Representative.',
                details: [
                    'CGPA: 8.22/10',
                    'Major: Computer Science and Engineering',
                    'Final Year Project: Handwritten Digit Recognition using CNN',
                    'Served as Class Representative, coordinating between students and faculty',
                    'Relevant Coursework: Data Structures, Algorithms, Machine Learning, Web Development',
                    'Winner - AR/VR Track (Google DSC WOW)',
                    '2nd Rank - Pro-Coder Coding Competition',
                    'Semifinalist - Uber HackTag'
                ]
            },
            {
                date: 'November 2022 - July 2023',
                title: 'Software Engineering Intern',
                company: 'Altera Digital Health (formerly Allscripts), Vadodara',
                type: 'internship',
                summary: 'Healthcare systems internship',
                description: 'Gained hands-on experience in MUMPS and healthcare systems. Worked with Cache Studio for backend development and assisted in debugging production issues.',
                details: [
                    'Gained hands-on experience in MUMPS and healthcare systems',
                    'Assisted in debugging and resolving production issues',
                    'Worked with Reflection and Routines in Cache Studio',
                    'Learned healthcare industry standards and compliance',
                    'Collaborated with senior engineers on production support',
                    'Promoted to full-time role based on strong technical contributions'
                ]
            },
            {
                date: 'July 2023 - Present',
                title: 'Associate Software Engineer',
                company: 'Altera Digital Health (formerly Allscripts), Vadodara',
                type: 'work',
                summary: 'Full stack development & production support',
                description: 'Promoted from intern to full-time role. Delivered 40+ user stories, resolved 50+ production bugs, and integrated AI-driven workflows using MATCHA AI. Working with both frontend (HTML, CSS, JavaScript) and backend (MUMPS, Node.js, REST APIs).',
                details: [
                    'Promoted from intern to full-time role based on strong technical contributions',
                    'Resolved 50+ production bugs, improving system stability and customer experience',
                    'Delivered 40+ user stories across ~30 new functionalities',
                    'Contributed to dashboard development with HTML, CSS, and JavaScript',
                    'UI upliftment of Web Application using modern frontend technologies',
                    'Designed and developed REST APIs using Node.js',
                    'Integrated IRIS Studio with web applications via APIs',
                    'Designed and integrated AI-driven workflows using MATCHA AI',
                    'Enabled multi-model (ChatGPT, Gemini) interactions via custom APIs',
                    'Worked in Kanban-based Agile environment for production support',
                    'Participated in Scrum practices for feature development',
                    'Technologies: HTML, CSS, JavaScript, MUMPS, Cache Database, Node.js, JSON, IRIS Studio'
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createCenterAxis();
        this.create3DSpiral();
        this.createTimelineCards();
        this.animateOnScroll();
    }
    
    createCenterAxis() {
        // Create vertical center line
        const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        centerLine.setAttribute('x1', '400');
        centerLine.setAttribute('y1', '50');
        centerLine.setAttribute('x2', '400');
        centerLine.setAttribute('y2', '1550');
        centerLine.setAttribute('stroke', 'rgba(0, 240, 255, 0.2)');
        centerLine.setAttribute('stroke-width', '2');
        centerLine.setAttribute('stroke-dasharray', '10,5');
        this.svg.appendChild(centerLine);
    }
    
    create3DSpiral() {
        const centerX = 400;
        const startY = 50;
        const endY = 1550; // Increased for taller spiral
        const height = endY - startY;
        const turns = 2.5;
        const radiusMax = 160;
        const points = 400;
        
        const spiralPoints = [];
        const pathData = [];
        
        // Create 3D spiral going upward
        for (let i = 0; i <= points; i++) {
            const progress = i / points;
            const angle = progress * turns * 2 * Math.PI;
            
            // Y goes from bottom to top
            const y = endY - (progress * height);
            
            // 3D perspective effect  
            const radiusCurve = Math.sin(progress * Math.PI);
            const radius = radiusMax * radiusCurve;
            const depthFactor = Math.cos(angle) * 0.5 + 0.5;
            const scale = 0.7 + (depthFactor * 0.3);
            
            const x = centerX + radius * Math.cos(angle) * scale;
            const adjustedY = y;
            
            spiralPoints.push({ 
                x, 
                y: adjustedY, 
                angle,
                progress,
                depth: depthFactor,
                scale,
                radius
            });
            
            if (i === 0) {
                pathData.push(`M ${x} ${adjustedY}`);
            } else {
                pathData.push(`L ${x} ${adjustedY}`);
            }
        }
        
        this.spiralPoints = spiralPoints;
        
        // Create main spiral path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData.join(' '));
        path.setAttribute('stroke', 'url(#spiralGradient)');
        path.setAttribute('stroke-width', '4');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('filter', 'url(#glow)');
        
        // Animate path drawing
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.animation = 'drawPath 3s ease-in-out forwards';
        
        this.svg.appendChild(path);
        
        // Update spiral path for particles
        const spiralPath = document.getElementById('spiralPath');
        spiralPath.setAttribute('d', pathData.join(' '));
        
        // Add flowing particles (reduced count)
        this.createEnergyParticles(spiralPoints);
        
        // Add milestone markers
        this.experiences.forEach((exp, index) => {
            const progress = index / (this.experiences.length - 1);
            const pointIndex = Math.floor(progress * (spiralPoints.length - 1));
            const point = spiralPoints[pointIndex];
            
            // Create marker group
            const dotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            dotGroup.setAttribute('class', 'timeline-marker');
            dotGroup.setAttribute('data-index', index);
            
            // Outer glow ring
            const glowRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glowRing.setAttribute('cx', point.x);
            glowRing.setAttribute('cy', point.y);
            glowRing.setAttribute('r', '18');
            glowRing.setAttribute('fill', this.getTypeColor(exp.type));
            glowRing.setAttribute('opacity', '0.2');
            glowRing.style.animation = `breathe 3s ease-in-out infinite ${index * 0.4}s`;
            
            // Pulse ring  
            const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulseCircle.setAttribute('cx', point.x);
            pulseCircle.setAttribute('cy', point.y);
            pulseCircle.setAttribute('r', '12');
            pulseCircle.setAttribute('fill', 'none');
            pulseCircle.setAttribute('stroke', this.getTypeColor(exp.type));
            pulseCircle.setAttribute('stroke-width', '2');
            pulseCircle.style.animation = `pulse 2s ease-in-out infinite ${index * 0.3}s`;
            
            // Main dot
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', '8');
            circle.setAttribute('fill', this.getTypeColor(exp.type));
            circle.setAttribute('filter', 'url(#glow)');
            circle.style.opacity = '0';
            circle.style.animation = `fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${2 + index * 0.3}s`;
            circle.style.cursor = 'pointer';
            
            // Inner sparkle
            const sparkle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            sparkle.setAttribute('cx', point.x);
            sparkle.setAttribute('cy', point.y);
            sparkle.setAttribute('r', '3');
            sparkle.setAttribute('fill', '#ffffff');
            sparkle.style.opacity = '0';
            sparkle.style.animation = `sparkle 2s ease-in-out infinite ${index * 0.3 + 0.5}s`;
            
            dotGroup.appendChild(glowRing);
            dotGroup.appendChild(pulseCircle);
            dotGroup.appendChild(circle);
            dotGroup.appendChild(sparkle);
            this.svg.appendChild(dotGroup);
            
            // Store point reference
            exp.point = point;
            exp.index = index;
        });
    }
    
    createEnergyParticles(spiralPoints) {
        // Update the hidden spiral path for particles
        const pathData = spiralPoints.map((p, idx) => 
            idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
        ).join(' ');
        
        const spiralPath = document.getElementById('spiralPath');
        spiralPath.setAttribute('d', pathData);
        
        // Create animated particles flowing along the spiral (reduced count)
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const randomDelay = Math.random() * 6;
            const randomDuration = 5 + Math.random() * 3;
            const randomSize = 1.5 + Math.random() * 1;
            
            // Random color variation
            const colors = ['#00f0ff', '#aa00ff'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            particle.setAttribute('r', randomSize);
            particle.setAttribute('fill', randomColor);
            particle.setAttribute('filter', 'url(#glow)');
            
            // Animate particle along path
            const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            animateMotion.setAttribute('dur', `${randomDuration}s`);
            animateMotion.setAttribute('repeatCount', 'indefinite');
            animateMotion.setAttribute('begin', `${randomDelay}s`);
            
            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#spiralPath');
            animateMotion.appendChild(mpath);
            
            // Fade in and out as particle moves
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0;0.7;0.7;0');
            animate.setAttribute('keyTimes', '0;0.15;0.85;1');
            animate.setAttribute('dur', `${randomDuration}s`);
            animate.setAttribute('repeatCount', 'indefinite');
            animate.setAttribute('begin', `${randomDelay}s`);
            
            particle.appendChild(animateMotion);
            particle.appendChild(animate);
            this.svg.appendChild(particle);
        }
    }
    
    getTypeColor(type) {
        switch(type) {
            case 'education': return '#ff00ff'; // Magenta
            case 'internship': return '#ffaa00'; // Orange
            case 'work': return '#00f0ff'; // Cyan
            default: return '#00f0ff';
        }
    }
    
    createTimelineCards() {
        this.experiences.forEach((exp, index) => {
            const point = exp.point;
            
            // Create compact card
            const card = document.createElement('div');
            card.className = 'timeline-card glass-effect';
            card.setAttribute('data-index', index);
            
            // Simple alternation: even indices = left, odd indices = right
            // 0 (High School): Left, 1 (Intermediate): Right, 2 (B.Tech): Left, etc.
            const isOnLeft = index % 2 === 0;
            
            // Store spiral coordinates and side info
            card.dataset.side = isOnLeft ? 'left' : 'right';
            card.dataset.svgX = point.x;
            card.dataset.svgY = point.y;
            card.dataset.isOnLeft = isOnLeft;
            
            card.innerHTML = `
                <div class="card-compact">
                    <div class="card-type ${exp.type}">${this.getTypeIcon(exp.type)}</div>
                    <div class="card-date">${exp.date}</div>
                    <h3 class="card-title">${exp.title}</h3>
                    <div class="card-company">${exp.company}</div>
                    <div class="card-summary">${exp.summary}</div>
                    <div class="card-expand-icon">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                <div class="card-expanded">
                    <div class="card-close">
                        <i class="fas fa-times"></i>
                    </div>
                    <div class="card-type-full ${exp.type}">
                        ${this.getTypeIcon(exp.type)} 
                        ${exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                    </div>
                    <div class="card-date-full">${exp.date}</div>
                    <h2 class="card-title-full">${exp.title}</h2>
                    <div class="card-company-full">${exp.company}</div>
                    <p class="card-description-full">${exp.description}</p>
                    <div class="card-details">
                        <h4>Key Highlights:</h4>
                        <ul>
                            ${exp.details.map(detail => `<li><i class="fas fa-check"></i> ${detail}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            // Add to DOM first to measure
            this.container.appendChild(card);
            
            // Position card based on actual rendered spiral node position
            this.positionCard(card);
            
            card.style.opacity = '0';
            card.style.animationDelay = `${1.5 + index * 0.2}s`;
            
            // Click to expand
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-close')) {
                    this.expandCard(card, index);
                }
            });
            
            // Close button
            const closeBtn = card.querySelector('.card-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.collapseCard(card);
            });
        });
        
        // After all cards are positioned, add resize listener
        this.handleResize();
        
        // Debounce resize for performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 100);
        });
    }
    
    positionCard(card) {
        // Get SVG coordinates from dataset
        const svgX = parseFloat(card.dataset.svgX);
        const svgY = parseFloat(card.dataset.svgY);
        const isOnLeft = card.dataset.isOnLeft === 'true';
        
        // Convert SVG coordinates to actual screen position
        const svgRect = this.svg.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        // SVG viewBox is 800x1600, calculate scale
        const scaleX = svgRect.width / 800;
        const scaleY = svgRect.height / 1600;
        
        // Find actual screen position of the spiral node
        const screenNodeX = svgX * scaleX;
        const screenNodeY = svgY * scaleY;
        
        // Position card relative to the node
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        
        let cardX, cardY;
        
        // Responsive gap: larger on desktop, smaller on mobile
        const viewportWidth = window.innerWidth;
        let gap;
        
        if (viewportWidth < 768) {
            // MOBILE: Stack cards in two columns beside the spiral
            // Use narrower cards and position them tightly
            const containerWidth = containerRect.width;
            const spiralCenter = containerWidth / 2;
            
            if (isOnLeft) {
                // Left cards: align to left portion
                cardX = Math.max(5, spiralCenter - cardWidth - 15);
            } else {
                // Right cards: align to right portion
                cardX = Math.min(spiralCenter + 15, containerWidth - cardWidth - 5);
            }
            
            // Vertically: use spiral Y but ensure minimum spacing between cards
            cardY = screenNodeY - (cardHeight / 2);
            
            // Ensure cards don't go above container
            if (cardY < 5) cardY = 5;
            
        } else {
            if (viewportWidth >= 1024) {
                gap = 60; // Desktop: more space
            } else {
                gap = 40; // Tablet: medium space
            }
            
            if (isOnLeft) {
                // Place card to the LEFT of the spiral
                cardX = screenNodeX - cardWidth - gap;
                
                // Prevent card from going off left edge
                if (cardX < 0) {
                    cardX = 10; // Minimum padding from edge
                }
            } else {
                // Place card to the RIGHT of the spiral
                cardX = screenNodeX + gap;
                
                // Prevent card from going off right edge
                const containerWidth = containerRect.width;
                if (cardX + cardWidth > containerWidth) {
                    cardX = containerWidth - cardWidth - 10; // Minimum padding from edge
                }
            }
            
            // Center card vertically with node
            cardY = screenNodeY - (cardHeight / 2);
        }
        
        // Store calculated positions
        card.dataset.originalX = cardX;
        card.dataset.originalY = cardY;
        
        // Apply position
        card.style.left = `${cardX}px`;
        card.style.top = `${cardY}px`;
    }
    
    handleResize() {
        // Reposition all cards on window resize
        this.experiences.forEach((exp, index) => {
            const card = this.container.querySelector(`[data-index="${index}"]`);
            if (!card || card.classList.contains('expanded')) return;
            
            this.positionCard(card);
        });
    }
    
    getTypeIcon(type) {
        switch(type) {
            case 'education': return '<i class="fas fa-graduation-cap"></i>';
            case 'internship': return '<i class="fas fa-user-graduate"></i>';
            case 'work': return '<i class="fas fa-briefcase"></i>';
            default: return '<i class="fas fa-circle"></i>';
        }
    }
    
    expandCard(card, index) {
        if (this.expandedCard === card) return;
        
        // Collapse previous card if exists
        if (this.expandedCard) {
            this.collapseCard(this.expandedCard);
        }
        
        const cardSide = card.dataset.side;
        
        // Shift spiral container based on card position
        // Reduce shift on mobile to prevent container going off-screen
        const isMobile = window.innerWidth < 768;
        const shiftAmount = isMobile ? 0 : 250;
        
        if (shiftAmount > 0) {
            if (cardSide === 'left') {
                this.container.style.transform = `translateX(${shiftAmount}px)`;
            } else {
                this.container.style.transform = `translateX(-${shiftAmount}px)`;
            }
        } else {
            this.container.style.transform = 'translateX(0)';
        }
        
        // Expand card
        card.classList.add('expanded');
        this.expandedCard = card;
        
        // Adjust card position when expanded to ensure it's visible
        const originalX = parseFloat(card.dataset.originalX);
        const originalY = parseFloat(card.dataset.originalY);
        
        // Position card horizontally
        if (cardSide === 'left') {
            // Left cards: position them more to the left when expanded
            card.style.left = `${originalX - 50}px`;
        } else {
            // Right cards stay in similar position
            card.style.left = `${originalX}px`;
        }
        
        // Prevent expanded card from overflowing into next section
        // Wait for card to expand to get accurate height
        setTimeout(() => {
            const containerRect = this.container.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const containerBottom = containerRect.bottom;
            const cardBottom = cardRect.bottom;
            
            // If card overflows container, shift it up
            if (cardBottom > containerBottom) {
                const overflow = cardBottom - containerBottom;
                const adjustedY = originalY - overflow - 20; // Extra 20px padding
                card.style.top = `${Math.max(10, adjustedY)}px`; // Don't go above 10px
            } else {
                card.style.top = `${originalY}px`;
            }
        }, 50);
        
        // Hide other cards temporarily
        document.querySelectorAll('.timeline-card').forEach(c => {
            if (c !== card) {
                c.style.opacity = '0.3';
                c.style.filter = 'blur(2px)';
            }
        });
    }
    
    collapseCard(card) {
        // Reset spiral position
        this.container.style.transform = 'translateX(0)';
        
        // Reset card position to original
        const originalX = parseFloat(card.dataset.originalX);
        const originalY = parseFloat(card.dataset.originalY);
        card.style.left = `${originalX}px`;
        card.style.top = `${originalY}px`;
        
        // Collapse card
        card.classList.remove('expanded');
        this.expandedCard = null;
        
        // Show all cards
        document.querySelectorAll('.timeline-card').forEach(c => {
            c.style.opacity = '1';
            c.style.filter = 'none';
        });
    }
    
    animateOnScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        const timelineCards = document.querySelectorAll('.timeline-card');
        timelineCards.forEach(card => {
            observer.observe(card);
        });
        
        // Subtle scroll-based effects for spiral (toned down)
        let ticking = false;
        
        const updateSpiralAnimation = () => {
            const experienceSection = document.getElementById('experience');
            if (!experienceSection) return;
            
            const rect = experienceSection.getBoundingClientRect();
            const scrollProgress = Math.max(0, Math.min(1, 
                (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
            ));
            
            // Very subtle rotation - just a gentle tilt
            const rotateY = scrollProgress * 15; // Only 15 degrees max
            const scale = 0.95 + (scrollProgress * 0.1); // 0.95 to 1.05
            
            // Apply gentle transformation
            this.svg.style.transform = `
                perspective(2000px) 
                rotateY(${rotateY}deg)
                scale(${scale})
            `;
            
            // Subtle brightness change
            const brightness = 0.9 + (scrollProgress * 0.2); // 0.9 to 1.1
            this.svg.style.filter = `brightness(${brightness})`;
            
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateSpiralAnimation);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Initial update
        updateSpiralAnimation();
    }
}

// Initialize timeline when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        new SpiralTimeline3D();
    }, 100);
});
