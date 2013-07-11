
var MCS = require("montage/core/component-sheet");

Error.stackTraceLimit = 100;

var specs = [
    {
        sheet: "\n@foo < 'module' Module {\n}\n\n",
        serialization: {
            foo: {
                prototype: "module[Module]"
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block",
                label: "foo",
                module: "module",
                exports: {type: "property", args: [
                    {type: "value"},
                    {type: "literal", value: "Module"},
                ]},
                connection: "prototype",
                statements: []
            }
        ]}
    },

    {
        sheet: "\n@foo : 'module' {\n}\n\n",
        serialization: {
            foo: {
                object: "module"
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block",
                label: "foo",
                module: "module",
                connection: "object",
                statements: []
            }
        ]}
    },

    {
        sheet: "\n@foo {\n    a <-> b;\n}\n\n",
        serialization: {
            foo: {
                bindings: {
                    "a": {
                        "<->": "b"
                    }
                }
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block", label: "foo", statements: [
                {type: "bind2", args: [
                    {type: "property", args: [
                        {type: "value"},
                        {type: "literal", value: "a"}
                    ]},
                    {type: "property", args: [
                        {type: "value"},
                        {type: "literal", value: "b"}
                    ]}
                ]}
            ]}
        ]}
    },

    {
        sheet: "\n@foo {\n    a <-> b, converter: @converter;\n}\n\n",
        serialization: {
            foo: {
                bindings: {
                    "a": {
                        "<->": "b",
                        converter: {"@": "converter"}
                    }
                }
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block", label: "foo", statements: [
                {type: "bind2", args: [
                    {type: "property", args: [
                        {type: "value"},
                        {type: "literal", value: "a"}
                    ]},
                    {type: "property", args: [
                        {type: "value"},
                        {type: "literal", value: "b"}
                    ]}
                ], descriptor: {
                    converter: {type: "component", label: "converter"}
                }}
            ]}
        ]}
    },

    {
        sheet: "\n@foo {\n    a: 10;\n}\n\n",
        serialization: {
            foo: {
                properties: {
                    a: 10
                }
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block", label: "foo", statements: [
                {type: "assign", args: [
                    {type: "property", args: [
                        {type: "value"},
                        {type: "literal", value: "a"}
                    ]},
                    {type: "literal", value: 10}
                ]}
            ]}
        ]}
    },

    {
        sheet: "\n@foo {\n    on action -> @foo;\n}\n\n",
        serialization: {
            foo: {
                listeners: [
                    {
                        type: "action",
                        listener: {"@": "foo"}
                    }
                ]
            }
        },
        syntax: {type: "sheet", blocks: [
            {type: "block", label: "foo", statements: [
                {
                    type: "event",
                    event: "action",
                    when: "on",
                    listener: {type: "component", label: "foo"}
                }
            ]}
        ]}
    }

];

specs.forEach(function (spec) {
    spec.name = spec.sheet.replace(/\s+/g, " ");
});

describe("montage component sheets", function () {

    describe("componentSheetToSerialization", function () {
        specs.forEach(function(spec) {
            it("should translate " + spec.name, function () {
                var serialization = MCS.componentSheetToSerialization(spec.sheet);
                expect(serialization).toEqual(spec.serialization);
            });
        });
    });

    describe("serializationToComponentSheet", function () {
        specs.forEach(function(spec) {
            it("should translate " + spec.name, function () {
                var sheet = MCS.serializationToComponentSheet(spec.serialization);
                expect(sheet).toEqual(spec.sheet);
            });
        });
    });

    describe("serializationToComponentSheet", function () {
        specs.forEach(function(spec) {
            it("should translate " + spec.name, function () {
                var syntax = MCS._serializationToFrbSyntax(spec.serialization);
                expect(syntax).toEqual(spec.syntax);
            });
        });
    });

});

