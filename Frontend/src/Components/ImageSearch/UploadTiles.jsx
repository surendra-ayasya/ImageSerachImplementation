import React, { useRef } from 'react';
import { useImageUploader } from '../../Context/useImageUploader';
import marble from '../../assets/blackmarble.jpg';
import uploadImg from '../../assets/uploadlogo.png';
import exploreImg from '../../assets/explore.png';
import dragImg from '../../assets/dragdrop.png';
import cube from '../../assets/cubeloader.mp4';

const UploadTiles = () => {
  const inputRef = useRef(null);
  const { handleImageUpload, isAnalyzing, error, setError } = useImageUploader();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  return (
    <div className="relative w-full h-auto min-h-[450px] flex items-center justify-center text-white py-10 md:py-0">
      {/* Background texture */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${marble})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col md:flex-row w-full px-4 md:px-10">
        {/* Left Section */}
        <div className="flex-1 pt-6 md:pt-8 pr-0 md:pr-6 mt-4 md:mt-5">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6 md:ml-10 text-center md:text-left leading-tight">
            Upload Image to<br />
            Find Similar Tiles
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-3 md:ml-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mt-3">
                <img src={uploadImg} alt="Upload Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold mt-2 md:mt-7">STEP 1: UPLOAD YOUR IMAGE</p>
                <p className="text-xs text-gray-300 mt-1">Choose a photo of your space or a tile design you love.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 md:ml-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mt-3">
                <img src={exploreImg} alt="Explore Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold mt-2 md:mt-7">STEP 2: EXPLORE MATCHING TILES</p>
                <p className="text-xs text-gray-300 mt-1">Browse through our suggested tile options that fit your style.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Upload Box */}
        <div className="flex-1 p-6 md:p-8 flex justify-center md:justify-end">
          <div
            className="p-6 rounded-lg border-dashed border-2 border-gray-500 text-center w-full max-w-md"
            style={{
              background: 'linear-gradient(178.04deg, rgba(255, 255, 255, 0.2) 26%, rgba(255, 255, 255, 0.2) 99.99%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <div className="mb-4 mt-2">
              <img src={dragImg} alt="Upload Logo" className="w-12 h-12 object-contain mx-auto" />
            </div>
            <p className="text-lg font-semibold leading-tight">
              SELECT A FILE OR DRAG AND<br />DROP HERE
            </p>
            <p className="text-xs text-gray-300 mb-4 mt-2">JPG, PNG  . Maximum file size: 5MB</p>
              
            <button
              onClick={() => inputRef.current?.click()}
              className="relative group px-12 py-2 border border-white text-white overflow-hidden transition duration-300 ease-in-out"
            >
              <span className="relative z-10 font-normal">SELECT FILE</span>
              <span className="absolute inset-[0px] border border-white transform scale-100 group-hover:m-0.5 transition-all duration-300 ease-in-out pointer-events-none"></span>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {isAnalyzing && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}
  >
    <div className="bg-transparent rounded-md inline-flex items-center justify-center">
      <video
        src={cube}
        autoPlay
        loop
        muted
        className="w-12 h-12 md:w-40 md:h-40 object-contain"
      />
    </div>
  </div>
)}

      {/* Error Modal */}
      {error && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-xs p-6 text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
            <p className="text-sm text-gray-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTiles;
