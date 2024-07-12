// MetaData.tsx
import React from "react";
import languages from "@/data/languages";
import CategorySelect from "./Fields/CategorySelect";

const MetaData = ({ metadata, setMetadata }: any) => {
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
        <label>Author</label>
        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <input
              className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
              type="text"
              id="author_first"
              placeholder="First Name"
              value={metadata?.author_first || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '');
                setMetadata({
                  ...metadata,
                  author_first: value,
                });
              }}
            />
          </div>
          <div className="flex-1">
            <input
              className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
              type="text"
              id="author_last"
              placeholder="Last Name"
              value={metadata?.author_last || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '');
                setMetadata({
                  ...metadata,
                  author_last: value,
                });
              }}
            />
          </div>
        </div>
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
          setMetadata={setMetadata}
          metadata={metadata}
        />
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
    </section>
  );
};

export default MetaData;