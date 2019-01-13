import MarkdownIt from 'markdown-it'
import { ezQuery } from 'ezq'
import fetch from 'fetch'

const load = (id) => {
    const md = MarkdownIt({
        html: true,
    });

    hint(id).then((response) => {
        if (response.data.content) {
            ezAlert({
                title: "Hint",
                body: md.render(response.data.content),
                button: "Got it!"
            });

            return;
        }

        ezQuery({
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
                            ezAlert({
                                title: "Hint",
                                body: md.render(response.data.content),
                                button: "Got it!"
                            });
                        });

                        return;
                    }

                    ezAlert({
                        title: "Error",
                        body: md.render(response.errors.score),
                        button: "Got it!"
                    });
                });
            }
        });
    });
}

module.exports = {
    get,
    load,
    unlock,
}
