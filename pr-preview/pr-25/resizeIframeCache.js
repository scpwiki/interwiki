(function(){var i="wd-resize-cache-v1",t="https://scp-sandbox-3.wikidot.com/common--javascript/resize-iframe.html";self.addEventListener("install",function(n){console.log("GETTING READY"),n.waitUntil(caches.open(i).then(function(e){return fetch(t).then(function(o){return console.log("INITIAL CACHE DONE"),e.put(t,o.clone())})}))});self.addEventListener("fetch",function(n){var e=new URL(n.request.url);e.origin+e.pathname===t&&n.respondWith(caches.open(i).then(function(o){return o.match(t).then(function(r){return r?(console.log("CACHE HIT"),r):fetch(n.request).then(function(c){return console.log("CACHE MISS"),o.put(t,c.clone()),c})})}))});})();
//# sourceMappingURL=resizeIframeCache.js.map