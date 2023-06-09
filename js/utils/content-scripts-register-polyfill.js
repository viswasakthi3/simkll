/* https://github.com/fregante/content-scripts-register-polyfill @ v1.0.1 */

var contentScriptsRegisterPolyfill = (function () {
	'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;
	function getRawRegex(matchPattern) {
	    if (!patternValidationRegex.test(matchPattern)) {
	        throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	    }
	    let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);
	    protocol = protocol
	        .replace('*', 'https?')
	        .replace(/[/]/g, '[/]');
	    host = (host !== null && host !== void 0 ? host : '')
	        .replace(/[.]/g, '[.]')
	        .replace(/^[*]/, '[^/]+')
	        .replace(/[*]$/g, '[^.]+');
	    pathname = pathname
	        .replace(/[/]/g, '[/]')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]/g, '.*');
	    return '^' + protocol + host + '(' + pathname + ')?$';
	}
	function patternToRegex(...matchPatterns) {
	    return new RegExp(matchPatterns.map(getRawRegex).join('|'));
	}

	var webextPatterns = /*#__PURE__*/Object.freeze({
		patternValidationRegex: patternValidationRegex,
		patternToRegex: patternToRegex
	});

	var _package = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	async function p(fn, ...args) {
	    return new Promise((resolve, reject) => {
	        fn(...args, result => {
	            if (chrome.runtime.lastError) {
	                reject(chrome.runtime.lastError);
	            }
	            else {
	                resolve(result);
	            }
	        });
	    });
	}
	async function isOriginPermitted(url) {
	    return p(chrome.permissions.contains, {
	        origins: [new URL(url).origin + '/*']
	    });
	}
	async function wasPreviouslyLoaded(tabId, loadCheck) {
	    const result = await p(chrome.tabs.executeScript, tabId, {
	        code: loadCheck,
	        runAt: 'document_start'
	    });
	    return result === null || result === void 0 ? void 0 : result[0];
	}
	if (typeof chrome === 'object' && !chrome.contentScripts) {
	    chrome.contentScripts = {
	        async register(contentScriptOptions, callback) {
	            const { js = [], css = [], allFrames, matchAboutBlank, matches, runAt } = contentScriptOptions;
	            const loadCheck = `document[${JSON.stringify(JSON.stringify({ js, css }))}]`;
	            const matchesRegex = webextPatterns.patternToRegex(...matches);
	            const listener = async (tabId, { status }) => {
	                if (status !== 'loading') {
	                    return;
	                }
	                const { url } = await p(chrome.tabs.get, tabId);

	                if (!url ||
	                    !matchesRegex.test(url) ||
	                    !await isOriginPermitted(url) ||
	                    await wasPreviouslyLoaded(tabId, loadCheck)
	                ) {
	                    return;
	                }
	                for (const file of css) {
	                    chrome.tabs.insertCSS(tabId, {
	                        ...file,
	                        matchAboutBlank,
	                        allFrames,
	                        runAt: runAt !== null && runAt !== void 0 ? runAt : 'document_start'
	                    });
	                }
	                for (const file of js) {
	                    chrome.tabs.executeScript(tabId, {
	                        ...file,
	                        matchAboutBlank,
	                        allFrames,
	                        runAt
	                    });
	                }
	                chrome.tabs.executeScript(tabId, {
	                    code: `${loadCheck} = true`,
	                    runAt: 'document_start',
	                    allFrames
	                });
	            };
	            chrome.tabs.onUpdated.addListener(listener);
	            const registeredContentScript = {
	                async unregister() {
	                    return p(chrome.tabs.onUpdated.removeListener.bind(chrome.tabs.onUpdated), listener);
	                }
	            };
	            if (typeof callback === 'function') {
	                callback(registeredContentScript);
	            }
	            return Promise.resolve(registeredContentScript);
	        }
	    };
	}
	});
	var index = unwrapExports(_package);

	return index;

}());
