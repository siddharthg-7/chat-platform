# One-to-One Chat Application
# Production Audit, Refactoring & Completion Guide

> **Objective**
>
> Transform the existing codebase into a **fully production-ready one-to-one real-time messaging platform** by auditing every file, fixing architectural issues, implementing missing functionality, improving security, optimizing performance, and removing technical debt.

---

# Primary Goals

The AI must:

- Audit the entire repository.
- Inspect every backend and frontend file.
- Detect incomplete implementations.
- Remove duplicate or unused code.
- Fix security vulnerabilities.
- Complete missing features.
- Refactor poor architecture.
- Optimize database queries.
- Improve scalability.
- Make the application production ready.
- Ensure every existing feature still works.

---

# Important Rules

## DO NOT

- Generate placeholder code.
- Leave TODO comments.
- Skip incomplete files.
- Ignore existing functionality.
- Create duplicate implementations.
- Keep unused files.
- Leave dead code.
- Hardcode credentials.
- Break existing APIs.

---

## ALWAYS

- Read every file before modifying.
- Reuse existing architecture whenever possible.
- Follow Django best practices.
- Follow React best practices.
- Maintain clean folder structure.
- Keep consistent coding style.
- Add proper comments only where necessary.
- Use environment variables.
- Keep production security in mind.

---

# Phase 1 — Complete Repository Audit

Inspect:

- Backend
- Frontend
- API
- Database
- Authentication
- WebSockets
- Docker
- Nginx
- Environment variables
- Static files
- Media
- Tests
- CI/CD
- Documentation

Create a dependency graph.

Identify:

- Unused files
- Dead code
- Duplicate logic
- Broken imports
- Circular dependencies
- Missing validations
- Missing tests
- Security vulnerabilities
- Performance bottlenecks

---

# Phase 2 — Security Improvements

## Secret Key

Current issue

- SECRET_KEY falls back to an insecure default.

Fix

- Remove fallback.
- Application must fail during startup if SECRET_KEY is missing.

Acceptance

- No default secret exists.
- Startup fails without SECRET_KEY.

---

## Debug

Current issue

DEBUG defaults to True.

Fix

Default:

```
DEBUG=False
```

Allow only local development override.

---

## CORS

Current issue

```
CORS_ALLOW_ALL_ORIGINS=True
```

Fix

Use

```
CORS_ALLOWED_ORIGINS
```

from environment variables.

Production should only allow approved domains.

---

## Database Credentials

Current issue

Hardcoded defaults.

Fix

Move everything to environment variables.

Never commit credentials.

---

## Redis

Move

- host
- password
- port

to environment variables.

---

## Remove

Remove unnecessary packages from

INSTALLED_APPS

Example

```
daphne
```

if not required.

---

# Authentication Improvements

Current Problems

- Raw jwt.decode
- User imported directly
- Query-string JWT
- No blacklist validation
- Different auth logic for REST and WS

---

## Replace User Imports

Replace

```python
from django.contrib.auth.models import User
```

with

```python
get_user_model()
```

everywhere.

---

## Token Validation

Replace manual

```python
jwt.decode()
```

with

SimpleJWT

TokenBackend

or equivalent verification API.

Validate

- expiry
- signature
- token type
- blacklist

---

## WebSocket Authentication

Current

```
ws://...?token=...
```

Remove this.

Production should use

- Authorization header

or

- HTTP-only secure cookies

Never expose JWT inside URLs.

---

## Centralize Permissions

Create a reusable permission layer.

REST and WebSocket must use identical authorization logic.

---

# WebSocket Improvements

Implement:

## Message Acknowledgement

Server must return

```json
{
    "temp_id":"",
    "message_id":"",
    "created_at":"",
    "status":"sent"
}
```

after saving.

Frontend replaces temporary message.

---

## Throttling

Prevent spam.

Rate limit messages.

Example

```
30 messages/minute
```

(configurable)

---

## Presence

Current issue

last_seen never updates.

Fix

Update

```
last_seen
```

on disconnect.

Store UTC timestamps.

---

## Heartbeat

Implement

- ping
- pong
- reconnect strategy

---

## Event Protocol

Document every event.

Example

```
message

typing

online

offline

ack

read

error
```

---

# API Improvements

---

## Pagination

Current

Returns all messages.

Fix

Implement DRF pagination.

Support

- page
- page_size

