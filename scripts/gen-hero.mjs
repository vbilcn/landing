import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const OUT = '/home/z/my-project/public/images/hero-landscape.png';

async function main() {
  const zai = await ZAI.create();
  const response = await zai.images.generations.create({
    prompt:
      'Cinematic wide shot of a futuristic hybrid renewable energy complex at dusk: rows of wind turbines on rolling hills, vast solar panel arrays in foreground, sleek industrial methanation plant with polished silver pipes and soft emerald-green glow in middle distance, deep navy-blue twilight sky, volumetric fog, dark moody high-tech atmosphere, photorealistic, dramatic rim lighting, teal and emerald accent lights, high quality, detailed',
    size: '1440x704',
  });
  const b64 = response.data[0].base64;
  fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
  console.log('saved', OUT, fs.statSync(OUT).size, 'bytes');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
