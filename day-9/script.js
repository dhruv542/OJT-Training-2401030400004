// Slider initialization after DOM is ready
function initSlider() {
    const container = document.querySelector('.b-image');
    if (!container) return null;

    const slides = Array.from(container.getElementsByClassName('mySlides'));
    let dots = Array.from(document.getElementsByClassName('dot'));
    let current = 0;
    let intervalId = null;

    function showSlide(index) {
        if (slides.length === 0) return;
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        // Fallback: ensure opacity is applied directly if CSS class isn't taking effect
        slides.forEach((s, i) => s.style.opacity = (i === index ? '1' : '0'));
        if (dots.length === slides.length) {
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }
    }

    function nextSlide() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    function prevSlide() {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    }

    function resetInterval() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(nextSlide, 1000); // change: auto-advance every 1 second
    }

    // Preload images and handle load/error
    slides.forEach(s => {
        const img = s.querySelector('img');
        if (img && !img.complete) {
            img.addEventListener('load', () => {}, { once: true });
            img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
        }
    });

    // Ensure a visible starting slide
    if (slides.length > 0) {
        console.log('Slider: found', slides.length, 'slides and', dots.length, 'dots');
        showSlide(0);
        resetInterval();
        // expose interval id for debugging
        window.__sliderInterval = intervalId;
    }

    // Arrow controls
    const left = container.querySelector('.d-left');
    const right = container.querySelector('.d-right');
    if (left) left.addEventListener('click', () => { prevSlide(); resetInterval(); });
    if (right) right.addEventListener('click', () => { nextSlide(); resetInterval(); });

    // Expose functions for inline `onclick` attributes compatibility
    window.plusSlides = function(n) {
        if (n > 0) nextSlide(); else prevSlide();
        resetInterval();
    };

    window.currentSlide = function(n) {
        if (!slides.length) return;
        current = (n - 1 + slides.length) % slides.length;
        showSlide(current);
        resetInterval();
    };

    // Dot controls. If dots not present, create them below the slider.
    if (dots.length) {
        dots.forEach((d, i) => d.addEventListener('click', () => { current = i; showSlide(current); resetInterval(); }));
    } else {
        const dotsWrapper = document.createElement('div');
        dotsWrapper.style.textAlign = 'center';
        dotsWrapper.style.marginTop = '10px';
        slides.forEach((_, i) => {
            const d = document.createElement('span');
            d.className = 'dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => { current = i; showSlide(current); resetInterval(); });
            dotsWrapper.appendChild(d);
        });
        container.insertAdjacentElement('afterend', dotsWrapper);
        dots = Array.from(dotsWrapper.getElementsByClassName('dot'));
    }

    // Pause on hover
    container.addEventListener('mouseenter', () => { if (intervalId) clearInterval(intervalId); });
    container.addEventListener('mouseleave', () => resetInterval());

    return { start: resetInterval, stop: () => clearInterval(intervalId) };
}

// Initialize immediately if DOM already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}

// Toggle table display on menu icon click
const menuIcon = document.getElementById('menu-icon');
if (menuIcon) {
    menuIcon.addEventListener('click', function() {
        const table = document.querySelector('.table');
        if (table) {
            if (table.style.display === 'none' || table.style.display === '') {
                table.style.display = 'block';
            } else {
                table.style.display = 'none';
            }
        }
    });
}

const addAddressButton = document.getElementById('addAddressButton');
const modal = document.getElementById('adressmodal');
const overlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModal');

function openModal() {
    if (modal && overlay) {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

function closeModal() {
    if (modal && overlay) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
}

if (addAddressButton) {
    addAddressButton.addEventListener('click', openModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
}

if (overlay) {
    overlay.addEventListener('click', closeModal);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
    }
});