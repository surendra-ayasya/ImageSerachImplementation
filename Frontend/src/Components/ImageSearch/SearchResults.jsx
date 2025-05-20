import { useImage } from '../../Context/ImageContext';
import { useState, useMemo, useRef } from 'react';

const filters = [
  { name: 'Tile Design', options: ['Glossy Finish', 'Matte Finish', 'Carving Finish'] },
  { name: 'Color', options: ['Red', 'Blue', 'Green', 'Yellow'] },
  { name: 'Tile Collections', options: ['Classic', 'Modern', 'Vintage'] },
  { name: 'Tile Type', options: ['Ceramic', 'Porcelain', 'Marble'] },
  { name: 'Factory Production', options: ['Factory 1', 'Factory 2', 'Factory 3'] },
];

const ITEMS_PER_PAGE = 9;

const SearchResults = () => {
  const { uploadedImage, searchResults } = useImage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState('');
  const failedImages = useRef(new Set());

  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];

    let results = [...searchResults];

    // Apply similarity score sorting
    if (sortOrder === 'high-to-low') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'low-to-high') {
      results.sort((a, b) => a.score - b.score);
    }

    return results;
  }, [searchResults, sortOrder]);

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
  };

  const toggleFilterDropdown = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = [1, 2, 3, totalPages - 1, totalPages];
    for (let i = 1; i <= totalPages; i++) {
      if (visiblePages.includes(i) || (i >= currentPage - 1 && i <= currentPage + 1)) {
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
        disabled={page === '...' ? true : false}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
        Search Results
      </h1>

      {uploadedImage && (
        <div className="bg-white border rounded-xl p-4 md:p-6 max-w-3xl mx-auto mb-6 flex items-center space-x-4">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-20 h-20 object-cover rounded-md"
          />
          <div>
            <p className="text-lg font-semibold text-gray-800">Uploaded Image</p>
            <p className="text-gray-500">
              Here are some products that match the image you uploaded.
            </p>
          </div>
        </div>
      )}

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
                <div className="py-2 px-3">
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

        {/* Relevance Sorting Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleFilterDropdown('Relevance')}
            className="px-4 py-2 border rounded-lg text-gray-700 font-medium hover:bg-gray-100 flex items-center"
          >
            Relevance
            <span
              className={`ml-2 transform transition-transform duration-200 ${
                openFilter === 'Relevance' ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>
          {openFilter === 'Relevance' && (
            <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-48 z-10">
              <div className="py-2 px-3">
                <label className="block mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="relevance"
                    value="high-to-low"
                    checked={sortOrder === 'high-to-low'}
                    onChange={() => setSortOrder('high-to-low')}
                    className="mr-2"
                  />
                  High to Low
                </label>
                <label className="block cursor-pointer">
                  <input
                    type="checkbox"
                    name="relevance"
                    value="low-to-high"
                    checked={sortOrder === 'low-to-high'}
                    onChange={() => setSortOrder('low-to-high')}
                    className="mr-2"
                  />
                  Low to High
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {currentProducts.length > 0 ? (
          currentProducts.map((product, idx) => {
            const { url, score, filename } = product;

            return (
              <div
                key={url + idx}
                className="bg-white rounded-xl overflow-hidden shadow-sm border cursor-pointer"
              >
                <img
                  src={`http://127.0.0.1:5000${url}`}
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
                  <p className="font-semibold text-gray-800">{filename}</p>
                  <p className="text-sm text-gray-500">Similarity: {(score * 100).toFixed(2)}%</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">No products found.</p>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 text-gray-700">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
          }`}
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchResults;
