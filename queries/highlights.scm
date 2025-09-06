; comments

(line_comment) @comment.line
(block_comment) @comment.block

; variables, types, constants

(identifier) @variable

(param
  (identifier) @variable.parameter)

(struct_decl
  (identifier) @type)

(struct_member
  name: (_) @variable.other.member)

(named_component_expression
  component: (_) @variable.other.member)

((identifier) @type
  (#match? @type "^[A-Z]"))

((identifier) @constant
  (#match? @constant "^[A-Z0-9_]+$"))

(type_specifier
    (identifier) @type)

; imports (MEW extension)

(item_import (identifier) @namespace)

(import_path (identifier) @namespace)

; (ident_path (identifier) @namespace)

(item_import (identifier) @type
  (#match? @type "^[A-Z]"))

(item_import (identifier) @constant
  (#match? @constant "^[A-Z0-9_]+$"))

; functions

(function_decl
  (function_header
    (identifier) @function))

(call_expression
  (identifier) @function)

(func_call_statement
  (identifier) @function)

; templates

(template_list) @punctuation

(type_specifier
  (template_list
    (identifier) @type))

(template_list
  (template_list
    (identifier) @type))

(variable_decl ; this is var<storage> et.al
  (template_list
    (identifier) @keyword.storage.modifier))

; attributes

(attribute
  (identifier) @attribute) @attribute

(attribute
  (identifier) @attr-name
  (argument_list
    (identifier) @variable.builtin)
  (#eq? @attr-name "builtin"))

; literals

(bool_literal) @constant.builtin.boolean
(int_literal) @constant.numeric.integer
(hex_int_literal) @constant.numeric.integer
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
  "continue"
  "continuing"
  "return"
  "discard"
] @keyword.control

[ ; MEW import extension
  "import"
  "as"
  "with"
] @keyword.control.import

[
  "module"
  "var"
  "let"
  "const"
  "fn"
  "struct"
  "alias"
] @keyword

; expressions

[
  "-" "!" "~" "*" "&" ; unary
  "^" "|" "/" "%" "+" (shift_left) (shift_right) ; binary
  (less_than) (greater_than) (less_than_equal) (greater_than_equal) "==" "!=" ; relational
  "+=" "-=" "*=" "/=" "%=" "|=" "^=" "++" "--" "=" ; assign
  "->" ; return
] @operator

; punctuation

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
[ "," "." ":" ";" ] @punctuation.delimiter
