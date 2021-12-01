module.exports = {
  'app/**/*.ts?(x)': [
    'tsc -p tsconfig.json --noEmit',
    'eslint --fix',
    'prettier --write',
  ],
}
