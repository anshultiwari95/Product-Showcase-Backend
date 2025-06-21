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
    const urlParams = new URLSearchParams({ limit, skip }).toString();
    const endpoint = category ? `${BASE_URL}/category/${category}` : BASE_URL;
    const fullUrl = `${endpoint}?${urlParams}`;
    const cacheKey = `${fullUrl}|${sort || "none"}`;

    const cached = productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    const response = await axios.get(fullUrl);
    let products = response.data.products;

    if (sort === "price-low") {
      products = products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      products = products.sort((a, b) => b.price - a.price);
    }

    const result = {
      total: response.data.total,
      limit: Number(limit),
      skip: Number(skip),
      products,
    };

    productCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json(result);
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
