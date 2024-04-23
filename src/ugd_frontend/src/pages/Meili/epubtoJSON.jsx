import Epub, { EpubCFI } from "epubjs";
import { v4 as uuidv4 } from 'uuid';

async function epubToJSON(bookData) {
  try {
    const epubUrl = bookData.url;
    const onlineBook = Epub(epubUrl, { openAs: "epub" });

    const contents = [];
    console.log(bookData);

    // Extract metadata from bookData
    const metadata = {
      title: bookData.title,
      author: bookData.author,
      fiction: bookData.fiction,
      type: bookData.type ? JSON.parse(bookData.type): [],
      subtype: bookData.subtype ? JSON.parse(bookData.subtype) : [],
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

        contents.push({
          id,
          cfi,
          text,
          title: metadata.title,
          author: metadata.author,
          fiction: metadata.fiction,
          type: metadata.type,
          subtype: metadata.subtype,
          pubyear: metadata.pubyear,
        });
      });
    }

    const blob = new Blob([JSON.stringify(contents)], { type: 'text/json;charset=utf-8;' });

    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "book_data.json");
    link.style.visibility = 'hidden';

    // Append the link to the DOM and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { jsonContent: contents };
  } catch (error) {
    console.error("Error processing EPUB:", error);
    throw error;
  }
}

export default epubToJSON;










