// Copyright (C) [2024] World Wide Web Consortium,
// (Massachusetts Institute of Technology, European Research Consortium for
// Informatics and Mathematics, Keio University, Beihang).
// All Rights Reserved.
//
// This work is distributed under the W3C (R) Software License [1] in the hope
// that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//
// [1] http://www.w3.org/Consortium/Legal/copyright-software

// **** This file is auto-generated. Do not edit. ****
// generated: 2024-09-01

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
        $.comment,
        $.block_comment,
        $._blankspace,
    ],

    inline: $ => [
        $.global_decl,
    ],

    // WGSL has no parsing conflicts.
    conflicts: $ => [],

    word: $ => $._ident_pattern_token,

    rules: {
        translation_unit: $ => seq(repeat($.global_directive), repeat($.global_decl)),

        global_directive: $ => choice($.diagnostic_directive, $.enable_directive, $.requires_directive),

        global_decl: $ => choice(';', seq($.global_variable_decl, ';'), seq($.global_value_decl, ';'), seq($.type_alias_decl, ';'), $.struct_decl, $.function_decl, seq($.const_assert_statement, ';')),

        bool_literal: $ => choice('true', 'false'),

        int_literal: $ => choice($.decimal_int_literal, $.hex_int_literal),

        decimal_int_literal: $ => choice(/0[iu]?/, /[1-9][0-9]*[iu]?/),

        hex_int_literal: $ => /0[xX][0-9a-fA-F]+[iu]?/,

        float_literal: $ => choice($._decimal_float_literal, $._hex_float_literal),

        _decimal_float_literal: $ => choice(/0[fh]/, /[1-9][0-9]*[fh]/, /[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fh]?/, /[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?[fh]?/, /[0-9]+[eE][+-]?[0-9]+[fh]?/),

        _hex_float_literal: $ => choice(/0[xX][0-9a-fA-F]*\.[0-9a-fA-F]+([pP][+-]?[0-9]+[fh]?)?/, /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*([pP][+-]?[0-9]+[fh]?)?/, /0[xX][0-9a-fA-F]+[pP][+-]?[0-9]+[fh]?/),

        diagnostic_directive: $ => seq('diagnostic', $.diagnostic_control, ';'),

        literal: $ => choice($.int_literal, $.float_literal, $.bool_literal),

        ident: $ => seq($._ident_pattern_token, $._disambiguate_template),

        member_ident: $ => $._ident_pattern_token,

        diagnostic_name_token: $ => $._ident_pattern_token,

        diagnostic_rule_name: $ => choice($.diagnostic_name_token, seq($.diagnostic_name_token, '.', $.diagnostic_name_token)),

        template_list: $ => seq($.template_args_start, $._template_arg_comma_list, $.template_args_end),

        _template_arg_comma_list: $ => seq($.template_arg_expression, repeat(seq(',', $.template_arg_expression)), optional(',')),

        template_arg_expression: $ => $._expression,

        align_attr: $ => seq('@', 'align', '(', $._expression, optional(','), ')'),

        binding_attr: $ => seq('@', 'binding', '(', $._expression, optional(','), ')'),

        blend_src_attr: $ => seq('@', 'blend_src', '(', $._expression, optional(','), ')'),

        builtin_attr: $ => seq('@', 'builtin', '(', $.builtin_value_name, optional(','), ')'),

        builtin_value_name: $ => $._ident_pattern_token,

        const_attr: $ => seq('@', 'const'),

        diagnostic_attr: $ => seq('@', 'diagnostic', $.diagnostic_control),

        group_attr: $ => seq('@', 'group', '(', $._expression, optional(','), ')'),

        id_attr: $ => seq('@', 'id', '(', $._expression, optional(','), ')'),

        interpolate_attr: $ => choice(seq('@', 'interpolate', '(', $.interpolate_type_name, optional(','), ')'), seq('@', 'interpolate', '(', $.interpolate_type_name, ',', $.interpolate_sampling_name, optional(','), ')')),

        interpolate_type_name: $ => $._ident_pattern_token,

        interpolate_sampling_name: $ => $._ident_pattern_token,

        invariant_attr: $ => seq('@', 'invariant'),

        location_attr: $ => seq('@', 'location', '(', $._expression, optional(','), ')'),

        must_use_attr: $ => seq('@', 'must_use'),

        size_attr: $ => seq('@', 'size', '(', $._expression, optional(','), ')'),

        workgroup_size_attr: $ => choice(seq('@', 'workgroup_size', '(', $._expression, optional(','), ')'), seq('@', 'workgroup_size', '(', $._expression, ',', $._expression, optional(','), ')'), seq('@', 'workgroup_size', '(', $._expression, ',', $._expression, ',', $._expression, optional(','), ')')),

        vertex_attr: $ => seq('@', 'vertex'),

        fragment_attr: $ => seq('@', 'fragment'),

        compute_attr: $ => seq('@', 'compute'),

        attribute: $ => choice(seq('@', $._ident_pattern_token, optional($.argument_expression_list)), $.align_attr, $.binding_attr, $.blend_src_attr, $.builtin_attr, $.const_attr, $.diagnostic_attr, $.group_attr, $.id_attr, $.interpolate_attr, $.invariant_attr, $.location_attr, $.must_use_attr, $.size_attr, $.workgroup_size_attr, $.vertex_attr, $.fragment_attr, $.compute_attr),

        diagnostic_control: $ => seq('(', $.severity_control_name, ',', $.diagnostic_rule_name, optional(','), ')'),

        struct_decl: $ => seq('struct', $.ident, $.struct_body_decl),

        struct_body_decl: $ => seq('{', $.struct_member, repeat(seq(',', $.struct_member)), optional(','), '}'),

        struct_member: $ => seq(repeat($.attribute), $.member_ident, ':', $.type_specifier),

        type_alias_decl: $ => seq('alias', $.ident, '=', $.type_specifier),

        type_specifier: $ => $._template_elaborated_ident,

        variable_or_value_statement: $ => choice($.variable_decl, seq($.variable_decl, '=', $._expression), seq('let', $._optionally_typed_ident, '=', $._expression), seq('const', $._optionally_typed_ident, '=', $._expression)),

        variable_decl: $ => seq('var', $._disambiguate_template, optional($.template_list), $._optionally_typed_ident),

        _optionally_typed_ident: $ => seq($.ident, optional(seq(':', $.type_specifier))),

        global_variable_decl: $ => seq(repeat($.attribute), $.variable_decl, optional(seq('=', $._expression))),

        global_value_decl: $ => choice(seq('const', $._optionally_typed_ident, '=', $._expression), seq(repeat($.attribute), 'override', $._optionally_typed_ident, optional(seq('=', $._expression)))),

        // _primary_expression: $ => choice($._template_elaborated_ident, $.call_expression, $.literal, $.paren_expression),

        // call_expression: $ => $._call_phrase,

        _call_phrase: $ => seq($._template_elaborated_ident, $.argument_expression_list),

        // paren_expression: $ => seq('(', $._expression, ')'),

        argument_expression_list: $ => seq('(', optional($.expression_comma_list), ')'),

        expression_comma_list: $ => seq($._expression, repeat(seq(',', $._expression)), optional(',')),

        // component_or_swizzle_specifier: $ => choice(seq('[', $._expression, ']', optional($.component_or_swizzle_specifier)), seq('.', $.member_ident, optional($.component_or_swizzle_specifier)), seq('.', $.swizzle_name, optional($.component_or_swizzle_specifier))),

        // unary_expression: $ => choice($.singular_expression, seq('-', $.unary_expression), seq('!', $.unary_expression), seq('~', $.unary_expression), seq('*', $.unary_expression), seq('&', $.unary_expression)),

        // singular_expression: $ => seq($.primary_expression, optional($.component_or_swizzle_specifier)),

        // lhs_expression: $ => choice(seq($.core_lhs_expression, optional($.component_or_swizzle_specifier)), seq('*', $.lhs_expression), seq('&', $.lhs_expression)),

        // core_lhs_expression: $ => choice(seq($.ident, $._disambiguate_template), seq('(', $.lhs_expression, ')')),

        // multiplicative_expression: $ => choice($.unary_expression, seq($.multiplicative_expression, $.multiplicative_operator, $.unary_expression)),

        // multiplicative_operator: $ => choice('*', '/', '%'),

        // additive_expression: $ => choice($.multiplicative_expression, seq($.additive_expression, $.additive_operator, $.multiplicative_expression)),

        // additive_operator: $ => choice('+', '-'),

        // shift_expression: $ => choice($.additive_expression, seq($.unary_expression, $.shift_left, $.unary_expression), seq($.unary_expression, $.shift_right, $.unary_expression)),

        // relational_expression: $ => choice($.shift_expression, seq($.shift_expression, $.less_than, $.shift_expression), seq($.shift_expression, $.greater_than, $.shift_expression), seq($.shift_expression, $.less_than_equal, $.shift_expression), seq($.shift_expression, $.greater_than_equal, $.shift_expression), seq($.shift_expression, '==', $.shift_expression), seq($.shift_expression, '!=', $.shift_expression)),

        // short_circuit_and_expression: $ => choice($.relational_expression, seq($.short_circuit_and_expression, '&&', $.relational_expression)),

        // short_circuit_or_expression: $ => choice($.relational_expression, seq($.short_circuit_or_expression, '||', $.relational_expression)),

        // binary_or_expression: $ => choice($.unary_expression, seq($.binary_or_expression, '|', $.unary_expression)),

        // binary_and_expression: $ => choice($.unary_expression, seq($.binary_and_expression, '&', $.unary_expression)),

        // binary_xor_expression: $ => choice($.unary_expression, seq($.binary_xor_expression, '^', $.unary_expression)),

        // bitwise_expression: $ => choice(seq($.binary_and_expression, '&', $.unary_expression), seq($.binary_or_expression, '|', $.unary_expression), seq($.binary_xor_expression, '^', $.unary_expression)),

        // expression: $ => choice($.relational_expression, seq($.short_circuit_or_expression, '||', $.relational_expression), seq($.short_circuit_and_expression, '&&', $.relational_expression), $.bitwise_expression),

        _short_circuit_or_expression: $ => prec.left(1, seq($._expression, "||", $._expression)),

        _short_circuit_and_expression: $ => prec.left(2, seq($._expression, "&&", $._expression)),

        _binary_or_expression: $ => prec.left(3, seq($._expression, "|", $._expression)),

        _binary_xor_expression: $ => prec.left(4, seq($._expression, "^", $._expression)),

        _binary_and_expression: $ => prec.left(5, seq($._expression, "&", $._expression)),

        _relational_expression: $ => prec.left(6, seq($._expression, $._relational_operator, $._expression)),
        _relational_operator: $ => choice($.less_than, $.greater_than, $.less_than_equal, $.greater_than_equal, "==", "!="),

        _shift_expression: $ => prec.left(7, seq($._expression, choice($.shift_left, $.shift_right), $._expression)),

        _additive_expression: $ => prec.left(8, seq($._expression, $._additive_operator, $._expression)),
        _additive_operator: $ => choice('+', '-'),

        _multiplicative_expression: $ => prec.left(9, seq($._expression, $._multiplicative_operator, $._expression)),
        _multiplicative_operator: $ => choice('*', '/', '%'),

        unary_expression: $ => prec.right(10, seq($._unary_operator, $._expression)),
        _unary_operator: $ => choice('-', '!', '~', '*', '&'),

        _primary_expression: $ => prec.left(11, choice(
            $._template_elaborated_ident,
            $.literal,
            $.call_expression,
            $.indexing_expression,
            $.named_component_expression,
        )),

        call_expression: $ => prec.left(11, $._call_phrase),
        indexing_expression: $ => prec.left(11, seq($._expression, '[', $._expression, ']')),
        named_component_expression: $ => prec.left(11, seq($._expression, '.', choice($.member_ident, $.swizzle_name))),
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

        compound_statement: $ => seq(repeat($.attribute), '{', repeat($.statement), '}'),

        assignment_statement: $ => choice(seq($._expression, choice('=', $.compound_assignment_operator), $._expression), seq('_', '=', $._expression)),

        compound_assignment_operator: $ => choice('+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', $.shift_right_assign, $.shift_left_assign),

        increment_statement: $ => seq($._expression, '++'),

        decrement_statement: $ => seq($._expression, '--'),

        if_statement: $ => seq(repeat($.attribute), $.if_clause, repeat($.else_if_clause), optional($.else_clause)),

        if_clause: $ => seq('if', $._expression, $.compound_statement),

        else_if_clause: $ => seq('else', 'if', $._expression, $.compound_statement),

        else_clause: $ => seq('else', $.compound_statement),

        switch_statement: $ => seq(repeat($.attribute), 'switch', $._expression, $.switch_body),

        switch_body: $ => seq(repeat($.attribute), '{', repeat1($.switch_clause), '}'),

        switch_clause: $ => choice($.case_clause, $.default_alone_clause),

        case_clause: $ => seq('case', $.case_selectors, optional(':'), $.compound_statement),

        default_alone_clause: $ => seq('default', optional(':'), $.compound_statement),

        case_selectors: $ => seq($.case_selector, repeat(seq(',', $.case_selector)), optional(',')),

        case_selector: $ => choice('default', $._expression),

        loop_statement: $ => seq(repeat($.attribute), 'loop', repeat($.attribute), '{', repeat($.statement), optional($.continuing_statement), '}'),

        for_statement: $ => seq(repeat($.attribute), 'for', '(', $.for_header, ')', $.compound_statement),

        for_header: $ => seq(optional($.for_init), ';', optional($._expression), ';', optional($.for_update)),

        for_init: $ => choice($.variable_or_value_statement, $.variable_updating_statement, $.func_call_statement),

        for_update: $ => choice($.variable_updating_statement, $.func_call_statement),

        while_statement: $ => seq(repeat($.attribute), 'while', $._expression, $.compound_statement),

        break_statement: $ => 'break',

        break_if_statement: $ => seq('break', 'if', $._expression, ';'),

        continue_statement: $ => 'continue',

        continuing_statement: $ => seq('continuing', $.continuing_compound_statement),

        continuing_compound_statement: $ => seq(repeat($.attribute), '{', repeat($.statement), optional($.break_if_statement), '}'),

        return_statement: $ => seq('return', optional($._expression)),

        func_call_statement: $ => $._call_phrase,

        const_assert_statement: $ => seq('const_assert', $._expression),

        statement: $ => choice(';', seq($.return_statement, ';'), $.if_statement, $.switch_statement, $.loop_statement, $.for_statement, $.while_statement, seq($.func_call_statement, ';'), seq($.variable_or_value_statement, ';'), seq($.break_statement, ';'), seq($.continue_statement, ';'), seq('discard', ';'), seq($.variable_updating_statement, ';'), $.compound_statement, seq($.const_assert_statement, ';')),

        variable_updating_statement: $ => choice($.assignment_statement, $.increment_statement, $.decrement_statement),

        function_decl: $ => seq(repeat($.attribute), $.function_header, $.compound_statement),

        function_header: $ => seq('fn', $.ident, '(', optional($.param_list), ')', optional(seq('->', repeat($.attribute), $._template_elaborated_ident))),

        param_list: $ => seq($.param, repeat(seq(',', $.param)), optional(',')),

        param: $ => seq(repeat($.attribute), $.ident, ':', $.type_specifier),

        enable_directive: $ => seq('enable', $.enable_extension_list, ';'),

        enable_extension_list: $ => seq($.enable_extension_name, repeat(seq(',', $.enable_extension_name)), optional(',')),

        requires_directive: $ => seq('requires', $.software_extension_list, ';'),

        software_extension_list: $ => seq($.software_extension_name, repeat(seq(',', $.software_extension_name)), optional(',')),

        enable_extension_name: $ => $._ident_pattern_token,

        software_extension_name: $ => $._ident_pattern_token,

        severity_control_name: $ => $._ident_pattern_token,

        swizzle_name: $ => choice(/[rgba]/, /[rgba][rgba]/, /[rgba][rgba][rgba]/, /[rgba][rgba][rgba][rgba]/, /[xyzw]/, /[xyzw][xyzw]/, /[xyzw][xyzw][xyzw]/, /[xyzw][xyzw][xyzw][xyzw]/),

        _template_elaborated_ident: $ => seq($.ident, $._disambiguate_template, optional($.template_list)),

        _ident_pattern_token: $ => /([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u,

        ident: $ => seq($._ident_pattern_token, $._disambiguate_template),

        comment: $ => /\/\/.*/,

        _blankspace: $ => /[\u0020\u0009\u000a\u000b\u000c\u000d\u0085\u200e\u200f\u2028\u2029]/u
    }
})
