const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /badges — List all badges
router.get("/", async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(badges);
  } catch (error) {
    console.error("List badges error:", error);
    return res.status(500).json({ error: "Erro ao listar badges" });
  }
});

// GET /badges/mine — Get user's badges (authenticated)
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    });

    return res.json(userBadges.map((ub) => ({
      ...ub.badge,
      unlockedAt: ub.unlockedAt,
    })));
  } catch (error) {
    console.error("Get my badges error:", error);
    return res.status(500).json({ error: "Erro ao buscar badges" });
  }
});

module.exports = router;
