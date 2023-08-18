import * as core from '@actions/core';
import { getReleasePlanMessage, ReleasePlan } from './getReleasePlanMessage';

try {
    const jsonString = core.getInput('json-string', { required: true });
    console.log('AA', jsonString);
    const releasePlan = JSON.parse(jsonString) as ReleasePlan;
    const msg = getReleasePlanMessage(releasePlan);
    core.setOutput('release-plan-message', msg);
} catch (error) {
    console.error(error);
    core.setFailed('Action failed.');
}
