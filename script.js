document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Generate Car Cards Dynamically
    const grid = document.getElementById('inventory-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const sysLog = document.getElementById('sys-log');
    
    function loadCards(count) {
        let newContent = '';
        for(let i = 0; i < count; i++) {
            newContent += `
                <article class="vertical-card">
                    <div class="card-img-wrapper">
                        <div class="card-badge">nieuw</div>
                        <img src="assets/audi.png" alt="Audi A6" class="card-img">
                        <div class="card-magnifier">⌕</div>
                    </div>
                    <div class="card-info">
                        <h3 class="card-title">Audi A6 avant</h3>
                        <div class="card-subtitle">3.0 TDI BiT quattro 326 PK!</div>
                        <div class="card-price">€ 14.950</div>
                        <div class="card-footer">
                            <div class="stat-item">
                                <span class="stat-icon">📅</span>
                                <span>2017</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">⛽</span>
                                <span>diesel</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">⏱️</span>
                                <span>201.046</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }
        grid.insertAdjacentHTML('beforeend', newContent);
    }
    
    // Initial load of 16 cards
    loadCards(16);
    
    // Load more hook
    loadMoreBtn.addEventListener('click', () => {
        const originalText = loadMoreBtn.innerText;
        loadMoreBtn.innerText = "AUTHENTICATING CONNECTION...";
        loadMoreBtn.classList.remove('btn-blue');
        loadMoreBtn.classList.add('btn-pink');
        sysLog.innerText = "PULLING MORE SALVAGE DATA...";
        
        setTimeout(() => {
            loadCards(8);
            loadMoreBtn.innerText = originalText;
            loadMoreBtn.classList.remove('btn-pink');
            loadMoreBtn.classList.add('btn-blue');
            sysLog.innerText = "SALVAGE INVENTORY UPDATED.";
        }, 800);
    });

    // 2. Animate Gauges
    const gauges = document.querySelectorAll('.gauge-fill');
    
    setTimeout(() => {
        gauges.forEach(gauge => {
            const targetOffset = gauge.getAttribute('data-target');
            gauge.style.strokeDashoffset = targetOffset;
        });
        
        // Count up numbers
        const values = document.querySelectorAll('.gauge-value');
        values.forEach(val => {
            const target = parseInt(val.getAttribute('data-value'), 10);
            const prefix = val.getAttribute('data-prefix') || '';
            const suffix = val.getAttribute('data-suffix') || '';
            let current = 0;
            const inc = target / 50; 
            
            const timer = setInterval(() => {
                current += inc;
                if(current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                val.innerText = prefix + Math.floor(current) + suffix;
            }, 30);
        });
    }, 500); // slight delay on load

    // 3. Animate the vertical scale bars mimicking active network/data
    const scaleBars = document.querySelectorAll('.scale-bar');
    
    setInterval(() => {
        scaleBars.forEach(bar => {
            if(Math.random() > 0.5) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }, 300);

    // 4. Running text log
    // sysLog is declared at the top
    const logMessages = [
        "RETRIEVING VIN DATA... OK",
        "SYNCING PRICING ALGORITHMS... STANDBY",
        "SALVAGE FEED UPDATING...",
        "DECRYPTING AUCTION RECORDS... DONE",
        "SCANNING DAMAGE VECTORS..."
    ];
    let logIndex = 0;
    
    setInterval(() => {
        sysLog.innerText = logMessages[logIndex];
        logIndex = (logIndex + 1) % logMessages.length;
        
        // Add random typing glitch effect
        sysLog.style.opacity = Math.random() > 0.8 ? "0.3" : "0.8";
    }, 2500);

    // 5. Dropdown Interactivity
    const dropdowns = document.querySelectorAll('.cyber-dropdown');
    
    dropdowns.forEach(dropdown => {
        const header = dropdown.querySelector('.dropdown-header');
        const items = dropdown.querySelectorAll('.dropdown-item');
        const selectedValue = dropdown.querySelector('.selected-value');
        
        // Toggle dropdown
        header.addEventListener('click', () => {
            // Close other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        });
        
        // Handle selection
        items.forEach(item => {
            item.addEventListener('click', () => {
                let type = dropdown.id === 'brand-dropdown' ? 'BRAND' : 'DAMAGE';
                let valueText = item.innerText;
                if (valueText.indexOf('(') !== -1) {
                    valueText = valueText.split(' (')[0]; // Extract only the English part for the header
                }
                selectedValue.innerText = `${type}: ${valueText.toUpperCase()}`;
                dropdown.classList.remove('open');
                
                // Trigger a UI refresh simulation
                sysLog.innerText = `FILTER APPLIED: ${valueText.toUpperCase()}... RELOADING DATA`;
                scaleBars.forEach(bar => bar.classList.add('active'));
                setTimeout(() => {
                    scaleBars.forEach(bar => bar.classList.remove('active'));
                }, 500);
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.cyber-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('open'));
        }
    });
});
