const sketch = require('sketch')
const ui = require('sketch/ui')
const document = sketch.getSelectedDocument()
const sharedStyles = document.sharedLayerStyles
const page = document.selectedPage

function runPlugin() {
    // Check if Shared Layer Styles exist in the document
    if (!sharedStyles || sharedStyles.length === 0) {
        ui.alert("Match Shared Styles", "❌ No Shared Layer Styles found in this document.")
        return
    }

    // Check if there are currently selected objects
    const selectedLayers = document.selectedLayers.layers;
    const isSelectionMode = selectedLayers.length > 0;

    const alert = NSAlert.alloc().init()
    
    // Adapt title and text based on the current mode (Selection vs. Page)
    if (isSelectionMode) {
        alert.setMessageText("Apply Shared Styles (Selected Objects)")
        alert.setInformativeText(`This will scan ONLY the ${selectedLayers.length} currently selected object(s) and their nested layers.\n\nIt matches exact Opacity, Fills, Outlines, Shadows, and Blur. Corner Radius is ignored.`)
    } else {
        alert.setMessageText("Apply Shared Styles (Entire Page)")
        alert.setInformativeText("No objects selected. This will scan ALL Vectors and Frames on the CURRENT PAGE.\n\nIt matches exact Opacity, Fills, Outlines, Shadows, and Blur. Corner Radius is ignored.")
    }
    
    alert.addButtonWithTitle("Start Analysis")
    alert.addButtonWithTitle("Cancel")

    const response = alert.runModal()
    if (response != 1000) return 
        
    startAnalysis(isSelectionMode, selectedLayers)
}

/**
 * Creates an advanced style signature based on:
 * Opacity, Fills, Borders, Shadows, Inner Shadows, and Blur.
 */
function getStyleSignature(style) {
    if (!style) return null;
    
    // --- 1. FILLS ---
    let fills = [];
    if (style.fills) {
        style.fills.forEach(f => {
            if (f.enabled && f.fillType === 'Color' && f.color) {
                fills.push(String(f.color).toLowerCase());
            }
        });
    }
    
    // --- 2. BORDERS (OUTLINES) ---
    let borders = [];
    if (style.borders) {
        style.borders.forEach(b => {
            if (b.enabled && b.fillType === 'Color' && b.color) {
                borders.push(String(b.color).toLowerCase());
            }
        });
    }
    let uniqueBorders = [...new Set(borders)].sort();
    
    // --- 3. OUTER SHADOWS ---
    let shadows = [];
    if (style.shadows) {
        style.shadows.forEach(s => {
            if (s.enabled) {
                // Collect color, X, Y, Blur, and Spread
                shadows.push(`${String(s.color).toLowerCase()}@${s.x},${s.y},${s.blur},${s.spread}`);
            }
        });
    }

    // --- 4. INNER SHADOWS ---
    let innerShadows = [];
    if (style.innerShadows) {
        style.innerShadows.forEach(i => {
            if (i.enabled) {
                innerShadows.push(`${String(i.color).toLowerCase()}@${i.x},${i.y},${i.blur},${i.spread}`);
            }
        });
    }

    // --- 5. EFFECTS / BLUR ---
    let blur = "none";
    if (style.blur && style.blur.enabled) {
        // Collect blur type (Gaussian, Background, etc.) and its radius
        blur = `${style.blur.blurType}@${style.blur.radius}`;
    }

    // --- 6. OPACITY ---
    // Extract opacity and round to 2 decimal places to avoid precision bugs
    let opacity = style.opacity !== undefined ? Number(style.opacity).toFixed(2) : "1.00";
    
    // Skip if the object is visually "empty" (no fills, borders, shadows, or blur)
    if (fills.length === 0 && uniqueBorders.length === 0 && shadows.length === 0 && innerShadows.length === 0 && blur === "none") {
        return null;
    }

    // Final unique style signature string
    return `o:${opacity}||f:${fills.join(',')}||b:${uniqueBorders.join(',')}||s:${shadows.join(',')}||is:${innerShadows.join(',')}||e:${blur}`;
}

function startAnalysis(isSelectionMode, selectedLayers) {
    let updatedCount = 0;

    // Map all existing Shared Styles for quick lookup
    const styleMap = new Map();
    sharedStyles.forEach(sharedStyle => {
        const sig = getStyleSignature(sharedStyle.style);
        if (sig) {
            styleMap.set(sig, sharedStyle);
        }
    });

    if (styleMap.size === 0) {
        ui.message("Your Shared Styles don't contain any visual properties to match.");
        return;
    }

    // Define root layers for scanning: either the selection or the entire page
    const rootLayers = isSelectionMode ? selectedLayers : page.layers;
    
    if (rootLayers.length === 0) {
        ui.message("No layers found to process.");
        return;
    }

    // Recursive function to process layers and nested groups
    function processLayer(layer) {
        const isVector = layer.type === 'ShapePath' || layer.type === 'Shape' || layer.type === 'Rectangle' || layer.type === 'Oval';
        // Account for Sketch API quirks regarding Frames
        const isFrame = layer.type === 'Frame' || layer.isFrame === true || layer.type === 'Artboard';
        const isTargetLayer = isVector || isFrame;

        if (isTargetLayer && layer.style) {
            
            // STRICT CONDITION: Only process if a Shared Style is NOT already applied
            if (!layer.sharedStyleId) {
                const layerSignature = getStyleSignature(layer.style);
                
                // If the exact signature exists in our Shared Styles library
                if (layerSignature && styleMap.has(layerSignature)) {
                    const matchedStyle = styleMap.get(layerSignature);
                    
                    if (layer.sketchObject && matchedStyle.sketchObject) {
                        
                        // --- SOFT NATIVE LINKING ---
                        // Set the Shared Style ID
                        layer.sketchObject.setSharedStyleID(matchedStyle.id);
                        
                        // Sync colors, shadows, and effects without altering geometry (Corner Radius)
                        if (layer.sketchObject.style().syncWithSharedStyle) {
                            layer.sketchObject.style().syncWithSharedStyle(matchedStyle.sketchObject);
                        } else {
                            layer.style.syncWithSharedStyle(matchedStyle);
                        }
                        
                        updatedCount++;
                    }
                }
            }
        }

        // Dive into groups/frames (works equally well for page layers or selected groups)
        if (layer.layers && layer.layers.length > 0) {
            layer.layers.forEach(subLayer => processLayer(subLayer));
        }
    }

    // Run the scan
    rootLayers.forEach(layer => processLayer(layer));

    // Final result window
    const finalAlert = NSAlert.alloc().init();
    finalAlert.setMessageText("Analysis Complete");
    
    const scopeName = isSelectionMode ? "selected objects" : "the page";
    
    if (updatedCount > 0) {
        finalAlert.setInformativeText(`Successfully matched and applied Shared Layer Styles to ${updatedCount} unstyled objects within ${scopeName}.`);
    } else {
        finalAlert.setInformativeText(`No new matches found within ${scopeName}. Objects either don't match your library, or all valid objects are already styled.`);
    }
    
    finalAlert.addButtonWithTitle("Close");
    finalAlert.runModal();
}

runPlugin();