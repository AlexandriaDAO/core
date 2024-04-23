import React, { useState } from 'react';
import epubtoCSV from './epubtoCSV';
import epubtoJSON from './epubtoJSON';

const CreateCSV = ({ books, onCSVCreated, onJSONCreated }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [jsonData, setJSONData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBookChange = (event) => {
    setSelectedBook(event.target.value);
  };

  const handleCSVConvertClick = async () => {
    if (selectedBook) {
      setIsLoading(true);
      setError(null);
      setCsvData(null);

      try {
        const selectedBookData = books.find((book) => book.key === selectedBook);
        if (selectedBookData) {
          const { csvContent } = await epubtoCSV(selectedBookData.data);
          setCsvData(csvContent);
          onCSVCreated(csvContent); // Pass the CSV data to the parent component
        } else {
          throw new Error('Selected book not found.');
        }
      } catch (error) {
        console.error('Error converting book to CSV:', error);
        setError('An error occurred while converting the book to CSV.');
      }

      setIsLoading(false);
    }
  };
  const handleJSONConvertClick = async () => {
    if (selectedBook) {
      setIsLoading(true);
      setError(null);
      setJSONData(null);

      try {
        const selectedBookData = books.find((book) => book.key === selectedBook);
        if (selectedBookData) {
          const { jsonContent } = await epubtoJSON(selectedBookData.data);
          setJSONData(jsonContent);
          onJSONCreated(jsonContent); // Pass the JSON data to the parent component
        } else {
          throw new Error('Selected book not found.');
        }
      } catch (error) {
        console.error('Error converting book to JSON:', error);
        setError('An error occurred while converting the book to JSON.');
      }

      setIsLoading(false);
    }
  };

  const handleCSVDownloadClick = () => {
    if (csvData) {
      const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', 'book_data.csv');
      link.click();
    }
  };

  const handleJSONDownloadClick = () => {
    if (jsonData) {
      const dataStr = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
      const jsonContent = `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const link = document.createElement('a');
      link.setAttribute('href', jsonContent);
      link.setAttribute('download', 'book_data.json');
      link.click();
    }
  };

  return (
    <div className='flex flex-col gap-1 items-start'>
      <span className='font-semibold text-lg'>Book Converter</span>
      <div>
        <label htmlFor="bookSelect">Select a book:</label>
        <select id="bookSelect" value={selectedBook} onChange={handleBookChange}>
          <option value="">Choose a book</option>
          {books &&
            books.map((book) => (
              <option key={book.key} value={book.key}>
                {book.data.title}
              </option>
            ))}
        </select>
      </div>
      <button onClick={handleCSVConvertClick} disabled={!selectedBook || isLoading} className={`${!selectedBook || isLoading ? 'bg-green-200 border-green-500 border': 'bg-green-400 hover:bg-green-300'} text-black  px-2 transition-all duration-300 rounded`}>
        {isLoading ? 'Converting...' : 'Convert to CSV'}
      </button>
      <button onClick={handleJSONConvertClick} disabled={!selectedBook || isLoading} className={`${!selectedBook || isLoading ? 'bg-green-200 border-green-500 border': 'bg-green-400 hover:bg-green-300'} text-black  px-2 transition-all duration-300 rounded`}>
        {isLoading ? 'Converting...' : 'Convert to JSON'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {csvData && (
        <div>
          <button onClick={handleCSVDownloadClick} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded'>Download CSV</button>
        </div>
      )}

      {jsonData && (
        <div>
          <button onClick={handleJSONDownloadClick} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded'>Download JSON</button>
        </div>
      )}
    </div>
  );
};

export default CreateCSV;