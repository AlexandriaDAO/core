import React, { useState } from 'react';
import epubtoCSV from './epubtoCSV';

const CreateCSV = ({ books, onCSVCreated }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBookChange = (event) => {
    setSelectedBook(event.target.value);
  };

  const handleConvertClick = async () => {
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

  const handleDownloadClick = () => {
    if (csvData) {
      const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', 'book_data.csv');
      link.click();
    }
  };

  return (
    <div>
      <h2>Book CSV Converter</h2>
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
      <button onClick={handleConvertClick} disabled={!selectedBook || isLoading}>
        {isLoading ? 'Converting...' : 'Convert to CSV'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {csvData && (
        <div>
          <button onClick={handleDownloadClick}>Download CSV</button>
        </div>
      )}
    </div>
  );
};

export default CreateCSV;