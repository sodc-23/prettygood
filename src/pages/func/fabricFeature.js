import { fabric } from 'fabric';

export const loadFabricImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = function () {
      resolve(new fabric.Image(img));
    };

    img.onerror = function (err) {
      reject(new Error('Failed to load image: ' + url));
    };
  });
};

export const goldChromeGradient = (item) => {
  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: 0,
      y1: 0,
      x2: item.width,
      y2: item.height,
    },
    colorStops: [
      { offset: 0, color: '#fff9c4' },
      { offset: 1, color: '#cba135' },
    ],
  });
};

export const chromeSilverGradient = (item) => {
  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: 0,
      y1: 0,
      x2: item.width,
      y2: item.height,
    },
    colorStops: [
      { offset: 0, color: '#cccccc' },
      { offset: 1, color: '#ffffff' },
    ],
  });
};

export const rainbowGradient = (item) => {
  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: 0,
      y1: 0,
      x2: item.width,
      y2: item.height,
    },
    colorStops: [
      { offset: 0, color: '#e0f7fa' },
      { offset: 0.3, color: '#fce4ec' },
      { offset: 0.6, color: '#f3e5f5' },
      { offset: 1, color: '#e1f5fe' },
    ],
  });
};
