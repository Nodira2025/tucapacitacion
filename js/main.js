// WhatsApp Number configuration
const WA_NUMBER = "5493855140883";

/**
 * Generates a WhatsApp API link with a pre-filled message.
 * @param {string} message - The message to encode.
 * @returns {string} The full WhatsApp URL.
 */
function getWhatsAppLink(message) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Attaches event listeners to purchase buttons using event delegation.
 * Kept as empty function for backward compatibility with inline script calls.
 */
function setupCourseButtons() {
    // Intentionally left empty. Event delegation handles this now.
}

document.addEventListener('click', function (e) {
    const buyBtn = e.target.closest('.btn-buy-course');
    if (buyBtn) {
        e.preventDefault();
        const courseName = buyBtn.getAttribute('data-course');
        if (courseName) {
            const message = `Hola, quiero inscribirme en el curso de ${courseName}.`;
            window.open(getWhatsAppLink(message), '_blank');
        }
    }
});

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setupCourseButtons();

    // Set dynamic form action if contact form exists
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const area = document.getElementById('area') ? document.getElementById('area').value : '';
            const message = document.getElementById('message').value;

            const waMessage = `Hola, mi nombre es ${name}. Mi correo es ${email}.\n${area ? 'Me interesa el área: ' + area + '.\n' : ''}Consulta: ${message}`;
            window.open(getWhatsAppLink(waMessage), '_blank');
        });
    }

    // Job application form
    const jobForm = document.getElementById('jobForm');
    if (jobForm) {
        jobForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const role = document.getElementById('role').value;
            const message = document.getElementById('message').value;

            const waMessage = `Hola, mi nombre es ${name}. Quisiera postularme para el puesto de ${role}. ${message}`;
            window.open(getWhatsAppLink(waMessage), '_blank');
        });
    }

    // Navbar search auto-focus handling
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Scroll to search or course list
            document.getElementById('searchInput').scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Allow time for navigation and page setup
            setTimeout(() => {
                searchInput.value = q;
                // Dispatch input event to trigger autocomplete formatting
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.focus();
            }, 500);
        }
    }
});
