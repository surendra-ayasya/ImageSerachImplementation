import ImageUpload from "../Components/ImageSearch/ImageUpload";
import SearchInput from "../Components/ImageSearch/SearchInput";

const Home = () => {
  return (
    <div>
   <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div className="w-full max-w-sm flex flex-col items-center text-center">
    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
      Search by Image
    </h1>
    <p className="text-gray-500 mb-8 max-w-md">
      Upload an image to find matching products, or search by keyword.
    </p>

    <ImageUpload />
    <div className="text-center text-black font-bold my-4">or</div>
    <SearchInput />
  </div>
</div>

    </div>
  );
};

export default Home;
