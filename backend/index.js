import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const app = express();
const PORT = 3000;

/**
 * Fetches the HTML content of a given URL, simulating a real browser request.
 * @param {string} url The URL to fetch.
 * @returns {Promise<string>} A promise that resolves with the HTML content of the page.
 */
async function fetchPage(url) {
    // These headers are crucial to mimic a real browser and avoid being blocked.
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="127", "Google Chrome";v="127"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
    };

    const { data } = await axios.get(url, { headers });
    return data;
}

/**
 * Parses the HTML of an Amazon search results page to extract product data.
 * @param {string} html The HTML content to parse.
 * @returns {Array<Object>} An array of product objects.
 */
function parseProducts(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Security check: if the page is a CAPTCHA or error page, stop execution.
    const pageTitle = document.querySelector('title')?.textContent || '';
    if (pageTitle.includes('Something went wrong') || pageTitle.includes('CAPTCHA')) {
        console.warn('CAPTCHA or error page detected. Aborting scrape.');
        return [];
    }

    const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
    
    // Using Array.from and .map for a more functional approach
    return Array.from(productElements).map(element => {
        // The title is within a <span> inside an <h2> with the 'a-text-normal' class.
        const titleElement = element.querySelector('h2.a-text-normal span, span.a-text-normal');
        const title = titleElement ? titleElement.textContent.trim() : null;

        // The rating text (e.g., "4.5 out of 5 stars") is in a span with the 'a-icon-alt' class.
        const ratingElement = element.querySelector('span.a-icon-alt');
        const rating = ratingElement ? ratingElement.textContent.trim().split(' ')[0] : 'N/A';
        
        // The number of reviews is in a span inside a link, next to the rating stars.
        const reviewsElement = element.querySelector('a.s-underline-link-text span.a-size-base');
        const reviews = reviewsElement ? parseInt(reviewsElement.textContent.trim().replace(/[,.]/g, ''), 10) : 0;

        // The product image has the 's-image' class.
        const imageElement = element.querySelector('img.s-image');
        const imageUrl = imageElement ? imageElement.src : null;

        return { title, rating, reviews, imageUrl };
    }).filter(product => 
        // Filter out any products that couldn't be parsed correctly or are placeholders.
        product.title && product.imageUrl && !product.imageUrl.includes('data:image/gif')
    );
}

// --- API Endpoint ---
app.get('/api/scrape', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required.' });
    }

    const searchQuery = encodeURIComponent(keyword);
    const URL = `https://www.amazon.com/s?k=${searchQuery}`; // Changed to amazon.com for better consistency

    console.log(`🔎 Scraping data from: ${URL}`);

    try {
        const html = await fetchPage(URL);
        
        // To debug, you can save the received HTML to a file.
        // fs.writeFileSync('amazon_response.html', html);
        
        const products = parseProducts(html);
        
        console.log(`✅ Found and parsed ${products.length} products.`);
        res.json(products);

    } catch (error) {
        console.error('ERROR DETAILS:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            // Saves the HTML of the error page for analysis
            fs.writeFileSync('amazon_error_response.html', error.response.data);
            console.log("Error page HTML saved to 'amazon_error_response.html'");
        }
        res.status(500).json({ error: 'Failed to scrape Amazon data.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
