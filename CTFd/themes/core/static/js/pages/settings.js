import $ from 'jquery'
import CTFd from 'CTFd'

const error_template = '<div class="alert alert-danger alert-dismissable" role="alert">\n' +
'  <span class="sr-only">Error:</span>\n' +
'  {0}\n' +
'  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>\n' +
'</div>'

const success_template = '<div class="alert alert-success alert-dismissable submit-row" role="alert">\n' +
'  <strong>Success!</strong>\n' +
'   Your profile has been updated\n' +
'  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>\n' +
'</div>'


$(() => {
    const form = $('#user-settings-form')
    form.submit((e) => {
        e.preventDefault()
        $('#results').empty()
        const params = $('#user-settings-form').serializeJSON(true)

        CTFd.api.patch_user_private(params).then((response) => {
            if (response.status === 400) {
                response.then(function (object) {
                    if (!object.success){
                        Object.keys(object.errors).map(function(error){
                            const i = form.find('input[name={0}]'.format(error))
                            const input = $(i)
                            input.addClass('input-filled-invalid')
                            input.removeClass('input-filled-valid')
                            const error_msg = object.errors[error]
                            $('#results').append(error_template.format(error_msg))
                        })
                    }
                })
            } else if (response.status === 200) {
                response.then(function (object) {
                    if (object.success) {
                        $('#results').html(success_template)
                    }
                })
            }
        })
    })
})
