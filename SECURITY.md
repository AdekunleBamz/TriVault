# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within TriVault, please follow these steps:

1. **Do NOT** disclose the vulnerability publicly
2. Send a detailed description of the vulnerability to security@trivault.app
3. Include steps to reproduce the issue if possible
4. Allow up to 48 hours for an initial response

## Smart Contract Security

The TriVault smart contract has been designed with security in mind:

- Uses OpenZeppelin's battle-tested contracts where applicable
- Follows the checks-effects-interactions pattern
- No external calls to untrusted contracts
- Fixed fee amount to prevent manipulation

## Scope

The following are in scope for security reports:

- Smart contract vulnerabilities
- Frontend security issues (XSS, CSRF, etc.)
- Authentication/authorization bypasses
- Private key exposure risks
- API vulnerabilities

## Out of Scope

- Social engineering attacks
- Physical attacks
- Denial of service attacks that don't exploit code vulnerabilities
- Issues in third-party dependencies (report these to the respective projects)

## Bug Bounty

We may offer rewards for valid security reports at our discretion. The reward amount depends on:

- Severity of the vulnerability
- Quality of the report
- Potential impact on users

Thank you for helping keep TriVault secure!
