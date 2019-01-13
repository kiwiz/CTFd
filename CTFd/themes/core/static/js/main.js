import 'whatwg-fetch'
import '~bootstrap/dist/js/bootstrap.bundle'
import '@babel/polyfill'
import 'util'

import $ from 'jquery'
import CTFd from 'CTFd'
import events from 'events'
import styles from 'styles'
import config from 'config'

$(() => {
    events(config.script_root)
    styles()
})

window.CTFd = CTFd
