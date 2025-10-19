/**
 * HoangNgoc Professional Theme v2.0
 * Advanced Features JavaScript
 */

(function() {
    'use strict';

    // ===================================
    // Theme Management
    // ===================================
    
    class ThemeManager {
        constructor() {
            this.currentTheme = localStorage.getItem('hn-theme') || 'light';
            this.init();
        }

        init() {
            this.applyTheme(this.currentTheme);
            this.createThemeToggle();
            this.bindEvents();
        }

        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            this.currentTheme = theme;
            localStorage.setItem('hn-theme', theme);
            
            // Update theme toggle icon
            const toggleBtn = document.querySelector('.theme-toggle');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        }

        toggleTheme() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
            
            // Add transition effect
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }

        createThemeToggle() {
            if (document.querySelector('.theme-toggle')) return;

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'theme-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle theme');
            toggleBtn.setAttribute('title', 'Chuyển đổi chế độ sáng/tối');
            
            const icon = document.createElement('i');
            icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            toggleBtn.appendChild(icon);
            
            document.body.appendChild(toggleBtn);
        }

        bindEvents() {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.theme-toggle')) {
                    this.toggleTheme();
                }
            });

            // Listen for system theme changes
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQuery.addListener((e) => {
                    if (!localStorage.getItem('hn-theme')) {
                        this.applyTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        }
    }

    // ===================================
    // Scroll Animations
    // ===================================
    
    class ScrollAnimations {
        constructor() {
            this.elements = [];
            this.init();
        }

        init() {
            this.elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
            this.bindEvents();
            this.checkElements();
        }

        bindEvents() {
            window.addEventListener('scroll', this.throttle(this.checkElements.bind(this), 100));
            window.addEventListener('resize', this.throttle(this.checkElements.bind(this), 100));
        }

        checkElements() {
            this.elements.forEach(element => {
                if (this.isElementInViewport(element)) {
                    element.classList.add('revealed');
                }
            });
        }

        isElementInViewport(element) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            return rect.top <= windowHeight * 0.8 && rect.bottom >= 0;
        }

        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    }

    // ===================================
    // Particle Background
    // ===================================
    
    class ParticleBackground {
        constructor() {
            this.particles = [];
            this.particleCount = 50;
            this.init();
        }

        init() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            this.createContainer();
            this.createParticles();
            this.animate();
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.className = 'particles-bg';
            document.body.appendChild(this.container);
        }

        createParticles() {
            for (let i = 0; i < this.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random position
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                
                // Random animation delay
                particle.style.animationDelay = Math.random() * 6 + 's';
                
                this.container.appendChild(particle);
                this.particles.push(particle);
            }
        }

        animate() {
            // Additional animation logic can be added here
            // Currently using CSS animations
        }
    }

    // ===================================
    // Enhanced Interactions
    // ===================================
    
    class EnhancedInteractions {
        constructor() {
            this.init();
        }

        init() {
            this.initTooltips();
            this.initButtonEnhancements();
            this.initProgressBars();
            this.initLoadingStates();
            this.initHoverEffects();
        }

        initTooltips() {
            const tooltipElements = document.querySelectorAll('[data-tooltip]');
            tooltipElements.forEach(element => {
                element.classList.add('tooltip-enhanced');
            });
        }

        initButtonEnhancements() {
            const buttons = document.querySelectorAll('.btn-enhanced');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e, button);
                });
            });
        }

        createRippleEffect(event, element) {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        initProgressBars() {
            const progressBars = document.querySelectorAll('.progress-enhanced .progress-bar');
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('aria-valuenow') + '%';
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 100);
            });
        }

        initLoadingStates() {
            document.addEventListener('click', (e) => {
                const button = e.target.closest('[data-loading]');
                if (button) {
                    this.showLoadingState(button);
                }
            });
        }

        showLoadingState(element) {
            element.classList.add('loading');
            element.disabled = true;
            
            const originalText = element.textContent;
            element.setAttribute('data-original-text', originalText);
            element.textContent = 'Đang xử lý...';

            // Simulate loading (remove this in production)
            setTimeout(() => {
                this.hideLoadingState(element);
            }, 2000);
        }

        hideLoadingState(element) {
            element.classList.remove('loading');
            element.disabled = false;
            element.textContent = element.getAttribute('data-original-text') || 'Hoàn thành';
        }

        initHoverEffects() {
            // Add hover effects to cards
            const cards = document.querySelectorAll('.card:not(.no-hover)');
            cards.forEach(card => {
                if (!card.classList.contains('hover-lift')) {
                    card.classList.add('hover-lift');
                }
            });
        }
    }

    // ===================================
    // Performance Monitor
    // ===================================
    
    class PerformanceMonitor {
        constructor() {
            this.metrics = {};
            this.init();
        }

        init() {
            this.measurePageLoad();
            this.monitorScrollPerformance();
        }

        measurePageLoad() {
            window.addEventListener('load', () => {
                if (performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    this.metrics.pageLoadTime = loadTime;
                    console.log(`Page load time: ${loadTime}ms`);
                }
            });
        }

        monitorScrollPerformance() {
            let scrollCount = 0;
            let lastScrollTime = performance.now();

            window.addEventListener('scroll', () => {
                scrollCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastScrollTime > 1000) {
                    this.metrics.scrollFPS = scrollCount;
                    scrollCount = 0;
                    lastScrollTime = currentTime;
                }
            });
        }

        getMetrics() {
            return this.metrics;
        }
    }

    // ===================================
    // Accessibility Enhancements
    // ===================================
    
    class AccessibilityEnhancements {
        constructor() {
            this.init();
        }

        init() {
            this.addSkipLinks();
            this.enhanceFocusManagement();
            this.addAriaLabels();
            this.handleKeyboardNavigation();
        }

        addSkipLinks() {
            if (document.querySelector('.skip-link')) return;

            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link visually-hidden-focusable';
            skipLink.textContent = 'Bỏ qua đến nội dung chính';
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        enhanceFocusManagement() {
            // Add focus-visible class for better focus indicators
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('using-keyboard');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('using-keyboard');
            });
        }

        addAriaLabels() {
            // Add aria-labels to buttons without text
            const iconButtons = document.querySelectorAll('button:not([aria-label]) i.fa');
            iconButtons.forEach(icon => {
                const button = icon.closest('button');
                if (button && !button.getAttribute('aria-label')) {
                    button.setAttribute('aria-label', 'Button');
                }
            });
        }

        handleKeyboardNavigation() {
            // Enhanced keyboard navigation for dropdowns
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
                    openDropdowns.forEach(dropdown => {
                        const toggle = dropdown.previousElementSibling;
                        if (toggle) {
                            toggle.click();
                            toggle.focus();
                        }
                    });
                }
            });
        }
    }

    // ===================================
    // Utility Functions
    // ===================================
    
    const Utils = {
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction() {
                const context = this;
                const args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        isElementInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        smoothScrollTo: function(target, duration = 800) {
            const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
            if (!targetElement) return;

            const targetPosition = targetElement.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        }
    };

    // ===================================
    // CSS Animation Styles
    // ===================================
    
    const animationStyles = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .using-keyboard *:focus {
            outline: 2px solid var(--hn-primary);
            outline-offset: 2px;
        }
        
        .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--hn-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        }
        
        .skip-link:focus {
            top: 6px;
        }
    `;

    // Inject animation styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);

    // ===================================
    // Initialize Everything
    // ===================================
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize all components
        const themeManager = new ThemeManager();
        const scrollAnimations = new ScrollAnimations();
        const particleBackground = new ParticleBackground();
        const enhancedInteractions = new EnhancedInteractions();
        const performanceMonitor = new PerformanceMonitor();
        const accessibilityEnhancements = new AccessibilityEnhancements();

        // Make utilities globally available
        window.HoangNgocTheme = {
            ThemeManager: themeManager,
            Utils: Utils,
            PerformanceMonitor: performanceMonitor
        };

        // Add smooth scrolling to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    Utils.smoothScrollTo(target);
                }
            });
        });

        // Initialize back to top button
        const backToTopBtn = document.getElementById('btn-back-to-top');
        if (backToTopBtn) {
            window.addEventListener('scroll', Utils.throttle(() => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.style.display = 'block';
                } else {
                    backToTopBtn.style.display = 'none';
                }
            }, 100));

            backToTopBtn.addEventListener('click', () => {
                Utils.smoothScrollTo(document.body);
            });
        }

        console.log('HoangNgoc Professional Theme v2.0 - Advanced features loaded successfully!');
    });

})();