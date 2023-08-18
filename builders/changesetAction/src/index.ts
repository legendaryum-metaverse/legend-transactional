import * as core from '@actions/core';
import markdownTable from 'markdown-table';

export type VersionType = 'major' | 'minor' | 'patch' | 'none';

export interface Release {
    name: string;
    type: VersionType;
}

export interface Changeset {
    summary: string;
    releases: Release[];
}

export type NewChangeset = Changeset & {
    id: string;
};

// This is a release that has been modified to include all relevant information
// about releasing - it is calculated and doesn't make sense as an artefact
export interface ComprehensiveRelease {
    name: string;
    type: VersionType;
    oldVersion: string;
    newVersion: string;
    changesets: string[];
}

export interface PreState {
    mode: 'pre' | 'exit';
    tag: string;
    initialVersions: Record<string, string>;
    changesets: string[];
}

export interface ReleasePlan {
    changesets: NewChangeset[];
    releases: ComprehensiveRelease[];
    preState: PreState | undefined;
}

export const getReleasePlanMessage = (releasePlan: ReleasePlan | null) => {
    console.log('releasePlan1', releasePlan);
    if (!releasePlan) return '';
    console.log('releasePlan2', releasePlan.releases);
    const publishableReleases = releasePlan.releases.filter(
        (x): x is ComprehensiveRelease & { type: Exclude<VersionType, 'none'> } => x.type !== 'none'
    );
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

    const table = markdownTable([tableHeader, ...tableRows]);

    return `<details><summary>This PR includes ${
        releasePlan.changesets.length
            ? `changesets to release ${
                  publishableReleases.length === 1 ? '1 package' : `${publishableReleases.length} packages`
              }`
            : 'no changesets'
    }</summary>

  ${
      publishableReleases.length
          ? table
          : "When changesets are added to this PR, you'll see the packages that this PR includes changesets for and the associated semver types"
  }

</details>`;
};

try {
    // const jsonString =
    //     '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
    const jsonString = core.getInput('json-string', { required: true });
    console.log('AA', jsonString);
    const releasePlan = JSON.parse(jsonString) as ReleasePlan;
    console.log('BB', releasePlan);
    const msg = getReleasePlanMessage(releasePlan);
    console.log('CC', msg);
    core.setOutput('release-plan-message', msg);
} catch (error) {
    console.error(error);
    core.setFailed('Action failed.');
}
