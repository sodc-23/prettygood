import React, { useEffect, useRef } from 'react';
import ShapeIcon from '../../../img/shape.png';
import DiecutIcon from '../../../img/dieCut.png';
import CircleIcon from '../../../img/circle.png';
import RectangleIcon from '../../../img/rect.png';
import RoundedIcon from '../../../img/roundedRect.png';

const CanvasShape = ({
  canvasShape,
  setCanvasShape,
  isShapeOpen,
  setIsShapeOpen,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShapeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    };
  }, []);
  const handleClick = (param) => {
    setCanvasShape(param);
  };
  return (
    <div className="flex items-center justify-center w-1/4 md:w-24 border-l relative">
      <div className="flex justify-center">
        <div
          className="p-3 cursor-pointer"
          onClick={() => setIsShapeOpen(true)}
        >
          <div className="flex justify-center">Shape</div>
          <div className="flex justify-center">
            <img
              src={ShapeIcon}
              alt="shape"
              className="mt-2 w-[20px] md:w-[30px]"
            />
          </div>
        </div>
      </div>
      {isShapeOpen && (
        <div
          id="shape-dropdown"
          ref={dropdownRef}
          className="w-[300px] p-4 z-10 bg-white ounded-lg shadow-lg rounded left-[-50px] absolute bottom-0"
        >
          <div className="flex justify-center">
            <div
              className={`uppercase p-2 w-1/4 cursor-pointer ${
                canvasShape === 'die' ? 'bg-yellow-200' : 'hover:bg-gray-300'
              }`}
              onClick={() => handleClick('die')}
            >
              <div className="text-center">die&nbsp;cut</div>
              <div className="text-center">
                <img
                  src={DiecutIcon}
                  alt="die_cut"
                  width="40"
                  className="mt-2"
                />
              </div>
            </div>
            <div
              className={`uppercase p-2 w-1/4 cursor-pointer ${
                canvasShape === 'circle' ? 'bg-yellow-200' : 'hover:bg-gray-300'
              }`}
              onClick={() => handleClick('circle')}
            >
              <div className="text-center">circle</div>
              <div className="text-center">
                <img
                  src={CircleIcon}
                  alt="circle"
                  width="70"
                  className="mt-2"
                />
              </div>
            </div>
            <div
              className={`uppercase p-2 min-w-[80px] w-1/4 cursor-pointer ${
                canvasShape === 'rect' ? 'bg-yellow-200' : 'hover:bg-gray-300'
              }`}
              onClick={() => handleClick('rect')}
            >
              <div className="text-center">rectangle</div>
              <div className="text-center">
                <img
                  src={RectangleIcon}
                  alt="rectangle"
                  width="50"
                  className="mx-auto mt-2"
                />
              </div>
            </div>
            <div
              className={`uppercase p-2 w-1/4 cursor-pointer ${
                canvasShape === 'rounded'
                  ? 'bg-yellow-200'
                  : 'hover:bg-gray-300'
              }`}
              onClick={() => handleClick('rounded')}
            >
              <div className="text-center">rounded</div>
              <div className="text-center">
                <img
                  src={RoundedIcon}
                  alt="rounded"
                  width="50"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasShape;
