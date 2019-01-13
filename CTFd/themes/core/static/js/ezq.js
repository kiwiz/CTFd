let modal = '<div class="modal fade" tabindex="-1" role="dialog">' +
    '  <div class="modal-dialog" role="document">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h5 class="modal-title">\{0\}</h5>' +
    '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    '          <span aria-hidden="true">&times;</span>' +
    '        </button>' +
    '      </div>' +
    '      <div class="modal-body">' +
    '        <p>\{1\}</p>' +
    '      </div>' +
    '      <div class="modal-footer">' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>';


let progress = '<div class="progress">' +
    '  <div class="progress-bar progress-bar-success progress-bar-striped progress-bar-animated" role="progressbar" style="width: \{0\}%">' +
    '  </div>' +
    '</div>';


let error_template = "<div class=\"alert alert-danger alert-dismissable\" role=\"alert\">\n" +
    "  <span class=\"sr-only\">Error:</span>\n" +
    "  \{0\}\n" +
    "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n" +
    "</div>";


let success_template = "<div class=\"alert alert-success alert-dismissable submit-row\" role=\"alert\">\n" +
    "  <strong>Success!</strong>\n" +
    "  \{0\}\n" +
    "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n" +
    "</div>";


exports.ezAlert = (args) => {
    let res = modal.format(args.title, args.body);
    let obj = $(res);
    let button = '<button type="button" class="btn btn-primary" data-dismiss="modal">{0}</button>'.format(args.button);

    obj.find('.modal-footer').append(button);
    $('main').append(obj);

    obj.modal('show');

    $(obj).on('hidden.bs.modal', function (e) {
        $(this).modal('dispose');
    });

    return obj;
}

exports.ezQuery = (args) => {
    let res = modal.format(args.title, args.body);
    let obj = $(res);
    let deny = '<button type="button" class="btn btn-danger" data-dismiss="modal">No</button>';
    let confirm = $('<button type="button" class="btn btn-primary" data-dismiss="modal">Yes</button>');

    obj.find('.modal-footer').append(deny);
    obj.find('.modal-footer').append(confirm);

    $('main').append(obj);

    $(obj).on('hidden.bs.modal', function (e) {
        $(this).modal('dispose');
    });

    $(confirm).click(function(){
        args.success();
    });

    obj.modal('show');

    return obj;
}

exports.ezProgressBar = (args) => {
    let bar = progress.format(args.width);
    let res = modal.format(args.title, bar);

    let obj = $(res);
    $('main').append(obj);

    return obj.modal('show');
}

exports.ezBadge = (args) => {
    let type = args.type;
    let body = args.body;
    let tpl = undefined;
    if (type === 'success') {
        tpl = success_template;
    } else if (type === 'error') {
        tpl = error_template;
    }

    tpl = tpl.format(body);
    let obj = $(tpl);
    return obj;
}
