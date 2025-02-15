// Create custom library entry
const diagram = new mxCell(null, new mxGeometry(0, 0, 100, 100), 'shape=image');
diagram.setVertex(true);

// Function to fetch and process Mermaid code
async function fetchMermaidDiagram(url) {
    try {
        const response = await fetch(url);
        const mermaidCode = await response.text();
        
        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
        
        // Generate SVG
        const { svg } = await mermaid.render('mermaid-diagram', mermaidCode);
        
        // Convert SVG to data URL
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
        
        return dataUrl;
    } catch (error) {
        console.error('Error fetching or processing Mermaid diagram:', error);
        return null;
    }
}

// Add custom menu item
Draw.loadPlugin(function(ui) {
    ui.actions.addAction('importMermaid', function() {
        const dlg = new FilenameDialog(ui, 'Enter Mermaid URL:', 'Import', function(url) {
            if (url) {
                fetchMermaidDiagram(url).then(dataUrl => {
                    if (dataUrl) {
                        const cell = diagram.clone();
                        cell.style += ';image=' + dataUrl;
                        
                        const gs = ui.editor.graph.getGridSize();
                        cell.geometry.x = gs;
                        cell.geometry.y = gs;
                        
                        ui.editor.graph.getModel().beginUpdate();
                        try {
                            ui.editor.graph.addCell(cell);
                        } finally {
                            ui.editor.graph.getModel().endUpdate();
                        }
                    }
                });
            }
        });
        ui.showDialog(dlg.container, 300, 80, true, true);
    });
    
    // Add menu item
    const menu = ui.menus.get('insert');
    const oldItems = menu.funct;
    
    menu.funct = function(menu, parent) {
        oldItems.apply(this, arguments);
        ui.menus.addMenuItems(menu, ['-', 'importMermaid'], parent);
    };
});

// Add keyboard shortcut
mxKeyHandler.prototype.getFunction = function(evt) {
    if (evt.keyCode === 77 && mxEvent.isControlDown(evt)) { // Ctrl+M
        return this.editor.execute('importMermaid');
    }
    return null;
};
