/**
 * HoangNgoc Professional Theme v2.0
 * Security & Accessibility JavaScript
 */

(function() {
    'use strict';

    // ===================================
    // Security Configuration
    // ===================================
    
    const SECURITY_CONFIG = {
        // Content Security Policy
        csp: {
            reportUri: '/csp-report',
            enforceHttps: true,
            allowInlineStyles: false,
            allowInlineScripts: false
        },
        
        // XSS Protection
        xss: {
            sanitizeUserInput: true,
            escapeHtml: true,
            validateUrls: true
        },
        
        // CSRF Protection
        csrf: {
            tokenName: '__RequestVerificationToken',
            headerName: 'X-CSRF-TOKEN',
            validateForms: true
        },
        
        // Input Validation
        validation: {
            maxInputLength: 1000,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
            maxFileSize: 10 * 1024 * 1024 // 10MB
        }
    };

    // ===================================
    // Accessibility Configuration
    // ===================================
    
    const A11Y_CONFIG = {
        // Focus management
        focus: {
            trapFocus: true,
            restoreFocus: true,
            skipLinks: true
        },
        
        // Screen reader
        screenReader: {
            announcements: true,
            liveRegions: true,
            ariaLabels: true
        },
        
        // Keyboard navigation
        keyboard: {
            escapeKey: true,
            tabNavigation: true,
            arrowKeys: true
        },
        
        // Color and contrast
        contrast: {
            checkContrast: true,
            highContrastMode: false,
            colorBlindSupport: true
        }
    };

    // ===================================
    // Security Manager
    // ===================================
    
    class SecurityManager {
        constructor() {
            this.csrfToken = null;
            this.trustedDomains = [];
            this.init();
        }

        init() {
            this.setupCSRFProtection();
            this.setupXSSProtection();
            this.setupContentSecurityPolicy();
            this.setupSecureHeaders();
            this.validateExternalLinks();
            this.sanitizeUserContent();
        }

        setupCSRFProtection() {
            // Get CSRF token from meta tag or form
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfInput = document.querySelector('input[name="__RequestVerificationToken"]');
            
            if (csrfMeta) {
                this.csrfToken = csrfMeta.getAttribute('content');
            } else if (csrfInput) {
                this.csrfToken = csrfInput.value;
            }

            // Add CSRF token to all AJAX requests
            if (this.csrfToken) {
                this.setupAjaxCSRF();
            }

            // Validate forms before submission
            document.addEventListener('submit', (e) => {
                if (SECURITY_CONFIG.csrf.validateForms) {
                    this.validateForm(e.target);
                }
            });
        }

        setupAjaxCSRF() {
            // Override fetch to include CSRF token
            const originalFetch = window.fetch;
            window.fetch = (url, options = {}) => {
                if (this.isLocalRequest(url)) {
                    options.headers = options.headers || {};
                    options.headers[SECURITY_CONFIG.csrf.headerName] = this.csrfToken;
                }
                return originalFetch(url, options);
            };

            // Override XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this._url = url;
                return originalOpen.call(this, method, url, ...args);
            };

            const originalSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function(data) {
                if (this._url && this.isLocalRequest(this._url)) {
                    this.setRequestHeader(SECURITY_CONFIG.csrf.headerName, this.csrfToken);
                }
                return originalSend.call(this, data);
            }.bind(this);
        }

        setupXSSProtection() {
            // Sanitize all user inputs
            document.addEventListener('input', (e) => {
                if (SECURITY_CONFIG.xss.sanitizeUserInput) {
                    this.sanitizeInput(e.target);
                }
            });

            // Validate URLs in href attributes
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (link && SECURITY_CONFIG.xss.validateUrls) {
                    if (!this.isValidUrl(link.href)) {
                        e.preventDefault();
                        console.warn('Blocked potentially malicious URL:', link.href);
                    }
                }
            });
        }

        setupContentSecurityPolicy() {
            // Monitor CSP violations
            document.addEventListener('securitypolicyviolation', (e) => {
                console.error('CSP Violation:', {
                    blockedURI: e.blockedURI,
                    violatedDirective: e.violatedDirective,
                    originalPolicy: e.originalPolicy
                });

                // Report to server if configured
                if (SECURITY_CONFIG.csp.reportUri) {
                    this.reportCSPViolation(e);
                }
            });

            // Enforce HTTPS if configured
            if (SECURITY_CONFIG.csp.enforceHttps && location.protocol !== 'https:') {
                if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    location.replace(location.href.replace('http:', 'https:'));
                }
            }
        }

        setupSecureHeaders() {
            // Check for security headers
            this.checkSecurityHeaders();
            
            // Prevent clickjacking
            if (window.top !== window.self) {
                console.warn('Page loaded in iframe - potential clickjacking attempt');
            }
        }

        validateExternalLinks() {
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (!this.isLocalRequest(link.href)) {
                    // Add security attributes
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('target', '_blank');
                    
                    // Add visual indicator
                    if (!link.querySelector('.external-indicator')) {
                        const indicator = document.createElement('span');
                        indicator.className = 'external-indicator sr-only';
                        indicator.textContent = ' (opens in new window)';
                        link.appendChild(indicator);
                    }
                }
            });
        }

        sanitizeUserContent() {
            document.querySelectorAll('.user-content').forEach(element => {
                this.sanitizeElement(element);
            });
        }

        // Utility methods
        isLocalRequest(url) {
            try {
                const urlObj = new URL(url, window.location.origin);
                return urlObj.origin === window.location.origin;
            } catch (e) {
                return false;
            }
        }

        isValidUrl(url) {
            try {
                const urlObj = new URL(url);
                const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
                return allowedProtocols.includes(urlObj.protocol);
            } catch (e) {
                return false;
            }
        }

        sanitizeInput(input) {
            if (input.value.length > SECURITY_CONFIG.validation.maxInputLength) {
                input.value = input.value.substring(0, SECURITY_CONFIG.validation.maxInputLength);
            }

            // Remove potentially dangerous characters
            input.value = input.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            input.value = input.value.replace(/javascript:/gi, '');
            input.value = input.value.replace(/on\w+\s*=/gi, '');
        }

        sanitizeElement(element) {
            // Remove script tags
            element.querySelectorAll('script').forEach(script => script.remove());
            
            // Remove event handlers
            element.querySelectorAll('*').forEach(el => {
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
        }

        validateForm(form) {
            // Check for CSRF token
            const csrfInput = form.querySelector(`input[name="${SECURITY_CONFIG.csrf.tokenName}"]`);
            if (!csrfInput && this.isLocalRequest(form.action)) {
                console.warn('Form missing CSRF token');
                return false;
            }

            // Validate file uploads
            const fileInputs = form.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                Array.from(input.files).forEach(file => {
                    if (!this.validateFile(file)) {
                        input.value = '';
                        alert('Invalid file type or size');
                    }
                });
            });

            return true;
        }

        validateFile(file) {
            // Check file size
            if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
                return false;
            }

            // Check file type
            const extension = file.name.split('.').pop().toLowerCase();
            return SECURITY_CONFIG.validation.allowedFileTypes.includes(extension);
        }

        reportCSPViolation(violation) {
            fetch(SECURITY_CONFIG.csp.reportUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'csp-report': {
                        'blocked-uri': violation.blockedURI,
                        'violated-directive': violation.violatedDirective,
                        'original-policy': violation.originalPolicy,
                        'document-uri': document.location.href,
                        'referrer': document.referrer,
                        'timestamp': new Date().toISOString()
                    }
                })
            }).catch(error => {
                console.error('Failed to report CSP violation:', error);
            });
        }

        checkSecurityHeaders() {
            // This would typically be done server-side, but we can check client-side too
            const requiredHeaders = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Strict-Transport-Security'
            ];

            // Note: Most security headers are not accessible via JavaScript
            // This is more for educational purposes
            console.log('Security headers should be configured server-side');
        }
    }

    // ===================================
    // Accessibility Manager
    // ===================================
    
    class AccessibilityManager {
        constructor() {
            this.focusStack = [];
            this.liveRegions = new Map();
            this.init();
        }

        init() {
            this.setupFocusManagement();
            this.setupKeyboardNavigation();
            this.setupScreenReaderSupport();
            this.setupSkipLinks();
            this.enhanceFormAccessibility();
            this.checkColorContrast();
            this.setupReducedMotion();
        }

        setupFocusManagement() {
            // Track focus for restoration
            document.addEventListener('focusin', (e) => {
                if (A11Y_CONFIG.focus.restoreFocus) {
                    this.focusStack.push(e.target);
                }
            });

            // Handle modal focus trapping
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const modal = document.querySelector('.modal.show');
                    if (modal && A11Y_CONFIG.focus.trapFocus) {
                        this.trapFocus(e, modal);
                    }
                }
            });

            // Restore focus when modals close
            document.addEventListener('hidden.bs.modal', () => {
                if (A11Y_CONFIG.focus.restoreFocus && this.focusStack.length > 0) {
                    const lastFocused = this.focusStack.pop();
                    if (lastFocused && typeof lastFocused.focus === 'function') {
                        lastFocused.focus();
                    }
                }
            });
        }

        setupKeyboardNavigation() {
            // Escape key handling
            if (A11Y_CONFIG.keyboard.escapeKey) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.handleEscapeKey(e);
                    }
                });
            }

            // Arrow key navigation for menus
            if (A11Y_CONFIG.keyboard.arrowKeys) {
                document.addEventListener('keydown', (e) => {
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        this.handleArrowKeys(e);
                    }
                });
            }

            // Tab navigation enhancement
            if (A11Y_CONFIG.keyboard.tabNavigation) {
                this.enhanceTabNavigation();
            }
        }

        setupScreenReaderSupport() {
            // Create live regions
            this.createLiveRegions();

            // Enhance ARIA labels
            if (A11Y_CONFIG.screenReader.ariaLabels) {
                this.enhanceAriaLabels();
            }

            // Setup announcements
            if (A11Y_CONFIG.screenReader.announcements) {
                this.setupAnnouncements();
            }
        }

        setupSkipLinks() {
            if (!A11Y_CONFIG.focus.skipLinks) return;

            // Create skip links if they don't exist
            if (!document.querySelector('.skip-link')) {
                this.createSkipLinks();
            }

            // Handle skip link activation
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('skip-link')) {
                    e.preventDefault();
                    const target = document.querySelector(e.target.getAttribute('href'));
                    if (target) {
                        target.focus();
                        target.scrollIntoView();
                    }
                }
            });
        }

        enhanceFormAccessibility() {
            // Add required indicators
            document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label && !label.classList.contains('required')) {
                    label.classList.add('required');
                    
                    // Add screen reader text
                    const srText = document.createElement('span');
                    srText.className = 'sr-only';
                    srText.textContent = ' (required)';
                    label.appendChild(srText);
                }
            });

            // Enhance error messages
            document.querySelectorAll('.invalid-feedback').forEach(feedback => {
                feedback.setAttribute('role', 'alert');
                feedback.setAttribute('aria-live', 'polite');
            });

            // Associate labels with inputs
            document.querySelectorAll('input, select, textarea').forEach(input => {
                if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (!label && input.id) {
                        console.warn(`Input with id "${input.id}" has no associated label`);
                    }
                }
            });
        }

        checkColorContrast() {
            if (!A11Y_CONFIG.contrast.checkContrast) return;

            // This is a simplified contrast checker
            // In production, you'd use a more sophisticated tool
            document.querySelectorAll('*').forEach(element => {
                const styles = window.getComputedStyle(element);
                const bgColor = styles.backgroundColor;
                const textColor = styles.color;
                
                if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
                    const contrast = this.calculateContrast(bgColor, textColor);
                    if (contrast < 4.5) {
                        console.warn(`Low contrast detected on element:`, element, `Contrast ratio: ${contrast.toFixed(2)}`);
                    }
                }
            });
        }

        setupReducedMotion() {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (prefersReducedMotion.matches) {
                document.body.classList.add('respect-motion');
            }

            // Listen for changes
            prefersReducedMotion.addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('respect-motion');
                } else {
                    document.body.classList.remove('respect-motion');
                }
            });
        }

        // Utility methods
        trapFocus(event, container) {
            const focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    event.preventDefault();
                }
            }
        }

        handleEscapeKey(event) {
            // Close modals
            const modal = document.querySelector('.modal.show');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
                return;
            }

            // Close dropdowns
            const dropdown = document.querySelector('.dropdown-menu.show');
            if (dropdown) {
                const dropdownInstance = bootstrap.Dropdown.getInstance(dropdown.previousElementSibling);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                }
                return;
            }
        }

        handleArrowKeys(event) {
            const target = event.target;
            
            // Handle dropdown menu navigation
            if (target.closest('.dropdown-menu')) {
                const menu = target.closest('.dropdown-menu');
                const items = menu.querySelectorAll('.dropdown-item:not(.disabled)');
                const currentIndex = Array.from(items).indexOf(target);
                
                let nextIndex;
                if (event.key === 'ArrowDown') {
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                } else if (event.key === 'ArrowUp') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                }
                
                if (nextIndex !== undefined) {
                    items[nextIndex].focus();
                    event.preventDefault();
                }
            }
        }

        enhanceTabNavigation() {
            // Add visible focus indicators for keyboard users
            let isUsingKeyboard = false;
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    isUsingKeyboard = true;
                    document.body.classList.add('using-keyboard');
                }
            });
            
            document.addEventListener('mousedown', () => {
                isUsingKeyboard = false;
                document.body.classList.remove('using-keyboard');
            });
        }

        createLiveRegions() {
            // Create polite live region
            const politeRegion = document.createElement('div');
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            politeRegion.className = 'aria-live-polite sr-only';
            document.body.appendChild(politeRegion);
            this.liveRegions.set('polite', politeRegion);

            // Create assertive live region
            const assertiveRegion = document.createElement('div');
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.className = 'aria-live-assertive sr-only';
            document.body.appendChild(assertiveRegion);
            this.liveRegions.set('assertive', assertiveRegion);
        }

        enhanceAriaLabels() {
            // Add aria-labels to buttons without text
            document.querySelectorAll('button:not([aria-label])').forEach(button => {
                const icon = button.querySelector('i[class*="fa-"]');
                if (icon && !button.textContent.trim()) {
                    const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
                    if (iconClass) {
                        const label = iconClass.replace('fa-', '').replace('-', ' ');
                        button.setAttribute('aria-label', label);
                    }
                }
            });

            // Enhance form controls
            document.querySelectorAll('input[type="search"]').forEach(input => {
                if (!input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', 'Search');
                }
            });
        }

        setupAnnouncements() {
            // Announce page changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const announcement = node.getAttribute('data-announce');
                                if (announcement) {
                                    this.announce(announcement);
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        createSkipLinks() {
            const skipLinks = [
                { href: '#main-content', text: 'Skip to main content' },
                { href: '#navigation', text: 'Skip to navigation' },
                { href: '#footer', text: 'Skip to footer' }
            ];

            const skipContainer = document.createElement('div');
            skipContainer.className = 'skip-links';

            skipLinks.forEach(link => {
                const skipLink = document.createElement('a');
                skipLink.href = link.href;
                skipLink.className = 'skip-link';
                skipLink.textContent = link.text;
                skipContainer.appendChild(skipLink);
            });

            document.body.insertBefore(skipContainer, document.body.firstChild);
        }

        announce(message, priority = 'polite') {
            const liveRegion = this.liveRegions.get(priority);
            if (liveRegion) {
                liveRegion.textContent = message;
                
                // Clear after announcement
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 1000);
            }
        }

        calculateContrast(color1, color2) {
            // Simplified contrast calculation
            // In production, use a proper color contrast library
            const rgb1 = this.parseRgb(color1);
            const rgb2 = this.parseRgb(color2);
            
            if (!rgb1 || !rgb2) return 21; // Assume good contrast if can't parse
            
            const l1 = this.getLuminance(rgb1);
            const l2 = this.getLuminance(rgb2);
            
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            
            return (lighter + 0.05) / (darker + 0.05);
        }

        parseRgb(color) {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
            }
            return null;
        }

        getLuminance([r, g, b]) {
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
    }

    // ===================================
    // Initialize Security & Accessibility
    // ===================================
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize security and accessibility
        const securityManager = new SecurityManager();
        const accessibilityManager = new AccessibilityManager();

        // Make managers globally available
        window.HoangNgocSecurity = {
            security: securityManager,
            accessibility: accessibilityManager,
            config: {
                security: SECURITY_CONFIG,
                accessibility: A11Y_CONFIG
            }
        };

        // Add no-js fallback class removal
        document.documentElement.classList.remove('no-js');

        console.log('HoangNgoc Security & Accessibility features loaded successfully!');
    });

})();