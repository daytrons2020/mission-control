# Summarize v1 - Installed

## Location
`/Users/daytrons/.openclaw/workspace/skills/summarize-1/`

## Status: ✅ Installed & Active

## What This Skill Does

The **Summarize** skill condenses long text into concise, readable summaries:

1. **Text summarization** - Reduces length while preserving meaning
2. **Key point extraction** - Identifies important information
3. **Multi-format support** - Works with articles, transcripts, documents
4. **Adjustable length** - Short, medium, or detailed summaries

## Key Features

- **URL Support** - Summarize web pages directly
- **File Support** - Process local documents
- **Podcast/Video** - Summarize transcripts
- **Bullet Points** - Key takeaways format
- **Custom Length** - Control summary detail level

## Usage

### Summarize URL
```javascript
summarize({
  url: 'https://example.com/article',
  length: 'medium'
})
```

### Summarize Text
```javascript
summarize({
  text: longText,
  format: 'bullets'
})
```

### Summarize File
```javascript
summarize({
  file: '/path/to/document.pdf',
  maxChars: 1000
})
```

## Integration

This skill is now active. I can:
- Summarize web articles on request
- Condense long documents
- Extract key points from transcripts
- Provide bullet-point summaries

## Examples

**Input:** 5000-word article
**Output:** 200-word summary with key points

**Input:** 2-hour podcast transcript  
**Output:** 10 bullet-point takeaways

---
**Installed:** 2026-03-06
**Version:** 1.0
**Status:** Active