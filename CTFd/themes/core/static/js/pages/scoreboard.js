import $ from 'jquery'
import CTFd from 'CTFd'
import Plotly from 'plotly'
import Moment from 'moment'
import { htmlEntities, cumulativeSum, colorHash } from 'utils'

const updateScores = () => {
    CTFd.api.get_scoreboard_list().then((response) => {
        const teams = response.data
        const table = $('#scoreboard tbody')
        table.empty()

        for (let i = 0; i < teams.length; i++) {
            const row = '<tr>\n' +
                '<th scope="row" class="text-center">{0}</th>'.format(i + 1) +
                '<td><a href="{0}/team/{1}">{2}</a></td>'.format(CTFd.config.urlRoot, teams['standings'][i].id, htmlEntities(teams['standings'][i].team)) +
                '<td>{0}</td>'.format(teams['standings'][i].score) +
                '</tr>'
            table.append(row)
        }
    })
}

const updateGraph = () => {
    CTFd.api.get_scoreboard_detail((response) => {
        const places = response.data

        if (Object.keys(places).length === 0 ) {
            // Replace spinner
            $('#score-graph').html(
                '<div class="text-center"><h3 class="spinner-error">No solves yet</h3></div>'
            )
            return
        }

        const teams = Object.keys(places)
        const traces = []
        for(let i = 0; i < teams.length; i++) {
            const team_score = []
            const times = []
            for(let j = 0; j < places[teams[i]]['solves'].length; j++) {
                team_score.push(places[teams[i]]['solves'][j].value)
                const date = Moment(places[teams[i]]['solves'][j].date)
                times.push(date.toDate())
            }
            const trace = {
                x: times,
                y: cumulativeSum(team_score),
                mode: 'lines+markers',
                name: places[teams[i]]['name'],
                marker: {
                    color: colorHash(places[teams[i]]['name'] + places[teams[i]]['id']),
                },
                line: {
                    color: colorHash(places[teams[i]]['name'] + places[teams[i]]['id']),
                }
            }
            traces.push(trace)
        }

        traces.sort((a, b) => {
            const score_diff = b['y'][b['y'].length - 1] - a['y'][a['y'].length - 1]
            if(!score_diff) {
                return a['x'][a['x'].length - 1] - b['x'][b['x'].length - 1]
            }
            return score_diff
        })

        const layout = {
            title: 'Top 10 Teams',
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
        }

        $('#score-graph').empty() // Remove spinners
        document.getElementById('score-graph').fn = 'CTFd_scoreboard_' + (new Date).toISOString().slice(0,19)
        Plotly.newPlot('score-graph', traces, layout, {
            displaylogo: false
        })
    })
}

function update() {
    updateScores()
    updateGraph()
}

setInterval(update, 300000) // Update scores every 5 minutes
update()

$(window).resize($.throttle(250, () => {
    Plotly.Plots.resize(document.getElementById('score-graph'))
}))
