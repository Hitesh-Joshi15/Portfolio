// ===================================
// DYNAMIC SKILLS DATA MANAGEMENT
// ===================================

const SKILLS_DATA = {
    // Work experience reference dates
    workExperience: {
        internStart: new Date('2022-11-01'),
        fullTimeStart: new Date('2023-07-01'),
        collegeStart: new Date('2018-07-01'),
        collegeEnd: new Date('2022-08-31')
    },

    // Skills organized by category
    languages: [
        { 
            name: 'Python', 
            startDate: new Date('2018-07-01'), 
            endDate: null, 
            active: true,
            breakPeriods: [{ start: new Date('2022-08-01'), end: new Date('2023-08-01') }],
            proficiency: 95,
            yearsExp: true
        },
        { 
            name: 'JavaScript', 
            startDate: new Date('2020-01-01'), 
            endDate: null, 
            active: true,
            proficiency: 92,
            yearsExp: true
        },
        { 
            name: 'HTML/CSS', 
            startDate: new Date('2019-07-01'), 
            endDate: null, 
            active: true,
            proficiency: 90,
            yearsExp: true
        },
        { 
            name: 'MUMPS', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 93,
            yearsExp: true,
            highlight: true // Very active daily
        },
        { 
            name: 'SQL', 
            startDate: new Date('2020-07-01'), 
            endDate: null, 
            active: true,
            occasional: true,
            proficiency: 70,
            yearsExp: false // Show proficiency instead
        },
        { 
            name: 'C', 
            startDate: new Date('2018-07-01'), 
            endDate: new Date('2023-02-28'), 
            active: false,
            proficiency: 75,
            yearsExp: true,
            past: true
        },
        { 
            name: 'C++', 
            startDate: new Date('2019-01-01'), 
            endDate: new Date('2023-02-28'), 
            active: false,
            proficiency: 72,
            yearsExp: true,
            past: true
        },
        { 
            name: 'Java', 
            startDate: new Date('2020-01-01'), 
            endDate: new Date('2023-07-31'), 
            active: false,
            proficiency: 70,
            yearsExp: true,
            past: true
        }
    ],

    backend: [
        { 
            name: 'Node.js', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 85,
            yearsExp: true
        },
        { 
            name: 'REST APIs', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 88,
            yearsExp: true
        },
        { 
            name: 'API Integration', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 87,
            yearsExp: true
        },
        { 
            name: 'JSON', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 90,
            yearsExp: true
        }
    ],

    ai: [
        { 
            name: 'MATCHA AI', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 82,
            yearsExp: true
        },
        { 
            name: 'LLM Integration', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 80,
            yearsExp: true
        },
        { 
            name: 'AI/ML (NumPy, Pandas)', 
            startDate: new Date('2025-03-01'), 
            endDate: null, 
            active: true,
            proficiency: 75,
            yearsExp: false,
            learning: true
        }
    ],

    tools: [
        { 
            name: 'Cache Database', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 92,
            yearsExp: true,
            highlight: true
        },
        { 
            name: 'Cache & IRIS Studio', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 91,
            yearsExp: true,
            highlight: true
        },
        { 
            name: 'Reflection', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 88,
            yearsExp: true
        },
        { 
            name: 'VS Code', 
            startDate: new Date('2018-07-01'), 
            endDate: null, 
            active: true,
            breakPeriods: [{ start: new Date('2020-08-01'), end: new Date('2022-11-01') }],
            proficiency: 90,
            yearsExp: true
        },
        { 
            name: 'PyCharm', 
            startDate: new Date('2018-07-01'), 
            endDate: new Date('2022-08-31'), 
            active: true,
            occasional: true,
            proficiency: 60,
            yearsExp: false
        },
        { 
            name: 'Jupyter Notebook', 
            startDate: new Date('2018-07-01'), 
            endDate: new Date('2022-08-31'), 
            active: true,
            occasional: true,
            proficiency: 60,
            yearsExp: false
        },
        { 
            name: 'Anaconda', 
            startDate: new Date('2018-07-01'), 
            endDate: new Date('2022-08-31'), 
            active: true,
            occasional: true,
            proficiency: 58,
            yearsExp: false
        },
        { 
            name: 'Git', 
            startDate: new Date('2018-07-01'), 
            endDate: null, 
            active: true,
            occasional: true,
            proficiency: 65,
            yearsExp: false
        },
        { 
            name: 'Unity', 
            startDate: new Date('2019-01-01'), 
            endDate: new Date('2023-07-31'), 
            active: false,
            proficiency: 68,
            yearsExp: true,
            past: true
        },
        { 
            name: 'Unreal Engine', 
            startDate: new Date('2019-01-01'), 
            endDate: new Date('2023-07-31'), 
            active: false,
            proficiency: 65,
            yearsExp: true,
            past: true
        },
        { 
            name: 'Wireshark', 
            startDate: new Date('2019-01-01'), 
            endDate: new Date('2020-12-31'), 
            active: false,
            proficiency: 55,
            yearsExp: true,
            past: true
        }
    ],

    concepts: [
        { 
            name: 'Data Structures & Algorithms', 
            startDate: new Date('2018-07-01'), 
            endDate: null, 
            active: true,
            proficiency: 92,
            yearsExp: true
        },
        { 
            name: 'OOP', 
            startDate: new Date('2018-07-01'), 
            endDate: null, 
            active: true,
            proficiency: 90,
            yearsExp: true
        },
        { 
            name: 'System Design', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 88,
            yearsExp: true
        },
        { 
            name: 'Data Visualization', 
            startDate: new Date('2019-07-01'), 
            endDate: null, 
            active: true,
            proficiency: 82,
            yearsExp: true
        }
    ],

    methodologies: [
        { 
            name: 'Agile (Kanban)', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 87,
            yearsExp: true
        },
        { 
            name: 'Scrum', 
            startDate: new Date('2022-11-01'), 
            endDate: null, 
            active: true,
            proficiency: 85,
            yearsExp: true
        }
    ],

    // Core competencies for radar chart
    coreCompetencies: [
        { name: 'System Design', proficiency: 88 },
        { name: 'Problem Solving', proficiency: 92 },
        { name: 'Team Leadership', proficiency: 87 },
        { name: 'Agile/Scrum', proficiency: 86 },
        { name: 'Code Quality', proficiency: 91 },
        { name: 'Security', proficiency: 84 }
    ]
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Calculate years of experience from start date to end date (or now)
 * Accounts for break periods
 */
function calculateYearsOfExperience(startDate, endDate = null, breakPeriods = []) {
    const end = endDate || new Date();
    let totalMs = end - startDate;
    
    // Subtract break periods
    if (breakPeriods && breakPeriods.length > 0) {
        breakPeriods.forEach(breakPeriod => {
            const breakStart = breakPeriod.start;
            const breakEnd = breakPeriod.end;
            totalMs -= (breakEnd - breakStart);
        });
    }
    
    const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(years * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total work experience from intern start date
 */
function calculateTotalWorkExperience() {
    const internStart = SKILLS_DATA.workExperience.internStart;
    const now = new Date();
    return calculateYearsOfExperience(internStart, now);
}

/**
 * Get all skills flattened into a single array
 */
function getAllSkills() {
    const allSkills = [];
    
    ['languages', 'backend', 'ai', 'tools', 'concepts', 'methodologies'].forEach(category => {
        SKILLS_DATA[category].forEach(skill => {
            allSkills.push({
                ...skill,
                category: category,
                experience: calculateYearsOfExperience(skill.startDate, skill.endDate, skill.breakPeriods || [])
            });
        });
    });
    
    return allSkills;
}

/**
 * Get skills for display with experience/proficiency
 */
function getSkillsForDisplay(category = null, activeOnly = false) {
    let skills = getAllSkills();
    
    if (category) {
        skills = skills.filter(s => s.category === category);
    }
    
    if (activeOnly) {
        skills = skills.filter(s => s.active);
    }
    
    return skills.map(skill => ({
        name: skill.name,
        value: skill.yearsExp ? skill.experience : skill.proficiency,
        displayType: skill.yearsExp ? 'years' : 'percentage',
        active: skill.active,
        past: skill.past || false,
        occasional: skill.occasional || false,
        learning: skill.learning || false,
        highlight: skill.highlight || false,
        category: skill.category
    }));
}

/**
 * Get top skills for bubbles/featured display
 */
function getTopSkills(count = 8) {
    const activeSkills = getAllSkills()
        .filter(s => s.active && !s.occasional)
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, count);
    
    return activeSkills.map(skill => ({
        name: skill.name,
        size: skill.proficiency,
        experience: skill.experience
    }));
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.SKILLS_DATA = SKILLS_DATA;
    window.calculateYearsOfExperience = calculateYearsOfExperience;
    window.calculateTotalWorkExperience = calculateTotalWorkExperience;
    window.getAllSkills = getAllSkills;
    window.getSkillsForDisplay = getSkillsForDisplay;
    window.getTopSkills = getTopSkills;
}
