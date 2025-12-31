import sharp from 'sharp';
import { join } from 'path';

const createIcon = async (size) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#000000"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="${size/3}" font-family="sans-serif" font-weight="bold">P</text>
  </svg>`;

  const filename = join(process.cwd(), 'public', `icon-${size}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(filename);

  console.log(`Created ${filename}`);
};

const sizes = [192, 512];

Promise.all(sizes.map(size => createIcon(size)))
  .then(() => console.log('All icons created successfully!'))
  .catch(err => console.error('Error creating icons:', err));
