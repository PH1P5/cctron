import { Menu, Tray } from "electron";
import * as path from "path";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

import {initMenuItems, isCCTronMenuItem} from "./tray-menu-initialization";

// TODO put all these icon constants into one place
const SUCCESS = "Success";
const FAILURE = "Failure";

export const UNKNOWN = "Unknown";
export const BUILDING = "Building";
export const LOCKED = "Locked";

export const STATUS_ICONS = {
    "Success": 'assets/ok-20.png',
    "Failure": 'assets/not-ok-20.png',
    "Building": 'assets/building-20.png',
    "Unknown": 'assets/unknown-20.png',
    "Locked": 'assets/locked-20.png'
}

interface CCTronMenuItem extends MenuItemConstructorOptions {
    status: string
}
export interface ConfigProps {
    url: string,
    authRequired: boolean
}

interface TrayProps {
    imagePath: string,
    title?: string
}

let tray: Tray = undefined

export const buildTray = () => {
    initMenuItems().then(menuItems => {
        const trayProps = calculateTrayIcon(menuItems.filter(isCCTronMenuItem));
        const contextMenu = Menu.buildFromTemplate(menuItems);

        if(!tray) {
            tray = new Tray(trayProps.imagePath);
        }

        tray.setTitle(trayProps.title);
        tray.setImage(trayProps.imagePath);
        tray.setContextMenu(contextMenu);
    });
}

const calculateTrayIcon = (menuEntries: CCTronMenuItem[]): TrayProps => {
    const status: Array<string> = menuEntries.map(entry => entry.status);

    if (status.includes(FAILURE)) {
        const numberOfFailed = status.filter(entry => entry == FAILURE).length
        return { imagePath: path.join(__dirname, STATUS_ICONS[FAILURE]), title: `${numberOfFailed}` };
    }

    if (status.includes(BUILDING)) {
        return { imagePath: path.join(__dirname, STATUS_ICONS[BUILDING]), title: '' };
    }

    if (status.includes(SUCCESS)) {
        return { imagePath: path.join(__dirname, STATUS_ICONS[SUCCESS]), title: '' };
    }

    return { imagePath: path.join(__dirname, STATUS_ICONS[UNKNOWN]), title: '' };
}
