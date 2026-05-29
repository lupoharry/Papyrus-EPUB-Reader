# Papyrus - EPUB Reader for Windows 11

A beautiful, modern EPUB reader application built with web technologies. Papyrus provides an elegant reading experience with full EPUB 3.3 specification support.

## Features

### Core Functionality
- ✅ **Full EPUB Support**: Compatible with EPUB 2 and EPUB 3 specifications
- ✅ **ZIP Container Parsing**: Reads standard .epub files (ZIP archives)
- ✅ **Metadata Extraction**: Displays book title, author, publisher, and description
- ✅ **Table of Contents**: Interactive navigation through book chapters
- ✅ **Image Support**: Renders embedded images (JPG, PNG, GIF, SVG, WebP)
- ✅ **Internal Links**: Clickable footnotes and cross-references
- ✅ **Cover Images**: Displays book cover art

### Reading Experience
- 📖 **Beautiful Typography**: Elegant serif fonts for comfortable reading
- 🎨 **Multiple Themes**: Light, Sepia, and Dark reading modes
- 📏 **Customizable Text**: Adjustable font size and line height
- ⌨️ **Keyboard Navigation**: Arrow keys for quick chapter navigation
- 📊 **Reading Progress**: Visual progress bar and chapter counter
- 🖱️ **Drag & Drop**: Simply drag EPUB files into the window
- ⬇️ **Auto-Advance**: Scroll to the bottom of a page to automatically advance to the next chapter
- 🔗 **Working Internal Links**: Click footnotes, cross-references, and links to navigate within the book

### Design Features
- Modern, book-focused aesthetic with warm color palette
- Responsive sidebar with collapsible navigation
- Smooth animations and transitions
- Clean, distraction-free reading interface
- Professional typography system

## Installation & Usage

### Method 1: Direct Browser Use (Easiest)

1. **Download the files**:
   - `epub-reader.html`
   - `epub-reader.js`
   - Place both files in the same folder

2. **Open the reader**:
   - Double-click `epub-reader.html`
   - Opens in your default web browser

3. **Load an EPUB file**:
   - Click "Open EPUB" button
   - Or drag & drop an .epub file into the window

### Method 2: Package as Windows App

You can convert this into a standalone Windows application using Electron or similar tools.

#### Using Electron (Recommended)

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Install LTS version

2. **Create Electron app**:
   ```bash
   npm init -y
   npm install electron --save-dev
   npm install electron-builder --save-dev
   ```

3. **Create `main.js`** (Electron main process):
   ```javascript
   const { app, BrowserWindow } = require('electron');
   const path = require('path');

   function createWindow() {
       const win = new BrowserWindow({
           width: 1400,
           height: 900,
           webPreferences: {
               nodeIntegration: false,
               contextIsolation: true
           },
           icon: path.join(__dirname, 'icon.png') // Optional: add an icon
       });

       win.loadFile('epub-reader.html');
   }

   app.whenReady().then(createWindow);

   app.on('window-all-closed', () => {
       if (process.platform !== 'darwin') {
           app.quit();
       }
   });

   app.on('activate', () => {
       if (BrowserWindow.getAllWindows().length === 0) {
           createWindow();
       }
   });
   ```

4. **Update `package.json`**:
   ```json
   {
     "name": "papyrus-reader",
     "version": "1.0.0",
     "main": "main.js",
     "scripts": {
       "start": "electron .",
       "build": "electron-builder"
     },
     "build": {
       "appId": "com.papyrus.reader",
       "productName": "Papyrus EPUB Reader",
       "win": {
         "target": "nsis",
         "icon": "icon.ico"
       }
     }
   }
   ```

5. **Run the app**:
   ```bash
   npm start
   ```

6. **Build installer**:
   ```bash
   npm run build
   ```

### Method 3: Use as Local Web Server

1. **Install Python** (usually pre-installed on Windows 11):
   ```bash
   python -m http.server 8000
   ```

2. **Open browser**:
   - Navigate to `http://localhost:8000/epub-reader.html`

## Keyboard Shortcuts & Navigation

### Arrow Key Navigation
- **← Left Arrow** - Go to previous chapter
- **→ Right Arrow** - Go to next chapter
- Works everywhere except when typing in input fields

### Button Navigation
- **Top toolbar buttons** - Previous/Next chapter buttons in the header
- **Bottom buttons** - Previous/Next chapter buttons centered at the bottom
  - **Previous button** - Navigate to previous chapter (with ← icon)
  - **Next button** - Navigate to next chapter (with → icon)
  - Buttons are disabled when not applicable (at book start/end)

