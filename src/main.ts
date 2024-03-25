import "reflect-metadata";
import {container} from "tsyringe";

import { app } from "electron";
import { CCTronTray } from "./CCTronTray";

import  * as log from "electron-log"
import * as path from "path";

app.whenReady().then(() => {

    const ccTronTray = container.resolve(CCTronTray);
    ccTronTray.build();

    setInterval(ccTronTray.build, 5000);

    log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/app.log');
    console.log = log.log;

});