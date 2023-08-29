import { XMLParser } from "fast-xml-parser";

import {ConfigProps, LOCKED, UNKNOWN} from "./tray-initialization";

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

export const fetchStatus = async (configEntry: ConfigProps): Promise<CCResponse> => {
    const unknownStatus = responseOf(UNKNOWN, configEntry);
    try {
        const response = await fetchFromServer(configEntry);
        const data = await response.text();

        switch (response.status) {
            case 200:
                return parseResponse(data);
            case 401:
                return responseOf(LOCKED, configEntry);
            default:
                console.log(`${response.status}: Unexpected status`);
                return unknownStatus;
        }
    } catch (e) {
        return unknownStatus;
    }

}

const fetchFromServer = async (configEntry: ConfigProps): Promise<Response> => {
    if(configEntry.authRequired) {
        const headers = new Headers();
        headers.append('Authorization', 'Basic ' + Buffer.from(`${process.env.UN}:${process.env.PW}`).toString('base64'));

        return fetch(configEntry.url, {
            method:'GET',
            headers: headers
        });
    } else {
        return fetch(configEntry.url);
    }
}

// TODO support multy Project usage: Projects.Project.forEach...
const parseResponse = (rawXml: string): CCResponse => {
    const rawJson = parser.parse(rawXml);
    return {
        name: rawJson.Projects.Project.name,
        lastStatus: rawJson.Projects.Project.lastBuildStatus,
        activity: rawJson.Projects.Project.activity,
        url: rawJson.Projects.Project.webUrl
    }
}


const responseOf = (status: string, configEntry: ConfigProps): CCResponse => {
    const pathComponents = configEntry.url.split("/");
    const repoName = pathComponents[pathComponents.length - 2];
    const workflowName = pathComponents[pathComponents.length - 1];
    return {
        lastStatus: status,
        name: `${repoName} - ${workflowName}`
    };
}
