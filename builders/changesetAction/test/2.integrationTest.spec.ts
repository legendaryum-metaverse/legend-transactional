import { run } from '@/run';

describe('triggering action succeeds', () => {
    beforeAll(() => {
        const jsonString =
            '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
        process.env['INPUT_JSON-STRING'] = jsonString;
        // process.env.GITHUB_OUTPUT = './outputcmd.txt';
    });
    afterAll(() => {
        process.env['INPUT_JSON-STRING'] = '';
    });
    it('get the release plan with the correct columns in msg', () => {
        run();
    });
});

describe('triggering action fails', () => {
    const spy = {
        console: null as unknown as jest.SpyInstance
    };
    beforeEach(() => {
        spy.console = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        spy.console.mockClear();
    });

    afterAll(() => {
        spy.console.mockRestore();
    });
    it('get the release plan with the correct columns in msg', () => {
        run();
        expect(console.error).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const o = spy.console.mock.calls[0][0];
        // console.log(Object.getOwnPropertyDescriptors(o));
        // const newError = Object.getOwnPropertyDescriptors(o) as unknown as Error;
        // console.log(newError.message);
        const catchError = o as unknown as Error;
        console.log(catchError.message);
        expect(catchError.message).toContain('Input required and not supplied: json-string');
    });
});

/*const envVars = {
    PATH: '/opt/hostedtoolcache/node/20.5.1/x64/bin:/root/setup-pnpm/node_modules/.bin:/opt/hostedtoolcache/node/18.17.1/x64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin',
    HOSTNAME: 'pop-os',
    TERM: 'xterm',
    RUNNER_TOOL_CACHE: '/opt/hostedtoolcache',
    RUNNER_OS: 'Linux',
    RUNNER_ARCH: 'X64',
    RUNNER_TEMP: '/tmp',
    LANG: 'C.UTF-8',
    DEBIAN_FRONTEND: 'noninteractive',
    IMAGE_OS: 'ubuntu22',
    ImageOS: 'ubuntu20',
    LSB_RELEASE: '22.04',
    AGENT_TOOLSDIRECTORY: '/opt/hostedtoolcache',
    RUN_TOOL_CACHE: '/opt/hostedtoolcache',
    DEPLOYMENT_BASEPATH: '/opt/runner',
    USER: 'root',
    RUNNER_USER: 'root',
    LSB_OS_VERSION: '2204',
    GITHUB_TOKEN: '',
    GITHUB_REPOSITORY_OWNER: 'legendaryum-metaverse',
    GITHUB_BASE_REF: '',
    PNPM_HOME: '/root/setup-pnpm/node_modules/.bin',
    CI: 'true',
    GITHUB_ACTION: 'release_plan_message',
    GITHUB_REPOSITORY: 'legendaryum-metaverse/legend-transac',
    GITHUB_EVENT_PATH: '/var/run/act/workflow/event.json',
    GITHUB_ENV: '/var/run/act/workflow/envs.txt',
    GITHUB_STATE: '/var/run/act/workflow/statecmd.txt',
    GITHUB_WORKFLOW: 'pull_request_to_main',
    GITHUB_ACTION_REF: '',
    GITHUB_REF: 'refs/heads/test_comment_changeset',
    GITHUB_REF_NAME: 'test_comment_changeset',
    'INPUT_JSON-STRING':
        '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n',
    ACTIONS_CACHE_URL: 'http://192.168.0.56:33095/',
    GITHUB_RUN_ID: '1',
    GITHUB_RUN_NUMBER: '1',
    GITHUB_HEAD_REF: '',
    GITHUB_REF_TYPE: 'branch',
    GITHUB_JOB: 'check_changeset',
    ACT: 'true',
    GITHUB_WORKSPACE: '/home/jym272/Documents/LEGENDARYUM/metaverse-lib/legend-transac',
    GITHUB_SHA: 'b243a1c8565da328b07a782ce92d60fe6b36708e',
    RUNNER_TRACKING_ID: '',
    GITHUB_OUTPUT: './outputcmd.txt',
    GITHUB_PATH: '/var/run/act/workflow/pathcmd.txt',
    GITHUB_ACTION_REPOSITORY: '',
    GITHUB_ACTIONS: 'true',
    GITHUB_ACTOR: 'nektos/act',
    GITHUB_RETENTION_DAYS: '0',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_ACTION_PATH: '',
    RUNNER_PERFLOG: '/dev/null',
    FORCE_COLOR: '3',
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_API_URL: 'https://api.github.com',
    GITHUB_GRAPHQL_URL: 'https://api.github.com/graphql',
    GITHUB_STEP_SUMMARY: '/var/run/act/workflow/SUMMARY.md',
    HOME: '/root'
};*/

/*const addEnvVarsToProcess = (envVars: Record<string, string>) => {
    Object.keys(envVars).forEach(key => {
        process.env[key] = envVars[key];
    });
};*/
