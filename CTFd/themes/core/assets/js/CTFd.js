import fetch from './fetch'
import config from './config'
import { API } from './api'

import Q from 'q'
API.prototype.patch_user_private = function(body) {
    let parameters = {}
    let deferred = Q.defer()
    let domain = this.domain,
        path = '/users/me'
    let headers = {},
        form = {}

    headers['Accept'] = ['application/json']
    headers['Content-Type'] = ['application/json']

    this.request('PATCH', domain + path, parameters, body, headers, {}, form, deferred)

    return deferred.promise
}
API.prototype.post_unlock_list = function(body) {
    let parameters = {}
    let deferred = Q.defer()
    let domain = this.domain,
        path = '/unlocks'
    let headers = {},
        form = {}

    headers['Accept'] = ['application/json']
    headers['Content-Type'] = ['application/json']

    this.request('POST', domain + path, parameters, body, headers, {}, form, deferred)

    return deferred.promise
}

const api = new API('/')
const user = {}

const init = (data) => {
    config.urlRoot = data.urlRoot || config.urlRoot
    config.csrfNonce = data.csrfNonce || config.csrfNonce
    config.userMode = data.userMode || config.userMode
    api.domain = config.urlRoot + '/api/v1'
    user.id = data.userId
}

const CTFd = {
    init,
    config,
    fetch,
    user,
    api,
}

export default CTFd
