/**
 * Gera variações de imagens em lote no mesmo diretório do arquivo original.
 * Saídas: -640, -1024, -1600, -1920, -2560, -3840 (em JPEG).
 * Mantém sRGB, qualidade alta e não estica imagens menores.
 *
 * Uso: node tools/generate-variants.js images
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = process.argv[2] || 'images';

// tamanhos
const GRID_WIDTHS = [640, 1024, 1600];
const HERO_WIDTHS = [1920, 2560, 3840];
const ALL_WIDTHS = [...new Set([...GRID_WIDTHS, ...HERO_WIDTHS])].sort((a,b)=>a-b);

// formatos aceitos
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

// config de saída
const JPEG_QUALITY = 86; // 82–90 é um ótimo range
const USE_MOZJPEG = true; // compressão melhor
const CHROMA_444 = false; // true = mais cor (arquivo maior)

// util
async function* walk(dir) {
  for (const d of await fsp.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function outName(srcPath, width) {
  const dir = path.dirname(srcPath);
  const ext = path.extname(srcPath).toLowerCase();
  const base = path.basename(srcPath, ext);
  // força .jpg na saída (nosso site usa .jpg nos nomes)
  return path.join(dir, `${base}-${width}.jpg`);
}

async function processOne(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) return;

  // pula arquivos que já são variantes (-640, -1024, etc.)
  if (/-\d{3,4}\.(jpe?g|png|webp)$/i.test(file)) return;

  const buf = await fsp.readFile(file);
  const img = sharp(buf, { failOn: 'none' });
  const meta = await img.metadata();

  const origW = meta.width || 0;
  const origH = meta.height || 0;
  if (!origW || !origH) {
    console.warn('Ignorando (sem dimensões):', file);
    return;
  }

  // garante espaço de cor sRGB
  const base = img.withMetadata().toColorspace('srgb');

  // gera cada largura sem esticar
  for (const w of ALL_WIDTHS) {
    if (w >= origW) {
      // não amplia além do original
      // se quiser permitir leve upscale para hero, comente o continue.
      continue;
    }

    const dest = outName(file, w);
    // se já existe e é mais novo que o original, pula
    try {
      const [statSrc, statOut] = await Promise.all([fsp.stat(file), fsp.stat(dest)]);
      if (statOut.mtimeMs > statSrc.mtimeMs) continue;
    } catch (_) {/* ok, segue e cria */ }

    await base
      .resize({ width: w, fit: 'inside', withoutEnlargement: true })
      .jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: USE_MOZJPEG,
        progressive: true,
        chromaSubsampling: CHROMA_444 ? '4:4:4' : '4:2:0'
      })
      .toFile(dest);

    console.log('✔', path.relative(process.cwd(), dest));
  }
}

(async () => {
  const root = path.resolve(INPUT_DIR);
  if (!fs.existsSync(root)) {
    console.error('Pasta não encontrada:', root);
    process.exit(1);
  }

  console.log('Gerando variantes em:', root);
  for await (const file of walk(root)) {
    try {
      await processOne(file);
    } catch (err) {
      console.error('Erro em', file, err.message);
    }
  }

  console.log('\nConcluído.\nDica: no site.js defina HAS_VARIANTS = true.');
})();
