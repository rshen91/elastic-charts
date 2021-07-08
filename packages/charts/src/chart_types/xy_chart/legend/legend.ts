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

import { LegendItem } from '../../../common/legend';
import { SeriesKey, SeriesIdentifier } from '../../../common/series_id';
import { ScaleType } from '../../../scales/constants';
import { SortSeriesByConfig, TickFormatterOptions } from '../../../specs';
import { Color, mergePartial } from '../../../utils/common';
import { BandedAccessorType } from '../../../utils/geometry';
import { getLegendCompareFn, SeriesCompareFn } from '../../../utils/series_sort';
import { PointStyle, Theme } from '../../../utils/themes/theme';
import { getXScaleTypeFromSpec } from '../scales/get_api_scales';
import { getAxesSpecForSpecId, getSpecsById } from '../state/utils/spec';
import { LastValues } from '../state/utils/types';
import { Y0_ACCESSOR_POSTFIX, Y1_ACCESSOR_POSTFIX } from '../tooltip/tooltip';
import { defaultTickFormatter } from '../utils/axis_utils';
import { defaultXYLegendSeriesSort } from '../utils/default_series_sort_fn';
import { groupBy } from '../utils/group_data_series';
import {
  getSeriesIndex,
  getSeriesName,
  DataSeries,
  getSeriesKey,
  isDataSeriesBanded,
  getSeriesIdentifierFromDataSeries,
} from '../utils/series';
import {
  AxisSpec,
  BasicSeriesSpec,
  Postfixes,
  isAreaSeriesSpec,
  isBarSeriesSpec,
  isBubbleSeriesSpec,
  isLineSeriesSpec,
} from '../utils/specs';

/** @internal */
export interface FormattedLastValues {
  y0: number | string | null;
  y1: number | string | null;
}

function getPostfix(spec: BasicSeriesSpec): Postfixes {
  if (isAreaSeriesSpec(spec) || isBarSeriesSpec(spec)) {
    const { y0AccessorFormat = Y0_ACCESSOR_POSTFIX, y1AccessorFormat = Y1_ACCESSOR_POSTFIX } = spec;
    return {
      y0AccessorFormat,
      y1AccessorFormat,
    };
  }

  return {};
}

function getBandedLegendItemLabel(name: string, yAccessor: BandedAccessorType, postfixes: Postfixes) {
  return yAccessor === BandedAccessorType.Y1
    ? `${name}${postfixes.y1AccessorFormat}`
    : `${name}${postfixes.y0AccessorFormat}`;
}

/** @internal */
export function getLegendExtra(
  showLegendExtra: boolean,
  xScaleType: ScaleType,
  formatter: (value: any, options?: TickFormatterOptions | undefined) => string,
  key: keyof LastValues,
  lastValue?: LastValues,
): LegendItem['defaultExtra'] {
  if (showLegendExtra) {
    const rawValue = (lastValue && lastValue[key]) ?? null;
    const formattedValue = rawValue !== null ? formatter(rawValue) : null;

    return {
      raw: rawValue !== null ? rawValue : null,
      formatted: xScaleType === ScaleType.Ordinal ? null : formattedValue,
      legendSizingLabel: formattedValue,
    };
  }
  return {
    raw: null,
    formatted: null,
    legendSizingLabel: null,
  };
}

/** @internal */
function getPointStyle(spec: BasicSeriesSpec, theme: Theme): PointStyle | undefined {
  if (isBubbleSeriesSpec(spec)) {
    return mergePartial(theme.bubbleSeriesStyle.point, spec.bubbleSeriesStyle?.point);
  } else if (isLineSeriesSpec(spec)) {
    return mergePartial(theme.lineSeriesStyle.point, spec.lineSeriesStyle?.point);
  } else if (isAreaSeriesSpec(spec)) {
    return mergePartial(theme.areaSeriesStyle.point, spec.areaSeriesStyle?.point);
  }
}

/** @internal */
export function computeLegend(
  dataSeries: DataSeries[],
  lastValues: Map<SeriesKey, LastValues>,
  seriesColors: Map<SeriesKey, Color>,
  specs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  showLegendExtra: boolean,
  serialIdentifierDataSeriesMap: Record<string, DataSeries>,
  deselectedDataSeries: SeriesIdentifier[] = [],
  theme: Theme,
  sortSeriesBy?: SeriesCompareFn | SortSeriesByConfig,
): LegendItem[] {
  const legendItems: LegendItem[] = [];
  const defaultColor = theme.colors.defaultVizColor;

  dataSeries.forEach((series) => {
    const { specId, yAccessor } = series;
    const banded = isDataSeriesBanded(series);
    const key = getSeriesKey(series, series.groupId);
    const spec = getSpecsById<BasicSeriesSpec>(specs, specId);
    const dataSeriesKey = getSeriesKey(
      {
        specId: series.specId,
        yAccessor: series.yAccessor,
        splitAccessors: series.splitAccessors,
      },
      series.groupId,
    );

    const color = seriesColors.get(dataSeriesKey) || defaultColor;

    const hasSingleSeries = dataSeries.length === 1;
    const name = getSeriesName(series, hasSingleSeries, false, spec);
    const isSeriesHidden = deselectedDataSeries ? getSeriesIndex(deselectedDataSeries, series) >= 0 : false;
    if (name === '' || !spec) {
      return;
    }

    const postFixes = getPostfix(spec);
    const labelY1 = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y1, postFixes) : name;

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);
    const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;
    const { hideInLegend } = spec;

    const lastValue = lastValues.get(key);
    const seriesIdentifier = getSeriesIdentifierFromDataSeries(series);
    const xScaleType = getXScaleTypeFromSpec(spec.xScaleType);

    const pointStyle = getPointStyle(spec, theme);

    legendItems.push({
      color,
      label: labelY1,
      seriesIdentifiers: [seriesIdentifier],
      childId: BandedAccessorType.Y1,
      isSeriesHidden,
      isItemHidden: hideInLegend,
      isToggleable: true,
      defaultExtra: getLegendExtra(showLegendExtra, xScaleType, formatter, 'y1', lastValue),
      path: [{ index: 0, value: seriesIdentifier.key }],
      keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
      pointStyle,
    });
    if (banded) {
      const labelY0 = getBandedLegendItemLabel(name, BandedAccessorType.Y0, postFixes);
      legendItems.push({
        color,
        label: labelY0,
        seriesIdentifiers: [seriesIdentifier],
        childId: BandedAccessorType.Y0,
        isSeriesHidden,
        isItemHidden: hideInLegend,
        isToggleable: true,
        defaultExtra: getLegendExtra(showLegendExtra, xScaleType, formatter, 'y0', lastValue),
        path: [{ index: 0, value: seriesIdentifier.key }],
        keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
        pointStyle,
      });
    }
  });

  const legendSortFn = getLegendCompareFn(sortSeriesBy, (a, b) => {
    const aDs = serialIdentifierDataSeriesMap[a.key];
    const bDs = serialIdentifierDataSeriesMap[b.key];
    return defaultXYLegendSeriesSort(aDs, bDs);
  });

  return groupBy(
    legendItems.sort((a, b) => legendSortFn(a.seriesIdentifiers[0], b.seriesIdentifiers[0])),
    ({ keys, childId }) => {
      return [...keys, childId].join('__'); // childId is used for band charts
    },
    true,
  ).map((d) => {
    return {
      ...d[0],
      seriesIdentifiers: d.map(({ seriesIdentifiers: [s] }) => s),
      path: d.map(({ path: [p] }) => p),
    };
  });
}
