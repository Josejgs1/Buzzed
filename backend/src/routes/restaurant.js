const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const {
  authMiddleware,
  requireRole,
  JWT_SECRET,
  ROLES,
} = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

const drinkInclude = {
  category: true,
  establishment: { select: { id: true, name: true } },
  ingredients: { include: { ingredient: true } },
  _count: { select: { reviews: true } },
};

function cleanText(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function parseNumber(value, field, { required = false, integer = false, min, max } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) return { error: `${field} é obrigatório` };
    return { value: undefined };
  }

  const number = Number(value);
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number))) {
    return { error: `${field} deve ser um número válido` };
  }
  if (min !== undefined && number < min) {
    return { error: `${field} deve ser maior ou igual a ${min}` };
  }
  if (max !== undefined && number > max) {
    return { error: `${field} deve ser menor ou igual a ${max}` };
  }

  return { value: number };
}

function parseIngredients(value, required = false) {
  if (value === undefined || value === null) {
    return required ? { error: "Informe pelo menos um ingrediente" } : {};
  }

  const rawItems = Array.isArray(value) ? value : String(value).split(",");
  const ingredients = [...new Set(rawItems.map(cleanText).filter(Boolean))];

  if (required && ingredients.length === 0) {
    return { error: "Informe pelo menos um ingrediente" };
  }

  return { ingredients };
}

function buildDrinkInput(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = cleanText(body.name);
    if (!name) return { error: "Nome do produto é obrigatório" };
    data.name = name;
  }

  if (body.description !== undefined) {
    data.description = cleanText(body.description);
  } else if (!partial) {
    data.description = null;
  }

  if (body.imageUrl !== undefined) {
    data.imageUrl = cleanText(body.imageUrl);
  }

  if (!partial || body.categoryId !== undefined) {
    const parsed = parseNumber(body.categoryId, "Categoria", {
      required: true,
      integer: true,
      min: 1,
    });
    if (parsed.error) return { error: parsed.error };
    data.categoryId = parsed.value;
  }

  const numericFields = [
    { key: "abv", label: "Teor alcoólico", integer: false, min: 0, max: 100 },
    { key: "sweetness", label: "Doçura", integer: true, min: 0, max: 5 },
    { key: "bitterness", label: "Amargor", integer: true, min: 0, max: 5 },
    { key: "citrus", label: "Cítrico", integer: true, min: 0, max: 5 },
    { key: "strength", label: "Força", integer: true, min: 0, max: 5 },
  ];

  for (const field of numericFields) {
    if (!partial || body[field.key] !== undefined) {
      const parsed = parseNumber(body[field.key], field.label, {
        required: !partial,
        integer: field.integer,
        min: field.min,
        max: field.max,
      });
      if (parsed.error) return { error: parsed.error };
      if (parsed.value !== undefined) data[field.key] = parsed.value;
    }
  }

  const ingredientResult = parseIngredients(body.ingredients, !partial);
  if (ingredientResult.error) return { error: ingredientResult.error };

  return {
    data,
    ingredients: ingredientResult.ingredients,
    shouldSyncIngredients: body.ingredients !== undefined || !partial,
  };
}

async function getOwnedEstablishment(userId) {
  return prisma.establishment.findUnique({
    where: { ownerId: userId },
  });
}

async function syncDrinkIngredients(client, drinkId, ingredientNames) {
  await client.drinkIngredient.deleteMany({ where: { drinkId } });

  for (const name of ingredientNames) {
    const ingredient = await client.ingredient.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    await client.drinkIngredient.create({
      data: { drinkId, ingredientId: ingredient.id },
    });
  }
}

async function addRating(drink) {
  const agg = await prisma.review.aggregate({
    where: { drinkId: drink.id },
    _avg: { rating: true },
  });

  return {
    ...drink,
    avgRating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : null,
    reviewCount: drink._count?.reviews || 0,
    ingredients: drink.ingredients.map((di) => di.ingredient),
  };
}

// POST /restaurant/register
router.post("/register", async (req, res) => {
  try {
    const {
      ownerName,
      name,
      email,
      password,
      establishmentName,
      address,
      phone,
      description,
    } = req.body;

    const userName = cleanText(ownerName || name);
    const restaurantName = cleanText(establishmentName);
    const restaurantAddress = cleanText(address);
    const userEmail = cleanText(email);

    if (!userName || !userEmail || !password || !restaurantName || !restaurantAddress) {
      return res.status(400).json({
        error: "Responsável, email, senha, nome do restaurante e endereço são obrigatórios",
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: userEmail } });
    if (existing) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: userName,
          email: userEmail,
          password: passwordHash,
          role: ROLES.RESTAURANT_OWNER,
        },
      });

      const establishment = await tx.establishment.create({
        data: {
          name: restaurantName,
          address: restaurantAddress,
          phone: cleanText(phone),
          description: cleanText(description),
          ownerId: user.id,
        },
      });

      return { user, establishment };
    });

    const token = jwt.sign({ id: result.user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      establishment: result.establishment,
      token,
    });
  } catch (error) {
    console.error("Restaurant register error:", error);
    return res.status(500).json({ error: "Erro ao cadastrar restaurante" });
  }
});

router.use(authMiddleware, requireRole(ROLES.RESTAURANT_OWNER));

