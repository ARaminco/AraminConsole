# Bank & card-network logos — sources and licences

All logos are trademarks of their respective owners. They are included **for identification only** (to show which bank issued a card or Sheba number); their inclusion does not imply endorsement. Do not use them to suggest an affiliation with a bank.

`scripts/build.mjs` turns `src/banks/logos/*.svg` + `banks.json` into `dist/banks.svg` (symbols `bank-<slug>`, `bank-<slug>-mono`, `net-<slug>`, `net-<slug>-mono`) and copies the MIT notice to `dist/LICENSE-bank-logos.txt`. The build only rounds path coordinates to 0.1 and namespaces internal ids; the vendored files themselves are verbatim (each starts with a provenance comment).

## 1. Iranian banks — vendored (MIT)
Source: npm `@iran-utils/iranian-banks-icons-core@1.0.4` — https://github.com/houtan-rocky/iranian-banks-react-icons — licence **MIT**, © 2026 Houtan Rocky (full text: `LICENSES/iranian-banks-icons-core.MIT.txt`).
Files: `<slug>.svg` = the package's `…ColorIcon`, `<slug>.mono.svg` = its `…Icon` (single colour; the build swaps the fill for `currentColor`).

| slug | export | slug | export |
|---|---|---|---|
| melli | Melli | sepah | Sepah |
| mellat | Mellat | tejarat | Tejarat |
| saderat | Saderat | pasargad | Pasargad |
| saman | Saman | parsian | Parsian |
| eghtesad-novin | EghtesadNovin | keshavarzi | Keshavarzi |
| maskan | Maskan | refah | Refah |
| sina | Sina | shahr | Shahr |
| dey | Dey | ayandeh | Ayandeh |
| resalat | Resalat | mehr-iran | MehrIran |
| post | Post | tosee-saderat | ToseeSaderat |
| tosee-taavon | ToseeTaavon | sanat-madan | SanatMadan |
| karafarin | Karafarin | gardeshgari | Gardeshgari |
| iran-zamin | IranZamin | khavarmianeh (Middle East Bank) | KhavarMianeh |
| sarmayeh | Sarmayeh | iran-venezuela | IranVenezuela |
| markazi | BankMarkazi | tosee (credit institution) | Tosee |
| melal | Melall | noor | Noor |
| ansar (merged → Sepah) | SepahMergedAnsar | ghavamin (merged → Sepah) | SepahMergedGhavamin |
| hekmat (merged → Sepah) | SepahMergedHekmat | kosar (merged → Sepah) | SepahMergedKosar |
| mehr-eghtesad (merged → Sepah) | SepahMergedMehrEghtesad | | |

Caveat: the package licenses its SVG files under MIT; the underlying marks remain the banks' trademarks.

## 2. Card networks and international banks — vendored (CC0)
Source: npm `simple-icons@16.35.0` — https://github.com/simple-icons/simple-icons — licence **CC0-1.0** (public-domain dedication of the SVG paths; see their DISCLAIMER.md about trademarks). Files `<slug>.si.svg`, verbatim minus `<title>`; brand colour from simple-icons' data is applied by the build.

visa (`visa`), mastercard (`mastercard`), amex (`americanexpress`), jcb, discover, diners (`dinersclub`), paypal, hsbc, revolut, barclays, deutsche-bank (`deutschebank`), chase, wise, n26.

## 3. Monograms — generated, not copied
Where no licence-compatible SVG exists, the build draws a badge: the short name in white on the brand colour (`logo: "monogram"` in `banks.json`). No official artwork is used.

- networks: **shetab** («شتاب»), **unionpay** («UP»), **mir** («МИР») — not in simple-icons 16 and no compatible source found;
- international banks: **emirates-nbd** («ENBD»), **ziraat** («ZB»).

## 4. Data (BINs, Sheba codes, colours)
- BIN prefixes and Sheba bank codes: publicly documented lists (Central Bank of Iran / Shaparak Sheba bank-code table, bank websites); cross-checked against `iran-bank-detector@1.0.5` (ISC) and the `persian-tools` project. Facts only; no code copied. 051 is Tose'e credit institution and 022 is Tose'e Ta'avon bank (some lists swap them).
- Colours: sampled from the vendored logos and adjusted darker for white text on cards; they are not official brand specifications.
