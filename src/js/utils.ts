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
  if (input.length < maxLength) {
    return input;
  } else {
    const reg = `^.{${maxLength}}.*?\\b`;
    const regex = new RegExp(reg);
    return input.match(regex) + (endWithEllipsis ? "…" : "");
  }
};

/**
 * Replaces escaped sequences of new line character in the input string with
 * their corresponding new line character and returns the result.
 *
 * @param {string} str - The input string to be prepared for Markdown.
 * @returns {string} - The prepared string for Markdown.
 */
export const prepareStringFromDbForMarkdown = (str: string): string =>
  str.replaceAll("\\n", "\n");

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

/**
 * Function to generate a URL source string from the original image source,
 * basically adds a "-thumbnail" just before the file extension.
 * @param originalString The original image source
 * @returns The thumbnail image source
 */
export const thumbalizeImageSource = (originalString: string): string => {
  let lastDotIndex: number = originalString.lastIndexOf(".");

  let stringWithoutExtension: string = originalString.slice(0, lastDotIndex);

  let newString: string =
    stringWithoutExtension + "-thumbnail" + originalString.slice(lastDotIndex);

  return newString;
};

export const preventAndroidBackButton = () => {
  history.pushState(null, document.title, location.href);
  window.addEventListener("popstate", function (event) {
    history.pushState(null, document.title, location.href);
  });
};
