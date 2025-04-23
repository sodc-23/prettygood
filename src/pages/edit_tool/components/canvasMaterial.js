import React, { useEffect, useRef } from 'react';
import MaterialIcon from '../../../img/material.png';

const materialArr = [
  'premium',
  'transparent',
  'matte',
  'indoor',
  'heavy-duty',
  'heavy-duty matte',
  'gold-chrome',
  'chrome-silver',
  'wall-stickers',
  'rainbow holographic',
];

const CanvasMaterial = ({
  canvasMaterial,
  setCanvasMaterial,
  isMaterialOpen,
  setIsMaterialOpen,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMaterialOpen(false);
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
    <div className="flex items-center justify-center w-1/4 md:w-24 border-l">
      <div className="flex justify-center">
        <div
          className="p-3 cursor-pointer"
          onClick={() => setIsMaterialOpen(true)}
        >
          <div className="flex justify-center">Material</div>
          <div className="flex justify-center">
            <img
              src={MaterialIcon}
              alt="material"
              className="mt-2 w-[20px] md:w-[30px]"
            />
          </div>
        </div>
        {isMaterialOpen && (
          <div
            id="material-dropdown"
            ref={dropdownRef}
            className="w-[200px] p-4 z-10 bg-white ounded-lg shadow-lg rounded w-44 absolute bottom-0"
          >
            <ul className="capitalize">
              {materialArr.map((item, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${
                    canvasMaterial === item
                      ? 'bg-yellow-200'
                      : 'hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    setCanvasMaterial(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasMaterial;
