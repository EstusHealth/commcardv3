/* CommCard V3 - Export Module */
/* Generates branded 1080x1080 PNG cards for download */

const Export = (() => {
  const CARD_URL = 'https://www.estushealth.com';
  const W = 1080;
  const H = 1080;
  const MARGIN = 80;
  const FOOTER_H = 160;
  const FOOTER_TOP = H - FOOTER_H;

  /* Generate a QR code onto a canvas using qrcode.js library */
  const generateQRCanvas = (text, size) => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      try {
        const qr = new QRCode(container, {
          text,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });

        // qrcode.js renders asynchronously on some implementations
        setTimeout(() => {
          const img = container.querySelector('img') || container.querySelector('canvas');
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const ctx = tempCanvas.getContext('2d');

          if (img && img.tagName === 'IMG') {
            const image = new Image();
            image.onload = () => {
              ctx.drawImage(image, 0, 0, size, size);
              document.body.removeChild(container);
              resolve(tempCanvas);
            };
            image.onerror = () => {
              document.body.removeChild(container);
              resolve(null);
            };
            image.src = img.src;
          } else if (img && img.tagName === 'CANVAS') {
            ctx.drawImage(img, 0, 0, size, size);
            document.body.removeChild(container);
            resolve(tempCanvas);
          } else {
            document.body.removeChild(container);
            resolve(null);
          }
        }, 100);
      } catch (e) {
        if (document.body.contains(container)) document.body.removeChild(container);
        resolve(null);
      }
    });
  };

  /* Wrap text into lines that fit within maxWidth */
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  /* Choose a readable font size based on text length */
  const chooseFontSize = (text) => {
    const len = text.length;
    if (len <= 30) return 96;
    if (len <= 50) return 82;
    if (len <= 80) return 68;
    if (len <= 110) return 58;
    return 50;
  };

  /* Draw the card onto a canvas and return it */
  const buildCanvas = async (phrase, category) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background (category light colour)
    ctx.fillStyle = category.colorLight || '#F5F0E8';
    ctx.fillRect(0, 0, W, H);

    // Top accent bar
    ctx.fillStyle = category.color;
    ctx.fillRect(0, 0, W, 16);

    // Category emoji + label (top-left area)
    ctx.font = '600 32px Inter, sans-serif';
    ctx.fillStyle = category.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const catLabel = `${category.emoji}  ${category.label.toUpperCase()}`;
    ctx.fillText(catLabel, MARGIN, 70);

    // Phrase text - centered in the upper 75% of the card
    const textAreaTop = 130;
    const textAreaBottom = FOOTER_TOP - 40;
    const textAreaH = textAreaBottom - textAreaTop;
    const maxTextWidth = W - MARGIN * 2;

    let fontSize = chooseFontSize(phrase);
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    let lines = wrapText(ctx, phrase, maxTextWidth);

    // Reduce font size until it fits vertically
    while (lines.length * fontSize * 1.4 > textAreaH && fontSize > 36) {
      fontSize -= 4;
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      lines = wrapText(ctx, phrase, maxTextWidth);
    }

    const lineHeight = fontSize * 1.45;
    const totalTextH = lines.length * lineHeight;
    const textStartY = textAreaTop + (textAreaH - totalTextH) / 2 + fontSize * 0.8;

    ctx.fillStyle = '#1A0F0A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, textStartY + i * lineHeight);
    });

    // Footer background
    ctx.fillStyle = category.color;
    ctx.fillRect(0, FOOTER_TOP, W, FOOTER_H);

    // Footer text - Estus Health (left side)
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 44px Oswald, sans-serif';
    ctx.fillText('ESTUS HEALTH', MARGIN, FOOTER_TOP + 62);
    ctx.font = '400 26px Inter, sans-serif';
    ctx.globalAlpha = 0.85;
    ctx.fillText('Neuroaffirming Occupational Therapy', MARGIN, FOOTER_TOP + 100);
    ctx.fillText('www.estushealth.com', MARGIN, FOOTER_TOP + 136);
    ctx.globalAlpha = 1;

    // QR code (right side of footer)
    const QR_SIZE = 120;
    const qrX = W - MARGIN - QR_SIZE;
    const qrY = FOOTER_TOP + (FOOTER_H - QR_SIZE) / 2;

    // White background for QR
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 8, qrY - 8, QR_SIZE + 16, QR_SIZE + 16);

    // Attempt to render QR code
    if (typeof QRCode !== 'undefined') {
      try {
        const qrCanvas = await generateQRCanvas(CARD_URL, QR_SIZE);
        if (qrCanvas) {
          ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE);
        } else {
          // Fallback: draw placeholder
          drawQRPlaceholder(ctx, qrX, qrY, QR_SIZE);
        }
      } catch (e) {
        drawQRPlaceholder(ctx, qrX, qrY, QR_SIZE);
      }
    } else {
      drawQRPlaceholder(ctx, qrX, qrY, QR_SIZE);
    }

    return canvas;
  };

  /* Minimal QR placeholder if library not available */
  const drawQRPlaceholder = (ctx, x, y, size) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#000';
    // Top-left finder pattern
    ctx.fillRect(x + 4, y + 4, 28, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 8, 20, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 12, y + 12, 12, 12);
    // Top-right
    ctx.fillStyle = '#000';
    ctx.fillRect(x + size - 32, y + 4, 28, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + size - 28, y + 8, 20, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + size - 24, y + 12, 12, 12);
    // Bottom-left
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + size - 32, 28, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + size - 28, 20, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 12, y + size - 24, 12, 12);
    // Some data dots
    ctx.fillStyle = '#000';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 36 + i * 10, y + 36, 6, 6);
      ctx.fillRect(x + 36 + i * 10, y + 46, 6, 6);
      ctx.fillRect(x + 36, y + 56 + i * 10, 6, 6);
    }
  };

  /* Public: download a phrase card as PNG */
  const download = async (phrase, category) => {
    try {
      const canvas = await buildCanvas(phrase, category);
      const link = document.createElement('a');
      // Generate a filename from the first few words
      const slug = phrase.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 30);
      link.download = `commcard-${slug}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed:', e);
      alert('Sorry, the download could not be created. Please try again.');
    }
  };

  /* Public: build canvas for the card builder */
  const buildCustomCanvas = async (phrase, color, colorLight) => {
    const customCategory = {
      id: 'custom',
      label: 'My Card',
      emoji: '✨',
      color,
      colorLight,
      colorDark: color
    };
    return buildCanvas(phrase, customCategory);
  };

  return { download, buildCustomCanvas, buildCanvas };
})();
