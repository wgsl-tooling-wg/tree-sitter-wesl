import XCTest
import SwiftTreeSitter
import TreeSitterWesl

final class TreeSitterWeslTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_wesl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Wesl grammar")
    }
}
