/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { button, select } from '@storybook/addon-knobs';
import React, { RefObject } from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  Partition,
  Datum,
  Goal,
  ChartType,
} from '../../packages/charts/src';
import { BandFillColorAccessorInput } from '../../packages/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '../../packages/charts/src/chart_types/goal_chart/specs/constants';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { Color } from '../../packages/charts/src/utils/common';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { SB_KNOBS_PANEL } from '../utils/storybook';
import { productLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => {
  /**
   * The handler section of this story demonstrates the PNG export functionality
   */
  const chartRef: React.RefObject<Chart> = React.createRef();
  const handler = () => {
    if (!chartRef.current) {
      return;
    }
    const snapshot = chartRef.current.getPNGSnapshot({
      // you can set the background and pixel ratio for the PNG export
      backgroundColor: 'white',
      pixelRatio: 2,
    });
    if (!snapshot) {
      return;
    }
    // will save as chart.png
    const fileName = 'chart.png';
    switch (snapshot.browser) {
      case 'IE11':
        return navigator.msSaveBlob(snapshot.blobOrDataUrl, fileName);
      default:
        const link = document.createElement('a');
        link.download = fileName;
        link.href = snapshot.blobOrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  button('Export PNG', handler);
  const selectedChart = select('chart type', [ChartType.XYAxis, ChartType.Partition, ChartType.Goal], ChartType.XYAxis);

  switch (selectedChart) {
    case ChartType.Partition:
      return renderPartitionChart(chartRef);
    case ChartType.Goal:
      return renderGoalchart(chartRef);
    case ChartType.XYAxis:
    default:
      return renderXYAxisChart(chartRef);
  }
};

function renderPartitionChart(chartRef: RefObject<Chart>) {
  return (
    <Chart ref={chartRef}>
      <Partition
        id="spec_1"
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            fillLabel: { textInvertible: true },
            shape: {
              fillColor: indexInterpolatedFillColor(interpolatorCET2s),
            },
          },
        ]}
      />
    </Chart>
  );
}

function renderXYAxisChart(chartRef: RefObject<Chart>) {
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 100);
  return (
    <Chart className="story-chart" ref={chartRef}>
      <Settings showLegend showLegendExtra />
      <Axis
        id="time"
        position={Position.Bottom}
        tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
      />
      <Axis id="count" domain={{ fit: true }} position={Position.Left} />

      <BarSeries
        id="series bars chart"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
}

function renderGoalchart(chartRef: RefObject<Chart>) {
  const subtype = GoalSubtype.Goal;

  const colorMap: { [k: number]: Color } = {
    200: '#fc8d62',
    250: 'lightgrey',
    300: '#66c2a5',
  };

  const bandFillColor = (x: number): Color => colorMap[x];

  return (
    <Chart className="story-chart" ref={chartRef}>
      <Goal
        id="spec_1"
        subtype={subtype}
        base={0}
        target={260}
        actual={280}
        bands={[200, 250, 300]}
        ticks={[0, 50, 100, 150, 200, 250, 300]}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
        labelMajor=""
        labelMinor=""
        centralMajor="280 MB/s"
        centralMinor=""
        config={{
          angleStart: Math.PI + (Math.PI - (2 * Math.PI) / 3) / 2,
          angleEnd: -(Math.PI - (2 * Math.PI) / 3) / 2,
        }}
      />
    </Chart>
  );
}

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
    info: {
      text:
        'Generate a PNG of the chart by clicking on the Export PNG button in the knobs section. In this Example, the button handler is setting the PNG background to white with a pixel ratio of 2. If the browser is detected to be IE11, msSaveBlob will be used instead of a PNG capture.',
    },
  },
};
