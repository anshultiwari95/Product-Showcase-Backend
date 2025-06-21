const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();

const corsOptions = {
  origin: "https://product-showcase-frontend.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use("/api/products", productRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
