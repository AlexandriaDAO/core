import React, { useState } from "react";
import languages from "@/data/languages";
import CategorySelect from "./Fields/CategorySelect";

interface TagsProps {
  onTagsChange: (tags: any) => void;
}

const Tags: React.FC<TagsProps> = ({ onTagsChange }) => {
  const [metadata, setMetadata] = useState<any>({});

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetadata({ ...metadata, language: e.target.value });
    onTagsChange({ ...metadata, language: e.target.value });
  };

  const handleMetadataChange = (updatedMetadata: any) => {
    setMetadata(updatedMetadata);
    onTagsChange(updatedMetadata);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title">Title</label>
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          type="text"
          id="title"
          placeholder="Book Title"
          value={metadata?.title || ""}
          onChange={(e) => handleMetadataChange({ ...metadata, title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label>Author</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              type="text"
              id="author_first"
              placeholder="First Name"
              value={metadata?.author_first || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, ''); // Remove spaces
                handleMetadataChange({ ...metadata, author_first: value })
              }}
            />
          </div>
          <div className="flex-1">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              type="text"
              id="author_last"
              placeholder="Last Name"
              value={metadata?.author_last || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, ''); // Remove spaces
                handleMetadataChange({ ...metadata, author_last: value })
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fiction" className="flex items-center gap-2">
          <span>Fiction / Non-Fiction:</span>
          <div className="relative">
            <input
              type="checkbox"
              id="fiction"
              name="fiction"
              checked={metadata.fiction === undefined ? true : metadata.fiction}
              onChange={(e) => handleMetadataChange({ ...metadata, fiction: e.target.checked })}
              className="sr-only"
            />
            <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
            <div
              className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out"
              style={{ transform: metadata.fiction ? "translateX(100%)" : "translateX(0)" }}
            ></div>
          </div>
          <span>{metadata.fiction ? "Fiction" : "Non-Fiction"}</span>
        </label>
      </div>


      <div>
        <CategorySelect
          setMetadata={handleMetadataChange}
          metadata={metadata}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={metadata.language || "en"}
          onChange={handleLanguageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Tags;