"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    prefix: function() {
        return prefix;
    },
    error: function() {
        return error;
    },
    info: function() {
        return info;
    },
    log: function() {
        return log;
    },
    printJson: function() {
        return printJson;
    }
});
const _util = /*#__PURE__*/ _interop_require_default(require("util"));
const _chalk = /*#__PURE__*/ _interop_require_default(require("chalk"));
const _ttytable = /*#__PURE__*/ _interop_require_default(require("tty-table"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const prefix = '🦋 ';
function format(args, customPrefix) {
    const fullPrefix = prefix + (customPrefix === undefined ? '' : ` ${customPrefix}`);
    return fullPrefix + _util.default// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .format('', ...args).split('\n').join(`\n${fullPrefix} `);
}
function error(...args) {
    console.error(format(args, _chalk.default.red('error')));
}
function info(...args) {
    console.info(format(args, _chalk.default.cyan('info')));
}
function log(...args) {
    console.log(format(args));
}
function verbosePrint(type, releases) {
    const packages = releases.filter((r)=>r.type === type);
    if (packages.length) {
        info((0, _chalk.default)`Packages to be bumped at {green ${type}}`);
        const columns = packages.map(({ name, newVersion: version, changesets })=>[
                _chalk.default.green(name),
                version,
                changesets.map((c)=>_chalk.default.blue(` .changeset/${c}.md`)).join(' +')
            ]);
        const t1 = (0, _ttytable.default)([
            {
                value: 'Package Name',
                width: 20
            },
            {
                value: 'New Version',
                width: 20
            },
            {
                value: 'Related Changeset Summaries',
                width: 70
            }
        ], columns, {
            paddingLeft: 1,
            paddingRight: 0,
            headerAlign: 'center',
            align: 'left'
        });
        log(`${t1.render()}\n`);
    } else {
        info((0, _chalk.default)`Running release would release {red NO} packages as a {green ${type}}`);
    }
}
const printJson = (releasePlan)=>{
    const { releases } = releasePlan;
    verbosePrint('patch', releases);
    log('---');
    verbosePrint('minor', releases);
    log('---');
    verbosePrint('major', releases);
};
