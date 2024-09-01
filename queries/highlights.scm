; comments

(comment) @comment.line
(block_comment) @comment.block

; types

(type_specifier
    (ident) @type)

; functions

(function_decl 
  (function_header
    (ident) @function))

; templates

(template_list) @punctuation

(variable_decl
  (template_list
    (template_arg_expression
      (ident) @keyword.storage.modifier)))

(type_specifier
  (template_list
    (template_arg_expression
      (ident) @type)))

(template_list
  (template_arg_expression
    (template_list
      (template_arg_expression
        (ident) @type))))

; variables, names

(param
  (ident) @variable.parameter)
(variable_decl
  (ident) @variable)
(const_assert_statement) @variable

(struct_decl
  (ident) @type)
(member_ident) @variable.other.member

(ident) @variable

; attributes

(attribute) @attribute

; Literals

(bool_literal) @constant.builtin.boolean
(int_literal) @constant.numeric.integer
(float_literal) @constant.numeric.float


; keywords

[
  "if"
  "else"
  "loop"
  "for"
  "while"
  "switch"
  "case"
  "default"
  "break"
  ; "continue" ; TODO: why does this one not work?
  "return"
  "discard"
] @keyword.control

[
  "var"
  "let"
  "const"
  "fn"
  "struct"
] @keyword

; expressions

[
  "-" "!" "~" "*" "&" ; unary
  "^" "|" "/" "%" "+" (shift_left) (shift_right) ; binary
  (less_than) (greater_than) (less_than_equal) (greater_than_equal) "==" "!=" ; relational
  "+=" "-=" "*=" "/=" "%=" "|=" "^=" "++" "--" ; assign
  "->"
] @operator

; Punctuation
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"," @punctuation.delimiter
"." @punctuation.delimiter
":" @punctuation.delimiter
";" @punctuation.delimiter

; Builtin functions and types
(builtin_value_name) @function.builtin

