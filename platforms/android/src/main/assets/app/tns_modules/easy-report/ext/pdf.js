var pdf = require('html-pdf');
var fs = require('fs');

module.exports = {
    types: ['pdf'],
    generate: function(html, options, fileName) {
        var obj = options;
        var ws = fs.createWriteStream(fileName);
        pdf.create(html, {
            border: obj.border,
            orientation: obj.options.orientation,
            header: obj.header,
            footer: obj.footer,
            type: obj.options.type,
            format: obj.options.format
        }).toStream(function(err, stream) {
            if (!err) stream.pipe(ws);
            else console.log(err);
        });
    }
};