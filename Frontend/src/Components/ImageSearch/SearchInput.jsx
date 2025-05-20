import { useState } from 'react';
import { useImage } from '../../Context/ImageContext';
import { useNavigate } from 'react-router-dom';

const SearchInput = () => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const { setSearchResults } = useImage();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault(); // Prevent form reload

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
      setError(null);
      navigate('/results');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <div className="flex items-center overflow-hidden rounded-lg border border-gray-400">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Search for products"
          className="flex-1 px-4 py-2 text-gray-700 focus:outline-none bg-white"
        />
        <button
          type="submit"
          className="bg-gray-500 text-white font-semibold px-6 py-2 cursor-pointer"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </form>
  );
};

export default SearchInput;
