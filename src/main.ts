
import { app } from "electron";
import { buildTray } from "./tray-initialization";
import  * as log from "electron-log"
import * as path from "path";

app.whenReady().then(() => {
    buildTray();
    setInterval(buildTray, 5000);

    log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/app.log');
    console.log = log.log;
});