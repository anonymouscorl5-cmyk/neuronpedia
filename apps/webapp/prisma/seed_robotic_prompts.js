const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const modelId = 'lewm-robot';
  const sourceSetName = 'encoder-stack';
  const creatorId = 'clkht01d40000jv08hvalcvly';

  console.log('--- Seeding Robotic Prompts (JS version) ---');

  // 1. Ensure Host
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

  // Link
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

  // Enable
  await prisma.sourceSet.update({
    where: { modelId_name: { modelId, name: sourceSetName } },
    data: { graphEnabled: true, hasGraphs: true },
  });

  // Scenarios
  const scenarios = [
    { slug: 'grasp-success-1', prompt: '452', title: 'Grasp Success (Can)' },
    { slug: 'grasp-fail-1', prompt: '120', title: 'Grasp Failure (Missed)' },
    { slug: 'approach-can', prompt: '800', title: 'Approaching Target' },
    { slug: 'pre-grasp-pos', prompt: '300', title: 'Pre-Grasp Alignment' },
  ];

  for (const s of scenarios) {
    await prisma.graphMetadata.upsert({
      where: { modelId_slug: { modelId, slug: s.slug } },
      update: { prompt: s.prompt, titlePrefix: s.title },
      create: {
        modelId,
        sourceSetName,
        slug: s.slug,
        prompt: s.prompt,
        titlePrefix: s.title,
        url: '',
        userId: creatorId,
      },
    });
    console.log(`✅ Seeded: ${s.title}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
