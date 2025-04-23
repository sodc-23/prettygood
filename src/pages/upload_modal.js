import React from 'react';

const UploadModal = ({ isOpen, setFileUrl, setHeightSize }) => {
  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          setFileUrl(URL.createObjectURL(file)); // For displaying the image
          setHeightSize(Math.round((250 / width) * height));
        };
      };
    } else {
      setFileUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-2">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex items-center justify-center">
          <label
            htmlFor="file-upload"
            className="bg-green-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-600 focus:outline-none"
          >
            upload image
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
