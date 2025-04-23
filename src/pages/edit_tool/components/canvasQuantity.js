import React from 'react';

const CanvasQuantity = ({ quantity, setQuantity }) => {
  return (
    <div className="flex items-center justify-center w-1/3 md:w-24 border-r">
      <div className="flex justify-center">
        <div className="p-3">
          <div className="flex justify-center">Quantity</div>
          <div className="flex justify-center items-center">
            <div>{quantity}</div>
            <div className="ml-2">
              <button
                className="h-4 block"
                onClick={() => {
                  setQuantity(quantity + 3);
                }}
              >
                ▲
              </button>
              <button
                className="h-4 block"
                onClick={() => {
                  setQuantity(quantity - 3);
                }}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasQuantity;
