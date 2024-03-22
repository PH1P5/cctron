import {app, clipboard, Notification, shell} from "electron";
import * as path from "path";

import {CCResponse, CCTrayApiClient } from "./CCTrayApiClient";
import {BUILDING, STATUS_ICONS} from "./CCTronTray";
import {ConfigFileManager} from "./ConfigFileManager";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import {UserCredentialsRepository} from "./UserCredentialsRepository";
import {ConfigEditorWindow} from "./ConfigEditorWindow";

interface CCTronMenuItem extends MenuItemConstructorOptions {
    status: string
}

interface ConfigEntry {
    url: string,
    authRequired: boolean
}

export class CCTronTrayMenu {

    ccTrayApiClient: CCTrayApiClient;
    userCredentialsRepository: UserCredentialsRepository;
    configFileManager: ConfigFileManager;
    configEditorWindow: ConfigEditorWindow;

    constructor() {
        this.userCredentialsRepository = new UserCredentialsRepository();
        this.ccTrayApiClient = new CCTrayApiClient();
        this.configFileManager = new ConfigFileManager();
        this.configEditorWindow = new ConfigEditorWindow();
    }

    initMenu = async (): Promise<Array<CCTronMenuItem | MenuItemConstructorOptions>> => {
        const configFile = await this.configFileManager.loadFile();
        const configEntries: ConfigEntry[] = JSON.parse(configFile.toString());
        const unresolvedResponses: Promise<CCResponse>[] = configEntries.map(configEntry => this.ccTrayApiClient.fetchStatus(configEntry));
        const responses: CCResponse[] = (await Promise.all(unresolvedResponses)).filter(res => res !== undefined);

        return [...this.toCCTronMenuItem(responses), ...this.staticMenuItems()];
    }

    isCCTronMenuItem = (menuItem: CCTronMenuItem): menuItem is CCTronMenuItem => {
        return !!menuItem;
    };

    private toCCTronMenuItem = (responses: CCResponse[]): Array<CCTronMenuItem> => {
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

    private staticMenuItems = (): Array<MenuItemConstructorOptions> => {
        return [
            {
                label: '',
                type: 'separator'
            },
            {
                label: 'open config editor',
                toolTip: 'find config here: ' + app.getPath('userData'),
                type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                    this.configEditorWindow.open();
                }
            },
            {
                label: 'retrieve credentials from clipboard',
                toolTip: 'use format "username:password"',
                type: 'normal', click: (menuItem, browserWindow, keyBoardEvent) => {
                    const fromClipboard = clipboard.readText();
                    this.userCredentialsRepository.setCredentials(fromClipboard)
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
}

