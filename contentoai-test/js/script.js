// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            // Close all other FAQ items
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });

            if (!isActive) {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Waitlist Form Submission
    const waitlistForm = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('successMessage');

    if (waitlistForm && successMessage) {
        waitlistForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values (simple validation)
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const plan = document.getElementById('planInterest').value;

            if (!name || !email || !plan) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            // Disable button and show loading
            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            try {
                // Send to API
                const response = await fetch('/api/submit_waitlist.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nombre: name, email, plan })
                });

                const result = await response.json();

                if (response.ok) {
                    // Show success message
                    waitlistForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    waitlistForm.reset();
                } else {
                    // Show error
                    alert(result.error || 'Error al enviar el formulario. Por favor, intenta de nuevo.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión. Por favor, verifica tu conexión e intenta de nuevo.');
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Smooth scroll for anchor links (supplement to CSS smooth scroll)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add shadow to header on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });

    // Initialize FAQ heights for any already active (optional)
    document.querySelectorAll('.faq-question.active').forEach(activeQ => {
        const answer = activeQ.nextElementSibling;
        answer.style.maxHeight = answer.scrollHeight + 'px';
    });
});