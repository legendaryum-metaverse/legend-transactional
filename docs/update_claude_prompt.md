# CLAUDE.md Update Prompt

**Purpose**: Guide for updating CLAUDE.md when implementing new features in legend-transactional

---

## Context

CLAUDE.md is the **primary reference document** for Claude Code in future sessions. It must be:

- **Concise**: Scannable, table-driven, no verbose explanations
- **Accurate**: Reflect current implementation state
- **Practical**: Focus on what developers need to know
- **Current**: Update with each significant feature addition

**Target Audience**: Claude Code in future sessions, developers working on the library

---

## Update Principles

### 1. Maintain Brevity

- Use tables for structured data
- Use bullet points for lists
- Keep descriptions to 1-2 sentences
- Link to code locations (e.g., `src/Broker/PublishToExchange.ts:46-55`)

### 2. Update Version References

- Version header (line 3)
- Event counts
- Queue counts
- Microservice counts
- Footer timestamp and description

### 3. Preserve Structure

- Don't add new sections unless absolutely necessary
- Update existing sections in place
- Keep the 10-section table of contents
- Maintain markdown formatting (tables, code blocks, links)

### 4. Focus on "What Changed"

- New events → Update event tables
- New queues → Update infrastructure lists
- New microservices → Update counts and references
- New behavior → Update emission points, flow diagrams

---

## Section-by-Section Update Guide

### Header (Lines 1-7)

**Update When**: Major/minor version changes

**What to Update**:

- Version number (e.g., `2.3.0+`)
- Status (Development/Production)

**Example**:

```markdown
**Version:** 2.3.0+ (Development) | **Status:** ✅ Published to npm
```

---

### Architecture Section (Lines 38-77)

**Update When**: New exchange types, new message flow patterns

**What to Update**:

- Exchange types list (line 48-54)
- Message flow patterns (line 56-77)
- Flow diagrams (ASCII art)

**Example** (Audit Tracking):

```markdown
**Audit Tracking (Automatic):**
```

Event Published → audit.published
Event Received → audit.received
Event ACKed → audit.processed
Event NACKed → audit.dead_letter

```

```

---

### Audit Logging Section (Lines 81-197)

**Update When**: Changes to audit events, infrastructure, or behavior

**What to Update**:

1. **Status** (line 83): Version and feature description
2. **Events Table** (line 91-96): Add/update event rows
3. **Infrastructure** (line 104-112): Queue list
4. **Emission Points** (line 116-121): Code locations
5. **Operational Runbook** (line 178-197): Verification steps

**Key Patterns**:

- Event table columns: `Event`, `When`, `Key Payload Fields`
- Use snake_case for field names (e.g., `publisher_microservice`)
- Include code line references for emission points
- Update queue counts (3 → 4, etc.)

**Example Event Row**:

```markdown
| `audit.published` | Event published (source) | publisherMicroservice, publishedEvent, publishedAt, eventId (UUID v7) |
```

---

### Project Structure Section (Lines 200-235)

**Update When**: New files, changed file purposes, count changes

**What to Update**:

- Comments in ASCII tree (e.g., `# 35+ event types + 4 audit events`)
- Microservice count (e.g., `# 18 microservices`)
- File descriptions if purpose changed

**Example**:

```markdown
│ ├── event/events.ts # 35+ event types + 4 audit events
```

---

### Event System Section (Lines 295-341)

**Update When**: Adding/removing events

**What to Update**:

1. **Total Events** count (line 297)
2. **Common Events** list (line 301-306) - add new notable events
3. **Adding an Event** examples - update line references if they change

**Example**:

```markdown
**Total Events**: 39 (35 regular + 4 audit)
```

**Pattern**: Keep total = regular + audit count accurate

---

### Troubleshooting Section (Lines 603-611)

**Update When**: New failure modes, new debugging steps

**What to Update**:

- Debug steps for new features
- Queue/infrastructure counts
- Common error patterns

**Example Addition**:

```markdown
5. Verify `event_id` (UUID v7) is present in all audit events
```

---

### Footer (Line 706)

**Update When**: Every significant update

**What to Update**:

- Generation date (YYYY-MM-DD)
- Version description (brief summary of changes)

**Example**:

