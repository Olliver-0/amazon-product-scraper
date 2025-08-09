# Amazon Product Scraper

A simple web application that scrapes product listings from the first page of Amazon search results for a given keyword. It features a Bun/Express backend for the scraping logic and a Vite/Vanilla JS frontend to display the results.

---

## Features

-   **Keyword Search**: Enter any keyword to search for products on Amazon.
-   **Data Extraction**: The scraper extracts the following details for each product:
    -   Product Title
    -   Rating (e.g., 4.5 out of 5)
    -   Number of Reviews
    -   Product Image URL
    -   Direct link to the product page
-   **User-Friendly Interface**: A clean, dark-themed UI to input keywords and view results in a grid layout.
-   **Error Handling**: Provides clear feedback to the user if the scraping fails or if no products are found.

---

## Tech Stack

-   **Backend**:
    -   **Runtime**: [Bun](https://bun.sh/)
    -   **Framework**: [Express.js](https://expressjs.com/)
    -   **HTTP Client**: [Axios](https://axios-http.com/)
    -   **HTML Parsing**: [JSDOM](https://github.com/jsdom/jsdom)
-   **Frontend**:
    -   **Build Tool**: [Vite](https://vitejs.dev/)
    -   **Language**: Vanilla JavaScript, HTML, CSS

---

## Prerequisites

Before you begin, ensure you have [Bun](https://bun.sh/docs/installation) installed on your machine.

---

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Olliver-0/amazon-product-scraper
    cd amazon-product-scraper
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    bun install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    bun install
    ```

---

## Running the Application

You will need two separate terminal windows to run both the backend and frontend servers concurrently.

1.  **Start the Backend Server:**
    In your first terminal, navigate to the `backend` directory and run:
    ```bash
    cd backend
    bun run index.js
    ```
    The server will start on `http://localhost:3000`.

2.  **Start the Frontend Server:**
    In your second terminal, navigate to the `frontend` directory and run:
    ```bash
    cd frontend
    bun run dev
    ```
    Vite will start the development server, typically on `http://localhost:5173`. Open this URL in your browser to use the application.

---

## ⚠️ Disclaimer

Web scraping is inherently fragile. Amazon and other websites frequently update their HTML structure and implement anti-bot measures.

-   **Selector Changes**: If the scraper stops working (e.g., returns no products), the most likely cause is that Amazon has changed its CSS classes or HTML layout. You will need to inspect the page and update the query selectors in `backend/index.js`.
-   **IP Blocking**: Making too many requests in a short period can result in your IP address being temporarily blocked. Use this tool responsibly.
