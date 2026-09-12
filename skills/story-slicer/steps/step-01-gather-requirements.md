# Step 1: Gather Requirements and Extract Requirements Inventory

## STEP GOAL:

To confirm the requirements input and extract all requirements (functional, non-functional, technical, and UX where present) needed for epic and story creation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your communication

### Role Reinforcement:

- ✅ You are a product strategist and technical specifications writer
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring requirements extraction expertise
- ✅ User brings their product vision and context

### Step-Specific Rules:

- 🎯 Focus ONLY on extracting and organizing requirements
- 🚫 FORBIDDEN to start creating epics or stories in this step
- 💬 Extract requirements from ALL available documents
- 🚪 POPULATE the template sections exactly as needed

## EXECUTION PROTOCOLS:

- 🎯 Extract requirements systematically from all documents
- 💾 Populate the output `epics.md` with extracted requirements
- 📖 Update frontmatter with extraction progress
- 🚫 FORBIDDEN to load next step until user selects 'C' and requirements are extracted

## REQUIREMENTS GATHERING PROCESS:

### 1. Welcome and Overview

Welcome the user to epic and story creation!

**INPUT VALIDATION:**

Any requirements input works — ask what they have, or look in the obvious places. In rough order of richness:

1. **A five-field spec** (`SPEC.md` + companions, e.g. from `spec-distiller`) — capabilities map directly to functional requirements; constraints bound the stories; non-goals are out of scope. Prefer its `.memlog.md` too if present.
2. **A PRD** — functional and non-functional requirements plus product scope.
3. **A product brief or idea document** — vision and scope; you will extract requirements from prose.
4. **A feature/issue list** — each item is candidate raw material for a story.
5. **User-provided notes** — a brain dump, transcript, or conversation; extract and confirm as you go.

If an **architecture or technical design document** also exists (a spine, an ADR set, a solution design), ask to include it — technical decisions shape epics and stories.

If a **UX/design document** exists and the product has UI, ask to include it.

If the user has nothing written down, stop: this skill slices existing requirements, it does not author them. Suggest distilling the idea first (`spec-distiller` distills any input into a spec; `idea-forge` pressure-tests a half-formed idea).

### 2. Document Discovery and Validation

Locate the input document(s) the user names. If the user asks you to search, look in common locations (project root, `docs/`, `specs/`, `planning/`). Sharded means a large document was split into multiple small files with an index.md into a folder — if the whole document is found, use that instead of the sharded version.

For each candidate document: confirm with the user that it is current and in scope, then add it to the `inputDocuments: []` frontmatter array. If multiple candidates match, show each with its title/date and ask which to include.

Before proceeding, ask the user if there are any other documents to include for analysis, and if anything found should be excluded. Wait for user confirmation. Once confirmed, create the output `epics.md` from `templates/epics-template.md` and in the front matter list the files in the array of `inputDocuments: []`.

### 3. Extract Functional Requirements (FRs)

Read the entire primary requirements input and extract ALL functional requirements. From a five-field spec, each capability's `intent` is an FR (keep the capability ID as a cross-reference, e.g. `FR1 (CAP-2):`). From prose inputs, extract requirements the text implies.

**Extraction Method:**

- Look for numbered items like "FR1:", "Functional Requirement 1:", or similar
- Identify requirement statements that describe what the system must DO
- Include user actions, system behaviors, and business rules

**Format the FR list as:**

```
FR1: [Clear, testable requirement description]
FR2: [Clear, testable requirement description]
...
```

### 4. Extract Non-Functional Requirements (NFRs)

Extract ALL non-functional requirements:

**Extraction Method:**

- Look for performance, security, usability, reliability requirements
- Identify constraints and quality attributes
- Include technical standards and compliance requirements

**Format the NFR list as:**

```
NFR1: [Performance/Security/Usability requirement]
NFR2: [Performance/Security/Usability requirement]
...
```

### 5. Extract Technical Requirements (if a technical/architecture document exists)

Review the technical document for requirements that impact epic and story creation:

**Look for:**

- **Starter Template**: Does it specify a starter/greenfield template? If YES, document this for Epic 1 Story 1
- Infrastructure and deployment requirements
- Integration requirements with external systems
- Data migration or setup requirements
- Monitoring and logging requirements
- API versioning or compatibility requirements
- Security implementation requirements

