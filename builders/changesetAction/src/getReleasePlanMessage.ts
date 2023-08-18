import markdownTable from 'markdown-table';
import * as github from '@actions/github';
import { ComprehensiveRelease, ReleasePlan, VersionType } from './types';
import { PullRequest } from '@octokit/webhooks-definitions/schema';

// Helper function to generate changeset links
// https://github.com/<username>/<repository>/blob/<commit_hash>/<file_path>
// https://github.com/legendaryum-metaverse/legend-transac/blob/ae92063d4766c0f3b0071861db02e87f4ed95879/.changeset/sweet-horses-joke.md
function createChangesetLink(changesetId: string) {
    console.log('event name: ', github.context.eventName);
    console.log('payload', github.context.payload);

    let pr_sha: string | null = null;
    if (github.context.eventName === 'pull_request') {
        const pr = github.context.payload as PullRequest;
        // github.event.pull_request.head.sha
        pr_sha = "pr.head.sha";
        // core.info(`The head commit is: ${pushPayload.head_commit}`);
    }
    const {
        repo: { owner, repo },
        sha
    } = github.context;

    const changesetUrl = `https://github.com/${owner}/${repo}/blob/${pr_sha ?? sha}/.changeset/${changesetId}.md`;
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
