import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill'
import { ezAlert } from './ezq'

const EventSource = NativeEventSource || EventSourcePolyfill

export default (root) => {
    const source = new EventSource(root + '/events')

    source.addEventListener('notification', function (event) {
        const data = JSON.parse(event.data)

        ezAlert({
            title: data.title,
            body: data.content,
            button: 'Got it!'
        })
    }, false)
}
