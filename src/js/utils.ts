import Framework7 from "framework7";

import i18n from "./i18n";

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
    const regex = new RegExp(reg, "s"); // 's' flag allows '.' to match newlines
    return input.match(regex) + (endWithEllipsis ? "…" : "");
  }
};

/**
 * @summary Ensure that the supplied string isn't malformed by parsing it using the DOM.
 * @description Please note that this function doesn't do any actual sanitizing, hence "pseudo".
 * @param {string} html
 * @returns
 */
export function pseudoSanitize(html: string) {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  return doc.innerHTML;
}

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
  a: string | null = i18n.t("linkCopied", { ns: "common" })
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
      alert(i18n.t("linkNotCopied", { ns: "common" }));
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

export const preventAndroidBackButton = (f7Instance: Framework7) => {
  history.pushState(null, document.title, location.href);
  // Capture the back button event
  window.addEventListener(
    "popstate",
    function (event) {
      history.pushState(null, document.title, location.href);

      // Let's check if any of the dialog/cards/modals are
      // open and act accordingly (i.e. close them)
      const $ = f7Instance.$;
      if ($(".actions-modal.modal-in").length) {
        f7Instance.actions.close(".actions-modal.modal-in");
        return;
      }
      if ($(".dialog.modal-in").length) {
        f7Instance.dialog.close(".dialog.modal-in");
        return;
      }
      if ($(".sheet-modal.modal-in").length) {
        // If there's an active guide…
        if ($(".sheet-modal.modal-in.active-guide-sheet").length) {
          // …let's confirm before closing
          f7Instance.dialog.confirm(
            i18n.t("closeGuideDialogMessage", { ns: "guideSheetContent" }),
            i18n.t("closeGuideDialogTitle", { ns: "guideSheetContent" }),
            () => {
              // On OK
              f7Instance.sheet.close(".sheet-modal.modal-in");
            }
          );
        } else {
          // Otherwise, let's just close it
          f7Instance.sheet.close(".sheet-modal.modal-in");
        }
        return;
      }
      if ($(".popover.modal-in").length) {
        f7Instance.popover.close(".popover.modal-in");
        return;
      }
      if ($(".popup.modal-in").length) {
        if ($(".popup.modal-in>.view").length) {
          const currentView = f7Instance.views.get(".popup.modal-in>.view");
          if (
            currentView &&
            currentView.router &&
            currentView.router.history.length > 1
          ) {
            currentView.router.back();
            return;
          }
        }
        f7Instance.popup.close(".popup.modal-in");
        return;
      }
      if ($(".login-screen.modal-in").length) {
        f7Instance.loginScreen.close(".login-screen.modal-in");
        return;
      }

      if ($(".page-current .searchbar-enabled").length) {
        f7Instance.searchbar.disable(".page-current .searchbar-enabled");
        return;
      }

      if ($(".page-current .card-expandable.card-opened").length) {
        f7Instance.card.close(".page-current .card-expandable.card-opened");
        return;
      }

      // Same goes for views in routers (e.g. our side panels):
      // hide when user clicks on the back button.
      const currentView = f7Instance.views.current;
      if (
        currentView &&
        currentView.router &&
        currentView.router.history.length > 1
      ) {
        currentView.router.back();
        return;
      }

      if ($(".panel.panel-in").length) {
        f7Instance.panel.close(".panel.panel-in");
        return;
      }
    },
    false
  );
};
