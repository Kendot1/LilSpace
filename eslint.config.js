import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
export default tseslint.config({ignores:['dist/**','node_modules/**','playwright-report/**','test-results/**','.agents/skills/**']},...tseslint.configs.recommended,{files:['src/**/*.{ts,tsx}'],languageOptions:{globals:globals.browser},plugins:{'react-hooks':hooks},rules:{...hooks.configs.recommended.rules}})
