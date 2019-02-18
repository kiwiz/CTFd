// Markdown Preview
CTFd.lib.$('#desc-edit').on('shown.bs.tab', function (event) {
    if (event.target.hash == '#desc-preview') {
        var editor_value = CTFd.lib.$('#desc-editor').val()
        CTFd.lib.$(event.target.hash).html(
            CTFd._internal.challenge.render(editor_value)
        )
    }
})
CTFd.lib.$('#new-desc-edit').on('shown.bs.tab', function (event) {
    if (event.target.hash == '#new-desc-preview') {
        var editor_value = CTFd.lib.$('#new-desc-editor').val()
        CTFd.lib.$(event.target.hash).html(
            CTFd._internal.challenge.render(editor_value)
        )
    }
})
CTFd.lib.$('#solve-attempts-checkbox').change(function () {
    if (this.checked) {
        CTFd.lib.$('#solve-attempts-input').show()
    } else {
        CTFd.lib.$('#solve-attempts-input').hide()
        CTFd.lib.$('#max_attempts').val('')
    }
})

CTFd.lib.$(function () {
    CTFd.lib.$('[data-toggle="tooltip"]').tooltip()
})
