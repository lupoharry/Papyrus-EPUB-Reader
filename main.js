const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#FBF8F3',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        title: 'Papyrus - EPUB Reader',
        autoHideMenuBar: true
    });

    mainWindow.loadFile('epub-reader.html');

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open EPUB...',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'EPUB Files', extensions: ['epub'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });

                        if (!result.canceled && result.filePaths.length > 0) {
                            // Send file path to renderer
                            mainWindow.webContents.send('open-file', result.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'Alt+F4',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Sidebar',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        mainWindow.webContents.send('toggle-sidebar');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+Plus',
                    role: 'zoomIn'
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomOut'
                },
                {
                    label: 'Reset Zoom',
                    accelerator: 'CmdOrCtrl+0',
                    role: 'resetZoom'
                },
                { type: 'separator' },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'F12',
                    click: () => mainWindow.webContents.toggleDevTools()
                }
            ]
        },
        {
            label: 'Navigation',
            submenu: [
                {
                    label: 'Previous Chapter',
                    accelerator: 'Left',
                    click: () => {
                        mainWindow.webContents.send('nav-prev');
                    }
                },
                {
                    label: 'Next Chapter',
                    accelerator: 'Right',
                    click: () => {
                        mainWindow.webContents.send('nav-next');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Papyrus',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Papyrus',
                            message: 'Papyrus EPUB Reader',
                            detail: 'Version 1.0.0\n\nA modern EPUB reader for Windows 11.\n\nSupports EPUB 2 and EPUB 3 formats.'
                        });
                    }
                },
                {
                    label: 'Documentation',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://www.w3.org/publishing/epub3/');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
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

// Handle file associations (when user double-clicks .epub file)
app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (mainWindow) {
        mainWindow.webContents.send('open-file', filePath);
    }
});
