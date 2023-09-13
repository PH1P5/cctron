import { app, safeStorage } from "electron";
import * as keytar from 'keytar';

const encoding = 'binary';

export const getCredentials = async (): Promise<string> => {
   try {
       const encryptedCredentialsAsString = await keytar.getPassword(app.name, app.name);
       const encryptedCredentials = Buffer.from(encryptedCredentialsAsString, encoding);
       const decryptedCredentialsAsString = safeStorage.decryptString(encryptedCredentials);
       const [username, password] = credentialsFromString(decryptedCredentialsAsString);

       return username + ':' + password;
   } catch (e) {
       console.log('Cannot retrieve credentials from keychain.');
   }
   return 'NN:NN';
}

export const setCredentials = async (credentials: string) => {
    const encryptedCredentials = safeStorage.encryptString(credentials);
    const encryptedCredentialsAsString = encryptedCredentials.toString(encoding);
    await keytar.setPassword(app.name, app.name, encryptedCredentialsAsString);
}

const credentialsFromString= (creds: string): Array<string> => {
    return creds.split(':');
}