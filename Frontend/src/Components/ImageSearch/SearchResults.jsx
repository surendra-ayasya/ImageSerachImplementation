import React, { useState, useMemo, useRef } from 'react';
import { useImage } from '../../Context/ImageContext';
import conf from '../../../conf/conf.js';
import SearchInput from './SearchInput.jsx';
import { FaHeart } from 'react-icons/fa';
import uploadIcon from '../../assets/changeImage.png';
import cube from '../../assets/cubeloader.mp4';
import threeLogo from '../../assets/grid3logo.png';
import fourLogo from '../../assets/grid4logo.png';
import filterLogo from '../../assets/filter.png';
import heartLogo from '../../assets/heart.png';

const ITEMS_PER_PAGE = 9;

const SearchResults = () => {
      const { uploadedImage, searchResults, setUploadedImage, setSearchResults } = useImage();
      const [searchText, setSearchText] = useState('');
      const [currentPage, setCurrentPage] = useState(1);
      const [selectedFilters, setSelectedFilters] = useState({
        wallTiles: [], // Default checked values
        floorTiles: [],
        sizes: [],
        finishes: [],
        ranges: [],
        textures: [],
        colors: [],
        priceRange: [],
        
      });
      const [sortOrder, setSortOrder] = useState('');
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [error, setError] = useState(null);
      const failedImages = useRef(new Set());
      const [selectedProduct, setSelectedProduct] = useState(null);
      const [isFourColLayout, setIsFourColLayout] = useState(false);
      const [lastImageName, setLastImageName] = useState(null);
      const [isFiltersOpen, setIsFiltersOpen] = useState(false);
      const [openSections, setOpenSections] = useState({
        wallTiles: true,
        floorTiles: true,
        sizes: true,
        finishes: true,
        ranges: true,
        textures: true,
        colors: true,
        priceRange: true,
      });

      // Handle checkbox changes
      const handleFilterChange = (filterCategory, value) => {
        setSelectedFilters((prev) => {
          const currentFilters = prev[filterCategory] || [];
          if (currentFilters.includes(value)) {
            return {
              ...prev,
              [filterCategory]: currentFilters.filter((item) => item !== value),
            };
          } else {
            return {
              ...prev,
              [filterCategory]: [...currentFilters, value],
            };
          }
        });
      };

      const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);

        if (file.name === lastImageName) {
          setError('Please upload a different image.');
          return;
        }

        const image = new Image();
        const imageURL = URL.createObjectURL(file);
        image.src = imageURL;

        image.onload = async () => {
          if (image.width < 50 || image.height < 50) {
            setError('Uploaded image is too small. Please upload an image at least 50x50 pixels.');
            return;
          }

          setUploadedImage(imageURL);
          setLastImageName(file.name);
          setIsAnalyzing(true);
          setCurrentPage(1);
          setSelectedFilters({
            wallTiles: ['Bathroom Wall Tiles', 'Kitchen Wall Tiles'],
            floorTiles: [],
            sizes: [],
            finishes: [],
            ranges: [],
            textures: [],
            colors: [],
            priceRange: [],
          });
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

      // Filter and sort results
      const filteredResults = useMemo(() => {
        if (!searchResults.length) return [];

        let results = [...searchResults];

        const filterKeys = Object.keys(selectedFilters);
        if (filterKeys.length > 0) {
          results = results.filter((item) =>
            filterKeys.every((filterName) => {
              const filters = selectedFilters[filterName];
              if (filters.length === 0) return true;
              return filters.some((filterVal) =>
                (item[filterName.toLowerCase().replace(/\s+/g, '_')] || '')
                  .toLowerCase()
                  .includes(filterVal.toLowerCase())
              );
            })
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
            disabled={page === '...'}
            aria-label={typeof page === 'number' ? `Go to page ${page}` : 'ellipsis'}
          >
            {page}
          </button>
        ));
      };

      const activeFilterCount = Object.values(selectedFilters).reduce(
        (total, filterArray) => total + filterArray.length,
        0
      );

      const toggleSection = (section) => {
        setOpenSections((prev) => ({
          ...prev,
          [section]: !prev[section],
        }));
      };

      const toggleFilters = () => {
        setIsFiltersOpen((prev) => !prev);
      };

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

      // Common Checkbox Component
      const FilterCheckbox = ({ category, label, isChecked }) => (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isChecked}
            onChange={() => handleFilterChange(category, label)}
          />
          <div className="w-[18px] h-[18px] border-2 border-black flex items-center justify-center peer-checked:bg-white">
            <svg
              className={`w-3 h-3 text-black ${isChecked ? 'block' : 'hidden'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-gray-700">{label}</span>
        </label>
      );

      return (
        <div className="p-6 bg-[#F5F5F5]">
          <div className="max-w-4xl mx-auto mb-6">
            {/* SearchInput component */}
          </div>

          <div className="max-w-[1512px] mx-auto mb-4 mt-16 lg:hidden">
            <img
              src={filterLogo}
              alt="Show Filters"
              onClick={toggleFilters}
              className="px-4 py-2 rounded-md cursor-pointer"
              aria-label="Show Filters"
            />
          </div>

          {isAnalyzing && (
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-10 rounded-lg text-center">
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

          <div className="flex flex-col lg:flex-row gap-4 max-w-[1512px] mx-auto">
            <div
              className={`w-full lg:w-[373px] bg-[#F5F5F5] p-4 overflow-y-auto lg:block mt-16 lg:mt-0 ${
                isFiltersOpen ? 'block' : 'hidden'
              }`}
              style={{ minHeight: '1583px' }}
            >
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  {activeFilterCount.toString().padStart(2, '0')} Filters Active Now
                </span>
              </div>

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
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

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
                    {[
                      'Bathroom Wall Tiles',
                      'Kitchen Wall Tiles',
                      'Living Room Wall Tiles',
                      'Outdoor Wall Tiles',
                      'Bedroom Wall Tiles',
                      'Wall Tiles for Commercial Spaces',
                    ].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="wallTiles"
                        label={label}
                        isChecked={selectedFilters.wallTiles.includes(label)}
                      />
                    ))}
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
                    {[
                      'Eternity',
                      'The Ultima – 4DX',
                      'Infinity',
                      'Grestough',
                      'Vitronite',
                      'DuRock – 40x40cm',
                      'Step Stone',
                      'Ceramic Tiles',
                    ].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="floorTiles"
                        label={label}
                        isChecked={selectedFilters.floorTiles.includes(label)}
                      />
                    ))}
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
                    {[
                      '120x240 cm',
                      '120x120 cm',
                      '80x260 cm',
                      '120x180 cm',
                      '80x240 cm',
                      '80x160 cm',
                    ].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="sizes"
                        label={label}
                        isChecked={selectedFilters.sizes.includes(label)}
                      />
                    ))}
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
                    {[
                      'Polish',
                      'Gloss Matt',
                      'Matt',
                      'Carving',
                      'Superwhite',
                      'Marbletech',
                      'Metallic',
                      'Rotomatt',
                    ].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="finishes"
                        label={label}
                        isChecked={selectedFilters.finishes.includes(label)}
                      />
                    ))}
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
                    {['Premium', 'Standard', 'Economy'].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="ranges"
                        label={label}
                        isChecked={selectedFilters.ranges.includes(label)}
                      />
                    ))}
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
                    {['Smooth', 'Rough', 'Textured'].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="textures"
                        label={label}
                        isChecked={selectedFilters.textures.includes(label)}
                      />
                    ))}
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
                    {['White', 'Black', 'Grey', 'Beige'].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="colors"
                        label={label}
                        isChecked={selectedFilters.colors.includes(label)}
                      />
                    ))}
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
                    {['Under $10', '$10 - $20', '$20 - $50', 'Above $50'].map((label) => (
                      <FilterCheckbox
                        key={label}
                        category="priceRange"
                        label={label}
                        isChecked={selectedFilters.priceRange.includes(label)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 lg:hidden">
                <button
                  onClick={toggleFilters}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  aria-label="Apply Filters"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            <div
              className={`w-full lg:w-[1139px] bg-white p-4 shadow overflow-y-auto ${
                isFiltersOpen ? 'hidden lg:block' : 'block'
              }`}
              style={{ minHeight: '1583px' }}
            >
              <div className="mb-4 flex justify-between items-center flex-wrap">
                <span className="text-sm text-gray-600">
                  Filter by {filteredResults.length} 2x2 tiles available
                </span>
                <div className="flex gap-2 items-center">
                  <img
                    src={threeLogo}
                    alt="3 per row"
                    onClick={() => setIsFourColLayout(false)}
                    className={`w-8 h-8 cursor-pointer p-1 border rounded ${
                      !isFourColLayout ? 'border-blue-500' : 'border-transparent'
                    } hover:border-blue-400`}
                  />
                  <img
                    src={fourLogo}
                    alt="4 per row"
                    onClick={() => setIsFourColLayout(true)}
                    className={`w-8 h-8 cursor-pointer p-1 border rounded ${
                      isFourColLayout ? 'border-blue-500' : 'border-transparent'
                    } hover:border-blue-400`}
                  />
                </div>
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  isFourColLayout ? 'md:grid-cols-4' : 'md:grid-cols-3'
                } gap-4 mx-auto`}
              >
                {isAnalyzing ? (
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
                              opacity-0 hover:opacity-60 transition-all duration-300
                              flex flex-col items-center justify-center
                              cursor-pointer
                              text-white
                              select-none
                              group
                              overflow-hidden
                            "
                          >
                            <div
                              className="
                                transform translate-y-10 opacity-0
                                group-hover:translate-y-0 group-hover:opacity-100
                                transition-all duration-500 ease-out
                                delay-200
                                flex flex-col items-center mb-6
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
                                <img src={heartLogo} alt="Heart" />
                              </div>
                              <span className="text-sm font-semibold tracking-wide">REMEMBER THIS</span>
                            </div>
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