// GET /restaurant/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const [drinkCount, reviewAgg] = await Promise.all([
      prisma.drink.count({
        where: { establishmentId: establishment.id, isActive: true },
      }),
      prisma.review.aggregate({
        where: { drink: { establishmentId: establishment.id } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return res.json({
      establishment,
      stats: {
        drinkCount,
        reviewCount: reviewAgg._count.rating,
        avgRating: reviewAgg._avg.rating
          ? parseFloat(reviewAgg._avg.rating.toFixed(1))
          : null,
      },
    });
  } catch (error) {
    console.error("Restaurant dashboard error:", error);
    return res.status(500).json({ error: "Erro ao carregar painel" });
  }
});

// GET /restaurant/establishment
router.get("/establishment", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    return res.json(establishment);
  } catch (error) {
    console.error("Restaurant establishment error:", error);
    return res.status(500).json({ error: "Erro ao buscar restaurante" });
  }
});

// PUT /restaurant/establishment
router.put("/establishment", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const data = {};
    if (req.body.name !== undefined) {
      data.name = cleanText(req.body.name);
      if (!data.name) return res.status(400).json({ error: "Nome é obrigatório" });
    }
    if (req.body.address !== undefined) {
      data.address = cleanText(req.body.address);
      if (!data.address) return res.status(400).json({ error: "Endereço é obrigatório" });
    }
    if (req.body.phone !== undefined) data.phone = cleanText(req.body.phone);
    if (req.body.description !== undefined) {
      data.description = cleanText(req.body.description);
    }
    if (req.body.imageUrl !== undefined) data.imageUrl = cleanText(req.body.imageUrl);

    const updated = await prisma.establishment.update({
      where: { id: establishment.id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    console.error("Update restaurant error:", error);
    return res.status(500).json({ error: "Erro ao atualizar restaurante" });
  }
});

// GET /restaurant/drinks
router.get("/drinks", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const includeInactive = req.query.includeInactive === "true";
    const drinks = await prisma.drink.findMany({
      where: {
        establishmentId: establishment.id,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: drinkInclude,
      orderBy: { name: "asc" },
    });

    const drinksWithRating = await Promise.all(drinks.map(addRating));
    return res.json(drinksWithRating);
  } catch (error) {
    console.error("Restaurant drinks error:", error);
    return res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

// GET /restaurant/drinks/:id
router.get("/drinks/:id", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const drink = await prisma.drink.findFirst({
      where: {
        id: parseInt(req.params.id),
        establishmentId: establishment.id,
      },
      include: drinkInclude,
    });

    if (!drink) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json(await addRating(drink));
  } catch (error) {
    console.error("Restaurant drink detail error:", error);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// POST /restaurant/drinks
router.post("/drinks", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const input = buildDrinkInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });

    const category = await prisma.category.findUnique({
      where: { id: input.data.categoryId },
    });
    if (!category) {
      return res.status(400).json({ error: "Categoria inválida" });
    }

    const drink = await prisma.$transaction(async (tx) => {
      const created = await tx.drink.create({
        data: {
          ...input.data,
          establishmentId: establishment.id,
          isActive: true,
        },
      });

      await syncDrinkIngredients(tx, created.id, input.ingredients);
      return tx.drink.findUnique({
        where: { id: created.id },
        include: drinkInclude,
      });
    });

    return res.status(201).json(await addRating(drink));
  } catch (error) {
    console.error("Create restaurant drink error:", error);
    return res.status(500).json({ error: "Erro ao cadastrar produto" });
  }
});

// PUT /restaurant/drinks/:id
router.put("/drinks/:id", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const drinkId = parseInt(req.params.id);
    const existing = await prisma.drink.findFirst({
      where: { id: drinkId, establishmentId: establishment.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const input = buildDrinkInput(req.body, { partial: true });
    if (input.error) return res.status(400).json({ error: input.error });

    if (input.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.data.categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: "Categoria inválida" });
      }
    }

    const drink = await prisma.$transaction(async (tx) => {
      await tx.drink.update({
        where: { id: existing.id },
        data: input.data,
      });

      if (input.shouldSyncIngredients) {
        await syncDrinkIngredients(tx, existing.id, input.ingredients);
      }

      return tx.drink.findUnique({
        where: { id: existing.id },
        include: drinkInclude,
      });
    });

    return res.json(await addRating(drink));
  } catch (error) {
    console.error("Update restaurant drink error:", error);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// DELETE /restaurant/drinks/:id
router.delete("/drinks/:id", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const drink = await prisma.drink.findFirst({
      where: {
        id: parseInt(req.params.id),
        establishmentId: establishment.id,
        isActive: true,
      },
    });

    if (!drink) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    await prisma.drink.update({
      where: { id: drink.id },
      data: { isActive: false },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete restaurant drink error:", error);
    return res.status(500).json({ error: "Erro ao remover produto" });
  }
});

// GET /restaurant/reviews
router.get("/reviews", async (req, res) => {
  try {
    const establishment = await getOwnedEstablishment(req.userId);
    if (!establishment) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const reviews = await prisma.review.findMany({
      where: { drink: { establishmentId: establishment.id } },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        drink: { select: { id: true, name: true, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reviews);
  } catch (error) {
    console.error("Restaurant reviews error:", error);
    return res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

module.exports = router;
