// ============================================
// WHITE-LABEL CONFIGURATION SYSTEM
// ============================================

const DEFAULT_CONFIG = {
    name: "CPP Bridge",
    logo_type: "text",
    logo_text: "CPP Bridge",
    brand_color: "#4F46E5",
    brand_color_dark: "#6366F1",
    cta_text: "Book a Strategy Call",
    cta_url: "#contact"
};

let partnersConfig = null;
let currentPartner = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initWhiteLabel);

async function initWhiteLabel() {
    // Check URL for partner param
    const urlParams = new URLSearchParams(window.location.search);
    let partnerId = urlParams.get('partner');

    // If not in URL, check sessionStorage
    if (!partnerId) {
        partnerId = sessionStorage.getItem('partner_id');
    }

    // If found in URL, save to sessionStorage for persistence
    if (partnerId && urlParams.get('partner')) {
        sessionStorage.setItem('partner_id', partnerId);
    }

    // Load partner configs
    try {
        const response = await fetch('config/partners.json');
        if (response.ok) {
            partnersConfig = await response.json();
        } else {
            throw new Error('Failed to load partners.json');
        }
    } catch (e) {
        console.warn('Could not load partners.json, using defaults:', e.message);
        partnersConfig = { default: DEFAULT_CONFIG };
    }

    // Get config for current partner
    currentPartner = partnersConfig[partnerId] || partnersConfig['default'] || DEFAULT_CONFIG;

    // Apply branding
    applyBranding(currentPartner);
}

function applyBranding(config) {
    // Set CSS custom properties for colors
    document.documentElement.style.setProperty('--brand-color', config.brand_color);
    document.documentElement.style.setProperty('--brand-color-dark', config.brand_color_dark);

    // Update logo elements (multiple possible IDs across pages)
    const logoSelectors = ['#quiz-logo', '#report-logo', '.brand-logo', 'h1.brand-logo'];
    logoSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (config.logo_type === 'image' && config.logo_url) {
                el.innerHTML = `<img src="${config.logo_url}" alt="${config.name}" class="h-8">`;
            } else {
                el.textContent = config.logo_text || config.name;
            }
        });
    });

    // Update page title
    const currentTitle = document.title;
    if (currentTitle.includes('CPP Bridge') && config.name !== 'CPP Bridge') {
        document.title = currentTitle.replace('CPP Bridge', config.name);
    }

    // Update CTA buttons if on report page
    const ctaButton = document.getElementById('cta-button');
    if (ctaButton && config.cta_url) {
        ctaButton.textContent = config.cta_text + ' →';
        ctaButton.href = config.cta_url;
    }

    // Add partner class to body for CSS overrides
    const partnerId = sessionStorage.getItem('partner_id');
    if (partnerId) {
        document.body.classList.add(`partner-${partnerId}`);
    }

    // Apply brand color to gradient elements if needed
    applyBrandColors(config);
}

function applyBrandColors(config) {
    // This function can be extended to apply brand colors to specific elements
    // For now, we use CSS custom properties which can be used in inline styles or CSS

    // Example: Update header gradient on quiz page
    const quizHeader = document.querySelector('#quiz-container > div:first-child');
    if (quizHeader && config.brand_color) {
        // Only apply if not default indigo
        if (config.brand_color !== '#4F46E5') {
            quizHeader.style.background = `linear-gradient(to right, ${config.brand_color}, ${config.brand_color_dark || config.brand_color})`;
        }
    }
}

// Utility function to get current partner config (for use by other scripts)
function getPartnerConfig() {
    return currentPartner || DEFAULT_CONFIG;
}

// Utility function to get partner ID
function getPartnerId() {
    return sessionStorage.getItem('partner_id') || null;
}

// Utility to check if white-labeled
function isWhiteLabeled() {
    const partnerId = getPartnerId();
    return partnerId && partnerId !== 'default';
}
