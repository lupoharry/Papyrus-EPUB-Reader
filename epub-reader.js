// EPUB Reader - Main Application Logic
class EPUBReader {
    constructor() {
        this.currentBook = null;
        this.spine = [];
        this.currentSpineIndex = 0;
        this.manifest = {};
        this.metadata = {};
        this.toc = [];
        this.opfPath = '';
        this.rootPath = '';
        
        this.initializeUI();
        this.attachEventListeners();
    }

    initializeUI() {
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            openFileBtn: document.getElementById('openFile'),
            readerContent: document.getElementById('readerContent'),
            bookInfo: document.getElementById('bookInfo'),
            emptyState: document.getElementById('emptyState'),
            loading: document.getElementById('loading'),
            sidebar: document.getElementById('sidebar'),
            toggleSidebar: document.getElementById('toggleSidebar'),
            prevChapter: document.getElementById('prevChapter'),
            nextChapter: document.getElementById('nextChapter'),
            bottomPrevChapter: document.getElementById('bottomPrevChapter'),
            bottomNextChapter: document.getElementById('bottomNextChapter'),
            pageInfo: document.getElementById('pageInfo'),
            progressFill: document.getElementById('progressFill'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsPanel: document.getElementById('settingsPanel'),
            fontSizeSlider: document.getElementById('fontSizeSlider')
        };
    }

