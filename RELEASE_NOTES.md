# Papyrus EPUB Reader - Version 1.2.1 Release Notes 

## 🎉 What's New

### Playwright Testing Added
- Added an end-to-end test suite using Playwright.
- Added automated test artifact preparation using the EPUB file:
  - https://github.com/IDPF/epub3-samples/releases/download/20230704/accessible_epub_3.epub
- Added a lightweight local static server used during test execution.
- Added npm scripts for test setup and execution.

### Test Folder Structure
```
tests/
├── e2e/
│   └── epub-reader.spec.js
├── fixtures/
│   └── .gitkeep
└── scripts/
    ├── download-test-epub.js
    └── static-server.js
```

### Test Automation Configuration
- Playwright configuration file:
  - playwright.config.js
- New npm scripts:
  - npm run test:prepare -> downloads the test EPUB artifact if missing
  - npm test -> runs artifact preparation, then executes Playwright tests
  - npm run test:headed -> runs tests in headed browser mode

### Test Cases Added
1. Default Reader Shell Render
   - Confirms Papyrus logo is visible.
   - Confirms empty state is visible before loading a book.
   - Confirms reader content starts empty.
   - Confirms chapter navigation buttons are disabled initially.

2. EPUB Load and Chapter Navigation
   - Uploads the accessible_epub_3.epub fixture via file input.
   - Confirms loading indicator completes.
   - Confirms empty state is hidden after successful load.
   - Confirms chapter/page indicator format is valid (1 / N).
   - Confirms chapter HTML content is rendered.
   - Confirms next/previous chapter navigation updates page indicator.
   - Confirms at least one Table of Contents item is visible.

### Notes
- The test EPUB binary is downloaded on demand into tests/fixtures and intentionally not tracked in git.
- Test output folders are excluded from version control using .gitignore (playwright-report and test-results).
- In Linux dev containers, first-time setup may require:
  - npx playwright install --with-deps chromium

---

# Papyrus EPUB Reader - Version 1.2.0 Release Notes

## 🎉 What's New

### ✨ Major UI/UX Improvements

#### 1. **Visible Scrollbars**
- **Sidebar TOC Scrollbar**: Now clearly visible with sepia color that changes to accent on hover
  - 8px wide
  - Smooth rounded corners
  - Works when table of contents exceeds window height
  - Light background track for contrast

- **Main Content Scrollbar**: Prominent and easy to see
  - 10px wide
  - Sepia with accent hover state
  - Visible scroll track background
  - Better visual feedback

#### 2. **Bottom Navigation Buttons**
Centered at the bottom of the reading area with a gradient overlay effect:

```
┌─────────────────────────────────────┐
│                                     │
│         [Page Content Area]         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Previous Button]  [Next Button]   │
│                                     │
└─────────────────────────────────────┘
```

- **Previous Button** - Navigate to previous chapter (with ← icon)
- **Next Button** - Navigate to next chapter (with → icon)
- Buttons are automatically disabled when not applicable:
  - Previous disabled when at start of book
  - Next disabled when at end of book
- Gradient overlay smoothly blends with content
- Responsive sizing on mobile devices

#### 3. **Keyboard Navigation**
Improved arrow key handling:
- **← Left Arrow** - Go to previous chapter
- **→ Right Arrow** - Go to next chapter
- Works from anywhere in the app
- Disabled when typing in input fields
- Better key detection with both `key` and `code` properties

### 🎨 Visual Improvements

#### Scrollbar Styling
```css
/* Sidebar */
- Width: 8px
- Color: Sepia (#8B7355)
- Hover: Accent (#C17856)
- Track: Light sepia background
- Border radius: 4px

/* Main Content */
- Width: 10px
- Color: Sepia (#8B7355)
- Hover: Accent (#C17856)
- Track: Light gray (#E8E3DC)
- Border radius: 5px
- Border: 2px solid track color
```

#### Button Styling
```css
- Height: 140px gradient overlay (70% white, 30% transparent)
- Gap between buttons: 24px
- Minimum width per button: 140px
- Disabled state: 40% opacity, no transform
- Background: Uses existing btn and btn-secondary classes
```

### 📱 Responsive Design

**Desktop (1024px+)**
- Bottom nav height: 140px
- Button gap: 24px
- Full-size buttons with icons and text

