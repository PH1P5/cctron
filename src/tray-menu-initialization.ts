import { app, shell, Notification, clipboard, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from 'fs';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

import { CCResponse, fetchStatus } from "./cc-client";
import { BUILDING, STATUS_ICONS } from "./tray-initialization";
import { setCredentials} from "./user-manager";

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

const loadConfigFile = async (): Promise<Buffer> => {
    const targetConfigFilePath = app.getPath('userData') + '/config.json';
    const defaultConfigFilePath = path.join(__dirname, 'config.json');

    try {
        return await fs.promises.readFile(targetConfigFilePath);
    } catch {
        console.log('No config file found, initialisation follows.');
    }

    await fs.promises.copyFile(defaultConfigFilePath, targetConfigFilePath);

    return await fs.promises.readFile(targetConfigFilePath);
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

function openEditWindow() {
    const window = new BrowserWindow({
        title: "config editor",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'ipc/preload.js'),
        },
    });
    window.loadFile('ipc/editor.html').then(() => {
        console.log("window opened");
    });
    window.webContents.once('dom-ready', () => {
        loadConfigFile().then((fileContent) => {
            const jsonString = fileContent.toString();
            window.webContents.send('inject-config', jsonString);
        });
    });

    window.on('close', event => {
        event.preventDefault();
        window.destroy();
    });
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
                const configFile = app.getPath('userData') + '/' + 'config.json';
                clipboard.writeText(configFile);

                openEditWindow();

                new Notification({
                    title: "Config Path",
                    body: "Copied config path to clipboard."
                }).show()
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
                app.quit()
            }
        }
    ]
}
