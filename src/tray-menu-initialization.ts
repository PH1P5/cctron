import { app, shell, Notification, clipboard } from "electron";
import * as path from "path";
import * as fs from 'fs';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

import { CCResponse, fetchStatus } from "./cc-client";
import {BUILDING, STATUS_ICONS} from "./tray-initialization";

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

const staticMenuItems = (): Array<MenuItemConstructorOptions> => {
    return [
        {
            label: '',
            type: 'separator'
        },
        {
            label: 'Get Config Path',
            toolTip: 'Find config here: ' + app.getPath('userData'),
            type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                clipboard.writeText(app.getPath('userData')+'/' + 'config.json')
                new Notification({
                    title: "Config Path",
                    body: "Copied config path to clipboard."
                }).show()
            }
        },
        {
            label: '',
            type: 'separator'
        },
        {
            label: 'Quit',
            type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                app.quit()
            }
        }
    ]
}
