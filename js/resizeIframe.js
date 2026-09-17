/**
 * This script is used to resize iframes to match their contents. It is intended for use in the interwiki iframe to accommodate different numbers of translations per page, but it can be used to resize any iframe on wikidot.
 *
 * How to use:
 *
 * 1. Import this script in the <head> of the page to be used as an iframe:
 *
 *    <script src="https://interwiki.scpwiki.com/resizeIframe.js" defer></script>
 *
 * 2. Define a dummy resize function to be used before the script loads:
 *
 *    window.resize = () => {};
 *
 * 3. After load, replace the dummy function with the actual resizer function:
 *
 *    addEventListener("load", () => {
 *      window.resize = window.resizeIframe.createResizeIframe(
 *        document.referrer,
 *        location.href.replace(/^.*\//, "/"),
 *        100,
 *      );
 *    });
 *
 * 4. Whenever you want to resize the iframe, call the function:
 *
 *    window.resize(); // Auto-resize to match the document height
 *    window.resize(500); // Resize to 500px
 *    new ResizeObserver(() => window.resize()).observe(document.body); // Resize on size change
 *
 * 5. If your iframe is defined in a [[html]] block, it already has Wikidot's auto-resizing script.
 *    Disable it if you need to use this script to control the resizing:
 *
 *   document.querySelectorAll(
 *     "script[src*='common--javascript/html-block-iframe.js']"
 *   ).forEach(s => s.remove())
 *   addEventListener("load", () => {
 *     document.querySelectorAll(
 *       "iframe[src*='common--javascript/resize-iframe.html']"
 *     ).forEach(i => i.remove())
 *   });
 */

/**
 * Constructs and returns a function that, when called, resizes the current iframes to match its contents or the given height. The function is debounced.
 *
 * @param {String} site - The base URL of the site.
 * @param {String} frameId - The last segment of the URL of the interwiki iframe, used by Wikidot to identify it when resizing it.
 * @param {Number=} [debounceTime] - Debounce delay to stagger repeated calls to the resizer. Defaults to 750 ms.
 * @returns {((height: Number=) => void)} Debounced function that resizes the iframe. Optional height parameter sets the height of the iframe in pixels; if not set, the height is calculated from the document. Float and string values are OK (e.g. 10.5 and "10.5").
 */
function createResizeIframe(site, frameId, debounceTime) {
  if (debounceTime == null) debounceTime = 750;

  var container = document.getElementById("resizer-container");
  if (container == null) {
    container = document.createElement("div");
    container.id = "resizer-container";
    document.body.appendChild(container);
  }
  var resizer = document.createElement("iframe");
  resizer.style.display = "none";
  container.appendChild(resizer);

  // Trim leading slashes from frame ID
  frameId = frameId.replace(/^\/+/, "");

  var resize = function (height) {
    if (height == null) {
      // Measure from the top of the document to the iframe container to get the document height
      // This takes into account inner margins, unlike e.g. document.body.clientHeight
      // The container must not have display:none for this to work, which is why the iframe has it instead
      height = container.getBoundingClientRect().top;
      // Brute-force past any subpixel issues
      if (height) height += 1;
    }
    var newResizerSrc =
      site +
      "/common--javascript/resize-iframe.html?" +
      "#" +
      height +
      "/" +
      frameId;
    if (resizer.src !== newResizerSrc) {
      resizer.src = "about:blank";
      setTimeout(function () {
        resizer.src = newResizerSrc;
      }, 50);
    }
  };

  return debounce(resize, debounceTime);
}

/**
 * Debounces a function, delaying its execution until a certain amount of time has passed since the last time it was called, and aggregating all calls made in that time into one.
 *
 * @param {Function} func - The function to call.
 * @param {Number} wait - The number of milliseconds to wait after any call to the debounced function before executing it.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
  var timeout = 0;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

window.resizeIframe = {
  createResizeIframe: createResizeIframe,
  debounce: debounce,
};
