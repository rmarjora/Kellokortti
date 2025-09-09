const express = require('express');

// Factory that creates the keycards router and wires events to the given BrowserWindow
// getMainWindow can be a function returning the current main window, or the window itself.
module.exports = function createKeycardRouter(getMainWindow) {
  const router = express.Router();

  router.post('/', (request, response) => {
    const uid = request.body && request.body.uid;
    console.log('Fob scanned:', uid);

    try {
      const win = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
      if (win && win.webContents) {
        // Notify renderer that a keycard was scanned
        win.webContents.send('keycard-scanned', { uid, ts: Date.now() });
      } else {
        console.warn('[keycards] No main window available to send event');
      }
    } catch (e) {
      console.error('[keycards] Failed to send keycard event to renderer', e);
    }

    response.send('ok');
  });

  return router;
};