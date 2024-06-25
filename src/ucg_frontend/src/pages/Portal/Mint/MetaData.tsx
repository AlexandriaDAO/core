// MetaData.tsx
import React, { useState } from "react";
import languages from "@/data/languages";
import CategorySelect from "./Fields/CategorySelect";

const MetaData = ({ metadata, setMetadata }: any) => {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetadata({ ...metadata, language: e.target.value });
  };

  return (
    <section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col text-sm gap-2 items-start justify-start">

      <div className="flex flex-col gap-1 w-full justify-between items-start">
          <label htmlFor="title">Title</label>
          <input
            className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
            type="text"
            id="title"
            placeholder="Book Title"
            value={metadata?.title}
            onChange={(e) =>
              setMetadata({
                ...metadata,
                title: e.target.value,
              })
            }
          />
        </div>
      
      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="author">Author</label>
        <input
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
          type="text"
          id="author"
          placeholder="Author"
          value={metadata?.author}
          onChange={(e) =>
            setMetadata({
              ...metadata,
              author: e.target.value,
            })
          }
        />
      </div>
      
      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="description">Description</label>
        <textarea
          onChange={(e) =>
            setMetadata({
              ...metadata,
              description: e.target.value,
            })
          }
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
          name="description"
          id="description"
          placeholder="Description"
        ></textarea>
      </div>

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="fiction" className="flex items-center gap-2">
          <span>Fiction / Non-Fiction:</span>
          <div className="relative">
            <input
              type="checkbox"
              id="fiction"
              name="fiction"
              checked={metadata.fiction === undefined ? true : metadata.fiction}
              onChange={(e) => 
                setMetadata({
                  ...metadata,
                  fiction: e.target.checked,
                })
              }
              className="sr-only"
            />
            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out" style={{ transform: metadata.fiction ? 'translateX(100%)' : 'translateX(0)' }}></div>
          </div>
          <span>{metadata.fiction ? 'Fiction' : 'Non-Fiction'}</span>
        </label>
      </div>

      <div>
        <CategorySelect 
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedMainCategory={selectedMainCategory}
        setSelectedMainCategory={setSelectedMainCategory}
        setMetadata={setMetadata}
        metadata={metadata}
        />
      </div>

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="pubyear">Publication Year</label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              const currentYear = metadata?.pubyear ? parseInt(metadata.pubyear, 10) : 0;
              if (currentYear > -6000) {
                setMetadata({ ...metadata, pubyear: currentYear - 1 });
              }
            }}
            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-l"
          >
            -
          </button>
          <input
            className="w-full py-1 px-2 text-center placeholder-gray-600 border border-gray-800"
            type="number"
            id="pubyear"
            placeholder="Year (e.g., 2022 or -500)"
            min="-6000"
            max="2050"
            step="1"
            value={metadata?.pubyear || ''}
            onChange={(e) => {
              const year = parseInt(e.target.value, 10);
              if (!isNaN(year) && year >= -6000 && year <= 2050) {
                setMetadata({ ...metadata, pubyear: year });
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const currentYear = metadata?.pubyear ? parseInt(metadata.pubyear, 10) : 0;
              if (currentYear < 2050) {
                setMetadata({ ...metadata, pubyear: currentYear + 1 });
              }
            }}
            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-r"
          >
            +
          </button>
        </div>
        <small className="text-gray-600">
          Note: Enter negative years for BC (e.g., -500 for 500 BC).
        </small>
      </div>

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={metadata.language || 'en'}
          onChange={handleLanguageChange}
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/*these one's are optional fields. */}

			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="publisher">Publisher</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="publisher"
					placeholder="Publisher"
					value={metadata?.publisher}
					onChange={(e) =>
						setMetadata({
							...metadata,
							publisher: e.target.value,
						})
					}
				/>
			</div>

			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="rights">Rights</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="rights"
					placeholder="Additional details regarding publication rights"
					value={metadata?.rights}
					onChange={(e) =>
						setMetadata({
							...metadata,
							rights: e.target.value,
						})
					}
				/>
			</div>

			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="isbn">ISBN</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="isbn"
					placeholder="ISBN"
					value={metadata?.isbn}
					onChange={(e) =>
						setMetadata({
							...metadata,
							isbn: e.target.value,
						})
					}
				/>
			</div>

		</section>
	);
};

export default MetaData;

