import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    {
        rules: {
            'no-dupe-else-if': 'warn',
            'no-unused-vars': 'warn',
            'no-useless-catch': 'warn',
            eqeqeq: 'warn',
        },
    },
];