**Tablet (641px - 1024px)**
- Bottom nav height: 140px
- Better touch targets
- Readable labels

**Mobile (< 640px)**
- Bottom nav height: 120px
- Button gap: 16px
- Minimum width: 120px
- Smaller font size: 12px
- Content padding adjusted: 140px bottom padding

### 🔧 Technical Implementation

#### HTML Changes
- Added `bottomPrevChapter` button element
- Added `bottomNextChapter` button element
- Added `.bottom-nav` container with gradient overlay
- Buttons are positioned absolutely within reader-container

#### JavaScript Changes
- Added UI element references for bottom buttons
- Connected event listeners to both top and bottom buttons
- Improved keyboard event handling
- Updated `updateNavButtons()` to sync all button states
- Better key detection with preventDefault()

#### CSS Changes
- New `.bottom-nav` class with gradient overlay positioning
- Enhanced scrollbar styling for both WebKit and Firefox
- Improved button styling in bottom nav
- Responsive adjustments for different screen sizes
- Gradient overlay uses pointer-events to allow interaction

## 🚀 User Experience Enhancements

### Reading Flow
1. **Keyboard users**: Arrow keys provide instant navigation
2. **Mouse users**: Top toolbar or bottom buttons provide navigation
3. **Touch users**: Bottom buttons are easy to reach without scrolling up
4. **Power users**: Can use any navigation method interchangeably

### Accessibility
- Buttons properly labeled with text and icons
- Keyboard shortcuts prevent input field conflicts
- Visual feedback with hover states
- Scrollbars indicate content overflow
- Disabled state clearly indicates unavailable actions

### Visual Hierarchy
1. **Content** - Primary focus of the interface
2. **Navigation** - Two options (top toolbar and bottom buttons)
3. **Settings** - Accessible from top right
4. **Scrollbars** - Passive indicators of scrollable content

## 📊 Feature Comparison

| Feature | v1.0 | v1.1 | v1.2 |
|---------|------|------|------|
| EPUB Support | ✅ | ✅ | ✅ |
| Table of Contents | ✅ | ✅ | ✅ |
| Internal Links | ❌ | ✅ | ✅ |
| Auto-advance | ❌ | ✅ | ✅ |
| Visible TOC Scroll | ❌ | ❌ | ✅ |
| Visible Content Scroll | ❌ | ❌ | ✅ |
| Bottom Buttons | ❌ | ❌ | ✅ |
| Keyboard Navigation | ⚠️ | ✅ | ✅ |
| Multiple Themes | ✅ | ✅ | ✅ |

## 🧪 Testing Done

- [x] TOC scrolls when exceeding window height
- [x] Scrollbars visible in both areas
- [x] Scrollbars work on WebKit (Chrome, Edge, Safari)
- [x] Scrollbars work on Firefox
- [x] Bottom buttons centered and positioned correctly
- [x] Bottom buttons properly styled with gradient
- [x] Previous button disabled at start
- [x] Next button disabled at end
- [x] Left arrow key navigates to previous chapter
- [x] Right arrow key navigates to next chapter
- [x] Keyboard shortcuts work everywhere except input fields
- [x] Responsive layout on mobile
- [x] No scroll blocking
- [x] Internal links still functional
- [x] All navigation methods work together

## 💻 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 Upgrade Path

No breaking changes - fully backward compatible!

**From v1.1 to v1.2:**
1. Replace `epub-reader.html`
2. Replace `epub-reader.js`
3. Refresh browser (Ctrl+F5 or Cmd+Shift+R)
4. All existing features work as before, with new features automatically available

## 🎯 Next Steps

Potential future improvements:
- [ ] Gesture controls (swipe for next/prev on touch devices)
- [ ] Bookmarks and annotations
- [ ] Reading position memory
- [ ] Full-text search
- [ ] Text-to-speech
- [ ] Reading statistics and time tracking
- [ ] Customizable hotkeys
- [ ] Light sensor support for auto-theme switching

## 📝 Summary

Version 1.2.0 significantly improves the user experience by:
- Making navigation more discoverable (bottom buttons + keyboard shortcuts)
- Improving content visibility (visible scrollbars)
- Providing multiple navigation methods for different use cases
- Maintaining full backward compatibility with previous versions
- Improving responsiveness and touch-friendliness

The reader now provides an intuitive, feature-rich experience while maintaining the beautiful, minimalist design aesthetic.
