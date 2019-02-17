import './main'
import nunjucks from 'nunjucks'
import MarkdownIt from 'markdown-it'
import { ezQuery, ezAlert } from '../ezq'
import { htmlEntities } from '../util'
import Moment from 'moment'
import $ from 'jquery'
import CTFd from '../CTFd'
import config from '../config'


// CTFD user_mode, user

const api_func = {
    'team': (x) => CTFd.api.get_team_solves({teamId: x}),
    'user': (x) => CTFd.api.get_user_solves({userId: x}),
}

const md = MarkdownIt({html: true})

let challenges = []
let challenge = null
let solves = []

const loadChal = (id) => {
    const chal = $.grep(challenges, (chal) => chal.id == id)[0]

    if (chal.type === 'hidden') {
        ezAlert({
            title: 'Challenge Hidden!',
            body: "You haven't unlocked this challenge yet!",
            button: 'Got it!'
        })
        return
    }

    displayChal(chal)
}

const loadChalByName = (name) => {
    const chal = $.grep(challenges, (chal) => chal.name == name)[0]

    displayChal(chal)
}

const displayChal = (chal) => {
    new Promise.all([
        CTFd.api.get_challenge(chal.id),
        $.getScript(config.urlRoot + chal.script),
        $.get(config.urlRoot + chal.template),
    ]).then((responses) => {
        const challenge_data = responses[0].data
        const template_data = responses[2].data

        $('#challenge-window').empty()
        const template = nunjucks.compile(template_data)
        challenge.data = challenge_data
        challenge.preRender()

        challenge_data['description'] = challenge.render(challenge_data['description'])
        challenge_data['script_root'] = CTFd.config.urlRoot

        $('#challenge-window').append(template.render(challenge_data))

        $('.challenge-solves').click(function(event) {
            getSolves($('#challenge-id').val())
        })
        $('.nav-tabs a').click(function(event) {
            event.preventDefault()
            $(this).tab('show')
        })

        // Handle modal toggling
        $('#challenge-window').on('hide.bs.modal', function(event) {
            $('#submission-input').removeClass('wrong')
            $('#submission-input').removeClass('correct')
            $('#incorrect-key').slideUp()
            $('#correct-key').slideUp()
            $('#already-solved').slideUp()
            $('#too-fast').slideUp()
        })

        $('#submit-key').click(function(event) {
            event.preventDefault()
            $('#submit-key').addClass('disabled-button')
            $('#submit-key').prop('disabled', true)
            challenge.submit((data) => {
                renderSubmissionResponse(data)
                loadChals()
                    .then(markSolves)
            })
        })

        $('#submission-input').keyup((event) => {
            if (event.keyCode == 13) {
                $('#submit-key').click()
            }
        })

        $('.input-field').bind({
            focus: function() {
                $(this).parent().addClass('input--filled')
            },
            blur: function() {
                const $this = $(this)
                if ($this.val() === '') {
                    $this.parent().removeClass('input--filled')
                    let $label = $this.siblings('.input-label')
                    $label.removeClass('input--hide')
                }
            }
        })

        challenge.postRender()

        window.location.replace(window.location.href.split('#')[0] + '#' + chal.name)
        $('#challenge-window').modal()
    })
}

function renderSubmissionResponse(response) {
    var result = response.data

    var result_message = $('#result-message')
    var result_notification = $('#result-notification')
    var answer_input = $('#submission-input')
    result_notification.removeClass()
    result_message.text(result.message)

    if (result.status === 'authentication_required') {
        window.location = CTFd.config.urlRoot + '/login?next=' + CTFd.config.urlRoot + window.location.pathname + window.location.hash
        return
    }
    else if (result.status === 'incorrect') { // Incorrect key
        result_notification.addClass('alert alert-danger alert-dismissable text-center')
        result_notification.slideDown()

        answer_input.removeClass('correct')
        answer_input.addClass('wrong')
        setTimeout(function () {
            answer_input.removeClass('wrong')
        }, 3000)
    }
    else if (result.status === 'correct') { // Challenge Solved
        result_notification.addClass('alert alert-success alert-dismissable text-center')
        result_notification.slideDown()

        $('.challenge-solves').text((parseInt($('.challenge-solves').text().split(' ')[0]) + 1 + ' Solves'))

        answer_input.val('')
        answer_input.removeClass('wrong')
        answer_input.addClass('correct')
    }
    else if (result.status === 'already_solved') { // Challenge already solved
        result_notification.addClass('alert alert-info alert-dismissable text-center')
        result_notification.slideDown()

        answer_input.addClass('correct')
    }
    else if (result.status === 'paused') { // CTF is paused
        result_notification.addClass('alert alert-warning alert-dismissable text-center')
        result_notification.slideDown()
    }
    else if (result.status === 'ratelimited') { // Keys per minute too high
        result_notification.addClass('alert alert-warning alert-dismissable text-center')
        result_notification.slideDown()

        answer_input.addClass('too-fast')
        setTimeout(function () {
            answer_input.removeClass('too-fast')
        }, 3000)
    }
    setTimeout(function () {
        $('.alert').slideUp()
        $('#submit-key').removeClass('disabled-button')
        $('#submit-key').prop('disabled', false)
    }, 3000)
}

function markSolves() {
    return api_func[CTFd.config.userMode].then(function (response) {
        const solves = response.data
        for (let i = solves.length - 1; i >= 0; i--) {
            const btn = $('button[value="' + solves[i].challenge_id + '"]')
            btn.addClass('solved-challenge')
            btn.prepend('<i class=\'fas fa-check corner-button-check\'></i>')
        }
    })
}

