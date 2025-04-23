import React, { useEffect, useRef } from 'react';

const CanvasDownload = ({
  downloadCanvasImage,
  isDownloadOpen,
  setIsDownloadOpen,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
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
    setIsDownloadOpen(false);
    downloadCanvasImage(param);
  };
  return (
    <div className="flex items-center justify-center w-1/4 md:w-32 border-l">
      <button
        className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2"
        onClick={() => setIsDownloadOpen(true)}
      >
        Download
      </button>
      {isDownloadOpen && (
        <div
          id="download-dropdown"
          ref={dropdownRef}
          className="w-[70px] p-4 z-10 bg-white ounded-lg shadow-lg rounded w-44 absolute bottom-0"
        >
          <ul className="capitalize">
            <li
              className="p-2 cursor-pointer hover:bg-gray-300"
              onClick={() => handleClick('png')}
            >
              png
            </li>
            <li
              className="p-2 cursor-pointer hover:bg-gray-300"
              onClick={() => handleClick('pdf')}
            >
              pdf
            </li>
            <li
              className="p-2 cursor-pointer hover:bg-gray-300"
              onClick={() => handleClick('eps')}
            >
              eps
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CanvasDownload;
