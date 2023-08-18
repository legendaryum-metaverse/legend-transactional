import markdownTable from 'markdown-table';
import * as github from '@actions/github';
import { ComprehensiveRelease, ReleasePlan, VersionType } from './types';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

// Helper function to generate changeset links
// https://github.com/<username>/<repository>/blob/<commit_hash>/<file_path>
// https://github.com/legendaryum-metaverse/legend-transac/blob/ae92063d4766c0f3b0071861db02e87f4ed95879/.changeset/sweet-horses-joke.md
function createChangesetLink(changesetId: string) {
    console.log('event name: ', github.context.eventName);
    console.log('payload', github.context.payload);

    let pr_sha: string | undefined = undefined;
    if (github.context.eventName === 'pull_request') {
        const pr = github.context.payload as PullRequestEvent;
        pr_sha = pr.pull_request.head.sha;
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
/*

const payload = {
    action: 'synchronize',
    after: '3c7d952bd00158ab4c8d7bb5992883617b00e0f8',
    before: '0acc5ab866ba3592d803eb95e03347ec9f5a54eb',
    number: 13,
    organization: {
        avatar_url: 'https://avatars.githubusercontent.com/u/110250221?v=4',
        description: null,
        events_url: 'https://api.github.com/orgs/legendaryum-metaverse/events',
        hooks_url: 'https://api.github.com/orgs/legendaryum-metaverse/hooks',
        id: 110250221,
        issues_url: 'https://api.github.com/orgs/legendaryum-metaverse/issues',
        login: 'legendaryum-metaverse',
        members_url: 'https://api.github.com/orgs/legendaryum-metaverse/members{/member}',
        node_id: 'O_kgDOBpJI7Q',
        public_members_url: 'https://api.github.com/orgs/legendaryum-metaverse/public_members{/member}',
        repos_url: 'https://api.github.com/orgs/legendaryum-metaverse/repos',
        url: 'https://api.github.com/orgs/legendaryum-metaverse'
    },
    pull_request: {
        _links: {
            comments: [Object],
            commits: [Object],
            html: [Object],
            issue: [Object],
            review_comment: [Object],
            review_comments: [Object],
            self: [Object],
            statuses: [Object]
        },
        active_lock_reason: null,
        additions: 2665,
        assignee: null,
        assignees: [],
        author_association: 'COLLABORATOR',
        auto_merge: null,
        base: {
            label: 'legendaryum-metaverse:main',
            ref: 'main',
            repo: [Object],
            sha: 'd18403eb30e72e1011151f86751da5da2fd52149',
            user: [Object]
        },
        body:
            '### `Cambios` \r\n' +
            '\r\n' +
            '- ¿Qué cambio?\r\n' +
            '- Las capturas de pantalla antes/después también pueden ser útiles.\r\n' +
            '- No olvides a **changeset**! `pnpm exec changeset`\r\n' +
            '\r\n' +
            '### `docs`\r\n' +
            '<!-- ¿Se creó los correspondientes jsdoc y tsdoc a los cambios? -->\r\n' +
            '<!-- No borres esta sección, sino hay documentación explica porqué-->\r\n',
        changed_files: 50,
        closed_at: null,
        comments: 1,
        comments_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/issues/13/comments',
        commits: 21,
        commits_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/pulls/13/commits',
        created_at: '2023-08-18T01:51:50Z',
        deletions: 3867,
        diff_url: 'https://github.com/legendaryum-metaverse/legend-transac/pull/13.diff',
        draft: false,
        head: {
            label: 'legendaryum-metaverse:test_comment_changeset',
            ref: 'test_comment_changeset',
            repo: [Object],
            sha: '3c7d952bd00158ab4c8d7bb5992883617b00e0f8',
            user: [Object]
        },
        html_url: 'https://github.com/legendaryum-metaverse/legend-transac/pull/13',
        id: 1479866972,
        issue_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/issues/13',
        labels: [],
        locked: false,
        maintainer_can_modify: false,
        merge_commit_sha: '9ae5bf8c7e49aae36b6daf095c0333d2f442110b',
        mergeable: null,
        mergeable_state: 'unknown',
        merged: false,
        merged_at: null,
        merged_by: null,
        milestone: null,
        node_id: 'PR_kwDOKFNeoM5YNPpc',
        number: 13,
        patch_url: 'https://github.com/legendaryum-metaverse/legend-transac/pull/13.patch',
        rebaseable: null,
        requested_reviewers: [],
        requested_teams: [],
        review_comment_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/pulls/comments{/number}',
        review_comments: 0,
        review_comments_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/pulls/13/comments',
        state: 'open',
        statuses_url:
            'https://api.github.com/repos/legendaryum-metaverse/legend-transac/statuses/3c7d952bd00158ab4c8d7bb5992883617b00e0f8',
        title: 'fix: npx changeset',
        updated_at: '2023-08-18T20:29:19Z',
        url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/pulls/13',
        user: {
            avatar_url: 'https://avatars.githubusercontent.com/u/21118990?v=4',
            events_url: 'https://api.github.com/users/jym272/events{/privacy}',
            followers_url: 'https://api.github.com/users/jym272/followers',
            following_url: 'https://api.github.com/users/jym272/following{/other_user}',
            gists_url: 'https://api.github.com/users/jym272/gists{/gist_id}',
            gravatar_id: '',
            html_url: 'https://github.com/jym272',
            id: 21118990,
            login: 'jym272',
            node_id: 'MDQ6VXNlcjIxMTE4OTkw',
            organizations_url: 'https://api.github.com/users/jym272/orgs',
            received_events_url: 'https://api.github.com/users/jym272/received_events',
            repos_url: 'https://api.github.com/users/jym272/repos',
            site_admin: false,
            starred_url: 'https://api.github.com/users/jym272/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/jym272/subscriptions',
            type: 'User',
            url: 'https://api.github.com/users/jym272'
        }
    },
    repository: {
        allow_forking: true,
        archive_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/{archive_format}{/ref}',
        archived: false,
        assignees_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/assignees{/user}',
        blobs_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/git/blobs{/sha}',
        branches_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/branches{/branch}',
        clone_url: 'https://github.com/legendaryum-metaverse/legend-transac.git',
        collaborators_url:
            'https://api.github.com/repos/legendaryum-metaverse/legend-transac/collaborators{/collaborator}',
        comments_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/comments{/number}',
        commits_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/commits{/sha}',
        compare_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/compare/{base}...{head}',
        contents_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/contents/{+path}',
        contributors_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/contributors',
        created_at: '2023-08-09T13:13:26Z',
        default_branch: 'main',
        deployments_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/deployments',
        description: null,
        disabled: false,
        downloads_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/downloads',
        events_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/events',
        fork: false,
        forks: 1,
        forks_count: 1,
        forks_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/forks',
        full_name: 'legendaryum-metaverse/legend-transac',
        git_commits_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/git/commits{/sha}',
        git_refs_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/git/refs{/sha}',
        git_tags_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/git/tags{/sha}',
        git_url: 'git://github.com/legendaryum-metaverse/legend-transac.git',
        has_discussions: false,
        has_downloads: true,
        has_issues: true,
        has_pages: false,
        has_projects: true,
        has_wiki: true,
        homepage: null,
        hooks_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/hooks',
        html_url: 'https://github.com/legendaryum-metaverse/legend-transac',
        id: 676552352,
        is_template: false,
        issue_comment_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/issues/comments{/number}',
        issue_events_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/issues/events{/number}',
        issues_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/issues{/number}',
        keys_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/keys{/key_id}',
        labels_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/labels{/name}',
        language: 'JavaScript',
        languages_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/languages',
        license: null,
        merges_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/merges',
        milestones_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/milestones{/number}',
        mirror_url: null,
        name: 'legend-transac',
        node_id: 'R_kgDOKFNeoA',
        notifications_url:
            'https://api.github.com/repos/legendaryum-metaverse/legend-transac/notifications{?since,all,participating}',
        open_issues: 2,
        open_issues_count: 2,
        owner: {
            avatar_url: 'https://avatars.githubusercontent.com/u/110250221?v=4',
            events_url: 'https://api.github.com/users/legendaryum-metaverse/events{/privacy}',
            followers_url: 'https://api.github.com/users/legendaryum-metaverse/followers',
            following_url: 'https://api.github.com/users/legendaryum-metaverse/following{/other_user}',
            gists_url: 'https://api.github.com/users/legendaryum-metaverse/gists{/gist_id}',
            gravatar_id: '',
            html_url: 'https://github.com/legendaryum-metaverse',
            id: 110250221,
            login: 'legendaryum-metaverse',
            node_id: 'O_kgDOBpJI7Q',
            organizations_url: 'https://api.github.com/users/legendaryum-metaverse/orgs',
            received_events_url: 'https://api.github.com/users/legendaryum-metaverse/received_events',
            repos_url: 'https://api.github.com/users/legendaryum-metaverse/repos',
            site_admin: false,
            starred_url: 'https://api.github.com/users/legendaryum-metaverse/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/legendaryum-metaverse/subscriptions',
            type: 'Organization',
            url: 'https://api.github.com/users/legendaryum-metaverse'
        },
        private: false,
        pulls_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/pulls{/number}',
        pushed_at: '2023-08-18T20:29:20Z',
        releases_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/releases{/id}',
        size: 323,
        ssh_url: 'git@github.com:legendaryum-metaverse/legend-transac.git',
        stargazers_count: 0,
        stargazers_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/stargazers',
        statuses_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/statuses/{sha}',
        subscribers_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/subscribers',
        subscription_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/subscription',
        svn_url: 'https://github.com/legendaryum-metaverse/legend-transac',
        tags_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/tags',
        teams_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/teams',
        topics: [],
        trees_url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac/git/trees{/sha}',
        updated_at: '2023-08-18T01:49:28Z',
        url: 'https://api.github.com/repos/legendaryum-metaverse/legend-transac',
        visibility: 'public',
        watchers: 0,
        watchers_count: 0,
        web_commit_signoff_required: false
    },
    sender: {
        avatar_url: 'https://avatars.githubusercontent.com/u/21118990?v=4',
        events_url: 'https://api.github.com/users/jym272/events{/privacy}',
        followers_url: 'https://api.github.com/users/jym272/followers',
        following_url: 'https://api.github.com/users/jym272/following{/other_user}',
        gists_url: 'https://api.github.com/users/jym272/gists{/gist_id}',
        gravatar_id: '',
        html_url: 'https://github.com/jym272',
        id: 21118990,
        login: 'jym272',
        node_id: 'MDQ6VXNlcjIxMTE4OTkw',
        organizations_url: 'https://api.github.com/users/jym272/orgs',
        received_events_url: 'https://api.github.com/users/jym272/received_events',
        repos_url: 'https://api.github.com/users/jym272/repos',
        site_admin: false,
        starred_url: 'https://api.github.com/users/jym272/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/jym272/subscriptions',
        type: 'User',
        url: 'https://api.github.com/users/jym272'
    }
};
*/
