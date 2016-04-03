/**
 *
 * Easy-pdf library
 * Make pdf reports, based on different source type
 *
 * Created by Andriy Ermolenko on 2/24/15.
 */

(function() {

    /**
     * Import dependencies
     */

    var fs = require('fs');
    var util = require('util');
    var idGenerator = require('shortid');
    var jade  = require('jade');
    var path = require('path');
    var _ = require('underscore');
    var async = require('async');

    /**
     * Defines
     */

    // path to template
    var DEFAULT_TPL = path.join(__dirname, './templates/main.jade');

    /**
     * Additional functions
     */

    /**
     * Make 2powX
     *
     * @param val
     * @return {number}
     */
    var bin = function (val) {
        return Math.pow(2, val);
    };

    /**
     * Exclude borders with 'none-border
     *
     * @param mask
     * @return {{}}
     */
    var checkBorder = function(mask) {
        var borders = ['border-top','border-right', 'border-bottom', 'border-left'];
        var res = {};
        for (var i = 0; i < 4; i++) {
            if (!(mask & bin(i))) res[borders[i]] = 'none';
        }
        return res;
    };

    /**
     * Replace object.style with real style
     * @param obj
     * @return {*}
     */
    var parseStyle = function (obj) {
        var clone = _.clone(obj);
        if (obj.style) {
            var style = obj.style;
            clone.style = {
                "font-family": style.fontFamily,
                "font-size": style.fontSize + "px",
                "font-weight": (style.mask & bin(4)) ? "bold" : "normal",
                "font-style": (style.mask & bin(5)) ? "italic" : "normal",
                "text-decoration": (((style.mask & bin(6)) ? "underline " : "") + ((style.mask & bin(7)) ? "line-through" : "")),
                "text-align": style.textAlign,
                "color": style.color,
                "background-color": style.backgroundColor,
                "border": [style.borderWidth + "px", style.borderStyle, style.borderColor].join(" "),
                "padding": style.padding.join("px ") + "px"
            };
            _.extend(clone.style, checkBorder(style.mask));
        }
        // init style if null
        clone.style || (clone.style = {});
        return clone;
    };

    /**
     * Main Library
     */

    function Reporter() {
        // attributes section
        this._id = 0;
        this.author = 'Default author';
        this.columns = [];
        this.names = [];
        this.records = [];
        this.border = '7mm';
        this.header = {
            height: '10mm'
        };
        this.footer = {
            height: '5mm'
        };
        this.options = {
            fontSize: '12px',
            columns: {
                style: {}
            },
            orientation: 'portrait',
            types: ['pdf'],
            format: 'Letter'
        };
    }

    /**
     * init report structure
     * @param data
     */
    Reporter.prototype.init = function(data) {
        // static data
        var headerContent = '<div style="text-align: center;">Author: %s</div>';
        var footerContent = '<div style="font-size: 12px">%s</div>';
        // default paging and time templates
        var paging = '<div style="float: right"><span>page {{page}}</span>of <span>{{pages}}</span></div> ';
        var time = '<span style="float: left;"> %s </span>';
        var defaultFooterContent = '';
        // set doc id (fileName)
        this._id = data.fileName || idGenerator.generate();
        // set footer data (author)
        data.author && (this.header.contents = util.format(headerContent, data.author));
        // set header data
        data.options.paging && (defaultFooterContent += paging);
        data.options.time && (defaultFooterContent += util.format(time, (new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())));
        '' !== defaultFooterContent && (this.footer.contents = util.format(footerContent, defaultFooterContent));
        // set header height
        data.headerHeight && (this.header.height = data.headerHeight);
        // set footer height
        data.footerHeight && (this.footer.height = data.footerHeight);
        // set report data ([[]])
        data.records && (this.records = data.records);
        // set selected names of columns
        data.names && (this.names = _.map(data.names, parseStyle));
        // fix names if they were not selected by default
        data.names || (this.names = _.map(data.columns, function(el) {
            return {
                name: el,
                value: el
            }
        }));
        // set ALL list of columns
        data.columns && (this.columns = data.columns);
        // set report title
        data.title && (this.title = parseStyle(data.title));
        // set report description (optional parameter)
        data.desc && (this.description = data.desc);
        // set report mode
        data.options.mode && (this.options.orientation = data.options.mode);
        // set output format
        data.options.types && (this.options.types = data.options.types);
        // set font size
        data.options.fontSize && (this.options.fontSize = data.options.fontSize);
        // set columns style
        data.options.columns && (this.options.columns = parseStyle(data.options.columns));
        // init file extension adaptors
        this.initAdaptors();
        // return initialized
        return this;
    };

    Reporter.prototype.initAdaptors = function() {
        var _this = this;
        _this.types = [];
        var adaptors = fs.readdirSync(path.join(__dirname, 'ext'));
        _.each(_.map(adaptors, function(el) {
            var p = path.resolve(__dirname, 'ext', el);
            return '.' + path.sep + path.relative(__dirname, p).replace('.js', '');
        }), function(mod) {
            var m = require(mod);
            if ((m.types) && (m.types.length > 0)) {
                for (var j=0;j<m.types.length;j++) {
                    _this.types.push({
                        name: m.types[j],
                        module: m
                    })
                }
            }
        })
    };

    /**
     * Get list of columns
     * @return {*}
     */
    Reporter.prototype.getColumns = function() {
        return this.columns;
    };

    /**
     * Get title
     * @return {string}
     */
    Reporter.prototype.getTitle = function() {
        return this.title;
    };

    /**
     * Generate HTML from data
     * @param options - additional options
     * @return {*}
     */
    Reporter.prototype.generateHTML = function(options) {
        var object = _.extend(this, options);
        return jade.compileFile(DEFAULT_TPL)(object);
    };

    /**
     * Generate HTML without Doctype
     * @return {*}
     */
    Reporter.prototype.generateInnerHTML = function() {
        return this.generateHTML({excludeLayout: true});
    };

    /**
     * Get adaptor for selected type
     * @param t
     * @return
     */
    Reporter.prototype.getAdaptor = function(t) {
        var o = _.find(this.types, function(type) {
            return type.name == t;
        });
        return (o == null) ? o : o.module;
    };

    /**
     * Write result data to file
     * @param dist (optional)
     * @param name (optional)
     * @param callback (optional)
     */
    Reporter.prototype.write = function(dist, name, callback) {
        var _that = this;
        var types = this.options.types;
        var html = _that.generateHTML();
        // fix if not array
        Array.isArray(types) || (types = [types]);
        async.mapSeries(types, function(t, callback) {
            var fileName = path.join(dist || '', name || _that._id + '.' + t);
            var module = _that.getAdaptor(t);
            if (!module) {
                throw "Unsupported output type";
            }
            else {
                var options = _.extend(_that, {
                    type: t
                });
                module.generate(html, options, fileName);
            }
            callback(null, {
                name: _that._id,
                type: t
            });
        }, function(err, res){
            if (callback) callback(res);
        });
    };

    /**
     * Generate all supported reports
     * @param dist
     * @param name
     * @param callback
     */
    Reporter.prototype.writeAll = function(dist, name, callback) {
        if (typeof dist === "function") {
            callback = dist;
            dist = null;
        }
        this.options.types = _.map(this.types, function(t) {
            return t.name;
        });
        this.write(dist, name, callback);
    };

    module.exports = new Reporter();
}());