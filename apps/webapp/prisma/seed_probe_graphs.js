/**
 * Register precomputed probe attribution graphs in GraphMetadata.
 *
 * docker compose exec webapp node prisma/seed_probe_graphs.js multiview_skeleton
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MODEL_ID = 'lewm-robot';
const SOURCE_SET = '0-encoder-stack';
const ADMIN_ID = 'clkht01d40000jv08hvalcvly';
const GRAPH_BASE_URL = process.env.PROBE_GRAPH_BASE_URL || 'http://localhost:8000/static/graphs';
const GRAPHS_DIR = path.join(__dirname, '../public/graphs/lewm-robot');
const LEGACY_SLUGS = new Set(['grasp-success-1', 'grasp-fail-1', 'approach-can', 'pre-grasp-pos']);

function parseVariantFilter(argv) {
  const flag = argv.find((a) => a.startsWith('--variant='));
  if (flag) return flag.split('=')[1];
  const positional = argv[2];
  return positional && !positional.startsWith('-') ? positional : null;
}

function titleFromMetadata(meta, filename) {
  const parts = [meta.variant, meta.scheme, meta.cluster, meta.role, meta.probe_id != null ? `pid${meta.probe_id}` : null].filter(Boolean);
  if (parts.length) return parts.join(' / ');
  return meta.title_prefix || filename;
}

/** Prefix-safe variant filter (multiview must not match multiview_skeleton_*). */
const VARIANT_PREFIX_EXCLUDES = {
  multiview: ['multiview_skeleton'],
  multiview_skeleton: ['multiview_skeleton_dino'],
};

function matchesVariantFilter(filename, variantFilter) {
  if (!variantFilter) return true;
  if (!filename.startsWith(`${variantFilter}_`)) return false;
  for (const longer of VARIANT_PREFIX_EXCLUDES[variantFilter] || []) {
    if (filename.startsWith(`${longer}_`)) return false;
  }
  return true;
}

async function main() {
  const variantFilter = parseVariantFilter(process.argv);
  const files = fs
    .readdirSync(GRAPHS_DIR)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.nodes.json'))
    .filter((f) => !LEGACY_SLUGS.has(f.replace(/\.json$/, '')))
    .filter((f) => matchesVariantFilter(f, variantFilter))
    .sort();

  if (!files.length) {
    console.error(`No graph JSON files under ${GRAPHS_DIR}${variantFilter ? ` (variant=${variantFilter})` : ''}`);
    process.exit(1);
  }

  let seeded = 0;
  for (const filename of files) {
    const filePath = path.join(GRAPHS_DIR, filename);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const meta = raw.metadata || {};
    const slug = filename.replace(/\.json$/, '');
    const prompt = meta.prompt || `probe:${meta.probe_id ?? '?'}`;
    const titlePrefix = titleFromMetadata(meta, slug);
    const url = `${GRAPH_BASE_URL.replace(/\/$/, '')}/${filename}`;

    await prisma.graphMetadata.upsert({
      where: { modelId_slug: { modelId: MODEL_ID, slug } },
      update: { prompt, titlePrefix, url, sourceSetName: SOURCE_SET, isFeatured: false },
      create: {
        modelId: MODEL_ID,
        sourceSetName: SOURCE_SET,
        slug,
        prompt,
        titlePrefix,
        url,
        userId: ADMIN_ID,
        isFeatured: false,
        promptTokens: meta.prompt_tokens || ['Robotic', 'Frame'],
      },
    });
    seeded += 1;
  }

  console.log(`Seeded ${seeded} graph(s) for ${MODEL_ID}${variantFilter ? ` (${variantFilter})` : ''}`);
  console.log(`Example: http://localhost:3000/${MODEL_ID}/graph?slug=${files[0].replace(/\.json$/, '')}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
