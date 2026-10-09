// WhatsApp Number configuration
const WA_NUMBER = "5493855140883";

/**
 * Generates a WhatsApp API link with a pre-filled message.
 */
function getWhatsAppLink(message) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Global Cart State
let shoppingCart = JSON.parse(localStorage.getItem('tuCapacitacionCart')) || [];

function saveCart() {
    localStorage.setItem('tuCapacitacionCart', JSON.stringify(shoppingCart));
    renderCart();
}

function showToast(courseName, count) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Auto-generate proper WA message for current cart
    const coursesList = shoppingCart.map(c => c.name).join(', ');
    const waMessage = `Hola, me interesan los cursos: ${coursesList}. ¿Podrías brindarme más info?`;

    const toastHtml = `
        <div class="toast show bg-white shadow-lg border-0 rounded-4" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white rounded-top-4 border-0">
                <i class="fas fa-check-circle me-2"></i>
                <strong class="me-auto">¡Agregado al carrito!</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body p-3">
                <p class="mb-3 text-dark">Se agregó <strong>${courseName}</strong> al carrito. Tienes ${count} ${count === 1 ? 'curso agregado' : 'cursos agregados'}.</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-success btn-sm w-100 fw-bold shadow-sm" onclick="window.open('${getWhatsAppLink(waMessage)}', '_blank')">
                        <i class="fab fa-whatsapp me-2"></i>Pagar
                    </button>
                    <button class="btn btn-outline-secondary btn-sm w-100 fw-bold" onclick="this.closest('.toast').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toasts = toastContainer.querySelectorAll('.toast');
    const newToast = toasts[toasts.length - 1];
    setTimeout(() => {
        if (newToast) newToast.remove();
    }, 5000);
}

function addToCart(course) {
    if (!shoppingCart.find(c => c.name === course.name)) {
        shoppingCart.push(course);
        saveCart();
    }
    showToast(course.name, shoppingCart.length);
}

function removeFromCart(courseName) {
    shoppingCart = shoppingCart.filter(c => c.name !== courseName);
    saveCart();
}

// Attach removeFromCart to window scope because it is called via inline HTML onClick
window.removeFromCart = removeFromCart;

function renderCart() {
    const counts = document.querySelectorAll('.cart-count');
    const listContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-checkout');

    counts.forEach(badge => {
        badge.textContent = shoppingCart.length;
        if (shoppingCart.length > 0) {
            badge.classList.remove('bg-secondary');
            badge.classList.add('bg-danger');
        } else {
            badge.classList.remove('bg-danger');
            badge.classList.add('bg-secondary');
        }
    });

    if (listContainer) {
        listContainer.innerHTML = '';
        if (shoppingCart.length === 0) {
            listContainer.innerHTML = '<div class="text-center p-3 text-muted small">Tu carrito está vacío</div>';
            if (totalContainer) totalContainer.textContent = '$0';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        shoppingCart.forEach(course => {
            total += course.price;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'd-flex justify-content-between align-items-center small border-bottom pb-2 mb-2';
            itemDiv.innerHTML = `
                <div class="d-flex flex-column text-start w-100 pe-2">
                    <span class="fw-bold text-dark text-truncate" style="max-width: 200px;">${course.name}</span>
                    <span class="text-primary fw-bold">$${course.price.toLocaleString('es-AR')}</span>
                </div>
                <button class="btn text-danger btn-sm p-0 m-0 border-0" onclick="removeFromCart('${course.name.replace(/'/g, "\\'")}')" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            listContainer.appendChild(itemDiv);
        });

        if (totalContainer) totalContainer.textContent = '$' + total.toLocaleString('es-AR');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
}

