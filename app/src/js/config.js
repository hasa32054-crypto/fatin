/* ---------- configuration in one place ----------
   The Fatin server address is not here: it comes from app/config.json at start-up (FATIN.server),
   so a copy of Fatin can point to its own server without touching the code. */
const CONFIG={
  SITE_URL:"https://hasa32054-crypto.github.io/fatin/",   // the public site (QR code, sharing)
  OWN_KEY_MODEL:"claude-haiku-4-5-20251001",                // only used when someone types their own Claude key
  RADAR_POLL_MS:60000,                                      // the radar changes slowly
  FAMILY_POLL_MS:15000,                                     // a relative's alert should show up quickly
  TTS_TIMEOUT_MS:14000, STT_TIMEOUT_MS:15000,               // give up on the natural voice / speech-to-text after this
};
