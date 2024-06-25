import Epub, { EpubCFI } from "epubjs";
import { v4 as uuidv4 } from 'uuid';

async function epubToCSV(bookData) {
  try {
    const epubUrl = bookData.url;
    const onlineBook = Epub(epubUrl, { openAs: "epub" });

    const contents = [
      [
        "id",
        "cfi",
        "text",
        "title",
        "author",
        "fiction",
        "type",
        "subtype",
        "pubyear",
      ],
    ];

    // Extract metadata from bookData
    const metadata = {
      title: bookData.title,
      author: bookData.author,
      fiction: bookData.fiction,
      type: JSON.stringify(bookData.type),
      subtype: JSON.stringify(bookData.subtype),
      pubyear: bookData.pubyear,
    };

    // Fetch spine items
    const spine = await onlineBook.loaded.spine;
    for (let item of spine.items) {
      if (!item.href) continue;
      const doc = await onlineBook.load(item.href);
      const innerHTML = doc.documentElement.innerHTML;
      const parsedDoc = new DOMParser().parseFromString(innerHTML, "text/html");
      const paragraphs = parsedDoc.querySelectorAll("p");

      paragraphs.forEach((paragraph) => {
        const text = paragraph.textContent?.trim() ?? "";
        if (text.length < 1) return;
        const cfi = new EpubCFI(paragraph, item.cfiBase).toString();
        const id = uuidv4();

        contents.push([
          id,
          cfi,
          text,
          metadata.title,
          metadata.author,
          metadata.fiction,
          metadata.type,
          metadata.subtype,
          metadata.pubyear,
        ]);
      });
    }

    // Convert contents to CSV string
    const csvContent = contents.map(row => {
      return row.map(cell => {
        // If the cell is an array, join its elements, otherwise stringify and escape quotes
        if (Array.isArray(cell)) {
          return cell.join(";"); // Use a different delimiter if the array elements can contain commas
        } else if (typeof cell === 'string') {
          // Escape double quotes and enclose the string in double quotes
          return `"${cell.replace(/"/g, '""')}"`;
        } else {
          return JSON.stringify(cell);
        }
      }).join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "book_data.csv");
    link.style.visibility = 'hidden';

    // Append the link to the DOM and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { csvContent };
  } catch (error) {
    console.error("Error processing EPUB:", error);
    throw error;
  }
}

export default epubToCSV;










