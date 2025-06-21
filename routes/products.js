const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://dummyjson.com/products";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 🔹 Product list cache
const productCache = new Map(); // key: query string + sort, value: { data, timestamp }

// 🔹 Categories cache
let categoryCache = null;
let categoryLastFetched = 0;

// 🔸 GET /api/products
router.get("/", async (req, res) => {
  try {
    let { limit = 12, skip = 0, sort, category } = req.query;
    limit = parseInt(limit);
    skip = parseInt(skip);

    const isSorting = sort === "price-low" || sort === "price-high";
    const isAllCategory = !category || category === "all" || category === "All Categories";

    const urlParams = new URLSearchParams({ limit, skip }).toString();
    const endpoint = category ? `${BASE_URL}/category/${category}` : BASE_URL;
    const fullUrl = `${endpoint}?${urlParams}`;
    const cacheKey = `${endpoint}|${sort || "none"}`;

    // ✅ If sorting is requested → fetch ALL items first, then sort & paginate
    if (isSorting) {
      const sortCacheKey = `${endpoint}|ALL`;

      const cachedAll = productCache.get(sortCacheKey);
      let allProducts;

      if (cachedAll && Date.now() - cachedAll.timestamp < CACHE_DURATION) {
        allProducts = cachedAll.data;
      } else {
        const fetchUrl = category ? `${BASE_URL}/category/${category}` : BASE_URL;
        const allResponse = await axios.get(fetchUrl);
        allProducts = allResponse.data.products;
        productCache.set(sortCacheKey, { data: allProducts, timestamp: Date.now() });
      }

      const sorted = [...allProducts].sort((a, b) =>
        sort === "price-low" ? a.price - b.price : b.price - a.price
      );

      const paginated = sorted.slice(skip, skip + limit);

      return res.json({
        total: sorted.length,
        limit,
        skip,
        products: paginated,
      });
    }

    // ✅ No sorting → basic paginated fetch with optional category
    const response = await axios.get(fullUrl);
    const products = response.data.products;

    return res.json({
      total: response.data.total,
      limit,
      skip,
      products,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// 🔸 GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching product detail:", err.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// 🔸 GET /api/products/categories/all
router.get("/categories/all", async (req, res) => {
  try {
    if (categoryCache && Date.now() - categoryLastFetched < CACHE_DURATION) {
      return res.json(categoryCache);
    }

    const response = await axios.get(`${BASE_URL}/categories`);
    categoryCache = response.data;
    categoryLastFetched = Date.now();

    res.json(categoryCache);
  } catch (err) {
    console.error("❌ Error fetching product categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
