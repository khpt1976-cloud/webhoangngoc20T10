/**
 * HoangNgoc Professional Theme v2.0
 * Performance Optimization JavaScript
 */

(function() {
    'use strict';

    // ===================================
    // Performance Configuration
    // ===================================
    
    const PERFORMANCE_CONFIG = {
        // Intersection Observer options
        intersectionOptions: {
            root: null,
            rootMargin: '50px',
            threshold: [0, 0.1, 0.5, 1.0]
        },
        
        // Lazy loading options
        lazyLoadOptions: {
            rootMargin: '200px',
            threshold: 0.01
        },
        
        // Debounce delays
        debounceDelays: {
            scroll: 16, // ~60fps
            resize: 100,
            input: 300
        },
        
        // Performance thresholds
        thresholds: {
            slowConnection: 1000, // ms
            fastConnection: 100,  // ms
            memoryLimit: 1000,    // MB
            batteryLow: 0.2       // 20%
        }
    };

    // ===================================
    // Performance Monitor
    // ===================================
    
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                pageLoadTime: 0,
                firstPaint: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                firstInputDelay: 0,
                cumulativeLayoutShift: 0,
                timeToInteractive: 0
            };
            
            this.observers = new Map();
            this.init();
        }

        init() {
            this.measureCoreWebVitals();
            this.monitorResourceLoading();
            this.trackUserInteractions();
            this.setupPerformanceObserver();
        }

        measureCoreWebVitals() {
            // Largest Contentful Paint (LCP)
            if ('PerformanceObserver' in window) {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                    console.log('LCP:', lastEntry.startTime);
                });
                
                try {
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    console.warn('LCP observer not supported');
                }

                // First Input Delay (FID)
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                        console.log('FID:', this.metrics.firstInputDelay);
                    });
                });
                
                try {
                    fidObserver.observe({ entryTypes: ['first-input'] });
                } catch (e) {
                    console.warn('FID observer not supported');
                }

                // Cumulative Layout Shift (CLS)
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.metrics.cumulativeLayoutShift = clsValue;
                    console.log('CLS:', clsValue);
                });
                
                try {
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                    console.warn('CLS observer not supported');
                }
            }

            // Navigation Timing API
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
                        this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
                        console.log('Page Load Time:', this.metrics.pageLoadTime);
                        console.log('Time to Interactive:', this.metrics.timeToInteractive);
                    }
                }, 0);
            });
        }

        monitorResourceLoading() {
            // Monitor resource loading performance
            const resourceObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > PERFORMANCE_CONFIG.thresholds.slowConnection) {
                        console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
                    }
                });
            });
            
            try {
                resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Resource observer not supported');
            }
        }

        trackUserInteractions() {
            // Track interaction performance
            let interactionCount = 0;
            const trackInteraction = this.debounce(() => {
                interactionCount++;
                if (interactionCount % 10 === 0) {
                    console.log(`User interactions: ${interactionCount}`);
                }
            }, 100);

            ['click', 'scroll', 'keydown'].forEach(eventType => {
                document.addEventListener(eventType, trackInteraction, { passive: true });
            });
        }

        setupPerformanceObserver() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        // Log long tasks
                        if (entry.entryType === 'longtask') {
                            console.warn(`Long task detected: ${entry.duration}ms`);
                        }
                    });
                });
                
                try {
                    observer.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                    console.warn('Long task observer not supported');
                }
            }
        }

        debounce(func, wait) {
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

        getMetrics() {
            return { ...this.metrics };
        }
    }

    // ===================================
    // Lazy Loading Manager
    // ===================================
    
    class LazyLoadManager {
        constructor() {
            this.imageObserver = null;
            this.contentObserver = null;
            this.init();
        }

        init() {
            this.setupImageLazyLoading();
            this.setupContentLazyLoading();
            this.setupIntersectionObserver();
        }

        setupImageLazyLoading() {
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            this.loadImage(img);
                            this.imageObserver.unobserve(img);
                        }
                    });
                }, PERFORMANCE_CONFIG.lazyLoadOptions);

                // Observe all lazy images
                document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                    this.imageObserver.observe(img);
                });
            }
        }

        setupContentLazyLoading() {
            if ('IntersectionObserver' in window) {
                this.contentObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            this.loadContent(element);
                            this.contentObserver.unobserve(element);
                        }
                    });
                }, PERFORMANCE_CONFIG.lazyLoadOptions);

                // Observe lazy content
                document.querySelectorAll('[data-lazy-content]').forEach(element => {
                    this.contentObserver.observe(element);
                });
            }
        }

        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, PERFORMANCE_CONFIG.intersectionOptions);

                // Observe elements for visibility animations
                document.querySelectorAll('.observe-visibility').forEach(element => {
                    observer.observe(element);
                });
            }
        }

        loadImage(img) {
            const src = img.dataset.src || img.src;
            const srcset = img.dataset.srcset;
            
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
            
            if (srcset) {
                img.srcset = srcset;
                img.removeAttribute('data-srcset');
            }
            
            img.classList.add('loaded');
            
            // Remove placeholder
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('img-placeholder')) {
                placeholder.remove();
            }
        }

        loadContent(element) {
            const contentUrl = element.dataset.lazyContent;
            if (contentUrl) {
                fetch(contentUrl)
                    .then(response => response.text())
                    .then(html => {
                        element.innerHTML = html;
                        element.classList.add('loaded');
                    })
                    .catch(error => {
                        console.error('Failed to load lazy content:', error);
                        element.innerHTML = '<p>Failed to load content</p>';
                    });
            }
        }
    }

    // ===================================
    // Resource Optimization
    // ===================================
    
    class ResourceOptimizer {
        constructor() {
            this.connectionType = this.getConnectionType();
            this.deviceMemory = this.getDeviceMemory();
            this.batteryLevel = null;
            this.init();
        }

        init() {
            this.getBatteryInfo();
            this.optimizeBasedOnConnection();
            this.optimizeBasedOnDevice();
            this.setupResourceHints();
        }

        getConnectionType() {
            if ('connection' in navigator) {
                return navigator.connection.effectiveType || 'unknown';
            }
            return 'unknown';
        }

        getDeviceMemory() {
            if ('deviceMemory' in navigator) {
                return navigator.deviceMemory;
            }
            return null;
        }

        async getBatteryInfo() {
            if ('getBattery' in navigator) {
                try {
                    const battery = await navigator.getBattery();
                    this.batteryLevel = battery.level;
                    
                    battery.addEventListener('levelchange', () => {
                        this.batteryLevel = battery.level;
                        this.optimizeBasedOnBattery();
                    });
                } catch (error) {
                    console.warn('Battery API not available');
                }
            }
        }

        optimizeBasedOnConnection() {
            const slowConnections = ['slow-2g', '2g', '3g'];
            
            if (slowConnections.includes(this.connectionType)) {
                // Reduce image quality
                document.querySelectorAll('img').forEach(img => {
                    if (img.dataset.lowQuality) {
                        img.src = img.dataset.lowQuality;
                    }
                });
                
                // Disable animations
                document.body.classList.add('reduce-animations');
                
                // Defer non-critical resources
                this.deferNonCriticalResources();
            }
        }

        optimizeBasedOnDevice() {
            if (this.deviceMemory && this.deviceMemory < 4) {
                // Low memory device optimizations
                document.body.classList.add('low-memory-device');
                
                // Reduce particle count
                const particleCount = Math.max(10, Math.floor(this.deviceMemory * 10));
                document.documentElement.style.setProperty('--particle-count', particleCount);
                
                // Disable complex animations
                document.querySelectorAll('.complex-animation').forEach(element => {
                    element.classList.add('animation-cleanup');
                });
            }
        }

        optimizeBasedOnBattery() {
            if (this.batteryLevel !== null && this.batteryLevel < PERFORMANCE_CONFIG.thresholds.batteryLow) {
                // Low battery optimizations
                document.body.classList.add('battery-saver');
                
                // Reduce animation frequency
                document.querySelectorAll('[data-animation]').forEach(element => {
                    element.style.animationIterationCount = '1';
                });
                
                // Disable particle background
                const particlesBg = document.querySelector('.particles-bg');
                if (particlesBg) {
                    particlesBg.style.display = 'none';
                }
            }
        }

        deferNonCriticalResources() {
            // Defer non-critical CSS
            const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
            nonCriticalCSS.forEach(link => {
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                };
            });
            
            // Defer non-critical JavaScript
            const nonCriticalJS = document.querySelectorAll('script[data-defer]');
            nonCriticalJS.forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = true;
                document.head.appendChild(newScript);
                script.remove();
            });
        }

        setupResourceHints() {
            // Add DNS prefetch for external domains
            const externalDomains = [
                'fonts.googleapis.com',
                'fonts.gstatic.com',
                'cdn.jsdelivr.net',
                'cdnjs.cloudflare.com'
            ];
            
            externalDomains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = `//${domain}`;
                document.head.appendChild(link);
            });
        }
    }

    // ===================================
    // Memory Management
    // ===================================
    
    class MemoryManager {
        constructor() {
            this.observers = new Map();
            this.timers = new Map();
            this.eventListeners = new Map();
            this.init();
        }

        init() {
            this.setupMemoryMonitoring();
            this.setupCleanupRoutines();
            this.handlePageVisibility();
        }

        setupMemoryMonitoring() {
            if ('memory' in performance) {
                setInterval(() => {
                    const memory = performance.memory;
                    const usedMB = memory.usedJSHeapSize / 1048576;
                    const totalMB = memory.totalJSHeapSize / 1048576;
                    
                    if (usedMB > PERFORMANCE_CONFIG.thresholds.memoryLimit) {
                        console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`);
                        this.performCleanup();
                    }
                }, 30000); // Check every 30 seconds
            }
        }

        setupCleanupRoutines() {
            // Clean up on page unload
            window.addEventListener('beforeunload', () => {
                this.performCleanup();
            });
            
            // Clean up on page hide
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.performCleanup();
                }
            });
        }

        handlePageVisibility() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Page is hidden, pause non-essential operations
                    this.pauseAnimations();
                    this.pauseTimers();
                } else {
                    // Page is visible, resume operations
                    this.resumeAnimations();
                    this.resumeTimers();
                }
            });
        }

        performCleanup() {
            // Clear observers
            this.observers.forEach(observer => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
            });
            this.observers.clear();
            
            // Clear timers
            this.timers.forEach(timer => {
                clearTimeout(timer);
                clearInterval(timer);
            });
            this.timers.clear();
            
            // Remove event listeners
            this.eventListeners.forEach((listener, element) => {
                if (element && typeof element.removeEventListener === 'function') {
                    element.removeEventListener(listener.event, listener.handler);
                }
            });
            this.eventListeners.clear();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
        }

        pauseAnimations() {
            document.querySelectorAll('[data-animation-playing]').forEach(element => {
                element.style.animationPlayState = 'paused';
            });
        }

        resumeAnimations() {
            document.querySelectorAll('[data-animation-playing]').forEach(element => {
                element.style.animationPlayState = 'running';
            });
        }

        pauseTimers() {
            // Implementation depends on specific timer usage
        }

        resumeTimers() {
            // Implementation depends on specific timer usage
        }

        addObserver(key, observer) {
            this.observers.set(key, observer);
        }

        addTimer(key, timer) {
            this.timers.set(key, timer);
        }

        addEventListener(element, event, handler) {
            this.eventListeners.set(element, { event, handler });
        }
    }

    // ===================================
    // Critical Resource Loader
    // ===================================
    
    class CriticalResourceLoader {
        constructor() {
            this.criticalResources = [];
            this.loadedResources = new Set();
            this.init();
        }

        init() {
            this.identifyCriticalResources();
            this.preloadCriticalResources();
            this.setupServiceWorker();
        }

        identifyCriticalResources() {
            // Identify above-the-fold images
            const viewportHeight = window.innerHeight;
            document.querySelectorAll('img').forEach(img => {
                const rect = img.getBoundingClientRect();
                if (rect.top < viewportHeight) {
                    this.criticalResources.push({
                        type: 'image',
                        url: img.src || img.dataset.src,
                        element: img
                    });
                }
            });
            
            // Identify critical CSS
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (!link.dataset.defer) {
                    this.criticalResources.push({
                        type: 'stylesheet',
                        url: link.href,
                        element: link
                    });
                }
            });
        }

        preloadCriticalResources() {
            this.criticalResources.forEach(resource => {
                if (!this.loadedResources.has(resource.url)) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    
                    if (resource.type === 'image') {
                        link.as = 'image';
                    } else if (resource.type === 'stylesheet') {
                        link.as = 'style';
                    }
                    
                    link.href = resource.url;
                    document.head.appendChild(link);
                    
                    this.loadedResources.add(resource.url);
                }
            });
        }

        setupServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            }
        }
    }

    // ===================================
    // Initialize Performance Optimization
    // ===================================
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize performance components
        const performanceMonitor = new PerformanceMonitor();
        const lazyLoadManager = new LazyLoadManager();
        const resourceOptimizer = new ResourceOptimizer();
        const memoryManager = new MemoryManager();
        const criticalResourceLoader = new CriticalResourceLoader();

        // Make performance tools globally available
        window.HoangNgocPerformance = {
            monitor: performanceMonitor,
            lazyLoad: lazyLoadManager,
            optimizer: resourceOptimizer,
            memory: memoryManager,
            loader: criticalResourceLoader,
            config: PERFORMANCE_CONFIG
        };

        // Log performance initialization
        console.log('HoangNgoc Performance Optimization initialized');
        
        // Report initial metrics after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const metrics = performanceMonitor.getMetrics();
                console.log('Performance Metrics:', metrics);
            }, 1000);
        });
    });

})();