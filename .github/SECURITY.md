# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.2.x   | yes       |
| < 0.2.0 | no        |

## Reporting a Vulnerability

Use a private channel. Do not post exploit details in public issues.

Preferred flow:

1. Open a private vulnerability report in the repository Security tab.
2. Include:
   - affected endpoint/module
   - reproduction steps
   - impact
   - proof of concept (if available)
   - mitigation suggestions (optional)

If private reporting is not available:

1. Open a minimal issue titled `[SECURITY] Private contact request`.
2. Do not include secrets, payloads, exploit code, or sensitive logs.

## Response Targets (operational baseline)

- Acknowledgement target: up to 72 hours.
- Initial triage target: up to 7 days.
- Fix/release target: depends on severity and reproduction quality.

## Scope Notes

- The API enforces `x-api-key` auth on all public endpoints.
- Rate limiting is required and part of abuse mitigation.
- If a key is exposed, rotate immediately:
  - `npm run keys:rotate -- <key_id> <new_name>`
- After key rotation in production, redeploy and re-run:
  - `BASE_URL=<url> API_KEY=<key> npm run smoke:deploy`
