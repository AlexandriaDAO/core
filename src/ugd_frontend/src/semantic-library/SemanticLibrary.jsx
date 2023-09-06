    // // OG API versino before IC migration.
    // const handleSearchSubmit = useCallback(async () => {
    //     if (searchValue.trim() !== '') {
    //         setSubmittedSearchValue(searchValue);
    //         setIsLoading(true);
    //         const response = await fetch('/api/semantic-library', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ query: searchValue, author: selectedAuthor }),
    //         });
    //         if (response.ok) {
    //             const responseData = await response.json();
    //             setData(responseData);
    //             setIsFlipped(new Array(responseData.titles.length).fill(false));
    //         }
    //         setIsLoading(false);
    //     }
    // }, [searchValue, selectedAuthor]);


    // // Attempt via backend.
    // const handleSearchSubmit = useCallback(async () => {
    //     if (searchValue.trim() !== '') {
    //         setSubmittedSearchValue(searchValue);
    //         setIsLoading(true);
    
    //         try {
    //             const bookCards = await yourActor.get_book_cards();
    //             setData(bookCards);
    //             setIsFlipped(new Array(bookCards.length).fill(false));
    //         } catch (e) {
    //             console.error('Failed to fetch data:', e);
    //         }
            
    //         setIsLoading(false);
    //     }
    // }, [searchValue, selectedAuthor]);





import React, { useState, useCallback, useEffect } from 'react';
import { Select, Input, Button, Spin, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { handleReadBookClick } from '../../utils/handleReadBookClick';
import AUTHOR_INFO from '../../assets/author_data';
import VirtualBookShelfComponent from './VirtualBookshelf';
import BookCard from './BookCard';
import '../../styles/SemanticLibraryPage.css';

import { Actor, HttpAgent, IDL } from '@dfinity/agent';
import ugd_backend from '../../../../canister_ids.json';
import ugd_backend_did from '../../../../src/declarations/ugd_backend/ugd_backend.did';

const agent = new HttpAgent();
// const actorInterfaceFactory = IDL.Interface.from(candid);
// const yourActor = Actor.createActor(actorInterfaceFactory, { agent, canisterId: yourCanisterId });


const { Option } = Select;
const { Title, Text } = Typography;
const defaultAuthor = "All Books";

function sanitizeTitleForFilename(title) {
    return title.replace(/[\/\\\?\*\:\|\<\>\"\.\[\]\,\-\(\)\—]/g, '');
}

function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState(undefined);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowWidth(window.innerWidth);
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return windowWidth;
}

const SemanticLibrary = () => {
    const [searchValue, setSearchValue] = useState('');
    const [data, setData] = useState(null);
    const [isFlipped, setIsFlipped] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(defaultAuthor);
    const [submittedSearchValue, setSubmittedSearchValue] = useState('');
    const [imageError, setImageError] = useState({});

    const windowWidth = useWindowWidth();
    const isMobile = windowWidth && windowWidth <= 768;
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
        gap: '20px'
    };

    const handleAuthorChange = value => setSelectedAuthor(value);
    const handleSearchChange = e => setSearchValue(e.target.value);
    const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearchSubmit(); };

    
    // Demo test http get request:
    const handleSearchSubmit = useCallback(async () => {
        if (searchValue.trim() !== '') {
            setSubmittedSearchValue(searchValue);
            setIsLoading(true);
            
            const canisterUrl = `http://localhost:8080?canisterId=${ugd_backend}`;
            const apiUrl = `${canisterUrl}/search?input=${searchValue}`;
    
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const responseData = await response.text();
                setData(responseData);
            }
            
            setIsLoading(false);
        }
    }, [searchValue]);

    

    const toggleFlipped = (index) => {
        setIsFlipped(prevFlipped => {
            const newFlipped = [...prevFlipped];
            newFlipped[index] = !newFlipped[index];
            return newFlipped;
        });
    };

    const handleReadBook = (currentAuthorId, currentTitle) => {
        handleReadBookClick(currentAuthorId, currentTitle);
    };

    const handleImageError = (title) => {
        setImageError(prevState => ({
            ...prevState,
            [title]: true
        }));
    };


    if (typeof window !== "undefined") {
        if (window.innerWidth <= 768) {
            gridStyle.gridTemplateColumns = '1fr';
        }
    }

    return (
      <div className="container">
        <div className="header">
          <Title level={1}>What would you like to read?</Title>
          <Text type="secondary">Search through 100s of books by semantic meaning. Then, delve deeper as you please!</Text>
        </div>
  
        <div className="searchSection">
          <Select 
              placeholder="Choose an author"
              className="select"
              onChange={handleAuthorChange}
              defaultValue={defaultAuthor}
          >
              {AUTHOR_INFO.map(author => (
                  <Option key={author.id} value={author.id}>{author.id}</Option>
              ))}
          </Select>
          <Input.Search
              placeholder="Type a topic or a query..."
              enterButton={<Button type="primary"><SearchOutlined /></Button>}
              size="large"
              className="searchInput"
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
          />
        </div>
  
        {isLoading ? 
            <div className="loading">
                <Spin size="large" />
            </div>
        :       
            data && data.titles.map((title, index) => (
                <BookCard 
                    title={title} 
                    currentAuthor={data.authors[index]}
                    heading={data.headings[index]}
                    bookImagePath={`/public/bookimages/${data.authors[index]?.id}/${sanitizeTitleForFilename(title)}.png`}
                    authorImagePath={`/public/images/${data.authors[index]?.id}.png`}
                    imageError={imageError}
                    handleImageError={handleImageError}
                    handleReadBookClick={handleReadBook}
                    isFlipped={isFlipped[index]}
                    toggleFlipped={() => toggleFlipped(index)}
                    summaries={data.summaries[index]}
                    contents={data.contents[index]}
                />
            ))
        }
  
      <VirtualBookShelfComponent />
      </div>
    );
  };

export default SemanticLibrary;
  






