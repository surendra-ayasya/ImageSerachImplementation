import { createContext, useState, useContext } from 'react';

const ImageContext = createContext();

export const useImage = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState(null);

  return (
    <ImageContext.Provider
      value={{
        uploadedImage,
        setUploadedImage,
        searchResults,
        setSearchResults,
        searchType,
        setSearchType,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
