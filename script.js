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
        console.error('Error loading magazine data:', error);
        // Fallback to hardcoded data if JSON fails
        allMagazines = [
            {
                id: 1,
                title: 'Lord Rushabhdev',
                folder: 'book1',
                pages: 16,
                language: 'English',
                year: 2025,
                month: 'April',
                coverImage: 'books/book1/1.jpg'
            },
            {
                id: 2,
                title: 'The Era Back Then',
                folder: 'book2',
                pages: 16,
                language: 'English',
                year: 2025,
                month: 'March',
                coverImage: 'books/book2/1.jpg'
            }
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
    
    // Removed the audio badge from the HTML template below
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
    
    document.getElementById('grid-view').classList.add('hidden');
    document.getElementById('flipbook-view').classList.remove('hidden');
    document.getElementById('flipbook-view').classList.add('flex');
    
    const container = document.getElementById('magazine');
    container.innerHTML = '';
    
    // Build pages
    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(page);
    }
    
    // Initialize PageFlip
    const isMobile = window.innerWidth < 768;
    
    pageFlip = new St.PageFlip(container, {
        width: 1358,        // Your requested width
        height: 1004,       // Your requested height
        size: "fit",        // Changed from stretch to fit to maintain 2-page ratio
        minWidth: 300,
        maxWidth: 1358,
        minHeight: 220,
        maxHeight: 1004,
        showCover: true,
        flippingTime: 1000,
        usePortrait: isMobile,
        startPage: 0,
        drawShadow: true,
        maxShadowOpacity: 0.5,
        showPageCorners: true,
        disableFlipByClick: false,
        mobileScrollSupport: true
    });
    
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    
    // Update page counter on flip
    pageFlip.on('flip', (e) => {
        const currentPage = e.data + 1;
        let displayPage;
        
        if (currentPage === 1 || isMobile) {
            displayPage = currentPage;
        } else if (currentPage >= magazine.pages) {
            displayPage = magazine.pages;
        } else {
            displayPage = `${currentPage}-${currentPage + 1}`;
        }
        
        document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
    });
    
    // Set initial page counter
    document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
}

// Close flipbook and return to grid
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
    
    // Close button
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    
    // Toolbar Buttons
    document.getElementById('prev-page').addEventListener('click', () => {
        if (pageFlip) pageFlip.flipPrev();
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (pageFlip) pageFlip.flipNext();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (pageFlip) {
            if (e.key === 'ArrowLeft') {
                pageFlip.flipPrev();
            } else if (e.key === 'ArrowRight') {
                pageFlip.flipNext();
            } else if (e.key === 'Escape') {
                closeFlipbook();
            }
        }
    });
});

// Make openMagazine globally accessible
window.openMagazine = openMagazine;
