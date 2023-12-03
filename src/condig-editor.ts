import {BrowserWindow, ipcMain, Notification} from "electron";
import * as path from "path";
import {loadConfigFile, saveConfigFile} from "./config-io";

export const openEditorWindow = () => {
    const window = initializeEditorWindow();
    initializeRendererEventListener(window);
    avoidQuitOnCloseEvent(window);
}

const initializeEditorWindow = (): BrowserWindow  => {
    const window = new BrowserWindow({
        title: "config editor",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'ipc/preload.js'),
        },
        width: 1024,
    });

    window.loadFile('ipc/editor.html').then(() => {
        loadConfigFile().then((fileContent) => {
            const jsonString = fileContent.toString();
            window.webContents.send('inject-config', jsonString);
        });
    });

    return window;
}

const initializeRendererEventListener = (window: Electron.CrossProcessExports.BrowserWindow) =>{
    ipcMain.removeHandler('save-config');
    ipcMain.handle('save-config', async (event, config) => {
        saveConfigFile(config)
            .then(() => {
                window.close();
                new Notification({title: "Success", body: "The config.json has been updated."}).show()
            })
            .catch((reason) => {
                new Notification({title: "Error", body: "...writing config file."}).show()
            });
    });
}

const avoidQuitOnCloseEvent = (window: BrowserWindow) => {
    window.on('close', (event: CustomEvent) => {
        event.preventDefault();
        window.hide();
    });
}
