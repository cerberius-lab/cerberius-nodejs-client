module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'babel-jest', // Use babel-jest for .ts and .tsx files
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  // Remove any ts-jest specific globals if they exist
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json'
  //   }
  // },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // moduleDirectories can usually be removed when using babel-jest,
  // as babel-jest should resolve modules correctly.
  // moduleDirectories: [
  //   'node_modules',
  // ],
};
