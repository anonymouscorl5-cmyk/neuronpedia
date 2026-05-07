import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function main() {
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;

  // Configure HNSW vector search parameters
  try {
    await prisma.$executeRaw`ALTER DATABASE postgres SET hnsw.iterative_scan = relaxed_order`;
    await prisma.$executeRaw`ALTER DATABASE postgres SET hnsw.ef_search = 250`;
  } catch (error) {
    // ok if it fails
    console.error(error);
  }

  // ============= USERS =============
  // Nonuser account that is the default creator of models, sources, activations, etc when uploaded.
  const admin = await prisma.user.upsert({
    where: { id: 'clkht01d40000jv08hvalcvly' },
    update: {},
    create: {
      name: 'bot',
      id: 'clkht01d40000jv08hvalcvly',
      bot: true,
      admin: true,
      emailUnsubscribeCode: generateRandomString(32),
      emailNewsletterNotification: false,
      emailUnsubscribeAll: true,
    },
  });

  // Nonuser account that is the userId for inference search activations that are created by anonymous users.
  const privateSearchUser = await prisma.user.upsert({
    where: { id: 'cljgamm90000076zdchicy6zj' },
    update: {},
    create: {
      name: 'inferenceactivation',
      id: 'cljgamm90000076zdchicy6zj',
      bot: true,
      admin: false,
      emailUnsubscribeCode: generateRandomString(32),
      emailNewsletterNotification: false,
    },
  });

  console.log({ admin, privateSearchUser });

  // ============= LEWM ROBOT =============
  const modelId = 'lewm-robot';
  const sourceSetName = '0-encoder-stack';

  await prisma.model.upsert({
    where: { id: modelId },
    update: { layers: 18 },
    create: {
      id: modelId,
      displayName: 'LeWorldModel (Robot)',
      displayNameShort: 'LeWM',
      layers: 18,
      neuronsPerLayer: 12288,
      owner: 'AMI Labs',
      creatorId: admin.id,
      visibility: 'PUBLIC',
      inferenceEnabled: true,
    },
  });

  await prisma.sourceSet.upsert({
    where: { modelId_name: { modelId, name: sourceSetName } },
    update: { graphEnabled: true, hasGraphs: true },
    create: {
      modelId: modelId,
      name: sourceSetName,
      description: 'Layered Encoder Transcoders (L0-L11)',
      creatorId: admin.id,
      creatorName: 'Antigravity',
      visibility: 'PUBLIC',
      graphEnabled: true,
      hasGraphs: true,
    },
  });

  const host = await prisma.graphHostSource.upsert({
    where: { id: 'lewm-local-proxy' },
    update: { hostUrl: 'http://localhost:8000' },
    create: {
      id: 'lewm-local-proxy',
      name: 'Local Attribution Engine',
      hostUrl: 'http://localhost:8000',
      modelId: modelId,
    },
  });

  await prisma.graphHostSourceOnSourceSet.upsert({
    where: {
      sourceSetName_sourceSetModelId_graphHostSourceId: {
        sourceSetName,
        sourceSetModelId: modelId,
        graphHostSourceId: host.id,
      },
    },
    update: {},
    create: {
      sourceSetName,
      sourceSetModelId: modelId,
      graphHostSourceId: host.id,
    },
  });

  const scenarios = [
    {
      id: "grasp-success-1",
      name: "Grasp Success (Can)",
      prompt: "452:7",
      url: "http://localhost:8000/static/graphs/grasp-success-1.json",
    },
    {
      id: "grasp-fail-1",
      name: "Grasp Fail (Slipped)",
      prompt: "120:7",
      url: "http://localhost:8000/static/graphs/grasp-fail-1.json",
    },
    {
      id: "approach-can",
      name: "Approach Object",
      prompt: "800:7",
      url: "http://localhost:8000/static/graphs/approach-can.json",
    },
    {
      id: "pre-grasp-pos",
      name: "Pre-Grasp Alignment",
      prompt: "300:7",
      url: "http://localhost:8000/static/graphs/pre-grasp-pos.json",
    },
  ];

  for (const s of scenarios) {
    await prisma.graphMetadata.upsert({
      where: { modelId_slug: { modelId, slug: s.id } },
      update: { 
        prompt: s.prompt, 
        titlePrefix: s.name, 
        url: s.url,
        isFeatured: true, 
        promptTokens: ['Robotic', 'Frame'] 
      },
      create: {
        modelId,
        sourceSetName,
        slug: s.id,
        prompt: s.prompt,
        titlePrefix: s.name,
        url: s.url,
        userId: admin.id,
        isFeatured: true,
        promptTokens: ["Robotic", "Frame"],
      },
    });
  }

}


main()
  .then(async () => {
    console.log('Seeding complete');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
