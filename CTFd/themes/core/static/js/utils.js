import $ from 'jquery'

//http://stackoverflow.com/a/1186309
$.fn.serializeObject = () => {
    let o = {};
    let a = this.serializeArray();
    $.each(a, () => {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
}

$.fn.serializeJSON = (omit_nulls) => {
    let params = {};
    let form = $(this);
    let values = form.serializeArray();

    values = values.concat(
        form.find('input[type=checkbox]:checked').map(
            function () {
                return {"name": this.name, "value": true}
            }).get()
    );
    values = values.concat(
        form.find('input[type=checkbox]:not(:checked)').map(
            function () {
                return {"name": this.name, "value": false}
            }).get()
    );
    values.map(function (x) {
        if (omit_nulls) {
            if (x.value !== null && x.value !== "") {
                params[x.name] = x.value;
            }
        } else {
            params[x.name] = x.value;
        }
    });
    return params;
};

//http://stackoverflow.com/a/2648463 - wizardry!
String.prototype.format = String.prototype.f = () => {
    let s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

//http://stackoverflow.com/a/7616484
String.prototype.hashCode = function() {
    let hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// http://stepansuvorov.com/blog/2014/04/jquery-put-and-delete/
$.each(["patch", "put", "delete"], function(i, method) {
    $[method] = function(url, data, callback, type) {
        if ($.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return $.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback
        });
    };
});

export.colorHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export.htmlEntities(string) => {
    return $('<div/>').text(string).html();
}

export.cumulativeSum(arr) => {
    let result = arr.concat();
    for (let i = 0; i < arr.length; i++) {
        result[i] = arr.slice(0, i + 1).reduce(function (p, i) {
            return p + i;
        });
    }
    return result
}
