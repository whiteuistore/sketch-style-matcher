const sketch = require('sketch')
const ui = require('sketch/ui')
const document = sketch.getSelectedDocument()

function runDetach() {
    // 1. Check if there are currently selected objects
    const selectedLayers = document.selectedLayers.layers;
    const isSelectionMode = selectedLayers.length > 0;

    // 2. Configure the system alert depending on the mode
    const alert = NSAlert.alloc().init()
    
    if (isSelectionMode) {
        alert.setMessageText("Detach All (Selected Objects)")
        alert.setInformativeText(`This will flatten ONLY the ${selectedLayers.length} currently selected object(s) and their nested layers.\n\n1. All Symbol Instances will be detached into regular groups.\n2. All Shared Styles will be unlinked.\n3. All Color Variables will be converted to Custom Colors.\n\nVisual appearance remains exactly the same. Proceed?`)
    } else {
        alert.setMessageText("Detach All (Entire Page)")
        alert.setInformativeText("No objects selected. This will completely flatten your design on the CURRENT PAGE.\n\n1. All Symbol Instances will be detached into regular groups.\n2. All Shared Styles will be unlinked.\n3. All Color Variables will be converted to Custom Colors.\n\nVisual appearance remains exactly the same. Proceed?")
    }
    
    alert.addButtonWithTitle("Detach Everything")
    alert.addButtonWithTitle("Cancel")

    const response = alert.runModal()
    if (response != 1000) return

    let detachedSymbols = 0;
    let detachedTextStyles = 0;
    let detachedLayerStyles = 0;
    let detachedVariables = 0;
    
    const page = document.selectedPage;
    
    // Define base layers to work with
    let rootLayers = isSelectionMode ? Array.from(selectedLayers) : Array.from(page.layers);

    // ==========================================
    // PHASE 1: UNPACK ALL SYMBOLS FIRST
    // ==========================================
    
    // Function to safely detach symbols and update references
    function processSymbolsForLayer(layer) {
        let currentLayer = layer;
        
        // If the root layer itself is a symbol — detach it
        if (currentLayer.type === 'SymbolInstance') {
            currentLayer = currentLayer.detach({ recursively: true });
            detachedSymbols++;
        }
        
        // Find nested symbols inside the current layer (or the new group)
        if (currentLayer.layers) {
            let instances = sketch.find('SymbolInstance', currentLayer);
            let safetyLimit = 50; 
            
            while (instances.length > 0 && safetyLimit > 0) {
                instances.forEach(instance => {
                    try {
                        instance.detach({ recursively: true }); 
                        detachedSymbols++;
                    } catch(e) {}
                });
                instances = sketch.find('SymbolInstance', currentLayer);
                safetyLimit--;
            }
        }
        
        return currentLayer; // Return the actual layer for Phase 2
    }

    // Process symbols and update the array of root layers
    rootLayers = rootLayers.map(layer => processSymbolsForLayer(layer));

    // Helper function to force Sketch to create a clean Custom Color
    function detachColorVariable(jsColorObject) {
        const originalColor = jsColorObject.color;
        const tempColor = originalColor === '#00000000' ? '#ffffff00' : '#00000000';
        
        jsColorObject.color = tempColor;     
        jsColorObject.color = originalColor; 
    }

    // ==========================================
    // PHASE 2: RECURSIVE DEEP SCAN FOR STYLES
    // ==========================================
    function processLayer(layer) {
        const skObj = layer.sketchObject;
        if (!skObj) return;

        // --- DETACH TEXT LAYERS ---
        if (layer.type === 'Text') {
            if (layer.sharedStyleId) {
                layer.sharedStyleId = null;
                detachedTextStyles++;
            }

            const textColorObj = skObj.textColor ? (typeof skObj.textColor === 'function' ? skObj.textColor() : skObj.textColor) : null;
            if (textColorObj && typeof textColorObj.swatchID === 'function' && textColorObj.swatchID()) {
                const originalColor = layer.style.textColor;
                const tempColor = originalColor === '#00000000' ? '#ffffff00' : '#00000000';
                layer.style.textColor = tempColor;
                layer.style.textColor = originalColor;
                detachedVariables++;
            }
        } 
        
        // --- DETACH VECTOR LAYERS ---
        else if (layer.type === 'ShapePath' || layer.type === 'Shape' || layer.type === 'Rectangle' || layer.type === 'Oval' || layer.type === 'Frame') {
            if (layer.sharedStyleId) {
                layer.sharedStyleId = null;
                detachedLayerStyles++;
            }

            const style = layer.style;
            if (style) {
                style.fills.forEach(fill => {
                    if (fill.sketchObject) {
                        const colorObj = typeof fill.sketchObject.color === 'function' ? fill.sketchObject.color() : fill.sketchObject.color;
                        if (colorObj && typeof colorObj.swatchID === 'function' && colorObj.swatchID()) {
                            detachColorVariable(fill);
                            detachedVariables++;
                        }
                    }
                });
                
                style.borders.forEach(border => {
                    if (border.sketchObject) {
                        const colorObj = typeof border.sketchObject.color === 'function' ? border.sketchObject.color() : border.sketchObject.color;
                        if (colorObj && typeof colorObj.swatchID === 'function' && colorObj.swatchID()) {
                            detachColorVariable(border);
                            detachedVariables++;
                        }
                    }
                });
            }
        }

        // --- RECURSION ---
        if (layer.layers && layer.layers.length > 0) {
            layer.layers.forEach(subLayer => processLayer(subLayer));
        }
    }

    // Run Phase 2 on the updated (detached from symbols) layers
    rootLayers.forEach(layer => processLayer(layer));

    // ==========================================
    // PHASE 3: FINAL REPORT
    // ==========================================
    const resultAlert = NSAlert.alloc().init();
    resultAlert.setMessageText("Global Detach Complete");
    
    const total = detachedSymbols + detachedTextStyles + detachedLayerStyles + detachedVariables;
    const scopeName = isSelectionMode ? "selected objects" : "this page";
    
    if (total > 0) {
        resultAlert.setInformativeText(
            `Successfully flattened elements within ${scopeName}:\n\n` +
            `• Symbols unpacked: ${detachedSymbols}\n` +
            `• Text Styles detached: ${detachedTextStyles}\n` +
            `• Layer Styles detached: ${detachedLayerStyles}\n` +
            `• Color Variables converted to Custom: ${detachedVariables}\n\n` +
            `Your design is now completely independent.`
        );
    } else {
        resultAlert.setInformativeText(`No symbols, linked styles, or variables were found within ${scopeName}.`);
    }
    
    resultAlert.addButtonWithTitle("Close");
    resultAlert.runModal();
}

runDetach();