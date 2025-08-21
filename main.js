document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DYNAMIC HEADER ---
    const header = document.getElementById('main-header');
    if (header) {
        const isNotHomepage = !document.body.querySelector('.hero');
        if (isNotHomepage) header.classList.add('scrolled');
        else window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }

    // --- 2. HERO BACKGROUND SLIDER & PARALLAX ---
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const backgrounds = document.querySelectorAll('.hero-bg');
        const heroBgContainer = document.querySelector('.hero-backgrounds');
        
        // Background Image Slider
        if (backgrounds.length > 1) {
            let currentBgIndex = 0;
            setInterval(() => {
                backgrounds[currentBgIndex].classList.remove('active');
                currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
                backgrounds[currentBgIndex].classList.add('active');
            }, 5000);
        }

        // Parallax Effect
        if (heroBgContainer) {
            window.addEventListener('scroll', () => {
                const scrollValue = window.scrollY;
                heroBgContainer.style.transform = `translateY(${scrollValue * 0.4}px)`;
            });
        }
    }

    // --- 3. SCROLL REVEAL ANIMATIONS ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- 4. ANIMATED NUMBER COUNTERS ---
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let count = 0;
                const updateCount = () => {
                    const increment = target / 100;
                    if (count < target) {
                        count += increment;
                        counter.innerText = Math.ceil(count).toLocaleString();
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(counter => statsObserver.observe(counter));

    // --- 5. TESTIMONIAL SLIDER ---
    const slider = document.getElementById('testimonial-slider');
    if (slider) {
        const slides = slider.children;
        const prevBtn = document.getElementById('prev-testimonial');
        const nextBtn = document.getElementById('next-testimonial');
        let currentIndex = 0;
        const totalSlides = slides.length;
        const showSlide = (index) => slider.style.transform = `translateX(-${index * 100}%)`;
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            showSlide(currentIndex);
        });
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
        });
    }
    
    // --- 6. FAQ ACCORDION ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');
            
            faqItem.classList.toggle('active');
            answer.style.maxHeight = faqItem.classList.contains('active') ? answer.scrollHeight + 'px' : '0';
        });
    });

    // --- 7. ADVANCED MULTI-STEP BOOKING FORM ---
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const steps = Array.from(bookingForm.querySelectorAll('.form-step'));
        const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        let currentStep = 0;
        
        const updateFormSteps = () => {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            progressSteps.forEach((step, index) => step.classList.toggle('active', index <= currentStep));
            prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
            nextBtn.textContent = currentStep === steps.length - 1 ? 'Submit Booking' : 'Next';
        };

        const validateCurrentStep = () => {
            let isValid = true;
            steps[currentStep].querySelectorAll('[required]').forEach(input => {
                if (!validateField(input)) {
                     isValid = false;
                     input.parentElement.classList.add('invalid');
                }
            });
            return isValid;
        };

        nextBtn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    updateFormSteps();
                } else {
                    bookingForm.requestSubmit();
                }
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) { currentStep--; updateFormSteps(); }
        });
        
        const summaryFields = { service: 'service', date: 'date', name: 'name' };
        Object.keys(summaryFields).forEach(key => {
            const input = document.getElementById(summaryFields[key]);
            if(input) input.addEventListener('input', () => {
                document.getElementById(`summary-${key}`).textContent = input.value || `Not ${key === 'service' ? 'Selected' : 'Entered'}`;
            });
        });
    }

    // --- 8. REUSABLE FORM VALIDATION LOGIC ---
    const validateField = (field) => {
        let isValid = false;
        const parent = field.parentElement;
        if (field.type === 'email') isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        else if (field.type === 'date') {
            const selectedDate = new Date(field.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isValid = field.value !== '' && selectedDate >= today;
        } else isValid = field.value.trim() !== '';
        
        parent.classList.toggle('invalid', !isValid);

        // Add shake animation and remove after it ends
        if (!isValid) {
            parent.classList.add('shake');
            setTimeout(() => {
                parent.classList.remove('shake');
            }, 500);
        }
        return isValid;
    };
    
    const setupFormValidation = (formId) => {
        const form = document.getElementById(formId);
        if (!form) return;
        const successMessage = form.querySelector('#form-success-message');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let allValid = true;
            form.querySelectorAll('[required]').forEach(input => {
                if (!validateField(input)) allValid = false;
            });
            if(allValid) showSuccess(form, successMessage);
        });
    };
    
    const showSuccess = (form, successMessage) => {
        if (successMessage) {
            successMessage.style.display = 'block';
            setTimeout(() => { successMessage.style.display = 'none'; }, 5000);
        }
        form.reset();
        
        if(form.id === 'booking-form') {
            document.querySelectorAll('#summary-list span').forEach(span => {
                const id = span.id.split('-')[1];
                span.textContent = `Not ${id === 'service' ? 'Selected' : 'Entered'}`;
            });
            // Reset to first step
            let currentStep = 0;
            const steps = Array.from(form.querySelectorAll('.form-step'));
            const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            progressSteps.forEach((step, index) => step.classList.toggle('active', index <= currentStep));
            document.getElementById('next-btn').textContent = 'Next';
            document.getElementById('prev-btn').style.display = 'none';
        }
    };
    
    setupFormValidation('contact-form');
    if(bookingForm) bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Final validation before submitting
        let allValid = true;
        bookingForm.querySelectorAll('[required]').forEach(input => {
            if (!validateField(input)) allValid = false;
        });
        if (allValid) {
            showSuccess(e.target, e.target.querySelector('#form-success-message'));
        }
    });

    // --- 9. ADVANCED AI CHAT ASSISTANT ---
    const chatButton = document.getElementById('ai-chat-button');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeChatBtn = document.getElementById('close-chat-btn');
    
    if (chatButton && chatWindow && closeChatBtn) {
        const chatBody = chatWindow.querySelector('.chat-body');
        const chatInput = chatWindow.querySelector('.chat-footer input');
        const sendButton = chatWindow.querySelector('.chat-footer button');

        const toggleChatWindow = () => chatWindow.classList.toggle('open');
        const addMessage = (message, type) => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.innerHTML = `<p>${message}</p>`;
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        };

        const showTypingIndicator = () => {
            const typingIndicator = document.createElement('div');
            typingIndicator.id = 'typing-indicator';
            typingIndicator.className = 'message received';
            typingIndicator.innerHTML = `<p class="typing-indicator"><span></span><span></span><span></span></p>`;
            chatBody.appendChild(typingIndicator);
            chatBody.scrollTop = chatBody.scrollHeight;
        };

        const handleSendMessage = () => {
            const userMessage = chatInput.value.trim();
            if (userMessage === '') return;
            addMessage(userMessage, 'sent');
            chatInput.value = '';
            
            showTypingIndicator();

            setTimeout(() => {
                const typingIndicator = document.getElementById('typing-indicator');
                if (typingIndicator) chatBody.removeChild(typingIndicator);

                let botReply = "I'm sorry, I'm just a demo assistant. For real inquiries, please use the <a href='contact.html'>Contact Page</a>.";
                if (userMessage.toLowerCase().includes('booking')) botReply = "To make a booking, please visit our <a href='booking.html'>Booking Page</a>. It's quick and easy!";
                else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) botReply = "Hello there! How can I assist you today?";
                else if (userMessage.toLowerCase().includes('contact')) botReply = "You can find all our contact details on the <a href='contact.html'>Contact Page</a>.";
                
                addMessage(botReply, 'received');
            }, 1500);
        };

        chatButton.addEventListener('click', toggleChatWindow);
        closeChatBtn.addEventListener('click', toggleChatWindow);
        sendButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') handleSendMessage(); });
    }

    // --- 10. PREMIUM: CUSTOM CURSOR ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
            if (!document.body.classList.contains('cursor-visible')) {
                 document.body.classList.add('cursor-visible');
            }
        });

        document.body.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-visible');
        });

        document.querySelectorAll('a, button, .service-card, .team-member, .faq-question, [data-tilt], .step-item-interactive').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // --- 11. PREMIUM: MAGNETIC ELEMENTS ---
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const position = this.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            this.style.transition = 'transform 0.1s ease';
            this.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.3s ease';
            this.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- 12. ADVANCED LETTER ANIMATION ---
    const letterAnimationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.classList.contains('letters-animated')) {
                    const text = el.textContent;
                    el.innerHTML = text.split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
                    
                    el.querySelectorAll('span').forEach((span, i) => {
                        setTimeout(() => {
                            span.style.opacity = '1';
                            span.style.transform = 'translateY(0) rotate(0)';
                        }, i * 50);
                    });
                    el.classList.add('letters-animated');
                    observer.unobserve(el);
                }
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.animate-letters').forEach(el => letterAnimationObserver.observe(el));

    // --- 13. SCROLL TO TOP BUTTON ---
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 14. UPDATED: TYPEWRITER EFFECT ---
    const typewriterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.classList.contains('typed')) {
                    const text = el.getAttribute('data-text');
                    if (!text) return;

                    const speed = 100;
                    let i = 0;
                    el.innerHTML = '<span class="cursor">&nbsp;</span>';
                    const cursor = el.querySelector('.cursor');
                    
                    const type = () => {
                        if (i < text.length) {
                            cursor.insertAdjacentText('beforebegin', text.charAt(i));
                            i++;
                            setTimeout(type, speed);
                        } else {
                            setTimeout(() => { if (cursor) cursor.style.display = 'none'; }, 2000);
                        }
                    };
                    
                    type();
                    el.classList.add('typed');
                    observer.unobserve(el);
                }
            }
        });
    }, { threshold: 0.5 });

    // Setup for homepage typewriter
    const typewriterHeading = document.getElementById('typewriter-heading');
    if (typewriterHeading) {
        typewriterHeading.setAttribute('data-text', 'Welcome to BookEasy');
        typewriterObserver.observe(typewriterHeading);
    }
    
    // Setup for About page typewriter
    const typewriterAboutHeading = document.getElementById('typewriter-about-heading');
    if (typewriterAboutHeading) {
        typewriterAboutHeading.setAttribute('data-text', 'Our Story');
        typewriterObserver.observe(typewriterAboutHeading);
    }

    // --- 15. PREMIUM: 3D TILT EFFECT ---
    const initializeTiltEffect = () => {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        tiltElements.forEach(el => {
            const maxTilt = 15;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const width = el.offsetWidth;
                const height = el.offsetHeight;
                const rotateX = maxTilt * ((y / height) - 0.5);
                const rotateY = -maxTilt * ((x / width) - 0.5);

                el.style.transition = 'transform 0.1s linear';
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });
            el.addEventListener('mouseleave', () => {
                 el.style.transition = 'transform 0.5s ease';
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    };
    initializeTiltEffect();

    // --- 16. INTERACTIVE 'HOW IT WORKS' SECTION ---
    const stepsContainer = document.querySelector('.how-it-works-wrapper');
    if (stepsContainer) {
        const stepItems = stepsContainer.querySelectorAll('.step-item-interactive');
        const stepImages = stepsContainer.querySelectorAll('.step-image');
        const progressBar = stepsContainer.parentElement.querySelector('.steps-progress-bar');
        
        stepItems.forEach(item => {
            item.addEventListener('click', () => {
                const selectedStep = item.dataset.step;

                // Update active step item
                stepItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update active image
                stepImages.forEach(img => {
                    img.classList.toggle('active', img.dataset.step === selectedStep);
                });

                // Update progress bar
                let progress = 0;
                if (selectedStep == 1) progress = 0;
                else if (selectedStep == 2) progress = 50;
                else if (selectedStep == 3) progress = 100;
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            });
        });
    }
});