
import { app } from "electron";
import { buildTray } from "./tray-initialization";

app.whenReady().then(() => {
    buildTray();
    setInterval(buildTray, 5000);

});