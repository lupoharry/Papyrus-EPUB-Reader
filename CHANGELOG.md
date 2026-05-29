# Changelog

## Version 1.2.0 - UI/UX Improvements (Current)

### ✅ Fixed
- **Table of Contents scrollbar**: Now visible and properly styled with hover effects
- **Page content scrollbar**: Now visible with better styling and hover effects
- **Keyboard navigation**: Arrow keys properly detect key presses (supports both `key` and `code` properties)
- **Input field handling**: Keyboard shortcuts don't trigger when typing in input fields

### ✨ New Features
- **Bottom navigation buttons**: Two prominent buttons centered at the bottom of the page
  - Previous button on left with arrow icon
  - Next button on right with arrow icon
  - Automatically disabled at start/end of book
  - Styled with gradient overlay for smooth appearance
- **Enhanced visual feedback**: Scrollbars show on both sidebar and content areas
- **Improved responsiveness**: Better layout on mobile and tablet devices

### 🎨 UI/UX Improvements
- **Visible scrollbars**: 
  - Sidebar TOC: 8px wide, sepia color with accent hover
  - Main content: 10px wide, thicker for better visibility
  - Firefox support with `scrollbar-width` property
  - Hover effects for interactive feedback
- **Bottom button styling**:
  - Uses gradient overlay to blend with content
  - Buttons are disabled when not applicable (at book start/end)
  - Visible pointer indicator
  - Responsive sizing for mobile
- **Better padding**: Added extra bottom padding to prevent content from being hidden under buttons

### 📱 Responsive Design
- Mobile: Buttons and scrollbars scale appropriately
- Tablet: Better spacing and touch targets
- Desktop: Full-featured experience with visible controls

### 🔧 Technical Details
- Added `bottomPrevChapter` and `bottomNextChapter` to UI elements
- Event listeners for both top toolbar and bottom buttons
- Updated `updateNavButtons()` to sync disabled state for all buttons
- Improved keyboard event handling with `e.preventDefault()`
- Better CSS scrollbar styling with fallbacks

---

## Version 1.1.0 - Refactored Navigation

### Features
- Internal links navigation
- Auto-advance on scroll
- Path resolution improvements
- Better error handling

---

## Version 1.0.0 - Initial Release

### Features
- EPUB 2 and EPUB 3 support
- Beautiful reading interface
- Table of contents
- Image rendering
- Multiple themes
- Customizable typography
- Keyboard navigation
- Drag & drop file loading
- Progress tracking
- Cover image display
- Metadata extraction

---

## How to Use the New Features

### Bottom Navigation Buttons
- Located at the bottom center of the reading area
- Click **Previous** to go to the previous chapter
- Click **Next** to go to the next chapter
- Buttons automatically disable at the start and end of the book

### Keyboard Shortcuts
- **Left Arrow** → Previous chapter
- **Right Arrow** → Next chapter
- Works anywhere except when typing in input fields

### Scrollbars
- **Left sidebar**: Scroll through the table of contents
- **Main content**: Scroll through the current chapter
- Both have visible scrollbars with hover effects
- Both use sepia/accent colors to match the theme

---

## Testing Checklist

- [x] TOC scrolls when content exceeds height
- [x] Main page content scrolls smoothly
- [x] Bottom buttons appear centered
- [x] Bottom buttons are disabled appropriately
- [x] Left arrow key navigates to previous chapter
- [x] Right arrow key navigates to next chapter
- [x] Scrollbars are visible on both areas
- [x] Responsive layout on mobile devices
- [x] No scroll blocking issues
- [x] Internal links still work
