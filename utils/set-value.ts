/*!
 * set-value <https://github.com/jonschlinkert/set-value>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

"use strict";

type Options = { separator?: string; split?: Function; merge?: any };

import isPlain from "./is-plain-object.ts";

function set(
  target: any,
  path: string,
  value: any,
  options?: Options,
) {
  if (!isObject(target)) {
    return target;
  }

  let opts = options || {};
  const isArray = Array.isArray(path);
  if (!isArray && typeof path !== "string") {
    return target;
  }

  let merge = opts.merge;
  if (merge && typeof merge !== "function") {
    merge = Object.assign;
  }

  const keys = (isArray ? path : split(path, opts)).filter(isValidKey);
  const len = keys.length;
  const orig = target;

  if (!options && keys.length === 1) {
    result(target, keys[0], value, merge);
    return target;
  }

  for (let i = 0; i < len; i++) {
    let prop = keys[i];

    if (!isObject(target[prop])) {
      // target[prop] = {};
      let nextProp = i + 1 < len ? keys[i + 1] : "";
      let shouldBeArray = !isNaN(+nextProp);
      target[prop] = shouldBeArray ? [] : {};
    }

    if (i === len - 1) {
      result(target, prop, value, merge);
      break;
    }

    target = target[prop];
  }

  return orig;
}

function result(target: any, path: string, value: any, merge: any) {
  if (merge && isPlain(target[path]) && isPlain(value)) {
    target[path] = merge({}, target[path], value);
  } else {
    target[path] = value;
  }
}
function split(
  path: string,
  options?: Options,
) {
  const id = createKey(path, options);
  if (set.memo[id]) return set.memo[id];

  const char = (options && options.separator) ? options.separator : ".";
  let keys = [];
  let res = [];

  if (options && typeof options.split === "function") {
    keys = options.split(path);
  } else {
    keys = path.split(char);
  }

  for (let i = 0; i < keys.length; i++) {
    let prop = keys[i];
    while (prop && prop.slice(-1) === "\\" && keys[i + 1] != null) {
      prop = prop.slice(0, -1) + char + keys[++i];
    }
    res.push(prop);
  }
  set.memo[id] = res;
  return res;
}

function createKey(pattern: string, options?: any) {
  let id = pattern;
  if (typeof options === "undefined") {
    return id + "";
  }
  const keys = Object.keys(options);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    id += ";" + key + "=" + String(options[key]);
  }
  return id;
}

function isValidKey(key: string) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}

function isObject(val: any) {
  return val !== null && (typeof val === "object" || typeof val === "function");
}

set.memo = {} as Record<string, any>;
export { set };
