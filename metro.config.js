const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
      server: {
        port: 8082,
      },
      watchFolders: [path.resolve(__dirname, 'petiqa-sdk/dist')],
      resolver: {
        extraNodeModules: {
          'petiqa-sdk': path.resolve(__dirname, 'petiqa-sdk'),
        },
        nodeModulesPaths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'petiqa-sdk/node_modules')],
      },
    };

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
