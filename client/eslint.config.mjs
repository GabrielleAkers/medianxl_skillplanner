// @ts-nocheck

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, eslintPluginPrettier.configs.recommended);
