/**
 * @link https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
 * @param {string} s String to be wrapped
 * @param {number} w Max allowed string width per line
 * @returns String `s` with newline breaks on white spaces, allowing max `w` characters per line.
 */
export const wrapText = (s, w) =>
  s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"), "$1\n");
