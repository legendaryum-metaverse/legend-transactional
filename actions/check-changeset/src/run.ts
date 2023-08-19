import * as core from '@actions/core';
import { ReleasePlan } from './types';
import { getReleasePlanMessage } from './getReleasePlanMessage';
import { jsonParser } from '@/parser';

export const run = () => {
    try {
        const jsonString = core.getInput('json-string', { required: true });
        const releasePlan = jsonParser<ReleasePlan>(jsonString);
        const msg = getReleasePlanMessage(releasePlan);
        console.log(msg);
        core.setOutput('release-plan-message', msg);
    } catch (error) {
        console.error(error);
        const msg = (error as Error).message;
        if (process.env['IS_JEST-TEST'] !== 'TRUE') {
            core.setFailed(`Action failed: ${msg}`);
        }
    }
};
