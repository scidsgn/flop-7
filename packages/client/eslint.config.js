import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import unusedImports from "eslint-plugin-unused-imports"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            {
                plugins: {
                    "unused-imports": unusedImports,
                },
                rules: {
                    "unused-imports/no-unused-imports": "error",
                    "unused-imports/no-unused-vars": [
                        "warn",
                        {
                            vars: "all",
                            varsIgnorePattern: "^_",
                            args: "after-used",
                            argsIgnorePattern: "^_",
                        },
                    ],
                },
                ignores: ["node_modules/**"],
            },
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },
])
