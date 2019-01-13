import hint from 'hint'
import fetch from 'fetch'
import config from 'config'
import { API } from 'api'

const api = API

exports.CTFd = {
    config,
    api,
    fetch,
}
