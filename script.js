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
    
    // Rebuild the container from scratch to fix the crash on re-opening
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');
    
    // Build pages
    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(page);
    }
    
    try {
        // Initialize PageFlip
        pageFlip = new St.PageFlip(container, {
            width: 679,         // Single page width
            height: 1004,       // Single page height
            size: "stretch",    // Required by library logic
            minWidth: 300,
            maxWidth: 679,
            minHeight: 400,
            maxHeight: 1004,
            showCover: true,
            flippingTime: 700,
            usePortrait: false, // Forces 2-page view ALWAYS
            startPage: 0,
            drawShadow: true,
            maxShadowOpacity: 0.4,
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
            let displayPage = (currentPage === 1 || currentPage >= magazine.pages) 
                ? currentPage 
                : `${currentPage}-${currentPage + 1}`;
            document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
        });

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
