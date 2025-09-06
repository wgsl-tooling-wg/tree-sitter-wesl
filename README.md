# tree-sitter-mew

This repository contains a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the WebGPU Shading Language ([WGSL](https://gpuweb.github.io/gpuweb/wgsl/)) with support for [MEW](https://github.com/ncthbrt/mew) extensions.

## See Also

- tree-sitter-wesl: https://github.com/wgsl-tooling-wg/tree-sitter-wesl
- WGSL/WESL Language support in Zed using tree-sitter-wesl: https://github.com/lucascompython/wgsl-wesl-zed
- `wgsl-analyzer` has a textMate grammar for WESL https://github.com/wgsl-analyzer/wgsl-analyzer
- Auto-generated tree-sitter implementation (gpuweb): https://github.com/gpuweb/tree-sitter-wgsl
- Widely used tree-sitter implementation (szebniok): https://github.com/szebniok/tree-sitter-wgsl
- Fork with support for Bevy's preprocessor: https://github.com/tree-sitter-grammars/tree-sitter-wgsl-bevy

## License

Except where noted (below and/or in individual files), all code in this repository is dual-licensed under either:

- MIT License ([LICENSE-MIT](LICENSE-MIT) or [http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0))

at your option.

**Exceptions**:

- The files `grammar.js` and `src/scanner.c` contain portions of code from [tree-sitter-wgsl](https://github.com/gpuweb/tree-sitter-wgsl),
  licensed under the W3C Software and Document License ([LICENSE-W3C](LICENSE-W3C.md) or https://www.w3.org/copyright/software-license-2023/),
  Copyright (c) 2025 World Wide Web Consortium.

### Your contributions

Unless you explicitly state otherwise,
any contribution intentionally submitted for inclusion in the work by you,
as defined in the Apache-2.0 license,
shall be dual licensed as above,
without any additional terms or conditions.
