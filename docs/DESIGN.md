# Design system

## Goal

The product should feel calm, reliable, and legible to a business user who may not be a treasury specialist. It should communicate exposure and assumptions before it communicates sophistication.

## Visual language

- Deep green/near-black background for focused, professional contrast.
- Soft green highlights for primary actions and completed/low-risk states.
- Amber for medium risk and restrained red for high risk or errors.
- Manrope for interface text and a monospaced face for labels, rates, and status.
- Rounded cards with clear whitespace; no visual treatment should obscure a number or its assumption.

## Information hierarchy

1. State the user's business exposure in plain language.
2. Show the current INR exposure as the primary metric.
3. Show the risk score and classification as secondary context.
4. State source assumptions and the financial-advice disclaimer close to results.

## Interaction guidelines

- Provide demo data as a one-click path for a reliable presentation.
- Accept CSV/XLS/XLSX with clear unsupported-file and missing-column errors.
- Disable action controls during API work and show a concise progress state.
- Keep the initial result screen responsive: metrics stack on narrow screens.
- Future charts must label axes, base rate, scenario rate, and whether values are illustrative.

## Accessibility

Use semantic controls, visible focus states, contrast-compliant text, and status/error text that can be announced to assistive technology. Do not encode risk level by color alone.
