/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const glob = require('glob');
const ora = require('ora');

const addConsoleFlag = (dirPath) => {
  const filePath = path.join(dirPath, 'dist/index.js');
  try {
    const existingContent = fs.readFileSync(filePath, 'utf8');
    const appendContent = `

// LINKED CONSOLE FLAG
console.log(
  '\\n%cLinked @elastic/charts!',
  'font-weight: bold; font-size: 30px;color: #f04d9a; text-shadow: 2px 2px 0 #14abf5 , 4px 4px 0 #fec709 , 6px 6px 0 #00c1b4',
  '\\n\\nlast updated ' + require('moment')(${Date.now()}).fromNow(),
  '\\ndir:', '${dirPath}\\n\\n',
);
`;

    if (existingContent.includes('// LINKED CONSOLE FLAG')) {
      const newContent = existingContent.replace(/(\n)*\/\/ linked console flag(.|\n)+$/gi, appendContent);
      fs.writeFileSync(filePath, newContent);
    } else {
      fs.appendFileSync(filePath, appendContent);
    }
  } catch {
    // unable to add console flag
  }
};

/**
 * Replaces module `require` statements with relative paths.
 * This will use the local node_modules wherever the pacakge
 * is linked to for all `linkedPackages` defined.
 *
 * example:
 *
 * ```js
 * // kibana/node_modules/lib/file.js
 * require('react');
 * // replaced with...
 * require('../react'); // points at kibana/node_modules/react
 * ```
 */
const replaceModules = async (libDir, linkedPackages, packageName) => {
  if (linkedPackages.length === 0) return;

  const spinner = ora(`Replacing package links ${chalk.dim(`(${linkedPackages.join(',')})`)}`).start();
  const cwd = path.join(libDir, 'dist');
  const nodeModulesDir = path.join(libDir, 'node_modules');
  const re = new RegExp(`require\\("(?:.*?\\/)*(${linkedPackages.join('|')})"\\)`, 'g');

  await new Promise((resolve, reject) => {
    glob('**/*.js', { ignore: ['**/*.map.js'], cwd }, (error, files) => {
      if (error) {
        spinner.fail(error);
        reject(error);
      }

      files.forEach((file) => {
        const filePath = path.join(cwd, file);
        const fileModulePath = path.join(nodeModulesDir, packageName, file);
        const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
        const relativeModulesPath = path.relative(fileModulePath, nodeModulesDir);

        if (re.test(fileContent)) {
          const newFileContent = fileContent.replace(re, `require("${relativeModulesPath}/$1")`);

          fs.writeFileSync(filePath, newFileContent);
        }
      });
      addConsoleFlag(libDir);

      spinner.succeed();
      resolve();
    });
  });
};

module.exports = { replaceModules };
