import markdownTable from 'markdown-table';
import * as github from '@actions/github';
import { ComprehensiveRelease, ReleasePlan, VersionType } from './types';

// Helper function to generate changeset links
// https://github.com/<username>/<repository>/blob/<commit_hash>/<file_path>
// https://github.com/legendaryum-metaverse/legend-transac/blob/ae92063d4766c0f3b0071861db02e87f4ed95879/.changeset/sweet-horses-joke.md
function createChangesetLink(changesetId: string) {
    const {
        repo: { owner, repo },
        sha
    } = github.context;
    const changesetUrl = `https://github.com/${owner}/${repo}/blob/${sha}/.changeset/${changesetId}.md`;
    return `<a href="${changesetUrl}" target="_blank">.changeset/${changesetId}.md</a>`;
}
export const getReleasePlanMessage = (releasePlan: ReleasePlan | null) => {
    if (!releasePlan) return '';

    const publishableReleases = releasePlan.releases.filter(
        (x): x is ComprehensiveRelease & { type: Exclude<VersionType, 'none'> } => x.type !== 'none'
    );

    const tableRows = publishableReleases.map(({ name, type, newVersion: version, changesets }) => {
        const changesetLinks = changesets.map(c => createChangesetLink(c));
        const typeLabel = {
            major: 'Major',
            minor: 'Minor',
            patch: 'Patch'
        }[type];
        return [name, version, typeLabel, changesetLinks.join(' ')];
    });

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
