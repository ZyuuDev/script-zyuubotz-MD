import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function createAdzanImage(title, subtitle) {
    const width = 1182;
    const height = 756;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background color
    ctx.fillStyle = '#E87D0D';
    ctx.fillRect(0, 0, width, height);

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 100);

    ctx.font = '40px Arial';
    ctx.fillText(subtitle, width / 2, 170);

    // Load and draw silhouette image
    const image = await loadImage('./media/silhouette.png'); // Sesuaikan format file
    ctx.drawImage(image, 50, 250, 1082, 600);

    // Save to file
    fs.writeFileSync('./media/adzan.png', canvas.toBuffer('image/png'));
}

export default createAdzanImage;