---
name: skill-template
description: Template for creating new OpenClaw skills. Use as a starting point for skill development - copy this folder, rename, and customize.
---

# Skill Template

Use this template as a starting point for new skills.

## Quick Start

1. **Copy this folder:**
   ```bash
   cp -r skills/skill-template skills/your-skill-name
   ```

2. **Update SKILL.md:**
   - Change `name:` to your skill name
   - Change `description:` to describe what it does
   - Update this documentation

3. **Create your scripts:**
   - Add Python/bash scripts to `scripts/`
   - Make them executable: `chmod +x scripts/*.py`

4. **Test your skill:**
   ```bash
   python3 skills/your-skill-name/scripts/your-script.py
   ```

## Skill Structure

```
skills/your-skill-name/
├── SKILL.md              # This file - skill documentation
├── README.md             # Optional: detailed documentation
├── scripts/              # Executable scripts
│   └── your-script.py
├── assets/               # Static assets (HTML, images, etc.)
│   └── dashboard.html
└── tests/                # Optional: test files
    └── test_script.py
```

## Best Practices

### SKILL.md Header

```yaml
---
name: skill-name
description: Clear, concise description of what this skill does and when to use it.
---
```

### Scripts

- Use Python 3 for cross-platform compatibility
- Add shebang: `#!/usr/bin/env python3`
- Make executable: `chmod +x script.py`
- Use argparse for CLI interfaces
- Store data in `~/.openclaw/skill-name/`

### Error Handling

- Return meaningful exit codes (0 = success, 1+ = error)
- Print helpful error messages
- Suggest fixes when possible

### Documentation

- Include quick start examples
- Document all commands
- List dependencies
- Provide troubleshooting tips

## Example Script Template

```python
#!/usr/bin/env python3
"""
Skill Name - Brief description
"""

import argparse
import sys
from pathlib import Path

DATA_DIR = Path.home() / ".openclaw" / "skill-name"

def main():
    parser = argparse.ArgumentParser(description="Skill description")
    subparsers = parser.add_subparsers(dest="command")
    
    # Add subcommands here
    subparsers.add_parser("status", help="Show status")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Handle commands
    if args.command == "status":
        print("Status: OK")
        return 0
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

## Checklist

Before publishing a skill:

- [ ] SKILL.md has correct name and description
- [ ] Scripts are executable
- [ ] Scripts have proper shebang
- [ ] Dependencies are documented
- [ ] Quick start examples work
- [ ] Error handling is robust
- [ ] Data directory uses `~/.openclaw/` prefix
