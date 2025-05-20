import { useState } from 'react';
import { useImage } from '../../Context/ImageContext';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';

const ImageUpload = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { setUploadedImage, setSearchResults } = useImage();
  const navigate = useNavigate();

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload results:', data.results);
      setSearchResults(data.results);
      setIsAnalyzing(false);
      navigate('/results');
    } catch (error) {
      console.error('Upload error:', error.message);
      setError(error.message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <label
        htmlFor="upload"
        className="w-64 h-64 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200 flex flex-col items-center justify-center text-center"
      >
        <FaCamera className="text-4xl text-gray-600 mb-3" />
        <p className="text-lg font-semibold text-gray-700">Click to Upload Image</p>
        <input
          type="file"
          id="upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-lg text-center">
            <div className="loader mb-4"></div>
            <h2 className="text-lg font-medium">Analyzing Image...</h2>
            <p className="text-sm text-gray-600 mt-2">Please wait a few seconds</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 mt-4 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
