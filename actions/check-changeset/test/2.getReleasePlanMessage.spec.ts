import { getReleasePlanMessage } from '@/getReleasePlanMessage';
import { jsonParser } from '@/parser';
import { ReleasePlan } from '@/types';
// Antes de todos los test se cargas env vars de scripts/run_test.sh
describe('getting release plan', () => {
  it('get the release plan with the correct columns in msg', () => {
    const jsonString =
      '{"changesets":[{"releases":[{"name":"saga","type":"patch"}],"summary":"asdawd","id":"sweet-horses-joke"}],"releases":[{"name":"saga","type":"patch","oldVersion":"0.0.2","changesets":["sweet-horses-joke"],"newVersion":"0.0.3"}]}\n';
    const parseOutput = jsonParser<ReleasePlan>(jsonString);
    const msg = getReleasePlanMessage(parseOutput);
    console.log('msg', msg);
    const columns = [
      'Package Name',
      'New Version',
      'Type',
      'Related Changeset Summaries',
      '</details>',
      '<details>',
      '<summary>',
      '</summary>',
    ];
    expect(msg).toBeDefined();
    columns.forEach((column) => {
      expect(msg.includes(column)).toBeTruthy();
    });
  });
});
