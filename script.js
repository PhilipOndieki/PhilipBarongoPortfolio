// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize animations
    initAnimations();
    
    // Initialize form handling
    initContactForm();
    
    // Initialize CV download
    initCVDownload();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize hire me button and clickable image
    initHireMeButton();
    initClickableImage();

    // Initialize project hover video previews
    initProjectPreviews();

    // Mark page as loaded
    document.body.classList.add('loaded');
});

// Hire Me Button - Smooth Scroll to Contact
function initHireMeButton() {
    const hireMeBtn = document.querySelector('.hire-me-btn');
    if (hireMeBtn) {
        hireMeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Clickable Profile Image - Smooth Scroll to Contact
function initClickableImage() {
    const profileImage = document.querySelector('.clickable-image');
    if (profileImage) {
        profileImage.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Project Hover Video Previews - YouTube-style hover-to-play, mouse/trackpad only
function initProjectPreviews() {
    // Touch devices have no real "hover"; keep them on the static placeholder
    // rather than risk a synthetic-hover autoplay on tap.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const previewContainers = document.querySelectorAll('.project-image.has-preview');

    previewContainers.forEach(container => {
        const video = container.querySelector('.preview-video');
        if (!video) return;

        let loaded = false;

        container.addEventListener('mouseenter', function() {
            if (!loaded) {
                video.src = video.dataset.src;
                loaded = true;
            }
            video.currentTime = 0;
            video.play().catch(() => {
                // Autoplay can be blocked in some contexts; the static
                // placeholder simply stays visible if play() rejects.
            });
        });

        container.addEventListener('mouseleave', function() {
            video.pause();
            video.currentTime = 0;
        });
    });
}

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    
    // Apply initial theme
    setTheme(savedTheme);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// Navigation Management
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria-expanded for accessibility
        const isExpanded = navMenu.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Animation Management
const STAGGERED_REVEAL_SELECTOR = '.project-card, .timeline-item, .skills-category, .achievement-item, .interest-item';
const SOLO_REVEAL_SELECTOR = '.section-header, .about-text, .contact-content';
const STAGGER_STEP_MS = 100;

function initAnimations() {
    // Intersection Observer for scroll animations. Each element reveals itself
    // independently as it enters the viewport (no global timeout fallback that
    // would force-reveal off-screen content before the user scrolls to it).
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries, obs) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealElement(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(`${SOLO_REVEAL_SELECTOR}, ${STAGGERED_REVEAL_SELECTOR}`);
    animateElements.forEach(el => observer.observe(el));
}

function revealElement(el) {
    if (el.matches(STAGGERED_REVEAL_SELECTOR)) {
        // Stagger relative to the element's own siblings so, e.g., cards in the
        // third project grid don't inherit delay accumulated by earlier grids.
        const siblingIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--reveal-delay', `${siblingIndex * STAGGER_STEP_MS}ms`);
    }
    el.classList.add('animate-in');
}

// Contact Form Management
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Validate form
        let isValid = validateForm(formData);

        if (isValid) {
            submitForm(formData);
        }
    });
}

function validateForm(formData) {
    let isValid = true;

    // Name validation
    if (!formData.name) {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (formData.name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Email validation
    if (!formData.email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Message validation
    if (!formData.message) {
        showError('messageError', 'Message is required');
        isValid = false;
    } else if (formData.message.length < 10) {
        showError('messageError', 'Message must be at least 10 characters');
        isValid = false;
    }

    return isValid;
}

function submitForm(formData) {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Show success message
        showSuccessMessage('Thank you for your message! I\'ll get back to you soon.');
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            hideSuccessMessage();
        }, 5000);
    }, 2000);
}

// Form utility functions
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccessMessage(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
}

function hideSuccessMessage() {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.style.display = 'none';
    }
}

// CV Download Management
function initCVDownload() {
    const downloadBtn = document.getElementById('downloadCV');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', function() {
        const a = document.createElement('a');
        a.href = 'Philip_Ondieki_CV.docx';
        a.download = 'Philip_Ondieki_CV.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Show success feedback
        showDownloadFeedback(downloadBtn);
    });
}

function showDownloadFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
    button.style.background = '#27ae60';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
}

// Scroll Effects Management
function initScrollEffects() {
    let ticking = false;

    function updateScrollEffects() {
        updateNavbarBackground();
        updateParallaxEffect();
        ticking = false;
    }

    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestScrollUpdate);
}

function updateNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px var(--shadow)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}

function updateParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Only apply parallax on larger screens to avoid performance issues
    if (window.innerWidth > 768) {
        hero.style.transform = `translateY(${rate}px)`;
    }
}

// Keyboard Navigation Support
document.addEventListener('keydown', function(e) {
    // ESC key to close mobile menu
    if (e.key === 'Escape') {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }
    
    // Theme toggle with keyboard shortcut (Ctrl/Cmd + Shift + T)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        document.getElementById('themeToggle').click();
    }
});

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced scroll handler for better performance
const debouncedUpdateActiveNavLink = debounce(updateActiveNavLink, 10);
window.addEventListener('scroll', debouncedUpdateActiveNavLink);

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});