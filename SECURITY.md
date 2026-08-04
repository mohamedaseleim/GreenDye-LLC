# Security Policy

## Known Vulnerabilities and Mitigations

### Backend Dependencies

#### MJML HTML Minifier (High Severity)
- **Package**: `mjml@4.15.3` → `html-minifier`
- **Issue**: REDoS vulnerability in html-minifier (GHSA-pfq8-rq6v-vf5m)
- **Status**: Waiting for upstream fix
- **Mitigation**: 
  - MJML is only used for email template generation in a controlled environment
  - The vulnerability requires specially crafted input to exploit
  - Email templates are predefined and not user-controlled
  - Latest stable MJML version (4.15.3) is in use
  - Alpha version 5.0.0 would require extensive testing and may introduce breaking changes
- **Action**: Monitor for stable MJML v5 release with fixed dependencies

### Frontend Dependencies

#### Development Dependencies (Moderate to High Severity)
- **Packages**: `nth-check`, `postcss`, `webpack-dev-server`
- **Issues**: 
  - nth-check: Inefficient Regular Expression Complexity (GHSA-rp65-9cf3-cjxr)
  - postcss: Line return parsing error (GHSA-7fh5-64p2-3v2j)
  - webpack-dev-server: Source code theft via malicious websites (GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v)
- **Status**: Transitive dependencies via react-scripts 5.0.1
- **Mitigation**:
  - These are development-only dependencies
  - Do not affect production builds
  - webpack-dev-server is only used during local development
  - Production builds use static hosting with no dev server
  - Latest stable react-scripts version (5.0.1) is in use
- **Action**: Monitor for react-scripts updates that include fixed dependencies

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please email the security team or create a private security advisory on GitHub.

## Security Best Practices

This project follows security best practices including:
- Regular dependency updates
- Use of security-focused middleware (Helmet, CORS, rate limiting)
- Input validation and sanitization
- Secure authentication with JWT
- Environment variable management for sensitive data
- Regular security audits via `npm audit`
