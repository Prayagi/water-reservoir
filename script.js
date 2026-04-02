// Chart.js Color Configuration
const primaryBlue = '#0066cc';
const accentGreen = '#00a86b';
const warningOrange = '#f57c00';
const successGreen = '#388e3c';
const dangerRed = '#d32f2f';

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDemandChart();
    initStorageChart();
    initSectorChart();
    initEventListeners();
});

// 1. Water Demand Forecast Chart (Line Chart)
function initDemandChart() {
    const demandCtx = document.getElementById('demandChart');
    if (!demandCtx) return;
    
    new Chart(demandCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
            datasets: [
                {
                    label: 'Baseline Forecast',
                    data: [38.2, 39.1, 40.5, 41.8, 43.2, 44.1, 45.8, 47.2, 48.9, 50.3, 52.1],
                    borderColor: primaryBlue,
                    backgroundColor: 'rgba(0, 102, 204, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: primaryBlue,
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: primaryBlue,
                    pointHoverBorderWidth: 3,
                },
                {
                    label: 'Optimistic Scenario',
                    data: [38.2, 38.8, 39.6, 40.4, 41.3, 42.0, 42.8, 43.7, 44.6, 45.5, 46.5],
                    borderColor: successGreen,
                    backgroundColor: 'rgba(56, 142, 60, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: successGreen,
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    borderDash: [5, 5],
                },
                {
                    label: 'Pessimistic Scenario',
                    data: [38.2, 39.5, 41.5, 43.7, 45.9, 47.4, 49.2, 51.5, 54.1, 56.8, 59.6],
                    borderColor: dangerRed,
                    backgroundColor: 'rgba(211, 47, 47, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: dangerRed,
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    borderDash: [5, 5],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: '600' },
                        color: '#4a5568'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    borderColor: primaryBlue,
                    borderWidth: 1,
                    borderRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' BCM';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { font: { size: 11 }, color: '#718096' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    title: { display: true, text: 'Water Demand (BCM)', font: { size: 12, weight: 'bold' } }
                },
                x: {
                    ticks: { font: { size: 11 }, color: '#718096' },
                    grid: { display: false }
                }
            }
        }
    });
}

// 2. Storage vs Demand Bar Chart
function initStorageChart() {
    const storageCtx = document.getElementById('storageChart');
    if (!storageCtx) return;
    
    new Chart(storageCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['2022', '2023', '2024', '2025', '2026'],
            datasets: [
                {
                    label: 'Annual Demand (BCM)',
                    data: [40.5, 41.8, 43.2, 44.1, 45.8],
                    backgroundColor: 'rgba(0, 102, 204, 0.85)',
                    borderColor: primaryBlue,
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Available Storage (BCM)',
                    data: [45.2, 42.8, 41.5, 39.8, 38.2],
                    backgroundColor: 'rgba(0, 168, 107, 0.85)',
                    borderColor: accentGreen,
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'x',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: '600' },
                        color: '#4a5568'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' BCM';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 11 }, color: '#718096' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                },
                x: {
                    ticks: { font: { size: 11 }, color: '#718096' },
                    grid: { display: false }
                }
            }
        }
    });
}

// 3. Sector-wise Demand Pie Chart
function initSectorChart() {
    const sectorCtx = document.getElementById('sectorChart');
    if (!sectorCtx) return;
    
    new Chart(sectorCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Agriculture', 'Urban/Domestic', 'Industrial', 'Power Generation', 'Minimum Flow'],
            datasets: [{
                data: [52.3, 18.5, 12.1, 14.2, 2.9],
                backgroundColor: [
                    'rgba(0, 168, 107, 0.85)',
                    'rgba(0, 102, 204, 0.85)',
                    'rgba(255, 107, 53, 0.85)',
                    'rgba(247, 147, 30, 0.85)',
                    'rgba(160, 160, 160, 0.65)'
                ],
                borderColor: 'white',
                borderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, weight: '600' },
                        color: '#4a5568'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed.toFixed(1) + '% (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Event Listeners
function initEventListeners() {
    const runForecastBtn = document.querySelector('.btn');
    if (runForecastBtn) {
        runForecastBtn.addEventListener('click', handleForecastRun);
        runForecastBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        runForecastBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }

    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
        link.addEventListener('mouseover', function() {
            this.style.letterSpacing = '1px';
        });
        link.addEventListener('mouseout', function() {
            this.style.letterSpacing = '0';
        });
    });

    // Form inputs enhancement
    const formInputs = document.querySelectorAll('.form-group select, .form-group input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.01)';
        });
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
}

// Handle forecast run
function handleForecastRun() {
    const year = document.getElementById('targetYear')?.value || '2026';
    const scenario = document.getElementById('scenarioType')?.value || 'baseline';
    const region = document.getElementById('region')?.value || 'all';
    
    // Show feedback
    alert(`🚀 Running Forecast...\n\nYear: ${year}\nScenario: ${formatScenario(scenario)}\nRegion: ${formatRegion(region)}\n\n✓ Forecast simulation complete!`);
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    e.target.classList.add('active');
    
    // Get the target section
    const href = e.target.getAttribute('href');
    const targetSection = document.querySelector(href);
    
    if (targetSection) {
        // Scroll the main-content div to the target section
        const mainContent = document.querySelector('.main-content');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Utility functions
function formatScenario(value) {
    const scenarios = {
        'baseline': 'Baseline',
        'optimistic': 'Optimistic (Low Growth)',
        'pessimistic': 'Pessimistic (High Growth)',
        'climate': 'Climate Impact'
    };
    return scenarios[value] || value;
}

function formatRegion(value) {
    const regions = {
        'all': 'All Regions',
        'indore': 'Indore',
        'bhopal': 'Bhopal',
        'jabalpur': 'Jabalpur',
        'gwalior': 'Gwalior'
    };
    return regions[value] || value;
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#dashboard') {
            e.preventDefault();
        }
    });
});

