/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { INTERNAL_TAG, PUBLIC_TAG, ALPHA_TAG, BETA_TAG } = require('./constants');
const utils = require('./utils');

function getExportParent(node) {
  if (!node) return null;
  if (node?.parent?.type === 'ExportNamedDeclaration') return node.parent;
  return getExportParent(node?.parent);
}

function replaceTag({ value }, oldTag, newTag) {
  const content = value.trim();
  const newContent = content.replace(oldTag, newTag);

  return /\n/.test(content) ? `/*${newContent}\n */` : `/*${newContent} */`;
}

const isType = ({ type }) => type === 'Type';
const isVariable = ({ type }) => type === 'Variable';

module.exports = {
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Disallow different release tags',
      url: 'https://api-extractor.com/pages/messages/ae-different-release-tags/',
    },
  },
  create(context) {
    let initialized = false;
    const variableTypePairs = new Map();
    const seen = new Set();

    return {
      // eslint-disable-next-line func-names
      'ExportNamedDeclaration[specifiers=""]:not(ExportAllDeclaration)': function (node) {
        if (!initialized) {
          initialized = true;
          const { variables } = context.getScope();
          variables
            .filter(({ defs }) => defs.some(isVariable) && defs.some(isType))
            .forEach(({ name, defs = [] }) => {
              const type = getExportParent(defs.find(isType)?.node);
              const variable = getExportParent(defs.find(isVariable)?.node);

              if (type && variable) {
                variableTypePairs.set(name, { type, variable });
              }
            });
        }

        const name = utils.getExportName(node);
        if (!seen.has(name) && variableTypePairs.has(name)) {
          seen.add(name);
          const { type, variable } = variableTypePairs.get(name) ?? {};

          const typeComment = utils.getTSDocComment(context, type);
          const variableComment = utils.getTSDocComment(context, variable);

          if (typeComment && variableComment) {
            const typeTag = utils.getReleaseTag(typeComment.value);
            const variableTag = utils.getReleaseTag(variableComment.value);

            if (typeTag && variableTag && typeTag !== variableTag) {
              const tag = [ALPHA_TAG, BETA_TAG, PUBLIC_TAG, INTERNAL_TAG].find(
                (t) => variableTag === t || typeTag === t,
              );

              if (typeTag !== tag) {
                context.report({
                  loc: typeComment.loc,
                  message: 'Release tag should match {{ name }} type',
                  data: {
                    name,
                  },
                  fix(fixer) {
                    const value = replaceTag(typeComment, typeTag, tag);
                    return fixer.replaceTextRange(typeComment.range, value);
                  },
                });
              }

              if (variableTag !== tag) {
                context.report({
                  loc: variableComment.loc,
                  message: 'Release tag should match {{ name }} type',
                  data: {
                    name,
                  },
                  fix(fixer) {
                    const value = replaceTag(variableComment, variableTag, tag);
                    return fixer.replaceTextRange(variableComment.range, value);
                  },
                });
              }
            }
          }
        }
      },
    };
  },
};
