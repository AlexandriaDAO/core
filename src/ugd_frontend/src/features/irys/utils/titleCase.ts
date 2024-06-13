/**
 * Convert a string to title case.
 *
 * @param {string} str - The input string to be converted.
 * @returns {string} - The title case version of the input string.
 */
const toTitleCase = (str: string): string => str.replace(/\b\w/g, (txt: string) => txt.toUpperCase());

export default toTitleCase;
