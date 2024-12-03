// MetaData.tsx
import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import languages from "@/data/languages";
import CategorySelect from "./Fields/CategorySelect";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";

const MetaData = forwardRef(({ metadata, setMetadata }: any, ref) => {
  const [errors, setErrors] = useState({
    title: "",
    author_first: "",
    author_last: "",
    fiction: "",
    category: "",
    language: ""
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetadata({ ...metadata, language: e.target.value });
  };

  useEffect(() => {
    setMetadata({ ...metadata, fiction: null });
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 150);
    setMetadata({ ...metadata, title: value });
  };

  const handleAuthorChange = (field: 'author_first' | 'author_last', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').slice(0, 50);
    setMetadata({ ...metadata, [field]: value });
  };

  const validateFields = () => {
    const newErrors = {
      title: !metadata.title || metadata.title.length < 4 ? "Title must be at least 4 characters long" : "",
      author_first: !metadata.author_first || metadata.author_first.length < 2 ? "First name must be at least 2 characters long" : "",
      author_last: !metadata.author_last || metadata.author_last.length < 2 ? "Last name must be at least 2 characters long" : "",
      fiction: metadata.fiction === null ? "Please select Fiction or Non-Fiction" : "",
      category: !metadata.type ? "Please select a category" : "",
      // subcategories if not selected any will throw error,
      language: !metadata.language ? "Please select a language" : ""
    };

    setErrors(newErrors);
    setIsSubmitAttempted(true);

    return Object.values(newErrors).every(error => error === "");
  };

  useImperativeHandle(ref, () => ({
    validateFields
  }));

  return (
    <section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col text-sm gap-2 items-start justify-start">
      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <Label
          htmlFor="title"
          scale="md"
          variant={(isSubmitAttempted && errors.title ? "destructive" : "default" ) }
        >
          Title
        </Label>
        <Input
          scale="md"
          variant={(isSubmitAttempted ? errors.title ? "destructive" : "constructive" : 'default' ) }
          id="title"
          placeholder="Book Title"
          onChange={handleTitleChange}
          value={metadata?.title || ""}
          minLength={4}
          maxLength={150}
          required
        />
        {isSubmitAttempted && errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <Label
          htmlFor="author_first"
          scale="md"
          variant={(isSubmitAttempted && (errors.author_first || errors.author_last) ? "destructive" : "default" ) }
        >
          Author
        </Label>
        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <Input
              scale="md"
              variant={(isSubmitAttempted ? errors.author_first ? "destructive" : "constructive" : 'default' ) }
              id="author_first"
              placeholder="First Name"
              value={metadata?.author_first || ""}
              onChange={(e) => handleAuthorChange('author_first', e)}
              minLength={2}
              maxLength={50}
              required
            />
            {isSubmitAttempted && errors.author_first && (
              <p className="text-red-500 text-sm mt-1">{errors.author_first}</p>
            )}
          </div>
          <div className="flex-1">
            <Input
              scale="md"
              variant={(isSubmitAttempted ? errors.author_last ? "destructive" : "constructive" : 'default' ) }
              id="author_last"
              placeholder="Last Name"
              value={metadata?.author_last || ""}
              onChange={(e) => handleAuthorChange('author_last', e)}
              minLength={2}
              maxLength={50}
              required
            />
            {isSubmitAttempted && errors.author_last && (
              <p className="text-red-500 text-sm mt-1">{errors.author_last}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Label variant={(isSubmitAttempted && errors.fiction ? "destructive" : "default" ) } scale="md">
          Fiction / Non-Fiction:
        </Label>
        <div className="flex w-full">
          <button
            onClick={() => setMetadata({...metadata, fiction: false})}
            className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
              metadata.fiction === false
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Non-Fiction
          </button>
          <button
            onClick={() => setMetadata({...metadata, fiction: true})}
            className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
              metadata.fiction === true
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fiction
          </button>
        </div>
        {isSubmitAttempted && errors.fiction && (
          <p className="text-red-500 text-sm mt-1">{errors.fiction}</p>
        )}
      </div>

      <CategorySelect 
        setMetadata={setMetadata}
        metadata={metadata}
        isSubmitAttempted={isSubmitAttempted}
      />

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <Label
          htmlFor="language"
          scale="md"
          variant={(isSubmitAttempted && errors.language ? "destructive" : "default" ) }
        >
          Language
        </Label>
        <select
          id="language"
          value={metadata.language || ''}
          onChange={handleLanguageChange}
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
        >
          <option value="">Select a language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        {isSubmitAttempted && errors.language && (
          <p className="text-red-500 text-sm mt-1">{errors.language}</p>
        )}
      </div>
    </section>
  );
});

export default MetaData;