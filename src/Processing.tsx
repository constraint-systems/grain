export function processLayer(canvas: HTMLCanvasElement, threshold: number) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const width = canvas.width;
  const height = canvas.height;

  function layerCount(value: number) {
    let power = 1;
    let count = 0;
    while (power < value) {
      power *= 2;
      count++;
    }
    return count;
  }

  const count = layerCount(Math.max(width, height));

  const cellSizes = [];
  for (let i = 1; i <= count; i++) {
    cellSizes.push(2 ** i);
  }

  const imageDataContainer = ctx.getImageData(0, 0, width, height);

  for (let cellSize of cellSizes) {
    let rows = Math.ceil(height / cellSize);
    let cols = Math.ceil(width / cellSize);

    const xOffset = Math.floor((cols * cellSize - width) / 2);
    const yOffset = Math.floor((rows * cellSize - height) / 2);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let totalCount = 0;
        for (let r = 0; r < cellSize; r++) {
          const actualY = row * cellSize + r - yOffset;
          const rowCheck = actualY >= 0 && actualY < height;
          for (let c = 0; c < cellSize; c++) {
            const actualX = col * cellSize + c - xOffset;
            const colCheck = actualX >= 0 && actualX < width;
            if (rowCheck && colCheck) {
              const idx = (actualY * width + actualX) * 4;
              totalR += imageDataContainer.data[idx];
              totalG += imageDataContainer.data[idx + 1];
              totalB += imageDataContainer.data[idx + 2];
              totalCount++;
            }
          }
        }
        const avgR = totalR / totalCount;
        const avgG = totalG / totalCount;
        const avgB = totalB / totalCount;
        let lossR = 0;
        let lossG = 0;
        let lossB = 0;
        let lossCount = 0;
        for (let r = 0; r < cellSize; r++) {
          const actualY = row * cellSize + r - yOffset;
          const rowCheck = actualY >= 0 && actualY < height;
          for (let c = 0; c < cellSize; c++) {
            const actualX = col * cellSize + c - xOffset;
            const colCheck = actualX >= 0 && actualX < width;
            if (rowCheck && colCheck) {
              const idx = (actualY * width + actualX) * 4;
              lossR += Math.abs(imageDataContainer.data[idx] - avgR);
              lossG += Math.abs(imageDataContainer.data[idx + 1] - avgG);
              lossB += Math.abs(imageDataContainer.data[idx + 2] - avgB);
              lossCount++;
            }
          }
        }
        const avgLossR = lossR / lossCount;
        const avgLossG = lossG / lossCount;
        const avgLossB = lossB / lossCount;
        const avgLoss = (avgLossR + avgLossG + avgLossB) / 3;
        if (avgLoss <= threshold) {
          for (let r = 0; r < cellSize; r++) {
            const actualY = row * cellSize + r - yOffset;
            const rowCheck = actualY >= 0 && actualY < height;
            for (let c = 0; c < cellSize; c++) {
              const actualX = col * cellSize + c - xOffset;
              const colCheck = actualX >= 0 && actualX < width;
              if (rowCheck && colCheck) {
                const idx = (actualY * width + actualX) * 4;
                imageDataContainer.data[idx] = avgR;
                imageDataContainer.data[idx + 1] = avgG;
                imageDataContainer.data[idx + 2] = avgB;
              }
            }
          }
        }
      }
    }
  }
  ctx.putImageData(imageDataContainer, 0, 0);
}
