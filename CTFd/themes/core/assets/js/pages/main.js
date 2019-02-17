import 'whatwg-fetch'
import 'bootstrap/dist/js/bootstrap.bundle'
import '@babel/polyfill'
import '../utils'

import $ from 'jquery'
import CTFd from '../CTFd'
import events from '../events'
import styles from '../styles'
import times from '../times'
import config from '../config'

CTFd.init(window.init)

$(() => {
    events(config.urlRoot)
    styles()
    times()
})

window.CTFd = CTFd
