import { ComprehensiveRelease, ReleasePlan, VersionType } from './types';
import util from 'util';
import chalk from 'chalk';
import table from 'tty-table';
export const prefix = '🦋 ';
// NOTE: There is a boxen types that doesn't work so made this here
declare module 'tty-table' {
  export default function (
    value: { value: string; width: number }[],
    columsn: string[][],
    options: {
      paddingLeft: number;
      paddingRight: number;
      headerAlign: string;
      align: string;
    },
  ): {
    render: () => string;
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function format(args: any[], customPrefix?: string) {
  const fullPrefix = prefix + (customPrefix === undefined ? '' : ` ${customPrefix}`);
  return (
    fullPrefix +
    util
      .format('', ...args)
      .split('\n')
      .join(`\n${fullPrefix} `)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function error(...args: any[]) {
  console.error(format(args, chalk.red('error')));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function info(...args: any[]) {
  console.info(format(args, chalk.cyan('info')));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...args: any[]) {
  console.log(format(args));
}

function verbosePrint(type: VersionType, releases: ComprehensiveRelease[]) {
  const packages = releases.filter((r) => r.type === type);
  if (packages.length) {
    info(chalk`Packages to be bumped at {green ${type}}`);

    const columns = packages.map(({ name, newVersion: version, changesets }) => [
      chalk.green(name),
      version,
      changesets.map((c) => chalk.blue(` .changeset/${c}.md`)).join(' +'),
    ]);

    const t1 = table(
      [
        { value: 'Package Name', width: 20 },
        { value: 'New Version', width: 20 },
        { value: 'Related Changeset Summaries', width: 70 },
      ],
      columns,
      { paddingLeft: 1, paddingRight: 0, headerAlign: 'center', align: 'left' },
    );
    log(`${t1.render()}\n`);
  } else {
    info(chalk`Running release would release {red NO} packages as a {green ${type}}`);
  }
}
// changeset --status --verbose
export const printJson = (releasePlan: ReleasePlan) => {
  const { releases } = releasePlan;
  verbosePrint('patch', releases);
  log('---');
  verbosePrint('minor', releases);
  log('---');
  verbosePrint('major', releases);
};
