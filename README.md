# update-package-version-from-release-branch

[![GitHub Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)

## Usage

**Non-protected branch**:

```yaml
name: Bump package version
on:
  push:
    branches:
      - 'release/**'

permissions:
  contents: write

jobs:
  bump:
    name: Bump package version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        id: checkout
        uses: actions/checkout@v4
      - name: Update Package Version
        uses: sliker/update-package-version-from-release-branch@v1.0.0
```

**Protected branch**:

```yaml
name: Bump package version
on:
  push:
    branches:
      - 'release/**'

permissions:
  contents: write

jobs:
  bump:
    name: Bump package version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        id: checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GB_TOKEN }}
      - name: Update Package Version
        uses: sliker/update-package-version-from-release-branch@v1.0.0
```
