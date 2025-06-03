import facebook from '../../assets/headerfooter/facebook.png';
import instagram from '../../assets/headerfooter/instagram.png';
import x from '../../assets/headerfooter/x.png';
import email from '../../assets/headerfooter/email.png';
import google from '../../assets/headerfooter/google.png';
import app from '../../assets/headerfooter/apple.png';
import text from '../../assets/headerfooter/text.png';
import arrow from '../../assets/headerfooter/arrow.png';
 
function Footer() {
  return (
    <footer className="bg-zinc-900 w-full text-white py-12">
      <div className="max-w-[1200px] mx-auto mt-20 mb-30 px-6 flex flex-col lg:flex-row gap-10">
        {/* Left Section: Logo, Newsletter, and Social Icons */}
        <div className="flex flex-col w-full lg:w-1/3">
          {/* Logo */}
          <div className="mb-10">
            <a>
              <img src={text} alt="text logo" className="h-15" />
            </a>
          </div>
 
          {/* Newsletter */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Discover What’s New First!"
              className="bg-transparent border-b border-gray-400 text-base text-gray-300 placeholder-gray-300 outline-none py-2 px-0 w-[280px]"
            />
            <button className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-800 transition">
              <a>
                <img src={arrow} alt="arrow" className="w-5 h-5" />
              </a>
            </button>
          </div>
 
          {/* Social Icons */}
          <div className="flex gap-5">
            <a href="#" aria-label="Facebook">
              <img src={facebook} alt="Facebook" className="w-8 h-8 hover:opacity-80 transition" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src={instagram} alt="Instagram" className="w-8 h-8 hover:opacity-80 transition" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src={x} alt="Twitter" className="w-8 h-8 hover:opacity-80 transition" />
            </a>
            <a href="#" aria-label="Email">
              <img src={email} alt="Email" className="w-8 h-8 hover:opacity-80 transition" />
            </a>
          </div>
        </div>
 
        {/* Right Section: Products, Company, Quick Links, Download App */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 w-full lg:w-2/3">
          <div>
            <h2 className="font-bold text-sm mb-4 uppercase tracking-wide">Products</h2>
            <ul className="text-gray-300 text-xs space-y-3">
              <li className="hover:text-white transition cursor-pointer">Floor Tiles</li>
              <li className="hover:text-white transition cursor-pointer">Wall Tiles</li>
              <li className="hover:text-white transition cursor-pointer">Residential Tiles</li>
              <li className="hover:text-white transition cursor-pointer">Commercial Tiles</li>
              <li className="hover:text-white transition cursor-pointer">Outer Tiles</li>
            </ul>
          </div>
 
          <div>
            <h2 className="font-bold text-sm mb-4 uppercase tracking-wide">Company</h2>
            <ul className="text-gray-300 text-xs space-y-3">
              <li className="hover:text-white transition cursor-pointer">About Us</li>
              <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-white transition cursor-pointer">Contact Us</li>
            </ul>
          </div>
 
          <div>
            <h2 className="font-bold text-sm mb-4 uppercase tracking-wide">Quick Links</h2>
            <ul className="text-gray-300 text-xs space-y-3">
              <li className="hover:text-white transition cursor-pointer">Catalogue</li>
              <li className="hover:text-white transition cursor-pointer">Where To Buy</li>
              <li className="hover:text-white transition cursor-pointer">Tile Visualizer</li>
              <li className="hover:text-white transition cursor-pointer">Virtual Showroom</li>
            </ul>
          </div>
 
          <div>
            <h2 className="font-bold text-sm mb-4 uppercase tracking-wide">Download App</h2>
            <div className="flex flex-col space-y-3">
              <a href="https://play.google.com/store/games?hl=en_IN" target="_blank" rel="noopener noreferrer">
                <img src={google} alt="Google Play" className="h-12 hover:opacity-80 transition" />
              </a>
              <a href="https://www.apple.com/in/app-store/" target="_blank" rel="noopener noreferrer">
                <img src={app} alt="App Store" className="h-12 hover:opacity-80 transition" />
              </a>
            </div>
          </div>
        </div>
      </div>
 
      {/* Divider */}
      <hr className="border-gray-600 my-6 max-w-[1200px] mx-auto" />
 
      {/* Bottom Note */}
      <p className="text-xs text-center text-gray-400">
        Kajaria Ceramics Limited © All Rights Reserved | Disclaimer | Caution Notice
      </p>
    </footer>
  );
}
 
export default Footer;