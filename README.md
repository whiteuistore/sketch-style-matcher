# Sketch Font Auto-Matcher 🎨

**Automatically match and apply Shared Text Styles to layers based on font properties.**

Developed by [WhiteUI.Store](https://www.whiteui.store/)

---

## Plugin Preview

![Sketch Font Auto-Matcher in action](LINK_TO_YOUR_IMAGE_ON_GITHUB)

*Above: Example of how the plugin scans the page and applies matching styles, displaying a summary report.*

---

## Overview

**Sketch Font Auto-Matcher** is a productivity tool for Sketch designers that eliminates the tedious manual work of linking text layers to Shared Styles. If you have an existing design system or a UI Kit with defined Text Styles, this plugin will scan your layers and automatically apply the correct Shared Style by matching:

* **Font Family**
* **Font Size**
* **Font Weight**
* **Kerning (Character Spacing)**
* **Font Style (Italic/Normal)**

It is particularly useful when importing assets from other files or when cleaning up a document where styles have been detached.

---

## Key Features

✅ **Automatic Scanning:** Processes all text layers on the current page with one click.  
✅ **Smart Matching:** Uses a precise algorithm to ensure layers only link to styles that exactly match their properties.  
✅ **Summary Report:** Displays a native macOS alert showing how many styles were applied and how many layers remain without a match.  
✅ **Branded UI:** Integrated links to the WhiteUI.Store ecosystem for quick support and updates.  
✅ **Privacy Focused:** Works locally within your Sketch environment; no data is sent to external servers.

---

## Installation

1.  **Download** the latest release [here](https://github.com/your-username/sketch-font-auto-matcher/releases).
2.  **Unzip** the archive if necessary.
3.  **Double-click** `Sketch Font Auto-Matcher.sketchplugin` to install.

---

## How to Use

1.  Ensure you have **Shared Text Styles** defined in your document.
2.  Go to `Plugins` -> `Sketch Font Auto-Matcher` -> `Find and Apply Styles`.
3.  The plugin will analyze all text layers on your current page and apply matching styles instantly.
4.  Review the summary report to see the results.

---

## Technical Details

* **Identifier:** `com.whiteuistore.font-matcher`
* **API Version:** Uses the latest Sketch JavaScript API (NSAlert for stable UI).
* **Compatibility:** Sketch 90+

---

## About WhiteUI.Store

WhiteUI.Store provides high-quality UI Kits, Framer templates, and design tools to speed up your workflow. Visit our website for more resources.

🔗 [www.whiteui.store](https://www.whiteui.store/)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
