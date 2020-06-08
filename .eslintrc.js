module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    extends: [
        'plugin:@typescript-eslint/recommended' // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types':'off',
        'quotes': ['error', 'single', {
            'allowTemplateLiterals': true
        }],
        'semi': ['error', 'always'],
        'no-mixed-spaces-and-tabs': 'warn',
        'no-lonely-if': 'warn',
        'no-trailing-spaces': 'warn',
        'spaced-comment': ['error', 'always'],
        'eqeqeq': ['error', 'smart'],
        'keyword-spacing': 'error',
        'space-before-function-paren': ['error', 'always']
    }
};