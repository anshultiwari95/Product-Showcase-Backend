const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://dummyjson.com/products";

router.get("/", async (req, res) => {
  try {
    let { limit = 12, skip = 0, sort, category } = req.query;
    const urlParams = new URLSearchParams({ limit, skip });

    let endpoint = BASE_URL;
    if (category) {
      endpoint += `/category/${category}`;
    }

    endpoint += `?${urlParams.toString()}`;

    const response = await axios.get(endpoint);

    let products = response.data.products;
    if (sort === "price-low") {
      products = products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      products = products.sort((a, b) => b.price - a.price);
    }

    res.json({
      total: response.data.total,
      limit: Number(limit),
      skip: Number(skip),
      products,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

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

router.get("/categories/all", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching product categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
