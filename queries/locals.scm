; Scopes

[
  (global_declaration)
  (module_body)
  (switch_body)
  (compound_statement)
] @local.scope

; References

(identifier) @local.reference
; (type_specifier) @local.reference

; Definitions

(param
  (identifier) @local.definition)