function loadUserSolves() {
    if (CTFd.user.id == 0) {
        return Promise.resolve()
    }

    return api_func[CTFd.config.userMode].then(function(response) {
        var solves = response.data

        for (var i = solves.length - 1; i >= 0; i--) {
            var chal_id = solves[i].challenge_id
            solves.push(chal_id)

        }
    })
}

function getSolves(id) {
    return CTFd.api.get_challenge_solves({id: id}).then((response) => {
        const data = response.data
        $('.challenge-solves').text(
            (parseInt(data.length) + ' Solves')
        )
        var box = $('#challenge-solves-names')
        box.empty()
        for (var i = 0; i < data.length; i++) {
            var id = data[i].account_id
            var name = data[i].name
            var date = Moment(data[i].date).local().fromNow()
            var account_url = data[i].account_url
            box.append('<tr><td><a href="{0}">{2}</td><td>{3}</td></tr>'.format(account_url, id, htmlEntities(name), date))
        }
    })
}

function loadChals() {
    return CTFd.get_challenge_list().then(function (response) {
        var categories = []
        challenges = response.data

        $('#challenges-board').empty()

        for (var i = challenges.length - 1; i >= 0; i--) {
            challenges[i].solves = 0
            if ($.inArray(challenges[i].category, categories) == -1) {
                var category = challenges[i].category
                categories.push(category)

                var categoryid = category.replace(/ /g, '-').hashCode()
                var categoryrow = $('' +
                    '<div id="{0}-row" class="pt-5">'.format(categoryid) +
                    '<div class="category-header col-md-12 mb-3">' +
                    '</div>' +
                    '<div class="category-challenges col-md-12">' +
                    '<div class="challenges-row col-md-12"></div>' +
                    '</div>' +
                    '</div>')
                categoryrow.find('.category-header').append($('<h3>' + category + '</h3>'))

                $('#challenges-board').append(categoryrow)
            }
        }

        for (let i = 0; i <= challenges.length - 1; i++) {
            const chalinfo = challenges[i]
            const chalid = chalinfo.name.replace(/ /g, '-').hashCode()
            const catid = chalinfo.category.replace(/ /g, '-').hashCode()
            const chalwrap = $('<div id=\'{0}\' class=\'col-md-3 d-inline-block\'></div>'.format(chalid))
            let chalbutton

            if (solves.indexOf(chalinfo.id) == -1) {
                chalbutton = $('<button class=\'btn btn-dark challenge-button w-100 text-truncate pt-3 pb-3 mb-2\' value=\'{0}\'></button>'.format(chalinfo.id))
            } else {
                chalbutton = $('<button class=\'btn btn-dark challenge-button solved-challenge w-100 text-truncate pt-3 pb-3 mb-2\' value=\'{0}\'><i class=\'fas fa-check corner-button-check\'></i></button>'.format(chalinfo.id))
            }

            const chalheader = $('<p>{0}</p>'.format(chalinfo.name))
            const chalscore = $('<span>{0}</span>'.format(chalinfo.value))
            for (var j = 0; j < chalinfo.tags.length; j++) {
                var tag = 'tag-' + chalinfo.tags[j].value.replace(/ /g, '-')
                chalwrap.addClass(tag)
            }

            chalbutton.append(chalheader)
            chalbutton.append(chalscore)
            chalwrap.append(chalbutton)

            $('#' + catid + '-row').find('.category-challenges > .challenges-row').append(chalwrap)
        }

        $('.challenge-button').click(function (event) {
            loadChal(this.value)
            getSolves(this.value)
        })
    })
}


function update() {
    return loadUserSolves() // Load the user's solved challenge ids
        .then(loadChals) //  Load the full list of challenges
}

$(() => {
    update().then(() => {
        if (window.location.hash.length > 0) {
            loadChalByName(decodeURIComponent(window.location.hash.substring(1)))
        }
    })

    $('#submission-input').keyup(function(event) {
        if (event.keyCode == 13) {
            $('#submit-key').click()
        }
    })

    $('.nav-tabs a').click(function(event) {
        event.preventDefault()
        $(this).tab('show')
    })

    $('#challenge-window').on('hidden.bs.modal', function(event) {
        $('.nav-tabs a:first').tab('show')
        history.replaceState('', window.document.title, window.location.pathname)
    })

    $('#submit-key').click(function (event) {
        submitKey($('#challenge-id').val(), $('#submission-input').val(), $('#nonce').val())
    })

    $('.challenge-solves').click(function (event) {
        getSolves($('#challenge-id').val())
    })

    $('#challenge-window').on('hide.bs.modal', function (event) {
        $('#submission-input').removeClass('wrong')
        $('#submission-input').removeClass('correct')
        $('#incorrect-key').slideUp()
        $('#correct-key').slideUp()
        $('#already-solved').slideUp()
        $('#too-fast').slideUp()
    })
})
setInterval(update, 300000) // Update every 5 minutes.

const displayHint = (data) => {
    ezAlert({
        title: 'Hint',
        body: md.render(data.content),
        button: 'Got it!',
    })
}

const displayUnlock = (id) => {
    ezQuery({
        title: 'Unlock Hint?',
        body: 'Are you sure you want to open this hint?',
        success: () => {
            const params = {
                target: id,
                type: 'hints'
            }
            CTFd.api.post_unlock_list(params).then((response) => {
                if (response.success) {
                    CTFd.api.get_hint({hintId: id}).then((response) => {
                        displayHint(response.data)
                    })

                    return
                }

                ezAlert({
                    title: 'Error',
                    body: md.render(response.errors.score),
                    button: 'Got it!'
                })
            })
        }
    })
}

const hint = (id) => {
    CTFd.api.get_hint({hintId: id}).then((response) => {
        if (response.data.content) {
            displayHint(response.data)
            return
        }

        displayUnlock(id)
    })
}