or

cursor pagination.

---

## Conversation Lookup

Ensure

exact participant matching.

Never create duplicate one-to-one conversations.

---

## Query Optimization

Use

```
select_related()

prefetch_related()
```

where appropriate.

Optimize indexes.

---

## Attachment Validation

Validate

- file size
- MIME type
- extension

Reject unsupported uploads.

---

## Production Storage

Replace local media with

- S3
- Cloud Storage

Support presigned uploads.

---

# Data Model Improvements

Replace every direct User reference.

Optimize

- indexes
- relationships

Add migration if needed.

---

# Frontend Improvements

Audit

- React
- Routing
- State
- Components
- Hooks
- API layer
- WebSocket layer

---

## Production Build

Ensure

```
NODE_ENV=production
```

Use

- code splitting
- lazy loading
- asset hashing

---

## WebSocket Client

Implement

- reconnect
- exponential backoff
- heartbeat
- optimistic UI
- ACK replacement

---

## Security

Implement

- CSP
- XSS prevention
- secure cookies
- HTTPS only
- WSS

---

# Nginx Improvements

Configure

- WebSocket proxy
- TLS
- Compression
- Cache-Control
- Static caching
- Media caching

Enable

```
gzip
```

Add security headers.

---

# Docker Improvements

Audit

- Dockerfile
- docker-compose

Improve

- image size
- layers
- caching
- production build

Separate

development

and

production

compose files.

---

# Deployment Improvements

Support

- Multiple backend instances
- Shared Redis
- Load balancer
- Health checks
- Rolling deployment
- HTTPS

Add

```
/health/
```

endpoint.

---

# Observability

Integrate

- Structured logging
- Sentry
- Prometheus
- Grafana

Track

- Requests
- Errors
- Active WS connections
- Messages/sec

---

# Testing

Add

## Backend

- Unit tests
- API tests
- Model tests
- Serializer tests

---

## WebSockets

Test

- connect
- disconnect
- auth
- messaging
- permissions
- ACK
- reconnect

---

## Frontend

Test

- components
- hooks
- routing
- API
- messaging

---

# CI/CD

Create pipeline.

Every Pull Request should

- Install dependencies
- Lint
- Format
- Run backend tests
- Run frontend tests
- Build frontend
- Check migrations
- Verify production build

---

# Static & Media

Use CDN

Examples

- Cloudflare
- CloudFront

Store uploads in durable cloud storage.

---

# Logging

Replace print statements.

Use structured logging.

Log

- authentication
- errors
- websocket events
- API failures

---

# Documentation

Rewrite README.

Include

- Setup
- Local Development
- Docker
- Environment Variables
- Production Deployment
- WebSocket Protocol
- API Documentation
- Troubleshooting
- Architecture Diagram

---

# Cleanup

Remove

- duplicate code
- obsolete components
- unused images
- dead CSS
- unused APIs
- stale migrations
- temporary scripts
- commented code
- unused packages

---

# Folder Structure

Reorganize if necessary.

Every folder must have a clear responsibility.

Maintain clean architecture.

---

# Code Quality

Follow

- PEP8
- Django best practices
- React best practices
- DRY
- SOLID
- Clean Architecture

Run

- Black
- isort
- Ruff (or Flake8)
- ESLint
- Prettier

---

# Final Verification Checklist

The project is considered complete only if:

- Repository fully audited
- All vulnerabilities fixed
- No insecure defaults
- Environment variables properly configured
- Production-ready authentication
- Secure WebSocket implementation
- REST and WS authorization identical
- Message ACK implemented
- Pagination implemented
- File validation implemented
- Durable media storage configured
- Frontend optimized
- Nginx production-ready
- Docker production-ready
- CI/CD operational
- Comprehensive testing added
- Logging and monitoring configured
- Health checks implemented
- Documentation completed
- Dead code removed
- Unused files deleted
- No duplicate implementations remain
- Application builds successfully
- Backend passes all tests
- Frontend passes all tests
- Docker deployment works
- Production deployment verified
- No regressions introduced

---

# Expected Final Deliverable

A fully production-ready, secure, scalable, maintainable one-to-one real-time chat application that:

- Passes all automated tests
- Uses modern security practices
- Supports scalable deployment
- Has complete documentation
- Has optimized performance
- Contains clean, maintainable code
- Is ready for real-world production use without major architectural changes.