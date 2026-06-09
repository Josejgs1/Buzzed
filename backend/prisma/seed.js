const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Buzzed database...\n");

  // ─── Clear existing data ───
  await prisma.userBadge.deleteMany();
  await prisma.review.deleteMany();
  await prisma.drinkIngredient.deleteMany();
  await prisma.drink.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───
  const passwordHash = await bcrypt.hash("123456", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Maria Silva",
        email: "maria@buzzed.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "João Santos",
        email: "joao@buzzed.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ana Costa",
        email: "ana@buzzed.com",
        password: passwordHash,
        role: "CUSTOMER",
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} users`);

  const owners = await Promise.all([
    prisma.user.create({
      data: {
        name: "Zé Oliveira",
        email: "bar@buzzed.com",
        password: passwordHash,
        role: "RESTAURANT_OWNER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Carla Mendes",
        email: "rooftop@buzzed.com",
        password: passwordHash,
        role: "RESTAURANT_OWNER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Pedro Lima",
        email: "boteco@buzzed.com",
        password: passwordHash,
        role: "RESTAURANT_OWNER",
      },
    }),
  ]);
  console.log(`✅ Created ${owners.length} restaurant owners`);

  // ─── Establishments ───
  const establishments = await Promise.all([
    prisma.establishment.create({
      data: {
        name: "Bar do Zé",
        address: "Rua Augusta, 1234 - São Paulo, SP",
        phone: "(11) 99999-1234",
        description:
          "Bar clássico paulistano com drinks autorais e ambiente descontraído. Referência em coquetelaria artesanal desde 2015.",
        imageUrl: null,
        ownerId: owners[0].id,
      },
    }),
    prisma.establishment.create({
      data: {
        name: "Rooftop Skyline",
        address: "Av. Paulista, 900 - Cobertura - São Paulo, SP",
        phone: "(11) 98888-5678",
        description:
          "Rooftop com vista panorâmica da cidade. Especialidade em drinks tropicais e experiências sensoriais premium.",
        imageUrl: null,
        ownerId: owners[1].id,
      },
    }),
    prisma.establishment.create({
      data: {
        name: "Boteco da Esquina",
        address: "Rua da Consolação, 456 - São Paulo, SP",
        phone: "(11) 97777-9012",
        description:
          "O melhor da coquetelaria brasileira com toques contemporâneos. Caipirinha artesanal é a especialidade da casa.",
        imageUrl: null,
        ownerId: owners[2].id,
      },
    }),
  ]);
  console.log(`✅ Created ${establishments.length} establishments`);

  // ─── Categories ───
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Clássicos",
        description:
          "Drinks consagrados pela história da mixologia mundial. Receitas tradicionais que resistem ao tempo.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Tropicais",
        description:
          "Drinks refrescantes com frutas tropicais, perfeitos para o clima brasileiro.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Gin-Based",
        description:
          "Coquetéis à base de gin, do clássico G&T às criações contemporâneas.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Rum & Cachaça",
        description:
          "Drinks com destilados brasileiros e caribenhos, da caipirinha ao mojito.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Whisky & Bourbon",
        description:
          "Drinks encorpados à base de whisky e bourbon para paladares sofisticados.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sem Álcool",
        description:
          "Mocktails criativos e refrescantes para quem prefere zero álcool sem abrir mão do sabor.",
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // ─── Ingredients ───
  const ingredientNames = [
    "Gin",
    "Vodka",
    "Rum",
    "Cachaça",
    "Whisky",
    "Bourbon",
    "Tequila",
    "Campari",
    "Vermute Doce",
    "Vermute Seco",
    "Suco de Limão",
    "Suco de Laranja",
    "Suco de Maracujá",
    "Suco de Abacaxi",
    "Água Tônica",
    "Club Soda",
    "Açúcar",
    "Xarope Simples",
    "Hortelã",
    "Angostura Bitters",
    "Gelo",
    "Leite de Coco",
    "Gengibre",
    "Mel",
    "Frutas Vermelhas",
    "Manga",
    "Licor de Laranja",
    "Grenadine",
    "Espumante",
    "Refrigerante de Cola",
  ];

  const ingredients = {};
  for (const name of ingredientNames) {
    const ing = await prisma.ingredient.create({ data: { name } });
    ingredients[name] = ing;
  }
  console.log(`✅ Created ${ingredientNames.length} ingredients`);

  // ─── Drinks ───
  const drinkImages = {
    "Negroni": "negroni.jpg",
    "Old Fashioned": "old-fashioned.jpg",
    "Caipirinha Clássica": "caipirinha-classica.jpg",
    "Moscow Mule": "moscow-mule.jpg",
    "Whisky Sour": "whisky-sour.jpg",
    "Tropical Sunset": "tropical-sunset.jpg",
    "Gin Tônica Rooftop": "gin-tonica.jpg",
    "Piña Colada": "pina-colada.jpg",
    "Aperol Spritz": "aperol-spritz.jpg",
    "Berry Bliss Mocktail": "berry-mocktail.jpg",
    "Mojito": "mojito.jpg",
    "Margarita": "margarita.jpg",
    "Caipirinha de Maracujá": "caipirinha-maracuja.jpg",
    "Gin Fizz com Mel": "gin-fizz-mel.jpg",
    "Cuba Libre": "cuba-libre.jpg",
    "Sunset Mocktail": "sunset-mocktail.jpg",
  };

  const drinksData = [
    // Bar do Zé
    {
      name: "Negroni",
      description:
        "O clássico italiano com equilíbrio perfeito entre amargo, doce e herbal. Gin, Campari e Vermute Doce em partes iguais.",
      abv: 24,
      sweetness: 2,
      bitterness: 5,
      citrus: 1,
      strength: 4,
      categoryId: categories[0].id, // Clássicos
      establishmentId: establishments[0].id,
      ingredients: ["Gin", "Campari", "Vermute Doce", "Gelo"],
    },
    {
      name: "Old Fashioned",
      description:
        "Um dos primeiros coquetéis da história. Bourbon, açúcar, bitters e casca de laranja. Elegância em um copo.",
      abv: 32,
      sweetness: 2,
      bitterness: 3,
      citrus: 1,
      strength: 5,
      categoryId: categories[4].id, // Whisky & Bourbon
      establishmentId: establishments[0].id,
      ingredients: ["Bourbon", "Açúcar", "Angostura Bitters", "Gelo"],
    },
    {
      name: "Caipirinha Clássica",
      description:
        "O drink mais brasileiro que existe. Cachaça, limão e açúcar — simples, forte e refrescante.",
      abv: 20,
      sweetness: 3,
      bitterness: 1,
      citrus: 5,
      strength: 4,
      categoryId: categories[3].id, // Rum & Cachaça
      establishmentId: establishments[0].id,
      ingredients: ["Cachaça", "Suco de Limão", "Açúcar", "Gelo"],
    },
    {
      name: "Moscow Mule",
      description:
        "Vodka com cerveja de gengibre e limão, servido na icônica caneca de cobre. Refrescante e picante.",
      abv: 12,
      sweetness: 2,
      bitterness: 1,
      citrus: 4,
      strength: 2,
      categoryId: categories[0].id,
      establishmentId: establishments[0].id,
      ingredients: ["Vodka", "Suco de Limão", "Gengibre", "Club Soda", "Gelo"],
    },
    {
      name: "Whisky Sour",
      description:
        "Whisky encontra limão e xarope. Acidez equilibrada por doçura sutil. Clássico atemporal.",
      abv: 18,
      sweetness: 3,
      bitterness: 2,
      citrus: 4,
      strength: 3,
      categoryId: categories[4].id,
      establishmentId: establishments[0].id,
      ingredients: [
        "Whisky",
        "Suco de Limão",
        "Xarope Simples",
        "Angostura Bitters",
        "Gelo",
      ],
    },

    // Rooftop Skyline
    {
      name: "Tropical Sunset",
      description:
        "Explosão tropical com maracujá, manga e rum. O pôr do sol em forma de drink — doce, vibrante e inesquecível.",
      abv: 14,
      sweetness: 5,
      bitterness: 1,
      citrus: 3,
      strength: 2,
      categoryId: categories[1].id, // Tropicais
      establishmentId: establishments[1].id,
      ingredients: [
        "Rum",
        "Suco de Maracujá",
        "Manga",
        "Xarope Simples",
        "Gelo",
      ],
    },
    {
      name: "Gin Tônica Rooftop",
      description:
        "Gin premium com tônica artesanal, pepino e zimbro extra. A versão elevada do clássico G&T.",
      abv: 10,
      sweetness: 1,
      bitterness: 3,
      citrus: 2,
      strength: 2,
      categoryId: categories[2].id, // Gin-Based
      establishmentId: establishments[1].id,
      ingredients: ["Gin", "Água Tônica", "Suco de Limão", "Gelo"],
    },
    {
      name: "Piña Colada",
      description:
        "Rum, leite de coco e abacaxi. O drink que te transporta para uma praia caribenha com cada gole.",
      abv: 13,
      sweetness: 5,
      bitterness: 1,
      citrus: 2,
      strength: 2,
      categoryId: categories[1].id,
      establishmentId: establishments[1].id,
      ingredients: [
        "Rum",
        "Leite de Coco",
        "Suco de Abacaxi",
        "Xarope Simples",
        "Gelo",
      ],
    },
    {
      name: "Aperol Spritz",
      description:
        "Leve, refrescante e vibrante. Aperol, espumante e um toque de soda. O drink do verão europeu.",
      abv: 8,
      sweetness: 3,
      bitterness: 3,
      citrus: 2,
      strength: 1,
      categoryId: categories[0].id,
      establishmentId: establishments[1].id,
      ingredients: ["Campari", "Espumante", "Club Soda", "Suco de Laranja", "Gelo"],
    },
    {
      name: "Berry Bliss Mocktail",
      description:
        "Frutas vermelhas frescas, gengibre e soda. Complexo, refrescante e zero álcool — puro prazer sem ressaca.",
      abv: 0,
      sweetness: 4,
      bitterness: 1,
      citrus: 3,
      strength: 0,
      categoryId: categories[5].id, // Sem Álcool
      establishmentId: establishments[1].id,
      ingredients: [
        "Frutas Vermelhas",
        "Gengibre",
        "Suco de Limão",
        "Xarope Simples",
        "Club Soda",
        "Gelo",
      ],
    },

    // Boteco da Esquina
    {
      name: "Mojito",
      description:
        "Rum, hortelã, limão e soda. O drink cubano que conquista pelo frescor e pela simplicidade genial.",
      abv: 15,
      sweetness: 3,
      bitterness: 1,
      citrus: 4,
      strength: 2,
      categoryId: categories[3].id,
      establishmentId: establishments[2].id,
      ingredients: [
        "Rum",
        "Hortelã",
        "Suco de Limão",
        "Açúcar",
        "Club Soda",
        "Gelo",
      ],
    },
    {
      name: "Margarita",
      description:
        "Tequila, licor de laranja e limão com borda de sal. Mexicano, ácido e absolutamente viciante.",
      abv: 20,
      sweetness: 2,
      bitterness: 1,
      citrus: 5,
      strength: 3,
      categoryId: categories[0].id,
      establishmentId: establishments[2].id,
      ingredients: [
        "Tequila",
        "Licor de Laranja",
        "Suco de Limão",
        "Xarope Simples",
        "Gelo",
      ],
    },
    {
      name: "Caipirinha de Maracujá",
      description:
        "A evolução tropical da caipirinha clássica. Maracujá fresco com cachaça e açúcar demerara.",
      abv: 18,
      sweetness: 4,
      bitterness: 1,
      citrus: 4,
      strength: 3,
      categoryId: categories[3].id,
      establishmentId: establishments[2].id,
      ingredients: ["Cachaça", "Suco de Maracujá", "Açúcar", "Gelo"],
    },
    {
      name: "Gin Fizz com Mel",
      description:
        "Gin, limão, mel e clara de ovo. Textura aveludada e sabor delicado. Sofisticação em cada bolha.",
      abv: 16,
      sweetness: 3,
      bitterness: 2,
      citrus: 4,
      strength: 2,
      categoryId: categories[2].id,
      establishmentId: establishments[2].id,
      ingredients: [
        "Gin",
        "Suco de Limão",
        "Mel",
        "Club Soda",
        "Gelo",
      ],
    },
    {
      name: "Cuba Libre",
      description:
        "Rum, cola e limão. Simples, popular e eficiente. O drink que todo mundo conhece e ninguém recusa.",
      abv: 12,
      sweetness: 4,
      bitterness: 1,
      citrus: 2,
      strength: 2,
      categoryId: categories[3].id,
      establishmentId: establishments[2].id,
      ingredients: [
        "Rum",
        "Refrigerante de Cola",
        "Suco de Limão",
        "Gelo",
      ],
    },
    {
      name: "Sunset Mocktail",
      description:
        "Manga, maracujá e grenadine em camadas visuais. Zero álcool, 100% de impacto visual e sabor.",
      abv: 0,
      sweetness: 5,
      bitterness: 0,
      citrus: 3,
      strength: 0,
      categoryId: categories[5].id,
      establishmentId: establishments[2].id,
      ingredients: [
        "Manga",
        "Suco de Maracujá",
        "Grenadine",
        "Suco de Laranja",
        "Gelo",
      ],
    },
  ];

  for (const drinkData of drinksData) {
    const { ingredients: ingredientList, ...data } = drinkData;
    data.imageUrl = drinkImages[data.name] ? `/public/drinks/${drinkImages[data.name]}` : null;
    const drink = await prisma.drink.create({ data });

    for (const ingredientName of ingredientList) {
      await prisma.drinkIngredient.create({
        data: {
          drinkId: drink.id,
          ingredientId: ingredients[ingredientName].id,
        },
      });
    }
  }
  console.log(`✅ Created ${drinksData.length} drinks with ingredients`);

  // ─── Badges ───
  const badgesData = [
    {
      name: "Primeiro Gole",
      description: "Faça sua primeira avaliação de um drink.",
      criteria: JSON.stringify({ type: "review_count", value: 1 }),
    },
    {
      name: "Explorador Iniciante",
      description: "Avalie 5 drinks diferentes.",
      criteria: JSON.stringify({ type: "review_count", value: 5 }),
    },
    {
      name: "Mixologista",
      description: "Avalie 15 drinks diferentes.",
      criteria: JSON.stringify({ type: "review_count", value: 15 }),
    },
    {
      name: "Mestre dos Clássicos",
      description: "Avalie 3 drinks da categoria Clássicos.",
      criteria: JSON.stringify({
        type: "category_count",
        categoryName: "Clássicos",
        value: 3,
      }),
    },
    {
      name: "Viajante Tropical",
      description: "Avalie 3 drinks da categoria Tropicais.",
      criteria: JSON.stringify({
        type: "category_count",
        categoryName: "Tropicais",
        value: 3,
      }),
    },
    {
      name: "Amante do Gin",
      description: "Avalie 3 drinks à base de Gin.",
      criteria: JSON.stringify({
        type: "category_count",
        categoryName: "Gin-Based",
        value: 3,
      }),
    },
    {
      name: "Bar Hopper",
      description: "Avalie drinks em 3 estabelecimentos diferentes.",
      criteria: JSON.stringify({ type: "establishment_count", value: 3 }),
    },
    {
      name: "Crítico Exigente",
      description: "Escreva 5 avaliações com comentário de texto.",
      criteria: JSON.stringify({ type: "comment_count", value: 5 }),
    },
  ];

  for (const badge of badgesData) {
    await prisma.badge.create({ data: badge });
  }
  console.log(`✅ Created ${badgesData.length} badges`);

  // ─── Sample Reviews ───
  const allDrinks = await prisma.drink.findMany();

  const reviewsData = [
    {
      rating: 5,
      comment:
        "Negroni perfeito! Equilíbrio incrível entre o amargo do Campari e a doçura do vermute.",
      sweetness: 2,
      bitterness: 5,
      citrus: 1,
      strength: 4,
      userId: users[0].id,
      drinkId: allDrinks[0].id,
    },
    {
      rating: 4,
      comment: "Old Fashioned muito bem feito. Bourbon de qualidade!",
      sweetness: 2,
      bitterness: 3,
      citrus: 1,
      strength: 5,
      userId: users[0].id,
      drinkId: allDrinks[1].id,
    },
    {
      rating: 5,
      comment: "Melhor caipirinha da cidade. Cachaça de qualidade faz toda a diferença.",
      sweetness: 3,
      bitterness: 1,
      citrus: 5,
      strength: 4,
      userId: users[1].id,
      drinkId: allDrinks[2].id,
    },
    {
      rating: 4,
      comment: "Tropical Sunset é uma viagem! Muito saboroso e refrescante.",
      sweetness: 5,
      bitterness: 1,
      citrus: 3,
      strength: 2,
      userId: users[1].id,
      drinkId: allDrinks[5].id,
    },
    {
      rating: 3,
      comment: "Gin tônica ok, mas prefiro versões com mais sabor botânico.",
      sweetness: 1,
      bitterness: 3,
      citrus: 2,
      strength: 2,
      userId: users[2].id,
      drinkId: allDrinks[6].id,
    },
    {
      rating: 5,
      comment: "Berry Bliss sensacional! Provei que mocktails podem ser incríveis.",
      sweetness: 4,
      bitterness: 1,
      citrus: 3,
      strength: 0,
      userId: users[2].id,
      drinkId: allDrinks[9].id,
    },
    {
      rating: 4,
      comment: null,
      sweetness: 3,
      bitterness: 1,
      citrus: 4,
      strength: 2,
      userId: users[0].id,
      drinkId: allDrinks[10].id,
    },
    {
      rating: 5,
      comment: "Margarita com borda de sal perfeita. Voltarei muitas vezes!",
      sweetness: 2,
      bitterness: 1,
      citrus: 5,
      strength: 3,
      userId: users[1].id,
      drinkId: allDrinks[11].id,
    },
  ];

  for (const review of reviewsData) {
    await prisma.review.create({ data: review });
  }
  console.log(`✅ Created ${reviewsData.length} reviews`);

  // ─── Assign some badges ───
  const allBadges = await prisma.badge.findMany();

  // Maria has 3 reviews -> "Primeiro Gole" badge
  await prisma.userBadge.create({
    data: { userId: users[0].id, badgeId: allBadges[0].id },
  });
  // João has 3 reviews -> "Primeiro Gole" badge
  await prisma.userBadge.create({
    data: { userId: users[1].id, badgeId: allBadges[0].id },
  });
  // Ana has 2 reviews -> "Primeiro Gole" badge
  await prisma.userBadge.create({
    data: { userId: users[2].id, badgeId: allBadges[0].id },
  });

  console.log(`✅ Assigned initial badges`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
