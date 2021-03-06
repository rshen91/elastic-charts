/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../packages/charts/src';
import { BARCHART_1Y1G } from '../../packages/charts/src/utils/data_samples/test_dataset';

export const Example = () => (
  <Chart className="story-chart">
    <Settings
      showLegend
      theme={{
        legend: {
          margin: number('legend margins', 20, {
            min: 0,
          }),
        },
      }}
    />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars 1"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      data={BARCHART_1Y1G}
    />
  </Chart>
);

Example.story = {
  parameters: {
    info: {
      text:
        'The `Theme.chartMargins` does not contain the legend element. Adding legend margins via `Theme.legend.margin` allows adding margins to the Left/right or Top/Bottom of the legend.',
    },
  },
};
