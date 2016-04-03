var _ = {};
var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
};
var escapeRegexp = new RegExp('[' + Object.keys(escapeMap).join('') + ']', 'g');
_.escape = function(string) {
    if (!string) return '';
    return String(string).replace(escapeRegexp, function(match) {
        return escapeMap[match];
    });
};
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<?xml version="1.0" encoding="utf-8"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body>\n    <w:altChunk r:id="htmlChunk" xmlns:r=\n        "http://schemas.openxmlformats.org/officeDocument/2006/relationships" />\n    <w:sectPr>\n      <w:pgSz w:w="' +
((__t = ( width )) == null ? '' : __t) +
'" w:h="' +
((__t = ( height )) == null ? '' : __t) +
'" w:orient="' +
((__t = ( orient )) == null ? '' : __t) +
'" />\n      <w:pgMar w:top="' +
((__t = ( margins.top )) == null ? '' : __t) +
'"\n               w:right="' +
((__t = ( margins.right )) == null ? '' : __t) +
'"\n               w:bottom="' +
((__t = ( margins.bottom )) == null ? '' : __t) +
'"\n               w:left="' +
((__t = ( margins.left )) == null ? '' : __t) +
'"\n               w:header="' +
((__t = ( margins.header )) == null ? '' : __t) +
'"\n               w:footer="' +
((__t = ( margins.footer )) == null ? '' : __t) +
'"\n               w:gutter="' +
((__t = ( margins.gutter )) == null ? '' : __t) +
'"/>\n    </w:sectPr>\n  </w:body>\n</w:document>\n';

}
return __p
}