### Other Navigation
- **Click TOC items** - Jump to any chapter in the table of contents
- **Click internal links** - Navigate to footnotes, references, and other chapters within the book
- **Scroll** - Scroll to bottom of page to auto-advance to next chapter (after 300ms delay)
- **Drag & Drop** - Load EPUB file directly from file browser

## EPUB Specification Support

### EPUB 3.3 Features Supported
- Package Document (OPF) parsing
- Navigation Document (nav.xhtml) - EPUB 3
- NCX Navigation - EPUB 2 fallback
- XHTML Content Documents
- Metadata (Dublin Core)
- Manifest and Spine
- Reading order
- Internal linking and anchors
- Embedded images and media

### Content Types Supported
- HTML5 / XHTML 1.1
- CSS styling (inline and external)
- Images: JPEG, PNG, GIF, SVG, WebP
- Internal hyperlinks
- Table of contents navigation

### Limitations
- No support for:
  - Audio/Video elements (can be added)
  - JavaScript in EPUB content (security)
  - DRM-protected EPUBs
  - Fixed-layout EPUBs (can be added)
  - MathML (would require additional library)
  - Media Overlays

## File Structure

```
papyrus-reader/
├── epub-reader.html    # Main HTML interface
├── epub-reader.js      # Application logic and EPUB parser
└── README.md          # This file
```

## Technical Details

### Dependencies
- **JSZip** (3.10.1) - ZIP file extraction (loaded via CDN)
- Pure JavaScript - No other dependencies required

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

### How It Works

1. **File Loading**: User selects .epub file via file picker or drag-drop
2. **ZIP Extraction**: JSZip extracts the EPUB container
3. **Container Parsing**: Reads META-INF/container.xml to locate OPF file
4. **OPF Parsing**: Extracts metadata, manifest, and spine (reading order)
5. **Navigation**: Parses nav.xhtml (EPUB 3) or .ncx (EPUB 2) for TOC
6. **Content Rendering**: Loads and displays XHTML chapters
7. **Image Handling**: Converts embedded images to base64 data URLs
8. **Link Processing**: Handles internal links and anchors

## Customization

### Changing Colors
Edit CSS variables in `epub-reader.html`:
```css
:root {
    --cream: #FBF8F3;
    --accent: #C17856;
    /* ... modify other colors ... */
}
```

### Adding Fonts
Replace Google Fonts link in `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont..." rel="stylesheet">
```

### Modifying Reader Width
Change `.reader-content` max-width:
```css
.reader-content {
    max-width: 800px; /* Adjust as needed */
}
```

## Testing

Test with sample EPUB files:
- Project Gutenberg (free EPUBs): https://www.gutenberg.org/
- Standard Ebooks (high-quality): https://standardebooks.org/
- Feedbooks Public Domain: https://www.feedbooks.com/publicdomain

## Troubleshooting

### EPUB won't load
- Ensure file is a valid .epub (ZIP archive)
- Check browser console for errors (F12)
- Try a different EPUB file to rule out file corruption

### Images not displaying
- Some EPUBs use complex directory structures
- Check console for path resolution errors
- Verify images exist in EPUB manifest

### Navigation not working
- Some EPUBs may have non-standard navigation
- TOC generation falls back to spine order if nav fails
- Use arrow buttons for sequential navigation
- Internal links should work - check console for errors if they don't

### Links not working
- Links should be clickable with a pointer cursor
- Check browser console (F12) for navigation errors
- Some EPUBs use complex link structures that may need manual navigation
- External links (http/https) open normally, internal links navigate within the book

### Blank page after loading
- Check if EPUB content uses unusual tags
- Some DRM-protected EPUBs won't work
- Console errors may indicate parsing issues

## Future Enhancements

Potential features to add:
- [ ] Bookmarks and annotations
- [ ] Full-text search
- [ ] Reading statistics
- [ ] Export highlights
- [ ] Multiple book library
- [ ] Cloud sync
- [ ] Audio narration support
- [ ] Fixed-layout EPUB support
- [ ] Dictionary lookup

## License

This project is provided as-is for educational and personal use.

## Credits

- Built with Web Standards (HTML5, CSS3, ES6+)
- JSZip library for ZIP extraction
- Font: Cormorant Garamond (Google Fonts)
- Font: Manrope (Google Fonts)
- EPUB Specification: W3C EPUB 3.3

## Support

For issues or questions:
1. Check browser console for errors
2. Verify EPUB file is valid
3. Test with known-good EPUB files
4. Ensure using modern browser

---

**Papyrus** - *A modern reading experience for the digital age*
