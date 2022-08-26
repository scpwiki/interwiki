/**
 * Whether the interwiki should be visible. It should only be visible after
 * data has been received from the API source.
 */
export var flags = { showInterwiki: false };

/**
 * Constructs and returns a function that, when called, resizes the current
 * iframes to match its contents. The function is debounced.
 *
 * @param {String} site - The base URL of the site.
 * @param {String} frameId - The last segment of the URL of the interwiki
 * iframe, used by Wikidot to identify it when resizing it.
 */
export function createResizeIframe(site, frameId) {
  var container = document.getElementById("resizer-container");
  var resizer = document.createElement("iframe");
  resizer.style.display = "none";
  container.appendChild(resizer);

  if (frameId[0] !== "/") frameId = "/" + frameId;

  return debounce(function () {
    if (flags.showInterwiki) {
      // Measure from the top of the document to the iframe container to get
      // the document height - this takes into account inner margins, unlike
      // e.g. document.body.clientHeight
      // The container must not have display:none for this to work, which is
      // why the iframe has it instead
      var height = container.getBoundingClientRect().top;
      // Brute-force past any subpixel issues
      if (height) height += 1;
      resizer.src =
        site +
        "/common--javascript/resize-iframe.html?" +
        "#" +
        height +
        frameId;
    }
  }, 750);
}

/**
 * Debounces a function, delaying its execution until a certain amount of
 * time has passed since the last time it was called, and aggregating all
 * calls made in that time into one.
 *
 * @param {Function} func - The function to call.
 * @param {Number} wait - The number of milliseconds to wait after any call
 * to the debounced function before executing it.
 */
function debounce(func, wait) {
  var timeout = 0;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
