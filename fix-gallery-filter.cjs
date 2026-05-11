const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

// We need to restore the unfiltered gallery.map for the bottom rail.
// Let's replace the .filter part inside the Footer Gallery Rail.

content = content.replace(
  /\{gallery\.filter\(img => img\.id !== activeImage\?\.id\)\.length === 0 && gallery\.length > 0 && activeImage && \([\s\S]*?\)\}/,
  ''
);

content = content.replace(
  /\{gallery\.filter\(img => img\.id !== activeImage\?\.id\)\.map/g,
  '{gallery.map'
);

fs.writeFileSync('App.tsx', content);
console.log("Fixed gallery filter");
