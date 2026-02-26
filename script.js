const sketch = require('sketch')
const ui = require('sketch/ui')
const document = sketch.getSelectedDocument()
const styles = document.sharedTextStyles
const page = document.selectedPage

function runPlugin() {
    // 1. Checking for styles
    if (!styles || styles.length === 0) {
        ui.alert("Sketch Styles Auto-Matcher: ❌ No Shared Text Styles were found in the document. Create styles before running.")
        return
    }

    // 2. We create a native window (NSAlert) for stability
    const alert = NSAlert.alloc().init()
    alert.setMessageText("Sketch Styles Auto-Matcher:")
    alert.setInformativeText("The plugin will apply pre-made document styles to text layers on the current page if the font, size, and style match.")
    alert.addButtonWithTitle("Start Analysis")
    alert.addButtonWithTitle("Cancel")

    const response = alert.runModal()
    if (response == 1000) { // The "Start Analysis" button was clicked
        startAnalysis()
    }
}

function startAnalysis() {
    let updatedCount = 0
    let skippedCount = 0

    const textLayers = sketch.find('Text', page)

    if (textLayers.length === 0) {
        ui.message("There are no text layers on this page.")
        return
    }

    textLayers.forEach(layer => {
        if (!layer.sharedStyleId) {
            const layerStyle = layer.style
            
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
                layer.sharedStyleId = match.id
                layer.style.syncWithSharedStyle(match)
                updatedCount++
            } else {
                skippedCount++
            }
        }
    })

    // 3. Result window
    const finalAlert = NSAlert.alloc().init()
    finalAlert.setMessageText("Analysis result")
    
    const resultDetails = updatedCount > 0 
        ? `Done!\n\Styles Applied: ${updatedCount}`
        : "ℹ️ None of the layers matched the existing styles."
    
    finalAlert.setInformativeText(`${resultDetails}\n`)
    finalAlert.addButtonWithTitle("Close")
    finalAlert.runModal()

    if (updatedCount > 0) {
        ui.message(`✅ Done! Styles Applied: ${updatedCount}`)
    }
}

// Run
runPlugin();