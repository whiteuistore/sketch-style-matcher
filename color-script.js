const sketch = require('sketch')
const ui = require('sketch/ui')
const document = sketch.getSelectedDocument()
const swatches = document.swatches

function runColorMatcher() {
    // 1. System alert with logic description
    const alert = NSAlert.alloc().init()
    alert.setMessageText("Match Vector & Text Colors")
    alert.setInformativeText("This will scan all Artboards on the CURRENT PAGE. It will apply matching Color Variables to vector fills and text layers that are not yet linked.")
    
    alert.addButtonWithTitle("Start Analysis")
    alert.addButtonWithTitle("Cancel")

    const response = alert.runModal()
    if (response != 1000) return

    // 2. Check if Color Variables exist in the document
    if (!swatches || swatches.length === 0) {
        ui.alert("Styles Auto-Matcher", "❌ No Color Variables found in this document.")
        return
    }

    let updatedFills = 0;
    let updatedTexts = 0; // Added counter for text layers
    
    // Get the currently selected page
    const page = document.selectedPage;

    // Find all Artboards (and Symbol Masters) on this page
    const artboards = page.layers.filter(layer => layer.type === 'Artboard' || layer.type === 'SymbolMaster');

    if (artboards.length === 0) {
        ui.message("No Artboards found on the current page.");
        return;
    }

    // 3. Recursive function for deep search inside found artboards
    function processLayer(layer) {
        
        // --- LOGIC FOR TEXT LAYERS ---
        if (layer.type === 'Text') {
            const skObj = layer.sketchObject;
            if (skObj) {
                // Safe access to the text color object
                const textColorObj = typeof skObj.textColor === 'function' ? skObj.textColor() : skObj.textColor;
                
                // Check that the variable is NOT YET applied (!swatchID)
                if (textColorObj && typeof textColorObj.swatchID === 'function' && !textColorObj.swatchID()) {
                    const match = findSwatchMatch(layer.style.textColor);
                    
                    if (match) {
                        // Apply the Color Variable to the text
                        layer.style.textColor = match.referencingColor;
                        updatedTexts++;
                    }
                }
            }
        }
        
        // --- LOGIC FOR VECTOR SHAPES ---
        else if (layer.type === 'ShapePath' || layer.type === 'Shape' || layer.type === 'Rectangle' || layer.type === 'Oval') {
            const style = layer.style;
            
            if (style && style.fills) {
                style.fills.forEach(fill => {
                    // Check: fill is enabled, it's a solid color, and native object is accessible
                    if (fill.enabled && fill.fillType === 'Color' && fill.sketchObject && fill.sketchObject.color) {
                        const fillSkObj = fill.sketchObject;
                        
                        // Safe access to the color object
                        const colorObj = typeof fillSkObj.color === 'function' ? fillSkObj.color() : fillSkObj.color;
                        
                        // Check that the variable is NOT YET applied (!swatchID)
                        if (colorObj && typeof colorObj.swatchID === 'function' && !colorObj.swatchID()) {
                            const match = findSwatchMatch(fill.color);
                            
                            if (match) {
                                // Apply the Color Variable
                                fill.color = match.referencingColor;
                                updatedFills++;
                            }
                        }
                    }
                });
            }
        }

        // --- RECURSION ---
        // If it's a group, stack, or another container, dive inside
        if (layer.layers && layer.layers.length > 0) {
            layer.layers.forEach(subLayer => processLayer(subLayer));
        }
    }

    // 4. Run processing only for artboards on the current page
    artboards.forEach(artboard => processLayer(artboard));

    // 5. Final report
    const resultAlert = NSAlert.alloc().init();
    resultAlert.setMessageText("Analysis Complete");
    
    const total = updatedFills + updatedTexts;
    
    if (total > 0) {
        resultAlert.setInformativeText(
            `Successfully matched and linked attributes on this page:\n\n` +
            `• Text Colors matched: ${updatedTexts}\n` +
            `• Vector Fills matched: ${updatedFills}\n\n` +
            `Existing linked variables were not affected.`
        );
    } else {
        resultAlert.setInformativeText("No new matches found. All text and vector layers are either already linked or their colors don't match your Color Variables.");
    }
    
    resultAlert.addButtonWithTitle("Close");
    resultAlert.runModal();
}

/**
 * Helper function to find matches by HEX code
 */
function findSwatchMatch(layerColor) {
    if (!layerColor) return null;
    const hexColor = layerColor.toLowerCase();
    return swatches.find(swatch => swatch.color.toLowerCase() === hexColor);
}

runColorMatcher();