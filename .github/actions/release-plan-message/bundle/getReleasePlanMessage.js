"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getReleasePlanMessage", {
    enumerable: true,
    get: function() {
        return getReleasePlanMessage;
    }
});
const _markdowntable = /*#__PURE__*/ _interop_require_default(require("markdown-table"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const getReleasePlanMessage = (releasePlan)=>{
    if (!releasePlan) return '';
    const publishableReleases = releasePlan.releases.filter((x)=>x.type !== 'none');
    const tableRows = publishableReleases.map(({ name, type, newVersion: version, changesets })=>[
            name,
            version,
            {
                major: 'Major',
                minor: 'Minor',
                patch: 'Patch'
            }[type],
            changesets.map((c)=>`[.changeset/${c}.md]`).join(' ')
        ]);
    const tableHeader = [
        'Package Name',
        'New Version',
        'Type',
        'Related Changeset Summaries'
    ];
    const table = (0, _markdowntable.default)([
        tableHeader,
        ...tableRows
    ]);
    return `<details><summary>This PR includes ${releasePlan.changesets.length ? `changesets to release ${publishableReleases.length === 1 ? '1 package' : `${publishableReleases.length} packages`}` : 'no changesets'}</summary>

  ${publishableReleases.length ? table : "When changesets are added to this PR, you'll see the packages that this PR includes changesets for and the associated semver types"}

</details>`;
};
