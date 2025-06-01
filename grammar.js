// This software or document includes material copied from or derived from
// tree-sitter-wgsl (https://github.com/gpuweb/tree-sitter-wgsl).
// Copyright (c) 2025 World Wide Web Consortium,
// (Massachusetts Institute of Technology, European Research Consortium for
// Informatics and Mathematics, Keio University, Beihang).
// https://www.w3.org/copyright/software-license-2023/

module.exports = grammar({
    name: 'wesl',

    externals: $ => [
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
        $._error_sentinel,
    ],

    extras: $ => [
        $.line_comment,
        $.block_comment,
        $._blankspace,
        $.preproc_custom,
    ],

    // WGSL has no parsing conflicts.
    conflicts: $ => [],

    word: $ => $.identifier,

    inline: $ => [],

    rules: {
        translation_unit: $ => seq(repeat(choice($.import_statement, $.preproc_bevy_import)), repeat($._decorated_global_directive), repeat($._decorated_global_decl)),

        // imports
        import_statement: $ => seq(repeat($.attribute), 'import', optional($.import_path), $._import_content, ';'),
        import_path: $ => seq(optional($.import_path), $._ident_pattern_token, '::'), // XXX: how to make this not recursive? couldn't get it to work with repeat1(seq($._ident_pattern_token, '::'))
        import: $ => choice(seq($.import_path, $.import_item), seq($.import_path, $.import_collection), $.import_item),
        _import_content: $ => choice($.import_item, $.import_collection),
        import_item: $ => seq(field('name', $._ident_pattern_token), optional(seq('as', field('rename', $._ident_pattern_token)))),
        import_collection: $ => seq('{', comma($.import, { trail: true }), '}'),

        // literals
        _literal: $ => choice($.int_literal, $.float_literal, $.bool_literal),
        bool_literal: $ => choice('true', 'false'),
        int_literal: $ => choice($.decimal_int_literal, $.hex_int_literal),
        decimal_int_literal: $ => choice(/0[iu]?/, /[1-9][0-9]*[iu]?/),
        hex_int_literal: $ => /0[xX][0-9a-fA-F]+[iu]?/,
        float_literal: $ => choice($._decimal_float_literal, $._hex_float_literal),
        _decimal_float_literal: $ => choice(/0[fh]/, /[1-9][0-9]*[fh]/, /[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fh]?/, /[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?[fh]?/, /[0-9]+[eE][+-]?[0-9]+[fh]?/),
        _hex_float_literal: $ => choice(/0[xX][0-9a-fA-F]*\.[0-9a-fA-F]+([pP][+-]?[0-9]+[fh]?)?/, /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*([pP][+-]?[0-9]+[fh]?)?/, /0[xX][0-9a-fA-F]+[pP][+-]?[0-9]+[fh]?/),

        // idents
        _ident: $ => seq($._ident_pattern_token, $._disambiguate_template),
        _member_ident: $ => $._ident_pattern_token,
        _template_elaborated_ident: $ => seq(optional($.ident_path), $._ident, optional($.template_list)), // import_path is a WESL extension: qualified identifiers
        ident_path: $ => seq(optional($.ident_path), $._ident, '::'),
        _ident_pattern_token: $ => $.identifier,
        identifier: $ => /([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u, // 'identifier' is tree-sitter's standard name so we output that instead of 'ident_pattern_token'
        type_specifier: $ => $._template_elaborated_ident,

        // templates
        template_list: $ => seq($.template_args_start, $._template_arg_comma_list, $.template_args_end),
        _template_arg_comma_list: $ => comma($._template_arg_expression, { trail: true }),
        _template_arg_expression: $ => $._expression,

        // directives
        _decorated_global_directive: $ => seq(repeat($.attribute), $.global_directive),
        global_directive: $ => choice($.diagnostic_directive, $.enable_directive, $.requires_directive),
        diagnostic_directive: $ => seq('diagnostic', $._diagnostic_control, ';'),
        _diagnostic_control: $ => seq('(', field('severity', $._severity_control_name), ',', field('rule', $._diagnostic_rule_name), optional(','), ')'),
        _diagnostic_rule_name: $ => choice($._diagnostic_name_token, seq($._diagnostic_name_token, '.', $._diagnostic_name_token)),
        _diagnostic_name_token: $ => $._ident_pattern_token,
        _severity_control_name: $ => $._ident_pattern_token,
        enable_directive: $ => seq('enable', $._enable_extension_list, ';'),
        _enable_extension_list: $ => comma($._enable_extension_name, { trail: true }),
        _enable_extension_name: $ => $._ident_pattern_token,
        requires_directive: $ => seq('requires', $._software_extension_list, ';'),
        _software_extension_list: $ => comma($._software_extension_name, { trail: true }),
        _software_extension_name: $ => $._ident_pattern_token,

        // attributes
        attribute: $ => prec.right(seq('@', field('name', $._ident_pattern_token), field('arguments', optional($._argument_expression_list)))), // precedence: a parenthesis following an attribute is always part of the attribute.

        // declarations
        _decorated_global_decl: $ => seq(repeat($.attribute), $.global_decl),
        global_decl: $ => choice(';', $.global_variable_decl, $.global_value_decl, $.type_alias_decl, $.struct_decl, $.function_decl, $.const_assert_statement),

        // structs
        struct_decl: $ => seq('struct', field('name', $._ident), field('body', $.struct_body)),
        struct_body: $ => seq('{', comma($.struct_member, { trail: true }), '}'),
        struct_member: $ => seq(repeat($.attribute), field('name', $._member_ident), ':', field('type', $.type_specifier)),

        type_alias_decl: $ => seq('alias', field('name', $._ident), '=', field('type', $.type_specifier), ';'),

        // variables and values
        global_variable_decl: $ => seq($.variable_decl, optional(seq('=', field('initializer', $._expression))), ';'),
        global_value_decl: $ => choice(
            seq('const', $._optionally_typed_ident, '=', field('initializer', $._expression), ';'),
            seq('override', $._optionally_typed_ident, optional(seq('=', field('initializer', $._expression))), ';')
        ),
        variable_decl: $ => seq('var', $._disambiguate_template, optional($.template_list), $._optionally_typed_ident),

        _optionally_typed_ident: $ => seq(field('name', $._ident), optional(seq(':', field('type', $.type_specifier)))),

        // function calls
        _call_phrase: $ => seq($._template_elaborated_ident, $._argument_expression_list),
        _argument_expression_list: $ => seq('(', optional($.argument_list), ')'),
        argument_list: $ => comma($._expression, { trail: true }), // renamed from spec "expression_comma_list"

        // expressions
        _short_circuit_or_expression: $ => prec.left(1, seq(field('left', $._expression), field('operator', '||'), field('right', $._expression))),
        _short_circuit_and_expression: $ => prec.left(2, seq(field('left', $._expression), field('operator', '&&'), field('right', $._expression))),
        _binary_or_expression: $ => prec.left(3, seq(field('left', $._expression), field('operator', '|'), field('right', $._expression))),
        _binary_xor_expression: $ => prec.left(4, seq(field('left', $._expression), field('operator', '^'), field('right', $._expression))),
        _binary_and_expression: $ => prec.left(5, seq(field('left', $._expression), field('operator', '&'), field('right', $._expression))),
        _relational_expression: $ => prec.left(6, seq(field('left', $._expression), field('operator', $._relational_operator), field('right', $._expression))),
        _relational_operator: $ => choice($.less_than, $.greater_than, $.less_than_equal, $.greater_than_equal, '==', '!='),
        _shift_expression: $ => prec.left(7, seq(field('left', $._expression), field('operator', choice($.shift_left, $.shift_right)), field('right', $._expression))),
        _additive_expression: $ => prec.left(8, seq(field('left', $._expression), field('operator', $._additive_operator), field('right', $._expression))),
        _additive_operator: $ => choice('+', '-'),
        _multiplicative_expression: $ => prec.left(9, seq(field('left', $._expression), field('operator', $._multiplicative_operator), field('right', $._expression))),
        _multiplicative_operator: $ => choice('*', '/', '%'),
        unary_expression: $ => prec.right(10, seq(field('operator', $._unary_operator), field('operand', $._expression))),
        _unary_operator: $ => choice('-', '!', '~', '*', '&'),

        _primary_expression: $ => prec.left(11, choice(
            $._template_elaborated_ident,
            $._literal,
            $.call_expression,
            $.indexing_expression,
            $.named_component_expression,
        )),

        call_expression: $ => prec.left(11, $._call_phrase),
        indexing_expression: $ => prec.left(11, seq(field('value', $._expression), '[', field('index', $._expression), ']')),
        named_component_expression: $ => prec.left(11, seq(field('value', $._expression), '.', field('component', choice($._member_ident, $.swizzle_name)))),
        swizzle_name: $ => choice(/[rgba]/, /[rgba][rgba]/, /[rgba][rgba][rgba]/, /[rgba][rgba][rgba][rgba]/, /[xyzw]/, /[xyzw][xyzw]/, /[xyzw][xyzw][xyzw]/, /[xyzw][xyzw][xyzw][xyzw]/),
        paren_expression: $ => prec.left(12, seq('(', $._expression, ')')),

        binary_expression: $ => choice(
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
        _expression: $ => choice(
            $.paren_expression,
            $._primary_expression,
            $.unary_expression,
            $.binary_expression,
        ),

        // statements
        _decorated_statement: $ => choice($.compound_statement, seq(repeat($.attribute), $.statement)),
        statement: $ => choice(
            ';',
            seq($.return_statement, ';'),
            $.if_statement,
            $.switch_statement,
            $.loop_statement,
            $.for_statement,
            $.while_statement,
            seq($.func_call_statement, ';'),
            seq($.variable_or_value_statement, ';'),
            seq($.break_statement, ';'),
            seq($.continue_statement, ';'),
            seq($.discard_statement, ';'),
            seq($._variable_updating_statement, ';'),
            // $.compound_statement, // is moved to _decorated_statement
            seq($.const_assert_statement, ';'),
            $.continuing_statement,
            seq($.break_if_statement, ';'),
        ),
        compound_statement: $ => seq(repeat($.attribute), '{', repeat($._decorated_statement), '}'),
        assignment_statement: $ => choice(
            seq(field('left', $._expression), field('operator', choice('=', $._compound_assignment_operator)), field('right', $._expression)),
            seq(field('left', '_'), field('operator', '='), field('right', $._expression))
        ),
        _compound_assignment_operator: $ => choice('+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', $.shift_right_assign, $.shift_left_assign),
        increment_statement: $ => seq($._expression, '++'),
        decrement_statement: $ => seq($._expression, '--'),
        return_statement: $ => seq('return', optional($._expression)),
        func_call_statement: $ => $._call_phrase,
        const_assert_statement: $ => seq('const_assert', $._expression),
        _variable_updating_statement: $ => choice($.assignment_statement, $.increment_statement, $.decrement_statement),
        variable_or_value_statement: $ => choice(
            $.variable_decl,
            seq($.variable_decl, '=', $._expression),
            seq('let', $._optionally_typed_ident, '=', $._expression),
            seq('const', $._optionally_typed_ident, '=', $._expression)
        ),

        // if statement
        if_statement: $ => seq($.if_clause, repeat($.else_if_clause), optional($.else_clause)),
        if_clause: $ => seq('if', field('condition', $._expression), field('body', $.compound_statement)),
        else_if_clause: $ => seq('else', 'if', field('condition', $._expression), field('body', $.compound_statement)),
        else_clause: $ => seq('else', field('body', $.compound_statement)),

        // switch statement
        switch_statement: $ => seq('switch', field('value', $._expression), field('body', $.switch_body)),
        switch_body: $ => seq(repeat($.attribute), '{', repeat1($.switch_clause), '}'),
        switch_clause: $ => choice($.case_clause, $.default_alone_clause),
        case_clause: $ => seq('case', $._case_selectors, optional(':'), field('body', $.compound_statement)),
        default_alone_clause: $ => seq('default', optional(':'), field('body', $.compound_statement)),
        _case_selectors: $ => comma($.case_selector, { trail: true }),
        case_selector: $ => choice('default', $._expression),

        // control flow statements
        for_statement: $ => seq('for', '(', $.for_header, ')', field('body', $.compound_statement)),
        for_header: $ => seq(field('init', optional($._for_init)), ';', field('condition', optional($._expression)), ';', field('update', optional($._for_update))),
        _for_init: $ => choice($.variable_or_value_statement, $._variable_updating_statement, $.func_call_statement),
        _for_update: $ => choice($._variable_updating_statement, $.func_call_statement),
        loop_statement: $ => seq('loop', field('body', $.compound_statement)),
        while_statement: $ => seq('while', field('condition', $._expression), field('body', $.compound_statement)),
        // XXX: why do we need to explicitly set the alias? The queries "continue" and "discard" do
        // not work without the alias. the "break" does work because "break" is also used in break_if.
        // is it a bug in helix? tree-sitter? undocumented?
        break_statement: $ => alias('break', 'break'),
        break_if_statement: $ => seq('break', 'if', $._expression),
        continue_statement: $ => alias('continue', 'continue'),
        continuing_statement: $ => seq('continuing', $.compound_statement),
        discard_statement: $ => alias('discard', 'discard'),

        // function declaration
        function_decl: $ => seq($.function_header, field('body', $.compound_statement)),
        function_header: $ => seq(
            optional(choice('virtual', 'override')), // naga_oil (Bevy) extension
            'fn', field('name', $._ident), '(', field('parameters', optional($.param_list)), ')',
            optional(seq('->', repeat($.attribute), field('return_type', $.type_specifier)))
        ),
        param_list: $ => comma($.param, { trail: true }),
        param: $ => seq(repeat($.attribute), field('name', $._ident), ':', field('type', $.type_specifier)),

        // preprocessor (for Bevy and friends)
        // adapted from 'tree-sitter-c' https://github.com/tree-sitter/tree-sitter-c

        preproc_custom: $ => seq(
          field('directive', $.preproc_directive),
          field('argument', repeat($._expression)),
          token.immediate(/\r?\n/),
        ),
        preproc_directive: _ => /#[ \t]*[a-zA-Z0-9]\w*/,
        preproc_argument: _ => token(prec(-1, /\S([^/\n]|\/[^*]|\\\r?\n)*/)),

        preproc_bevy_import: $ => seq('#import', choice(seq($.import_path, $._import_content), $.import_item)),

        // extras

        line_comment: $ => /\/\/.*/,
        _blankspace: $ => /[\u0020\u0009\u000a\u000b\u000c\u000d\u0085\u200e\u200f\u2028\u2029]/u
    }
})

function comma(rule, { opt, trail } = { opt: false, trail: false }) {
    const res = trail
        ? seq(rule, repeat(seq(',', rule)), optional(','))
        : seq(rule, repeat(seq(',', rule)))
    return opt ? optional(res) : res
}
