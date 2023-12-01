import { app } from "electron";
import * as path from "path";
import * as fs from 'fs';

const TARGET_CONFIG_FILE = app.getPath('userData') + '/config.json';

export const loadConfigFile = async (): Promise<Buffer> => {
    const defaultConfigFilePath = path.join(__dirname, 'config.json');

    try {
        return await fs.promises.readFile(TARGET_CONFIG_FILE);
    } catch {
        console.log('No config file found, initialisation follows.');
    }

    await fs.promises.copyFile(defaultConfigFilePath, TARGET_CONFIG_FILE);

    return await fs.promises.readFile(TARGET_CONFIG_FILE);
}

export const saveConfigFile = async (rawConfig: string) => {
    return fs.promises.writeFile(TARGET_CONFIG_FILE, rawConfig);
}