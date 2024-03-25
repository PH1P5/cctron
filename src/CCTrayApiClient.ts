import { XMLParser } from "fast-xml-parser";

import {ConfigProps, LOCKED, UNKNOWN} from "./CCTronTray";
import {UserCredentialsRepository} from "./UserCredentialsRepository";
import {injectable} from "tsyringe";

const parser = new XMLParser(
    {
        ignoreAttributes: false,
        attributeNamePrefix: ''
    });

export interface CCResponse {
    name: string,
    lastStatus: string,
    activity?: string,
    url?: string
}
@injectable()
export class CCTrayApiClient {
    userCredentialsRepository: UserCredentialsRepository;
    constructor(userCredentialsRepository: UserCredentialsRepository) {
        this.userCredentialsRepository = userCredentialsRepository;
    }
    fetchStatus = async (configEntry: ConfigProps): Promise<CCResponse> => {
        const unknownStatus = this.responseOf(UNKNOWN, configEntry);
        try {
            const credentials = await this.userCredentialsRepository.getCredentials();
            const response = await this.fetchFromServer(configEntry, credentials);
            const data = await response.text();

            switch (response.status) {
                case 200:
                    return this.parseResponse(data);
                case 401:
                    return this.responseOf(LOCKED, configEntry);
                default:
                    console.log(`${response.status}: Unexpected status`);
                    return unknownStatus;
            }
        } catch (e) {
            return unknownStatus;
        }

    }

    private fetchFromServer = async (configEntry: ConfigProps, credentials: string): Promise<Response> => {
        if(configEntry.authRequired) {
            const headers = new Headers();
            headers.append('Authorization', 'Basic ' + Buffer.from(credentials).toString('base64'));

            return fetch(configEntry.url, {
                method:'GET',
                headers: headers
            });
        } else {
            return fetch(configEntry.url);
        }
    }

// TODO support multy Project usage: Projects.Project.forEach...
    private parseResponse = (rawXml: string): CCResponse => {
        const rawJson = parser.parse(rawXml);
        return {
            name: rawJson.Projects.Project.name,
            lastStatus: rawJson.Projects.Project.lastBuildStatus,
            activity: rawJson.Projects.Project.activity,
            url: rawJson.Projects.Project.webUrl
        }
    }


    private responseOf = (status: string, configEntry: ConfigProps): CCResponse => {
        const pathComponents = configEntry.url.split("/");
        const repoName = pathComponents[pathComponents.length - 2];
        const workflowName = pathComponents[pathComponents.length - 1];
        return {
            lastStatus: status,
            name: `${repoName} - ${workflowName}`
        };
    }

}
