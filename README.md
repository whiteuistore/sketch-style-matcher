# 💎 Sketch Styles Auto-Matcher

<img src="https://github.com/whiteuistore/sketch-style-matcher/blob/c8434e4084986b5eb1675aba78db402cb4e10233/assets/Plugin%20Banner.jpg" alt="Sketch Styles Auto-Matcher">

**Styles Auto-Matcher** is a powerful Sketch plugin designed to handle a UI designer's most tedious tasks. It automatically scans your designs, identifies unlinked layers (text, vectors, frames), and **seamlessly links them** to your existing Shared Styles and Color Variables based on their visual properties. 

When you need to hand off a clean, dependency-free file, the plugin also features a one-click "Global Detach" tool that flattens your entire design system while keeping the visual output pixel-perfect.

---

## 🚀 Core Features (What's Inside)

The plugin consists of 4 independent tools, each engineered for a specific workflow:

### 1. 🎨 Match Color Variables (`color-script.js`)

<p align="center">
  <video src="https://github.com/user-attachments/assets/b179175c-bf69-4164-83ea-66cdfb2eaa16" width="100%" controls>
  </video>
</p>

Scans vector shapes and text layers with custom colors and automatically applies the matching **Color Variables** from your document.
* **How it matches:** Compares the exact HEX color codes.
* **Scope:** Scans inside all Artboards on the current page.
* **Safety:** Strictly ignores layers that already have a variable applied.

### 2. 📝 Match Text Styles (`text-script.js`)

Apply text styles for artboards/frames

<p align="center">
  <video src="https://github.com/user-attachments/assets/3bef45d5-000a-4580-b411-a19446e8bbea" width="100%" controls>
  </video>
</p>

Apply text styles for symbols

<p align="center">
  <video src="https://github.com/user-attachments/assets/de2bde91-3883-428e-bba2-9fc17f258edd" width="100%" controls>
  </video>
</p>

Automatically links disconnected or newly created text layers to your library's **Shared Text Styles**.
* **How it matches:** Compares 5 exact parameters: `Font Family`, `Font Size`, `Font Weight`, `Font Style`, and `Kerning`. If everything matches perfectly, the style is applied.
* **Scope:** Scans inside all Artboards on the current page.

### 3. ✨ Match Shared Styles [Advanced] (`shared-styles.js`)

<p align="center">
  <video src="https://github.com/user-attachments/assets/57b0da6a-4471-4160-85d7-3a534e2fab31" width="100%" controls>
  </video>
</p>

An advanced algorithm for linking vector objects and Frames to your **Shared Layer Styles**.
* **Smart Context:** Runs on the entire page OR **only on currently selected objects** (Selection Mode).
* **Deep Analysis:** Creates a unique visual signature. It compares Fills, Borders, Inner/Outer Shadows, Blur Effects, and Opacity.
* **Geometry Protection:** Strictly **ignores Corner Radius**. The plugin applies the visual style but will never destroy your custom corner radii on buttons or cards.

### 4. 💣 Global Detach (`detach-script.js`)

<p align="center">
  <video src="https://github.com/user-attachments/assets/f3765b98-e0a4-4169-a385-bbeadf13f5a6" width="100%" controls>
  </video>
</p>


The ultimate tool for disconnecting a layout from a design system ("flattening").
* **Smart Context:** Detaches the entire page OR only selected elements.
* **What it does:** 1. Recursively unpacks all Symbol Instances into regular groups.
  2. Unlinks all Shared Text and Layer Styles.
  3. Converts all Color Variables back into standard Custom Colors.
* **The Result:** The layout becomes 100% independent, but its **visual appearance remains absolutely identical**.

---

## 💡 Use Cases (When is this indispensable?)

* **🧹 Cleaning up third-party UI Kits.** Downloaded templates often feature elements drawn by hand with no style links. This plugin connects them to your local library in seconds.
* **🎨 Taming creative chaos.** You sketched a concept quickly using the eyedropper and custom colors. Once approved, you can organize the file with a single click, ensuring strict adherence to your design system.
* **📦 Developer / Client Handoff.** If a client requests a "clean" source file without dependencies on external symbol libraries, use the **Detach All** command.
* **✂️ Targeted Local Edits.** Thanks to *Selection Mode*, you can link or detach a single icon or component without affecting the hundreds of other artboards on your page.

---

## ⚙️ How It Works (Under the Hood)

The plugin is built around a strict "Do No Harm" philosophy:
1. **It respects existing links:** If a layer already has a Shared Style ID or a Color Variable, the plugin skips it completely.
2. **Soft Native Linking:** The script utilizes Sketch's internal native API to apply styles smoothly. This prevents the plugin from overwriting local object properties.
3. **Context-Aware Execution:** The scripts automatically understand your intent. If you select 3 objects and run the plugin, it only processes those 3. If you deselect everything, it scans the entire page.

---

## 📥 Installation

1. Navigate to the [Releases](../../releases) page in this repository.
2. Download the latest version archive (`Sketch-Styles-Auto-Matcher.sketchplugin.zip`).
3. Unzip the downloaded file.
4. Double-click the **`Styles-Matcher.sketchplugin`** file. Sketch will automatically install the plugin and show a success notification.

---

## 🛠 Usage

Once installed, you can access the tools from the top menu in Sketch:
**`Plugins`** ➔ **`Styles Auto-Matcher`**

Available menu commands:
* `Find and Apply Text Styles`
* `Find and Apply Color Variables`
* `Find and Apply Shared Styles`
* `---`
* `Detach Symbols, Styles, and Variables`

Before running any command, the plugin will display a system alert detailing exactly how many objects are selected and what changes will be made.

---

## ☕ Support & Resources

Developed and maintained by **WhiteUI.Store**. If you find this plugin helpful, feel free to explore more resources or support the development:

* **Official Website:** [WhiteUI.Store](https://www.whiteui.store/)
* **Support the Project:** [Buy Me a Coffee](https://buymeacoffee.com/whiteuistore)

---

### License
This project is available under the MIT License.
