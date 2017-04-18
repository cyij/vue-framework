import util from './util'

var globalAjaxOptions = {};
var ajaxSetup = function (options) {
    if (options.type) options.method = options.type;
    util.each(options, function (optionName, optionValue) {
        globalAjaxOptions[optionName]  = optionValue;
    });
};

// Ajax
var _jsonpRequests = 0;
var ajax = function (options) {
    var defaults = {
        method: 'GET',
        data: false,
        async: true,
        cache: true,
        user: '',
        password: '',
        headers: {},
        xhrFields: {},
        statusCode: {},
        processData: true,
        dataType: 'text',
        contentType: 'application/x-www-form-urlencoded',
        timeout: 0
    };
    var callbacks = ['beforeSend', 'error', 'complete', 'success', 'statusCode'];

    //For jQuery guys
    if (options.type) options.method = options.type;

    // Merge global and defaults
    util.each(globalAjaxOptions, function (globalOptionName, globalOptionValue) {
        if (callbacks.indexOf(globalOptionName) < 0) defaults[globalOptionName] = globalOptionValue;
    });

    // Merge options and defaults
    util.each(defaults, function (prop, defaultValue) {
        if (!(prop in options)) options[prop] = defaultValue;
    });

    // Default URL
    if (!options.url) {
        options.url = window.location.toString();
    }
    // Parameters Prefix
    var paramsPrefix = options.url.indexOf('?') >= 0 ? '&' : '?';

    // UC method
    var _method = options.method.toUpperCase();
    // Data to modify GET URL
    if ((_method === 'GET' || _method === 'HEAD' || _method === 'OPTIONS' || _method === 'DELETE') && options.data) {
        var stringData;
        if (typeof options.data === 'string') {
            // Should be key=value string
            if (options.data.indexOf('?') >= 0) stringData = options.data.split('?')[1];
            else stringData = options.data;
        }
        else {
            // Should be key=value object
            stringData = util.serializeObject(options.data);
        }
        if (stringData.length) {
            options.url += paramsPrefix + stringData;
            if (paramsPrefix === '?') paramsPrefix = '&';
        }
    }
    // JSONP
    if (options.dataType === 'json' && options.url.indexOf('callback=') >= 0) {
        var callbackName = 'jsonp_' + Date.now() + (_jsonpRequests++);
        var abortTimeout;
        var callbackSplit = options.url.split('callback=');
        var requestUrl = callbackSplit[0] + 'callback=' + callbackName;
        if (callbackSplit[1].indexOf('&') >= 0) {
            var addVars = callbackSplit[1].split('&').filter(function (el) { return el.indexOf('=') > 0; }).join('&');
            if (addVars.length > 0) requestUrl += '&' + addVars;
        }

        // Create script
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onerror = function() {
            clearTimeout(abortTimeout);
            if (typeof options.error === 'function') options.error('error')
        };
        script.src = requestUrl;

        // Handler
        window[callbackName] = function (data) {
            clearTimeout(abortTimeout);
            if(typeof options.success === 'function') options.success(data)
            script.parentNode.removeChild(script);
            script = null;
            delete window[callbackName];
        };
        document.querySelector('head').appendChild(script);

        if (options.timeout > 0) {
            abortTimeout = setTimeout(function () {
                script.parentNode.removeChild(script);
                script = null;
                if (typeof options.error === 'function') options.error('timeout')
            }, options.timeout);
        }

        return;
    }

    // Cache for GET/HEAD requests
    if (_method === 'GET' || _method === 'HEAD' || _method === 'OPTIONS' || _method === 'DELETE') {
        if (options.cache === false) {
            options.url += (paramsPrefix + '_nocache=' + Date.now());
        }
    }

    // Create XHR
    var xhr = new XMLHttpRequest();

    // Save Request URL
    xhr.requestUrl = options.url;
    xhr.requestParameters = options;

    // Open XHR
    xhr.open(_method, options.url, options.async, options.user, options.password);

    // Create POST Data
    var postData = null;

    if ((_method === 'POST' || _method === 'PUT' || _method === 'PATCH') && options.data) {
        if (options.processData) {
            var postDataInstances = [ArrayBuffer, Blob, Document, FormData];
            // Post Data
            if (postDataInstances.indexOf(options.data.constructor) >= 0) {
                postData = options.data;
            }
            else {
                // POST Headers
                var boundary = '---------------------------' + Date.now().toString(16);

                if (options.contentType === 'multipart\/form-data') {
                    xhr.setRequestHeader('Content-Type', 'multipart\/form-data; boundary=' + boundary);
                }
                else {
                    xhr.setRequestHeader('Content-Type', options.contentType);
                }
                postData = '';
                var _data = util.serializeObject(options.data);
                if (options.contentType === 'multipart\/form-data') {
                    boundary = '---------------------------' + Date.now().toString(16);
                    _data = _data.split('&');
                    var _newData = [];
                    for (var i = 0; i < _data.length; i++) {
                        _newData.push('Content-Disposition: form-data; name="' + _data[i].split('=')[0] + '"\r\n\r\n' + _data[i].split('=')[1] + '\r\n');
                    }
                    postData = '--' + boundary + '\r\n' + _newData.join('--' + boundary + '\r\n') + '--' + boundary + '--\r\n';
                }
                else {
                    postData = _data;
                }
            }
        }
        else {
            postData = options.data;
        }

    }

    // Additional headers
    if (options.headers) {
        util.each(options.headers, function (headerName, headerCallback) {
            xhr.setRequestHeader(headerName, headerCallback);
        });
    }

    // Check for crossDomain
    if (typeof options.crossDomain === 'undefined') {
        options.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(options.url) && RegExp.$2 !== window.location.host;
    }

    if (!options.crossDomain) {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    if (options.xhrFields) {
        util.each(options.xhrFields, function (fieldName, fieldValue) {
            xhr[fieldName] = fieldValue;
        });
    }

    var xhrTimeout;
    // Handle XHR
    xhr.onload = function (e) {
        if (xhrTimeout) clearTimeout(xhrTimeout);
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
            var responseData;
            if (options.dataType === 'json') {
                try {
                    responseData = JSON.parse(xhr.responseText);
                    if(typeof options.success === 'function') options.success(responseData)
                }
                catch (err) {
                    if(typeof options.error === 'function') options.error('parseerror')
                }
            }
            else {
                responseData = xhr.responseType === 'text' || xhr.responseType === '' ? xhr.responseText : xhr.response;
                if(typeof options.success === 'function') options.success(responseData)
            }
        }
        else {
            if(typeof options.error === 'function') options.error('error')
        }
        if (options.statusCode) {
            if (globalAjaxOptions.statusCode && globalAjaxOptions.statusCode[xhr.status]) globalAjaxOptions.statusCode[xhr.status](xhr);
            if (options.statusCode[xhr.status]) options.statusCode[xhr.status](xhr);
        }
    };

    xhr.onerror = function (e) {
        if (xhrTimeout) clearTimeout(xhrTimeout);
        if(typeof options.error === 'function') options.error('error')
    };

    // Timeout
    if (options.timeout > 0) {
        xhr.onabort = function () {
            if (xhrTimeout) clearTimeout(xhrTimeout);
        };
        xhrTimeout = setTimeout(function () {
            xhr.abort();
            if(typeof options.error === 'function') options.error('timeout')
        }, options.timeout);
    }

    // Send XHR
    xhr.send(postData);

    // Return XHR object
    return xhr;
}

export default {
    ajax: ajax
}
