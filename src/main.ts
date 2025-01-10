import "reflect-metadata";
import {container} from "tsyringe";

import { app } from "electron";
import { CCTronTray } from "./CCTronTray";

import log from "electron-log/main"
import * as path from "path";

app.whenReady().then(() => {

    const ccTronTray = container.resolve(CCTronTray);
    ccTronTray.build();

    setInterval(ccTronTray.build, 5000);

    log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/app.log');
    console.log = log.log;

});