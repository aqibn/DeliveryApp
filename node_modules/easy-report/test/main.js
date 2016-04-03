/**
 * Created by Andriy Ermolenko on 24.03.15.
 */
var reporter = require('../lib');

var DEFAULT_TITLE_STYLE = {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderStyle: "solid",
    borderWidth: 1,
    color: "#000",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 19,
    mask: 0,
    textAlign: "left",
    verticalAlign: "top",
    padding: [0, 0, 0, 0]
};

var DEFAULT_COL_HEADER_STYLE =  {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderStyle: "solid",
    borderWidth: 1,
    color: "#111",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 20,
    mask: parseInt('10000', 2),
    textAlign: "left",
    verticalAlign: "top",
    padding: [0, 0, 0, 0]
};

var DEFAULT_COL_DATA_STYLE = {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderStyle: "solid",
    borderWidth: 1,
    color: "#111",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 20,
    mask: parseInt('10000', 2),
    textAlign: "left",
    verticalAlign: "top",
    padding: [0, 0, 0, 0]
};

var report = reporter.init({
    title: {
        value: 'Report1',
        style: DEFAULT_TITLE_STYLE
    },
    author: 'Andrew',
    names: [
        {name: 'a', value: 'AAA', style: DEFAULT_COL_HEADER_STYLE},
        {name: 'c', value: 'Something else', style: DEFAULT_COL_HEADER_STYLE},
        {name: 'v', value: 'Another', style: DEFAULT_COL_HEADER_STYLE}
    ],
    columns: ['a','b','c','v'],
    records: [
        [1, 2, 3, 3453345345345345],
        [2, 3, 4, 346346346],
        [3, 2, 3, 346346346346],
        [12, 45, 5, 46346346346346],
        [1, 2, 3, 3464634634634],
        [2, 3, 4, 4643634634634],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346],
        [3, 2, 3, 46346346346346]
    ],
    options: {
        fontSize: '16px',
        columns: {
            style: DEFAULT_COL_DATA_STYLE
        },
        mode: 'portrait',
        paging: true,
        time: true,
        types: ["pdf"]
    }

});
if (!process.env.LOG) report.writeAll(function(res){
    console.log(res)
});
else console.log(report.generateInnerHTML());