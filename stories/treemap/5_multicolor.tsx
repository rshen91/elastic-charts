/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, MODEL_KEY, Partition, PartitionLayout, Settings } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { arrayToLookup, hueInterpolator } from '../../packages/charts/src/common/color_calcs';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { countryDimension } from '../../packages/charts/src/mocks/hierarchical/dimension_codes';
import { palettes } from '../../packages/charts/src/mocks/hierarchical/palettes';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { regionLookup } from '../utils/utils';

const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

// style calcs
const interpolatorCET2s = hueInterpolator(palettes.CET2s.map(([r, g, b]) => [r, g, b, 0.7]));

const defaultFillColor = (colorMaker: any) => ({ [MODEL_KEY]: model }: any) => {
  const root = model.parent;
  const siblingCountLayer1 = root.children.length;
  return colorMaker(model.sortIndex / (siblingCountLayer1 + 1));
};

export const Example = () => (
  <Chart
    className="story-chart"
    size={
      {
        /* height: 800 */
      }
    }
  >
    <Settings theme={STORYBOOK_LIGHT_THEME} />
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      topGroove={0}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: {
            valueFormatter: () => '',
            textColor: 'black',
          },
          shape: {
            fillColor: 'rgba(0,0,0,0)',
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            textColor: 'rgba(60,60,60,1)',
            textInvertible: false,
            fontWeight: 100,
            fontStyle: 'normal',
            fontFamily: 'Din Condensed',
            fontVariant: 'normal',
          },
          shape: {
            fillColor: defaultFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 4,
        maxFontSize: 84,
        idealFontSizeJump: 1.05,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);
