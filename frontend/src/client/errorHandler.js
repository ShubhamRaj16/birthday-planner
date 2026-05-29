window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Loading chunk')) {
    const retries = parseInt(sessionStorage.getItem('chunkLoadRetries') || '0', 10);
    if (retries < 3) {
      sessionStorage.setItem('chunkLoadRetries', retries + 1);
      window.location.reload();
    } else {
      sessionStorage.removeItem('chunkLoadRetries');
      console.error('Chunk loading failed after retries:', event.message);
    }
  }
});
