import * as core from '@actions/core';
import { getReleasePlanMessage, ReleasePlan } from './getReleasePlanMessage';

try {
    // const jsonString = "{\"changesets\":[{\"releases\":[{\"name\":\"saga\",\"type\":\"patch\"}],\"summary\":\"asdawd\",\"id\":\"sweet-horses-joke\"}],\"releases\":[{\"name\":\"saga\",\"type\":\"patch\",\"oldVersion\":\"0.0.2\",\"changesets\":[\"sweet-horses-joke\"],\"newVersion\":\"0.0.3\"}]}\n"
    const jsonString = core.getInput('json-string', { required: true });
    console.log('AA', jsonString);
    const releasePlan = JSON.parse(jsonString) as ReleasePlan;
    console.log('BB', releasePlan);
    const msg = getReleasePlanMessage(releasePlan);
    console.log('CC', msg);
    core.setOutput('release-plan-message', msg);
} catch (error) {
    console.error(error);
    // core.setFailed('Action failed.');
}
