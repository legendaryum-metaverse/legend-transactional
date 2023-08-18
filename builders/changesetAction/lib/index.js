"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleasePlanMessage = void 0;
// import * as core from '@actions/core';
const markdown_table_1 = __importDefault(require("markdown-table"));
const getReleasePlanMessage = (releasePlan) => {
    console.log('releasePlan1', releasePlan);
    if (!releasePlan)
        return '';
    console.log('releasePlan2', releasePlan.releases);
    const publishableReleases = releasePlan.releases.filter((x) => x.type !== 'none');
    console.log('releasePlan3', releasePlan.releases);
    const tableRows = publishableReleases.map(({ name, type, newVersion: version, changesets }) => [
        name,
        version,
        {
            major: 'Major',
            minor: 'Minor',
            patch: 'Patch'
        }[type],
        changesets.map(c => `[.changeset/${c}.md]`).join(' ')
    ]);
    const tableHeader = ['Package Name', 'New Version', 'Type', 'Related Changeset Summaries'];
    const table = (0, markdown_table_1.default)([tableHeader, ...tableRows]);
    return `<details><summary>This PR includes ${releasePlan.changesets.length
        ? `changesets to release ${publishableReleases.length === 1 ? '1 package' : `${publishableReleases.length} packages`}`
        : 'no changesets'}</summary>

  ${publishableReleases.length
        ? table
        : "When changesets are added to this PR, you'll see the packages that this PR includes changesets for and the associated semver types"}

</details>`;
};
exports.getReleasePlanMessage = getReleasePlanMessage;
try {
    const jsonString = '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
    // const jsonString = core.getInput('json-string', { required: true });
    console.log('AA', jsonString);
    const releasePlan = JSON.parse(jsonString);
    console.log('BB', releasePlan);
    const msg = (0, exports.getReleasePlanMessage)(releasePlan);
    console.log('CC', msg);
    // core.setOutput('release-plan-message', msg);
}
catch (error) {
    console.error(error);
    // core.setFailed('Action failed.');
}
//# sourceMappingURL=index.js.map