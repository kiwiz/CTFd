exports.options = {
    urlRoot: '',
    csrfNonce: '',
};

exports.challenges = {};

exports.scoreboard = () => {};

exports.teams = {};

exports.users = {};

exports.fetch = (url, options) => {
    if (options === undefined) {
        options = {
            method: "GET",
            credentials: "same-origin",
            headers: {},
        };
    }
    url = exports.options.urlRoot + url;

    if (options.headers === undefined) {
        options.headers = {};
    }
    options.credentials = 'same-origin';
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';
    options.headers['CSRF-Token'] = exports.options.csrfNonce;

    return window.fetch(url, options);
}
