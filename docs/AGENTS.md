# Contributor and agent rules

## Before making changes

1. Read the relevant documents in `docs/` and inspect the existing implementation.
2. Preserve unrelated work in a dirty working tree.
3. Keep deterministic financial logic in `risk_engine/`; do not put calculations in React components or an LLM prompt.
4. Treat API contracts as shared boundaries. Update `API.md`, schemas, examples, and tests together when a contract changes.

## Implementation rules

- Never use an AI model as a source for exchange rates, losses, hedge prices, risk scores, or numerical calculation results.
- Validate all external or AI-extracted inputs before the risk engine receives them.
- Do not present a simplified hedge model as a real tradeable quote or financial advice.
- Prefer small, focused changes; do not rewrite unrelated code for style.
- Do not add secrets to source control. Add configuration keys to `.env.example` when they become necessary.

## Quality rules

- Add deterministic tests for changes to formulas, validation, parsing, and API behavior.
- Run the relevant backend tests and frontend build before handoff where dependencies are available.
- Update `RISK_ENGINE.md` for formula/assumption changes, `DECISIONS.md` for material architectural choices, and the relevant contract docs for public behavior changes.