**IMPORTANT**: If a starter template is mentioned, note it prominently. This will impact Epic 1 Story 1.

**Format Technical Requirements as:**

```
- [Technical requirement that affects implementation]
- [Infrastructure setup requirement]
- [Integration requirement]
...
```

### 6. Extract UX Design Requirements (if a UX document exists)

**IMPORTANT**: The UX design document is a first-class input, not supplementary material. Requirements from it must be extracted with the same rigor as functional requirements.

Read the FULL UX document and extract ALL actionable work items:

**Look for:**

- **Design token work**: Color systems, spacing scales, typography tokens that need implementation or consolidation
- **Component proposals**: Reusable UI components identified in the design doc
- **Visual standardization**: Semantic CSS classes, consistent color palette usage, design pattern consolidation
- **Accessibility requirements**: Contrast audit fixes, ARIA patterns, keyboard navigation, screen reader support
- **Responsive design requirements**: Breakpoints, layout adaptations, mobile-specific interactions
- **Interaction patterns**: Animations, transitions, loading states, error handling UX
- **Browser/device compatibility**: Target platforms, progressive enhancement requirements

**Format UX Design Requirements as a SEPARATE section (not merged into Technical Requirements):**

```
UX-DR1: [Actionable UX design requirement with clear implementation scope]
UX-DR2: [Actionable UX design requirement with clear implementation scope]
...
```

**🚨 CRITICAL**: Do NOT reduce UX requirements to vague summaries. Each UX-DR must be specific enough to generate a story with testable acceptance criteria. If the UX spec identifies 6 reusable components, list all 6 — not "create reusable components."

### 7. Load and Initialize Template

Load `templates/epics-template.md` and initialize the output `epics.md`:

1. Copy the entire template to the output path
2. Replace {{project_name}} with the actual project name
3. Replace placeholder sections with extracted requirements:
   - {{fr_list}} → extracted FRs
   - {{nfr_list}} → extracted NFRs
   - {{additional_requirements}} → extracted technical requirements (if a technical document exists)
   - {{ux_design_requirements}} → extracted UX Design Requirements (if a UX document exists)
4. Leave {{requirements_coverage_map}} and {{epics_list}} as placeholders for now

### 8. Present Extracted Requirements

Display to user:

**Functional Requirements Extracted:**

- Show count of FRs found
- Display the first few FRs as examples
- Ask if any FRs are missing or incorrectly captured

**Non-Functional Requirements Extracted:**

- Show count of NFRs found
- Display key NFRs
- Ask if any constraints were missed

**Technical Requirements (if applicable):**

- Summarize technical requirements
- Verify completeness

**UX Design Requirements (if applicable):**

- Show count of UX-DRs found
- Display key UX Design requirements (design tokens, components, accessibility)
- Verify each UX-DR is specific enough for story creation

### 9. Get User Confirmation

Ask: "Do these extracted requirements accurately represent what needs to be built? Any additions or corrections?"

Update the requirements based on user feedback until confirmation is received.

## CONTENT TO SAVE TO DOCUMENT:

After extraction and confirmation, update `epics.md` with:

- Complete FR list in {{fr_list}} section
- Complete NFR list in {{nfr_list}} section
- All technical requirements in {{additional_requirements}} section (if extracted)
- UX Design requirements in {{ux_design_requirements}} section (if extracted)

### 10. Present MENU OPTIONS

Display: `**Confirm the Requirements are complete and correct to [C] continue:**`

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

#### Menu Handling Logic:

- IF C: Save all to `epics.md`, update frontmatter, then read fully and follow: `steps/step-02-design-epics.md`
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and all requirements are saved to document and frontmatter is updated, will you then read fully and follow: `steps/step-02-design-epics.md` to begin epic design step.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Requirements input found and validated with the user
- All FRs extracted and formatted correctly
- All NFRs extracted and formatted correctly
- Technical/UX requirements extracted where documents exist
- Template initialized with requirements
- User confirms requirements are complete and accurate

### ❌ SYSTEM FAILURE:

- No requirements input identified
- Incomplete requirements extraction
- Template not properly initialized
- Not saving requirements to output file

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
