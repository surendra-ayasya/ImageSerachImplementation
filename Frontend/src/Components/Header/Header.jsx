import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiUser, FiMapPin, FiMenu, FiCamera } from "react-icons/fi";
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
import { useNavigate } from "react-router-dom";
import history from "../../assets/headerfooter/History.png";
import trend from "../../assets/headerfooter/Trend.png";
import close from "../../assets/headerfooter/Close.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [animateOut, setAnimateOut] = useState(false); //function to control the animation effect
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); //it toggles the menu icon [from menu.jsx] whose path is defined in app.jsx

  // Ref to track the header element
  const headerRef = useRef(null);

  const toggleDropdown = (menu) => {
    if (openDropdown === menu) {
      setAnimateOut(true); // Start fade-out animation
      setTimeout(() => {
        setOpenDropdown(null);
        setAnimateOut(false); // Reset for next open
      }, 800); // Match this duration with your CSS animation duration
    } else {
      setOpenDropdown(menu);
    }
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
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className="relative font-urbanist xl:mt-6 right-[2px] w-screen bg-white z-[100]"
    >
      {/* Top Contact Bar */}
      <div className="hidden xl:flex justify-between px3 -py-5 text-sm text-gray-600">
        <div className="flex text-xs mx-20 gap-4">
          <span className="flex flex-col-2 gap-x-2">
            <img src={phone} alt="phone" className="size-4" /> 1800 309 309
          </span>
          <span className="flex flex-col-2 gap-x-2">
            <img src={mail} alt="mail" className="size-4" />{" "}
            info@kajariaceramics.com
          </span>
        </div>
        <div className="flex text-xs mr-[73px] gap-6">
          <a href="#">CAREER</a>
          <a href="#">CONTACT US</a>
        </div>
      </div>
      {/* line segment */}
      <hr className="border-gray-300 w-full" />
      
      {/* Main Header */}
      <div className="mt-0">
        <div className="flex items-center w-full px-6 py-4 shadow">
          <div className="flex justify-center xl:justify-start w-full">
            <img src={logo} alt="logo" className="md:ml-12 xl:ml-[60px] w-36" />
          </div>
          {/* Mobile/Tablet Menu & Search Icons */}
          <div className="flex items-center justify-end xl:hidden">
            {/* Search Icon */}
            <img //this search icon is for mobile view
              src={Search}
              alt="search"
              className="w-[24px] h-[24px] absolute right-12 top-[40px] cursor-pointer xl:hidden"
              onClick={() => navigate("/search")}
            />

            {/* Hamburger Icon */}
            <button
              onClick={() => {
                if (mobileMenuOpen) {
                  setMobileMenuOpen(false);
                  navigate("/"); //navigate to a page you want to go after closing
                } else {
                  setMobileMenuOpen(true);
                  navigate("/menu");
                }
              }}
              className="focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FiX className="w-[24px] h-[24px] absolute left-2 top-[40px] ml-5 xl:hidden" />
              ) : (
                <FiMenu className="w-[24px] h-[24px] absolute left-2 top-[40px] ml-5 xl:hidden" />
              )}
            </button>
          </div>

          <nav className="hidden xl:flex absolute left-[330px]  -ml-7 gap-12 font-semibold text-nowrap text-xs">
            {[
              "PRODUCTS",
              "ABOUT US",
              "CATALOGUES",
              "RESOURCES",
              "INVESTOR",
            ].map((item) => (
              <div
                key={item}
                onClick={() => toggleDropdown(item)}
                className="cursor-pointer flex items-center gap-1"
              >
                {item}
                {item !== "CATALOGUES" &&
                  (openDropdown === item ? (
                    <HiOutlineChevronUp className="text-sm" />
                  ) : (
                    <HiOutlineChevronDown className="text-sm" />
                  ))}
              </div>
            ))}
          </nav>

          <div className="hidden xl:flex gap-10 mr-[70px] items-center ">
            <div className="flex items-center font-urbanist text-nowrap text-xs">
              <img src={address} alt="address" className="size-5" /> WHERE TO
              BUY
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
              alt="profile"
              className="size-5 mr-12 -mx-3 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            <img src={dropdown} alt="drop" className="-ml-[90px]" />
            {/* Profile Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-[94px] right-6 bg-white shadow-lg mx-4 py-6 w-[200px] h-[130px]">
                <ul className="text-sm text-left space-y-3 px-12">
                  <li className="hover:text-blue-600 cursor-pointer">
                    <img
                      src={heart}
                      alt="heart"
                      className="w-[18px] h-[18px] -ml-7 -mb-[18px]"
                    />
                    Favourite List
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    <img
                      src={profile2}
                      alt="profile2"
                      className="w-[18px] h-[18px] -ml-7 -mb-[18px]"
                    />
                    Account Setting
                  </li>
                  <li className="hover:text-blue-600 cursor-pointer">
                    <img
                      src={logout}
                      alt="logout"
                      className="w-[18px] h-[18px] -ml-7 -mb-[19px]"
                    />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Content */}
             {openDropdown === "PRODUCTS" && (
                <div className={`absolute top-full left-0 w-screen bg-white shadow py-8 grid grid-cols-7 text-sm z-50 ${
                  animateOut ? "shutter-up" : "shutter-down"
                }`}
                >
              <div className="relative pl-[100px]">
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
            <img
              src={line}
              alt="line"
              className={`absolute left-[31%] h-[420px] text-gray-600 ${animateOut ? "shutter-up" : "shutter-down"}`}/>

            <div className="flex flex-col justify-center -mx-[280px] items-end mb-28">
              <h3 className="font-urbanist text-3xl pr-[20px] mb-8">
                Applications
              </h3>
              <ul className="space-y-6 text-left pr-[60px] text-nowrap">
                <li className="hover:text-blue-700">Bathroom Tiles</li>
                <li className="hover:text-blue-700">Kitchen Tiles</li>
                <li className="hover:text-blue-700">Living Room Tiles</li>
                <li className="hover:text-blue-700">Bedroom Tiles</li>
                <li className="hover:text-blue-700">Outdoor Tiles</li>
                <li className="hover:text-blue-700">Commercial Tiles</li>
              </ul>
            </div>
            <img
              src={line}
              alt="line"
              className={`absolute left-[50%] h-[420px] text-gray-600 ${animateOut ? "shutter-up" : "shutter-down"}`}
            />
            <div className="flex flex-col justify-center items-end -mx-[500px] mb-28">
              <h3 className="font-urbanist text-3xl pr-[90px] text-nowrap mb-8">
                Trending Products
              </h3>
              <ul className="space-y-6 text-left pr-[240px] text-nowrap">
                <li className="hover:text-blue-700">The Ultima</li>
                <li className="hover:text-blue-700">Grestough</li>
                <li className="hover:text-blue-700">Vitronite</li>
                <li className="hover:text-blue-700">Kasamood</li>
                <li className="hover:text-blue-700">Gres Art</li>
                <li className="hover:text-blue-700">Dura Tech</li>
              </ul>
            </div>
            <div className={`col-span-2 absolute right-0 -mt-[25px] flex justify-end ${animateOut ? "shutter-up" : "shutter-down"}`}>
            <img src={menutiles} alt="tile" className="w-full  h-[410px] max-w-none"/>
            </div>
          </div>
        )}

        {openDropdown === "ABOUT US" && (
          <div
            className={`absolute top-[100%] left-[350px] w-[430px] h-[408px] bg-white px-20 py-4 shadow text-sm ${
              openDropdown === "ABOUT US" && animateOut ? "shutter-up" : "shutter-down"}`}>
            <ul className="grid grid-rows-2 gap-7 mt-9 -mx-7 text-left">
              <li className="hover:text-blue-700">Overview</li>
              <li className="hover:text-blue-700">Manufacturing Facilities</li>
              <li className="hover:text-blue-700">Our Export</li>
              <li className="hover:text-blue-700">Sustainability</li>
              <li className="hover:text-blue-700">Chairman's Message</li>
              <li className="hover:text-blue-700">
                Corporate Social Responsibility
              </li>
              <li className="hover:text-blue-700">Awards and Certification</li>
            </ul>
            <img
              src={line}
              alt="line"
              className="rotate-90 w-[1px] h-[350px] -my-[258px] mx-32"
            />
            <img
              src={tile}
              alt="image"
              className="mx-[170px] opacity-55 rotate-180 w-[280px] mb-[50px]"
            />
          </div>
        )}

        {openDropdown === "RESOURCES" && (
          <div
            className={`absolute top-[100%] left-[650px] w-[230px] h-[231px] bg-white px-20 py-4 shadow text-sm ${
              openDropdown === "RESOURCES" && animateOut ? "shutter-up" : "shutter-down"}`}>
            <ul className="grid grid-cols-1 mt-9 text-nowrap gap-7 text-left -mx-7">
              <li className="hover:text-blue-700">News and Media</li>
              <li className="hover:text-blue-700">Blogs & Articles </li>
              <li className="hover:text-blue-700">Video Gallery</li>
            </ul>
          </div>
        )}

        {openDropdown === "INVESTOR" && (
          <div
            className={` absolute top-[100%] w-screen mt-1 bg-white py-7 shadow grid grid-cols-8 gap-10 text-sm ${
              openDropdown === "INVESTOR" && animateOut ? "shutter-up" : "shutter-down" }`}>
            <h1 className="font-urbanist text-nowrap text-2xl pl-[170px]">
              Reports and details
            </h1>
            <div className="mt-6">
              <ul className="space-y-6 -ml-2 my-[50px] text-left">
                <li className="hover:text-blue-700">
                  3Year Mission Statement{" "}
                </li>
                <li className="hover:text-blue-700">AGM/EGM/Postal Ballot</li>
                <li className="hover:text-blue-700">Annual Reports</li>
                <li className="hover:text-blue-700">Board Meeting Notices</li>
                <li className="hover:text-blue-700">BOD and its Committees</li>
                <li className="hover:text-blue-700">Capital History</li>
              </ul>
            </div>
            <img
              src={line}
              alt="line"
              className="h-[336px] w-[1px] my-9 mx-10"
            />
            <div className="mt-6">
              <ul className="space-y-6 -ml-[90px] my-[50px] text-left">
                <li className="hover:text-blue-700">Conference Call</li>
                <li className="hover:text-blue-700">Corporate Governance</li>
                <li className="hover:text-blue-700">Corporate Presentation</li>
                <li className="hover:text-blue-700">Disclosure/Intimation</li>
                <li className="hover:text-blue-700">ESOP</li>
                <li className="hover:text-blue-700">Financial At a Glance</li>
              </ul>
            </div>
            <img
              src={line}
              alt="line"
              className="h-[336px] w-[1px] my-9 -mx-[70px]"
            />
            <div className="mt-6">
              <ul className="space-y-6 my-[50px] -ml-[200px] text-left">
                <li className="hover:text-blue-700">Financial Results</li>
                <li className="hover:text-blue-700">Investor Release</li>
                <li className="hover:text-blue-700">Investors Meet</li>
                <li className="hover:text-blue-700">Scheme of Arrangement</li>
                <li className="hover:text-blue-700">Share Holder Query</li>
                <li className="hover:text-blue-700">Shareholding Pattern</li>
              </ul>
            </div>
            <img
              src={line}
              alt="line"
              className="h-[336px] w-[1px] my-9 -mx-[170px]"
            />
            <div className="mt-6">
              <ul className="space-y-6 -ml-[300px] my-[50px] text-left left-[960px]">
                <li className="hover:text-blue-700">
                  Subsidiary / Joint Venture
                </li>
                <li className="hover:text-blue-700">Trading Window</li>
                <li className="hover:text-blue-700">
                  Unclaimed Dividend / IEPF
                </li>
                <li className="hover:text-blue-700">
                  Website of Online Resolution of <br /> Disputes (Smart) ODR
                </li>
              </ul>
            </div>
            <div className="relative">
            <img
              src={tile}
              alt="image"
              className="h-[410px] w-56 opacity-100 rotate-12 -my-[480px] absolute left-[1170px]"
            /></div>
          </div>
        )}
      </div>

      {/* Fullscreen Search Modal */}
      {isOpen && (
        <div className=" bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white w-[1512px] h-[726px] p-6 shadow-lg relative">
            <FiX
              className="absolute bottom-[750px] right-[151px] size-5 text-yellow-600 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
            {/* Search bar + Close icon */}
            <div className="flex ml-[120px] max-w-[1230px] justify-between border-b-2 items-center mb-4">
              <input
                type="text"
                placeholder="Type what you're looking for..."
                className="w-full text-base p-2 outline-none"
              />
              <FiCamera className="text-yellow-600 mr-8" />
              <FiSearch className="text-yellow-600 mr-8" />
            </div>

            {/* Recent Searches */}
            <div className="mt-10 font-urbanist space-y-12">
              <div className="ml-[120px] max-w-[1230px]">
                <div className="py-6">
                  <p className="absolute left-[150px] text-xs text-gray-500 ">
                    RECENT SEARCHES
                  </p>
                </div>
                <ul className=" text-sm">
                  {["Ceramic Tiles", "Wall Tiles", "Floor Tiles"].map(
                    (item, i) => (
                      <li
                        key={i}
                        className="py-3 border-b border-gray-300 flex mt-4 items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={history}
                            alt="history"
                            className="w-[24px] h-[24px]"
                          />{" "}
                          {item}
                        </div>
                        <img
                          src={close}
                          alt="close"
                          className="w-[18px] h-[18px]"
                        />
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Popular Searches */}
              <div className="ml-[120px] max-w-[1230px] space-y-10">
                <div className="py-6">
                  <p className="absolute text-xs text-gray-500 mb-2">
                    POPULAR SEARCHES
                  </p>
                </div>
                <ul className="text-sm space-y-10">
                  {["Porcelain Tiles", "Kitchen Tiles", "Bathroom Tiles"].map(
                    (item, i) => (
                      <li
                        key={i}
                        className=" border-b border-gray-300 flex mt-4 items-center justify-between gap-2"
                      >
                        {item}
                        <img
                          src={trend}
                          alt="trend"
                          className="w-[24px] h-[24px]"
                        />
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
