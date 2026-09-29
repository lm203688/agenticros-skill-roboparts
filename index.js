/**
 * RoboParts AgenticROS Skill
 *
 * Wraps all 11 RoboParts MCP tools as AgenticROS capabilities.
 * Each tool proxies to the hosted MCP server at roboparts.cc/mcp.
 *
 * Usage:
 *   npx agenticros skills install @agenticros/roboparts
 *   # or: npx agenticros skills install lm203688/roboparts
 *
 * Config (config.skills.roboparts):
 *   mcpUrl: "https://roboparts.cc/mcp"   // override default
 */

import { Type } from '@sinclair/typebox';
import { createMcpClient } from './lib/mcp-client.js';

const DEFAULT_MCP_URL = 'https://roboparts.cc/mcp';

// ---------------------------------------------------------------------------
// Shared type fragments
// ---------------------------------------------------------------------------

const ComponentId = Type.String({
  description:
    'Component ID, e.g. ACT-001 / CHIP-001 / SENS-001. Obtain from search_components — do not guess: ID prefix and category are not always aligned.',
});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const tools = [
  {
    name: 'roboparts_search_components',
    label: 'Search Robot Components',
    mcpName: 'search_components',
    description:
      'Search 865 robot component entities by keyword and/or category. Returns id, name, category, manufacturer, key specs, and evidence tier. 20 categories: actuators, sensors, chips, interfaces, protocols, platforms, grippers, etc.',
    parameters: Type.Object({
      keyword: Type.Optional(
        Type.String({ description: 'Keyword — case-insensitive substring match on name/manufacturer/protocol/interface/description. Try both Chinese and English terms separately.' })
      ),
      category: Type.Optional(
        Type.Union([
          Type.Literal('actuators'),
          Type.Literal('sensors'),
          Type.Literal('chips'),
          Type.Literal('interfaces'),
          Type.Literal('protocols'),
          Type.Literal('llms'),
          Type.Literal('platforms'),
          Type.Literal('flexible_actuators'),
          Type.Literal('robot_ai_models'),
          Type.Literal('data_acquisition'),
          Type.Literal('connectors'),
          Type.Literal('integrated_joints'),
          Type.Literal('reducers'),
          Type.Literal('controllers'),
          Type.Literal('grippers'),
          Type.Literal('structural'),
          Type.Literal('cables'),
          Type.Literal('power'),
          Type.Literal('pcb'),
          Type.Literal('bionic_mechanisms'),
        ], { description: 'Category filter (exact match). Omit to search across all 20 categories.' })
      ),
      limit: Type.Optional(
        Type.Number({ default: 10, minimum: 1, maximum: 50, description: 'Max results to return. Default 10, max 50.' })
      ),
      include_market_intelligence: Type.Optional(
        Type.Boolean({ default: false, description: 'Include 3 market-intelligence entries (patent maps, trend reports). Default false.' })
      ),
    }),
  },
  {
    name: 'roboparts_get_component_detail',
    label: 'Get Component Detail',
    mcpName: 'get_component_detail',
    description:
      'Get full detail of a single component by ID. Returns all fields including source_tier (data provenance), confidence, data_quality, mechanical_interface, standard_conformance, and more.',
    parameters: Type.Object({
      id: ComponentId,
    }),
  },
  {
    name: 'roboparts_check_compatibility',
    label: 'Check Compatibility',
    mcpName: 'check_compatibility',
    description:
      'Check 4D compatibility (protocol / electrical / mechanical / software-ROS2) between two components. Returns per-dimension verdict with evidence, uncertainty flags, and confidence scores.',
    parameters: Type.Object({
      component1_id: ComponentId,
      component2_id: ComponentId,
    }),
  },
  {
    name: 'roboparts_compare_components',
    label: 'Compare Components',
    mcpName: 'compare_components',
    description:
      'Side-by-side comparison of 2-6 components on key parameters (torque, speed, voltage, protocol, interface, weight, price). Matching values are auto-highlighted.',
    parameters: Type.Object({
      ids: Type.Array(
        ComponentId,
        { minItems: 2, maxItems: 6, description: 'Component IDs to compare (2-6). Get from search_components first.' }
      ),
    }),
  },
  {
    name: 'roboparts_recommend_for_application',
    label: 'Recommend for Application',
    mcpName: 'recommend_for_application',
    description:
      'Recommend component candidates for an application scenario. Returns candidates per category with reasoning. Heuristic filter — not an engineering selection; always verify against vendor datasheets.',
    parameters: Type.Object({
      application: Type.Union([
        Type.Literal('humanoid'),
        Type.Literal('quadruped'),
        Type.Literal('robot_arm'),
        Type.Literal('amr'),
        Type.Literal('industrial'),
      ], { description: 'Application scenario.' }),
      budget: Type.Optional(
        Type.Number({ description: 'Per-unit budget cap (USD). Price field coverage is limited — use with caution.' })
      ),
      count: Type.Optional(
        Type.Number({ default: 3, minimum: 1, maximum: 10, description: 'Candidates per category. Default 3, max 10.' })
      ),
    }),
  },
  {
    name: 'roboparts_get_parameter_semantics',
    label: 'Get Parameter Semantics',
    mcpName: 'get_parameter_semantics',
    description:
      'Retrieve parameter semantic definitions — the same field name (e.g. torque, speed) can mean different things across vendors. Library has 19 torque variants and 37 speed variants documented.',
    parameters: Type.Object({}),
  },
  {
    name: 'roboparts_bom_compatibility_check',
    label: 'BOM Compatibility Check',
    mcpName: 'bom_compatibility_check',
    description:
      'Pairwise compatibility matrix for a bill of materials. Input component IDs, get every pair\'s protocol/electrical/mechanical/software verdict. Supports mixing library parts (ACT-xxx) with OSS contributions (OSS-xxx).',
    parameters: Type.Object({
      component_ids: Type.Array(
        ComponentId,
        { minItems: 2, description: 'Component IDs to check. At least 2 for meaningful results.' }
      ),
    }),
  },
  {
    name: 'roboparts_semantic_search',
    label: 'Semantic Search',
    mcpName: 'semantic_search',
    description:
      'Natural-language semantic search over component entities. Uses offline TF-IDF vector index (zero external model, zero data exfiltration). Chinese and English queries supported.',
    parameters: Type.Object({
      query: Type.String({ description: 'Natural-language query, e.g. "six-axis force sensor waterproof" or "ROS2 communication module".' }),
      k: Type.Optional(
        Type.Number({ default: 5, minimum: 1, maximum: 30, description: 'Top-k results. Default 5.' })
      ),
    }),
  },
  {
    name: 'roboparts_get_standard_audit',
    label: 'Standard Conformance Audit',
    mcpName: 'get_standard_audit',
    description:
      'Cross-validate entity declarations against known ISO/ANSI standards registry. Returns coverage statistics, declaration gaps, and data-quality conflicts.',
    parameters: Type.Object({
      scope: Type.Optional(
        Type.Union([
          Type.Literal('all'),
          Type.Literal('conflicts'),
        ], { default: 'all', description: 'Return scope: all (full audit) or conflicts (only quality issues).' })
      ),
    }),
  },
  {
    name: 'roboparts_review_compatibility',
    label: 'Multi-Agent Compatibility Review',
    mcpName: 'review_compatibility',
    description:
      'Multi-agent quality-assurance review of compatibility between two parts. Worker layer executes 4D verdict; Governor layer independently reviews for correctness, data quality, and uncertainty. Returns both verdicts plus review notes.',
    parameters: Type.Object({
      component1_id: ComponentId,
      component2_id: ComponentId,
    }),
  },
  {
    name: 'roboparts_lint_urdf',
    label: 'URDF Lint',
    mcpName: 'lint_urdf',
    description:
      'Static compatibility check of URDF XML. Validates 10 categories of issues: missing links, invalid joints, duplicate names, missing inertials, invalid units, and more. Max 512KB input.',
    parameters: Type.Object({
      urdf_xml: Type.String({ description: 'Full URDF XML string including <?xml ... ?> declaration. Max 512KB.' }),
      check_level: Type.Optional(
        Type.Union([
          Type.Literal('all'),
          Type.Literal('errors_only'),
          Type.Literal('warnings_and_errors'),
        ], { default: 'all', description: 'Check strictness level.' })
      ),
    }),
  },
];

// ---------------------------------------------------------------------------
// Skill registration
// ---------------------------------------------------------------------------

export function registerSkill(api, config, context) {
  const opts = config.skills?.roboparts ?? {};
  const mcpUrl = opts.mcpUrl ?? DEFAULT_MCP_URL;
  const client = createMcpClient(mcpUrl);

  for (const tool of tools) {
    api.registerTool({
      name: tool.name,
      label: tool.label,
      description: tool.description,
      parameters: tool.parameters,
      async execute(_callId, params) {
        try {
          const result = await client.callTool(tool.mcpName, params);
          return result;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return { error: msg, _mcp_server: mcpUrl, _tool: tool.mcpName };
        }
      },
    });
  }

  if (context?.logger?.info) {
    context.logger.info(`roboparts skill: registered ${tools.length} tools (MCP: ${mcpUrl})`);
  }
}
