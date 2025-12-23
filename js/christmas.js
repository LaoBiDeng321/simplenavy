document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const config = {
        snowflakeCount: 300, // Number of snowflakes
        minSize: 5,          // Min size in px
        maxSize: 10,          // Max size in px
        minSpeed: 0.5,       // Min vertical speed
        maxSpeed: 3,         // Max vertical speed
        dampingFactor: 0.3,  // Speed multiplier when over a tag (0.3 means 30% of original speed)
        interactionRadius: 120, // Mouse interaction radius
        interactionForce: 0.2, // Mouse repel force
        spawnInterval: 200   // Time between spawns if managing manually, but we might just keep a pool
    };

    const snowflakes = [];
    const dampingTagsSelector = 'h1, h2, h3, p, .card, .cta-button, .download-btn, li, img';
    let dampingElements = [];
    
    // Get header height for spawn position
    const header = document.querySelector('header');
    let headerHeight = header ? header.offsetHeight : 0;

    // Mouse position relative to document
    let mouseX = -1000;
    let mouseY = -1000;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    // Update damping elements cache and header height on resize
    function updateLayoutInfo() {
        dampingElements = Array.from(document.querySelectorAll(dampingTagsSelector)).map(el => {
            const rect = el.getBoundingClientRect();
            // Store coordinates relative to document
            return {
                el: el,
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                right: rect.right + window.scrollX
            };
        });
        headerHeight = header ? header.offsetHeight : 0;
    }

    // Initial update
    updateLayoutInfo();
    window.addEventListener('resize', updateLayoutInfo);
    // Also update periodically in case of dynamic content
    setInterval(updateLayoutInfo, 2000);

    // Create snow container
    const snowContainer = document.createElement('div');
    snowContainer.id = 'snow-container';
    snowContainer.style.position = 'absolute';
    snowContainer.style.top = '0';
    snowContainer.style.left = '0';
    snowContainer.style.width = '100%';
    snowContainer.style.height = '100%';
    snowContainer.style.pointerEvents = 'none';
    snowContainer.style.zIndex = '900';
    snowContainer.style.overflow = 'hidden';
    document.body.appendChild(snowContainer);

    class Snowflake {
        constructor() {
            this.element = document.createElement('div');
            this.element.classList.add('snowflake');
            snowContainer.appendChild(this.element);
            this.reset();
        }

        reset() {
            // Randomize properties
            this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
            this.baseSpeed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
            this.speed = this.baseSpeed;
            this.opacity = Math.random() * 0.5 + 0.3;
            
            // Position
            // Start below navbar
            this.y = headerHeight + Math.random() * 100; // Stagger start slightly
            // Random X within container
            this.x = Math.random() * (snowContainer.clientWidth - this.size);
            
            // Reset velocity
            this.vx = Math.random() * 0.4 - 0.2; // Slight natural drift
            this.vy = this.speed;

            // Apply styles
            this.element.style.width = `${this.size}px`;
            this.element.style.height = `${this.size}px`;
            this.element.style.opacity = this.opacity;
            this.updatePosition();
        }

        updatePosition() {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }

        update() {
            let currentSpeed = this.baseSpeed;
            
            // 1. Damping check
            // Check if center of snowflake is inside any damping element
            const cx = this.x + this.size / 2;
            const cy = this.y + this.size / 2;
            
            let isOverTag = false;
            // Optimization: check bounds before loop? Or just loop. 
            // For 100 snowflakes and ~50 tags, 5000 checks per frame is fine.
            for (const tag of dampingElements) {
                if (cy >= tag.top && cy <= tag.bottom && cx >= tag.left && cx <= tag.right) {
                    isOverTag = true;
                    break;
                }
            }

            if (isOverTag) {
                currentSpeed *= config.dampingFactor;
            }

            // 2. Mouse Interaction
            const dx = cx - mouseX;
            const dy = cy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.interactionRadius) {
                const force = (1 - dist / config.interactionRadius) * config.interactionForce;
                // Push away horizontally
                if (dx > 0) {
                    this.vx += force;
                } else {
                    this.vx -= force;
                }
            }

            // Apply drag to vx to return to normal
            if (Math.abs(this.vx) > 0.5) { // If pushed significantly
                 this.vx *= 0.95; // Decay horizontal velocity
            } else {
                 // Natural drift
                 if (Math.random() < 0.05) {
                     this.vx += (Math.random() - 0.5) * 0.1;
                 }
                 // Clamp natural drift
                 if (this.vx > 0.5) this.vx = 0.5;
                 if (this.vx < -0.5) this.vx = -0.5;
            }

            // Update Y
            this.y += currentSpeed;
            // Update X
            this.x += this.vx;

            // Boundary checks
            const docHeight = document.documentElement.scrollHeight;
            const docWidth = snowContainer.clientWidth;

            // If goes off bottom, reset to top
            if (this.y > docHeight - 50) { // -50 buffer
                this.reset();
                this.y = headerHeight; // Force to top
            }

            // If goes off sides, wrap around or bounce? Wrap is better for snow.
            if (this.x > docWidth) {
                this.x = 0;
            } else if (this.x < -this.size) {
                this.x = docWidth - this.size;
            }

            this.updatePosition();
        }
    }

    // Initialize snowflakes
    for (let i = 0; i < config.snowflakeCount; i++) {
        const snow = new Snowflake();
        // Scatter them initially so they don't all start at the top
        snow.y = headerHeight + Math.random() * (document.documentElement.scrollHeight - headerHeight);
        snowflakes.push(snow);
    }

    // Animation Loop
    function animate() {
        snowflakes.forEach(snow => snow.update());
        requestAnimationFrame(animate);
    }

    animate();
});
