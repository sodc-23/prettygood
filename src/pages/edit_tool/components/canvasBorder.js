import React from 'react';

const CanvasBorder = ({ border, setBorder, canvasRound, setCanvasRound }) => {
  return (
    <div className="w-full px-2">
      <label htmlFor="border-range" className="block mb-2 capitalize">
        {setBorder ? 'border' : 'rounding'}
      </label>
      <input
        id="border-range"
        type="range"
        value={setBorder ? border : canvasRound}
        min={0}
        max={setBorder ? 30 : 60}
        onChange={(e) =>
          setBorder ? setBorder(e.target.value) : setCanvasRound(e.target.value)
        }
        className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-lg"
      />
    </div>
  );
};

export default CanvasBorder;
