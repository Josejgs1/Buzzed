const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /drinks — List all drinks with filters
router.get("/", async (req, res) => {
  try {
    const { categoryId, establishmentId, search, minSweet, maxSweet, minBitter, maxBitter, minCitrus, maxCitrus, minStrength, maxStrength } = req.query;

    const where = {};

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (establishmentId) where.establishmentId = parseInt(establishmentId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Sensory filters
    if (minSweet || maxSweet) {
      where.sweetness = {};
      if (minSweet) where.sweetness.gte = parseInt(minSweet);
      if (maxSweet) where.sweetness.lte = parseInt(maxSweet);
    }
    if (minBitter || maxBitter) {
      where.bitterness = {};
      if (minBitter) where.bitterness.gte = parseInt(minBitter);
      if (maxBitter) where.bitterness.lte = parseInt(maxBitter);
    }
    if (minCitrus || maxCitrus) {
      where.citrus = {};
      if (minCitrus) where.citrus.gte = parseInt(minCitrus);
      if (maxCitrus) where.citrus.lte = parseInt(maxCitrus);
    }
    if (minStrength || maxStrength) {
      where.strength = {};
      if (minStrength) where.strength.gte = parseInt(minStrength);
      if (maxStrength) where.strength.lte = parseInt(maxStrength);
    }

    const drinks = await prisma.drink.findMany({
      where,
      include: {
        category: true,
        establishment: { select: { id: true, name: true } },
        ingredients: { include: { ingredient: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { name: "asc" },
    });

    // Compute average rating
    const drinksWithRating = await Promise.all(
      drinks.map(async (drink) => {
        const agg = await prisma.review.aggregate({
          where: { drinkId: drink.id },
          _avg: { rating: true },
        });
        return {
          ...drink,
          avgRating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : null,
          ingredients: drink.ingredients.map((di) => di.ingredient),
        };
      })
    );

    return res.json(drinksWithRating);
  } catch (error) {
    console.error("List drinks error:", error);
    return res.status(500).json({ error: "Erro ao listar drinks" });
  }
});

// GET /drinks/:id — Get drink details
router.get("/:id", async (req, res) => {
  try {
    const drink = await prisma.drink.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        establishment: true,
        ingredients: { include: { ingredient: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!drink) {
      return res.status(404).json({ error: "Drink não encontrado" });
    }

    const agg = await prisma.review.aggregate({
      where: { drinkId: drink.id },
      _avg: { rating: true, sweetness: true, bitterness: true, citrus: true, strength: true },
      _count: { rating: true },
    });

    return res.json({
      ...drink,
      ingredients: drink.ingredients.map((di) => di.ingredient),
      avgRating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : null,
      avgSensory: {
        sweetness: agg._avg.sweetness ? parseFloat(agg._avg.sweetness.toFixed(1)) : null,
        bitterness: agg._avg.bitterness ? parseFloat(agg._avg.bitterness.toFixed(1)) : null,
        citrus: agg._avg.citrus ? parseFloat(agg._avg.citrus.toFixed(1)) : null,
        strength: agg._avg.strength ? parseFloat(agg._avg.strength.toFixed(1)) : null,
      },
      reviewCount: agg._count.rating,
    });
  } catch (error) {
    console.error("Get drink error:", error);
    return res.status(500).json({ error: "Erro ao buscar drink" });
  }
});

module.exports = router;
