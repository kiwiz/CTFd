import MarkdownIt from 'markdown-it'
import EZQ from 'ezq'

const fetch = window.fetch

const get = (id) => fetch('/api/v1/hints/' + id, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json());

const unlock = (params) => fetch('/api/v1/unlocks', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then((response) => response.json());

const load = (id) => {
    const md = MarkdownIt({
        html: true,
    });

    hint(id).then((response) => {
        if (response.data.content) {
            EZQ.ezal({
                title: "Hint",
                body: md.render(response.data.content),
                button: "Got it!"
            });

            return;
        }

        EZQ.ezq({
            title: "Unlock Hint?",
            body: "Are you sure you want to open this hint?",
            success: () => {
                var params = {
                    target: id,
                    type: "hints"
                };
                unlock(params).then((response) => {
                    if (response.success) {
                        hint(id).then((response) => {
                            EZQ.ezal({
                                title: "Hint",
                                body: md.render(response.data.content),
                                button: "Got it!"
                            });
                        });

                        return;
                    }

                    EZQ.ezal({
                        title: "Error",
                        body: md.render(response.errors.score),
                        button: "Got it!"
                    });
                });
            }
        });
    });
}

const legacy = {
    'hint': get,
    'unlock': unlock,
    'loadhint': load,
}

module.exports = {
    get,
    load,
    unlock,
    legacy
}
