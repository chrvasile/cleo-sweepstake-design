# Cleo Prototype Flow Importer

This is a local Figma plugin for importing `cleo-figma-flow-*.json` files exported from the prototype shell.

## Use

1. In the prototype, click the download button next to the content-map and screenshot controls.
2. In Figma, open Plugins > Development > Import plugin from manifest.
3. Choose `tools/figma-importer/manifest.json`.
4. Run "Cleo Prototype Flow Importer".
5. Drop or paste the exported JSON and click "Import flow".

## What v1 Creates

- One editable Figma frame per prototype screen.
- Editable text nodes for text layers.
- Rectangle image fills for images.
- Imported SVG nodes for icons.
- Measured editable frames for captured prototype DOM.
- Auto-layout only for explicit semantic primitives where it improves fidelity.
- Directional arrows from the content map edges.

Token matches and unsupported CSS warnings are stored as plugin data on imported nodes for later style/component matching work.
