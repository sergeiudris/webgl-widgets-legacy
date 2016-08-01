if (typeof exports === 'object' && typeof module === 'object')
    module.exports = advenfetch;
else {
    window["fetch"] = advenfetch;
}


function advenfetch(url, options) {

    var p = new Promise(function (resolve, reject) {
        options = options || {};
        //event ['loadstart', 'progress','abort','error','load','timeout','loadend','readystatechange'] 
        //responseType ['','arraybuffer','blob','document','json','text']
        var xhr = new XMLHttpRequest();
        var method = options.method || "GET";
        var async = typeof options.async === "undefined" ? true : options.async;
        xhr.responseType = 'blob';

        Object.assign(xhr, options);

        xhr.addEventListener("load", load);
        xhr.addEventListener("error", error);
        xhr.addEventListener("abort", abort);
        function load(e) {
            resolve(e.target);
        }
        function error(e) {
            console.log("XHR error event. Promise rejected");
            reject(e);
        }
        function abort(e) {
            console.log("XHR abort event. Promise rejected");
            reject(e);
        }

        xhr.open(method, url, async);
        if (options.mimeType) {
            xhr.overrideMimeType(options.mimeType/*'text\/plain; charset=x-user-defined'*/);
        }
        xhr.send();
    });

    return p;

}

fetch.blobToUrl = function (blob) {
    return new Promise(function (resolve, reject) {
        resolve(URL.createObjectURL(blob));
    })
}


fetch.blobToText = function (blob) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
            resolve(e.target.result);
        }
        reader.onerror = function (e) {
            console.warn("FileReader error event. Promise rejected");
            reject(e);
        }
        reader.readAsText(blob);
    })
}



