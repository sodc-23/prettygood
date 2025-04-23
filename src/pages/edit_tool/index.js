import React from 'react';
import CanvasWidth from './components/canvasWidth';
import CanvasQuantity from './components/canvasQuantity';
import CanvasBorder from './components/canvasBorder';
import CanvasBgColor from './components/canvasBgColor';
import CanvasShape from './components/canvasShape';
import CanvasMaterial from './components/canvasMaterial';
import CanvasDownload from './components/canvasDownload';

const Index = ({
  widthSize,
  heightSize,
  setWidthSize,
  setHeightSize,
  quantity,
  setQuantity,
  border,
  setBorder,
  isColorOpen,
  setIsColorOpen,
  canvasColor,
  setCanvasColor,
  downloadCanvasImage,
  isDownloadOpen,
  setIsDownloadOpen,
  isShapeOpen,
  setIsShapeOpen,
  canvasShape,
  setCanvasShape,
  canvasRound,
  setCanvasRound,
  canvasMaterial,
  setCanvasMaterial,
  isMaterialOpen,
  setIsMaterialOpen,
}) => {
  return (
    <div className="md:flex justify-between bg-white w-full text-xs">
      <div className="flex">
        <CanvasWidth
          widthSize={widthSize}
          heightSize={heightSize}
          setWidthSize={setWidthSize}
          setHeightSize={setHeightSize}
          border={border}
        />
        <CanvasQuantity quantity={quantity} setQuantity={setQuantity} />
      </div>
      {canvasShape !== 'circle' && (
        <div className="flex justify-between md:p-5 w-4/5">
          <CanvasBorder
            border={border}
            setBorder={setBorder}
            isShapeOpen={isShapeOpen}
            setIsShapeOpen={setIsShapeOpen}
          />
          {canvasShape === 'rounded' && (
            <CanvasBorder
              canvasRound={canvasRound}
              setCanvasRound={setCanvasRound}
            />
          )}
        </div>
      )}

      <div className="flex">
        <CanvasBgColor
          canvasColor={canvasColor}
          setCanvasColor={setCanvasColor}
          isColorOpen={isColorOpen}
          setIsColorOpen={setIsColorOpen}
        />
        <CanvasShape
          canvasShape={canvasShape}
          setCanvasShape={setCanvasShape}
          isShapeOpen={isShapeOpen}
          setIsShapeOpen={setIsShapeOpen}
        />
        <CanvasMaterial
          canvasMaterial={canvasMaterial}
          setCanvasMaterial={setCanvasMaterial}
          isMaterialOpen={isMaterialOpen}
          setIsMaterialOpen={setIsMaterialOpen}
        />
        <CanvasDownload
          downloadCanvasImage={downloadCanvasImage}
          isDownloadOpen={isDownloadOpen}
          setIsDownloadOpen={setIsDownloadOpen}
        />
      </div>
    </div>
  );
};

export default Index;
