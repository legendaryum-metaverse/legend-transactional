import { createChangesetLink } from '@/getReleasePlanMessage';

// Antes de todos los test se cargas env vars de scripts/run_test.sh
describe('create changeset link', () => {
  it('get the link', () => {
    const link = createChangesetLink('sweet-horses-joke');
    const keyWords = [
      '<a',
      'href',
      'sweet-horses-joke',
      'target',
      '_blank',
      '</a>',
      'legendaryum-metaverse',
      'legend-transac',
      '.changeset',
      'blob',
    ];
    expect(link).toBeDefined();
    keyWords.forEach((k) => {
      expect(link).toContain(k);
    });
  });
});
