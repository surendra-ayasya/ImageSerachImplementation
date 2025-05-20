import { createContext, useState, useContext } from 'react';

const ImageContext = createContext();

export const useImage = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]); 

  return (
    <ImageContext.Provider value={{ uploadedImage, setUploadedImage, searchResults, setSearchResults }}>
      {children}
    </ImageContext.Provider>
  );
};
