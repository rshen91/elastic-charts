/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Goal } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/goal_chart/layout/config/config';
import { BandFillColorAccessorInput } from '../../packages/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '../../packages/charts/src/chart_types/goal_chart/specs/constants';
import { Color } from '../../packages/charts/src/utils/common';

const subtype = GoalSubtype.Goal;

const colorMap: { [k: number]: Color } = {
  300: 'rgb(232,232,232)',
};

const bandFillColor = (x: number): Color => colorMap[x];

export const Example = () => (
  <Chart className="story-chart">
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={225}
      actual={0}
      bands={[300]}
      ticks={[0, 50, 100, 150, 200, 250, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor="Revenue 2020 YTD  "
      labelMinor="(thousand USD)  "
      centralMajor="225"
      centralMinor=""
      config={config}
    />
  </Chart>
);
