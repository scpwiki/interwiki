import { cromLookup } from "./lookup/crom";

// Configure which lookup method is currently active
var lookupMethod = cromLookup;

/**
 * @callback addLinkCallback
 * @param {String} pageUrl
 * @param {String} branchName
 * @param {String} branchLang
 * @param {Boolean} isOriginal
 */

/**
 * @typedef Branch
 *
 * Configuration for a single branch.
 *
 * A branch is usually a whole Wikidot site but can be restricted to a
 * single category of a Wikidot site.
 *
 * @type {Object}
 * @property {String} name - The official name of the branch.
 * @property {String} head - The text of the header that will appear at the
 * top of the Interwiki.
 * @property {String} url - The URL of the site that contains this branch,
 * with a trailing slash.
 * @property {String} id - The numeric Wikidot site ID of the site that
 * contains this branch.
 * @property {String} category - The category within this site that
 * contains the branch, with a trailing colon; or, if the branch is not
 * contained to any category within the site, the empty string.
 */

/**
 * Requests translation data for the current page from all configured
 * branches. Also sets the hover information in the refresh link to the
 * current time.
 *
 * @param {Object.<string, Branch>} branches - The branches configuration
 * for the current community.
 * @param {String} currentBranchLang - The language code of the current
 * branch, as defined in the community's branches config.
 * @param {String} pagename - The fullname of the page in the current
 * branch to find translations for.
 */
export function addTranslations(branches, currentBranchLang, pagename) {
  // Get the config for the current branch, if configured
  var currentBranch = branches[currentBranchLang] || {};

  // Hide the side block by default (will be unhidden if there is at least
  // one translation)
  var sideBlock = document.getElementsByClassName("side-block")[0];
  sideBlock.style.display = "none";

  // Construct the header
  var header = document.querySelector(".heading p");
  header.innerText = currentBranch.head;

  lookupMethod(currentBranch, branches, pagename, addTranslationLink);
}

/**
 * Create a new menu item, containing a link to a page in a given branch,
 * and append it to the side block.
 *
 * @param {String} pageUrl - The URL of the translation to link to.
 * @param {String} branchName - The name of the branch.
 * @param {String} branchLang - The language code of the branch.
 * @param {Boolean} isOriginal - Whether this link is for the original
 * article rather than a translation.
 */
function addTranslationLink(pageUrl, branchName, branchLang, isOriginal) {
  var sideBlock = document.getElementsByClassName("side-block")[0];
  var menuItems = Array.prototype.slice.call(
    sideBlock.getElementsByClassName("menu-item")
  );

  // There is a translation, so unhide the side block if it is hidden
  sideBlock.style.display = "";

  // Create the new menu item
  var newMenuItem = document.createElement("div");
  newMenuItem.classList.add("menu-item");
  if (isOriginal) newMenuItem.classList.add("original");
  // Record its branch's language code in the element
  newMenuItem.setAttribute("name", branchLang);

  // Create the bullet point image
  var bullet = document.createElement("img");
  bullet.setAttribute(
    "src",
    "//scp-wiki.wdfiles.com/local--files/nav:side/default.png"
  );
  bullet.setAttribute("alt", "default.png");
  bullet.classList.add("image");
  newMenuItem.appendChild(bullet);

  // Create the actual link
  var link = document.createElement("a");
  link.setAttribute("href", pageUrl);
  link.setAttribute("target", "_parent");
  link.innerText = branchName;
  newMenuItem.appendChild(link);

  // Add the new menu item to the end of the side block by default
  sideBlock.appendChild(newMenuItem);
  // Then find the first existing menu item whose lang code is
  // alphabetically greater than the new item, and move the new item to
  // just before it
  menuItems.some(function (menuItem) {
    if (menuItem.getAttribute("name") > branchLang) {
      sideBlock.insertBefore(newMenuItem, menuItem);
      return true;
    }
  });
}
