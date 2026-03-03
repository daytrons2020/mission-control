# Slide Deck Templates

## Markdown to PowerPoint Workflow

This directory contains templates for creating educational slide decks using a markdown-based workflow that can be converted to PowerPoint.

## Recommended Tools

- **Marp** (Markdown Presentation Ecosystem): Convert markdown to PPTX/PDF
- **Pandoc**: Convert markdown to PowerPoint
- **Reveal.js**: Web-based presentations from markdown

## Template Structure

### 1. Basic Presentation Template

```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

<!-- _class: lead -->

# [Presentation Title]

## [Subtitle]

**Presenter:** [Name], [Credentials]
**Date:** [Date]
**Department:** Respiratory Care

---

# Learning Objectives

By the end of this session, participants will be able to:

1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

---

# Introduction

[Content section]

---

# Main Content

## Subsection

- Bullet point 1
- Bullet point 2
- Bullet point 3

---

# Case Study / Scenario

**Patient Profile:**
- Age: 
- Diagnosis:
- Current Status:

**Discussion Points:**
1. 
2. 
3. 

---

# Key Takeaways

1. [Key point 1]
2. [Key point 2]
3. [Key point 3]

---

# Questions & Discussion

## Thank You

**Contact:** [email]
**Resources:** [links]

---

# References

1. [Citation 1]
2. [Citation 2]
3. [Citation 3]
```

### 2. Clinical Skills Template

```markdown
---
marp: true
theme: default
class: clinical
---

# [Skill Name]

## Clinical Procedure Training

**Competency Level:** [Basic/Intermediate/Advanced]
**Estimated Time:** [X minutes]

---

# Indications

- [Indication 1]
- [Indication 2]
- [Indication 3]

---

# Contraindications

## Absolute
- [Contraindication 1]

## Relative
- [Contraindication 2]

---

# Equipment Needed

| Item | Specification | Quantity |
|------|--------------|----------|
| [Item 1] | [Spec] | [Qty] |
| [Item 2] | [Spec] | [Qty] |

---

# Procedure Steps

## Pre-Procedure
1. [Step 1]
2. [Step 2]

## During Procedure
1. [Step 3]
2. [Step 4]

## Post-Procedure
1. [Step 5]
2. [Step 6]

---

# Safety Considerations

⚠️ **Critical Safety Points:**

- [Safety point 1]
- [Safety point 2]
- [Safety point 3]

---

# Documentation Requirements

- [ ] [Documentation item 1]
- [ ] [Documentation item 2]
- [ ] [Documentation item 3]

---

# Competency Checklist

| Criteria | Demonstrated | Needs Practice |
|----------|-------------|----------------|
| [Criterion 1] | ☐ | ☐ |
| [Criterion 2] | ☐ | ☐ |
| [Criterion 3] | ☐ | ☐ |

---

# Practice Scenario

**Patient:** [Description]
**Scenario:** [Situation]

**Your Actions:**
1. 
2. 
3. 

---

# Resources & References

- AARC Clinical Practice Guideline: [Title]
- [Additional resources]
```

### 3. Case-Based Learning Template

```markdown
---
marp: true
theme: default
class: case-study
---

# Case Study: [Title]

## Interactive Learning Module

**Difficulty:** [Basic/Intermediate/Advanced]
**Format:** Small Group Discussion

---

# Patient Presentation

## Demographics
- **Age:** 
- **Gender:** 
- **Admission Date:** 

## Chief Complaint
[Description]

## History of Present Illness
[Description]

---

# Vital Signs

| Parameter | Value | Normal Range |
|-----------|-------|--------------|
| Heart Rate | | 60-100 bpm |
| Blood Pressure | | 90-140/60-90 |
| Respiratory Rate | | 12-20/min |
| SpO2 | | >94% |
| Temperature | | 36-38°C |

---

# Physical Assessment

## Inspection
- [Finding 1]
- [Finding 2]

## Auscultation
- [Finding 3]
- [Finding 4]

## Other
- [Finding 5]

---

# Diagnostic Results

## Laboratory
- [Lab result 1]
- [Lab result 2]

## Imaging
- [Imaging result]

## Other Studies
- [Other results]

---

# Discussion Questions

1. What is your initial assessment?
2. What are your priority interventions?
3. What potential complications should you monitor for?
4. How would you modify the care plan based on [specific change]?

---

# Expert Commentary

## Key Learning Points

1. [Point 1]
2. [Point 2]
3. [Point 3]

## Evidence-Based Practice
[Relevant guidelines/research]

---

# Reflection Questions

**For Individual Consideration:**
- How would you handle this differently?
- What knowledge gaps did this reveal?
- How will you apply this to future practice?
```

## Conversion Instructions

### Using Marp CLI

```bash
# Install Marp CLI
npm install -g @marp-team/marp-cli

# Convert to PowerPoint
marp presentation.md --pptx -o output.pptx

# Convert to PDF
marp presentation.md --pdf -o output.pdf

# Preview
marp presentation.md --preview
```

### Using Pandoc

```bash
# Install pandoc
# Convert markdown to PowerPoint
pandoc presentation.md -o output.pptx

# With reference doc for styling
pandoc presentation.md --reference-doc=template.pptx -o output.pptx
```

## Design Guidelines

### Color Scheme (Respiratory Care)
- Primary: #0066CC (Medical Blue)
- Secondary: #00A86B (Health Green)
- Accent: #FF6B35 (Alert Orange)
- Background: #FFFFFF
- Text: #333333

### Typography
- Headings: Arial Bold or Calibri Bold
- Body: Arial or Calibri
- Minimum size: 24pt for body text

### Slide Layout Best Practices
1. One main idea per slide
2. Maximum 6 bullet points per slide
3. Use visuals (images, diagrams) when possible
4. Include speaker notes for complex slides
5. Consistent header/footer with department branding

## Sample Presentations Included

1. `mechanical-ventilation-basics.md` - Introduction to ventilator management
2. `ards-management.md` - ARDS protocol and care
3. `airway-management.md` - Advanced airway techniques
4. `copd-exacerbation.md` - COPD exacerbation management

---

*Templates follow AARC educational standards and NBRC competency guidelines*
