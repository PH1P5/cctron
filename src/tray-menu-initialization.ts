import {app, clipboard, Notification, shell} from "electron";
import * as path from "path";

import {CCResponse, fetchStatus} from "./cc-client";
import {BUILDING, STATUS_ICONS} from "./tray-initialization";
import {setCredentials} from "./user-manager";
import {loadConfigFile} from "./config-io";
import {openEditorWindow} from "./condig-editor";
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
            label: 'retrieve credentials from clipboard',
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