```markdown
**Generated**: 2025-10-10 | **Version**: 2.3.0+ (audit logging enhanced with publisher-side tracking & UUID v7 event correlation)
```

**Pattern**: Keep description under 100 characters, focus on key feature

---

## Common Update Scenarios

### Scenario 1: Adding a New Event

**Steps**:

1. Update **Event System** total count
2. Add to **Common Events** list if notable
3. If audit event, update **Audit Logging** table
4. Update **Project Structure** comment if count changed

**Example Diff**:

```diff
- **Total Events**: 38 (35 regular + 3 audit)
+ **Total Events**: 39 (35 regular + 4 audit)

- `audit.received`, `audit.processed`, `audit.dead_letter`
+ `audit.published`, `audit.received`, `audit.processed`, `audit.dead_letter`
```

---

### Scenario 2: Adding Infrastructure (Queue/Exchange)

**Steps**:

1. Update **Audit Logging** Infrastructure section
2. Update **Operational Runbook** verification steps
3. Update **Troubleshooting** debug steps
4. Update counts in all references

**Example Diff**:

```diff
- - `audit_received_commands` (routing key: `audit.received`)
- - `audit_processed_commands` (routing key: `audit.processed`)
- - `audit_dead_letter_commands` (routing key: `audit.dead_letter`)
+ - `audit_published_commands` (routing key: `audit.published`)
+ - `audit_received_commands` (routing key: `audit.received`)
+ - `audit_processed_commands` (routing key: `audit.processed`)
+ - `audit_dead_letter_commands` (routing key: `audit.dead_letter`)
```

---

### Scenario 3: Changing Event Payloads

**Steps**:

1. Update **Audit Logging** event table
2. Add notes about field changes (NEW, RENAMED, etc.)
3. Update examples in **Usage Example** if applicable
4. Update **Troubleshooting** if new fields cause common errors

**Example**:

```markdown
| `audit.received` | Event arrives | publisherMicroservice, receiverMicroservice, receivedEvent, ... |
```

**Note**: Use clear field names in table (not full JSON structure)

---

### Scenario 4: Adding New Microservice

**Steps**:

1. Update **Project Structure** microservice count
2. Add to available microservices comment
3. No need to list all microservices (keep concise)

**Example**:

```diff
- │   └── microservices.ts       # 17 microservices (includes audit-eda)
+ │   └── microservices.ts       # 18 microservices (includes audit-eda, transactional)
```

---

## Quality Checklist

Before finalizing CLAUDE.md updates, verify:

- [ ] **Version consistency**: Header, footer, and all references match
- [ ] **Count accuracy**: Events, queues, microservices all correct
- [ ] **Line references**: Code locations are accurate (run `grep -n` if needed)
- [ ] **Table formatting**: All markdown tables render correctly
- [ ] **Brevity maintained**: No verbose paragraphs, use tables/bullets
- [ ] **Examples updated**: If code patterns changed, update examples
- [ ] **Links valid**: Internal anchors and external URLs work
- [ ] **Timestamp current**: Footer has today's date
- [ ] **No duplication**: Don't repeat detailed specs from new_feat.md
- [ ] **Scannable**: Can quickly find key info in each section

---

## Update Workflow

### Step 1: Review Changes

```bash
# Check what changed in the feature branch
git diff origin/main HEAD --stat
git log origin/main..HEAD --oneline
```

### Step 2: Identify Affected Sections

Ask:

- Are there new events? → Update Event System + Audit Logging
- New infrastructure? → Update Audit Logging + Troubleshooting
- New behavior? → Update Architecture + How It Works
- New files? → Update Project Structure

### Step 3: Update Systematically

- Work top-to-bottom through CLAUDE.md
- Use Find & Replace for consistent count updates
- Update one section completely before moving to next
- Verify each change renders correctly

### Step 4: Verify Line References

```bash
# Find actual line numbers for code locations
grep -n "publishAuditEvent" src/Broker/PublishToExchange.ts
grep -n "EventsConsumeChannel" src/Consumer/channels/Events.ts
```

Update references like:

```markdown
`src/Broker/PublishToExchange.ts:46-55`
```

### Step 5: Run Final Checks

