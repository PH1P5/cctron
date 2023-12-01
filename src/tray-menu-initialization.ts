import {app, BrowserWindow, clipboard, ipcMain, Notification, shell} from "electron";
import * as path from "path";

import {CCResponse, fetchStatus} from "./cc-client";
import {BUILDING, STATUS_ICONS} from "./tray-initialization";
import {setCredentials} from "./user-manager";
import {loadConfigFile, saveConfigFile} from "./config-io";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

interface CCTronMenuItem extends MenuItemConstructorOptions {
    status: string
}

export const isCCTronMenuItem = (menuItem: CCTronMenuItem): menuItem is CCTronMenuItem => {
    return !!menuItem;
};

interface ConfigEntry {
    url: string,
    authRequired: boolean
}

export const initMenuItems = async (): Promise<Array<CCTronMenuItem | MenuItemConstructorOptions>> => {
    const configFile = await loadConfigFile();
    const configEntries: ConfigEntry[] = JSON.parse(configFile.toString());
    const unresolvedResponses: Promise<CCResponse>[] = configEntries.map(configEntry => fetchStatus(configEntry));
    const responses: CCResponse[] = (await Promise.all(unresolvedResponses)).filter(res => res !== undefined);


    return [...toCCTronMenuItem(responses), ...staticMenuItems()];
}

const toCCTronMenuItem = (responses: CCResponse[]): Array<CCTronMenuItem> => {
    return responses.map(jsonResponse => {
            const currentStatus = jsonResponse.activity == BUILDING ? jsonResponse.activity : jsonResponse.lastStatus

            return ({
                // @ts-ignore
                icon: path.join(__dirname, STATUS_ICONS[currentStatus]),
                label: jsonResponse.name,
                type: 'normal',
                click: (menuItem, browserWindow, keyBoardEvent) => {
                    shell.openExternal(jsonResponse.url);
                },
                // @ts-ignore
                status: currentStatus
            });
        }
    );
}

const staticMenuItems = (): Array<MenuItemConstructorOptions> => {
    return [
        {
            label: '',
            type: 'separator'
        },
        {
            label: 'open config editor',
            toolTip: 'find config here: ' + app.getPath('userData'),
            type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                openEditorWindow();
            }
        },
        {
            label: 'get credentials from clipboard',
            toolTip: 'use format "username:password"',
            type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                const fromClipboard = clipboard.readText();
                setCredentials(fromClipboard)
                    .then(() => {
                        new Notification({
                            title: "Credentials stored",
                            body: "Credentials stored in the system keychain"
                        }).show()
                    });
            }
        },
        {
            label: '',
            type: 'separator'
        },
        {
            label: 'quit',
            type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                app.exit();
            }
        }
    ]
}

const openEditorWindow = () => {
    const window = new BrowserWindow({
        title: "config editor",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'ipc/preload.js'),
        },
        width: 1024,
    });
    ipcMain.removeHandler('save-config');
    ipcMain.handle('save-config', async (event, config) => {
        saveConfigFile(config)
            .then(() => {
                window.close();
                new Notification({ title: "Success", body: "The config.json has been updated." }).show()
            })
            .catch((reason) => {
                new Notification({ title: "Error", body: "...writing config file." }).show()
            });
    });

    window.loadFile('ipc/editor.html').then(() => {
        loadConfigFile().then((fileContent) => {
            const jsonString = fileContent.toString();
            window.webContents.send('inject-config', jsonString);
        });
    });

    window.on('close', (event: CustomEvent) => {
        event.preventDefault();
        window.hide();
    });
}
