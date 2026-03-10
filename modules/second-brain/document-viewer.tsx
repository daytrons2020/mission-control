import React, { useState, useEffect } from 'react';
import { FileText, Folder, ChevronRight } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  path: string;
  type: 'context' | 'skill' | 'agent';
  lastModified: string;
}

export default function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const mockDocs: Document[] = [
      { id: '1', name: 'AGENTS.md', path: 'workspace/AGENTS.md', type: 'context', lastModified: '2026-03-09' },
      { id: '2', name: 'TOOLS.md', path: 'workspace/TOOLS.md', type: 'context', lastModified: '2026-03-09' },
      { id: '3', name: 'USER.md', path: 'workspace/USER.md', type: 'context', lastModified: '2026-03-09' },
      { id: '4', name: 'MEMORY.md', path: 'workspace/MEMORY.md', type: 'context', lastModified: '2026-03-09' },
      { id: '5', name: 'HEARTBEAT.md', path: 'workspace/HEARTBEAT.md', type: 'context', lastModified: '2026-03-09' },
      { id: '6', name: 'SOUL.md', path: 'workspace/SOUL.md', type: 'context', lastModified: '2026-03-09' },
      { id: '7', name: 'MISSION_CONTROL.md', path: 'workspace/MISSION_CONTROL.md', type: 'context', lastModified: '2026-03-09' },
    ];
    setDocuments(mockDocs);
  };

  const loadContent = async (doc: Document) => {
    setSelectedDoc(doc);
    // In real implementation, read file content
    setContent(`# ${doc.name}\n\nContent would be loaded from ${doc.path}`);
  };

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Documents
        </h2>
        
        {Object.entries(groupedDocs).map(([type, docs]) => (
          <div key={type} className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{type}</h3>
            {docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => loadContent(doc)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedDoc?.id === doc.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <FileText className="w-4 h-4" />
                {doc.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedDoc ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{selectedDoc.name}</h1>
              <span className="text-sm text-gray-500">Last modified: {selectedDoc.lastModified}</span>
            </div>
            <div className="prose max-w-none">
              <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{content}</pre>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a document to view
          </div>
        )}
      </div>
    </div>
  );
}
