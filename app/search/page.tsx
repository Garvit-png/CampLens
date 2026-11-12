"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_at: string;
};

export default function SearchPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);


  const [isSearching, setIsSearching] = useState(false);


  const [hasSearched, setHasSearched] = useState(false);



  const [error, setError] = useState("");



  const handleSearch = async () => {
    const trimmed = searchInput.trim();

    // Validation
    if (!trimmed) {
      setError("Kuch toh type karo search karne ke liye!");
      return;
    }

    setError(""); // Purani error clear karo
    setIsSearching(true); // Loading ON
    setHasSearched(true); // Ab search hua hai

    try {



      const response = await fetch(
        `/api/search?tag=${encodeURIComponent(trimmed)}`,
      );

      if (!response.ok) {

        throw new Error("Search fail ho gayi");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError("Search mein problem aayi. Dobara try karo.");
      setResults([]);
    } finally {
      setIsSearching(false); // Loading OFF (success ya fail dono mein)
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar Section */}
      <div className="bg-white shadow-sm py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔍 Hashtag Search
          </h1>

          {/* Search Input + Button */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              {/* # symbol dikhao input ke andar (decorative) */}
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 
                               text-gray-400 font-bold text-lg"
              >
                #
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setError(""); // Type karne pe error clear karo
                }}
                onKeyDown={handleKeyDown}
                placeholder="Damru26, Freshers2024, Khatam..."
                className="w-full border-2 border-gray-200 rounded-xl 
                           pl-8 pr-4 py-3 text-lg
                           focus:outline-none focus:border-indigo-500
                           transition-colors"

              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className={`px-6 py-3 rounded-xl font-semibold text-white
                ${
                  isSearching
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                } transition-colors`}
            >
              {isSearching ? "⏳" : "🔍 Search"}
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-2 text-sm">⚠️ {error}</p>}

          {/* Popular Tags Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm">Popular:</span>
            {[
              "Damru26",
              "Freshers2024",
              "Khatam",
              "TechFest",
              "Graduation",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchInput(tag);
                  // Auto-search karo
                  handleSearch();
                }}
                className="text-indigo-600 text-sm bg-indigo-50 
                           px-3 py-1 rounded-full hover:bg-indigo-100
                           transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-16">
            <div
              className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 
                            rounded-full animate-spin mx-auto mb-4"
            />
            <p className="text-gray-500">Search ho rahi hai...</p>
          </div>
        )}

        {/* Initial State (pehle se pehle search) */}
        {!isSearching && !hasSearched && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">Upar koi hashtag search karo</p>
            <p className="text-sm mt-2">Example: #Damru26 ya #Freshers2024</p>
          </div>
        )}

        {/* No Results State */}
        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Koi photo nahi mili
            </h3>
            <p className="text-gray-500">
              #{searchInput} ke liye koi photo nahi hai abhi
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && results.length > 0 && (
          <>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">{results.length}</span> photos
              mili #{searchInput} ke liye
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => router.push(`/photo/${photo.id}`)}
                  // Photo click pe detail page pe le jao
                  className="bg-white rounded-xl overflow-hidden shadow-sm 
                             hover:shadow-md transition-shadow cursor-pointer
                             hover:-translate-y-1 transition-transform"
                  // hover:-translate-y-1 → hover pe thoda upar uthta hai (nice effect)
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Photo"}
                    className="w-full h-48 object-cover"
                  />
                  {photo.caption && (
                    <div className="p-3">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
