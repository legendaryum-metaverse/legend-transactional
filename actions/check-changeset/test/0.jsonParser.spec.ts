import { jsonParser } from '@/parser';
import { ReleasePlan } from '@/types';

// Antes de todos los test se cargas env vars de scripts/run_test.sh
describe('recursive jsonParser', () => {
    it('fails because is not a valid json string', () => {
        const invalidJsonString =
            '{"changesets":[{"releases":[{"name":"saga","type":"patch"}"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
        expect(() => jsonParser<ReleasePlan>(invalidJsonString)).toThrowError();
    });
    it('success because is a valid json string', () => {
        const jsonString =
            '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
        const parseOutput = jsonParser<ReleasePlan>(jsonString);
        expect(parseOutput).toEqual({
            changesets: [
                {
                    releases: [
                        {
                            name: 'saga',
                            type: 'patch'
                        }
                    ],
                    summary: 'asdawd',
                    id: 'sweet-horses-joke'
                }
            ],
            releases: [
                {
                    name: 'saga',
                    type: 'patch',
                    oldVersion: '0.0.2',
                    changesets: ['sweet-horses-joke'],
                    newVersion: '0.0.3'
                }
            ]
        });
    });
});
