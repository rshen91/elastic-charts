/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BBox, BBoxCalculator } from './bbox_calculator';

/** @internal */
export class DOMTextBBoxCalculator implements BBoxCalculator {
  private attachedRoot: HTMLElement;

  private offscreenCanvas: HTMLSpanElement;

  constructor(rootElement?: HTMLElement) {
    this.offscreenCanvas = document.createElement('span');
    this.offscreenCanvas.style.position = 'absolute';
    this.offscreenCanvas.style.top = '-9999px';
    this.offscreenCanvas.style.left = '-9999px';

    this.attachedRoot = rootElement || document.documentElement;
    this.attachedRoot.appendChild(this.offscreenCanvas);
  }

  compute(text: string, padding: number, fontSize = 16, fontFamily = 'Arial', lineHeight = 1, fontWeight = 400): BBox {
    this.offscreenCanvas.style.fontSize = `${fontSize}px`;
    this.offscreenCanvas.style.fontFamily = fontFamily;
    this.offscreenCanvas.style.fontWeight = `${fontWeight}`;
    this.offscreenCanvas.style.lineHeight = `${lineHeight}px`;
    this.offscreenCanvas.innerHTML = text;

    return {
      width: Math.ceil(this.offscreenCanvas.clientWidth + padding),
      height: Math.ceil(this.offscreenCanvas.clientHeight),
    };
  }

  destroy(): void {
    this.attachedRoot.removeChild(this.offscreenCanvas);
  }
}
