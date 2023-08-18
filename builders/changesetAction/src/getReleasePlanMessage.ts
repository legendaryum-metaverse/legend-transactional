import markdownTable from 'markdown-table';
import { ComprehensiveRelease, ReleasePlan, VersionType } from './types';

export const getReleasePlanMessage = (releasePlan: ReleasePlan | null) => {
    if (!releasePlan) return '';
    const publishableReleases = releasePlan.releases.filter(
        (x): x is ComprehensiveRelease & { type: Exclude<VersionType, 'none'> } => x.type !== 'none'
    );
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
