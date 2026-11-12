/*
 * IQ Test Lab configuration — the only file you need to edit for day-to-day changes.
 */
window.SITE_CONFIG = {
  siteName: 'IQ Test Lab',

  /* ---- Detailed report access ----------------------------------------
   * true  -> everyone sees the full report right after the test (launch mode)
   * false -> the summary stays free; the detailed report shows a purchase card.
   * IMPORTANT: this switch is only a front-end gate. Before you charge money,
   * verify payment on the server (see README -> "Adding payments").
   * ------------------------------------------------------------------- */
  fullReportFree: true,
  checkoutUrl: '',          // e.g. your payment-provider checkout link
  priceLabel: '$4.99',      // shown on the purchase card when fullReportFree is false

  /* ---- Test settings -------------------------------------------------- */
  testMinutes: 30,          // overall time limit (most people need 15-22 minutes)

  /* ---- Scoring calibration (PROVISIONAL) -------------------------------
   * Weighted, guess-corrected score -> IQ scale (mean 100, SD 15).
   * mean/sd describe the score distribution of an average adult on this test.
   * They start as expert estimates. Replace them with real values once you
   * have collected anonymous score data (see README -> "Improving accuracy").
   * ------------------------------------------------------------------- */
  norms: { mean: 22, sd: 11 },
  ciHalfWidth: 11           // 90% interval half-width in IQ points (assumes reliability ~0.80)
};
