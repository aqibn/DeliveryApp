var fs = require('fs');

var docx = require('html-docx-js');

module.exports = {
    types: ['docx'],
    generate: function(html, options, fileName) {
        var docxObj = docx.asBlob(html);
        fs.writeFile(fileName, docxObj, function(err) {
            if (err) throw err;
        });
    }
};