import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';

export default [
  {
    // Base config for JS
    languageOptions: {
      globals: {
        // Browser globals like fetch, window, etc.
        window: true,
        document: true,
        console: true,
        fetch: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        initialMessage: true, // or remove this if it should be imported
        process: true,  // Explicitly define process as a global variable
      },
    },
    ...js.configs.recommended, // Spread the recommended JS config here
  },
  // React + Browser environment
  {
    files: ['src/**/*.js', 'src/**/*.jsx'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals like fetch, window, etc.
        window: true,
        document: true,
        console: true,
        fetch: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        initialMessage: true, // or remove this if it should be imported
        process: true,  // Explicitly define process as a global variable here as well
      },
    },
    settings: {
      react: {
        version: 'detect', // use installed React version
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/prop-types': 'warn',
    },
  },

  // Node.js environment (for config files)
  {
    files: ['*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: true,
        require: true,
        process: true,  // Explicitly define process as a global here too
      },
    },
  },
];
