import { addExternalStyle, createRequestStyleChange } from "./styles";

import { ResizeObserver } from "@juggle/resize-observer";
import { addTranslations } from "./links";
import { scpBranches } from "./branches-info-scp";
import { wlBranches } from "./branches-info-wl";

/**
 * @type {import("./createResizeIframe").createResizeIframe}
 */
var createResizeIframe = window.createResizeIframe;

addEventListener("DOMContentLoaded", function () {
  var community = getQueryString(location.search, "community");
  var pagename = getQueryString(location.search, "pagename");
  var lang = getQueryString(location.search, "lang");
  var preventWikidotBaseStyle = getQueryString(
    location.search,
    "preventWikidotBaseStyle"
  );

  createInterwiki(community, pagename, lang, preventWikidotBaseStyle);

  // Expose identity for styleFrame
  window.isInterwikiFrame = true;
});

/**
 * Retrieves the value of the query parameter in the URL with the
 * given key, if provided, otherwise returns the empty string.
 *
 * @param {String} query - The URL query.
 * @param {String} name - The name of the parameter to get.
 */
export function getQueryString(query, name) {
  // Get query parameters from the URL
  if (query.indexOf("?") === 0) query = query.substring(1);
  var parameters = query.split("&");
  // Iterate parameters in reverse so later values override earlier ones
  parameters.reverse();
  // Find the parameter whose key is the given name
  var matchingParameter = parameters.find(function (parameter) {
    return parameter.indexOf(name + "=") === 0;
  });
  if (matchingParameter == null) return "";
  // Return the part of the parameter following the "="
  return decodeURIComponent(matchingParameter.substring(name.length + 1));
}

/**
 * Finds styleFrames embedded in the parent page and pulls their style
 * change requests for the interwikiFrame to use.
 *
 * styleFrames will also attempt to push their styles to the
 * interwikiFrame. The two methods work in unison to ensure that the
 * interwikiFrame receives all styles regardless of what order the iframes
 * initialise in.
 *
 * This function is also called on window reload prompted by the
 * interwiki's click-to-refresh, at which point it is very likely that all
 * styleFrames will have finished initialising.
 */
function pullStyles() {
  // Find styleFrames in the parent that have initialised before this
  // interwikiFrame did, and pull their query parameters
  Array.prototype.slice.call(parent).forEach(function (frame) {
    try {
      if (frame.isStyleFrame) {
        window.requestStyleChange(frame.location.search);
      }
    } catch (error) {
      // styleFrames that have not finished initialising will push their
      // styles to the interwikiFrame when they are ready
      if (!(error instanceof DOMException)) {
        // All other errors must be reported
        throw error;
      }
    }
  });
}

/**
 * Main procedure for the interwiki. Prepare contextual data, apply CSS
 * styling, and add links to translations.
 *
 * @param {"scp" | "wl"} community - The community of the interwiki.
 * @param {String} pagename - The Wikidot fullname of the current page.
 * @param {String} currentBranchLang - The language code of the current branch
 * of the given community.
 * @param {String} preventWikidotBaseStyle - Whether to prevent the
 * addition of Wikidot's base style to the interwiki. If any value other
 * than the string "true", the style will be added with priority -1.
 */
export function createInterwiki(
  community,
  pagename,
  currentBranchLang,
  preventWikidotBaseStyle
) {
  pagename = pagename.replace(/^_default:/, "");

  // Get the list of branches for the given community
  var branches = { wl: wlBranches, scp: scpBranches }[community] || {};

  // Get the config for the current branch, if configured
  var currentBranch = branches[currentBranchLang] || {};

  // Construct the function that will resize the frame after changes
  var site = document.referrer;
  var frameId = location.href.replace(/^.*\//, "/");
  var resize = createResizeIframe(site, frameId);

  // Resize frame when size changes are detected
  var observer = new ResizeObserver(function () {
    // Only resize if there's at least one translation link
    if (document.getElementsByClassName("menu-item").length) resize();
  });
  observer.observe(document.documentElement);

  // Construct the function that will be called internally and by
  // styleFrames to request style changes
  window.requestStyleChange = createRequestStyleChange(currentBranch.url || "");

  // Add Wikidot's base style unless instructed otherwise
  if (preventWikidotBaseStyle !== "true") {
    addExternalStyle(
      -1,
      "//d3g0gp89917ko0.cloudfront.net/v--3e3a6f7dbcc9/common--theme/base/css/style.css"
    );
  }

  pullStyles();
  addTranslations(branches, currentBranchLang, pagename);
}
