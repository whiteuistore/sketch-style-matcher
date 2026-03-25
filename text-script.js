const sketch = require('sketch')
const ui = require('sketch/ui')
const document = sketch.getSelectedDocument()
const styles = document.sharedTextStyles
const page = document.selectedPage

function runPlugin() {
    // 1. Check if Shared Text Styles exist in the document
    if (!styles || styles.length === 0) {
        ui.alert("Match Text Styles", "❌ No Shared Text Styles found. Please create them first.")
        return
    }

    // 2. System window (NSAlert) for confirmation
    const alert = NSAlert.alloc().init()
    alert.setMessageText("Match Text Styles")
    alert.setInformativeText("This will scan all Artboards on the CURRENT PAGE and apply matching Shared Text Styles to unlinked text layers.")
    alert.addButtonWithTitle("Start Analysis")
    alert.addButtonWithTitle("Cancel")

    const response = alert.runModal()
    if (response != 1000) return // Exit if Cancel is clicked
        
    startAnalysis()
}

function startAnalysis() {
    let updatedCount = 0
    let skippedCount = 0

    // Filter to include only Artboards and Symbol Masters (Sketch's equivalent to frames)
    const artboards = page.layers.filter(layer => layer.type === 'Artboard' || layer.type === 'SymbolMaster')

    if (artboards.length === 0) {
        ui.message("No Artboards found on the current page.")
        return
    }

    // Iterate through each artboard
    artboards.forEach(artboard => {
        // Find text layers ONLY inside the current artboard
        const textLayers = sketch.find('Text', artboard)

        textLayers.forEach(layer => {
            // Process the layer only if it DOES NOT have a shared style applied yet
            if (!layer.sharedStyleId) {
                const layerStyle = layer.style
                
                // Look for an exact match based on key font parameters
                const match = styles.find(sharedStyle => {
                    const s = sharedStyle.style
                    return (
                        s.fontFamily === layerStyle.fontFamily &&
                        s.fontSize === layerStyle.fontSize &&
                        s.kerning === layerStyle.kerning &&
                        s.fontWeight === layerStyle.fontWeight &&
                        s.fontStyle === layerStyle.fontStyle
                    )
                })

                if (match) {
                    // Link the layer to the shared style and sync its appearance
                    layer.sharedStyleId = match.id
                    layer.style.syncWithSharedStyle(match)
                    updatedCount++
                } else {
                    skippedCount++
                }
            }
        })
    })

    // 3. Final result window
    const finalAlert = NSAlert.alloc().init()
    finalAlert.setMessageText("Analysis Complete")
    
    if (updatedCount > 0) {
        finalAlert.setInformativeText(`Successfully matched and linked ${updatedCount} text layers inside Artboards.`)
    } else {
        finalAlert.setInformativeText("No new matches found. All text layers are either already linked or do not match existing styles.")
    }
    
    finalAlert.addButtonWithTitle("Close")
    finalAlert.runModal()
}

// Run the plugin
runPlugin();