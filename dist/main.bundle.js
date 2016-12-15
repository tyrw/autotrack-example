/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	// import './analytics.js'
	ga('create', 'UA-XXXXXXXX-1', 'auto');

	console.log(window.ga);

	ga('send', {
	  hitType: 'pageview',
	  page: '/',
	  location: window.location.origin + '/',
	  title: 'Root'
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	// Imports all sub-plugins.
	__webpack_require__(2);
	__webpack_require__(10);
	__webpack_require__(15);
	__webpack_require__(16);
	__webpack_require__(19);
	__webpack_require__(20);
	__webpack_require__(21);
	__webpack_require__(22);
	__webpack_require__(23);

	// Imports the deprecated autotrack plugin for backwards compatibility.
	__webpack_require__(24);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var parseUrl = __webpack_require__(4);
	var constants = __webpack_require__(5);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);


	/**
	 * Registers clean URL tracking on a tracker object. The clean URL tracker
	 * removes query parameters from the page value reported to Google Analytics.
	 * It also helps to prevent tracking similar URLs, e.g. sometimes ending a URL
	 * with a slash and sometimes not.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function CleanUrlTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.CLEAN_URL_TRACKER);

	  this.opts = assign({
	    stripQuery: false,
	    queryDimensionIndex: null,
	    indexFilename: null,
	    trailingSlash: null
	  }, opts);

	  this.tracker = tracker;

	  this.overrideTrackerBuildHitTask();
	}


	/**
	 * Cleans the URL based on the preferences set in the configuration options.
	 * @param {Object} model An analytics.js Model object.
	 */
	CleanUrlTracker.prototype.cleanUrlTask = function(model) {

	  var location = model.get('location');
	  var page = model.get('page');
	  var url = parseUrl(page || location);

	  var oldPath = url.pathname;
	  var newPath = oldPath;

	  // If an index filename was provided, remove it if it appears at the end
	  // of the URL.
	  if (this.opts.indexFilename) {
	    var parts = newPath.split('/');
	    if (this.opts.indexFilename == parts[parts.length - 1]) {
	      parts[parts.length - 1] = '';
	      newPath = parts.join('/');
	    }
	  }

	  // Ensure the URL ends with or doesn't end with slash based on the
	  // `trailingSlash` option. Note that filename URLs should never contain
	  // a trailing slash.
	  if (this.opts.trailingSlash == 'remove') {
	      newPath = newPath.replace(/\/+$/, '');
	  }
	  else if (this.opts.trailingSlash == 'add') {
	    var isFilename = /\.\w+$/.test(newPath);
	    if (!isFilename && newPath.substr(-1) != '/') {
	      newPath = newPath + '/';
	    }
	  }

	  // If a query dimensions index was provided, set the query string portion
	  // of the URL on that dimension. If no query string exists on the URL use
	  // the NULL_DIMENSION.
	  if (this.opts.stripQuery && this.opts.queryDimensionIndex) {
	    model.set('dimension' + this.opts.queryDimensionIndex,
	        url.query || constants.NULL_DIMENSION);
	  }

	  model.set('page', newPath + (!this.opts.stripQuery ? url.search : ''));
	};


	/**
	 * Overrides the tracker's `buildHitTask` to check for proper URL formatting
	 * on every hit (not just the initial pageview).
	 */
	CleanUrlTracker.prototype.overrideTrackerBuildHitTask = function() {
	  this.originalTrackerBuildHitTask = this.tracker.get('buildHitTask');

	  this.tracker.set('buildHitTask', function(model) {
	    this.cleanUrlTask(model);
	    this.originalTrackerBuildHitTask(model);
	  }.bind(this));
	};


	/**
	 * Restores all overridden tasks and methods.
	 */
	CleanUrlTracker.prototype.remove = function() {
	  this.tracker.set('sendHitTask', this.originalTrackerSendHitTask);
	};


	provide('cleanUrlTracker', CleanUrlTracker);


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	var HTTP_PORT = '80';
	var HTTPS_PORT = '443';
	var DEFAULT_PORT = RegExp(':(' + HTTP_PORT + '|' + HTTPS_PORT + ')$');


	var a = document.createElement('a');
	var cache = {};


	/**
	 * Parses the given url and returns an object mimicing a `Location` object.
	 * @param {string} url The url to parse.
	 * @return {Object} An object with the same properties as a `Location`
	 *    plus the convience properties `path` and `query`.
	 */
	module.exports = function parseUrl(url) {

	  // All falsy values (as well as ".") should map to the current URL.
	  url = (!url || url == '.') ? location.href : url;

	  if (cache[url]) return cache[url];

	  a.href = url;

	  // When parsing file relative paths (e.g. `../index.html`), IE will correctly
	  // resolve the `href` property but will keep the `..` in the `path` property.
	  // It will also not include the `host` or `hostname` properties. Furthermore,
	  // IE will sometimes return no protocol or just a colon, especially for things
	  // like relative protocol URLs (e.g. "//google.com").
	  // To workaround all of these issues, we reparse with the full URL from the
	  // `href` property.
	  if (url.charAt(0) == '.' || url.charAt(0) == '/') return parseUrl(a.href);

	  // Don't include default ports.
	  var port = (a.port == HTTP_PORT || a.port == HTTPS_PORT) ? '' : a.port;

	  // PhantomJS sets the port to "0" when using the file: protocol.
	  port = port == '0' ? '' : port;

	  // Sometimes IE incorrectly includes a port for default ports
	  // (e.g. `:80` or `:443`) even when no port is specified in the URL.
	  // http://bit.ly/1rQNoMg
	  var host = a.host.replace(DEFAULT_PORT, '');

	  // Not all browser support `origin` so we have to build it.
	  var origin = a.origin ? a.origin : a.protocol + '//' + host;

	  // Sometimes IE doesn't include the leading slash for pathname.
	  // http://bit.ly/1rQNoMg
	  var pathname = a.pathname.charAt(0) == '/' ? a.pathname : '/' + a.pathname;

	  return cache[url] = {
	    hash: a.hash,
	    host: host,
	    hostname: a.hostname,
	    href: a.href,
	    origin: origin,
	    pathname: pathname,
	    port: port,
	    protocol: a.protocol,
	    search: a.search,

	    // Expose additional helpful properties not part of the Location object.
	    fragment: a.hash.slice(1), // The hash without the starting "#".
	    path: pathname + a.search, // The pathname and the search query (w/o hash).
	    query: a.search.slice(1) // The search without the starting "?".
	  };
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	module.exports = {
	  VERSION: '1.0.0',
	  DEV_ID: 'i5iSjo',

	  VERSION_PARAM: '&_av',
	  USAGE_PARAM: '&_au',

	  NULL_DIMENSION: '(not set)'
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var constants = __webpack_require__(5);
	var utilities = __webpack_require__(7);


	// Adds the dev ID to the list of dev IDs if any plugin is used.
	(window.gaDevIds = window.gaDevIds || []).push(constants.DEV_ID);


	/**
	 * Provides a plugin for use with analytics.js, accounting for the possibility
	 * that the global command queue has been renamed or not yet defined.
	 * @param {string} pluginName The plugin name identifier.
	 * @param {Function} pluginConstructor The plugin constructor function.
	 */
	module.exports = function providePlugin(pluginName, pluginConstructor) {
	  var gaAlias = window['GoogleAnalyticsObject'] || 'ga';
	  window[gaAlias] = window[gaAlias] || function() {
	    (window[gaAlias]['q'] = window[gaAlias]['q'] || []).push(arguments);
	  };

	  // Formally provides the plugin for use with analytics.js.
	  window[gaAlias]('provide', pluginName, pluginConstructor);

	  // Registers the plugin on the global gaplugins object.
	  window.gaplugins = window.gaplugins || {};
	  window.gaplugins[utilities.capitalize(pluginName)] = pluginConstructor;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var getAttributes = __webpack_require__(8);


	var utilities = {


	  /**
	   * Accepts default and user override fields and an optional tracker, hit
	   * filter, and target element and returns a single object that can be used in
	   * `ga('send', ...)` commands.
	   * @param {Object} defaultFields The default fields to return.
	   * @param {Object} userFields Fields set by the user to override the defaults.
	   * @param {Object} opt_tracker The tracker object to apply the hit filter to.
	   * @param {Function} opt_hitFilter A filter function that gets
	   *     called with the tracker model right before the `buildHitTask`. It can
	   *     be used to modify the model for the current hit only.
	   * @param {Element} opt_target If the hit originated from an interaction
	   *     with a DOM element, hitFilter is invoked with that element as the
	   *     second argument.
	   * @return {Object} The final fields object.
	   */
	  createFieldsObj: function(
	      defaultFields, userFields, opt_tracker, opt_hitFilter, opt_target) {

	    if (typeof opt_hitFilter == 'function') {
	      var originalBuildHitTask = opt_tracker.get('buildHitTask');
	      return {
	        buildHitTask: function(model) {
	          model.set(defaultFields, null, true);
	          model.set(userFields, null, true);
	          opt_hitFilter(model, opt_target);
	          originalBuildHitTask(model);
	        }
	      };
	    }
	    else {
	      return assign({}, defaultFields, userFields);
	    }
	  },


	  /**
	   * Retrieves the attributes from an DOM element and returns a fields object
	   * for all attributes matching the passed prefix string.
	   * @param {Element} element The DOM element to get attributes from.
	   * @param {string} prefix An attribute prefix. Only the attributes matching
	   *     the prefix will be returned on the fields object.
	   * @return {Object} An object of analytics.js fields and values
	   */
	  getAttributeFields: function(element, prefix) {
	    var attributes = getAttributes(element);
	    var attributeFields = {};

	    Object.keys(attributes).forEach(function(attribute) {

	      // The `on` prefix is used for event handling but isn't a field.
	      if (attribute.indexOf(prefix) === 0 && attribute != prefix + 'on') {

	        var value = attributes[attribute];

	        // Detects Boolean value strings.
	        if (value == 'true') value = true;
	        if (value == 'false') value = false;

	        var field = utilities.camelCase(attribute.slice(prefix.length));
	        attributeFields[field] = value;
	      }
	    });

	    return attributeFields;
	  },


	  domReady: function(callback) {
	    if (document.readyState == 'loading') {
	      document.addEventListener('DOMContentLoaded', function fn() {
	        document.removeEventListener('DOMContentLoaded', fn);
	        callback();
	      });
	    } else {
	      callback();
	    }
	  },


	  /**
	   * Accepts a function and returns a wrapped version of the function that is
	   * expected to be called elsewhere in the system. If it's not called
	   * elsewhere after the timeout period, it's called regardless. The wrapper
	   * function also prevents the callback from being called more than once.
	   * @param {Function} callback The function to call.
	   * @param {number} wait How many milliseconds to wait before invoking
	   *     the callback.
	   * @returns {Function} The wrapped version of the passed function.
	   */
	  withTimeout: function(callback, wait) {
	    var called = false;
	    setTimeout(callback, wait || 2000);
	    return function() {
	      if (!called) {
	        called = true;
	        callback();
	      }
	    };
	  },


	  /**
	   * Accepts a string containing hyphen or underscore word separators and
	   * converts it to camelCase.
	   * @param {string} str The string to camelCase.
	   * @return {string} The camelCased version of the string.
	   */
	  camelCase: function(str) {
	    return str.replace(/[\-\_]+(\w?)/g, function(match, p1) {
	      return p1.toUpperCase();
	    });
	  },


	  /**
	   * Capitalizes the first letter of a string.
	   * @param {string} str The input string.
	   * @return {string} The capitalized string
	   */
	  capitalize: function(str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	  },


	  /**
	   * Indicates whether the passed variable is a JavaScript object.
	   * @param {*} value The input variable to test.
	   * @return {boolean} Whether or not the test is an object.
	   */
	  isObject: function(value) {
	    return typeof value == 'object' && value !== null;
	  },


	  /**
	   * Indicates whether the passed variable is a JavaScript array.
	   * @param {*} value The input variable to test.
	   * @return {boolean} Whether or not the value is an array.
	   */
	  isArray: Array.isArray || function(value) {
	    return Object.prototype.toString.call(value) === '[object Array]';
	  },


	  /**
	   * Accepts a value that may or may not be an array. If it is not an array,
	   * it is returned as the first item in a single-item array.
	   * @param {*} value The value to convert to an array if it is not.
	   * @return {Array} The array-ified value.
	   */
	  toArray: function(value) {
	    return utilities.isArray(value) ? value : [value];
	  }
	};

	module.exports = utilities;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * Gets all attributes of an element as a plain JavaScriot object.
	 * @param {Element} element The element whose attributes to get.
	 * @return {Object} An object whose keys are the attribute keys and whose
	 *     values are the attribute values. If no attributes exist, an empty
	 *     object is returned.
	 */
	module.exports = function getAttributes(element) {
	  var attrs = {};

	  // Validate input.
	  if (!(element && element.nodeType == 1)) return attrs;

	  // Return an empty object if there are no attributes.
	  var map = element.attributes;
	  if (map.length === 0) return {};

	  for (var i = 0, attr; attr = map[i]; i++) {
	    attrs[attr.name] = attr.value;
	  }
	  return attrs;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var constants = __webpack_require__(5);


	var plugins = {
	  CLEAN_URL_TRACKER: 1,
	  EVENT_TRACKER: 2,
	  IMPRESSION_TRACKER: 3,
	  MEDIA_QUERY_TRACKER: 4,
	  OUTBOUND_FORM_TRACKER: 5,
	  OUTBOUND_LINK_TRACKER: 6,
	  PAGE_VISIBILITY_TRACKER: 7,
	  SOCIAL_WIDGET_TRACKER: 8,
	  URL_CHANGE_TRACKER: 9
	};
	var PLUGIN_COUNT = 9;


	/**
	 * Converts a hexadecimal string to a binary string.
	 * @param {string} hex A hexadecimal numeric string.
	 * @return {string} a binary numeric string.
	 */
	function convertHexToBin(hex) {
	  return parseInt(hex || '0', 16).toString(2);
	}


	/**
	 * Converts a binary string to a hexadecimal string.
	 * @param {string} bin A binary numeric string.
	 * @return {string} a hexadecimal numeric string.
	 */
	function convertBinToHex(bin) {
	  return parseInt(bin || '0', 2).toString(16);
	}


	/**
	 * Adds leading zeros to a string if it's less than a minimum length.
	 * @param {string} str A string to pad.
	 * @param {number} len The minimum length of the string
	 * @return {string} The padded string.
	 */
	function padZeros(str, len) {
	  if (str.length < len) {
	    var toAdd = len - str.length;
	    while (toAdd) {
	      str = '0' + str;
	      toAdd--;
	    }
	  }
	  return str;
	}


	/**
	 * Accepts a binary numeric string and flips the digit from 0 to 1 at the
	 * specified index.
	 * @param {string} str The binary numeric string.
	 * @param {number} index The index to flip the bit.
	 * @return {string} The new binary string with the bit flipped on
	 */
	function flipBitOn(str, index) {
	  return str.substr(0, index) + 1 + str.substr(index + 1);
	}


	/**
	 * Accepts a tracker and a plugin index and flips the bit at the specified
	 * index on the tracker's usage parameter.
	 * @param {Object} tracker An analytics.js tracker.
	 * @param {number} pluginIndex The index of the plugin in the global list.
	 */
	function trackPlugin(tracker, pluginIndex) {
	  var usageHex = tracker.get(constants.USAGE_PARAM);
	  var usageBin = padZeros(convertHexToBin(usageHex), PLUGIN_COUNT);

	  // Flip the bit of the plugin being tracked.
	  usageBin = flipBitOn(usageBin, PLUGIN_COUNT - pluginIndex);

	  // Stores the modified usage string back on the tracker.
	  tracker.set(constants.USAGE_PARAM, convertBinToHex(usageBin));
	}


	/**
	 * Accepts a tracker and adds the current version to the version param.
	 * @param {Object} tracker An analytics.js tracker.
	 */
	function trackVersion(tracker) {
	  tracker.set(constants.VERSION_PARAM, constants.VERSION);
	}


	module.exports = {
	  track: function(tracker, plugin) {
	    trackVersion(tracker);
	    trackPlugin(tracker, plugin);
	  },
	  plugins: plugins
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var delegate = __webpack_require__(11);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var getAttributeFields = __webpack_require__(7).getAttributeFields;


	/**
	 * Registers declarative event tracking.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function EventTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.EVENT_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.addEventListener) return;

	  this.opts = assign({
	    events: ['click'],
	    fieldsObj: {},
	    attributePrefix: 'ga-',
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  // Binds methods.
	  this.handleEvents = this.handleEvents.bind(this);

	  var selector = '[' + this.opts.attributePrefix + 'on]';

	  // Creates a mapping of events to their delegates
	  this.delegates = {};
	  this.opts.events.forEach(function(event) {
	    this.delegates[event] = delegate(document, event, selector,
	        this.handleEvents, {composed: true, useCapture: true});
	  }.bind(this));
	}


	/**
	 * Handles all clicks on elements with event attributes.
	 * @param {Event} event The DOM click event.
	 * @param {Element} element The delegated DOM element target.
	 */
	EventTracker.prototype.handleEvents = function(event, element) {

	  var prefix = this.opts.attributePrefix;

	  // Ensures the event type matches the one specified on the element.
	  if (event.type != element.getAttribute(prefix + 'on')) return;

	  var defaultFields = {transport: 'beacon'};
	  var attributeFields = getAttributeFields(element, prefix);
	  var userFields = assign({}, this.opts.fieldsObj, attributeFields);
	  var hitType = attributeFields.hitType || 'event';

	  this.tracker.send(hitType, createFieldsObj(
	      defaultFields, userFields, this.tracker, this.opts.hitFilter, element));
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	EventTracker.prototype.remove = function() {
	  Object.keys(this.delegates).forEach(function(key) {
	    this.delegates[key].destroy();
	  }.bind(this));
	};


	provide('eventTracker', EventTracker);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var closest = __webpack_require__(12);
	var matches = __webpack_require__(13);

	/**
	 * Delegates the handling of events for an element matching a selector to an
	 * ancestor of the matching element.
	 * @param {Element} ancestor The ancestor element to add the listener to.
	 * @param {string} eventType The event type to listen to.
	 * @param {string} selector A CSS selector to match against child elements.
	 * @param {Function} callback A function to run any time the event happens.
	 * @param {Object} opts A configuration options object. The available options:
	 *     - useCapture<boolean>: If true, bind to the event capture phase.
	 *     - deep<boolean>: If true, delegate into shadow trees.
	 * @return {Object} The delegate object. It contains a destroy method.
	 */
	 module.exports = function delegate(
	    ancestor, eventType, selector, callback, opts) {

	  opts = opts || {};

	  // Defines the event listener.
	  var listener = function(event) {

	    // If opts.composed is true and the event originated from inside a Shadow
	    // tree, check the composed path nodes.
	    if (opts.composed && typeof event.composedPath == 'function') {
	      var composedPath = event.composedPath();
	      for (var i = 0, node; node = composedPath[i]; i++) {
	        if (node.nodeType == 1 && matches(node, selector)) {
	          delegateTarget = node;
	        }
	      }
	    }
	    // Otherwise check the parents.
	    else {
	      var delegateTarget = closest(event.target, selector, true);
	    }

	    if (delegateTarget) {
	      callback.call(delegateTarget, event, delegateTarget);
	    }
	  };

	  ancestor.addEventListener(eventType, listener, opts.useCapture);

	  return {
	    destroy: function() {
	      ancestor.removeEventListener(eventType, listener, opts.useCapture);
	    }
	  };
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var matches = __webpack_require__(13);
	var parents = __webpack_require__(14);

	/**
	 * Gets the closest parent element that matches the passed selector.
	 * @param {Element} element The element whose parents to check.
	 * @param {string} selector The CSS selector to match against.
	 * @param {boolean} shouldCheckSelf True if the selector should test against
	 *     the passed element itself.
	 * @return {?Element} The matching element or undefined.
	 */
	module.exports = function closest(element, selector, shouldCheckSelf) {
	  if (!(element && element.nodeType == 1 && selector)) return;

	  var parentElements =
	      (shouldCheckSelf ? [element] : []).concat(parents(element));

	  for (var i = 0, parent; parent = parentElements[i]; i++) {
	    if (matches(parent, selector)) return parent;
	  }
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	var proto = window.Element.prototype;
	var nativeMatches = proto.matches ||
	    proto.matchesSelector ||
	    proto.webkitMatchesSelector ||
	    proto.mozMatchesSelector ||
	    proto.msMatchesSelector ||
	    proto.oMatchesSelector;


	/**
	 * Tests whether a DOM element matches a selector. This polyfills the native
	 * Element.prototype.matches method across browsers.
	 * @param {Element} element The DOM element to test.
	 * @param {string} selector The CSS selector to test element against.
	 * @return {boolean} True if the selector matches.
	 */
	 function matchesSelector(element, selector) {
	  if (typeof selector != 'string') return false;
	  if (nativeMatches) return nativeMatches.call(element, selector);
	  var nodes = element.parentNode.querySelectorAll(selector);
	  for (var i = 0, node; node = nodes[i]; i++) {
	    if (node == element) return true;
	  }
	  return false;
	}


	/**
	 * Tests if a DOM elements matches any of the test DOM elements or selectors.
	 * @param {Element} element The DOM element to test.
	 * @param {Element|string|Array<Element|String>} test A DOM element, a CSS
	 *     selector, or an array of DOM elements or CSS selectors to match against.
	 * @return {boolean} True of any part of the test matches.
	 */
	module.exports = function matches(element, test) {
	  // Validate input.
	  if (element && element.nodeType == 1 && test) {
	    // if test is a string or DOM element test it.
	    if (typeof test == 'string' || test.nodeType == 1) {
	      return element == test || matchesSelector(element, test);
	    }
	    // if it has a length property iterate over the items
	    // and return true if any match.
	    else if ('length' in test) {
	      for (var i = 0, item; item = test[i]; i++) {
	        if (element == item || matchesSelector(element, item)) return true;
	      }
	    }
	  }
	  // Still here? Return false
	  return false;
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Returns an array of a DOM element's parent elements.
	 * @param {Element} element The DOM element whose parents to get.
	 * @return {Array} An array of all parent elemets, or an empty array if no
	 *     parent elements are found.
	 */
	module.exports = function parents(element) {
	  var list = [];
	  while (element && element.parentNode && element.parentNode.nodeType == 1) {
	    list.push(element = element.parentNode);
	  }
	  return list;
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var domReady = __webpack_require__(7).domReady;
	var getAttributeFields = __webpack_require__(7).getAttributeFields;


	/**
	 * Registers impression tracking.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function ImpressionTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.IMPRESSION_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!(window.IntersectionObserver && window.MutationObserver)) return;

	  this.opts = assign({
	    elements: [],
	    rootMargin: '0px',
	    fieldsObj: {},
	    attributePrefix: 'ga-',
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  // Binds methods.
	  this.handleDomMutations = this.handleDomMutations.bind(this);
	  this.walkNodeTree = this.walkNodeTree.bind(this);
	  this.handleIntersectionChanges = this.handleIntersectionChanges.bind(this);
	  this.startObserving = this.startObserving.bind(this);
	  this.observeElement = this.observeElement.bind(this);
	  this.handleDomElementRemoved = this.handleDomElementRemoved.bind(this);

	  var data = this.deriveDataFromConfigOptions();

	  // The primary list of elements to observe. Each item contains the
	  // element ID, threshold, and whether it's currently in-view.
	  this.items = data.items;

	  // A hash map of elements contained in the items array.
	  this.elementMap = data.elementMap;

	  // A sorted list of threshold values contained in the items array.
	  this.threshold = data.threshold;

	  this.intersectionObserver = this.initIntersectionObserver();
	  this.mutationObserver = this.initMutationObserver();

	  // Once the DOM is ready, start observing for changes.
	  domReady(this.startObserving);
	}


	/**
	 * Loops through each element in the `elements` configuration option and
	 * creates a map of element IDs currently being observed, a list of "items"
	 * (which contains each element's `threshold` and `trackFirstImpressionOnly`
	 * property), and a list of `threshold` values to pass to the
	 * `IntersectionObserver` instance.
	 * @return {Object} An object with the properties `items`, `elementMap`
	 *     and `threshold`.
	 */
	ImpressionTracker.prototype.deriveDataFromConfigOptions = function() {
	  var items = [];
	  var threshold = [];

	  // A map of element IDs in the `items` array to DOM elements in the document.
	  // The presence of a key indicates that the element ID is in the `items`
	  // array, and the presence of an element value indicates that the element
	  // is in the DOM.
	  var elementMap = {};

	  this.opts.elements.forEach(function(item) {
	    // The item can be just a string if it's OK with all the defaults.
	    if (typeof item == 'string') item = {id: item};

	    items.push(item = assign({
	      threshold: 0,
	      trackFirstImpressionOnly: true
	    }, item));

	    elementMap[item.id] = null;
	    threshold.push(item.threshold);
	  });

	  return {
	    items: items,
	    elementMap: elementMap,
	    threshold: threshold
	  };
	};


	/**
	 * Initializes a new `MutationObsever` instance and registers the callback.
	 * @return {MutationObserver} The new MutationObserver instance.
	 */
	ImpressionTracker.prototype.initMutationObserver = function() {
	  return new MutationObserver(this.handleDomMutations);
	};


	/**
	 * Initializes a new `IntersectionObsever` instance with the appropriate
	 * options and registers the callback.
	 * @return {IntersectionObserver} The newly created instance.
	 */
	ImpressionTracker.prototype.initIntersectionObserver = function() {
	  return new IntersectionObserver(this.handleIntersectionChanges, {
	    rootMargin: this.opts.rootMargin,
	    threshold: this.threshold
	  });
	};


	/**
	 * Starts observing each eleemnt to intersections as well as the entire DOM
	 * for node changes.
	 */
	ImpressionTracker.prototype.startObserving = function() {
	  // Start observing elements for intersections.
	  Object.keys(this.elementMap).forEach(this.observeElement);

	  // Start observing the DOM for added and removed elements.
	  this.mutationObserver.observe(document.body, {
	    childList: true,
	    subtree: true
	  });

	  // TODO(philipwalton): Remove temporary hack to force a new frame
	  // immediately after adding observers.
	  // https://bugs.chromium.org/p/chromium/issues/detail?id=612323
	  requestAnimationFrame(function() {});
	};


	/**
	 * Adds an element to the `elementMap` map and registers it for observation
	 * on `this.intersectionObserver`.
	 * @param {string} id The ID of the element to observe.
	 */
	ImpressionTracker.prototype.observeElement = function(id) {
	  var element = this.elementMap[id] ||
	      (this.elementMap[id] = document.getElementById(id));

	  if (element) this.intersectionObserver.observe(element);
	};


	/**
	 * Handles nodes being added or removed from the DOM. This function is passed
	 * as the callback to `this.mutationObserver`.
	 * @param {Array} mutations A list of `MutationRecord` instances
	 */
	ImpressionTracker.prototype.handleDomMutations = function(mutations) {
	  for (var i = 0, mutation; mutation = mutations[i]; i++) {
	    // Handles removed elements.
	    for (var k = 0, removedEl; removedEl = mutation.removedNodes[k]; k++) {
	      this.walkNodeTree(removedEl, this.handleDomElementRemoved);
	    }
	    // Handles added elements.
	    for (var j = 0, addedEl; addedEl = mutation.addedNodes[j]; j++) {
	      this.walkNodeTree(addedEl, this.observeElement);
	    }
	  }
	};


	/**
	 * Iterates through all descendents of a DOM node and invokes the passed
	 * callback if any of them match an elememt in `elementMap`.
	 * @param {Node} node The DOM node to walk.
	 * @param {Function} callback A function to be invoked if a match is found.
	 */
	ImpressionTracker.prototype.walkNodeTree = function(node, callback) {
	  if (node.nodeType == 1 && node.id in this.elementMap) {
	    callback(node.id);
	  }
	  for (var i = 0, child; child = node.childNodes[i]; i++) {
	    this.walkNodeTree(child, callback);
	  }
	};


	/**
	 * Handles intersection changes. This function is passed as the callback to
	 * `this.intersectionObserver`
	 * @param {Array} records A list of `IntersectionObserverEntry` records.
	 */
	ImpressionTracker.prototype.handleIntersectionChanges = function(records) {
	  for (var i = 0, record; record = records[i]; i++) {
	    for (var j = 0, item; item = this.items[j]; j++) {
	      if (record.target.id !== item.id) continue;

	      if (isTargetVisible(item.threshold, record)) {
	        this.handleImpression(item.id);

	        if (item.trackFirstImpressionOnly) {
	          this.items.splice(j, 1);
	          j--;
	          this.possiblyUnobserveElement(item.id);
	        }
	      }
	    }
	  }

	  // If all items have been removed, remove the plugin.
	  if (this.items.length === 0) this.remove();
	};


	/**
	 * Sends a hit to Google Analytics with the impression data.
	 * @param {string} id The ID of the element making the impression.
	 */
	ImpressionTracker.prototype.handleImpression = function(id) {
	  var element = document.getElementById(id);

	  var defaultFields = {
	    transport: 'beacon',
	    eventCategory: 'Viewport',
	    eventAction: 'impression',
	    eventLabel: id
	  };

	  var userFields = assign({}, this.opts.fieldsObj,
	      getAttributeFields(element, this.opts.attributePrefix));

	  this.tracker.send('event', createFieldsObj(defaultFields,
	      userFields, this.tracker, this.opts.hitFilter, element));
	};


	/**
	 * Inspects the `items` array after an item was removed. If the removed
	 * item's element ID is not found in any other item, the element stops being
	 * observed for intersection changes and is removed from `elementMap`.
	 * @param {string} id The element ID to check for possible unobservation.
	 */
	ImpressionTracker.prototype.possiblyUnobserveElement = function(id) {
	  if (!this.itemsIncludesId(id)) {
	    this.intersectionObserver.unobserve(this.elementMap[id]);
	    delete this.elementMap[id];
	  }
	};


	/**
	 * Handles an element currently being observed for intersections being removed
	 * from the DOM.
	 * @param {string} id The ID of the element that was removed.
	 */
	ImpressionTracker.prototype.handleDomElementRemoved = function(id) {
	  this.intersectionObserver.unobserve(this.elementMap[id]);
	  this.elementMap[id] = null;
	};


	/**
	 * Scans the `items` array for the presense of an item with the passed ID.
	 * @param {string} id The ID of the element to search for.
	 * @return {boolean} True if the element ID was found in one of the items.
	 */
	ImpressionTracker.prototype.itemsIncludesId = function(id) {
	  return this.items.some(function(item) {
	    return id == item.id;
	  });
	};


	/**
	 * Removes all listeners and observers.
	 */
	ImpressionTracker.prototype.remove = function() {
	  this.mutationObserver.disconnect();
	  this.intersectionObserver.disconnect();
	};


	provide('impressionTracker', ImpressionTracker);


	/**
	 * Detects whether or not an intersection record represents a visible target
	 * given a particular threshold.
	 * @param {number} threshold The threshold the target is visible above.
	 * @param {IntersectionObserverEntry} record The most recent record entry.
	 * @return {boolean} True if the target is visible.
	 */
	function isTargetVisible(threshold, record) {
	  if (threshold === 0) {
	    var i = record.intersectionRect;
	    return i.top > 0 || i.bottom > 0 || i.left > 0 || i.right > 0;
	  }
	  else {
	    return record.intersectionRatio >= threshold;
	  }
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var debounce = __webpack_require__(17);
	var constants = __webpack_require__(5);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var isObject = __webpack_require__(7).isObject;
	var toArray = __webpack_require__(7).toArray;


	/**
	 * Declares the MediaQueryListener instance cache.
	 */
	var mediaMap = {};


	/**
	 * Registers media query tracking.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function MediaQueryTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.MEDIA_QUERY_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.matchMedia) return;

	  this.opts = assign({
	    definitions: null,
	    changeTemplate: this.changeTemplate,
	    changeTimeout: 1000,
	    fieldsObj: {},
	    hitFilter: null
	  }, opts);

	  // Exits early if media query data doesn't exist.
	  if (!isObject(this.opts.definitions)) return;

	  this.opts.definitions = toArray(this.opts.definitions);
	  this.tracker = tracker;
	  this.changeListeners = [];

	  this.processMediaQueries();
	}


	/**
	 * Loops through each media query definition, sets the custom dimenion data,
	 * and adds the change listeners.
	 */
	MediaQueryTracker.prototype.processMediaQueries = function() {
	  this.opts.definitions.forEach(function(definition) {
	    // Only processes definitions with a name and index.
	    if (definition.name && definition.dimensionIndex) {
	      var mediaName = this.getMatchName(definition);
	      this.tracker.set('dimension' + definition.dimensionIndex, mediaName);

	      this.addChangeListeners(definition);
	    }
	  }.bind(this));
	};


	/**
	 * Takes a definition object and return the name of the matching media item.
	 * If no match is found, the NULL_DIMENSION value is returned.
	 * @param {Object} definition A set of named media queries associated
	 *     with a single custom dimension.
	 * @return {string} The name of the matched media or NULL_DIMENSION.
	 */
	MediaQueryTracker.prototype.getMatchName = function(definition) {
	  var match;

	  definition.items.forEach(function(item) {
	    if (getMediaListener(item.media).matches) {
	      match = item;
	    }
	  });
	  return match ? match.name : constants.NULL_DIMENSION;
	};


	/**
	 * Adds change listeners to each media query in the definition list.
	 * Debounces the changes to prevent unnecessary hits from being sent.
	 * @param {Object} definition A set of named media queries associated
	 *     with a single custom dimension
	 */
	MediaQueryTracker.prototype.addChangeListeners = function(definition) {
	  definition.items.forEach(function(item) {
	    var mql = getMediaListener(item.media);
	    var fn = debounce(function() {
	      this.handleChanges(definition);
	    }.bind(this), this.opts.changeTimeout);

	    mql.addListener(fn);
	    this.changeListeners.push({mql: mql, fn: fn});
	  }.bind(this));
	};


	/**
	 * Handles changes to the matched media. When the new value differs from
	 * the old value, a change event is sent.
	 * @param {Object} definition A set of named media queries associated
	 *     with a single custom dimension
	 */
	MediaQueryTracker.prototype.handleChanges = function(definition) {
	  var newValue = this.getMatchName(definition);
	  var oldValue = this.tracker.get('dimension' + definition.dimensionIndex);

	  if (newValue !== oldValue) {
	    this.tracker.set('dimension' + definition.dimensionIndex, newValue);

	    var defaultFields = {
	      eventCategory: definition.name,
	      eventAction: 'change',
	      eventLabel: this.opts.changeTemplate(oldValue, newValue)
	    };
	    this.tracker.send('event', createFieldsObj(
	        defaultFields, this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	  }
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	MediaQueryTracker.prototype.remove = function() {
	  for (var i = 0, listener; listener = this.changeListeners[i]; i++) {
	    listener.mql.removeListener(listener.fn);
	  }
	};


	/**
	 * Sets the default formatting of the change event label.
	 * This can be overridden by setting the `changeTemplate` option.
	 * @param {string} oldValue The value of the media query prior to the change.
	 * @param {string} newValue The value of the media query after the change.
	 * @return {string} The formatted event label.
	 */
	MediaQueryTracker.prototype.changeTemplate = function(oldValue, newValue) {
	  return oldValue + ' => ' + newValue;
	};


	/**
	 * Accepts a media query and returns a MediaQueryListener object.
	 * Caches the values to avoid multiple unnecessary instances.
	 * @param {string} media A media query value.
	 * @return {MediaQueryListener} The matched media.
	 */
	function getMediaListener(media) {
	  // Returns early if the media is cached.
	  if (mediaMap[media]) return mediaMap[media];

	  mediaMap[media] = window.matchMedia(media);
	  return mediaMap[media];
	}


	provide('mediaQueryTracker', MediaQueryTracker);


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var now = __webpack_require__(18);

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing.
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */

	module.exports = function debounce(func, wait, immediate){
	  var timeout, args, context, timestamp, result;
	  if (null == wait) wait = 100;

	  function later() {
	    var last = now() - timestamp;

	    if (last < wait && last > 0) {
	      timeout = setTimeout(later, wait - last);
	    } else {
	      timeout = null;
	      if (!immediate) {
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      }
	    }
	  };

	  return function debounced() {
	    context = this;
	    args = arguments;
	    timestamp = now();
	    var callNow = immediate && !timeout;
	    if (!timeout) timeout = setTimeout(later, wait);
	    if (callNow) {
	      result = func.apply(context, args);
	      context = args = null;
	    }

	    return result;
	  };
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = Date.now || now

	function now() {
	    return new Date().getTime()
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var delegate = __webpack_require__(11);
	var parseUrl = __webpack_require__(4);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var getAttributeFields = __webpack_require__(7).getAttributeFields;
	var withTimeout = __webpack_require__(7).withTimeout;


	/**
	 * Registers outbound form tracking.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function OutboundFormTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.OUTBOUND_FORM_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.addEventListener) return;

	  this.opts = assign({
	    formSelector: 'form',
	    shouldTrackOutboundForm: this.shouldTrackOutboundForm,
	    fieldsObj: {},
	    attributePrefix: 'ga-',
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  this.delegate = delegate(document, 'submit', 'form',
	      this.handleFormSubmits.bind(this), {composed: true, useCapture: true});
	}


	/**
	 * Handles all submits on form elements. A form submit is considered outbound
	 * if its action attribute starts with http and does not contain
	 * location.hostname.
	 * When the beacon transport method is not available, the event's default
	 * action is prevented and re-emitted after the hit is sent.
	 * @param {Event} event The DOM submit event.
	 * @param {Element} form The delegated event target.
	 */
	OutboundFormTracker.prototype.handleFormSubmits = function(event, form) {

	  var action = parseUrl(form.action).href;
	  var defaultFields = {
	    transport: 'beacon',
	    eventCategory: 'Outbound Form',
	    eventAction: 'submit',
	    eventLabel: action
	  };

	  if (this.opts.shouldTrackOutboundForm(form, parseUrl)) {

	    if (!navigator.sendBeacon) {
	      // Stops the submit and waits until the hit is complete (with timeout)
	      // for browsers that don't support beacon.
	      event.preventDefault();
	      defaultFields.hitCallback = withTimeout(function() {
	        form.submit();
	      });
	    }

	    var userFields = assign({}, this.opts.fieldsObj,
	        getAttributeFields(form, this.opts.attributePrefix));

	    this.tracker.send('event', createFieldsObj(
	        defaultFields, userFields, this.tracker, this.opts.hitFilter, form));
	  }
	};


	/**
	 * Determines whether or not the tracker should send a hit when a form is
	 * submitted. By default, forms with an action attribute that starts with
	 * "http" and doesn't contain the current hostname are tracked.
	 * @param {Element} form The form that was submitted.
	 * @param {Function} parseUrl A cross-browser utility method for url parsing.
	 * @return {boolean} Whether or not the form should be tracked.
	 */
	OutboundFormTracker.prototype.shouldTrackOutboundForm =
	    function(form, parseUrl) {

	  var url = parseUrl(form.action);
	  return url.hostname != location.hostname &&
	      url.protocol.slice(0, 4) == 'http';
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	OutboundFormTracker.prototype.remove = function() {
	  this.delegate.destroy();
	};


	provide('outboundFormTracker', OutboundFormTracker);


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var delegate = __webpack_require__(11);
	var parseUrl = __webpack_require__(4);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var getAttributeFields = __webpack_require__(7).getAttributeFields;


	/**
	 * Registers outbound link tracking on a tracker object.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function OutboundLinkTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.OUTBOUND_LINK_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.addEventListener) return;

	  this.opts = assign({
	    events: ['click'],
	    linkSelector: 'a',
	    shouldTrackOutboundLink: this.shouldTrackOutboundLink,
	    fieldsObj: {},
	    attributePrefix: 'ga-',
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  // Binds methods.
	  this.handleLinkInteractions = this.handleLinkInteractions.bind(this);

	  // Creates a mapping of events to their delegates
	  this.delegates = {};
	  this.opts.events.forEach(function(event) {
	    this.delegates[event] = delegate(document, event, this.opts.linkSelector,
	        this.handleLinkInteractions, {composed: true, useCapture: true});
	  }.bind(this));
	}


	/**
	 * Handles all interactions on link elements. A link is considered an outbound
	 * link if its hostname property does not match location.hostname. When the
	 * beacon transport method is not available, the links target is set to
	 * "_blank" to ensure the hit can be sent.
	 * @param {Event} event The DOM click event.
	 * @param {Element} link The delegated event target.
	 */
	OutboundLinkTracker.prototype.handleLinkInteractions = function(event, link) {

	  if (this.opts.shouldTrackOutboundLink(link, parseUrl)) {
	    // Opens outbound links in a new tab if the browser doesn't support
	    // the beacon transport method.
	    if (!navigator.sendBeacon) {
	      link.target = '_blank';
	    }

	    var defaultFields = {
	      transport: 'beacon',
	      eventCategory: 'Outbound Link',
	      eventAction: event.type,
	      eventLabel: link.href
	    };

	    var userFields = assign({}, this.opts.fieldsObj,
	        getAttributeFields(link, this.opts.attributePrefix));

	    this.tracker.send('event', createFieldsObj(
	        defaultFields, userFields, this.tracker, this.opts.hitFilter, link));
	  }
	};


	/**
	 * Determines whether or not the tracker should send a hit when a link is
	 * clicked. By default links with a hostname property not equal to the current
	 * hostname are tracked.
	 * @param {Element} link The link that was clicked on.
	 * @param {Function} parseUrl A cross-browser utility method for url parsing.
	 * @return {boolean} Whether or not the link should be tracked.
	 */
	OutboundLinkTracker.prototype.shouldTrackOutboundLink =
	    function(link, parseUrl) {

	  var url = parseUrl(link.href);
	  return url.hostname != location.hostname &&
	      url.protocol.slice(0, 4) == 'http';
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	OutboundLinkTracker.prototype.remove = function() {
	  Object.keys(this.delegates).forEach(function(key) {
	    this.delegates[key].destroy();
	  }.bind(this));
	};


	provide('outboundLinkTracker', OutboundLinkTracker);


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var isObject = __webpack_require__(7).isObject;


	var DEFAULT_SESSION_TIMEOUT = 30; // 30 minutes.


	/**
	 * Registers outbound link tracking on tracker object.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function PageVisibilityTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.PAGE_VISIBILITY_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.addEventListener) return;

	  this.opts = assign({
	    sessionTimeout: DEFAULT_SESSION_TIMEOUT,
	    changeTemplate: this.changeTemplate,
	    hiddenMetricIndex: null,
	    visibleMetricIndex: null,
	    fieldsObj: {},
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;
	  this.visibilityState = document.visibilityState;

	  // Consider the plugin creation to be the start of the visibility change
	  // time calculations.
	  this.lastVisibilityChangeTime = +new Date;

	  // Binds methods to `this`.
	  this.handleVisibilityStateChange =
	      this.handleVisibilityStateChange.bind(this);

	  this.overrideTrackerSendMethod();
	  this.overrideTrackerSendHitTask();

	  document.addEventListener(
	      'visibilitychange', this.handleVisibilityStateChange);
	}


	/**
	 * Handles changes to `document.visibilityState`. This method sends events when
	 * the visibility state changes during active sessions (active meaning the
	 * session has not timed out). If the session has timed out, a return to a
	 * visibility state of visible will trigger a new pageview (instead of a
	 * visibility change event). Lastly, this method keeps track of the elapsed
	 * time a document's visibility state was visible and sends that as the event
	 * value for hidden events, allowing you to more accurately derive how long
	 * a user spent active during a session.
	 */
	PageVisibilityTracker.prototype.handleVisibilityStateChange = function() {

	  var defaultFields;
	  this.prevVisibilityState = this.visibilityState;
	  this.visibilityState = document.visibilityState;

	  if (this.sessionHasTimedOut()) {
	    // Prevents sending 'hidden' state hits when the session has timed out.
	    if (this.visibilityState == 'hidden') return;

	    if (this.visibilityState == 'visible') {
	      // If the session has timed out, a transition to "visible" should be
	      // considered a new pageview and a new session.
	      defaultFields = {transport: 'beacon'};
	      this.tracker.send('pageview', createFieldsObj(defaultFields,
	          this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	    }
	  }
	  else {
	    // Rounds the time up to the nearest second. If the rounded value is zero
	    // use 1 instead since unset metrics default to 0.
	    var timeDeltaInSeconds = Math.round(
	        (new Date - this.lastVisibilityChangeTime) / 1000) || 1;

	    defaultFields = {
	      transport: 'beacon',
	      eventCategory: 'Page Visibility',
	      eventAction: 'change',
	      eventLabel: this.opts.changeTemplate(
	          this.prevVisibilityState, this.visibilityState),
	      eventValue: timeDeltaInSeconds
	    };

	    // Changes to hidden are non interaction hits by default
	    if (this.visibilityState == 'hidden') defaultFields.nonInteraction = true;

	    // If a custom metric was specified for the current visibility state,
	    // give it the same as the event value.
	    var metric = this.opts[this.prevVisibilityState + 'MetricIndex'];
	    if (metric) defaultFields['metric' + metric] = timeDeltaInSeconds;

	    this.tracker.send('event', createFieldsObj(defaultFields,
	        this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	  }

	  // Updates the time the last visibility state change event occurred, so
	  // change events can report the delta.
	  this.lastVisibilityChangeTime = +new Date;
	};


	/**
	 * Returns true if the session has not timed out. A session timeout occurs when
	 * more than `this.opts.sessionTimeout` minutes has elapsed since the
	 * tracker sent the previous hit.
	 * @return {boolean} True if the session has timed out.
	 */
	PageVisibilityTracker.prototype.sessionHasTimedOut = function() {
	  var minutesSinceLastHit = (new Date - this.lastHitTime) / (60 * 1000);
	  return this.opts.sessionTimeout < minutesSinceLastHit;
	};


	/**
	 * Overrides the `tracker.send` method to send a pageview hit before the
	 * current hit being sent if the session has timed out and the current hit is
	 * not a pageview itself.
	 */
	PageVisibilityTracker.prototype.overrideTrackerSendMethod = function() {
	  this.originalTrackerSendMethod = this.tracker.send;

	  this.tracker.send = function() {
	    var args = Array.prototype.slice.call(arguments);
	    var firstArg = args[0];
	    var hitType = isObject(firstArg) ? firstArg.hitType : firstArg;
	    var isPageview = hitType == 'pageview';

	    if (!isPageview && this.sessionHasTimedOut()) {
	      var defaultFields = {transport: 'beacon'};
	      this.originalTrackerSendMethod.call(this.tracker, 'pageview',
	          createFieldsObj(defaultFields, this.opts.fieldsObj,
	              this.tracker, this.opts.hitFilter));
	    }

	    this.originalTrackerSendMethod.apply(this.tracker, args);
	  }.bind(this);
	};


	/**
	 * Overrides the tracker's `sendHitTask` to record the time of the previous
	 * hit. This is used to determine whether or not a session has timed out.
	 */
	PageVisibilityTracker.prototype.overrideTrackerSendHitTask = function() {
	  this.originalTrackerSendHitTask = this.tracker.get('sendHitTask');
	  this.lastHitTime = +new Date;

	  this.tracker.set('sendHitTask', function(model) {
	    this.originalTrackerSendHitTask(model);
	    this.lastHitTime = +new Date;
	  }.bind(this));
	};


	/**
	 * Sets the default formatting of the change event label.
	 * This can be overridden by setting the `changeTemplate` option.
	 * @param {string} oldValue The value of the media query prior to the change.
	 * @param {string} newValue The value of the media query after the change.
	 * @return {string} The formatted event label.
	 */
	PageVisibilityTracker.prototype.changeTemplate = function(oldValue, newValue) {
	  return oldValue + ' => ' + newValue;
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	 PageVisibilityTracker.prototype.remove = function() {
	  this.tracker.set('sendHitTask', this.originalTrackerSendHitTask);
	  this.tracker.send = this.originalTrackerSendMethod;

	  document.removeEventListener(
	      'visibilitychange', this.handleVisibilityStateChange);
	};


	provide('pageVisibilityTracker', PageVisibilityTracker);


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	/* global FB, twttr */


	var assign = __webpack_require__(3);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;


	/**
	 * Registers social tracking on tracker object.
	 * Supports both declarative social tracking via HTML attributes as well as
	 * tracking for social events when using official Twitter or Facebook widgets.
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function SocialWidgetTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.SOCIAL_WIDGET_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!window.addEventListener) return;

	  this.opts = assign({
	    fieldsObj: {},
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  // Binds methods to `this`.
	  this.addWidgetListeners = this.addWidgetListeners.bind(this);
	  this.addTwitterEventHandlers = this.addTwitterEventHandlers.bind(this);
	  this.handleTweetEvents = this.handleTweetEvents.bind(this);
	  this.handleFollowEvents = this.handleFollowEvents.bind(this);
	  this.handleLikeEvents = this.handleLikeEvents.bind(this);
	  this.handleUnlikeEvents = this.handleUnlikeEvents.bind(this);

	  if (document.readyState != 'complete') {
	    // Adds the widget listeners after the window's `load` event fires.
	    // If loading widgets using the officially recommended snippets, they
	    // will be available at `window.load`. If not users can call the
	    // `addWidgetListeners` method manually.
	    window.addEventListener('load', this.addWidgetListeners);
	  }
	  else {
	    this.addWidgetListeners();
	  }
	}


	/**
	 * Invokes the methods to add Facebook and Twitter widget event listeners.
	 * Ensures the respective global namespaces are present before adding.
	 */
	SocialWidgetTracker.prototype.addWidgetListeners = function() {
	  if (window.FB) this.addFacebookEventHandlers();
	  if (window.twttr) this.addTwitterEventHandlers();
	};


	/**
	 * Adds event handlers for the "tweet" and "follow" events emitted by the
	 * official tweet and follow buttons. Note: this does not capture tweet or
	 * follow events emitted by other Twitter widgets (tweet, timeline, etc.).
	 */
	SocialWidgetTracker.prototype.addTwitterEventHandlers = function() {
	  try {
	    twttr.ready(function() {
	      twttr.events.bind('tweet', this.handleTweetEvents);
	      twttr.events.bind('follow', this.handleFollowEvents);
	    }.bind(this));
	  } catch(err) {}
	};


	/**
	 * Removes event handlers for the "tweet" and "follow" events emitted by the
	 * official tweet and follow buttons.
	 */
	SocialWidgetTracker.prototype.removeTwitterEventHandlers = function() {
	  try {
	    twttr.ready(function() {
	      twttr.events.unbind('tweet', this.handleTweetEvents);
	      twttr.events.unbind('follow', this.handleFollowEvents);
	    }.bind(this));
	  } catch(err) {}
	};


	/**
	 * Adds event handlers for the "like" and "unlike" events emitted by the
	 * official Facebook like button.
	 */
	SocialWidgetTracker.prototype.addFacebookEventHandlers = function() {
	  try {
	    FB.Event.subscribe('edge.create', this.handleLikeEvents);
	    FB.Event.subscribe('edge.remove', this.handleUnlikeEvents);
	  } catch(err) {}
	};


	/**
	 * Removes event handlers for the "like" and "unlike" events emitted by the
	 * official Facebook like button.
	 */
	SocialWidgetTracker.prototype.removeFacebookEventHandlers = function() {
	  try {
	    FB.Event.unsubscribe('edge.create', this.handleLikeEvents);
	    FB.Event.unsubscribe('edge.remove', this.handleUnlikeEvents);
	  } catch(err) {}
	};


	/**
	 * Handles `tweet` events emitted by the Twitter JS SDK.
	 * @param {Object} event The Twitter event object passed to the handler.
	 */
	SocialWidgetTracker.prototype.handleTweetEvents = function(event) {
	  // Ignores tweets from widgets that aren't the tweet button.
	  if (event.region != 'tweet') return;

	  var url = event.data.url || event.target.getAttribute('data-url') ||
	      location.href;

	  var defaultFields = {
	    transport: 'beacon',
	    socialNetwork: 'Twitter',
	    socialAction: 'tweet',
	    socialTarget: url
	  };
	  this.tracker.send('social', createFieldsObj(defaultFields,
	      this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	};


	/**
	 * Handles `follow` events emitted by the Twitter JS SDK.
	 * @param {Object} event The Twitter event object passed to the handler.
	 */
	SocialWidgetTracker.prototype.handleFollowEvents = function(event) {
	  // Ignore follows from widgets that aren't the follow button.
	  if (event.region != 'follow') return;

	  var screenName = event.data.screen_name ||
	      event.target.getAttribute('data-screen-name');

	  var defaultFields = {
	    transport: 'beacon',
	    socialNetwork: 'Twitter',
	    socialAction: 'follow',
	    socialTarget: screenName
	  };
	  this.tracker.send('social', createFieldsObj(defaultFields,
	      this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	};


	/**
	 * Handles `like` events emitted by the Facebook JS SDK.
	 * @param {string} url The URL corresponding to the like event.
	 */
	SocialWidgetTracker.prototype.handleLikeEvents = function(url) {
	  var defaultFields = {
	    transport: 'beacon',
	    socialNetwork: 'Facebook',
	    socialAction: 'like',
	    socialTarget: url
	  };
	  this.tracker.send('social', createFieldsObj(defaultFields,
	      this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	};


	/**
	 * Handles `unlike` events emitted by the Facebook JS SDK.
	 * @param {string} url The URL corresponding to the unlike event.
	 */
	SocialWidgetTracker.prototype.handleUnlikeEvents = function(url) {
	  var defaultFields = {
	    transport: 'beacon',
	    socialNetwork: 'Facebook',
	    socialAction: 'unlike',
	    socialTarget: url
	  };
	  this.tracker.send('social', createFieldsObj(defaultFields,
	      this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	SocialWidgetTracker.prototype.remove = function() {
	  window.removeEventListener('load', this.addWidgetListeners);
	  this.removeFacebookEventHandlers();
	  this.removeTwitterEventHandlers();
	};


	provide('socialWidgetTracker', SocialWidgetTracker);


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	var assign = __webpack_require__(3);
	var provide = __webpack_require__(6);
	var usage = __webpack_require__(9);
	var createFieldsObj = __webpack_require__(7).createFieldsObj;
	var isObject = __webpack_require__(7).isObject;


	/**
	 * Adds handler for the history API methods
	 * @constructor
	 * @param {Object} tracker Passed internally by analytics.js
	 * @param {?Object} opts Passed by the require command.
	 */
	function UrlChangeTracker(tracker, opts) {

	  usage.track(tracker, usage.plugins.URL_CHANGE_TRACKER);

	  // Feature detects to prevent errors in unsupporting browsers.
	  if (!history.pushState || !window.addEventListener) return;

	  this.opts = assign({
	    shouldTrackUrlChange: this.shouldTrackUrlChange,
	    fieldsObj: {},
	    hitFilter: null
	  }, opts);

	  this.tracker = tracker;

	  // Sets the initial page field.
	  // Don't set this on the tracker yet so campaign data can be retreived
	  // from the location field.
	  this.path = getPath();

	  this.updateTrackerData = this.updateTrackerData.bind(this);

	  // Overrides history.pushState.
	  this.originalPushState = history.pushState;
	  history.pushState = function(state, title) {
	    // Sets the document title for reference later.
	    // TODO(philipwalton): consider using WeakMap for this to not conflict
	    // with any user-defined property also called "title".
	    if (isObject(state) && title) state.title = title;

	    this.originalPushState.apply(history, arguments);
	    this.updateTrackerData();
	  }.bind(this);

	  // Overrides history.repaceState.
	  this.originalReplaceState = history.replaceState;
	  history.replaceState = function(state, title) {
	    // Sets the document title for reference later.
	    // TODO(philipwalton): consider using WeakMap for this to not conflict
	    // with any user-defined property also called "title".
	    if (isObject(state) && title) state.title = title;

	    this.originalReplaceState.apply(history, arguments);
	    this.updateTrackerData(false);
	  }.bind(this);

	  // Handles URL changes via user interaction.
	  window.addEventListener('popstate', this.updateTrackerData);
	}


	/**
	 * Updates the page and title fields on the tracker if necessary and
	 * optionally sends a pageview.
	 * @param {boolean} shouldSendPageview Indicates whether the tracker should
	 *     send a pageview after updating the URL.
	 */
	UrlChangeTracker.prototype.updateTrackerData = function(shouldSendPageview) {

	  // Sets the default.
	  shouldSendPageview = shouldSendPageview === false ? false : true;

	  // Calls the update logic asychronously to help ensure user callbacks
	  // happen first.
	  setTimeout(function() {

	    var oldPath = this.path;
	    var newPath = getPath();

	    if (oldPath != newPath &&
	        this.opts.shouldTrackUrlChange.call(this, newPath, oldPath)) {

	      this.path = newPath;
	      this.tracker.set({
	        page: newPath,
	        title: isObject(history.state) && history.state.title || document.title
	      });

	      if (shouldSendPageview) {
	        var defaultFields = {transport: 'beacon'};
	        this.tracker.send('pageview', createFieldsObj(defaultFields,
	            this.opts.fieldsObj, this.tracker, this.opts.hitFilter));
	      }
	    }
	  }.bind(this), 0);
	};


	/**
	 * Determines whether or not the tracker should send a hit with the new page
	 * data. This default implementation can be overrided in the config options.
	 * @param {string} newPath The path prior to the URL change.
	 * @param {string} oldPath The path after the URL change.
	 * @return {boolean} Whether or not the URL change should be tracked.
	 */
	UrlChangeTracker.prototype.shouldTrackUrlChange = function(newPath, oldPath) {
	  return newPath && oldPath;
	};


	/**
	 * Removes all event listeners and instance properties.
	 */
	UrlChangeTracker.prototype.remove = function() {
	  window.removeEventListener('popstate', this.updateTrackerData);
	  history.replaceState = this.originalReplaceState;
	  history.pushState = this.originalPushState;

	  this.tracker = null;
	  this.opts = null;
	  this.path = null;

	  this.updateTrackerData = null;
	  this.originalReplaceState = null;
	  this.originalPushState = null;
	};


	/**
	 * @return {string} The path value of the current URL.
	 */
	function getPath() {
	  return location.pathname + location.search;
	}


	provide('urlChangeTracker', UrlChangeTracker);


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	/* eslint no-console: ["error", {allow: ["error"]}] */


	// Imports dependencies.
	var provide = __webpack_require__(6);


	/**
	 * Warns users that this functionality is deprecated as of version 1.0
	 * @deprecated
	 * @constructor
	 */
	function Autotrack() {
	  console.error('Warning! Requiring the `autotrack` plugin no longer ' +
	      'requires ' +' all sub-plugins by default.\n' +
	      'See https://goo.gl/XsXPg5 for details.');
	}


	provide('autotrack', Autotrack);


/***/ }
/******/ ]);