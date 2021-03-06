/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { connect } from 'react-redux';

import { GlobalChartState } from '../../../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { geometries } from '../../state/selectors/geometries';
import { getBrushedHighlightedShapesSelector } from '../../state/selectors/get_brushed_highlighted_shapes';
import { getHeatmapConfigSelector } from '../../state/selectors/get_heatmap_config';
import { getHighlightedAreaSelector } from '../../state/selectors/get_highlighted_area';
import { DEFAULT_PROPS, HighlighterCellsComponent, HighlighterCellsProps } from './highlighter';

const brushMapStateToProps = (state: GlobalChartState): HighlighterCellsProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const { chartId } = state;

  const geoms = geometries(state);
  const canvasDimension = computeChartDimensionsSelector(state);

  let dragShape = getBrushedHighlightedShapesSelector(state);
  const highlightedArea = getHighlightedAreaSelector(state);
  if (highlightedArea) {
    dragShape = highlightedArea;
  }
  const { brushMask, brushArea } = getHeatmapConfigSelector(state);

  return {
    chartId,
    initialized: true,
    canvasDimension,
    geometries: geoms,
    dragShape,
    brushMask,
    brushArea,
  };
};

/**
 * @internal
 */
export const HighlighterFromBrush = connect(brushMapStateToProps)(HighlighterCellsComponent);
