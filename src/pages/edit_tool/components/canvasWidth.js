import React from 'react';

const CanvasWidth = ({
  widthSize,
  heightSize,
  setWidthSize,
  setHeightSize,
  border,
}) => {
  return (
    <>
      <div className="flex items-center justify-center w-1/3 md:w-24 border-r text-xs">
        <div className="flex justify-center">
          <div className="p-1 md:p-3">
            <div className="flex justify-center">Width</div>
            <div className="flex justify-center items-center">
              <div>{widthSize + 2 * border}</div>
              <div className="ml-2">
                <button
                  className="h-4 block"
                  onClick={() => {
                    setWidthSize(widthSize + 3);
                  }}
                >
                  ▲
                </button>
                <button
                  className="h-4 block"
                  onClick={() => {
                    setWidthSize(widthSize - 3);
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-1/3 md:w-24 border-r">
        <div className="flex justify-center">
          <div className="p-3">
            <div className="flex justify-center">Height</div>
            <div className="flex justify-center items-center">
              <div>{heightSize + 2 * border}</div>
              <div className="ml-2">
                <button
                  className="h-4 block"
                  onClick={() => {
                    setHeightSize(heightSize + 3);
                  }}
                >
                  ▲
                </button>
                <button
                  className="h-4 block"
                  onClick={() => {
                    setHeightSize(heightSize - 3);
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasWidth;
