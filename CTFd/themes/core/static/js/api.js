import fetch from 'fetch'

const get_hint = (id) => fetch('/api/v1/hints/' + id, {
    method: 'GET',
}).then((response) => response.json())

const unlock_hint = (params) => fetch('/api/v1/unlocks', {
    method: 'POST',
    body: JSON.stringify(params)
}).then((response) => response.json())

const hints = {
    'get': get_hint,
    'unlock': unlock_hint,
}

exports.default = {
    hints,
}
