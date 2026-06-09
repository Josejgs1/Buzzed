const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const drinksRoutes = require("./routes/drinks");
const establishmentsRoutes = require("./routes/establishments");
const reviewsRoutes = require("./routes/reviews");
const badgesRoutes = require("./routes/badges");
const categoriesRoutes = require("./routes/categories");
const restaurantRoutes = require("./routes/restaurant");

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/auth", authRoutes);
app.use("/drinks", drinksRoutes);
app.use("/establishments", establishmentsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/badges", badgesRoutes);
app.use("/categories", categoriesRoutes);
app.use("/restaurant", restaurantRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    app: "Buzzed API",
    version: "1.0.0",
    status: "running",
    endpoints: [
      "POST /auth/register",
      "POST /auth/login",
      "GET  /auth/profile",
      "GET  /drinks",
      "GET  /drinks/:id",
      "GET  /establishments",
      "GET  /establishments/:id",
      "GET  /categories",
      "POST /restaurant/register",
      "GET  /restaurant/dashboard",
      "GET  /restaurant/drinks",
      "POST /restaurant/drinks",
      "PUT  /restaurant/drinks/:id",
      "DELETE /restaurant/drinks/:id",
      "GET  /restaurant/reviews",
      "POST /reviews",
      "GET  /reviews/mine",
      "GET  /badges",
      "GET  /badges/mine",
    ],
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🍸 Buzzed API running at http://localhost:${PORT}\n`);
});
