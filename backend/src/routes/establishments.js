const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /establishments — List all
router.get("/", async (req, res) => {
  try {
    const establishments = await prisma.establishment.findMany({
      include: {
        _count: { select: { drinks: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return res.json(establishments);
  } catch (error) {
    console.error("List establishments error:", error);
    return res.status(500).json({ error: "Erro ao listar estabelecimentos" });
  }
});

// GET /establishments/:id — Get establishment details with drinks
router.get("/:id", async (req, res) => {
  try {
    const establishment = await prisma.establishment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        drinks: {
          where: { isActive: true },
          include: {
            category: true,
            ingredients: { include: { ingredient: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
    });

    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento não encontrado" });
    }

    // Add avg rating to each drink
    const drinksWithRating = await Promise.all(
      establishment.drinks.map(async (drink) => {
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

    return res.json({
      ...establishment,
      drinks: drinksWithRating,
    });
  } catch (error) {
    console.error("Get establishment error:", error);
    return res.status(500).json({ error: "Erro ao buscar estabelecimento" });
  }
});

module.exports = router;
