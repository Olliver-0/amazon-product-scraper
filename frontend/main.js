// --- DOM Element Selection ---
const searchForm = document.getElementById('search-form');
const keywordInput = document.getElementById('keyword-input');
const resultsContainer = document.getElementById('results-container');
const messageContainer = document.getElementById('message-container');
const loader = document.getElementById('loader');

// --- UI Management Functions ---

/**
 * Prepares the UI for a new search, clearing old results and showing the loader.
 */
function startLoading() {
    resultsContainer.innerHTML = '';
    messageContainer.innerHTML = '';
    messageContainer.className = 'message-container'; // Reset class
    loader.classList.remove('hidden');
}

/**
 * Hides the loader after a search is complete.
 */
function stopLoading() {
    loader.classList.add('hidden');
}

/**
 * Renders a message to the user (e.g., for errors or info).
 * @param {string} text The message text.
 * @param {'error' | 'info'} type The type of message for styling.
 */
function renderMessage(text, type = 'info') {
    messageContainer.className = `message-container message-${type}`;
    messageContainer.textContent = text;
}

/**
 * Renders the list of products on the page.
 * @param {Array<Object>} products The array of product objects to display.
 */
function renderResults(products) {
    // Use a DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    products.forEach(product => {
        fragment.appendChild(createProductCard(product));
    });
    resultsContainer.appendChild(fragment);
}

/**
 * Creates a single product card element.
 * @param {Object} product The product data.
 * @returns {HTMLElement} The product card DOM element.
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Sanitize title to prevent potential XSS if the source is ever untrusted
    const safeTitle = product.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    card.innerHTML = `
        <a href="https://www.amazon.com/s?k=${encodeURIComponent(product.title)}" target="_blank" rel="noopener noreferrer" class="product-link">
            <img src="${product.imageUrl}" alt="${safeTitle}" class="product-image" loading="lazy" onerror="this.style.display='none'">
            <h3 class="product-title">${safeTitle}</h3>
        </a>
        <div class="product-meta">
            <span class="product-rating" title="${product.rating} out of 5 stars">⭐ ${product.rating}</span>
            <span class="product-reviews">(${product.reviews.toLocaleString('en-US')} reviews)</span>
        </div>
    `;
    return card;
}


// --- Core Logic ---

/**
 * Fetches product data from the backend API.
 * @param {string} keyword The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
async function fetchProducts(keyword) {
    const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data from the server.');
    }
    return response.json();
}

/**
 * Handles the main form submission event.
 * @param {Event} event The form submission event.
 */
async function handleSearch(event) {
    event.preventDefault();
    const keyword = keywordInput.value.trim();

    if (!keyword) {
        renderMessage('Please enter a search term.', 'error');
        return;
    }

    startLoading();

    try {
        const products = await fetchProducts(keyword);
        if (products.length === 0) {
            renderMessage('No products found. The site may be blocking requests or the page structure might have changed.', 'info');
        } else {
            renderResults(products);
        }
    } catch (error) {
        console.error('Search failed:', error);
        renderMessage(`Error: ${error.message}`, 'error');
    } finally {
        stopLoading();
    }
}

// --- Event Listener ---
searchForm.addEventListener('submit', handleSearch);
