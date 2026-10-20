# Security policy

## Supported versions
Only the latest release (and `main`) receives security fixes.

## Reporting a vulnerability
Please do **not** open a public issue. Use GitHub's private reporting: **Security > Report a vulnerability** at https://github.com/ARaminco/AraminConsole/security/advisories/new. Include the affected version, a minimal reproduction, and the impact. You can expect an acknowledgement within 5 days and a fix or mitigation plan within 30 days for confirmed issues.

## Scope
AraminConsole is a client-side UI library with no server component. Relevant reports include XSS through component APIs (for example unescaped HTML in `AC.toast`, tables, or templates), prototype pollution, and unsafe handling of `data-ac-config`. Issues in your own backend or in third-party starters' dependencies are out of scope.

## Guidance for users
- Escape untrusted data before inserting it into markup; use `AC.escapeHtml`.
- Serve with a strict Content-Security-Policy; the library needs no `eval` and no inline script.