    attachEventListeners() {
        // File selection
        this.elements.openFileBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadEPUB(file);
            }
        });

        // Navigation
        this.elements.prevChapter.addEventListener('click', () => this.previousChapter());
        this.elements.nextChapter.addEventListener('click', () => this.nextChapter());
        this.elements.bottomPrevChapter.addEventListener('click', () => this.previousChapter());
        this.elements.bottomNextChapter.addEventListener('click', () => this.nextChapter());

        // Sidebar toggle
        this.elements.toggleSidebar.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('collapsed');
        });

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => {
            this.elements.settingsPanel.classList.toggle('active');
        });

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.settingsPanel.contains(e.target) && 
                !this.elements.settingsBtn.contains(e.target)) {
                this.elements.settingsPanel.classList.remove('active');
            }
        });

        // Font size
        this.elements.fontSizeSlider.addEventListener('input', (e) => {
            this.elements.readerContent.style.fontSize = e.target.value + 'px';
        });

        // Theme buttons
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyTheme(e.target.dataset.theme);
            });
        });

        // Line height buttons
        document.querySelectorAll('[data-line-height]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-line-height]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.elements.readerContent.style.lineHeight = e.target.dataset.lineHeight;
            });
        });

        // Keyboard navigation - improved with better key detection
        document.addEventListener('keydown', (e) => {
            // Only handle arrow keys if not typing in an input
            if (document.activeElement.tagName === 'INPUT') return;
            
            if (e.key === 'ArrowLeft' || e.code === 'ArrowLeft') {
                e.preventDefault();
                this.previousChapter();
            }
            if (e.key === 'ArrowRight' || e.code === 'ArrowRight') {
                e.preventDefault();
                this.nextChapter();
            }
        });

        // Drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.epub')) {
                this.loadEPUB(file);
            }
        });

        // Scroll detection for auto-advance
        this.elements.readerContent.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    handleScroll() {
        const container = this.elements.readerContent;
        const scrollPosition = container.scrollTop + container.clientHeight;
        const scrollHeight = container.scrollHeight;
        
        // If scrolled to bottom (within 10px threshold), advance to next chapter
        if (scrollHeight - scrollPosition < 10 && this.currentSpineIndex < this.spine.length - 1) {
            // Add a small delay to prevent accidental rapid scrolling
            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.nextChapter();
            }, 300);
        }
    }

    showLoading() {
        this.elements.loading.classList.add('active');
        this.elements.emptyState.style.display = 'none';
        this.elements.readerContent.innerHTML = '';
    }

    hideLoading() {
        this.elements.loading.classList.remove('active');
    }

    async loadEPUB(file) {
        this.showLoading();

        try {
            const zip = await JSZip.loadAsync(file);
            this.currentBook = zip;

            // Find and parse container.xml to get OPF location
            const containerXML = await zip.file('META-INF/container.xml').async('text');
            const containerDoc = new DOMParser().parseFromString(containerXML, 'text/xml');
            const opfPath = containerDoc.querySelector('rootfile').getAttribute('full-path');
            
            this.opfPath = opfPath;
            this.rootPath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

            // Parse OPF file
            const opfContent = await zip.file(opfPath).async('text');
            await this.parseOPF(opfContent);

            // Load first chapter
            await this.loadChapter(0);

            this.hideLoading();
            this.updateNavButtons();
        } catch (error) {
            console.error('Error loading EPUB:', error);
            alert('Error loading EPUB file. Please ensure it is a valid EPUB format.');
            this.hideLoading();
            this.elements.emptyState.style.display = 'flex';
        }
    }

    async parseOPF(opfContent) {
        const parser = new DOMParser();
        const opfDoc = parser.parseFromString(opfContent, 'text/xml');

        // Parse metadata
        const metadata = opfDoc.querySelector('metadata');
        this.metadata = {
            title: this.getMetadataValue(metadata, 'dc\\:title, title'),
            creator: this.getMetadataValue(metadata, 'dc\\:creator, creator'),
            publisher: this.getMetadataValue(metadata, 'dc\\:publisher, publisher'),
            language: this.getMetadataValue(metadata, 'dc\\:language, language'),
            description: this.getMetadataValue(metadata, 'dc\\:description, description')
        };

        // Parse manifest
        const manifestItems = opfDoc.querySelectorAll('manifest > item');
        manifestItems.forEach(item => {
            const id = item.getAttribute('id');
            const href = item.getAttribute('href');
            const mediaType = item.getAttribute('media-type');
            this.manifest[id] = {
                href: this.rootPath + href,
                mediaType: mediaType,
                rawHref: href  // Store original href for reference
            };
        });

        // Parse spine (reading order)
        const spineItems = opfDoc.querySelectorAll('spine > itemref');
        this.spine = Array.from(spineItems).map(item => {
            const idref = item.getAttribute('idref');
            return this.manifest[idref];
        });

        // Try to parse navigation document (EPUB 3) or NCX (EPUB 2)
        await this.parseNavigation(opfDoc);

        // Update UI with book info
        this.updateBookInfo();
    }

    getMetadataValue(metadata, selector) {
        const element = metadata.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    async parseNavigation(opfDoc) {
        // Try EPUB 3 navigation document first
        const navItem = opfDoc.querySelector('manifest > item[properties*="nav"]');
        
        if (navItem) {
            const navHref = this.rootPath + navItem.getAttribute('href');
            try {
                const navContent = await this.currentBook.file(navHref).async('text');
                const navDoc = new DOMParser().parseFromString(navContent, 'text/html');
                const tocNav = navDoc.querySelector('nav[*|type="toc"], nav#toc');
                
                if (tocNav) {
                    this.toc = this.parseTocFromNav(tocNav);
                    return;
                }
            } catch (e) {
                console.warn('Could not parse EPUB 3 navigation:', e);
            }
        }

        // Fallback to NCX (EPUB 2)
        const ncxItem = opfDoc.querySelector('manifest > item[media-type="application/x-dtbncx+xml"]');
        if (ncxItem) {
            const ncxHref = this.rootPath + ncxItem.getAttribute('href');
            try {
                const ncxContent = await this.currentBook.file(ncxHref).async('text');
                const ncxDoc = new DOMParser().parseFromString(ncxContent, 'text/xml');
                this.toc = this.parseTocFromNCX(ncxDoc);
            } catch (e) {
                console.warn('Could not parse NCX:', e);
            }
        }
    }

    parseTocFromNav(navElement) {
        const toc = [];
        const items = navElement.querySelectorAll('ol > li, ul > li');
        
        items.forEach((item, index) => {
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                const label = link.textContent.trim();
                
                // Find corresponding spine index
                const contentFile = href.split('#')[0];
                const spineIndex = this.spine.findIndex(s => s.href.endsWith(contentFile));
                
                toc.push({
                    label: label,
                    href: href,
                    spineIndex: spineIndex >= 0 ? spineIndex : index
                });
            }
        });
        
        return toc;
    }

    parseTocFromNCX(ncxDoc) {
        const toc = [];
        const navPoints = ncxDoc.querySelectorAll('navPoint');
        
        navPoints.forEach((navPoint, index) => {
            const label = navPoint.querySelector('navLabel > text');
            const content = navPoint.querySelector('content');
            
            if (label && content) {
                const href = content.getAttribute('src');
                const contentFile = href.split('#')[0];
                const spineIndex = this.spine.findIndex(s => s.href.endsWith(contentFile));
                
                toc.push({
                    label: label.textContent.trim(),
                    href: href,
                    spineIndex: spineIndex >= 0 ? spineIndex : index
                });
            }
        });
        
        return toc;
    }

    updateBookInfo() {
        let html = '';

        // Try to find and display cover image
        const coverItem = Object.values(this.manifest).find(item => 
            item.mediaType && item.mediaType.startsWith('image/') && 
            (item.href.toLowerCase().includes('cover') || item.href.toLowerCase().includes('thumbnail'))
        );

        if (coverItem) {
            html += `<img class="cover-image" id="coverImage" alt="Book cover">`;
        }

        html += `
            <div class="book-title">${this.metadata.title || 'Unknown Title'}</div>
            <div class="book-author">${this.metadata.creator || 'Unknown Author'}</div>
        `;

        if (this.toc.length > 0) {
            html += `
                <div class="toc-section">
                    <div class="toc-title">Table of Contents</div>
                    <ul class="toc-list">
                        ${this.toc.map((item, index) => `
                            <li class="toc-item" data-index="${item.spineIndex}">
                                ${item.label}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        this.elements.bookInfo.innerHTML = html;

        // Load cover image if found
        if (coverItem) {
            this.loadCoverImage(coverItem.href);
        }

        // Attach TOC click handlers
        document.querySelectorAll('.toc-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.loadChapter(index);
            });
        });
    }

    async loadCoverImage(href) {
        try {
            const coverData = await this.currentBook.file(href).async('base64');
            const ext = href.split('.').pop().toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : 
                           ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                           ext === 'gif' ? 'image/gif' : 
                           ext === 'webp' ? 'image/webp' : 'image/jpeg';
            
            const coverImg = document.getElementById('coverImage');
            if (coverImg) {
                coverImg.src = `data:${mimeType};base64,${coverData}`;
            }
        } catch (e) {
            console.warn('Could not load cover image:', e);
        }
    }

    async loadChapter(index) {
        if (index < 0 || index >= this.spine.length) return;

        this.currentSpineIndex = index;
        const chapter = this.spine[index];

        try {
            const content = await this.currentBook.file(chapter.href).async('text');
            await this.renderContent(content, chapter.href);
            this.updateNavButtons();
            this.updateProgress();
            this.updateActiveTocItem();
            
            // Scroll to top
            this.elements.readerContent.scrollTop = 0;
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.elements.readerContent.innerHTML = '<p>Error loading chapter content.</p>';
        }
    }

    async renderContent(htmlContent, baseHref) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.querySelector('body');

        if (body) {
            // Process images
            const images = body.querySelectorAll('img');
            for (const img of images) {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    try {
                        // Resolve relative path
                        const imgPath = this.resolveHref(src, baseHref);
                        const imgData = await this.currentBook.file(imgPath).async('base64');
                        const ext = src.split('.').pop().toLowerCase();
                        const mimeType = ext === 'png' ? 'image/png' : 
                                       ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                                       ext === 'gif' ? 'image/gif' : 
                                       ext === 'svg' ? 'image/svg+xml' :
                                       ext === 'webp' ? 'image/webp' : 'image/jpeg';
                        
                        img.src = `data:${mimeType};base64,${imgData}`;
                    } catch (e) {
                        console.warn('Could not load image:', src, e);
                    }
                }
            }

            // Set the content
            this.elements.readerContent.innerHTML = body.innerHTML;
            
            // Process internal links AFTER content is set
            const links = this.elements.readerContent.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleInternalLink(href);
                    });
                    // Add visual indicator for internal links
                    link.style.cursor = 'pointer';
                }
            });
        } else {
            this.elements.readerContent.innerHTML = htmlContent;
        }
    }

    resolveHref(href, baseHref) {
        // Remove any fragment identifier for path resolution
        const cleanHref = href.split('#')[0];
        if (!cleanHref) return baseHref; // Just an anchor in current file
        
        // Handle absolute paths
        if (cleanHref.startsWith('/')) {
            return cleanHref.substring(1);
        }
        
        // Get base directory
        const baseParts = baseHref.split('/');
        baseParts.pop(); // Remove filename
        
        // Process relative path
        const hrefParts = cleanHref.split('/');
        
        for (const part of hrefParts) {
            if (part === '..') {
                baseParts.pop();
            } else if (part !== '.' && part !== '') {
                baseParts.push(part);
            }
        }
        
        return baseParts.join('/');
    }

    handleInternalLink(href) {
        console.log('Navigating to:', href);
        
        const [file, anchor] = href.split('#');
        
        if (file) {
            // Navigate to different file
            const currentHref = this.spine[this.currentSpineIndex].href;
            const targetPath = this.resolveHref(file, currentHref);
            
            console.log('Current href:', currentHref);
            console.log('Target path:', targetPath);
            
            // Try exact match first
            let spineIndex = this.spine.findIndex(s => s.href === targetPath);
            
            // If not found, try matching by filename only
            if (spineIndex < 0) {
                const targetFilename = targetPath.split('/').pop();
                spineIndex = this.spine.findIndex(s => {
                    const spineFilename = s.href.split('/').pop();
                    return spineFilename === targetFilename;
                });
            }
            
            console.log('Found spine index:', spineIndex);
            
            if (spineIndex >= 0) {
                this.loadChapter(spineIndex).then(() => {
                    if (anchor) {
                        setTimeout(() => {
                            const element = document.getElementById(anchor);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                console.warn('Anchor not found:', anchor);
                            }
                        }, 100);
                    }
                });
            } else {
                console.warn('Target file not found in spine:', targetPath);
                // Try to load it anyway if it exists in manifest
                const manifestItem = Object.values(this.manifest).find(m => 
                    m.href === targetPath || m.href.endsWith(file)
                );
                
                if (manifestItem) {
                    console.log('Found in manifest, attempting direct load:', manifestItem.href);
                    this.currentBook.file(manifestItem.href).async('text').then(content => {
                        this.renderContent(content, manifestItem.href);
                    });
                }
            }
        } else if (anchor) {
            // Same file, just scroll to anchor
            setTimeout(() => {
                const element = document.getElementById(anchor);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn('Anchor not found:', anchor);
                }
            }, 50);
        }
    }

    previousChapter() {
        if (this.currentSpineIndex > 0) {
            this.loadChapter(this.currentSpineIndex - 1);
        }
    }

    nextChapter() {
        if (this.currentSpineIndex < this.spine.length - 1) {
            this.loadChapter(this.currentSpineIndex + 1);
        }
    }

    updateNavButtons() {
        this.elements.prevChapter.disabled = this.currentSpineIndex === 0;
        this.elements.nextChapter.disabled = this.currentSpineIndex === this.spine.length - 1;
        this.elements.bottomPrevChapter.disabled = this.currentSpineIndex === 0;
        this.elements.bottomNextChapter.disabled = this.currentSpineIndex === this.spine.length - 1;
    }

    updateProgress() {
        const progress = ((this.currentSpineIndex + 1) / this.spine.length) * 100;
        this.elements.progressFill.style.width = progress + '%';
        this.elements.pageInfo.textContent = `${this.currentSpineIndex + 1} / ${this.spine.length}`;
    }

    updateActiveTocItem() {
        document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.index) === this.currentSpineIndex) {
                item.classList.add('active');
            }
        });
    }

    applyTheme(theme) {
        const reader = this.elements.readerContent;
        const container = document.querySelector('.reader-container');
        
        switch(theme) {
            case 'light':
                container.style.background = 'white';
                reader.style.color = '#2C2C2C';
                break;
            case 'sepia':
                container.style.background = '#F4ECD8';
                reader.style.color = '#5C4A2F';
                break;
            case 'dark':
                container.style.background = '#1a1a1a';
                reader.style.color = '#E8E3DC';
                break;
        }
    }
}

// Initialize the reader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.epubReader = new EPUBReader();
});
