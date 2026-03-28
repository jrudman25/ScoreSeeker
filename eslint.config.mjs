import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
    ...nextVitals,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'coverage/**',
        'next-env.d.ts',

        // Development environment & cache ignores
        '.idea/**',
        '.vscode/**',
        '.swc/**',
        'node_modules/**',

        // Config file ignores
        '*.config.js',
        '*.config.mjs',
        'jest.setup.js',
        '**/*.json'
    ]),

    // Custom Rules for Best Practices
    {
        rules: {

            // Errors
            "for-direction": "error",
            "no-redeclare": "error",
            "no-cond-assign": "error",
            "no-const-assign": "error",
            "no-dupe-else-if": "error",
            "no-invalid-regexp": "error",
            "no-loss-of-precision": "error",
            "no-self-assign": "error",
            "no-self-compare": "error",
            "no-unmodified-loop-condition": "error",
            "no-unreachable-loop": "error",
            "no-unreachable": "error",
            "no-use-before-define": "error",
            "react/no-deprecated": "error",

            // Warns
            "no-duplicate-imports": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_"
            }],
            "no-fallthrough": "warn",
            "no-lonely-if": "warn",
            "no-empty": "warn",
            "curly": ["warn", "all"],
            "prefer-const": "warn",
            "no-useless-concat": "warn",
            "no-useless-escape": "warn",
            "no-useless-return": "warn",
            "no-useless-rename": "warn",
            "no-return-assign": "warn",
        }
    }
])

export default eslintConfig