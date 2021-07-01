/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface GoalSemanticDescriptionProps {
  bandLabels: string[];
}

/** @internal */
export const GoalSemanticDescription = ({ bandLabels, labelId }: A11ySettings & GoalSemanticDescriptionProps) => {
  return bandLabels.length > 1 ? (
    <dl className="echScreenReaderOnly echGoalDescription" key={`goalChart--${labelId}`}>
      {bandLabels.map(([value, semantic], index) => (
        <>
          <dt key={`value-key--${index}-${value}`}>{value}</dt>
          <dd key={`value-dd--${index}-${value}`}>{semantic}</dd>
        </>
      ))}
    </dl>
  ) : null;
};