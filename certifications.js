// Certifications & Achievements Filter System
class CertificationFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.cert-filter-btn');
        this.certCards = document.querySelectorAll('.cert-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Animate cards on load
        this.animateCardsOnLoad();
        
        // Animate progress rings
        this.animateProgressRings();
    }

    handleFilter(e) {
        const targetCategory = e.currentTarget.dataset.category;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Filter cards
        this.certCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;
            
            if (targetCategory === 'all' || cardCategory === targetCategory) {
                card.classList.remove('hidden');
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, index * 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.classList.add('hidden');
                }, 300);
            }
        });
    }

    animateCardsOnLoad() {
        this.certCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    animateProgressRings() {
        const progressRings = document.querySelectorAll('.progress-ring-circle');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const circle = entry.target;
                    const progressText = circle.parentElement.nextElementSibling;
                    const textValue = (progressText?.textContent || '').trim();
                    let targetProgress = parseInt(textValue);

                    // Support non-numeric labels like "In Progress"
                    if (Number.isNaN(targetProgress)) {
                        const ringContainer = circle.closest('.cert-progress-ring');
                        if (ringContainer?.dataset?.progress) {
                            targetProgress = parseInt(ringContainer.dataset.progress);
                        }
                    }

                    if (Number.isNaN(targetProgress)) {
                        observer.unobserve(circle);
                        return;
                    }
                    
                    // Calculate stroke dashoffset for progress
                    const radius = 36;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (targetProgress / 100) * circumference;
                    
                    // Animate the progress ring
                    setTimeout(() => {
                        circle.style.strokeDashoffset = offset;
                    }, 100);
                    
                    observer.unobserve(circle);
                }
            });
        }, { threshold: 0.5 });

        progressRings.forEach(ring => {
            observer.observe(ring);
        });
    }
}

// Tech Stack Layer Interactions
class TechStackInteractions {
    constructor() {
        this.techLayers = document.querySelectorAll('.tech-layer');
        this.techItems = document.querySelectorAll('.tech-item');
        this.init();
    }

    init() {
        this.animateProficiencyBars();
        this.addItemInteractions();
        this.animateStatsOnScroll();
    }

    animateProficiencyBars() {
        const proficiencyBars = document.querySelectorAll('.proficiency-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    
                    // Reset and animate
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                    
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });

        proficiencyBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    addItemInteractions() {
        this.techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const experience = item.dataset.experience;
                // Could add a tooltip or additional info display here
            });
        });
    }

    animateStatsOnScroll() {
        const statNumbers = document.querySelectorAll('.tech-stats-summary .stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberElement = entry.target;
                    const targetValue = numberElement.textContent.replace('+', '');
                    const hasPlus = numberElement.textContent.includes('+');
                    
                    // Only animate if it's a number
                    if (!isNaN(parseInt(targetValue))) {
                        this.animateNumber(numberElement, parseInt(targetValue), hasPlus);
                    }
                    
                    observer.unobserve(numberElement);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(number => {
            observer.observe(number);
        });
    }

    animateNumber(element, target, hasPlus) {
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target + (hasPlus ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
            }
        }, 16);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if the elements exist
    if (document.querySelector('.cert-filter-btn')) {
        new CertificationFilter();
    }
    
    if (document.querySelector('.tech-layer')) {
        new TechStackInteractions();
    }
});

// Add smooth scroll behavior for section links
document.querySelectorAll('a[href^="#certifications"], a[href^="#techstack"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
