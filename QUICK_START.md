# Papyrus EPUB Reader - Quick Start Guide

## Option 1: Use in Browser (Fastest - No Installation!)

Perfect if you just want to read EPUBs right away:

1. **Double-click** `epub-reader.html`
2. Your browser will open the app
3. Click **"Open EPUB"** or drag an .epub file into the window
4. Start reading! ✨

**That's it!** No installation needed.

---

## Option 2: Install as Windows App

Want a dedicated app with desktop integration? Follow these steps:

### Prerequisites
- Install [Node.js](https://nodejs.org/) (download the LTS version)

### Installation Steps

1. **Open Command Prompt or PowerShell** in the folder containing these files
   - Right-click in the folder → "Open in Terminal"

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *This downloads Electron (~150MB, one-time only)*

3. **Run the app:**
   ```bash
   npm start
   ```

4. **Build installer (optional):**
   ```bash
   npm run build
   ```
   *Creates installer in `dist/` folder*

### After Building
- Find the installer in the `dist` folder
- Run `Papyrus EPUB Reader-1.0.0-Setup.exe`
- .epub files will be associated with Papyrus
- Double-click any .epub file to open it!

---

## Features at a Glance

### Reading Controls
- **← → Arrow keys** - Navigate chapters (keyboard shortcuts!)
- **Top toolbar buttons** - Previous/Next in the header
- **Bottom buttons** - Previous/Next centered at page bottom (easily accessible)
- **Click TOC items** - Jump to any chapter in the sidebar
- **Scroll** - Read through chapters, auto-advance when reaching bottom
- **Click links** - Navigate to footnotes, references, other chapters
- **Drag & Drop** - Load EPUB files from your computer

### Customization
- **Font Size** - Adjust with slider in settings
- **Themes** - Light, Sepia, or Dark mode
- **Line Height** - Tight, Normal, or Loose
- **Sidebar** - Toggle with menu button

### What Works
✅ EPUB 2 and EPUB 3 files
✅ Images (JPG, PNG, GIF, SVG, WebP)
✅ Table of Contents
✅ Footnotes and links
✅ Book metadata
✅ Cover images

### What Doesn't Work (Yet)
❌ DRM-protected EPUBs
❌ Audio/Video content
❌ Fixed-layout EPUBs
❌ MathML equations

---

## Finding Free EPUB Books

Try these sources:
- **Project Gutenberg** - https://www.gutenberg.org/
- **Standard Ebooks** - https://standardebooks.org/
- **Feedbooks Public Domain** - https://www.feedbooks.com/publicdomain
- **Internet Archive** - https://archive.org/

---

## Troubleshooting

**EPUB won't load?**
- Make sure it's a valid .epub file
- Try a different book to test
- Check browser console (F12) for errors

**Images not showing?**
- Some EPUBs have complex structures
- Try opening in another EPUB reader to verify
- Check if original EPUB has the images

**Can't navigate?**
- Use arrow keys if TOC doesn't work
- Some EPUBs lack proper navigation
- Sequential navigation should always work

**Running slowly?**
- Close other browser tabs
- Large books may take time to load
- Images increase loading time

---

## Tips for Best Experience

1. **Use keyboard shortcuts** - Arrow keys are the fastest way to navigate
2. **Use bottom buttons** - Easy to reach while reading, especially on tablets
3. **Maximize window** - Optimal reading width and shows both navigation options
4. **Scrollbars are visible** - Both sidebar TOC and main content have visible scrollbars
5. **Auto-advance** - Scroll to bottom to automatically go to next chapter
6. **Adjust font size** - Find your comfort level in settings
7. **Try different themes** - Especially useful in different lighting conditions
8. **Click internal links** - They work! Navigate to footnotes and cross-references

---

## Getting Help

**File Issues:**
- Check README.md for detailed documentation
- Verify EPUB file is not corrupted
- Test with known-good EPUB files

**Build Issues:**
- Ensure Node.js is installed correctly
- Try `npm install` again
- Check internet connection for downloads

**Performance:**
- Close other applications
- Restart browser or app
- Try smaller EPUB files first

---

## Next Steps

After you've tried the reader:
- Customize colors in the CSS
- Add your own fonts
- Contribute features you'd like
- Share with others!

---

**Enjoy reading with Papyrus!** 📚✨
