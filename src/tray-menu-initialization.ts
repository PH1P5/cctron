import { app, shell } from "electron";
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
    const configEntries: ConfigEntry[] = JSON.parse(fs.readFileSync('config.json').toString());
    const unresolvedResponses: Promise<CCResponse>[] = configEntries.map(configEntry => fetchStatus(configEntry));
    const responses: CCResponse[] = (await Promise.all(unresolvedResponses)).filter(res => res !== undefined);

    return [...toCCTronMenuItem(responses), ...nonDynamicMenuItems()];
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

const nonDynamicMenuItems = (): Array<MenuItemConstructorOptions> => {
    return [
        {
            label: '',
            type: 'separator'
        },
        {
            label: 'Quit', type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                app.quit()
            }
        }
    ]
}
