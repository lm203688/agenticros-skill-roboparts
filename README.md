# RoboParts AgenticROS Skill

[![npm](https://img.shields.io/npm/v/agenticros-skill-roboparts.svg)](https://www.npmjs.com/package/agenticros-skill-roboparts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**865 robot component entities, 20 categories, 4D compatibility check.**

A AgenticROS skill that wraps all 11 RoboParts MCP tools. Vendor-neutral: we neither manufacture nor resell any part.

## Install

```bash
# From marketplace
npx agenticros skills install lm203688/roboparts

# Or from npm
npx agenticros skills install agenticros-skill-roboparts
```

## Tools

| Tool | Verb | Description |
|------|------|-------------|
| `roboparts_search_components` | search | Search 865 entities by keyword/category |
| `roboparts_get_component_detail` | lookup | Full detail of one component by ID |
| `roboparts_check_compatibility` | check_compatibility | 4D compatibility (protocol/electrical/mechanical/software) |
| `roboparts_compare_components` | compare | Side-by-side comparison of 2-6 parts |
| `roboparts_recommend_for_application` | recommend | Recommend parts for humanoid/quadruped/arm/amr/industrial |
| `roboparts_get_parameter_semantics` | lookup | Parameter semantic definitions (19 torque variants, 37 speed variants) |
| `roboparts_bom_compatibility_check` | check_bom | Pairwise BOM compatibility matrix |
| `roboparts_semantic_search` | search | Natural-language semantic search (offline TF-IDF) |
| `roboparts_get_standard_audit` | audit | ISO/ANSI standard conformance audit |
| `roboparts_review_compatibility` | review | Multi-agent QA review (Worker + Governor) |
| `roboparts_lint_urdf` | lint | URDF static analysis (10 issue categories) |

## Mission chaining example

```json
{
  "steps": [
    { "id": "find", "capability": "roboparts_search_components", "inputs": { "keyword": "harmonic drive 20Nm" } },
    { "id": "check", "capability": "roboparts_check_compatibility", "inputs": { "component1_id": "{{find.outputs.results[0].id}}", "component2_id": "SENS-001" } }
  ]
}
```

## Config

```jsonc
{
  "skills": {
    "roboparts": {
      "mcpUrl": "https://roboparts.cc/mcp"
    }
  }
}
```

- `mcpUrl` — MCP server URL. Default: `https://roboparts.cc/mcp`. Override to point to a self-hosted instance.

## Data provenance

All data is CC BY 4.0. Source tiers:
- **A** (48.4%) — manufacturer datasheet, official documentation
- **B** (34.2%) — verified third-party documentation
- **C** (17.3%) — community contributions, unverified

Mechanical interface declaration rate: 13.4% (67/500 applicable). Three-state honesty — the only registry that tells you "I don't know" instead of guessing.

## License

Code: MIT | Data: CC BY 4.0

[roboparts.cc](https://roboparts.cc)
