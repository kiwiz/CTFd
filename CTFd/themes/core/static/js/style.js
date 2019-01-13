import $ from 'jquery'

exports.default = () => {
    $('.form-control').bind({
        focus: () => {
            $(this).removeClass('input-filled-invalid')
            $(this).addClass('input-filled-valid' )
        },
        blur: () => {
            if ($(this).val() === '') {
                $(this).removeClass('input-filled-invalid')
                $(this).removeClass('input-filled-valid')
            }
        }
    })

    $('.form-control').each(() => {
        if ($(this).val()) {
            $(this).addClass('input-filled-valid')
        }
    })
}
