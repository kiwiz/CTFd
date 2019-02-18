import $ from 'jquery'

$.fn.serializeJSON = function(omit_nulls) {
    let params = {}
    let form = $(this)
    let values = form.serializeArray()

    values = values.concat(
        form.find('input[type=checkbox]:checked').map(
            () => {
                return {'name': this.name, 'value': true}
            }).get()
    )
    values = values.concat(
        form.find('input[type=checkbox]:not(:checked)').map(
            () => {
                return {'name': this.name, 'value': false}
            }).get()
    )
    values.map((x) => {
        if (omit_nulls) {
            if (x.value !== null && x.value !== '') {
                params[x.name] = x.value
            }
        } else {
            params[x.name] = x.value
        }
    })
    return params
}

//http://stackoverflow.com/a/2648463 - wizardry!
String.prototype.format = String.prototype.f = function() {
    let s = this,
        i = arguments.length

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i])
    }
    return s
}

//http://stackoverflow.com/a/7616484
String.prototype.hashCode = function() {
    let hash = 0, i, chr, len
    if (this.length == 0) return hash
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i)
        hash  = ((hash << 5) - hash) + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

export function colorHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}

export function htmlEntities(string) {
    return $('<div/>').text(string).html()
}

export function cumulativeSum(arr) {
    let result = arr.concat()
    for (let i = 0; i < arr.length; i++) {
        result[i] = arr.slice(0, i + 1).reduce(function (p, i) {
            return p + i
        })
    }
    return result
}
