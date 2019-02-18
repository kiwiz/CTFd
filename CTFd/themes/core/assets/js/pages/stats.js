import './main'
import $ from 'jquery'
import CTFd from '../CTFd'
import Plotly from 'plotly.js-basic-dist'
import Moment from 'moment'
import { cumulativeSum, colorHash } from '../utils'

const api_funcs = {
    'team': [
        (x) => CTFd.api.get_team_solves({teamId: x}),
        (x) => CTFd.api.get_team_fails({teamId: x}),
        (x) => CTFd.api.get_team_awards({teamId: x}),
    ],
    'user': [
        (x) => CTFd.api.get_user_solves({userId: x}),
        (x) => CTFd.api.get_user_fails({userId: x}),
        (x) => CTFd.api.get_user_awards({userId: x}),
    ],
}

const graph_configs = {
    '#score-graph': {
        layout: {
            title: 'Score over Time',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'closest',
            xaxis: {
                showgrid: false,
                showspikes: true,
            },
            yaxis: {
                showgrid: false,
                showspikes: true,
            },
            legend: {
                'orientation': 'h'
            }
        },
        fn: (type, id, name, account_id) => `CTFd_score_${type}_${name}_${id}_${(new Date).toISOString().slice(0, 19)}`,
        format: (type, id, name, account_id, responses) => {
            const times = []
            const scores = []
            const solves = responses[0].data
            const awards = responses[2].data
            const total = solves.concat(awards)

            total.sort((a, b) => {
                return new Date(a.date) - new Date(b.date)
            })

            for (let i = 0; i < total.length; i++) {
                const date = Moment(total[i].date)
                times.push(date.toDate())
                try {
                    scores.push(total[i].challenge.value)
                } catch (e) {
                    scores.push(total[i].value)
                }
            }

            return [
                {
                    x: times,
                    y: cumulativeSum(scores),
                    type: 'scatter',
                    marker: {
                        color: colorHash(name + id),
                    },
                    line: {
                        color: colorHash(name + id),
                    },
                    fill: 'tozeroy'
                }
            ]
        }
    },

    '#categories-pie-graph': {
        layout: {
            title: 'Category Breakdown',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            legend: {
                'orientation': 'v',
            },
            width: '50%',
            height: '450px',
        },
        fn: (type, id, name, account_id) => `CTFd_submissions_${type}_${name}_${id}_${(new Date).toISOString().slice(0, 19)}`,
        format: (type, id, name, account_id, responses) => {
            const solves = responses[0].data
            const categories = []

            for (let i = 0; i < solves.length; i++) {
                categories.push(solves[i].challenge.category)
            }

            const keys = categories.filter((elem, pos) => {
                return categories.indexOf(elem) == pos
            })

            const counts = []
            for (let i = 0; i < keys.length; i++) {
                let count = 0
                for (let x = 0; x < categories.length; x++) {
                    if (categories[x] == keys[i]) {
                        count++
                    }
                }
                counts.push(count)
            }

            return [{
                values: counts,
                labels: keys,
                hole: 0.4,
                type: 'pie'
            }]
        }
    },

    '#keys-pie-graph': {
        layout: {
            title: 'Solve Percentages',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            legend: {
                'orientation': 'h',
            },
            width: '50%',
            height: '450px',
        },
        fn: (type, id, name, account_id) => `CTFd_submissions_${type}_${name}_${id}_${(new Date).toISOString().slice(0, 19)}`,
        format: (type, id, name, account_id, responses) => {
            const solves_count = responses[0].data.length
            const fails_count = responses[1].meta.count

            return [{
                values: [solves_count, fails_count],
                labels: ['Solves', 'Fails'],
                marker: {
                    colors: [
                        'rgb(0, 209, 64)',
                        'rgb(207, 38, 0)'
                    ]
                },
                hole: 0.4,
                type: 'pie'
            }]
        }
    }

}

const config = {
    displaylogo: false,
    responsive: true,
}

const createGraphs = (type, id, name, account_id) => {

    for(let key in graph_configs) {
        const cfg = graph_configs[key]

        const elem = $(key)
        elem.empty()
        elem[0].fn = cfg.fn(type, id, name, account_id)

        Plotly.newPlot(elem[0], [], cfg.layout, config)
    }
}

const updateGraphs = (type, id, name, account_id) => {
    let [solves_func, fails_func, awards_func] = api_funcs[type]

    Promise.all([solves_func(account_id), fails_func(account_id), awards_func(account_id)]).then((responses) => {
        for(let key in graph_configs) {
            const cfg = graph_configs[key]

            const elem = $(key)
            const data = cfg.format(type, id, name, account_id, responses)
            Plotly.react(elem[0], data, cfg.layout, config)
        }
    })
}

$(() => {
    let type, id, name, account_id
    ({type, id, name, account_id} = window.stats_data)

    setInterval(() => {
        updateGraphs(type, id, name, account_id)
    }, 3000) // Update graphs every 5 minutes
    createGraphs(type, id, name, account_id)
    // updateGraphs(type, id, name, account_id)
})
