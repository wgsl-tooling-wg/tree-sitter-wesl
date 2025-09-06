// This software or document includes material copied from or derived from
// tree-sitter-wgsl (https://github.com/gpuweb/tree-sitter-wgsl).
// Copyright (c) 2025 World Wide Web Consortium,
// (Massachusetts Institute of Technology, European Research Consortium for
// Informatics and Mathematics, Keio University, Beihang).
// https://www.w3.org/copyright/software-license-2023/

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
module.exports = grammar({
  name: "mew",

  externals: ($) => [
    $.block_comment,
    $._disambiguate_template,
    $.template_args_start,
    $.template_args_end,
    $.less_than,
    $.less_than_equal,
    $.shift_left,
    $.shift_left_assign,
    $.greater_than,
    $.greater_than_equal,
    $.shift_right,
    $.shift_right_assign,
    $.single_colon,
    $.double_colon,
    $._error_sentinel,
  ],

  extras: ($) => [$.line_comment, $.block_comment, $._blankspace],

  // WGSL has no parsing conflicts.
  conflicts: ($) => [],

  word: ($) => $.identifier,

  inline: ($) =>
    Object.keys($).filter(
      (x) => x !== "_disambiguate_template" && x.startsWith("_"),
    ),

  rules: {
    translation_unit: ($) =>
      seq(
        field("directives", repeat($.global_directive)),
        field("declarations", repeat($.global_declaration)),
      ),

    // BEGIN MEW identifiers
    template_elaborated_ident: ($) =>
      seq(
        repeat(seq($.template_elaborated_ident_part, $.double_colon)),
        $.template_elaborated_ident_part,
      ),
    template_elaborated_ident_part: ($) =>
      seq(
        field("name", $._ident),
        field("template_args", optional($.template_list)),
        field("inline_template_args", optional($.inline_module)),
      ),
    inline_module: ($) =>
      seq(
        "with",
        "{",
        repeat($.module_directive),
        repeat($.module_member_declaration),
        "}",
      ),
    // END MEW identifiers

    // BEGIN MEW imports and extends
    import_directive: ($) =>
      seq(repeat($.attribute), "import", $.root_import_path),
    root_import_path: ($) =>
      choice(
        seq(
          field(
            "path",
            repeat(seq($.template_elaborated_ident_part, $.double_colon)),
          ),
          field("item", $.item_import),
          ";",
        ),
        seq(
          field(
            "path",
            repeat1(seq($.template_elaborated_ident_part, $.double_colon)),
          ),
          field("collection", $.import_collection),
        ),
      ),

    item_import: ($) =>
      seq(
        field("name", $._ident),
        optional($.template_list),
        optional($.inline_module),
        field("rename", optional(seq("as", $.identifier))),
      ),
    import_collection: ($) => seq("{", comma($.import_path), "}"),
    import_path: ($) =>
      choice(
        seq(
          repeat1(seq($.template_elaborated_ident_part, $.double_colon)),
          $._import_content,
        ),
        $.item_import,
      ),
    _import_content: ($) => choice($.import_collection, $.item_import),
    extend_directive: ($) =>
      seq(repeat($.attribute), "extend", $.template_elaborated_ident, ";"),
    // END MEW imports

    // literals
    _literal: ($) => choice($.int_literal, $.float_literal, $.bool_literal),
    bool_literal: ($) => choice("true", "false"),
    int_literal: ($) => choice($.decimal_int_literal, $.hex_int_literal),
    decimal_int_literal: ($) => choice(/0[iu]?/, /[1-9][0-9]*[iu]?/),
    hex_int_literal: ($) => /0[xX][0-9a-fA-F]+[iu]?/,
    float_literal: ($) =>
      choice($._decimal_float_literal, $._hex_float_literal),
    _decimal_float_literal: ($) =>
      choice(
        /0[fh]/,
        /[1-9][0-9]*[fh]/,
        /[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fh]?/,
        /[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?[fh]?/,
        /[0-9]+[eE][+-]?[0-9]+[fh]?/,
      ),
    _hex_float_literal: ($) =>
      choice(
        /0[xX][0-9a-fA-F]*\.[0-9a-fA-F]+([pP][+-]?[0-9]+[fh]?)?/,
        /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*([pP][+-]?[0-9]+[fh]?)?/,
        /0[xX][0-9a-fA-F]+[pP][+-]?[0-9]+[fh]?/,
      ),

    // idents
    _ident: ($) => seq($._ident_pattern_token, $._disambiguate_template),
    _member_ident: ($) => $._ident_pattern_token,
    _ident_pattern_token: ($) => $.identifier,
    identifier: ($) =>
      /([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u, // 'identifier' is tree-sitter's standard name so we output that instead of 'ident_pattern_token'
    type_specifier: ($) => $.template_elaborated_ident,
    // BEGIN MEW alias everything
    alias_specifier: ($) => $.template_elaborated_ident,
    // templates
    template_list: ($) =>
      seq(
        $.template_args_start,
        $._template_arg_comma_list,
        $.template_args_end,
      ),
    // BEGIN MEW template params
    template_parameters: ($) =>
      seq(
        $.template_args_start,
        $._template_parameter_comma_list,
        $.template_args_end,
      ),
    _template_parameter_comma_list: ($) =>
      choice(
        comma1($._template_parameter),
        seq(
          comma($._template_parameter),
          comma1($._optional_template_parameter),
        ),
      ),
    _template_parameter: ($) => field("name", $._ident),

    _optional_template_parameter: ($) =>
      seq(field("name", $._ident), "=", field("default_value", $._expression)),
    // END MEW template params
    _template_arg_comma_list: ($) =>
      choice(
        comma1($.template_arg_expression),
        seq(comma($.template_arg_expression), comma1($.named_template_arg)),
      ),
    named_template_arg: ($) =>
      seq(
        field("name", $._ident),
        "=",
        field("value", $.template_arg_expression),
      ),
    template_arg_expression: ($) => field("expression", $._expression),

    // directives
    global_directive: ($) =>
      choice(
        $.diagnostic_directive,
        $.enable_directive,
        $.requires_directive,
        // BEGIN MEW Directives
        $.import_directive,
        $.extend_directive,
        // END MEW Directives
      ),
    // BEGIN MEW Directives
    module_directive: ($) => choice($.import_directive, $.extend_directive),
    compound_directive: ($) => choice($.import_directive),
    diagnostic_directive: ($) =>
      seq(repeat($.attribute), "diagnostic", $._diagnostic_control, ";"),
    _diagnostic_control: ($) =>
      seq(
        "(",
        field("severity", $._severity_control_name),
        ",",
        field("rule", $._diagnostic_rule_name),
        optional(","),
        ")",
      ),
    _diagnostic_rule_name: ($) =>
      choice(
        $._diagnostic_name_token,
        seq($._diagnostic_name_token, ".", $._diagnostic_name_token),
      ),
    _diagnostic_name_token: ($) => $._ident_pattern_token,
    _severity_control_name: ($) => $._ident_pattern_token,
    enable_directive: ($) =>
      seq(repeat($.attribute), "enable", $._enable_extension_list, ";"),
    _enable_extension_list: ($) => comma1($._enable_extension_name),
    _enable_extension_name: ($) => $._ident_pattern_token,
    requires_directive: ($) =>
      seq(repeat($.attribute), "requires", $._software_extension_list, ";"),
    _software_extension_list: ($) => comma1($._software_extension_name),
    _software_extension_name: ($) => $._ident_pattern_token,

    // attributes
    attribute: ($) =>
      prec.right(
        seq(
          "@",
          field("name", $._ident_pattern_token),
          field("arguments", optional($._argument_expression_list)),
        ),
      ), // precedence: a parenthesis following an attribute is always part of the attribute.

    // declarations
    global_declaration: ($) =>
      choice(
        ";",
        $.global_variable_decl,
        $.global_value_decl,
        $.alias_decl,
        $.struct_decl,
        $.function_decl,
        // BEGIN MEW global decls
        $.module_decl,
        // END MEW global decls
        $.const_assert_statement,
      ),

    // BEGIN MEW root additions
    module_decl: ($) =>
      seq(
        repeat($.attribute),
        "module",
        field("name", $._ident),
        optional($.template_parameters),
        $.module_body,
      ),
    module_body: ($) =>
      seq(
        "{",
        repeat($.module_directive),
        repeat($.module_member_declaration),
        "}",
      ),
    module_member_declaration: ($) =>
      choice(
        ";",
        $.module_variable_decl,
        $.module_value_decl,
        $.alias_decl,
        $.struct_decl,
        $.function_decl,
        $.module_decl,
        $.const_assert_statement,
      ),
    // choice($.diagnostic_directive, $.enable_directive, $.requires_directive),
    // END MEW root additions

    // structs
    // BEGIN MEW struct additions
    struct_decl: ($) =>
      seq(
        repeat($.attribute),
        "struct",
        field("name", $._ident),
        field("template_parameters", optional($.template_parameters)),
        field("body", $.struct_body),
      ),
    // END MEW struct additions
    struct_body: ($) => seq("{", comma($.struct_member), "}"),
    struct_member: ($) =>
      seq(
        repeat($.attribute),
        field("name", $._member_ident),
        $.single_colon,
        field("type", $.type_specifier),
      ),
    // BEGIN MEW type_alias_decl -> alias_decl
    alias_decl: ($) =>
      seq(
        repeat($.attribute),
        "alias",
        field("name", $._ident),
        field("template_parameters", optional($.template_parameters)),
        "=",
        field("type", $.alias_specifier),
        ";",
      ),
    // END MEW alias_decl
    // variables and values

    // BEGIN MEW variable decl
    global_variable_decl: ($) => seq($.variable_decl_with_intializer, ";"),
    module_variable_decl: ($) => seq($.variable_decl_with_intializer, ";"),
    variable_decl_with_intializer: ($) =>
      seq(
        repeat($.attribute),
        $.variable_decl,
        field("initializer", optional(seq("=", $._expression))),
      ),
    variable_decl: ($) =>
      seq(
        "var",
        $._disambiguate_template,
        field("template_args", optional($.template_list)),
        $.optionally_typed_ident,
      ),
    // END MEW variable decl
    global_value_decl: ($) =>
      choice(
        $.const_decl,
        seq(
          repeat($.attribute),
          "override",
          $.optionally_typed_ident,
          field("initializer", optional(seq("=", $._expression))),
          ";",
        ),
      ),
    const_decl: ($) =>
      seq(
        repeat($.attribute),
        "const",
        $.optionally_typed_ident,
        "=",
        field("initializer", $._expression),
        ";",
      ),
    // BEGIN MEW value decl
    module_value_decl: ($) => $.const_decl,
    const_value_decl: ($) =>
      seq(
        "const",
        $.optionally_typed_ident,
        "=",
        field("initializer", $._expression),
        ";",
      ),
    // END MEW value decl
    optionally_typed_ident: ($) =>
      seq(
        field("name", $._ident),
        field("type", optional(seq($.single_colon, $.type_specifier))),
      ),

    // function calls
    _call_phrase: ($) =>
      seq($.template_elaborated_ident, $._argument_expression_list),
    _argument_expression_list: ($) => seq("(", optional($.argument_list), ")"),
    argument_list: ($) => comma1($._expression), // renamed from spec "expression_comma_list"

    // expressions
    _short_circuit_or_expression: ($) =>
      prec.left(
        1,
        seq(
          field("left", $._expression),
          field("operator", "||"),
          field("right", $._expression),
        ),
      ),
    _short_circuit_and_expression: ($) =>
      prec.left(
        2,
        seq(
          field("left", $._expression),
          field("operator", "&&"),
          field("right", $._expression),
        ),
      ),
    _binary_or_expression: ($) =>
      prec.left(
        3,
        seq(
          field("left", $._expression),
          field("operator", "|"),
          field("right", $._expression),
        ),
      ),
    _binary_xor_expression: ($) =>
      prec.left(
        4,
        seq(
          field("left", $._expression),
          field("operator", "^"),
          field("right", $._expression),
        ),
      ),
    _binary_and_expression: ($) =>
      prec.left(
        5,
        seq(
          field("left", $._expression),
          field("operator", "&"),
          field("right", $._expression),
        ),
      ),
    _relational_expression: ($) =>
      prec.left(
        6,
        seq(
          field("left", $._expression),
          field("operator", $._relational_operator),
          field("right", $._expression),
        ),
      ),
    _relational_operator: ($) =>
      choice(
        $.less_than,
        $.greater_than,
        $.less_than_equal,
        $.greater_than_equal,
        "==",
        "!=",
      ),
    _shift_expression: ($) =>
      prec.left(
        7,
        seq(
          field("left", $._expression),
          field("operator", choice($.shift_left, $.shift_right)),
          field("right", $._expression),
        ),
      ),
    _additive_expression: ($) =>
      prec.left(
        8,
        seq(
          field("left", $._expression),
          field("operator", $._additive_operator),
          field("right", $._expression),
        ),
      ),
    _additive_operator: ($) => choice("+", "-"),
    _multiplicative_expression: ($) =>
      prec.left(
        9,
        seq(
          field("left", $._expression),
          field("operator", $._multiplicative_operator),
          field("right", $._expression),
        ),
      ),
    _multiplicative_operator: ($) => choice("*", "/", "%"),
    unary_expression: ($) =>
      prec.right(
        10,
        seq(
          field("operator", $._unary_operator),
          field("operand", $._expression),
        ),
      ),
    _unary_operator: ($) => choice("-", "!", "~", "*", "&"),

    _primary_expression: ($) =>
      prec.left(
        11,
        choice(
          $.template_elaborated_ident,
          $._literal,
          $.call_expression,
          $.indexing_expression,
          $.named_component_expression,
        ),
      ),

    call_expression: ($) => prec.left(11, $._call_phrase),
    indexing_expression: ($) =>
      prec.left(
        11,
        seq(
          field("value", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),
    named_component_expression: ($) =>
      prec.left(
        11,
        seq(
          field("value", $._expression),
          ".",
          field("component", choice($._member_ident, $.swizzle_name)),
        ),
      ),
    swizzle_name: ($) =>
      choice(
        /[rgba]/,
        /[rgba][rgba]/,
        /[rgba][rgba][rgba]/,
        /[rgba][rgba][rgba][rgba]/,
        /[xyzw]/,
        /[xyzw][xyzw]/,
        /[xyzw][xyzw][xyzw]/,
        /[xyzw][xyzw][xyzw][xyzw]/,
      ),
    paren_expression: ($) => prec.left(12, seq("(", $._expression, ")")),

    binary_expression: ($) =>
      choice(
        $._short_circuit_or_expression,
        $._short_circuit_and_expression,
        $._binary_or_expression,
        $._binary_xor_expression,
        $._binary_and_expression,
        $._relational_expression,
        $._shift_expression,
        $._additive_expression,
        $._multiplicative_expression,
      ),

    // this is more permissive than allowed by the WGSL syntax.
    // some expressions are supposed to not associate with others.
    // https://www.w3.org/TR/WGSL/#operator-precedence-associativity
    _expression: ($) =>
      choice(
        $.paren_expression,
        $._primary_expression,
        $.unary_expression,
        $.binary_expression,
      ),

    // statements
    _decorated_statement: ($) => $.statement,
    statement: ($) =>
      choice(
        ";",
        $.return_statement,
        $.if_statement,
        $.switch_statement,
        $.loop_statement,
        $.for_statement,
        $.while_statement,
        seq($.func_call_statement, ";"),
        seq($.variable_or_value_statement, ";"),
        seq($.break_statement, ";"),
        seq($.continue_statement, ";"),
        seq($.discard_statement, ";"),
        seq($._variable_updating_statement, ";"),
        $.compound_statement,
        seq($.const_assert_statement, ";"),
      ),
    compound_statement: ($) =>
      seq(
        "{",
        field("directives", repeat($.compound_directive)),
        field("statements", repeat($._decorated_statement)),
        "}",
      ),
    assignment_statement: ($) =>
      choice(
        seq(
          field("left", $._expression),
          field("operator", choice("=", $._compound_assignment_operator)),
          field("right", $._expression),
        ),
        seq(
          field("left", "_"),
          field("operator", "="),
          field("right", $._expression),
        ),
      ),
    _compound_assignment_operator: ($) =>
      choice(
        "+=",
        "-=",
        "*=",
        "/=",
        "%=",
        "&=",
        "|=",
        "^=",
        $.shift_right_assign,
        $.shift_left_assign,
      ),
    increment_statement: ($) => seq($._expression, "++"),
    decrement_statement: ($) => seq($._expression, "--"),
    return_statement: ($) =>
      seq(repeat($.attribute), "return", optional($._expression), ";"),
    func_call_statement: ($) => $._call_phrase,
    const_assert_statement: ($) => seq("const_assert", $._expression),
    _variable_updating_statement: ($) =>
      choice(
        $.assignment_statement,
        $.increment_statement,
        $.decrement_statement,
      ),
    variable_or_value_statement: ($) =>
      choice($.variable_decl_with_intializer, $.const_value_decl, $.let_decl),
    let_decl: ($) => seq("let", $.optionally_typed_ident, "=", $._expression),

    // if statement
    if_statement: ($) =>
      seq($.if_clause, repeat($.else_if_clause), optional($.else_clause)),
    if_clause: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        field("body", $.compound_statement),
      ),
    else_if_clause: ($) =>
      seq(
        "else",
        "if",
        field("condition", $._expression),
        field("body", $.compound_statement),
      ),
    else_clause: ($) => seq("else", field("body", $.compound_statement)),

    // switch statement
    switch_statement: ($) =>
      seq(
        "switch",
        field("value", $._expression),
        field("body", $.switch_body),
      ),
    switch_body: ($) =>
      seq(repeat($.attribute), "{", repeat1($.switch_clause), "}"),
    switch_clause: ($) => choice($.case_clause, $.default_alone_clause),
    case_clause: ($) =>
      seq(
        "case",
        $._case_selectors,
        optional($.single_colon),
        field("body", $.compound_statement),
      ),
    default_alone_clause: ($) =>
      seq(
        "default",
        optional($.single_colon),
        field("body", $.compound_statement),
      ),
    _case_selectors: ($) => comma1($.case_selector),
    case_selector: ($) => choice("default", $._expression),

    // control flow statements
    for_statement: ($) =>
      seq("for", "(", $.for_header, ")", field("body", $.compound_statement)),
    for_header: ($) =>
      seq(
        field("init", optional($._for_init)),
        ";",
        field("condition", optional($._expression)),
        ";",
        field("update", optional($._for_update)),
      ),
    _for_init: ($) =>
      choice(
        $.variable_or_value_statement,
        $._variable_updating_statement,
        $.func_call_statement,
      ),
    _for_update: ($) =>
      choice($._variable_updating_statement, $.func_call_statement),
    loop_statement: ($) =>
      seq(
        "loop",
        field(
          "body",
          seq(
            field("attributes", repeat($.attribute)),
            "{",
            field("directives", repeat($.compound_directive)),
            field("statements", repeat($._decorated_statement)),
            field("continuing", optional($._decorated_continuing_statement)),
            "}",
          ),
        ),
      ),
    while_statement: ($) =>
      seq(
        "while",
        field("condition", $._expression),
        field("body", $.compound_statement),
      ),
    // XXX: why do we need to explicitly set the alias? The queries "continue" and "discard" do
    // not work without the alias. the "break" does work because "break" is also used in break_if.
    // is it a bug in helix? tree-sitter? undocumented?
    break_statement: ($) => alias("break", "break"),
    break_if_statement: ($) => seq("break", "if", $._expression),
    _decorated_break_if_statement: ($) =>
      seq(field("attributes", repeat($.attribute)), $.break_if_statement),
    continue_statement: ($) => alias("continue", "continue"),
    continuing_statement: ($) =>
      seq(
        "continuing",
        "{",
        field("directives", repeat($.compound_directive)),
        field("statements", repeat($._decorated_statement)),
        field("break_if", optional($._decorated_break_if_statement)),
        "}",
      ),
    _decorated_continuing_statement: ($) =>
      seq(field("attributes", repeat($.attribute)), $.continuing_statement),
    discard_statement: ($) => alias("discard", "discard"),

    // function declaration
    function_decl: ($) =>
      seq(
        repeat($.attribute),
        $._function_header,
        field("body", $.compound_statement),
      ),
    _function_header: ($) =>
      seq(
        "fn",
        field("name", $._ident),
        field("template_parameters", optional($.template_parameters)),
        "(",
        field("parameters", comma($.param)),
        ")",
        optional(
          seq(
            "->",
            repeat($.attribute),
            field("return_type", $.type_specifier),
          ),
        ),
      ),
    param: ($) =>
      seq(
        repeat($.attribute),
        field("name", $._ident),
        $.single_colon,
        field("type", $.type_specifier),
      ),
    // extras

    line_comment: ($) => /\/\/.*/,
    _blankspace: ($) =>
      /[\u0020\u0009\u000a\u000b\u000c\u000d\u0085\u200e\u200f\u2028\u2029]/u,
  },
});

/**
 * @param {RuleOrLiteral} rule
 * @param {boolean=} allowTrailing whether to allow trailing commas, defaults to true
 * @returns {RuleOrLiteral}
 */
function comma(rule, allowTrailing) {
  return optional(comma1(rule, allowTrailing));
}

/**
 * @param {RuleOrLiteral} rule
 * @param {boolean=} allowTrailing allow trailing commas, defaults to true
 * @returns RuleOrLiteral
 */
function comma1(rule, allowTrailing) {
  if (!!(allowTrailing ?? true)) {
    return seq(rule, repeat(seq(",", rule)), optional(","));
  } else {
    return seq(rule, repeat(seq(",", rule)), optional(","));
  }
}
