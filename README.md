# 🧠 Product Showcase App — Backend

This is the **backend API** for the [Product Showcase](https://product-showcase-frontend.vercel.app) application. It acts as a **proxy to the DummyJSON API**, adds **custom sorting**, and implements **in-memory caching** for performance optimization.

---

## 🔗 Live URLs

- **Backend Live**: [https://product-showcase-backend.onrender.com](https://product-showcase-backend.onrender.com)
- **Backend GitHub**: [https://github.com/anshultiwari95/Product-Showcase-Backend](https://github.com/anshultiwari95/Product-Showcase-Backend)

---

## 🚀 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/anshultiwari95/Product-Showcase-Backend.git
cd Product-Showcase-Backend


2. Install Dependencies
npm install

3. Start the Server
npm start
The backend will start on http://localhost:8080

4. API Endpoints
🔸 GET /api/products
Fetches a list of products. Supports optional query parameters:

Query       Param	Description
limit	    Number of products per page (default: 12)
skip	    Pagination offset
category	Product category name
sort	    price-low or price-high

🔸 GET /api/products/:id
Fetches full details of a product by ID.

🔸 GET /api/products/categories/all
Returns all available product categories.

5. Design Choices
Proxy-based architecture: All frontend API calls go through this backend, which talks to DummyJSON. This allowed us to:

Sort across all products (not just one page)

Add in-memory caching

Keep the frontend logic clean and focused

In-memory caching:

Caches product lists (sorted and paginated) for 5 minutes

Caches categories for 5 minutes

Sorting across all items:

For price-based sorting, the API fetches the full category/all products once, sorts in memory, and paginates the result.

6. Tech Stack
Node.js

Express.js

Axios — used for making HTTP requests to DummyJSON

CORS — to allow frontend calls




Author
Anshul Tiwari

📧 anshul.tiwari1223@gmail.com

🔗  https://www.linkedin.com/in/tiwari-anshul12/

🌐 https://anshul-tiwari-portfolio.vercel.app/

