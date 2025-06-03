import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiUser, FiMapPin } from "react-icons/fi";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import line from '../../assets/headerfooter/Line 67.png';
import gress from '../../assets/headerfooter/Gress 1.png'; 
import tile from '../../assets/headerfooter/image 9.png'; 
import kerovit from '../../assets/headerfooter/Kerovit 1.png';
import vitronite from '../../assets/headerfooter/Vitronite Blue 1.png'; 
import menutiles from '../../assets/headerfooter/Menu-Tiles 2 1.png'; 
import eternity from '../../assets/headerfooter/Eternity blue.png';
import mail from '../../assets/headerfooter/mail.png';
import phone from '../../assets/headerfooter/Vector.png';
import profile from '../../assets/headerfooter/Profile.png';
import Search from '../../assets/headerfooter/Search.png';
import address from '../../assets/headerfooter/Frame 48096078.png';
import dropdown from '../../assets/headerfooter/caret.png';
import logo from '../../assets/headerfooter/logo.png';
import profile2 from '../../assets/headerfooter/Profile2.png'; 
import heart from '../../assets/headerfooter/heart.png';
import logout from '../../assets/headerfooter/Logout.png';
import gressbond from '../../assets/headerfooter/gressbond.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref to track the header element
  const headerRef = useRef(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Handle clicks outside the header
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the headerRef
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null); // Close any open dropdown
        setIsDropdownOpen(false); // Close profile dropdown
        setIsOpen(false); // Close search modal
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={headerRef} className="font-urbanist fixed top-0 right-[2px] w-screen bg-white z-40">
      {/* Top Contact Bar */}
      <div className="flex justify-between px-4 py-2 text-sm text-gray-600">
        <div className="flex text-xs mx-20 gap-4">
          <span className="flex flex-col-2 gap-x-2"><img src={phone} alt='phone' className="size-4"/> 1800 309 309</span>
          <span className="flex flex-col-2 gap-x-2"><img src={mail} alt='mail' className="size-4"/> info@kajariaceramics.com</span>
        </div>
        <div className="flex text-xs mr-[73px] gap-6">
          <a href="#">CAREER</a>
          <a href="#">CONTACT US</a>
        </div>
      </div>
      {/* line segment */}
      <hr className="border-gray-300 w-full" />

      {/* Main Header */}
      <div>
        <div className="flex items-center w-full px-6 py-3 ml-20">
          <div>
            <img src={logo} alt="logo" className="ml-12 w-36"/>
          </div>

          <nav className="hidden lg:flex mr-[230px] ml-8 gap-10 font-semibold text-xs">
            {['PRODUCTS', 'ABOUT US', 'CATALOGUES', 'RESOURCES', 'INVESTOR'].map((item) => (
              <div
                key={item}
                onClick={() => toggleDropdown(item)}
                className="cursor-pointer flex items-center gap-1"
              >
                {item}
                {item !== 'CATALOGUES' && (
                  openDropdown === item ? (
                    <HiOutlineChevronUp className="text-sm" />
                  ) : (
                    <HiOutlineChevronDown className="text-sm" />
                  )
                )}
              </div>
            ))}
          </nav>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 text-xs">
              <img src={address} alt="address" className="size-5" /> WHERE TO BUY
            </div>

            {isOpen ? (
              <FiX
                className="size-5 text-black cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            ) : (
              <img
                src={Search}
                alt="search"
                className="size-5 -ml-2 cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            )}

            <img
              src={profile}
              alt='profile'
              className="size-5 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            <img src={dropdown} alt="drop" className="-ml-5"/>
            {/* Profile Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-[94px] right-6 bg-white shadow-lg mx-4 py-6 w-[200px] h-[130px]">
                <ul className="text-sm text-left space-y-3 px-12">
                  <li className="hover:text-blue-600 cursor-pointer"><img src={heart} alt="heart" className="w-[18px] h-[18px] -ml-7 -mb-[18px]"/>Favourite List</li>
                  <li className="hover:text-blue-600 cursor-pointer"><img src={profile2} alt="profile2" className="w-[18px] h-[18px] -ml-7 -mb-[18px]"/>Account Setting</li>
                  <li className="hover:text-blue-600 cursor-pointer"><img src={logout} alt="logout" className="w-[18px] h-[18px] -ml-7 -mb-[19px]"/>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>

         {/* Dropdown Content */}
     {openDropdown === 'PRODUCTS' && (
        <div className="fixed w-[1512px] h-[418px] ml-5 bg-white py-10 grid grid-cols-7 gap-10 text-sm animate-slide-down">
            <div className="flex flex-col items-start mt-2">
            <h3 className="font-urbanist text-3xl mb-8 ml-15">Categories</h3>
            <ul className="max-w-full ml-15 space-y-6">
                <li className="flex flex-row items-center flex-nowrap hover:text-blue-700">
                <span className="whitespace-nowrap">Glazed Vitrified Tiles -</span>
                <img src={eternity} alt="eternity" className="w-[85.26px] h-[12px] ml-1" />
                </li>
                <li className="flex flex-row items-center flex-nowrap hover:text-blue-700">
                <span className="whitespace-nowrap">Gres Floor & Wall Tiles -</span>
                <img src={gress} alt="gress" className="w-[45.5px] h-[14px] ml-1" />
                </li>
                <li className="flex flex-row items-center flex-nowrap hover:text-blue-700">
                <span className="whitespace-nowrap">Polished Vitrified Tiles -</span>
                <img src={vitronite} alt="vitronite" className="w-[45.5px] h-[14px] ml-1" />
                </li>
                <li className="flex flex-row items-center flex-nowrap hover:text-blue-700">
                <span className="whitespace-nowrap">Faucets and Sanitaryware -</span>
                <img src={kerovit} alt="kerovit" className="w-[45.5px] h-[14px] ml-1" />
                </li>
                <li className="flex flex-row items-center flex-nowrap hover:text-blue-700">
                <span className="whitespace-nowrap">Tile Adhesive -</span>
                <img src={gressbond} alt="gressbond" className="w-[96.59px] h-[15px] ml-1" />
                </li>
            </ul>
            </div>

            <img src={line} alt="line" className="h-[417px] -my-10 mx-44 text-gray-600 " />
            <div className="flex flex-col justify-center items-end mb-28">
            <h3 className="font-urbanist text-3xl pr-[20px] mb-8">Applications</h3>
            <ul className="space-y-6 text-left pr-[60px] text-nowrap">
                <li className="hover:text-blue-700">Bathroom Tiles</li>
                <li className="hover:text-blue-700">Kitchen Tiles</li>
                <li className="hover:text-blue-700">Living Room Tiles</li>
                <li className="hover:text-blue-700">Bedroom Tiles</li>
                <li className="hover:text-blue-700">Outdoor Tiles</li>
                <li className="hover:text-blue-700">Commercial Tiles</li>
            </ul>
            </div>
            <img src={line} alt="line" className="h-[417px] -my-10 mx-[40px] text-gray-600" />
            <div className="flex flex-col justify-center items-end mb-28">
            <h3 className="font-urbanist text-3xl pr-[90px] text-nowrap mb-8">Trending Products</h3>
            <ul className="space-y-6 text-left pr-[240px] text-nowrap">
                <li className="hover:text-blue-700">The Ultima</li>
                <li className="hover:text-blue-700">Grestough</li>
                <li className="hover:text-blue-700">Vitronite</li>
                <li className="hover:text-blue-700">Kasamood</li>
                <li className="hover:text-blue-700">Gres Art</li>
                <li className="hover:text-blue-700">Dura Tech</li>
            </ul>
            </div>
            <img src={menutiles} alt="tile" className="w-full h-[380px] -mx-2" />
            <img src={tile} alt="image" className="max-w-96 h-[426px] opacity-100 -mx-[1220px]" />
        </div>


        )}

         {openDropdown === 'ABOUT US' && (
          <div className="absolute left-[350px] w-[430px] h-[438px] bg-white px-20 py-10 text-sm overflow-hidden animate-slide-down">
            <ul className="grid grid-rows-2 gap-8 text-left">
              <li className="hover:text-blue-700">Overview</li>
              <li className="hover:text-blue-700">Manufacturing Facilities</li>
              <li className="hover:text-blue-700">Our Export</li>
              <li className="hover:text-blue-700">Sustainability</li>
              <li className="hover:text-blue-700">Chairman's Message</li>
              <li className="hover:text-blue-700">Corporate Social Responsibility</li>
              <li className="hover:text-blue-700">Awards and Certification</li>
            </ul>
            <img src={line} alt="line" className="rotate-90 w-[1px] h-[350px] -my-[265px] mx-32"/>
            <img src={tile} alt="image" className="absolute bottom-12 left-[280px] w-[280px] opacity-100 rotate-45 pointer-events-none"/>
          </div>
        )}
        {openDropdown === 'RESOURCES' && (
          <div className="absolute left-[600px] w-[230px] h-[231px] bg-white px-20 py-10 animate-slide-down text-sm">
            <ul className="grid grid-cols-1 mt-5 text-nowrap gap-7 text-left -mx-7">
              <li className="hover:text-blue-700">News and Media</li>
              <li className="hover:text-blue-700">Blogs & Articles </li>
              <li className="hover:text-blue-700">Video Gallery</li>
            </ul>
          </div>
        )}

        {openDropdown === 'INVESTOR' && (
          <div className="fixed w-[1512px] h-[418px] bg-white py-12 animate-slide-down grid grid-cols-8 gap-10 text-sm">
            <h1 className="font-urbanist -my-3 text-nowrap text-2xl pl-[130px]">Reports and details</h1>
            <div>
              <ul className="space-y-6 fixed my-[50px] text-left left-[150px]">
                <li className="hover:text-blue-700">3Year Mission Statement </li>
                <li className="hover:text-blue-700">AGM/EGM/Postal Ballot</li>
                <li className="hover:text-blue-700">Annual Reports</li>
                <li className="hover:text-blue-700">Board Meeting Notices</li>
                <li className="hover:text-blue-700">BOD and its Committees</li>
                <li className="hover:text-blue-700">Capital History</li>
              </ul>
            </div>
            <img src={line} alt="line" className="h-[336px] w-[1px] my-9 -mx-5"/>
            <div>
              <ul className="space-y-6 fixed my-[50px] text-left left-[410px]">
                <li className="hover:text-blue-700">Conference Call</li>
                <li className="hover:text-blue-700">Corporate Governance</li>
                <li className="hover:text-blue-700">Corporate Presentation</li>
                <li className="hover:text-blue-700">Disclosure/Intimation</li>
                <li className="hover:text-blue-700">ESOP</li>
                <li className="hover:text-blue-700">Financial At a Glance</li>
              </ul>
            </div>
            <img src={line} alt="line" className="h-[336px] w-[1px] my-9 -mx-28"/>
            <div>
              <ul className="space-y-6 fixed my-[50px] text-left left-[707px]">
                <li className="hover:text-blue-700">Financial Results</li>
                <li className="hover:text-blue-700">Investor Release</li>
                <li className="hover:text-blue-700">Investors Meet</li>
                <li className="hover:text-blue-700">Scheme of Arrangement</li>
                <li className="hover:text-blue-700">Share Holder Query</li>
                <li className="hover:text-blue-700">Shareholding Pattern</li>
              </ul>
            </div>
            <img src={line} alt="line" className="h-[336px] w-[1px] my-9 -mx-60"/>
            <div>
              <ul className="space-y-6 fixed my-[50px] text-left left-[960px]">
                <li className="hover:text-blue-700">Subsidiary / Joint Venture</li>
                <li className="hover:text-blue-700">Trading Window</li>
                <li className="hover:text-blue-700">Unclaimed Dividend / IEPF</li>
                <li className="hover:text-blue-700">Website of Online Resolution of <br/> Disputes (Smart) ODR</li>
              </ul>
            </div>
            <img src={tile} alt="image" className="h-[410px] w-48 opacity-100 rotate-12 -my-[530px] mx-[1050px]"/>
          </div>
        )}
      </div>

      {/* Fullscreen Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white w-[600px] max-w-full p-6 rounded-2xl shadow-lg relative">
            {/* Search bar + Close icon */}
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Type what you're looking for..."
                className="w-full text-base p-2 border-b outline-none"
              />
            </div>

            {/* Recent Searches */}
            <div>
              <p className="text-xs text-gray-500 mb-2">RECENT SEARCHES</p>
              <ul className="mb-6 text-sm">
                {['Ceramic Tiles', 'Wall Tiles', 'Floor Tiles'].map((item, i) => (
                  <li key={i} className="py-2 border-b flex items-center gap-2">
                    <span>⏳</span> {item}
                  </li>
                ))}
              </ul>

              {/* Popular Searches */}
              <p className="text-xs text-gray-500 mb-2">POPULAR SEARCHES</p>
              <ul className="text-sm">
                {['Porcelain Tiles', 'Kitchen Tiles', 'Bathroom Tiles'].map((item, i) => (
                  <li key={i} className="py-2 border-b flex items-center gap-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;