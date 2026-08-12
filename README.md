# PeptideRef

A static peptide information website — no build tools, no dependencies.

## How to run locally

Open `index.html` directly in your browser, or use a simple local server:

- **VS Code**: install the Live Server extension, right-click `index.html` → Open with Live Server
- **Python**: `python -m http.server` then open `http://localhost:8000`
- **Node**: `npx serve .` then open the URL shown

## Structure

```
index.html    — main page
styles.css    — all styles
script.js     — peptide data + all interactivity
```

## Features

- Search peptides, stacks, and blends
- Category filter pills
- Popular peptides horizontal scroll
- Popular stacks and blends sections
- Results view when filtering or searching
