/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '.';
import { ScaleType } from './constants';
import { ScaleBand } from './scale_band';
import { ScaleContinuous } from './scale_continuous';

/**
 * Check if a scale is logaritmic
 * @internal
 */
export function isLogarithmicScale(scale: Scale): scale is ScaleContinuous {
  return scale.type === ScaleType.Log;
}

/**
 * Check if a scale is Band
 * @internal
 */
export function isBandScale(scale: Scale): scale is ScaleBand {
  return scale.type === ScaleType.Ordinal;
}

/**
 * Check if a scale is continuous
 * @internal
 */
export function isContinuousScale(scale: Scale): scale is ScaleContinuous {
  return scale.type !== ScaleType.Ordinal;
}
