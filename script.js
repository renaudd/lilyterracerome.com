
// Language Translation Logic
function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('active');
}

function changeLang(code) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        const menu = document.getElementById('langMenu');
        if (menu) menu.classList.remove('active');

        // Persist selection
        localStorage.setItem('selectedLanguage', code);
        // Set Google Translate cookie (optional but helpful for cross-page)
        document.cookie = `googtrans=/en/${code}; path=/;`;
        if (code === 'en') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    } else {
        setTimeout(() => changeLang(code), 300);
    }
}

// Language Persistence & Cookie Consent initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== 'en') {
        changeLang(savedLang);
    }

    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookie-consent');
    if (!consent && banner) {
        banner.classList.add('visible');
    }
});

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    const banner = document.getElementById('cookie-consent');
    if (banner) banner.classList.remove('visible');
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    const banner = document.getElementById('cookie-consent');
    if (banner) banner.classList.remove('visible');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-translate')) {
        const menu = document.getElementById('langMenu');
        if (menu) menu.classList.remove('active');
    }
});

// Countdown Timer
const targetDate = new Date("May 1, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    if (dEl) dEl.innerText = days.toString().padStart(2, '0');
    if (hEl) hEl.innerText = hours.toString().padStart(2, '0');
    if (mEl) mEl.innerText = minutes.toString().padStart(2, '0');
    if (sEl) sEl.innerText = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(timerInterval);
        const timerContainer = document.getElementById("timer");
        if (timerContainer) timerContainer.innerHTML = "PROPERTY RELEASED";
    }
}

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Learn More Toggle
document.addEventListener('DOMContentLoaded', () => {
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    const infoPanel = document.getElementById('infoPanel');

    if (learnMoreBtn && infoPanel) {
        learnMoreBtn.addEventListener('click', () => {
            infoPanel.classList.toggle('visible');
            if (infoPanel.classList.contains('visible')) {
                learnMoreBtn.innerText = 'Close';
                setTimeout(() => {
                    infoPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } else {
                learnMoreBtn.innerText = 'Explore the Pad';
            }
        });
    }
});

// Nav Overlay Logic
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (menuToggle && navOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});

// Interactive Trivia Logic
function selectTriviaOption(btn, isCorrect, feedbackId) {
    const parentContainer = btn.closest('.trivia-container');
    const options = parentContainer.querySelectorAll('.trivia-option');
    const feedback = document.getElementById(feedbackId);
    const feedbackStatus = feedback.querySelector('.feedback-status');

    // Disable all options and highlight correct one
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        if (opt.getAttribute('data-correct') === 'true') {
            opt.classList.add('correct');
        } else {
            opt.classList.add('incorrect-reveal');
        }
    });

    // Highlight selected if incorrect
    if (!isCorrect) {
        btn.classList.add('incorrect-choice');
    }

    // Update feedback status text
    if (feedbackStatus) {
        feedbackStatus.innerText = isCorrect ? 'Correct!' : 'Not quite.';
        feedbackStatus.style.color = isCorrect ? '#0a141d' : '#888';
    }

    // Show feedback
    if (feedback) {
        feedback.style.display = 'block';
        setTimeout(() => {
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}
