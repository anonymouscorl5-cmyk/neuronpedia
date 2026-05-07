import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modelId = 'lewm-robot';
  const creatorId = 'clkht01d40000jv08hvalcvly'; // Default bot user

  console.log('Registering LeWM Model...');

  // 1. Create Model
  const model = await prisma.model.upsert({
    where: { id: modelId },
    update: {},
    create: {
      id: modelId,
      displayName: 'LeWorldModel (Robot)',
      displayNameShort: 'LeWM',
      layers: 12,
      neuronsPerLayer: 12288,
      owner: 'AMI Labs',
      creatorId: creatorId,
      visibility: 'PUBLIC',
      inferenceEnabled: true,
    },
  });

  // 2. Create SourceSet
  const sourceSetName = 'encoder-stack';
  const sourceSet = await prisma.sourceSet.upsert({
    where: { modelId_name: { modelId, name: sourceSetName } },
    update: {},
    create: {
      modelId: modelId,
      name: sourceSetName,
      description: 'Layered Encoder Transcoders (L0-L11)',
      creatorId: creatorId,
      creatorName: 'Antigravity',
      visibility: 'PUBLIC',
    },
  });

  // 3. Create Sources (Layers)
  for (let l = 0; l < 12; l++) {
    const layerId = `layer-${l}`;
    await prisma.source.upsert({
      where: { modelId_id: { modelId, id: layerId } },
      update: {},
      create: {
        modelId: modelId,
        id: layerId,
        setName: sourceSetName,
        creatorId: creatorId,
        visibility: 'PUBLIC',
      },
    });
    console.log(`Registered Layer ${l}`);
  }

  console.log('Registration Complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
