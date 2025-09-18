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
    wallTiles: [],
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
        wallTiles: [],
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
        className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
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
    <div className="d-flex flex-column gap-2 animate-pulse" style={{ height: '495px' }}>
      <div
        className="bg-secondary w-100 rounded"
        style={{ height: isFourColLayout ? '260px' : '353px', width: isFourColLayout ? '259.5px' : '353px' }}
      ></div>
      <div className="d-flex flex-column gap-2">
        <div className="bg-secondary h-5 w-75 rounded"></div>
        <div className="bg-secondary h-4 w-50 rounded"></div>
        <div className="bg-secondary h-4 w-66 rounded"></div>
      </div>
    </div>
  );

  const FilterCheckbox = ({ category, label, isChecked }) => (
    <div className="form-check custom-checkbox mb-2" style={{ marginBottom: '8px' }}>
      <input
        type="checkbox"
        className="form-check-input"
        checked={isChecked}
        onChange={() => handleFilterChange(category, label)}
        id={`${category}-${label}`}
        style={{ width: '16px', height: '16px', marginTop: '2px' }}
      />
      <label
        className="form-check-label"
        htmlFor={`${category}-${label}`}
        style={{ marginLeft: '8px', fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center' }}
      >
        {label}
      </label>
    </div>
  );

  return (
    <div className="p-4 bg-light" style={{ padding: '16px' }}>
      <style>
        {`
          .product-image-container {
            position: relative !important;
            overflow: hidden !important;
          }
          .hover-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.5) !important;
            opacity: 0 !important;
            transition: opacity 0.5s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .product-image-container:hover .hover-overlay {
            opacity: 1 !important;
          }
          .hover-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            transform: translateY(100%) !important;
            transition: transform 0.5s ease !important;
          }
          .product-image-container:hover .hover-content {
            transform: translateY(0) !important;
          }
          .heart-button {
            cursor: pointer !important;
          }
          .heart-button img {
            width: 24px !important;
            height: 24px !important;
          }
          .hover-text-dark:hover {
            color: #1a202c !important;
          }
          .hover-border-primary:hover {
            border-color: #007bff !important;
          }
          .filter-section {
            padding: 16px !important;
            background: #F9FAFB !important;
            border-right: 1px solid #E5E7EB !important;
          }
          .filter-section h3 {
            font-size: 14px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #1F2937 !important;
            margin: 0 !important;
          }
          .filter-section h4 {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #6B7280 !important;
            margin: 8px 0 4px 8px !important;
          }
          .filter-section .form-check {
            margin-bottom: 8px !important;
          }
          .filter-section .form-check-label {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            font-size: 14px !important;
            color: #6B7280 !important;
          }
          .filter-section button {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: #3B82F6 !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin-top: 4px !important;
          }
          .product-grid {
            display: grid !important;
            grid-template-columns: repeat(${isFourColLayout ? 4 : 3}, 1fr) !important;
            gap: 16px !important;
          }
          @media (max-width: 768px) {
            .product-grid {
              grid-template-columns: repeat(1, 1fr) !important;
            }
          }
          .form-check-input {
            position: relative !important;
            appearance: checkbox !important;
          }
          .checkmark {
            display: none !important;
          }
        `}
      </style>
      <div className="container mb-4" style={{ maxWidth: '960px', marginBottom: '16px' }}>
        {/* SearchInput component */}
      </div>

      <div className="container d-block d-lg-none mb-4 mt-5" style={{ marginBottom: '16px', marginTop: '20px' }}>
        <img
          src={filterLogo}
          alt="Show Filters"
          onClick={toggleFilters}
          className="p-2 rounded cursor-pointer"
          style={{ padding: '8px', width: '70px', height: '70px' }}
          aria-label="Show Filters"
        />
      </div>

      {isAnalyzing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-50">
          <div className="bg-white p-5 rounded text-center" style={{ padding: '20px' }}>
            <video
              src={cube}
              autoPlay
              loop
              muted
              className="w-12 h-12 object-contain d-md-block w-md-40 h-md-40"
              style={{ width: '48px', height: '48px' }}
            />
          </div>
        </div>
      )}

      <div className="container-fluid" style={{ maxWidth: '1512px' }}>
        <div className="row gx-4" style={{ columnGap: '16px' }}>
          <div
            className={`col-12 col-lg-3 bg-light p-4 overflow-y-auto d-lg-block mt-5 mt-lg-0 ${isFiltersOpen ? 'd-block' : 'd-none'} filter-section`}
            style={{ padding: '16px', marginTop: '20px', background: '#F9FAFB', borderRight: '1px solid #E5E7EB' }}
          >
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <span className="text-sm text-secondary" style={{ fontSize: '12px', color: '#6B7280' }}>
                {activeFilterCount.toString().padStart(2, '0')} Filters Active Now
              </span>
            </div>

            {uploadedImage && (
              <div className="mb-4 position-relative d-none d-lg-block" style={{ marginBottom: '16px' }}>
                <div className="border border-secondary bg-white uploaded-image-container" style={{ border: '1px solid #D1D5DB', borderRadius: '8px' }}>
                  <img
                    src={uploadedImage}
                    alt="Uploaded Tile"
                    className="w-100 h-100 object-cover"
                    style={{ width: '336px', height: '362px', borderRadius: '8px' }}
                  />
                  <label
                    htmlFor="change-image-sidebar"
                    className="position-absolute bottom-0 start-0 m-2 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                    style={{ margin: '8px', width: '40px', height: '40px', bottom: '0', left: '0' }}
                    aria-label="Change image"
                  >
                    <img src={uploadIcon} alt="Upload Icon" style={{ width: '24px', height: '24px' }} />
                    <input
                      type="file"
                      id="change-image-sidebar"
                      accept="image/*"
                      className="d-none"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-danger mb-4" style={{ fontSize: '12px', color: '#EF4444', marginBottom: '16px' }}>{error}</p>}

            {/* Wall Tiles Section */}
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('wallTiles')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Wall Tiles</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.wallTiles ? '▾' : '▸'}</span>
              </div>
              {openSections.wallTiles && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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
                  <button className="text-primary text-sm fw-medium mt-1" style={{ fontSize: '12px', fontWeight: '500', color: '#3B82F6', marginTop: '4px' }}>+ Show More</button>
                </div>
              )}
            </div>

            {/* Floor Tiles Section */}
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('floorTiles')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Floor Tiles</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.floorTiles ? '▾' : '▸'}</span>
              </div>
              {openSections.floorTiles && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
                  <h4 className="text-sm fw-semibold text-secondary ms-2 mb-1" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', margin: '8px 0 4px 8px' }}>Trending Category</h4>
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
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('sizes')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Sizes</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.sizes ? '▾' : '▸'}</span>
              </div>
              {openSections.sizes && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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
                  <button className="text-primary text-sm fw-medium mt-1" style={{ fontSize: '12px', fontWeight: '500', color: '#3B82F6', marginTop: '4px' }}>+ Show More</button>
                </div>
              )}
            </div>

            {/* Finishes Section */}
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('finishes')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Finishes</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.finishes ? '▾' : '▸'}</span>
              </div>
              {openSections.finishes && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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
                  <button className="text-primary text-sm fw-medium mt-1" style={{ fontSize: '12px', fontWeight: '500', color: '#3B82F6', marginTop: '4px' }}>+ Show More</button>
                </div>
              )}
            </div>

            {/* Ranges Section */}
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('ranges')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Ranges</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.ranges ? '▾' : '▸'}</span>
              </div>
              {openSections.ranges && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('textures')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Textures</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.textures ? '▾' : '▸'}</span>
              </div>
              {openSections.textures && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('colors')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Colors</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.colors ? '▾' : '▸'}</span>
              </div>
              {openSections.colors && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
                  {['White', 'Black', 'Grey', 'Beige'].map((label) => (
                    <FilterCheckbox
                      key={label}
                      category="colors"
                      label={label}
                      isChecked={selectedFilters.colors.includes(label)}
                    />
                  ))}
                  <button className="text-primary text-sm fw-medium mt-1" style={{ fontSize: '12px', fontWeight: '500', color: '#3B82F6', marginTop: '4px' }}>+ Show More</button>
                </div>
              )}
            </div>

            {/* Price Range Section */}
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              <div
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => toggleSection('priceRange')}
                style={{ marginBottom: '8px' }}
              >
                <h3 className="text-sm fw-bold text-uppercase text-dark" style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Price Range</h3>
                <span className="text-secondary" style={{ fontSize: '14px', color: '#6B7280' }}>{openSections.priceRange ? '▾' : '▸'}</span>
              </div>
              {openSections.priceRange && (
                <div className="d-flex flex-column gap-1" style={{ gap: '8px' }}>
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

            <div className="mt-4 d-lg-none" style={{ marginTop: '16px' }}>
              <button
                onClick={toggleFilters}
                className="w-100 btn btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#3B82F6', borderRadius: '8px' }}
                aria-label="Apply Filters"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div
            className={`col-12 col-lg-9 bg-white p-4 shadow overflow-y-auto results-section ${isFiltersOpen ? 'd-none d-lg-block' : 'd-block'}`}
            style={{ padding: '16px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
          >
            {uploadedImage && (
              <div className="mb-4 position-relative d-block d-lg-none" style={{ marginBottom: '16px' }}>
                <div className="border border-secondary bg-white uploaded-image-container" style={{ border: '1px solid #D1D5DB', borderRadius: '8px' }}>
                  <img
                    src={uploadedImage}
                    alt="Uploaded Tile"
                    className="w-100 h-100 object-cover"
                    style={{ width: '336px', height: '362px', borderRadius: '8px' }}
                  />
                  <label
                    htmlFor="change-image-products"
                    className="position-absolute bottom-0 start-0 m-2 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                    style={{ margin: '8px', width: '40px', height: '40px', bottom: '0', left: '0' }}
                    aria-label="Change image"
                  >
                    <img src={uploadIcon} alt="Upload Icon" style={{ width: '24px', height: '24px' }} />
                    <input
                      type="file"
                      id="change-image-products"
                      accept="image/*"
                      className="d-none"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap" style={{ marginBottom: '16px' }}>
              <span className="text-sm text-secondary" style={{ fontSize: '12px', color: '#6B7280' }}>
                Filter by {filteredResults.length} 2x2 tiles available
              </span>
              <div className="d-flex gap-2 align-items-center" style={{ gap: '8px' }}>
                <img
                  src={threeLogo}
                  alt="3 per row"
                  onClick={() => setIsFourColLayout(false)}
                  className={`w-8 h-8 cursor-pointer p-1 border rounded ${!isFourColLayout ? 'border-primary' : 'border-transparent'} hover-border-primary`}
                  style={{ width: '32px', height: '32px', padding: '4px', borderWidth: '2px', borderRadius: '4px' }}
                />
                <img
                  src={fourLogo}
                  alt="4 per row"
                  onClick={() => setIsFourColLayout(true)}
                  className={`w-8 h-8 cursor-pointer p-1 border rounded ${isFourColLayout ? 'border-primary' : 'border-transparent'} hover-border-primary`}
                  style={{ width: '32px', height: '32px', padding: '4px', borderWidth: '2px', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div className="product-grid">
              {isAnalyzing ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <div key={idx} className="col">
                    <ProductPlaceholder />
                  </div>
                ))
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product, idx) => {
                  console.log('product', product)
                  const { url, score, filename, productName, productUrl, sizes, category } = product;
                  const imageUrl = url;
                  console.log(productUrl);

                  return (
                    <div
                      key={url + idx}
                      className={`col d-flex flex-column cursor-pointer gap-2 product-card ${isFourColLayout ? 'product-card-four-col' : ''}`}
                      onClick={() =>
                        setSelectedProduct({
                          image: imageUrl,
                          filename,
                          score,
                          productUrl,
                        }
                      )

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
                        className={`position-relative product-image-container ${isFourColLayout ? 'product-image-container-four-col' : ''}`}
                        style={{ height: isFourColLayout ? '260px' : '353px' }}
                      >
                        <img
                          src={imageUrl}
                          alt={filename}
                          className="w-100 h-100 object-fit-cover"
                          style={{
                            width: isFourColLayout ? '259.5px' : '353px',
                            height: isFourColLayout ? '260px' : '353px',
                            borderRadius: '8px',
                          }}
                          onError={(e) => {
                            if (!failedImages.current.has(url)) {
                              failedImages.current.add(url);
                              e.target.src = '/images/fallback.jpg';
                              console.error(`Failed to load image: ${url}`);
                            }
                          }}
                        />

                      </div>
                      <div className="d-flex flex-column product-details">
                        <p className="fs-6 fw-bold text-dark text-uppercase text-start mb-3 mt-3" style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>{productName}</p>

                        <div className="d-flex align-items-center" style={{  height: '50px'}}>
                          <div className="d-flex align-items-center h-100" style={{ width: "100%" }}>
                            <span
                              style={{ color: 'rgba(166, 135, 64, 1)', letterSpacing: '0.3em', fontSize: '12px', fontWeight: '600'}}
                              className="fw-semibold text-xs text-uppercase">
                              {category}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-secondary mx-2" style={{ height: '16px', width: '1px', backgroundColor: '#D1D5DB', margin: '0 8px' }}></div>
                          <div
                            className="d-flex align-items-center text-xs text-secondary ms-5"
                            style={{ height: '100%', gap: '4px', whiteSpace: 'nowwrap', marginLeft: '20px' }}
                          >

                            <span style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>{sizes}</span>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-secondary col-span-full" style={{ fontSize: '14px', color: '#6B7280' }}>No products found.</p>
              )}
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap" style={{ marginTop: '16px', gap: '8px' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline-secondary btn-sm mx-1"
                style={{ padding: '4px 12px', fontSize: '12px', margin: '0 4px' }}
                aria-label="Previous page"
              >
                Prev
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-outline-secondary btn-sm mx-1"
                style={{ padding: '4px 12px', fontSize: '12px', margin: '0 4px' }}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && selectedProduct.productUrl && (
  window.location.href = selectedProduct.productUrl


      )}
    </div>
  );
};

export default SearchResults;