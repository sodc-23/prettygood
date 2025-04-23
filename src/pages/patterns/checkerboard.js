import { fabric } from 'fabric';

export const Checkerboard = (width, height, size = 15) => {
  const canvas = new fabric.Canvas('checkerboard');
  canvas.setWidth(width);
  canvas.setHeight(height);
  const squareSize = size;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  for (let y = 0; y < canvasHeight; y += squareSize) {
    for (let x = 0; x < canvasWidth; x += squareSize) {
      let color =
        (x / squareSize + y / squareSize) % 2 === 0 ? 'gray' : 'white';

      // Create a square object
      const square = new fabric.Rect({
        left: x,
        top: y,
        fill: color,
        width: squareSize,
        height: squareSize,
      });

      canvas.add(square);
    }
  }
  const imageUrl = canvas.toDataURL({
    format: 'png',
  });

  return imageUrl;
};
