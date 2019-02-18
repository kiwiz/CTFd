import fetch from './fetch'
import config from './config'
import { API } from './api'
import MarkdownIt from 'markdown-it'
import $ from 'jquery'

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
API.prototype.post_challenge_attempt = function(body) {
    let parameters = {}
    let deferred = Q.defer()
    let domain = this.domain,
        path = '/challenges/attempt'
    let queryParameters = {},
        headers = {},
        form = {}

    headers['Accept'] = ['application/json']
    headers['Content-Type'] = ['application/json']

    if('preview' in parameters) {
        queryParameters['preview'] = parameters['preview']
        delete(parameters['preview'])
    }
    this.request('POST', domain + path, parameters, body, headers, {}, form, deferred)

    return deferred.promise
}

const api = new API('/')
const user = {}
const _internal = {}
const lib = {
    $,
    MarkdownIt,
}

let initialized = false
const init = (data) => {
    if (initialized) {
        return
    }
    initialized = true

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
    lib,
    _internal,
}

export default CTFd
