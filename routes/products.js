const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://dummyjson.com/products";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const productCache = new Map(); // key: cacheKey, value: { data, timestamp }
let categoryCache = null;
let categoryLastFetched = 0;

// 🔹 Helper to fetch all products (paginated)
const fetchAllProducts = async (category = null) => {
  let allProducts = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const url = category
      ? `${BASE_URL}/category/${category}?limit=${limit}&skip=${skip}`
      : `${BASE_URL}?limit=${limit}&skip=${skip}`;

    const response = await axios.get(url);
    allProducts = allProducts.concat(response.data.products);
    skip += limit;

    if (skip >= response.data.total) break;
  }

  return allProducts;
};

// 🔹 GET /api/products
router.get("/", async (req, res) => {
  try {
    let { limit = 12, skip = 0, sort, category } = req.query;
    limit = parseInt(limit);
    skip = parseInt(skip);

    const isSorting = sort === "price-low" || sort === "price-high";
    const isAllCategory =
      !category || category === "all" || category === "All Categories";

    const cacheKey = `${category || "all"}|${sort || "none"}`;

    // ✅ If sorting, fetch all and cache
    if (isSorting) {
      const cached = productCache.get(cacheKey);
      let allProducts;

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        allProducts = cached.data;
      } else {
        allProducts = await fetchAllProducts(isAllCategory ? null : category);
        productCache.set(cacheKey, {
          data: allProducts,
          timestamp: Date.now(),
        });
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

    // ✅ No sort → direct paginated fetch
    const urlParams = new URLSearchParams({ limit, skip }).toString();
    const endpoint = category
      ? `${BASE_URL}/category/${category}`
      : BASE_URL;
    const fullUrl = `${endpoint}?${urlParams}`;

    const response = await axios.get(fullUrl);
    return res.json({
      total: response.data.total,
      limit,
      skip,
      products: response.data.products,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🔹 GET /api/products/:id
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

// 🔹 GET /api/products/categories/all
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
