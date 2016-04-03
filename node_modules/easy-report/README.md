# easy-report
### Create reports from different sources
[![NPM Version][npm-image]][npm-url]

## Usage
    // import package
    var pdf = require('easy-pdf');
    // init report
    var report = pdf.init(options);
    // write report to file
    var file = report.write(destination, name);
    // generate basic HTML report
    var html = report.generateHTML(dataOptions);
    // generate HTML for include anywhere
    var innerHTML = report.generateInnerHTML();

## Options
```fileName``` - Report fileName (default: [generated id]) <br/>
```title``` - Report title (optional) Example: `{style: {}, value: 'Report1'}`<br/>
```desc```- Report description (optional) <br/>
```records``` - Report data <br/>
```names``` - Report column names, which should be displayed (Array of objects) Example object: `{name: 'user',value: 'User', style: {}}`
```columns``` - All column names of the ```records``` <br/>
```author``` - Report author (optional) <br/>
```headerHeight``` - Report header height (default: `'5mm'`) <br/>
```footerHeight``` - Report footer height (default: `'7mm'`) <br/>
```border``` - Report border (default: `'5mm'`) <br/>
```options``` - Additional options: <br/>
    ```fontSize``` - Report data font size (default: `'12px'`) <br/>
    ```mode``` - Report orientation (default: `'portrait'`) <br/>
    ```types``` - Report types to be created (one or more) (default: ['pdf']) <br/>
    ```format``` - Report format (default: `'A4'`) <br/>
    ```paging``` - Add page numbers (default: `false`) <br/>
    ```time``` - Add report date & time (default: `false`) <br/>
    
## Supported types:
### Current
* pdf
* png (need correcting) 
* jpeg (need correcting)
* docx

### Adding custom output type
To add custom type, just copy the type-adaptor template, and implement it:

    cd ext/
    cp sample.js <your_type>.js 
Configure adapter:

    types: ['supported', 'types']
    
Function which need to be implemented:

    generate: function(html, options, filename) {}
Parameters:    
```html``` - html input <br/>
```options``` - see `Options` <br/>
```fileName``` - output file name
    
## Style class names
```pdf-column``` = column style <br/>
```pdf-list``` = list element style <br/>
```pdf-list-header``` - list element header style <br/>

## Develop
```npm test``` - run test page generator <br/>
```npm run clean``` - clean *.pdf files

## License
### MIT

[npm-image]: https://img.shields.io/npm/v/easy-report.svg
[npm-url]: https://npmjs.org/package/easy-report