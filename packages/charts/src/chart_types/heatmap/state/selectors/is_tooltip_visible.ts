/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipType } from '../../../../specs';
import { TooltipType } from '../../../../specs/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getTooltipInfoSelector } from './tooltip';

/** @internal */
export const isTooltipVisibleSelector = createCustomCachedSelector(
  [getSettingsSpecSelector, getTooltipInfoSelector],
  (settingsSpec, tooltipInfo): boolean => {
    if (getTooltipType(settingsSpec) === TooltipType.None) {
      return false;
    }
    return tooltipInfo.values.length > 0;
  },
);
