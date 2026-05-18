let slideIndex = 1;
const slides = document.getElementsByClassName("mySlides");
const dots = document.getElementsByClassName("dot");

if (slides.length > 0 && dots.length > 0) {
    showslides(slideIndex);
    setInterval(() => plusSlides(1), 5000);
}

function plusSlides(n) {
    if (slides.length > 0 && dots.length > 0) {
        showslides(slideIndex += n);
    }
}

function currentSlide(n) {
    if (slides.length > 0 && dots.length > 0) {
        showslides(slideIndex = n);
    }
}

function showslides(n) {
    if (slides.length === 0 || dots.length === 0) return;
    let i;
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
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