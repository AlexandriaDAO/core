// break paragraph, put search string in the center and add ... at the start and end of clipped text
export const clipParagraph = (paragraph: string, searchString: string, maxLength = 150) => {
    const searchIndex = paragraph.indexOf(searchString);

    if (searchIndex === -1 || paragraph.length <= maxLength) {
        // If the search string is not found or the paragraph is already short enough
        return paragraph;
    }

    const halfMaxLength = Math.floor((maxLength - searchString.length) / 2);
    let start = Math.max(0, searchIndex - halfMaxLength);
    let end = Math.min(paragraph.length, searchIndex + searchString.length + halfMaxLength);

    // Adjust start and end to make sure total length is within maxLength
    if (end - start > maxLength) {
        if (start === 0) {
            end = maxLength;
        } else if (end === paragraph.length) {
            start = paragraph.length - maxLength;
        }
    }

    // Add ellipses if clipping at the start or end
    const clippedString = (start > 0 ? "..." : "") + paragraph.substring(start, end) + (end < paragraph.length ? "..." : "");

    return clippedString;
}

// recursively iterate through the node and highlight input string
export const highlightText = (node:any, textToHighlight: string) => {
    if (node.nodeType === 3) { // Node.TEXT_NODE
        const nodeText = node.nodeValue;
        const highlightedHTML = nodeText.replace(new RegExp(textToHighlight, 'gi'), `<mark>$&</mark>`);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedHTML;

        while (tempDiv.firstChild) {
            node.parentNode.insertBefore(tempDiv.firstChild, node);
        }
        node.parentNode.removeChild(node);
    } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
        Array.from(node.childNodes).forEach(n=>highlightText(n,textToHighlight));
    }
}
