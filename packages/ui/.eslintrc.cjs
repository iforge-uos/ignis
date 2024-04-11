/** @type {import("eslint").Linter.Config} */
module.exports = {
    extends: [require.resolve('@ignis/lint/vite')],
    root: true,
    parserOptions: {
        project: './tsconfig.json',
    },
    overrides: [
        {
            // Disabling 'react-refresh/only-export-components' for 'stories' and 'components'
            files: ['stories/**/*', 'components/**/*'],
            rules: {
                'react-refresh/only-export-components': 'off'
            }
        },
        {
            // Disabling all rules for 'stories_old'
            files: ['stories_old/**/*'],
            rules: {
                // This line disables all rules
                'no-restricted-syntax': ['error', 'WithStatement'],
                '@typescript-eslint/no-unused-vars': 'off',
            }
        }
    ]
};
