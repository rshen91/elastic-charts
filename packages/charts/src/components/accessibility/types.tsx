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

import { GoalChartData } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderTypesProps {
  chartTypeDescription: string;
  goalChartData?: GoalChartData;
}

/** @internal */
export function ScreenReaderTypes({
  goalChartData,
  defaultSummaryId,
  chartTypeDescription,
}: A11ySettings & ScreenReaderTypesProps) {
  if (!defaultSummaryId && !goalChartData) return null;
  return (
    <dl>
      <dt>Chart type:</dt>
      <dd id={defaultSummaryId}>{chartTypeDescription}</dd>
      {goalChartData && <dd>{`Minimum: ${goalChartData.minimum}`}</dd>}
      {goalChartData && <dd>{`Maximum: ${goalChartData.maximum}`}</dd>}
      {goalChartData && <dd>{`Target: ${goalChartData.target}`}</dd>}
      {goalChartData && <dd>{`Value: ${goalChartData.value}`}</dd>}
    </dl>
  );
}