```bash
# Verify markdown formatting
mdl CLAUDE.md # If markdown linter available

# Check for common issues
grep -n "XXXX" CLAUDE.md # Find placeholder markers
grep -n "TODO" CLAUDE.md # Find unfinished sections
```

---

## Anti-Patterns (What NOT to Do)

❌ **Don't add verbose explanations**

- CLAUDE.md is a quick reference, not documentation
- Keep to 1-2 sentences max per item
- Use tables instead of paragraphs

❌ **Don't duplicate new_feat.md content**

- new_feat.md = detailed technical specs for implementation
- CLAUDE.md = concise reference for future sessions
- Different purposes, different audiences

❌ **Don't break existing structure**

- Keep the 10-section format
- Don't add new top-level sections without strong justification
- Maintain table of contents

❌ **Don't leave outdated information**

- Update ALL references to counts (events, queues, etc.)
- Remove deprecated patterns
- Update version numbers everywhere

❌ **Don't skip line reference updates**

- Code locations change as files grow
- Verify line numbers after edits
- Use ranges (e.g., `:46-55`) not single lines

---

## Examples from Recent Updates

### Good Update: Audit Events Table

**Before**:

```markdown
| Event            | When                              | Payload Fields                               |
| ---------------- | --------------------------------- | -------------------------------------------- |
| `audit.received` | Event arrives (before processing) | microservice, receivedEvent, receivedAt, ... |
```

**After**:

```markdown
| Event             | When                              | Key Payload Fields                                                    |
| ----------------- | --------------------------------- | --------------------------------------------------------------------- |
| `audit.published` | Event published (source)          | publisherMicroservice, publishedEvent, publishedAt, eventId (UUID v7) |
| `audit.received`  | Event arrives (before processing) | publisherMicroservice, receiverMicroservice, receivedEvent, ...       |
```

**Why Good**:

- Added new event
- Updated field names consistently
- Kept table format
- Added descriptive details (UUID v7) in table

---

### Good Update: Infrastructure Count

**Before**:

```markdown
2. Check RabbitMQ UI for `audit_exchange` and 3 queues
```

**After**:

```markdown
2. Check RabbitMQ UI for `audit_exchange` and 4 queues
```

**Why Good**:

- Simple, precise
- Updated all occurrences
- Maintains readability

---

### Bad Update: Overly Verbose

**Don't Do This**:

```markdown
The audit.published event is a new event type that was added to track when events are published by a microservice. This is different from the other three audit events which track the receiver-side lifecycle. The event includes fields like publisher_microservice which identifies which microservice published the event, and event_id which is a UUID v7 that allows for cross-event correlation across all audit events related to a single message...
```

**Instead Do**:

```markdown
| `audit.published` | Event published (source) | publisherMicroservice, publishedEvent, publishedAt, eventId (UUID v7) |
```

**Why**: Table format is scannable, includes all key info concisely

---

## Prompt Template for Future Updates

Use this when starting an update:

```
Task: Update CLAUDE.md to reflect new features in branch [BRANCH_NAME]

Context:
- Review git diff and commits to understand changes
- Focus on: [NEW EVENTS / NEW INFRASTRUCTURE / BEHAVIOR CHANGES]
- Maintain CLAUDE.md principles: concise, scannable, practical

Steps:
1. Read current CLAUDE.md sections: [RELEVANT SECTIONS]
2. Review changes via git diff
3. Update affected sections:
   - Version header (if version changed)
   - [SPECIFIC SECTIONS TO UPDATE]
   - Footer timestamp and description
4. Verify:
   - All counts accurate (events, queues, microservices)
   - Line references correct
   - Tables formatted properly
   - Brevity maintained

Deliverable: Updated CLAUDE.md ready for future Claude Code sessions
```

---

## Summary

**CLAUDE.md Purpose**: Concise, scannable reference for Claude Code in future sessions

**Update Strategy**:

1. Review changes → 2. Identify sections → 3. Update systematically → 4. Verify

**Key Principles**:

- Brevity over completeness
- Tables over paragraphs
- Accuracy over description
- Scannability over detail

**Remember**: CLAUDE.md is a map, not the territory. Point to code, don't duplicate it.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-10
**Maintainer**: Repository contributors
