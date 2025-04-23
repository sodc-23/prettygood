import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UploadModal from './upload_modal'; // upload modal component
import EditTool from './edit_tool/index'; // control canvas tool component
import { removeBackground } from './func/removeBackground'; // function for removalBackground
import { detectFace } from './func/detectFace'; // function for face cut
import { Checkerboard } from './patterns/checkerboard'; // transparent background component
import {
  loadFabricImage,
  goldChromeGradient,
  chromeSilverGradient,
  rainbowGradient,
} from './func/fabricFeature'; // material background gradient

const Index = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const canvasRef = useRef(null); // entire canvas element
  const fabricCanvas = useRef(null); // entire canvas

  const fabricImage = useRef(null); // uploaded image
  const fabricRect = useRef(null); // rectangle object for control canvas back|clip
  const fabricCircle = useRef(null); // circle object for control canvas back|clip
  const fabricMask = useRef(null); // material object

  const dropdownRef = useRef(null); // download image element

  const [isModalOpen, setIsModalOpen] = useState(true); // upload image modal open/close
  const [fileUrl, setFileUrl] = useState(null); // upload image url
  const [widthSize, setWidthSize] = useState(250); // width of canvas to control
  const [heightSize, setHeightSize] = useState(250); // height of canvas to control
  const [quantity, setQuantity] = useState(10); // image quantity
  const [border, setBorder] = useState(10); // control canvas border
  const [canvasColor, setCanvasColor] = useState('#fff'); // control canvas color
  const [canvasShape, setCanvasShape] = useState('rect'); // control canvas background shape
  const [canvasRound, setCanvasRound] = useState(16); // control canvas background round
  const [canvasMaterial, setCanvasMaterial] = useState('premium'); // control canvas material
  const [loading, setLoading] = useState(false); // loading when backgroundRemoval or faceCutting
  const [mark1Left, setMark1Left] = useState(0); // position left of mark showing control canvas width
  const [mark1Top, setMark1Top] = useState(0); // position top of mark showing control canvas width
  const [mark2Left, setMark2Left] = useState(0); // position left of mark showing control canvas height
  const [mark2Top, setMark2Top] = useState(0); // position top of mark showing control canvas height

  const [fullWidth, setFullWidth] = useState(
    document.documentElement.clientWidth - 20
  ); // width of entire canvas
  const [fullHeight, setFullHeight] = useState(
    isMobile
      ? document.documentElement.clientHeight - 260
      : document.documentElement.clientHeight - 120
  ); // height of entire canvas
  const [isOpen, setIsOpen] = useState(false); // open|close of dropdown for backgroundRemoval
  const [isColorOpen, setIsColorOpen] = useState(false); // open|close of dropdown for control canvas color
  const [isShapeOpen, setIsShapeOpen] = useState(false); // open|close of dropdown for control canvas shape
  const [isMaterialOpen, setIsMaterialOpen] = useState(false); // open|close for dropdown control canvas material
  const [isDownloadOpen, setIsDownloadOpen] = useState(false); // open|close of dropdown for download

  // close backgroundRemoval dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // close backgroundRemoval dropdown when clicking rest part.
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    // Width and height for entire canvas during resizing browser
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

  // render canvas depending on border, canvasMaterial, canvasShape, fullHeight,  fullWidth, canvasColor, canvasRound, widthSize, heightSize
  const renderCanvas = useCallback(
    async (url) => {
      if (!url && !fabricImage.current) {
        return;
      }

      // create entire canvas init
      if (!fabricCanvas.current) {
        fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
          backgroundColor: '#f3f4f4',
        });
      }

      fabricCanvas.current.setWidth(fullWidth);
      fabricCanvas.current.setHeight(fullHeight);

      fabricCanvas.current.clear();

      // create image fabric object
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

      // create Rectangle for control canvas background and clipPath when control canvas shape is rectangle, die cut, rounded
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

      // create Circle for control canvas background and clipPath when control canvas shape is circle
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

      // define material background gradient depending on material
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

      let canvasBack; // control canvas background
      let canvasBackGroup; // control canvas background with material

      // define control canvas back & canvas clip depending on canvas shape
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

      // define position of marks showing control canvas width and height
      setMark1Left(canvasBack.left);
      setMark1Top(
        canvasBack.top - (canvasBack.height * canvasBack.scaleY) / 2 - 40
      );
      setMark2Left(
        canvasBack.left + (canvasBack.width * canvasBack.scaleX) / 2 + 40
      );
      setMark2Top(canvasBack.top);

      //define control canvas background with material depending on material kinds
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

      // update image|background clip depending on canvas shape
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
        }); // die cut background
        //clone image for cutting background same as uploaded image shape
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

        // redefine canvas material because canvas back is different from the usual
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
        // update border rounded of control canvas
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

      // insert control canvas into lowest layer
      fabricCanvas.current.insertAt(canvasBackGroup, 0);

      // updating canvas back|clip position and scale by manual control
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

  // trigger renderCanvas when updating image file, canvas border, round, color, material, width, height
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

  // trigger renderCanvas function when updating canvas shape and resizing browser
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

  // download image
  const downloadCanvasImage = useCallback(
    (param) => {
      // canvas size to download
      const canvas = new fabric.Canvas('canvas', {
        width: Math.round(widthSize) + 2 * Math.round(border),
        height: Math.round(heightSize) + 2 * Math.round(border),
        backgroundColor: null,
      });

      // move control canvas into center of screen for correct download
      fabricRect.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      fabricCircle.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      fabricImage.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
      renderCanvas();

      // remove background when material is transparent
      if (canvasMaterial === 'transparent') {
        fabricCanvas.current.clear();
        fabricCanvas.current.add(fabricImage.current);
        fabricCanvas.current.renderAll();
      }

      // image url of entire canvas with image
      const originalDataUrl = fabricCanvas.current.toDataURL({
        format: 'png',
      });

      // read entire canvas
      fabric.Image.fromURL(originalDataUrl, (img) => {
        // clip entire canvas image to download
        img.set({
          left: Math.round(widthSize / 2) + Math.round(border),
          top: Math.round(heightSize / 2) + Math.round(border),
          originX: 'center',
          originY: 'center',
        });
        canvas.add(img);
        canvas.renderAll();

        // download canvas image url (same size as control canvas)
        const dataUrl = canvas.toDataURL({
          format: 'png',
        });

        if (param === 'png') {
          // png download
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${new Date().getTime()}.png`;
          link.click();
        } else if (param === 'pdf') {
          // pdf download
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
          // eps download
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

  // removalBackground
  const removalBackground = useCallback(async () => {
    setLoading(true);

    // define canvas to remove background
    const canvas = new fabric.Canvas('canvas', {
      width: Math.round(widthSize) + 2 * Math.round(border),
      height: Math.round(heightSize) + 2 * Math.round(border),
      backgroundColor: null,
    });

    // move control canvas into center without canvas back for correct handle
    fabricCanvas.current.clear();
    fabricRect.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
    fabricCircle.current.set({ left: fullWidth / 2, top: fullHeight / 2 });
    fabricImage.current.set({ left: fullWidth / 2, top: fullHeight / 2 });

    fabricCanvas.current.add(fabricImage.current);
    fabricCanvas.current.renderAll();

    // entire canvas image url
    const originalDataUrl = fabricCanvas.current.toDataURL({
      format: 'png',
    });

    // read entire canvas
    fabric.Image.fromURL(originalDataUrl, async (img) => {
      // redefine canvas to removeBackground depending on control canvas shape
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

      // removalBackground canvas image url
      const dataUrl = canvas.toDataURL({
        format: 'png',
      });

      // remove background
      const cleanImageUrl = await removeBackground(dataUrl);
      setLoading(false);

      // display canvas after removalBackground
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

  // reset original image
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

  // face cut handle
  const cutFace = useCallback(async () => {
    if (fabricCanvas.current && fabricImage.current) {
      setLoading(true);

      // remove control canvas back for correct cut face
      fabricCanvas.current.clear();
      fabricCanvas.current.add(fabricImage.current);
      fabricCanvas.current.renderAll();

      // entire canvas image url without back
      const originalDataUrl = fabricCanvas.current.toDataURL({
        format: 'png',
      });

      const image = new Image();

      image.onload = async () => {
        const detections = await detectFace(image); // detect face from image
        setLoading(false);

        // error handle unless detect face
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

        // when detect faces
        detections.forEach((detection) => {
          const box = detection.detection.box;

          // image size after control
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

          // crop image using deteting face points
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

          // display face-cut image on canvas
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

  // move image into center horizotal of control canvas
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

  // move image into center vertical of control canvas
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

  // 1:1 match image size into control canvas
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

  // mirror image through x axis
  const flipX = useCallback(() => {
    fabricImage.current.set('flipX', !fabricImage.current.flipX);
    fabricCanvas.current.renderAll();
  }, []);

  // mirror image through y axis
  const flipY = useCallback(() => {
    fabricImage.current.set('flipY', !fabricImage.current.flipY);
    fabricCanvas.current.renderAll();
  }, []);

  // rerotate image to zero degree
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

        {/* canvas */}
        <div className="flex justify-center w-full relative text-green-400 font-bold mb-4">
          {/* postion of marks showing control canvas */}
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

          {/* entire canvas */}
          <canvas ref={canvasRef} />
        </div>

        {/* upload image file */}
        <UploadModal
          isOpen={isModalOpen}
          setFileUrl={setFileUrl}
          setHeightSize={setHeightSize}
        />

        {/* image tools */}
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

            {/* removalBackground | face cut | origin image */}
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

          {/* control canvas tools */}
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
