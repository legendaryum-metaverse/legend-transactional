/*

export const getReleasePlanMessage = (releasePlan: ReleasePlan | null) => {
    if (!releasePlan) return '';

    const publishableReleases = releasePlan.releases.filter(
        (x): x is ComprehensiveRelease & { type: Exclude<VersionType, 'none'> } => x.type !== 'none'
    );

    const table = markdownTable([
        ['Name', 'Type'],
        ...publishableReleases.map(x => {
            return [
                x.name,
                {
                    major: 'Major',
                    minor: 'Minor',
                    patch: 'Patch'
                }[x.type]
            ];
        })
    ]);

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

export const getReleasePlanMessage2 = (releasePlan: ReleasePlan | null) => {
    if (!releasePlan) return '';

    const publishableReleases = releasePlan.releases.filter(
        (x): x is ComprehensiveRelease & { type: Exclude<VersionType, 'none'> } => x.type !== 'none'
    );

    const tableRows = publishableReleases.map(({ name, newVersion: version, changesets }) => [
        name,
        version,
        changesets.map(c => `[.changeset/${c}.md]`).join(' ')
    ]);

    const tableHeader = ['Package Name', 'New Version', 'Related Changeset Summaries'];

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
*/
