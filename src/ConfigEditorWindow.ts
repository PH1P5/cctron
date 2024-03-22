import {BrowserWindow, ipcMain, Notification, dialog} from "electron";
import * as path from "path";
import {ConfigFileManager} from "./ConfigFileManager";

export class ConfigEditorWindow {

    configFileManager: ConfigFileManager;

    constructor() {
        this.configFileManager = new ConfigFileManager();
    }

    open = () => {
        const window = this.initializeEditorWindow();
        this.initializeRendererEventListener(window);
        this.avoidQuitOnCloseEvent(window);
    }

    private initializeEditorWindow = (): BrowserWindow  => {
        const window = new BrowserWindow({
            title: "config editor",
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'ipc/preload.js'),
            },
            width: 1024,
        });

        window.loadFile(path.join(__dirname, 'ipc/editor.html')).then(() => {
            this.configFileManager.loadFile().then((fileContent) => {
                const jsonString = fileContent.toString();
                window.webContents.send('inject-config', jsonString);
            });
        });

        return window;
    }

    private initializeRendererEventListener = (window: Electron.CrossProcessExports.BrowserWindow) =>{
        ipcMain.removeHandler('save-config');
        ipcMain.handle('save-config', async (event, config) => {
            if(!this.isValidConfigString(config)) {
                dialog.showErrorBox('Error!', "The configuration is not a valid JSON!");
                return
            }
            this.configFileManager.saveFile(config)
                .then(() => {
                    window.close();
                    new Notification({title: "Success", body: "Saved config.json will be used..."}).show()
                })
                .catch((reason) => {
                    dialog.showErrorBox('Error', "Cannot write config file!");
                });
        });
    }

    private isValidConfigString = (configString: string) => {
        try{
            const json = JSON.parse(configString);
            return Array.isArray(json) && json[0].url;
        }catch (e){
            return false;
        }
    }

    private avoidQuitOnCloseEvent = (window: BrowserWindow) => {
        window.on('close', (event: CustomEvent) => {
            event.preventDefault();
            window.hide();
        });
    }
}

