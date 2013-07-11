
var stringifyFrbSyntax = require("frb/stringify");
var parseFrbSyntax = require("frb/parse");

var MODE = {
    startRule: "sheet"
};

exports.componentSheetToSerialization =
function componentSheetToSerialization(text) {
    var frbSyntax = parseFrbSyntax(text, MODE);
    return frbSyntaxToSerialization(frbSyntax);
}

exports.serializationToComponentSheet =
function serializationToComponentSheet(serialization) {
    var frbSyntax = serializationToFrbSyntax(serialization);
    return stringifyFrbSyntax(frbSyntax);
}

// # supporting componentSheetToSerialization

exports._frbSyntaxToSerialization = frbSyntaxToSerialization;
function frbSyntaxToSerialization(syntax) {
    if (syntax.type !== "sheet")
        throw new TypeError("Cannot convert to serialization: " + syntax.type);
    var serialization = {};
    syntax.blocks.forEach(function (block) {
        serialization[block.label] = blockToSerialization(block);
    });
    return serialization;
}

exports._blockToSerialization = blockToSerialization;
function blockToSerialization(block) {
    var serialization = {};
    var properties = {}, hasProperties = false;
    var bindings = {}, hasBindings = false;
    var listeners = [], hasListeners = false;
    var units = [];
    block.statements.forEach(function (statement) {
        if (statement.type === "assign") {
            properties[stringifyFrbSyntax(statement.args[0])] = expressionToSerialization(statement.args[1]);
            hasProperties = true;
        } else if (statement.type === "bind" || statement.type === "bind2") {
            var descriptor = {};
            var arrow = statement.type === "bind" ? "<-" : "<->";
            descriptor[arrow] = stringifyFrbSyntax(statement.args[1]);
            if (statement.descriptor) {
                var overlay = expressionToSerialization({
                    type: "record",
                    args: statement.descriptor
                });
                for (var name in overlay) {
                    descriptor[name] = overlay[name];
                }
            }
            bindings[stringifyFrbSyntax(statement.args[0])] = descriptor;
            hasBindings = true;
        } else if (statement.type === "event") {
            var listener = {
                type: statement.event,
                listener: expressionToSerialization(statement.listener)
            };
            if (statement.descriptor) {
                var overlay = expressionToSerialization({
                    type: "record",
                    args: statement.descriptor
                });
                for (var name in overlay) {
                    listener[name] = overlay[name];
                }
            }
            // TODO when === "on" || when === "before"
            listeners.push(listener);
            hasListeners = true;
        } else if (statement.type === "unit") {
            units.push(statement);
        } else {
            throw new Error("Can't translate block to serialization: " + stringifyFrbSyntax(block));
        }
    });

    // prototype or object
    if (block.connection) {
        var connection = block.module;
        if (block.exports) {
            connection += "[" + stringifyFrbSyntax(block.exports) + "]";
        }
        serialization[block.connection] = connection;
    }

    if (hasProperties) {
        serialization.properties = properties;
    }
    if (hasBindings) {
        serialization.bindings = bindings;
    }
    if (hasListeners) {
        serialization.listeners = listeners;
    }
    units.forEach(function (unit) {
        serialization[unit.name] = expressionToSerialization(unit.value);
    });
    return serialization;
}

exports._expressionToSerialization = expressionToSerialization;
function expressionToSerialization(syntax) {
    if (syntax.type === "literal") {
        return syntax.value;
    } else if (syntax.type === "tuple") {
        return syntax.args.map(expressionToSerialization);
    } else if (syntax.type === "record") {
        var serialization = {};
        for (var name in syntax.args) {
            serialization[name] = expressionToSerialization(syntax.args[name]);
        }
        return serialization;
    } else if (syntax.type === "component") {
        return {"@": syntax.label};
    } else if (syntax.type === "element") {
        return {"#": syntax.id};
    } else {
        throw new Error("Can't translate expression to serialization: " + JSON.stringify(syntax));
    }
}

// # supporting serializationToComponentSheet

exports._serializationToFrbSyntax = serializationToFrbSyntax;
function serializationToFrbSyntax(serialization) {
    var blocks = [];
    for (var label in serialization) {
        blocks.push(blockToFrbSyntax(serialization[label], label));
    }
    return {type: "sheet", blocks: blocks};
}

exports._blockToFrbSyntax = blockToFrbSyntax;
function blockToFrbSyntax(block, label) {
    var syntax = {type: "block", label: label};
    if (block.prototype || block.object) {
        var connection = block.prototype ? "prototype" : "object";
        var reference =  block.prototype || block.object;
        var match = /^([^\[]*)\[([^\]]*)\]$/.exec(reference);
        var exports;
        if (match) {
            syntax.module = match[1];
            syntax.exports = parseFrbSyntax(match[2]);
        } else {
            syntax.module = reference;
        }
        syntax.connection = connection;
    }
    var statements = [];
    syntax.statements = statements;
    // extensions
    for (var section in block) {
        if (section === "prototype" || section === "object") {
            // already taken
        } else if (section === "properties") {
            var properties = block.properties;
            for (var name in properties) {
                statements.push({
                    type: "assign",
                    args: [
                        parseFrbSyntax(name),
                        expressionToFrbSyntax(properties[name])
                    ]
                });
            }
        } else if (section === "bindings") {
            var bindings = block.bindings;
            for (var name in bindings) {
                statements.push(bindingToFrbSyntax(bindings[name], name));
            }
        } else if (section === "listeners") {
            block[section].forEach(function (listener) {
                statements.push(listenerToFrbSyntax(listener));
            });
        } else {
            statements.push({
                type: "unit",
                name: section,
                value: expressionToFrbSyntax(block[section])
            });
        }
    }
    return syntax;
}

function bindingToFrbSyntax(binding, target) {
    var syntax = {type: null, args: null};
    var descriptor = {}, hasDescriptor = false;
    var source;
    for (var key in binding) {
        if (key === "<-" || key === "<->") {
            syntax.type = key === "<-" ? "bind" : "bind2";
            source = binding[key];
        } else {
            descriptor[key] = expressionToFrbSyntax(binding[key]);
            hasDescriptor = true;
        }
    }
    syntax.args = [
        parseFrbSyntax(target),
        parseFrbSyntax(source)
    ];
    if (hasDescriptor) {
        syntax.descriptor = descriptor;
    }
    return syntax;
}

function listenerToFrbSyntax(listener) {
    var syntax = {
        type: "event",
        event: listener.event,
        when: "on", // TODO before
        listener: null
    };
    var descriptor = {}, hasDescriptor = false;
    for (var key in listener) {
        if (key === "type") {
            syntax.event = listener.type;
        } else if (key === "listener") {
            syntax.listener = expressionToFrbSyntax(listener[key]);
        }
    }
    if (hasDescriptor) {
        syntax.descriptor = descriptor;
    }
    return syntax;
}

function expressionToFrbSyntax(node) {
    if (node == null || typeof node !== "object") {
        return {type: "literal", value: node};
    } else if (node["@"]) {
        return {type: "component", label: node["@"]};
    } else if (node["#"]) {
        return {type: "element", id: node["#"]};
    } else if (Array.isArray(node)) {
        return {type: "tuple", args: node.map(expressionToFrbSyntax)};
    } else {
        var args = {};
        for (var name in node) {
            args[name] = expressionToFrbSyntax(node[name]);
        }
        return {type: "record", args: args};
    }
}

