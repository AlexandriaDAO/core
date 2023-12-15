import React, { useState, useEffect, useMemo, useRef } from "react";
import AuthorCards from "../components/AuthorCards/AuthorCards";
import { Responsive, WidthProvider } from "react-grid-layout";
import Shelf from "../components/Author/Shelf";
import Stats from "../components/Author/Stats";
import BookModal from "../components/BooksCard/BookModal";
import { useAuthors } from "../contexts/AuthorContext";

const ResponsiveGridLayout = WidthProvider(Responsive);

import "../styles/react-grid-layout.css";

function AuthorPanel({ authors }) {
  const { stats, shelf, book } = useAuthors();
  const [numCols, setNumCols] = useState(1);

  const CARD_WIDTH = 300;
  const CARD_HEIGHT = 400;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateContainerWidth = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    updateContainerWidth();

    const handleResize = () => {
      updateContainerWidth();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const calculateCols = () => {
      const columns = Math.floor(containerWidth / CARD_WIDTH);

      setNumCols(columns > 0 ? columns : 1);
    };

    calculateCols();
  }, [containerWidth]);

  const generateLayout = () => {
    const layouts = { xxs: [] };
    const numCards = authors.length;
    const fullRows = Math.floor(numCards / numCols);
    const lastRowCards = numCards % numCols;

    authors.forEach((author, index) => {
      let xAdjustment =
        index >= fullRows * numCols && lastRowCards !== 0
          ? numCols - lastRowCards
          : 0;

      layouts["xxs"].push({
        i: author.id.toString(),
        x: (index % numCols) + xAdjustment,
        y: Math.floor(index / numCols),
        w: 1,
        h: 1,
      });
    });

    const index = stats
      ? authors.findIndex((a) => a.id === stats)
      : shelf
      ? authors.findIndex((a) => a.id === shelf)
      : 0;
    let yPosition;

    if (index >= fullRows * numCols) {
      yPosition = Math.floor(index / numCols) + 1;
    } else {
      yPosition = Math.floor(index / numCols);
    }

    layouts["xxs"].push({
      i: `extra-${stats || shelf || "none"}`,
      x: 0,
      y: yPosition,
      w: numCols,
      h: stats ? 1 : shelf ? book ? 3 : 1 : 0,
    });

    return layouts;
  };

  const layouts = useMemo(generateLayout, [stats, shelf, book, authors, numCols]);

  return (
    <div ref={containerRef} className="my-10">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ xxs: 0 }}
        cols={{ xxs: numCols }}
        rowHeight={CARD_HEIGHT}
        containerPadding={[0, 0]}
        margin={[0, 0]}
        isDraggable={true}
        autoSize={true}
        isResizable={false}
      >
        {authors.map((author) => (
          <div
            key={author.id}
            className="flex justify-center items-start h-full"
            style={{ width: CARD_WIDTH }}
          >
            <AuthorCards author={author} />
          </div>
        ))}
        {stats && (
          <div
            key={`extra-${stats}`}
            className="h-full"
            style={{ gridColumnStart: 1, gridColumnEnd: -1, zIndex: -1 }}
          >
            <Stats />
          </div>
        )}
        {shelf && (
          <div
            key={`extra-${shelf}`}
            className="h-full"
            style={{ gridColumnStart: 1, gridColumnEnd: -1 }}
          >
            <Shelf />
            {book && <BookModal />}
          </div>
        )}
      </ResponsiveGridLayout>
    </div>
  );
}

export default AuthorPanel;
