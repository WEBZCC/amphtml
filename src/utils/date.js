/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {pureDevAssert, pureUserAssert} from '../pure-assert';

/**
 * Parses the date using the `Date.parse()` rules. Additionally supports the
 * keyword "now" that indicates the "current date/time". Returns either a
 * valid epoch value or null.
 *
 * @param {?string|undefined} s
 * @return {?number}
 */
export function parseDate(s) {
  if (!s) {
    return null;
  }
  if (s.toLowerCase() === 'now') {
    return Date.now();
  }
  const parsed = Date.parse(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * @param {!Date|number|string|T} value
 * @return {number|T}
 * @template T
 */
export function getDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value == 'number') {
    return value;
  }
  if (typeof value == 'string') {
    return parseDate(value);
  }
  // Must be a `Date` object.
  return value.getTime();
}

/** Map from attribute names to their parsers. */
const dateAttrParsers = {
  'datetime': (datetime) =>
    pureUserAssert(parseDate(datetime), `Invalid date: ${datetime}`),
  'end-date': (datetime) =>
    pureUserAssert(parseDate(datetime), `Invalid date: ${datetime}`),
  'timeleft-ms': (timeleftMs) => Date.now() + Number(timeleftMs),
  'timestamp-ms': (ms) => Number(ms),
  'timestamp-seconds': (timestampSeconds) => 1000 * Number(timestampSeconds),
};

/**
 * @param {!Element} element
 * @param {!Array<string>} dateAttrs list of attribute names
 * @return {?number}
 */
export function parseDateAttrs(element, dateAttrs) {
  const epoch = pureUserAssert(
    parseEpoch(element, dateAttrs),
    `One of [${dateAttrs.join(', ')}] is required`
  );

  const offsetSeconds =
    (Number(element.getAttribute('offset-seconds')) || 0) * 1000;
  return epoch + offsetSeconds;
}

/**
 * Parse epoch from list of possible element attributes, returning the first one
 * that is truthy.
 * @param {!Element} element
 * @param {!Array<string>} dateAttrs list of attribute names
 * @return {?number}
 */
function parseEpoch(element, dateAttrs) {
  // Validate provided dateAttrs outside the loop so it will fail when an
  // invalid attr is provided, even if that attribute isn't present on the
  // element.
  const parsers = dateAttrs.map((attrName) =>
    pureDevAssert(
      dateAttrParsers[attrName],
      `Invalid date attribute "${attrName}"`
    )
  );

  for (let i = 0; i < dateAttrs.length; ++i) {
    const attrVal = element.getAttribute(dateAttrs[i]);
    if (attrVal) {
      return parsers[i](attrVal);
    }
  }

  return null;
}
