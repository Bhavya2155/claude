// Global variables
let allMagazines = [];
let pageFlip = null;

// Load magazine data
async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (error) {
        console.error("ERROR loading data.json:", error);
        // Fallback data
        allMagazines = [
            { id: 1, title: 'Lord Rushabhdev', folder: 'book1', pages: 16, language: 'English', year: 2025, month: 'April', coverImage: 'books/book1/1.jpg' },
            { id: 2, title: 'The Era Back Then', folder: 'book2', pages: 16, language: 'English', year: 2025, month: 'March', coverImage: 'books/book2/1.jpg' }
        ];
        renderMagazines(allMagazines);
    }
}

// Render magazines in grid
function renderMagazines(magazines) {
    const grid = document.getElementById('magazine-list');
    const noResults = document.getElementById('no-results');
    
    if (magazines.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    grid.innerHTML = magazines.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="${mag.title}" loading="lazy">
            <div class="overlay"></div>
            <div class="title">${mag.title}</div>
        </div>
    `).join('');
}

// Open magazine in flipbook view
function openMagazine(magazineId) {
    const magazine = allMagazines.find(m => m.id === magazineId);
    if (!magazine) return;
    
    // Switch Views
    document.getElementById('grid-view').classList.add('hidden');
    const flipbookView = document.getElementById('flipbook-view');
    flipbookView.classList.remove('hidden');
    flipbookView.classList.add('flex');
    
    // Rebuild the container
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');
    
    // Build pages
    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}" loading="lazy">`;
        container.appendChild(page);
    }
    
    try {
        // Initialize PageFlip
        pageFlip = new St.PageFlip(container, {
            width: 679,         
            height: 1004,       
            size: "stretch",    
            minWidth: 300,
            maxWidth: 679,
            minHeight: 400,
            maxHeight: 1004,
            showCover: true,
            flippingTime: 450,  
            usePortrait: true,  
            startPage: 0,
            drawShadow: true,
            maxShadowOpacity: 0.3,
            showPageCorners: true,
            disableFlipByClick: false,
            mobileScrollSupport: true,
            swipeDistance: 30
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        
        // Counter logic
        pageFlip.on('init', () => {
            document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
        });
        
        pageFlip.on('flip', (e) => {
            const currentPage = e.data + 1;
            let displayPage;
            if (pageFlip.getOrientation() === 'portrait') {
                displayPage = currentPage;
            } else {
                displayPage = (currentPage === 1 || currentPage >= magazine.pages) 
                    ? currentPage 
                    : `${currentPage}-${currentPage + 1}`; 
            }
            document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
        });

        // ==========================================
        // ANTI-DOUBLE-FLIP SWIPE LOGIC
        // ==========================================
        let touchstartX = null;
        let touchstartY = null;
        let touchendX = 0;
        let touchendY = 0;
        let isAnimating = false;

        pageFlip.on('changeState', (e) => {
            isAnimating = (e.data !== 'read'); 
        });

        flipbookView.addEventListener('touchstart', e => {
            // FIX: If touching the actual book, let the library handle the native swipe!
            // Only run the custom code if touching the gray background.
            if (e.target.closest('#magazine')) {
                touchstartX = null; 
                return;
            }
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        }, { passive: true });

        flipbookView.addEventListener('touchend', e => {
            // Abort custom swipe if touch started on the book or is already turning
            if (touchstartX === null || isAnimating || !pageFlip) return;

            touchendX = e.changedTouches[0].screenX;
            touchendY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeDistX = touchendX - touchstartX;
            const swipeDistY = touchendY - touchstartY;
            const swipeThreshold = 40; 

            if (Math.abs(swipeDistX) > swipeThreshold && Math.abs(swipeDistX) > Math.abs(swipeDistY)) {
                if (swipeDistX < 0) {
                    pageFlip.flipNext(); // Swiped Left
                } else {
                    pageFlip.flipPrev(); // Swiped Right
                }
            }
        }

    } catch (error) {
        console.error("CRITICAL ERROR initializing PageFlip:", error);
    }
}

// Close flipbook
function closeFlipbook() {
    document.getElementById('flipbook-view').classList.add('hidden');
    document.getElementById('flipbook-view').classList.remove('flex');
    document.getElementById('grid-view').classList.remove('hidden');
    
    if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadMagazineData();
    
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    
    document.getElementById('prev-page').addEventListener('click', () => {
        if (pageFlip) pageFlip.flipPrev();
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (pageFlip) pageFlip.flipNext();
    });
    
    document.addEventListener('keydown', (e) => {
        if (!pageFlip) return;
        if (e.key === 'ArrowLeft') pageFlip.flipPrev();
        else if (e.key === 'ArrowRight') pageFlip.flipNext();
        else if (e.key === 'Escape') closeFlipbook();
    });
});

window.openMagazine = openMagazine;
