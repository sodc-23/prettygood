import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UploadModal from './upload_modal';
import EditTool from './edit_tool/index';
import { removeBackground } from './func/removeBackground';
import { detectFace } from './func/detectFace';
import { Checkerboard } from './patterns/checkerboard';
import {
  loadFabricImage,
  goldChromeGradient,
  chromeSilverGradient,
  rainbowGradient,
} from './func/fabricFeature';

const Index = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  const fabricImage = useRef(null);
  const fabricRect = useRef(null);
  const fabricCircle = useRef(null);
  const fabricMask = useRef(null);

  const dropdownRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [widthSize, setWidthSize] = useState(250);
  const [heightSize, setHeightSize] = useState(250);
  const [quantity, setQuantity] = useState(10);
  const [border, setBorder] = useState(10);
  const [canvasColor, setCanvasColor] = useState('#fff');
  const [canvasShape, setCanvasShape] = useState('rect');
  const [canvasRound, setCanvasRound] = useState(16);
  const [canvasMaterial, setCanvasMaterial] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [mark1Left, setMark1Left] = useState(0);
  const [mark1Top, setMark1Top] = useState(0);
  const [mark2Left, setMark2Left] = useState(0);
  const [mark2Top, setMark2Top] = useState(0);

  const [fullWidth, setFullWidth] = useState(
    document.documentElement.clientWidth - 20
  );
  const [fullHeight, setFullHeight] = useState(
    isMobile
      ? document.documentElement.clientHeight - 260
      : document.documentElement.clientHeight - 120
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isShapeOpen, setIsShapeOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    window.addEventListener('resize', () => {
      setFullWidth(document.documentElement.clientWidth - 20);
      setFullHeight(
        isMobile
          ? document.documentElement.clientHeight - 260
          : document.documentElement.clientHeight - 120
      );
    });

    return () => {
      window.removeEventListener('resize', () => {
        setFullWidth(document.documentElement.clientWidth - 20);
        setFullHeight(
          isMobile
            ? document.documentElement.clientHeight - 260
            : document.documentElement.clientHeight - 120
        );
      });
      document.removeEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    };
  }, []);

  const renderCanvas = useCallback(
    async (url) => {
      if (!url && !fabricImage.current) {
        return;
      }
      if (!fabricCanvas.current) {
        fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
          backgroundColor: '#f3f4f4',
        });
      }

      fabricCanvas.current.setWidth(fullWidth);
      fabricCanvas.current.setHeight(fullHeight);

      fabricCanvas.current.clear();

      if (!fabricImage.current) {
        fabricImage.current = await loadFabricImage(url);
        fabricImage.current.set({
          left: fullWidth / 2,
          top: fullHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: widthSize / fabricImage.current.width,
          scaleY: widthSize / fabricImage.current.width,
          selectable: true,
        });
      }

      if (!fabricRect.current) {
        fabricRect.current = new fabric.Rect({
          left: fullWidth / 2,
          top: fullHeight / 2,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
          selectable: true,
          width: 250 + 2 * border,
          height:
            (250 / fabricImage.current.width) * fabricImage.current.height +
            2 * border,
        });
      } else {
        fabricRect.current.set({
          scaleX: 1,
          scaleY: 1,
          width: widthSize + 2 * border,
          height: heightSize + 2 * border,
        });
      }
      if (!fabricCircle.current) {
        fabricCircle.current = new fabric.Ellipse({
          left: fullWidth / 2,
          top: fullHeight / 2,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
          selectable: true,
          rx: 135,
          ry: 135,
        });
      } else {
        fabricCircle.current.set({
          scaleX: 1,
          scaleY: 1,
          rx: Math.round((widthSize + 10) / 2),
          ry: Math.round((heightSize + 10) / 2),
        });
      }

      let maskFillColor = canvasColor;
      switch (canvasMaterial) {
        case 'gold-chrome':
          maskFillColor = goldChromeGradient(fabricRect.current);
          break;
        case 'chrome-silver':
          maskFillColor = chromeSilverGradient(fabricRect.current);
          break;
        case 'rainbow holographic':
          maskFillColor = rainbowGradient(fabricRect.current);
          break;
        default:
          maskFillColor = canvasColor;
          break;
      }
      let canvasBack;
      let canvasBackGroup;

      if (canvasShape === 'circle') {
        canvasBack = new fabric.Ellipse({
          left: fabricCircle.current
            ? fabricCircle.current.left
            : fullWidth / 2,
          top: fabricCircle.current ? fabricCircle.current.top : fullHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          fill: canvasColor,
          rx: fabricCircle.current ? fabricCircle.current.rx : 135,
          ry: fabricCircle.current ? fabricCircle.current.ry : 135,
          scaleX: fabricCircle.current ? fabricCircle.current.scaleX : 1,
          scaleY: fabricCircle.current ? fabricCircle.current.scaleY : 1,
          angle: fabricCircle.current ? fabricCircle.current.angle : 0,
        });
      } else {
        canvasBack = new fabric.Rect({
          left: fabricRect.current ? fabricRect.current.left : fullWidth / 2,
          top: fabricRect.current ? fabricRect.current.top : fullHeight / 2,
          originX: 'center',
          originY: 'center',
          width: fabricRect.current
            ? fabricRect.current.width
            : widthSize + 2 * border,
          height: fabricRect.current
            ? fabricRect.current.height
            : heightSize + 2 * border,
          fill: canvasColor,
          scaleX: fabricRect.current ? fabricRect.current.scaleX : 1,
          scaleY: fabricRect.current ? fabricRect.current.scaleY : 1,
          angle: fabricRect.current ? fabricRect.current.angle : 0,
        });
      }
      setMark1Left(canvasBack.left);
      setMark1Top(
        canvasBack.top - (canvasBack.height * canvasBack.scaleY) / 2 - 40
      );
      setMark2Left(
        canvasBack.left + (canvasBack.width * canvasBack.scaleX) / 2 + 40
      );
      setMark2Top(canvasBack.top);

      if (canvasMaterial === 'transparent') {
        fabricMask.current = await loadFabricImage(
          Checkerboard(
            canvasBack.width * canvasBack.scaleX,
            canvasBack.height * canvasBack.scaleY
          )
        );
        fabricMask.current.set({
          left: canvasBack.left,
          top: canvasBack.top,
          originX: 'center',
          originY: 'center',
          scaleX: canvasBack.scaleX,
          scaleY: canvasBack.scaleY,
          width: canvasBack.width,
          height: canvasBack.height,
        });
      } else {
        fabricMask.current = new fabric.util.object.clone(canvasBack);
        fabricMask.current.set({
          fill: maskFillColor,
          opacity: 0.5,
        });
      }

      canvasBackGroup = new fabric.Group([canvasBack, fabricMask.current], {
        left: canvasBack.left,
        top: canvasBack.top,
        width: canvasBack.width,
        height: canvasBack.height,
        scaleX: canvasBack.scaleX,
        scaleY: canvasBack.scaleY,
        originX: 'center',
        originY: 'center',
      });

      //canas shape update
      if (canvasShape === 'circle') {
        fabricImage.current.set({ clipPath: fabricCircle.current });
        canvasBackGroup.set({ clipPath: fabricCircle.current });
      } else if (canvasShape === 'die') {
        const left = fabricRect.current
          ? fabricRect.current.left
          : fullWidth / 2;
        const top = fabricRect.current
          ? fabricRect.current.top
          : fullHeight / 2;

        fabricImage.current.set({
          clipPath: null,
          left: left,
          top: top,
        });

        const bgRect = new fabric.Rect({
          left: left,
          top: top,
          width: fabricRect.current.width * fabricRect.current.scaleX,
          height: fabricRect.current.height * fabricRect.current.scaleY,
          originX: 'center',
          originY: 'center',
          strokeWidth: 0,
          fill: canvasColor,
        });

        const clonedImage = new fabric.util.object.clone(fabricImage.current);
        const scaleX =
          (fabricRect.current.width * fabricRect.current.scaleX) /
          fabricImage.current.width;
        const scaleY =
          (fabricRect.current.height * fabricRect.current.scaleY) /
          fabricImage.current.height;
        clonedImage.set({
          scaleX: scaleX,
          scaleY: scaleY,
        });

        const group = new fabric.Group([clonedImage, bgRect], {
          left: left,
          top: top,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        bgRect.set({
          clipPath: clonedImage,
        });

        canvasBack = group;
        if (canvasMaterial === 'transparent') {
          fabricMask.current = await loadFabricImage(
            Checkerboard(
              canvasBack.width * canvasBack.scaleX,
              canvasBack.height * canvasBack.scaleY
            )
          );
          fabricMask.current.set({
            left: canvasBack.left,
            top: canvasBack.top,
            originX: 'center',
            originY: 'center',
            scaleX: 1,
            scaleY: 1,
            width: canvasBack.width,
            height: canvasBack.height,
            clipPath: clonedImage,
          });
        } else {
          fabricMask.current = new fabric.Rect({
            left: left,
            top: top,
            width: fabricRect.current.width * fabricRect.current.scaleX,
            height: fabricRect.current.height * fabricRect.current.scaleY,
            originX: 'center',
            originY: 'center',
            strokeWidth: 0,
            fill: maskFillColor,
            opacity: 0.5,
          });
        }
        canvasBackGroup = new fabric.Group([canvasBack, fabricMask.current], {
          left: canvasBack.left,
          top: canvasBack.top,
          width: canvasBack.width,
          height: canvasBack.height,
          scaleX: canvasBack.scaleX,
          scaleY: canvasBack.scaleY,
          originX: 'center',
          originY: 'center',
        });
        fabricMask.current.set({
          clipPath: canvasBack,
        });
        fabricImage.current.set({ clipPath: fabricRect.current });
      } else {
        if (canvasShape === 'rounded') {
          fabricRect.current.set({
            rx: canvasRound,
            ry: canvasRound,
          });
        } else {
          fabricRect.current.set({ rx: 0, ry: 0 });
        }
        fabricImage.current.set({ clipPath: fabricRect.current });
        canvasBackGroup.set({ clipPath: fabricRect.current });
      }

      fabricCanvas.current.insertAt(canvasBackGroup, 0);

      canvasBackGroup.on('modified', () => {
        if (canvasShape === 'circle') {
          fabricCircle.current.set({
            left: canvasBackGroup.left,
            top: canvasBackGroup.top,
            scaleX: canvasBackGroup.scaleX,
            scaleY: canvasBackGroup.scaleY,
            angle: canvasBackGroup.angle,
          });
        } else {
          fabricRect.current.set({
            left: canvasBackGroup.left,
            top: canvasBackGroup.top,
            scaleX: canvasBackGroup.scaleX,
            scaleY: canvasBackGroup.scaleY,
            angle: canvasBackGroup.angle,
          });
        }
        setMark1Left(canvasBackGroup.left);
        setMark1Top(
          canvasBackGroup.top -
            (canvasBackGroup.height * canvasBackGroup.scaleY) / 2 -
            40
        );
        setMark2Left(
          canvasBackGroup.left +
            (canvasBackGroup.width * canvasBackGroup.scaleX) / 2 +
            40
        );
        setMark2Top(canvasBackGroup.top);
        setWidthSize(
          Math.round(
            canvasBackGroup.width * canvasBackGroup.scaleX - 2 * border
          )
        );
        setHeightSize(
          Math.round(
            canvasBackGroup.height * canvasBackGroup.scaleY - 2 * border
          )
        );
        fabricCanvas.current.requestRenderAll();
      });

      fabricCanvas.current.add(fabricImage.current);
      fabricCanvas.current.renderAll();
    },
    [
      border,
      canvasMaterial,
      canvasShape,
      fullHeight,
      fullWidth,
      canvasColor,
      canvasRound,
      widthSize,
      heightSize,
    ]
  );

  useEffect(() => {
    if (
      fileUrl &&
      border &&
      canvasRound &&
      canvasColor &&
      canvasMaterial &&
      widthSize &&
      heightSize
    ) {
      setIsModalOpen(false);
      renderCanvas(fileUrl);
    }
  }, [
    fileUrl,
    border,
    canvasRound,
    canvasColor,
    canvasMaterial,
    widthSize,
    heightSize,
  ]);

  useEffect(() => {
    if (fabricImage.current && fabricRect.current && fabricCircle.current) {
      if (canvasShape === 'circle') {
        setWidthSize(250);
        setHeightSize(250);
      } else {
        setWidthSize(250);
        setHeightSize(
          Math.round(
            (250 / fabricImage.current.width) * fabricImage.current.height
          )
        );
      }
      fabricRect.current = null;
      fabricCircle.current = null;
      fabricImage.current.set({
        scaleX: 250 / fabricImage.current.width,
        scaleY: 250 / fabricImage.current.width,
        left: fullWidth / 2,
        top: fullHeight / 2,
      });
      renderCanvas();
    }
  }, [canvasShape, fullWidth, fullHeight]);

  const downloadCanvasImage = useCallback(
    (param) => {
      const canvas = new fabric.Canvas('canvas', {
        width: Math.round(widthSize) + 2 * Math.round(border),
        height: Math.round(heightSize) + 2 * Math.round(border),
        backgroundColor: null,
      });
      fabricRect.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      fabricCircle.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      fabricImage.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      renderCanvas();

      if (canvasMaterial === 'transparent') {
        fabricCanvas.current.clear();
        fabricCanvas.current.add(fabricImage.current);
        fabricCanvas.current.renderAll();
      }

      const originalDataUrl = fabricCanvas.current.toDataURL({
        format: 'png',
      });

      fabric.Image.fromURL(originalDataUrl, (img) => {
        img.set({
          left: Math.round(widthSize / 2) + Math.round(border),
          top: Math.round(heightSize / 2) + Math.round(border),
          originX: 'center',
          originY: 'center',
        });
        canvas.add(img);
        canvas.renderAll();
        const dataUrl = canvas.toDataURL({
          format: 'png',
        });

        if (param === 'png') {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${new Date().getTime()}.png`;
          link.click();
        } else if (param === 'pdf') {
          const margin = 10;
          const pdf = new jsPDF();

          const pageWidth = pdf.internal.pageSize.getWidth();
          const usableWidth = pageWidth - margin * 2;

          const ratio = canvas.height / canvas.width;
          const scaledHeight = usableWidth * ratio;

          pdf.addImage(
            dataUrl,
            'PNG',
            margin,
            margin,
            usableWidth,
            scaledHeight
          );
          pdf.save(`${new Date().getTime()}.pdf`);
        } else {
          const svgData = canvas.toSVG();

          const blob = new Blob([svgData], { type: 'application/postscript' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `${new Date().getTime()}.eps`;
          link.click();

          URL.revokeObjectURL(url);
        }
      });
    },
    [canvasMaterial, border, canvasShape, widthSize, fileUrl, canvasColor]
  );

  const removalBackground = useCallback(async () => {
    setLoading(true);
    const canvas = new fabric.Canvas('canvas', {
      width: Math.round(widthSize) + 2 * Math.round(border),
      height: Math.round(heightSize) + 2 * Math.round(border),
      backgroundColor: null,
    });

    fabricCanvas.current.clear();
    fabricRect.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
    fabricCircle.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
    fabricImage.current.set({ left: fullWidth / 2, top: fullHeight / 2 });

    fabricCanvas.current.add(fabricImage.current);
    fabricCanvas.current.renderAll();
    const originalDataUrl = fabricCanvas.current.toDataURL({
      format: 'png',
    });

    fabric.Image.fromURL(originalDataUrl, async (img) => {
      if (canvasShape === 'circle') {
        canvas.setWidth(
          fabricCircle.current.width * fabricCircle.current.scaleX
        );
        canvas.setHeight(
          fabricCircle.current.height * fabricCircle.current.scaleY
        );
      } else {
        canvas.setWidth(fabricRect.current.width * fabricRect.current.scaleX);
        canvas.setHeight(fabricRect.current.height * fabricRect.current.scaleY);
      }
      img.set({
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(img);
      canvas.renderAll();
      const dataUrl = canvas.toDataURL({
        format: 'png',
      });

      const cleanImageUrl = await removeBackground(dataUrl);
      setLoading(false);
      try {
        const updatedImg = await loadFabricImage(cleanImageUrl);
        updatedImg.set({
          left: fullWidth / 2,
          top: fullHeight / 2,
          originX: 'center',
          originY: 'center',
        });
        fabricCanvas.current.clear();
        fabricImage.current = updatedImg;
      } catch (err) {
        toast('Failed to remove background', {
          style: {
            backgroundColor: '#fb6944',
            color: 'white',
            ofontSize: '12px',
            fntFamily: 'Sans-serif',
          },
        });
      } finally {
        if (canvasShape === 'die') {
          fabricImage.current.set({
            scaleX: widthSize / fabricImage.current.width,
            scaleY: heightSize / fabricImage.current.height,
          });
          renderCanvas(fileUrl);
        } else {
          setCanvasShape('die');
        }
      }
    });
  }, [border, canvasShape, widthSize, fullWidth, fullHeight]);

  const originalImage = useCallback(() => {
    if (fileUrl) {
      setWidthSize(250);
      setHeightSize(
        Math.round(
          (250 / fabricImage.current.width) * fabricImage.current.height
        )
      );

      fabricImage.current = null;
      fabricRect.current = null;
      fabricCircle.current = null;
      setBorder(10);
      setCanvasColor('#fff');
      setCanvasRound(16);
      setCanvasMaterial('premium');
      setCanvasShape('rect');
      renderCanvas(fileUrl);
    }
  }, [fileUrl]);

  const cutFace = useCallback(async () => {
    if (fabricCanvas.current && fabricImage.current) {
      setLoading(true);

      fabricCanvas.current.clear();
      fabricCanvas.current.add(fabricImage.current);
      fabricCanvas.current.renderAll();
      const originalDataUrl = fabricCanvas.current.toDataURL({
        format: 'png',
      });

      const image = new Image();

      image.onload = async () => {
        const detections = await detectFace(image);
        setLoading(false);

        if (
          !detections ||
          !Array.isArray(detections) ||
          detections.length === 0
        ) {
          toast('No face detected! Please retry with another picture.', {
            style: {
              backgroundColor: '#fb6944',
              color: 'white',
              fontSize: '12px',
              fontFamily: 'Sans-serif',
            },
          });
          if (fileUrl) {
            renderCanvas(fileUrl);
          }
        }

        detections.forEach((detection) => {
          const box = detection.detection.box;

          const scaledWidth =
            fabricImage.current.width * fabricImage.current.scaleX;
          const scaledHeight =
            fabricImage.current.height * fabricImage.current.scaleY;

          // Get top-left corner of the image in canvas space
          const imageLeft = fabricImage.current.left - scaledWidth / 2;
          const imageTop = fabricImage.current.top - scaledHeight / 2;
          const cropX = (box.x - imageLeft) / fabricImage.current.scaleX;
          const cropY = (box.y - imageTop) / fabricImage.current.scaleY;
          const width = box.width / fabricImage.current.scaleX;
          const height = box.height / fabricImage.current.scaleY;
          const maxValue = Math.max(width, height);
          const cropped = new fabric.Image(fabricImage.current.getElement(), {
            left: fullWidth / 2,
            top: fullHeight / 2,
            cropX:
              maxValue > width
                ? Math.round(cropX - (maxValue - width) / 2)
                : cropX,
            cropY: cropY,
            width: Math.round(maxValue),
            height: Math.round(maxValue),
            scaleX: fabricImage.current.scaleX,
            scaleY: fabricImage.current.scaleY,
            originX: 'center',
            originY: 'center',
          });

          fabricImage.current = cropped;

          if (canvasShape === 'die') {
            if (fileUrl) {
              fabricImage.current.set({
                scaleX: widthSize / fabricImage.current.width,
                scaleY: heightSize / fabricImage.current.height,
              });
              renderCanvas(fileUrl);
            }
          } else {
            setCanvasShape('die');
          }
        });
      };
      image.src = originalDataUrl;
    }
  }, [fullHeight, fullWidth, canvasShape, fileUrl]);

  const centerHorizontal = useCallback(() => {
    let left = fullWidth / 2;
    if (canvasShape === 'circle' && fabricCircle.current) {
      left = fabricCircle.current.left;
    }
    if (canvasShape !== 'circle' && fabricRect.current) {
      left = fabricRect.current.left;
    }
    fabricImage.current.set('left', left);
    fabricCanvas.current.renderAll();
  }, [fullWidth, canvasShape]);

  const centerVertical = useCallback(() => {
    let top = fullHeight / 2;
    if (canvasShape === 'circle' && fabricCircle.current) {
      top = fabricCircle.current.top;
    }
    if (canvasShape !== 'circle' && fabricRect.current) {
      top = fabricRect.current.top;
    }
    fabricImage.current.set('top', top);
    fabricCanvas.current.renderAll();
  }, [fullHeight, canvasShape]);

  const matchingSize = useCallback(() => {
    let scaleX, scaleY;
    if (canvasShape === 'circle') {
      scaleX =
        (2 * fabricCircle.current.rx * fabricCircle.current.scaleX - 20) /
        fabricImage.current.width;
      scaleY =
        (2 * fabricCircle.current.ry * fabricCircle.current.scaleY - 20) /
        fabricImage.current.width;
    } else {
      scaleX =
        (fabricRect.current.width * fabricRect.current.scaleX - 2 * border) /
        fabricImage.current.width;
      scaleY =
        (fabricRect.current.height * fabricRect.current.scaleY - 2 * border) /
        fabricImage.current.height;
    }
    fabricImage.current.set({ scaleX, scaleY });
    fabricCanvas.current.renderAll();
  }, [canvasShape]);

  const flipX = useCallback(() => {
    fabricImage.current.set('flipX', !fabricImage.current.flipX);
    fabricCanvas.current.renderAll();
  }, []);

  const flipY = useCallback(() => {
    fabricImage.current.set('flipY', !fabricImage.current.flipY);
    fabricCanvas.current.renderAll();
  }, []);

  const resetRotate = useCallback(() => {
    fabricImage.current.set('angle', 0);
    fabricCanvas.current.renderAll();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="w-screen relative min-h-screen bg-[#f3f4f4]">
        {loading && (
          <div className="absolute h-screen w-screen z-[999] bg-[rgba(0,0,0,0.3)]">
            <div className="loader"></div>
          </div>
        )}

        <div className="flex justify-center w-full relative text-green-400 font-bold mb-4">
          {fileUrl && (
            <>
              <p
                className="absolute"
                style={{
                  left: `${mark1Left}px`,
                  top: `${mark1Top}px`,
                }}
              >
                {widthSize + 2 * border}
              </p>
              <p
                className="absolute"
                style={{
                  left: `${mark2Left}px`,
                  top: `${mark2Top}px`,
                }}
              >
                {heightSize + 2 * border}
              </p>
            </>
          )}
          <canvas ref={canvasRef} />
        </div>

        <UploadModal
          isOpen={isModalOpen}
          setFileUrl={setFileUrl}
          setHeightSize={setHeightSize}
        />

        <div className="fixed left-0 bottom-0 w-full h-[260px] md:h-[120px] bg-white">
          <div className="md:flex mx-4">
            <div className="flex">
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => centerHorizontal()}
              >
                <img
                  data-v-035f8230=""
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzQuMzc0IiBoZWlnaHQ9IjM0LjM3NCIgdmlld0JveD0iMCAwIDM0LjM3NCAzNC4zNzQiPjxpbWFnZSB3aWR0aD0iMzQuMzc0IiBoZWlnaHQ9IjM0LjM3NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzQuMzc0KSByb3RhdGUoOTApIiBvcGFjaXR5PSIwLjYwNCIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFHUUFBQUJrQ0FNQUFBQkhQR1ZtQUFBQU5sQk1WRVZIY0V3QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURBUjJMVkFBQUFFWFJTVGxNQThUTTRKdTd5OERldDdUSXN0N0g1S3RaM0NFWUFBQUU1U1VSQlZHamU3ZGpCRW9NZ0RBUlFvU3JTYXBYLy85bXFxTVdLcDJaMzJqRjc4dlltNEVCSVVXaitQYVd2YTErQ2pTcU1xYkNLRDNNOEZERVJNVkFrTEZGRUVVVVVVVVNSU3lOYmo1SWcwbjFMN0ZGY2t5S05FKzVibGg1bFZEWWtHcEo5eTlLampNcUtySVpnMzdJaXdSMCtqUFJ5NWVLRk56NFh5WWIxY2M4YjB3OG5sMjJqZ1VhK0Zta2pwOGdieHhWREdKKzFZSXg5TFNnalZYREdXMEVhcTRJMW9vSTJwbjhNYjR5MUVJemZuNWdFUUhiZHpQbWw5RzJTUzgwSFdQeXhVWkNQNFNLVTVhSnNQT1VYdm1nWUI2U3QzQTFlaCtOY2pKd3JudE9zSUJXYkhBeW8zYmU3d3dlak1CcHVlemhFNVd1eG1ZTmFXbUU4NSt6SmhTTlpDK1dKVFJrV1VNWWVsQUVPWlJSRkdhcFJ4b002c2xWRUVVVVV1UkN5UEpKcktQS015Qk9LREhOUFlRYnNlNjd0K3I1ckN3MHdML1ZwYk1jLzhSZjZBQUFBQUVsRlRrU3VRbUNDIi8+PC9zdmc+"
                  draggable="false"
                  width={25}
                  alt="horizontal center"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => centerVertical()}
              >
                <img
                  data-v-035f8230=""
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzQuMzc0IiBoZWlnaHQ9IjM0LjM3NCIgdmlld0JveD0iMCAwIDM0LjM3NCAzNC4zNzQiPjxpbWFnZSB3aWR0aD0iMzQuMzc0IiBoZWlnaHQ9IjM0LjM3NCIgb3BhY2l0eT0iMC42MDQiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBR1FBQUFCa0NBTUFBQUJIUEdWbUFBQUFObEJNVkVWSGNFd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQVIyTFZBQUFBRVhSU1RsTUE4VE00SnU3eThEZXQ3VElzdDdINUt0WjNDRVlBQUFFNVNVUkJWR2plN2RqQkVvTWdEQVJRb1NyU2FwWC8vOW1xcU1XS3AyWjMyakY3OHZZbTRFQklVV2orUGFXdmExK0NqU3FNcWJDS0QzTThGREVSTVZBa0xGRkVFVVVVVVVTUlN5TmJqNUlnMG4xTDdGRmNreUtORSs1YmxoNWxWRFlrR3BKOXk5S2pqTXFLcklaZzM3SWl3UjAralBSeTVlS0ZOejRYeVliMWNjOGIwdzhubDIyamdVYStGbWtqcDhnYnh4VkRHSisxWUl4OUxTZ2pWWERHVzBFYXE0STFvb0kycG44TWI0eTFFSXpmbjVnRVFIYmR6UG1sOUcyU1M4MEhXUHl4VVpDUDRTS1U1YUpzUE9VWHZtZ1lCNlN0M0ExZWgrTmNqSndybnRPc0lCV2JIQXlvM2JlN3d3ZWpNQnB1ZXpoRTVXdXhtWU5hV21FODUrekpoU05aQytXSlRSa1dVTVllbEFFT1pSUkZHYXBSeG9NNnNsVkVFVVVVdVJDeVBKSnJLUEtNeUJPS0RITlBZUWJzZTY3dCtyNXJDdzB3TC9WcGJNYy84UmY2QUFBQUFFbEZUa1N1UW1DQyIvPjwvc3ZnPg=="
                  draggable="false"
                  width={25}
                  alt="vertical center"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => matchingSize()}
              >
                <img
                  data-v-035f8230=""
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij4KICA8ZyBpZD0iR3JvdXBfMTA5MDAiIGRhdGEtbmFtZT0iR3JvdXAgMTA5MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDAgLTQ3MykiPgogICAgPHBhdGggaWQ9IlBhdGhfODk5NSIgZGF0YS1uYW1lPSJQYXRoIDg5OTUiIGQ9Ik0yLjQ0LDguODg3VjUuNzYxYTIwLjM1NSwyMC4zNTUsMCwwLDAsMy4wNDUtLjI5QTQuMyw0LjMsMCwwLDAsNy43NDIsNC4yNDZhNC4wMzIsNC4wMzIsMCwwLDAsLjktMS42NzYsMy44NDcsMy44NDcsMCwwLDAsLjE3Ny0uOTM1SDEyLjY0VjI1SDcuOTM1VjguODg3Wm0xOS44LS43NTdoNC44ODJ2NC44SDIyLjI0NFptMCwxMi4wNjloNC44ODJWMjVIMjIuMjQ0Wk0zMS43ODMsOC44ODdWNS43NjFhMjAuMzU1LDIwLjM1NSwwLDAsMCwzLjA0NS0uMjksNC4zLDQuMywwLDAsMCwyLjI1Ni0xLjIyNSw0LjAzMiw0LjAzMiwwLDAsMCwuOS0xLjY3NiwzLjg0NywzLjg0NywwLDAsMCwuMTc3LS45MzVoMy44MTlWMjVIMzcuMjc3VjguODg3WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwIDQ4NCkiIGZpbGw9IiMxYjFjMjAiIG9wYWNpdHk9IjAuNjA3Ii8+CiAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlXzEyMTYzIiBkYXRhLW5hbWU9IlJlY3RhbmdsZSAxMjE2MyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAgNDczKSIgZmlsbD0ibm9uZSIvPgogIDwvZz4KPC9zdmc+Cg=="
                  draggable="false"
                  width={25}
                  alt="1:1"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => resetRotate()}
              >
                <img
                  data-v-035f8230=""
                  src="https://d5p8slhj8xvbm.cloudfront.net/img/rotate.8c72819.svg"
                  draggable="false"
                  width={20}
                  alt="reset rotate"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => flipX()}
              >
                <img
                  data-v-035f8230=""
                  src="https://d5p8slhj8xvbm.cloudfront.net/img/mirror-hor.273dc71.svg"
                  draggable="false"
                  width={20}
                  alt="mirror horizontal"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => flipY()}
              >
                <img
                  data-v-035f8230=""
                  src="https://d5p8slhj8xvbm.cloudfront.net/img/mirror-ver.04b5fbb.svg"
                  draggable="false"
                  width={20}
                  alt="mirror vertical"
                />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-300"
                onClick={() => window.location.reload()}
              >
                <img
                  data-v-035f8230=""
                  src="https://d5p8slhj8xvbm.cloudfront.net/img/bin.917ff63.svg"
                  draggable="false"
                  width={18}
                  alt="remove"
                />
              </div>
            </div>
            <div className="p-1">
              <button
                className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2"
                onClick={() => setIsOpen(true)}
              >
                AI Background Removal
              </button>
              {isOpen && (
                <div
                  id="ai-dropdown"
                  ref={dropdownRef}
                  className="w-[200px] p-4 z-10 bg-white ounded-lg shadow-lg rounded w-44 absolute top-[-40px] text-sm"
                >
                  <ul className="capitalize">
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        setIsOpen(false);
                        removalBackground();
                      }}
                    >
                      remove background
                    </li>
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        setIsOpen(false);
                        cutFace();
                      }}
                    >
                      cut out face
                    </li>
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        setIsOpen(false);
                        originalImage();
                      }}
                    >
                      original image
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <EditTool
            widthSize={widthSize}
            heightSize={heightSize}
            setWidthSize={setWidthSize}
            setHeightSize={setHeightSize}
            quantity={quantity}
            setQuantity={setQuantity}
            border={border}
            setBorder={setBorder}
            canvasColor={canvasColor}
            setCanvasColor={setCanvasColor}
            isColorOpen={isColorOpen}
            setIsColorOpen={setIsColorOpen}
            downloadCanvasImage={downloadCanvasImage}
            isDownloadOpen={isDownloadOpen}
            setIsDownloadOpen={setIsDownloadOpen}
            isShapeOpen={isShapeOpen}
            setIsShapeOpen={setIsShapeOpen}
            canvasShape={canvasShape}
            setCanvasShape={setCanvasShape}
            canvasRound={canvasRound}
            setCanvasRound={setCanvasRound}
            canvasMaterial={canvasMaterial}
            setCanvasMaterial={setCanvasMaterial}
            isMaterialOpen={isMaterialOpen}
            setIsMaterialOpen={setIsMaterialOpen}
          />
        </div>
      </div>
    </>
  );
};

export default Index;
