import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Tag } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  date: string;
  preview: string;
  tags: string[];
}

export default function MemoryBrowser() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    // Load from workspace/memory/
    const mockMemories: Memory[] = [
      {
        id: '1',
        title: 'Daily Notes - March 9, 2026',
        date: '2026-03-09',
        preview: 'Built 2nd Brain system, created autonomous work schedule...',
        tags: ['daily', 'mission-control']
      },
      {
        id: '2',
        title: 'Daily Notes - March 8, 2026',
        date: '2026-03-08',
        preview: 'Fixed Discord channel issues, configured 9 agents...',
        tags: ['daily', 'agents']
      },
      {
        id: '3',
        title: 'Project: Mission Control Setup',
        date: '2026-03-08',
        preview: 'Initial setup of Mission Control with 5 specialist agents...',
        tags: ['project', 'mission-control']
      }
    ];
    setMemories(mockMemories);
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? memory.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Memory Browser
        </h1>
        <input
          type="text"
          placeholder="Search memories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-64"
        />
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 rounded-full text-sm ${selectedTag === null ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Tag className="w-3 h-3" />
            {tag}
          </button>
        ))}
      </div>

      {/* Memories List */}
      <div className="space-y-4">
        {filteredMemories.map(memory => (
          <div key={memory.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{memory.title}</h3>
                <p className="text-gray-600 mb-3">{memory.preview}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {memory.date}
                  </span>
                  <div className="flex gap-2">
                    {memory.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
