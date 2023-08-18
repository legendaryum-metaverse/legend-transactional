"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleasePlanMessage = void 0;
const core = __importStar(require("@actions/core"));
const markdown_table_1 = __importDefault(require("markdown-table"));
const getReleasePlanMessage = (releasePlan) => {
    console.log('releasePlan1', releasePlan);
    console.log('releasePlan1.1', releasePlan === null || releasePlan === void 0 ? void 0 : releasePlan.releases);
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
const jsonParser = (str) => {
    let parsed = JSON.parse(str);
    if (typeof parsed === 'string')
        parsed = jsonParser(parsed);
    return parsed;
};
try {
    // const jsonString =
    //     '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
    const jsonString = core.getInput('json-string', { required: true });
    console.log('AA', jsonString);
    const releasePlan = jsonParser(jsonString);
    console.log('BB', releasePlan);
    const msg = (0, exports.getReleasePlanMessage)(releasePlan);
    console.log('CC', msg);
    core.setOutput('release-plan-message', msg);
}
catch (error) {
    console.error(error);
    core.setFailed('Action failed.');
}
//# sourceMappingURL=index.js.map