function serializeState(initialState) {
  return JSON.stringify(initialState).replace(/</g, '\\u003c');
}

function renderScripts(assets) {
  return assets.js
    .map((asset) => `<script src="${asset}" defer></script>`)
    .join('\n');
}

export function renderHTML({
  content,
  styles,
  initialState = {},
  headTags,
  assets = { js: ['/static/js/main.js'] },
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${headTags}
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fafafa;
  color: #333;
}
</style>
${styles}
</head>
<body>
<div id="root">${content}</div>
<script>
  window.__INITIAL_STATE__ = ${serializeState(initialState)};
</script>
${renderScripts(assets)}
</body>
</html>`;
}
