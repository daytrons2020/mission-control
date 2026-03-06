#!/usr/bin/env python3
"""
Document Indexer for Mission Control
Scans workspace and catalogs all agent-created documents
"""

import json
import os
from datetime import datetime
from pathlib import Path

WORKSPACE_DIR = os.path.expanduser("~/.openclaw/workspace")
OUTPUT_FILE = f"{WORKSPACE_DIR}/mission_control/documents_index.json"

def scan_documents():
    """Scan workspace for agent-created documents."""
    documents = []
    
    # File patterns to track
    patterns = [
        "**/*.md",
        "**/*.html", 
        "**/*.py",
        "**/*.sh",
        "**/*.json",
        "**/*.css",
        "**/*.js"
    ]
    
    # Directories to exclude
    exclude_dirs = {'.git', 'node_modules', '__pycache__', '.openclaw', 'logs'}
    
    for pattern in patterns:
        for file_path in Path(WORKSPACE_DIR).glob(pattern):
            # Skip excluded directories (but not the workspace root which contains .openclaw)
            rel_parts = str(file_path.relative_to(WORKSPACE_DIR)).split(os.sep)
            if any(excluded in rel_parts for excluded in exclude_dirs):
                continue
            
            try:
                stat = file_path.stat()
                rel_path = str(file_path.relative_to(WORKSPACE_DIR))
                
                # Determine category
                category = categorize_file(rel_path)
                
                doc = {
                    "id": f"doc_{len(documents)+1:04d}",
                    "name": file_path.name,
                    "path": rel_path,
                    "category": category,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "extension": file_path.suffix
                }
                documents.append(doc)
            except Exception as e:
                print(f"Error scanning {file_path}: {e}")
    
    # Sort by modified date (newest first)
    documents.sort(key=lambda x: x['modified'], reverse=True)
    
    return {
        "generated_at": datetime.now().isoformat(),
        "total_count": len(documents),
        "documents": documents
    }

def categorize_file(path):
    """Categorize file by type/purpose."""
    path_lower = path.lower()
    
    if 'mission_control' in path_lower:
        return "Mission Control"
    elif 'scripts' in path_lower:
        return "Scripts"
    elif 'styles' in path_lower:
        return "Styles"
    elif 'api' in path_lower:
        return "API"
    elif 'config' in path_lower:
        return "Configuration"
    elif 'memory' in path_lower:
        return "Memory"
    elif path_lower.endswith('.md'):
        return "Documentation"
    elif path_lower.endswith('.html'):
        return "Dashboard"
    elif path_lower.endswith('.py'):
        return "Python"
    elif path_lower.endswith('.sh'):
        return "Shell"
    else:
        return "Other"

def generate_html_widget():
    """Generate HTML widget for dashboard."""
    data = scan_documents()
    
    # Group by category
    by_category = {}
    for doc in data['documents'][:50]:  # Top 50 recent
        cat = doc['category']
        by_category.setdefault(cat, []).append(doc)
    
    html = f"""<!-- Documents Widget -->
<div class="documents-widget">
    <div class="widget-header">
        <h3>📁 Agent Documents</h3>
        <span class="doc-count">{data['total_count']} files</span>
    </div>
    <div class="documents-list">
"""
    
    for category, docs in sorted(by_category.items()):
        html += f"""
        <div class="doc-category">
            <div class="category-header">{category} ({len(docs)})</div>
"""
        for doc in docs[:5]:  # Top 5 per category
            size_kb = doc['size'] / 1024
            size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.1f} MB"
            html += f"""
            <div class="doc-item" onclick="openDoc('{doc['path']}')">
                <span class="doc-icon">{get_icon(doc['extension'])}</span>
                <span class="doc-name">{doc['name']}</span>
                <span class="doc-meta">{size_str}</span>
            </div>
"""
        html += "        </div>\n"
    
    html += """    </div>
</div>
"""
    
    return html

def get_icon(extension):
    """Get icon for file type."""
    icons = {
        '.md': '📝',
        '.html': '🌐',
        '.py': '🐍',
        '.sh': '⚡',
        '.json': '📊',
        '.css': '🎨',
        '.js': '⚙️'
    }
    return icons.get(extension, '📄')

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "html":
        print(generate_html_widget())
    else:
        data = scan_documents()
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Indexed {data['total_count']} documents")
        print(f"Saved to: {OUTPUT_FILE}")
