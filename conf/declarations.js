const dtsGenerator = require('dts-generator')

console.info ('Generating typings...');

const options = {
    name: '@ulaval/shell-ui',
    project: 'src',
    out: 'dist/typings.d.ts',
    main: '@ulaval/shell-ui/dist/shell',
    resolveModuleId: function (params) {
        return '@ulaval/shell-ui/dist/' + params.currentModuleId;
    },
    resolveModuleImport: function (params) {
        return '@ulaval/shell-ui/dist' + params.importedModuleId.substring(params.importedModuleId.indexOf('/'));
    }
}

dtsGenerator.default(options);
