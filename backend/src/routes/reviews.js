const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /reviews — Create a review (authenticated)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { drinkId, rating, comment, sweetness, bitterness, citrus, strength } = req.body;

    if (!drinkId || !rating) {
      return res.status(400).json({ error: "drinkId e rating são obrigatórios" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating deve ser entre 1 e 5" });
    }

    // Check if drink exists
    const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
    if (!drink) {
      return res.status(404).json({ error: "Drink não encontrado" });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        sweetness: sweetness || null,
        bitterness: bitterness || null,
        citrus: citrus || null,
        strength: strength || null,
        userId: req.userId,
        drinkId,
      },
      include: {
        drink: { select: { id: true, name: true, categoryId: true, establishmentId: true } },
        user: { select: { id: true, name: true } },
      },
    });

    // Check and award badges
    const newBadges = await checkAndAwardBadges(req.userId);

    return res.status(201).json({ review, newBadges });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ error: "Erro ao criar avaliação" });
  }
});

// GET /reviews/mine — Get user's reviews (authenticated)
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      include: {
        drink: {
          include: {
            category: true,
            establishment: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reviews);
  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

// ─── Badge checking logic ───
async function checkAndAwardBadges(userId) {
  const newBadges = [];
  const allBadges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const ownedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  const userReviews = await prisma.review.findMany({
    where: { userId },
    include: {
      drink: {
        include: { category: true },
      },
    },
  });

  for (const badge of allBadges) {
    if (ownedBadgeIds.has(badge.id)) continue;

    const criteria = JSON.parse(badge.criteria);
    let earned = false;

    switch (criteria.type) {
      case "review_count":
        earned = userReviews.length >= criteria.value;
        break;

      case "category_count": {
        const categoryReviews = userReviews.filter(
          (r) => r.drink.category.name === criteria.categoryName
        );
        earned = categoryReviews.length >= criteria.value;
        break;
      }

      case "establishment_count": {
        const uniqueEstablishments = new Set(
          userReviews.map((r) => r.drink.establishmentId)
        );
        earned = uniqueEstablishments.size >= criteria.value;
        break;
      }

      case "comment_count": {
        const commentedReviews = userReviews.filter((r) => r.comment);
        earned = commentedReviews.length >= criteria.value;
        break;
      }
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newBadges.push(badge);
    }
  }

  return newBadges;
}

module.exports = router;
