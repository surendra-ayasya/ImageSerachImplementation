import React, { useState, useMemo, useRef } from 'react';
import { useImage } from '../../Context/ImageContext';
import conf from '../../../conf/conf.js';
import SearchInput from './SearchInput.jsx';
import { FaHeart } from 'react-icons/fa';
import uploadIcon from '../../assets/changeImage.png';
import cube from '../../assets/cubeloader.mp4';

// Constant for pagination
const ITEMS_PER_PAGE = 9;

// Main SearchResults component
const SearchResults = () => {
  // Context and state management
  const { uploadedImage, searchResults, setUploadedImage, setSearchResults } = useImage();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortOrder, setSortOrder] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const failedImages = useRef(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFourColLayout, setIsFourColLayout] = useState(false);

  
  // State for managing collapsible filter sections
  const [openSections, setOpenSections] = useState({
    wallTiles: true,
    floorTiles: true,
    sizes: true,
    finishes: true,
    ranges: true,
    textures: true,
    colors: true, // Added new section
    priceRange: true, // Added new section
  });

  // Handler for image upload and analysis
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
      setSelectedProduct(null);

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

  // Filter and sort results using useMemo for performance
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

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render pagination numbers with ellipsis
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

  // Calculate active filters count
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (total, filterArray) => total + (filterArray?.length || 0),
    0
  );

  // Toggle collapsible sections
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Placeholder component for loading state in product grid
  const ProductPlaceholder = () => (
    <div className="flex flex-col gap-4 animate-pulse" style={{ height: '495px' }}>
      <div className="bg-gray-200 w-full h-[353px] rounded-md"></div>
      <div className="flex flex-col gap-2">
        <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto mb-6">
        {/* Search Input Component */}
        <SearchInput
          searchText={searchText}
          setSearchText={setSearchText}
          setCurrentPage={setCurrentPage}
        />
      </div>

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-10 rounded-lg text-center">
                {/* Replace loader with your video */}
                <div className="bg-transparent rounded-md inline-flex items-center justify-center mb-4">
                  <video
                    src={cube}
                    autoPlay
                    loop
                    muted
                    className="w-12 h-12 md:w-40 md:h-40 object-contain"
                  />
                </div>
                
              </div>
            </div>
          )}


      {/* Error Message */}
      {error && (
        <p className="text-red-600 mt-4 text-sm text-center">{error}</p>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-[1512px] mx-auto">
        {/* Filter Sidebar */}
        <div
          className="w-full lg:w-[373px] bg-[#F5F5F5] p-4 overflow-y-auto"
          style={{ minHeight: '1583px' }}
        >
          {/* Active Filters Count */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              {activeFilterCount.toString().padStart(2, '0')} Filters Active Now
            </span>
          </div>

          {/* Uploaded Image Section */}
          {uploadedImage && (
            <div className="mb-6 relative">
              <div className="border border-gray-300 bg-white" style={{ width: '336px', height: '362px' }}>
                <img
                  src={uploadedImage}
                  alt="Uploaded Tile"
                  className="w-full h-full object-cover"
                />
                <label
                  htmlFor="change-image-sidebar"
                  className="absolute bottom-2 left-2 w-10 h-10 bg-white text-white rounded-full flex items-center justify-center cursor-pointer"
                  aria-label="Change image"
                >
                  <img
                    src={uploadIcon}
                    alt="Upload Icon"
                    className="w-6 h-6"
                  />
                  <input
                    type="file"
                    id="change-image-sidebar"
                    accept="image/*"
                    className="hidden"
                    capture="environment"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Wall Tiles Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('wallTiles')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Wall Tiles</h3>
              <span className="text-gray-600">
                {openSections.wallTiles ? '▲' : '▼'}
              </span>
            </div>
            {openSections.wallTiles && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700 ml-2">Bathroom Wall Tiles</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700 ml-2">Kitchen Wall Tiles</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Living Room Wall Tiles</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Outdoor Wall Tiles</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Bedroom Wall Tiles</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Wall Tiles for Commercial Spaces</span>
                </label>
                <button className="text-blue-600 text-sm font-medium mt-2">+ Show More</button>
              </div>
            )}
          </div>

          {/* Floor Tiles Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('floorTiles')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Floor Tiles</h3>
              <span className="text-gray-600">
                {openSections.floorTiles ? '▲' : '▼'}
              </span>
            </div>
            {openSections.floorTiles && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 ml-2">Trending Category</h4>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Eternity</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">The Ultima – 4DX</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Infinity</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Grestough</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Vitronite</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">DuRock – 40x40cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Step Stone</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Ceramic Tiles</span>
                </label>
              </div>
            )}
          </div>

          {/* Sizes Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('sizes')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Sizes</h3>
              <span className="text-gray-600">
                {openSections.sizes ? '▲' : '▼'}
              </span>
            </div>
            {openSections.sizes && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">120x240 cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">120x120 cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">80x260 cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">120x180 cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">80x240 cm</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">80x160 cm</span>
                </label>
                <button className="text-blue-600 text-sm font-medium mt-2">+ Show More</button>
              </div>
            )}
          </div>

          {/* Finishes Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('finishes')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Finishes</h3>
              <span className="text-gray-600">
                {openSections.finishes ? '▲' : '▼'}
              </span>
            </div>
            {openSections.finishes && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Polish</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Gloss Matt</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Matt</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Carving</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Superwhite</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Marbletech</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Metallic</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Rotomatt</span>
                </label>
                <button className="text-blue-600 text-sm font-medium mt-2">+ Show More</button>
              </div>
            )}
          </div>

          {/* Ranges Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('ranges')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Ranges</h3>
              <span className="text-gray-600">
                {openSections.ranges ? '▲' : '▼'}
              </span>
            </div>
            {openSections.ranges && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Premium</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Standard</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Economy</span>
                </label>
              </div>
            )}
          </div>

          {/* Textures Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('textures')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Textures</h3>
              <span className="text-gray-600">
                {openSections.textures ? '▲' : '▼'}
              </span>
            </div>
            {openSections.textures && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Smooth</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Rough</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Textured</span>
                </label>
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('colors')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Colors</h3>
              <span className="text-gray-600">
                {openSections.colors ? '▲' : '▼'}
              </span>
            </div>
            {openSections.colors && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">White</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Black</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Grey</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Beige</span>
                </label>
                <button className="text-blue-600 text-sm font-medium mt-2">+ Show More</button>
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection('priceRange')}
            >
              <h3 className="text-sm font-bold uppercase text-gray-800">Price Range</h3>
              <span className="text-gray-600">
                {openSections.priceRange ? '▲' : '▼'}
              </span>
            </div>
            {openSections.priceRange && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Under $10</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">$10 - $20</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">$20 - $50</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700 ml-2">Above $50</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
<div
  className="w-full lg:w-[1139px] bg-white p-4 shadow overflow-y-auto"
  style={{ minHeight: '1583px' }}
>
  {/* Top Bar: Available Products Count + Filter Toggle */}
  <div className="mb-4 flex justify-between items-center">
    <span className="text-sm text-gray-600">
      Filter by {filteredResults.length} 2x2 tiles available
    </span>
    <button
      onClick={() => setIsFourColLayout(!isFourColLayout)}
      className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
    >
      {isFourColLayout ? 'Show 3 per row' : 'Show 4 per row'}
    </button>
  </div>

  {/* Product Grid */}
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 ${
      isFourColLayout ? 'md:grid-cols-4' : 'md:grid-cols-3'
    } gap-4 mx-auto`}
  >
    {isAnalyzing ? (
      // Show placeholders while analyzing
      Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
        <ProductPlaceholder key={idx} />
      ))
    ) : currentProducts.length > 0 ? (
      currentProducts.map((product, idx) => {
        const { url, score, filename } = product;
        const imageUrl = `http://${conf.backendUri}:5000${url}`;

        return (
          <div
            key={url + idx}
            className="flex flex-col cursor-pointer gap-4"
            style={{ height: isFourColLayout ? '380px' : '495px' }}
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
            <div
              className="relative"
              style={{ height: isFourColLayout ? '280px' : '353px' }}
            >
              <img
                src={imageUrl}
                alt={filename}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!failedImages.current.has(url)) {
                    failedImages.current.add(url);
                    e.target.src = '/images/fallback.jpg';
                    console.error(`Failed to load image: ${url}`);
                  }
                }}
              />

              <div
                className="
                  absolute inset-0
                  bg-black bg-opacity-100
                  opacity-0 hover:opacity-60
                  transition-opacity duration-300
                  flex flex-col items-center justify-center
                  cursor-pointer
                  text-white
                  select-none
                "
              >
                <div
                  className="bg-white bg-opacity-20 rounded-full
                    p-3
                    flex items-center justify-center
                    mb-2
                    hover:bg-opacity-40
                    transition
                    w-12 h-12
                  "
                  aria-label="Remember this!"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Remembered!');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alert('Remembered!');
                    }
                  }}
                >
                  <FaHeart className="text-red-500 w-6 h-6" />
                </div>
                <span className="text-sm font-semibold tracking-wide">Remember this</span>
              </div>
            </div>

            <div className="flex flex-col" style={{ height: '110px' }}>
              <p className="text-lg font-bold text-gray-800 uppercase text-left mb-1">{filename}</p>
              <p className="text-sm text-gray-500 text-left mb-1">
                Similarity: {(score * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 text-left mb-1">
                Glazed Tiles, Polished Finish, Large Format
              </p>
              <div className="flex items-center" style={{ width: 254, height: 20, gap: 3 }}>
                <div className="flex items-center h-full">
                  <span
                    style={{ color: 'rgba(166, 135, 64, 1)', letterSpacing: '0.3em' }}
                    className="font-semibold text-xs uppercase"
                  >
                    ETERNITY
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <div
                  className="flex items-center text-xs text-gray-600 ml-14"
                  style={{ height: '100%', gap: 3, whiteSpace: 'nowrap' }}
                >
                  <span>120x240cm,</span>
                  <span className="font-semibold cursor-pointer hover:text-gray-800">+More</span>
                </div>
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-center text-gray-500 col-span-full">No products found.</p>
    )}
  </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>

      </div>

      
        {/* Product Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="bg-white rounded-lg max-w-3xl w-full max-h-full overflow-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl font-bold"
                aria-label="Close details modal"
              >
                ×
              </button>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.filename}
                className="w-full h-auto rounded-md mb-4"
              />
              <h2
                id="modal-title"
                className="text-gray-800 mb-2"
                style={{
                  fontFamily: 'Urbanist, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '140%',
                  verticalAlign: 'middle',
                  textTransform: 'uppercase',
                  width: '85px',
                  height: '11px',
                  letterSpacing: '0px',
                }}
              >
                {selectedProduct.filename}
              </h2>
              <p className="text-gray-600 mb-1">
                Similarity: {(selectedProduct.score * 100).toFixed(2)}%
              </p>
              <p className="text-gray-600">
                Additional product details can go here.
              </p>
            </div>
          </div>
        )}

    </div>
  );
};

export default SearchResults;