import React, { useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';

import ColorIcon from '../../../img/color.png';

const CanvasBgColor = ({
  canvasColor,
  setCanvasColor,
  isColorOpen,
  setIsColorOpen,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsColorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-1/4 md:w-24 border-l relative">
      <div className="flex justify-center relative">
        <div
          className="p-3 cursor-pointer"
          onClick={() => setIsColorOpen(true)}
        >
          <div className="flex justify-center">Color</div>
          <div className="flex justify-center">
            <img
              src={ColorIcon}
              alt="color"
              className="mt-2 w-[20px] md:w-[30px]"
            />
          </div>
        </div>
        {isColorOpen && (
          <div
            id="color-dropdown"
            ref={dropdownRef}
            className="z-10 bg-white ounded-lg shadow-lg rounded absolute bottom-0 left-1"
          >
            <SketchPicker
              color={canvasColor}
              onChangeComplete={(color) => {
                setCanvasColor(color.hex);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasBgColor;
