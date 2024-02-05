/**
 * @link https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
 * @param {string} s String to be wrapped
 * @param {number} w Max allowed string width per line
 * @returns String `s` with newline breaks on white spaces, allowing max `w` characters per line.
 */
export const wrapText = (s: string, w: number) =>
  s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"), "$1\n");

export const trimString = (
  input: string,
  maxLength: number,
  endWithEllipsis = true
) => {
  const reg = `^.{${maxLength}}.*?\\b`;
  const regex = new RegExp(reg);
  return input.match(regex) + (endWithEllipsis ? "…" : "");
};

export const copyToClipboard = (
  s: string,
  alertFunction?: Function,
  a: string | null = "Länken har kopierats."
) => {
  const alert = alertFunction || window.alert;
  const blobText = new Blob([s], {
    type: "text/plain",
  });

  const data = [
    new ClipboardItem({
      "text/plain": blobText,
    }),
  ];

  navigator.clipboard.write(data).then(
    () => {
      if (a !== null) alert(a);
    },
    () => {
      alert("Kunde inte kopiera");
    }
  );
};
