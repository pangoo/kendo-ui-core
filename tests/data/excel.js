(function(){

var Exporter = kendo.data.ExcelExporter;
var DataSource = kendo.data.DataSource;
var exporter;
var dataSource;

module("excel exporter", {

});

function testWorkbook(options, callback) {
    exporter = new Exporter(options);

    exporter.workbook().then(callback);
}

test("returns a promise", function() {
    exporter = new Exporter({
        dataSource: {}
    });

    equal(typeof exporter.workbook().then, "function");
});

test("clones the data source option", function() {
    dataSource = new DataSource();

    exporter = new Exporter({
        dataSource: dataSource
    });

    ok(exporter.dataSource);
    ok(exporter.dataSource !== dataSource);
});

test("resolves the promise with a workbook as the argument", 1, function() {
    testWorkbook({ dataSource: [] }, function(book) {
       ok(book instanceof kendo.ooxml.Workbook) ;
    });
});

test("sets the columns option of the workbook", 1, function() {
    testWorkbook({ columns: [ { width: 100 } ], dataSource: [] }, function(book) {
        equal(book.sheets[0].columns[0].width, 100);
    });
});

test("sets autoWidth if the column width isn't set", 1, function() {
    testWorkbook({ columns: [ { } ], dataSource: [] }, function(book) {
        equal(book.sheets[0].columns[0].autoWidth, true);
    });
});

test("the first row contains the column titles", 2, function() {
    testWorkbook({ columns: [ { title: "foo" }, { title: "bar"} ], dataSource: [] }, function(book) {
        equal(book.sheets[0].rows[0].cells[0].value, "foo");
        equal(book.sheets[0].rows[0].cells[1].value, "bar");
    });
});

test("uses column field when title is not set", 1, function() {
    testWorkbook({ columns: [ { field: "foo" } ], dataSource: [] }, function(book) {
        equal(book.sheets[0].rows[0].cells[0].value, "foo");
    });
});

test("the data source data is exported after the columns", 1, function() {
    testWorkbook({ columns: [ { field: "foo" } ], dataSource: [{ foo: "bar" }] }, function(book) {
        equal(book.sheets[0].rows[1].cells[0].value, "bar");
    });
});

test("the type of data rows is set to 'data'", function() {
    testWorkbook({ columns: [ { field: "foo" } ], dataSource: [{ foo: "bar" }] }, function(book) {
        equal(book.sheets[0].rows[1].type, "data");
    });
});

test("the type of header row is set to 'header'", function() {
    testWorkbook({ columns: [ { field: "foo" } ], dataSource: [{ foo: "bar" }] }, function(book) {
        equal(book.sheets[0].rows[0].type, "header");
    });
});

test("only data items that match the filter are exported", 2, function() {
    var options = {
        columns: [ { field: "foo" } ],
        dataSource: new DataSource({
            data: [
               { foo: "foo" },
               { foo: "bar" }
            ]
        })
    };

    options.dataSource.read();
    options.dataSource.filter({ field: "foo", operator: "neq", value: "foo" });

    testWorkbook(options, function(book) {
        equal(book.sheets[0].rows.length, 2);
        equal(book.sheets[0].rows[1].cells[0].value, "bar");
    });
});

test("exports current page", 2, function() {
    var options = {
        columns: [ { field: "foo" } ],
        dataSource: new kendo.data.DataSource({
            data: [
               { foo: "foo" },
               { foo: "bar" }
            ],
            pageSize: 1
        })
    };

    options.dataSource.read();
    options.dataSource.page(2);

    testWorkbook(options, function(book) {
        equal(book.sheets[0].rows.length, 2);
        equal(book.sheets[0].rows[1].cells[0].value, "bar");
    });
});

test("exports current pageSize", 2, function() {
    var options = {
        columns: [ { field: "foo" } ],
        dataSource: new kendo.data.DataSource({
            data: [
               { foo: "foo" },
               { foo: "bar" }
            ],
            pageSize: 1
        })
    };

    options.dataSource.read();
    options.dataSource.pageSize(2);

    testWorkbook(options, function(book) {
        equal(book.sheets[0].rows.length, 3);
        equal(book.sheets[0].rows[1].cells[0].value, "foo");
    });
});

test("exports sorted data", function() {
    var options = {
        columns: [ { field: "foo" } ],
        dataSource: new kendo.data.DataSource({
            data: [
               { foo: "foo" },
               { foo: "bar" }
            ]
        })
    };

    options.dataSource.sort({ field: "foo", dir: "asc" });

    testWorkbook(options, function(book) {
        equal(book.sheets[0].rows[1].cells[0].value, "bar");
    });
});

test("freezes first row", function() {
    testWorkbook({ columns: [ { field: "foo" } ], dataSource: [ {} ] }, function(book) {
        equal(book.sheets[0].freezePane.rowSplit, 1);
    });
});

test("enables filtering", function() {
    testWorkbook({ filter: true, columns: [ { field: "foo" } ], dataSource: [ {} ] }, function(book) {
        equal(book.sheets[0].filter, true);
    });
});

test("locked columns set the freezePane", function() {
    testWorkbook({ columns: [ { field: "foo", locked: true }, { locked: true } ], dataSource: [ {} ] }, function(book) {
        equal(book.sheets[0].freezePane.colSplit, 2);
    });
});

test("creates group rows", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: { field: "foo" }
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[1].type, "group");
    });
});

test("sets the value of the group cell to the group field and value", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: { field: "foo" }
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[1].cells[0].value, "foo: boo");
        equal(book.sheets[0].rows[3].cells[0].value, "foo: foo");
    });
});

test("sets colSpan of the group cell to the number of columns", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: { field: "foo" }
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[1].cells[0].colSpan, 3);
    });
});

test("creates data rows for the group items", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: { field: "foo" }
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[2].type, "data");
    });
});

test("creates group rows for nested group items", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: [{ field: "foo" }, { field: "bar" }]
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[1].type, "group");
        equal(book.sheets[0].rows[2].type, "group");
        equal(book.sheets[0].rows[3].type, "data");
    });
});

test("creates padding cells for groups", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: [{ field: "foo" }, { field: "bar" }]
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].rows[0].cells.length, 4);
        equal(book.sheets[0].rows[1].cells.length, 1);
        equal(book.sheets[0].rows[2].cells.length, 2);
        equal(book.sheets[0].rows[3].cells.length, 4);
    });
});

test("creates a column for every group", function() {
    dataSource = new DataSource({
       data: [
           { foo: "foo", bar: "bar" },
           { foo: "boo", bar: "baz" }
       ],
       group: [{ field: "foo" }, { field: "bar" }]
    });

    testWorkbook({ columns: [ { field: "foo" }, { field: "bar" } ], dataSource: dataSource }, function(book) {
        equal(book.sheets[0].columns.length, 4);
    });
});

}());
