const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { drinks: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return res.json(categories);
  } catch (error) {
    console.error("List categories error:", error);
    return res.status(500).json({ error: "Erro ao listar categorias" });
  }
});

module.exports = router;