document.addEventListener('click', function (e) {
    const addCartBtn = e.target.closest('.btn-add-cart');
    if (addCartBtn) {
        e.preventDefault();
        const courseData = JSON.parse(addCartBtn.getAttribute('data-course-json'));
        if (courseData) addToCart(courseData);
    }

    const buyBtn = e.target.closest('.btn-buy-course');
    if (buyBtn) {
        e.preventDefault();
        const courseName = buyBtn.getAttribute('data-course-name');
        if (courseName) {
            const message = `Hola, quiero inscribirme o más info del curso ${courseName}.`;
            window.open(getWhatsAppLink(message), '_blank');
        }
    }

    const studyPlanBtn = e.target.closest('.btn-study-plan');
    if (studyPlanBtn) {
        e.preventDefault();
        e.stopPropagation();
        const courseName = studyPlanBtn.getAttribute('data-course-name');
        const message = `Hola, solicito el programa de estudios del curso ${courseName}.`;
        window.open(getWhatsAppLink(message), '_blank');
    }

    const scheduleBtn = e.target.closest('.btn-schedule');
    if (scheduleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const courseName = scheduleBtn.getAttribute('data-course-name');
        const message = `Hola, ¿me podrías decir qué horarios hay para el curso ${courseName}?`;
        window.open(getWhatsAppLink(message), '_blank');
    }

    const floatToggle = e.target.closest('#socialFloatToggle');
    if (floatToggle) {
        e.preventDefault();
        const container = floatToggle.closest('.social-float-container');
        container.classList.toggle('active');
        const icon = floatToggle.querySelector('i');
        if (container.classList.contains('active')) {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-plus');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', function (e) {
            const checkoutBtn = e.target.closest('#btn-checkout');
            if (checkoutBtn && !checkoutBtn.disabled) {
                e.preventDefault();
                if (shoppingCart.length > 0) {
                    const coursesList = shoppingCart.map(c => c.name).join(', ');
                    const waMessage = `Hola, deseo abonar o solicitar mas info de los cursos: ${coursesList}`;
                    window.open(getWhatsAppLink(waMessage), '_blank');
                } else {
                    alert('¡El carrito está vacío!');
                }
                return;
            }
            e.stopPropagation();
        });
    });

    // Dynamic Navbar
    window.addEventListener('scroll', function () {
        const nav = document.querySelector('.navbar-custom');
        if (nav && window.scrollY > 50) {
            nav.classList.add('navbar-scrolled');
        } else if (nav) {
            nav.classList.remove('navbar-scrolled');
        }
    });

    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }

    // GSAP Animations (Premium effects on desktop/all devices)
    if (typeof gsap !== 'undefined') {
        // Register ScrollTrigger if loaded
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Clean AOS attributes on elements we want to animate with GSAP instead
        gsap.set(".hero-section [data-aos], .courses-section [data-aos]", { clearProps: "all" });

        // Hero Entrance Timeline
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

        heroTl.from(".hero-badge", { opacity: 0, y: -30, duration: 1.2 })
              .from(".hero-title", { opacity: 0, y: 40, duration: 1.4, skewY: 2 }, "-=0.9")
              .from(".hero-subtitle", { opacity: 0, y: 30, duration: 1.2 }, "-=1.0")
              .from(".hero-benefit-item", { opacity: 0, y: 20, stagger: 0.12, duration: 0.8 }, "-=0.8")
              .from(".hero-actions", { opacity: 0, y: 25, duration: 1 }, "-=0.7")
              .from(".hero-image-wrapper", { opacity: 0, scale: 0.96, duration: 1.6 }, "-=1.3")
              .from(".hero-stats-panel", { opacity: 0, y: 50, duration: 1.2 }, "-=1.0")
              .from(".hero-stats-panel .stat-item", { opacity: 0, scale: 0.85, stagger: 0.1, duration: 0.8 }, "-=0.6");

        // Course Cards Staggered Scroll Animation
        if (document.querySelectorAll('.course-card-premium').length > 0) {
            gsap.from(".course-card-premium", {
                scrollTrigger: {
                    trigger: ".courses-section",
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 60,
                stagger: 0.18,
                duration: 1.4,
                ease: "power3.out"
            });
        }
    }

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

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            document.getElementById('searchInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                searchInput.value = q;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.focus();
            }, 500);
        }
    }
});
