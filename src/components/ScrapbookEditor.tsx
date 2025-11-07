import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PageEditor } from './PageEditor';

type Section = {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  created_at: string;
};

type Page = {
  id: string;
  section_id: string;
  order_index: number;
  background_color: string;
  created_at: string;
};

interface ScrapbookEditorProps {
  bookId: string;
}

export function ScrapbookEditor({ bookId }: ScrapbookEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadSections();
  }, [bookId]);

  useEffect(() => {
    if (selectedSection) {
      loadPages(selectedSection);
      setExpandedSections(prev => new Set([...prev, selectedSection]));
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSections(data || []);

      if (data && data.length > 0 && !selectedSection) {
        setSelectedSection(data[0].id);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadPages = async (sectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const createSection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const maxOrder = sections.length > 0
        ? Math.max(...sections.map(s => s.order_index))
        : -1;

      const { error } = await supabase
        .from('sections')
        .insert({
          book_id: bookId,
          title: sectionTitle,
          order_index: maxOrder + 1,
        });

      if (error) throw error;

      setSectionTitle('');
      setShowSectionModal(false);
      loadSections();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its pages?')) return;

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      if (selectedSection === sectionId) {
        setSelectedSection(null);
        setSelectedPage(null);
      }
      loadSections();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const createPage = async () => {
    if (!selectedSection) return;

    try {
      const maxOrder = pages.length > 0
        ? Math.max(...pages.map(p => p.order_index))
        : -1;

      const { data, error } = await supabase
        .from('pages')
        .insert({
          section_id: selectedSection,
          order_index: maxOrder + 1,
          background_color: '#ffffff',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) {
        loadPages(selectedSection);
        setSelectedPage(data.id);
      }
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Delete this page and all its elements?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      if (selectedPage === pageId) {
        setSelectedPage(null);
      }
      if (selectedSection) {
        loadPages(selectedSection);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (selectedPage) {
    return (
      <PageEditor
        pageId={selectedPage}
        onBack={() => setSelectedPage(null)}
      />
    );
  }

  return (
    <div className={`flex ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
      {/* Sidebar */}
      {!isFullscreen && (
        <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowSectionModal(true)}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} />
              <span>New Section</span>
            </button>
          </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sections.map((section) => (
            <div key={section.id} className="mb-2">
              <div className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer ${
                selectedSection === section.id ? 'bg-primary-100' : 'hover:bg-gray-100'
              }`}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                >
                  {expandedSections.has(section.id)
                    ? <ChevronDown size={16} />
                    : <ChevronUp size={16} />
                  }
                </button>
                <div
                  onClick={() => setSelectedSection(section.id)}
                  className="flex-1 text-sm font-medium text-gray-900"
                >
                  {section.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(section.id);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {expandedSections.has(section.id) && selectedSection === section.id && (
                <div className="ml-6 mt-2">
                  {pages.map((page, idx) => (
                    <div
                      key={page.id}
                      className="p-2 mb-1 bg-white border border-gray-200 rounded-lg text-sm flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    >
                      <div onClick={() => setSelectedPage(page.id)}>
                        Page {idx + 1}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={createPage}
                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm transition"
                  >
                    <Plus size={14} />
                    <span>Add Page</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selectedPage && (
          <div className="p-4 border-b border-gray-200 bg-white flex justify-end">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-8">
          {sections.length === 0 ? (
            <div className="text-center text-gray-600">
              <p className="mb-4">No sections yet</p>
              <button
                onClick={() => setShowSectionModal(true)}
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Plus size={18} />
                <span>Create First Section</span>
              </button>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center text-gray-600">
              <p className="mb-4">No pages in this section</p>
              <button
                onClick={createPage}
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Plus size={18} />
                <span>Create First Page</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p className="mb-4">Select a page to edit</p>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  <Minimize2 size={18} />
                  <span>Exit Fullscreen</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSectionModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create New Section
            </h2>
            <form onSubmit={createSection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  required
                  placeholder="e.g., Day 1, Tokyo"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
