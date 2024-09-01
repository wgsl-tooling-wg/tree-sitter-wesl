from unittest import TestCase

import tree_sitter, tree_sitter_wesl


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_wesl.language())
        except Exception:
            self.fail("Error loading Wesl grammar")
