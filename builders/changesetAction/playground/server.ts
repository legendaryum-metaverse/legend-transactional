/*
import {
    getReleasePlanMessage,
    getReleasePlanMessage2,
    getReleasePlanMessage3,
    ReleasePlan
} from './getReleasePlanMessage';
import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'node:process';
import { printJson } from './print';


(() => {
    const jsonFolderPath = path.join(cwd(), 'src');
    const fullPath = path.join(jsonFolderPath, 'asf.json');
    const releasePlan = JSON.parse("{\"changesets\":[{\"releases\":[{\"name\":\"saga\",\"type\":\"minor\"},{\"name\":\"legend-transac\",\"type\":\"patch\"}],\"summary\":\"ando\",\"id\":\"smart-gorillas-type\"}],\"releases\":[{\"name\":\"saga\",\"type\":\"minor\",\"oldVersion\":\"0.0.2\",\"changesets\":[\"smart-gorillas-type\"],\"newVersion\":\"0.1.0\"},{\"name\":\"legend-transac\",\"type\":\"patch\",\"oldVersion\":\"0.1.1\",\"changesets\":[\"smart-gorillas-type\"],\"newVersion\":\"0.1.2\"},{\"name\":\"micro-image\",\"type\":\"patch\",\"oldVersion\":\"0.0.4\",\"changesets\":[],\"newVersion\":\"0.0.5\"},{\"name\":\"micro-mint\",\"type\":\"patch\",\"oldVersion\":\"0.0.2\",\"changesets\":[],\"newVersion\":\"0.0.3\"}]}") as ReleasePlan;

    console.log(getReleasePlanMessage(releasePlan));
    // console.log(getReleasePlanMessage2(releasePlan));
    // console.log(getReleasePlanMessage3(releasePlan));
    // printJson(releasePlan);
})();
*/


/*
const terminateProcessListener: NodeJS.SignalsListener = signal => {
    console.warn('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);*/
