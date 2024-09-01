#!/usr/bin/env python3

import json

# Read package.json file
with open('package.json', 'r') as file:
    package_json = json.load(file)

# Extract dependencies
dependencies = package_json.get('dependencies', {})

# Print dependencies in the desired format
for package_name, version in dependencies.items():
    formatted_name = f'NPM_{package_name.upper().replace("-", "_")}_VERSION'
    print(f'{formatted_name}="{version}"')
