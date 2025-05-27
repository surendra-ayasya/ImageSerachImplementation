import React, { useState, useMemo, useRef } from 'react';
import { useImage } from '../../Context/ImageContext';
import conf from '../../../conf/conf.js';
import SearchInput from './SearchInput.jsx';
import ProductDescription from './ProductDescription.jsx';
import { FaCamera } from 'react-icons/fa';

const filters = [
  { name: 'Tile Design', options: ['Glossy Finish', 'Matte Finish', 'Carving Finish'] },
  { name: 'Color', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { name: 'Tile Collections', options: ['Classic', 'Modern', 'Vintage'] },
  { name: 'Tile Type', options: ['Ceramic', 'Porcelain', 'Marble'] },
  { name: 'Factory Production', options: ['Factory 1', 'Factory 2', 'Factory 3'] },
];

const ITEMS_PER_PAGE = 9;

const SearchResults = () => {
  const { uploadedImage, searchResults, setUploadedImage, setSearchResults } = useImage();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const failedImages = useRef(new Set());

  // New state for modal product
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = async () => {
      if (image.width < 50 || image.height < 50) {
        setError('Uploaded image is too small. Please upload an image at least 50x50 pixels.');
        return;
      }

      setUploadedImage(image.src);
      setIsAnalyzing(true);
      setCurrentPage(1);
      setSelectedFilters({});
      setSortOrder('');
      setSelectedProduct(null); // Close modal on new upload

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`http://${conf.backendUri}:5000/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        setSearchResults(data.results);
        setIsAnalyzing(false);
      } catch (error) {
        setError(error.message);
        setIsAnalyzing(false);
      }
    };
  };

  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];

    let results = [...searchResults];

    const filterKeys = Object.keys(selectedFilters);
    if (filterKeys.length > 0) {
      results = results.filter((item) =>
        filterKeys.every((filterName) =>
          selectedFilters[filterName].some(
            (filterVal) =>
              (item[filterName.toLowerCase().replace(/\s+/g, '_')] || '').toLowerCase() ===
              filterVal.toLowerCase()
          )
        )
      );
    }

    if (sortOrder === 'high-to-low') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'low-to-high') {
      results.sort((a, b) => a.score - b.score);
    }

    return results;
  }, [searchResults, selectedFilters, sortOrder]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filterName, option) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (newFilters[filterName]) {
        if (newFilters[filterName].includes(option)) {
          newFilters[filterName] = newFilters[filterName].filter((item) => item !== option);
        } else {
          newFilters[filterName].push(option);
        }
      } else {
        newFilters[filterName] = [option];
      }
      if (newFilters[filterName].length === 0) {
        delete newFilters[filterName];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const toggleFilterDropdown = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = [1, 2, 3, totalPages - 1, totalPages];
    for (let i = 1; i <= totalPages; i++) {
      if (
        visiblePages.includes(i) ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages.map((page, idx) => (
      <button
        key={idx}
        onClick={() => typeof page === 'number' && goToPage(page)}
        className={`px-3 py-1 rounded-md text-sm ${
          page === currentPage
            ? 'bg-blue-600 text-white font-semibold'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        disabled={page === '...'}
        aria-label={typeof page === 'number' ? `Go to page ${page}` : 'ellipsis'}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto mb-8">
        {(!uploadedImage || searchText.length > 0) && (
          <SearchInput searchText={searchText} setSearchText={setSearchText} />
        )}
      </div>

      {uploadedImage && (
       <div className="bg-white border rounded-xl p-4 md:p-6 max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
  <img
    src={uploadedImage}
    alt="Uploaded"
    className="w-20 h-20 object-cover rounded-md mx-auto sm:mx-0"
  />
  <div className="flex-1 text-center sm:text-left">
    <p className="text-lg font-semibold text-gray-800 ml-2">Uploaded Image</p>
    <p className="text-gray-500 ml-2">
      Here are some products that match the image you uploaded.
    </p>
  </div>
  <label
    htmlFor="change-image"
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center justify-center mx-auto sm:mx-0"
  >
    <FaCamera className="mr-2" />
    Change Image
    <input
      type="file"
      id="change-image"
      accept="image/*"
      className="hidden"
      capture="environment"
      onChange={handleImageChange}
    />
  </label>
</div>

      )}

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

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
        Search Results
      </h1>

      <div className="flex flex-wrap gap-6 justify-center mb-6">
        {filters.map((filter) => (
          <div key={filter.name} className="relative">
            <button
              className="px-4 py-2 border rounded-lg text-gray-700 font-medium hover:bg-gray-100 flex items-center cursor-pointer"
              onClick={() => toggleFilterDropdown(filter.name)}
              aria-expanded={openFilter === filter.name}
              aria-controls={`dropdown-${filter.name}`}
            >
              {filter.name}
              <span
                className={`ml-2 transform transition-transform duration-200 ${
                  openFilter === filter.name ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>
            {openFilter === filter.name && (
              <div
                id={`dropdown-${filter.name}`}
                className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-48 z-10"
              >
                <div className="py-2 px-3 max-h-48 overflow-y-auto">
                  {filter.options.map((option) => (
                    <label key={option} className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters[filter.name]?.includes(option) || false}
                        onChange={() => handleFilterChange(filter.name, option)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <select
          className="px-4 py-2 border rounded-lg text-gray-700 font-medium"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Sort results"
        >
          <option value="">Sort By Similarity</option>
          <option value="high-to-low">High to Low</option>
          <option value="low-to-high">Low to High</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {currentProducts.length > 0 ? (
          currentProducts.map((product, idx) => {
            const { url, score, filename } = product;
            const imageUrl = `http://${conf.backendUri}:5000${url}`;

            return (
              <div
                key={url + idx}
                className="bg-white rounded-xl overflow-hidden shadow-sm border cursor-pointer"
                onClick={() =>
                  setSelectedProduct({
                    image: imageUrl,
                    filename,
                    score,
                  })
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedProduct({
                      image: imageUrl,
                      filename,
                      score,
                    });
                  }
                }}
                aria-label={`View details for ${filename}`}
              >
                <img
                  src={imageUrl}
                  alt={filename}
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    if (!failedImages.current.has(url)) {
                      failedImages.current.add(url);
                      e.target.src = '/images/fallback.jpg';
                      console.error(`Failed to load image: ${url}`);
                    }
                  }}
                />
                <div className="p-3">
                  <p className="font-semibold text-gray-800 truncate">{filename}</p>
                  <p className="text-sm text-gray-500">
                    Similarity: {(score * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">No products found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mb-12">
        <button
          className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Modal for product description */}
      {selectedProduct && (
        <ProductDescription
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default SearchResults;
