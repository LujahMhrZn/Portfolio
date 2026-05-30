// ============================================
// EMAILJS CONFIGURATION
// REPLACE THESE WITH YOUR ACTUAL CREDENTIALS:
// ============================================
const EMAILJS_PUBLIC_KEY = "rPTdbflSK6KWUd0T-";     //EmailJS Dashboard → Account → API Keys
const EMAILJS_SERVICE_ID = "service_l6afrkg";          // Your service ID from screenshot
const EMAILJS_TEMPLATE_ID = "template_isl0ta8";   // template ID in EmailJS

// ============================================
// RETRO SOUND ENGINE (Web Audio)
// ============================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioUnlocked = false;

function playRetroBeep(type = 'click') {
    if (!audioUnlocked) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    if (type === 'click') {
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start();
        osc.stop(now + 0.15);
    } else if (type === 'scroll') {
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.start();
        osc.stop(now + 0.08);
    }
}

function unlockAudio() {
    if (audioUnlocked) return;
    audioCtx.resume().then(() => {
        audioUnlocked = true;
        playRetroBeep('click');
    }).catch(e => console.log);
}

// Unlock audio on first user interaction
document.body.addEventListener('click', unlockAudio, { once: true });

// Attach click sounds to all clickable elements
function attachSoundToClicks() {
    const clickables = document.querySelectorAll('[data-sound="click"], .btn-retro, .nav-links a, .gallery-card, button');
    clickables.forEach(el => {
        el.addEventListener('click', (e) => { if(audioUnlocked) playRetroBeep('click'); });
    });
}

// Scroll sound with throttling
let lastScrollTime = 0;
function onScrollWithSound() {
    if (!audioUnlocked) return;
    const now = Date.now();
    if (now - lastScrollTime > 180) {
        lastScrollTime = now;
        playRetroBeep('scroll');
    }
}
window.addEventListener('scroll', onScrollWithSound);

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToastMessage(message) {
    const existingToast = document.querySelector('.toast-msg');
    if(existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ============================================
// LIGHTBOX / FULL IMAGE GALLERY
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(imgSrc, title, description) {
    lightboxImg.src = imgSrc;
    lightboxCaption.innerHTML = `<strong>${title}</strong> — ${description}`;
    lightbox.classList.add('active');
    if(audioUnlocked) playRetroBeep('click');
}

function closeLightbox() { 
    lightbox.classList.remove('active'); 
}

lightbox.addEventListener('click', closeLightbox);

// Initialize gallery click events
const galleryCards = document.querySelectorAll('.gallery-card');
galleryCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = card.getAttribute('data-img-src');
        const title = card.getAttribute('data-img-title');
        const desc = card.getAttribute('data-img-desc');
        if (imgSrc) openLightbox(imgSrc, title, desc);
    });
});

// ============================================
// EMAILJS CONTACT FORM
// ============================================
// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const contactForm = document.getElementById('retroContactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMsg').value.trim();
    
    // Validation
    if(!name || !email || !message) {
        showToastMessage("⚠️ ERROR: All fields required. TRANSMISSION FAILED.");
        if(audioUnlocked) playRetroBeep('click');
        return;
    }
    
    if(!email.includes('@') || !email.includes('.')) {
        showToastMessage("⚠️ INVALID EMAIL. Check SENDER credentials.");
        if(audioUnlocked) playRetroBeep('click');
        return;
    }
    
    // Play click sound
    if(audioUnlocked) playRetroBeep('click');
    
    // Show sending indicator
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'SENDING...';
    submitBtn.disabled = true;
    
    // Prepare template parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        to_email: 'lujahmhrzn@gmail.com',
        reply_to: email
    };
    
    // Send email via EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            showToastMessage(`✔️ MESSAGE TRANSMITTED! I'll reply to ${email}`);
            contactForm.reset();
            if(audioUnlocked) playRetroBeep('click');
            console.log('EmailJS Success:', response);
        })
        .catch(function(error) {
            showToastMessage(`⚠️ TRANSMISSION FAILED: ${error.text || 'Check EmailJS config'}`);
            console.error('EmailJS Error:', error);
        })
        .finally(function() {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
});

// ============================================
// SMOOTH SCROLLING FOR NAVIGATION LINKS
// ============================================
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElem = document.getElementById(targetId);
        if(targetElem) {
            targetElem.scrollIntoView({ behavior: 'smooth' });
            if(audioUnlocked) playRetroBeep('click');
        }
    });
});

// Hero button smooth scroll
const initBtn = document.querySelector('.hero-left .btn-retro');
if(initBtn) {
    initBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
}

// ============================================
// INITIALIZE SOUNDS ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    attachSoundToClicks();
    
    // Also attach to any dynamically created buttons
    const allButtons = document.querySelectorAll('button, .btn-retro, a');
    allButtons.forEach(btn => {
        btn.addEventListener('click', () => { 
            if(audioUnlocked) playRetroBeep('click'); 
        });
    });
    
    console.log('Portfolio Ready | EmailJS Configured | Retro Sounds Active');
    console.log('⚠️ Remember to replace YOUR_PUBLIC_KEY_HERE and YOUR_TEMPLATE_ID_HERE in script.js');
});

// ============================================
// ADDITIONAL AUDIO UNLOCK HANDLERS
// ============================================
window.addEventListener('touchstart', unlockAudio);
window.addEventListener('keydown', unlockAudio);