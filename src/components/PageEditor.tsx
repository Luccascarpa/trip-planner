import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Type, Sticker, Palette, Maximize2, Minimize2 } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '../lib/supabase';
import { DraggableElement } from './DraggableElement';

type PageElement = {
  id: string;
  page_id: string;
  element_type: 'image' | 'text' | 'sticker';
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  style_data: any;
  created_at: string;
};

type Page = {
  id: string;
  section_id: string;
  order_index: number;
  background_color: string;
  created_at: string;
};

interface PageEditorProps {
  pageId: string;
  onBack: () => void;
}

const STICKERS = [
  '✈️', '🗺️', '📸', '🎒', '🏖️', '⛰️', '🏝️', '🗼', '🏰', '🎭',
  '🎨', '🍱', '🍕', '☕', '🌅', '🌄', '🌊', '🌸', '🌺', '⭐',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🤍', '🖤', '💕', '✨'
];

export function PageEditor({ pageId, onBack }: PageEditorProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [elements, setElements] = useState<PageElement[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    loadPage();
    loadElements();
  }, [pageId]);

  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (canvasRef.current) {
        setCanvasDimensions({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });
      }
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);

    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [isFullscreen]);

  const loadPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      setPage(data);
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const loadElements = async () => {
    try {
      const { data, error } = await supabase
        .from('page_elements')
        .select('*')
        .eq('page_id', pageId)
        .order('z_index', { ascending: true });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error('Error loading elements:', error);
    }
  };

  const updatePageColor = async (color: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ background_color: color })
        .eq('id', pageId);

      if (error) throw error;
      setPage(prev => prev ? { ...prev, background_color: color } : null);
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error updating page color:', error);
    }
  };

  const addElement = async (type: 'image' | 'text' | 'sticker', content: string, styleData: any = {}) => {
    try {
      const maxZ = elements.length > 0
        ? Math.max(...elements.map(e => e.z_index))
        : 0;

      const { error } = await supabase
        .from('page_elements')
        .insert({
          page_id: pageId,
          element_type: type,
          content,
          position_x: 50,
          position_y: 50,
          width: type === 'text' ? 200 : 150,
          height: type === 'text' ? 50 : 150,
          z_index: maxZ + 1,
          style_data: styleData,
        });

      if (error) throw error;
      loadElements();
    } catch (error) {
      console.error('Error adding element:', error);
    }
  };

  const updateElement = async (elementId: string, updates: Partial<PageElement>) => {
    try {
      const { error } = await supabase
        .from('page_elements')
        .update(updates)
        .eq('id', elementId);

      if (error) throw error;
      loadElements();
    } catch (error) {
      console.error('Error updating element:', error);
    }
  };

  const deleteElement = async (elementId: string) => {
    try {
      const { error } = await supabase
        .from('page_elements')
        .delete()
        .eq('id', elementId);

      if (error) throw error;
      loadElements();
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      addElement('image', imageUrl);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textContent) {
      addElement('text', textContent, { color: textColor, fontSize });
      setTextContent('');
      setShowTextModal(false);
    }
  };

  const handleAddSticker = (sticker: string) => {
    addElement('sticker', sticker);
    setShowStickerModal(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100' : 'h-full'}`}>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex gap-3 items-center flex-wrap">
          {!isFullscreen && (
            <button onClick={onBack} className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition">
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <button
            onClick={() => setShowImageModal(true)}
            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <ImageIcon size={18} />
            <span>Add Image</span>
          </button>
          <button
            onClick={() => setShowTextModal(true)}
            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <Type size={18} />
            <span>Add Text</span>
          </button>
          <button
            onClick={() => setShowStickerModal(true)}
            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <Sticker size={18} />
            <span>Add Sticker</span>
          </button>
          <button
            onClick={() => setShowColorPicker(true)}
            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <Palette size={18} />
            <span>Background</span>
          </button>
          <div className="ml-auto">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-gray-100">
          <div
            ref={canvasRef}
            className="relative shadow-2xl rounded-lg"
            style={{
              width: isFullscreen ? '95vw' : 'min(90vw, 1200px)',
              height: isFullscreen ? '85vh' : 'min(70vh, 800px)',
              maxWidth: '100%',
              backgroundColor: page?.background_color || '#ffffff',
            }}
          >
            {elements.map((element) => (
              <DraggableElement
                key={element.id}
                element={element}
                onUpdate={updateElement}
                onDelete={deleteElement}
                canvasWidth={canvasDimensions.width}
                canvasHeight={canvasDimensions.height}
              />
            ))}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Image</h2>
              <form onSubmit={handleAddImage}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use image URLs from Pexels, Unsplash, or your own hosted images
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Text Modal */}
        {showTextModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTextModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Text</h2>
              <form onSubmit={handleAddText}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    required
                    rows={3}
                    placeholder="Enter your text..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min={8}
                      max={72}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTextModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sticker Modal */}
        {showStickerModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowStickerModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Sticker</h2>
              <div className="grid grid-cols-6 gap-3 mb-4">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => handleAddSticker(sticker)}
                    className="text-3xl p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 hover:scale-110 transition"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowStickerModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowColorPicker(false)}
          >
            <div
              className="bg-white rounded-lg max-w-sm w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Page Background</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Color
                </label>
                <input
                  type="color"
                  value={page?.background_color || '#ffffff'}
                  onChange={(e) => updatePageColor(e.target.value)}
                  className="w-full h-16 rounded cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['#ffffff', '#f3f4f6', '#fef3c7', '#fecaca', '#ddd6fe', '#bfdbfe', '#d1fae5'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updatePageColor(color)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
