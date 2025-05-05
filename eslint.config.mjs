import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript rules for better type safety
      "@typescript-eslint/no-explicit-any": "warn", // Warn instead of "off" to encourage proper typing
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": ["warn", {
        // Allow ts-ignore with a required comment explaining why
        "ts-ignore": "allow-with-description",
        "minimumDescriptionLength": 10,
      }],
      "@typescript-eslint/no-non-null-assertion": "warn", // Warn about non-null assertions
      
      // React specific rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Best practices
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "warn",
      "no-var": "error",
      
      // Less strict during migration phase - can be tightened later
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "typescript/no-unsafe-assignment": "off", 
      "typescript/no-unsafe-member-access": "off"
    }
  }
];

export default eslintConfig;
