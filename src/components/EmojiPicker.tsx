import { useState } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  category?: string;
}

// Emoji suggestions based on place category
const categoryEmojis: Record<string, string[]> = {
  Restaurant: ['🍽️', '🍕', '🍔', '🍜', '🍱', '🥘', '🍝', '🥗', '🌮', '🍣', '🥟', '🍛'],
  Museum: ['🏛️', '🎨', '🖼️', '🏺', '🗿', '📜', '🎭', '🏰'],
  Show: ['🎭', '🎪', '🎬', '🎤', '🎵', '🎸', '🎹', '🎺', '🎻'],
  Hotel: ['🏨', '🏩', '🛏️', '🏠', '🏡', '🏘️'],
  Activity: ['⚽', '🎯', '🎳', '🎮', '🎲', '🎰', '🏄', '🚴', '⛷️', '🏊', '🧗', '🎿'],
  Shopping: ['🛍️', '👗', '👠', '💄', '👜', '⌚', '💍', '🎁'],
  Nightlife: ['🍸', '🍹', '🍺', '🍻', '🥂', '🎉', '💃', '🕺', '🎶', '🌃'],
  Nature: ['🌲', '🌳', '🌴', '🏞️', '🏔️', '⛰️', '🗻', '🌄', '🏕️', '🌊', '🏖️'],
  Monument: ['🗽', '🗼', '🏛️', '⛪', '🕌', '🛕', '🏰', '🏯', '🗿'],
  Other: ['📍', '⭐', '💫', '✨', '🔥', '💎', '🎯', '🏁'],
};

const commonEmojis = ['📍', '⭐', '❤️', '🎯', '🔥', '✨', '💫', '🎨', '🎭', '🎪', '🎡', '🎢'];

export default function EmojiPicker({ value, onChange, category }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  // Get emojis for the current category, or use common emojis
  const suggestedEmojis = category ? (categoryEmojis[category] || commonEmojis) : commonEmojis;

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setShowPicker(false);
  };

  const handleCustomEmojiSubmit = () => {
    if (customEmoji.trim()) {
      onChange(customEmoji.trim());
      setCustomEmoji('');
      setShowPicker(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Pin Icon
      </label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-16 h-16 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition flex items-center justify-center text-3xl bg-white"
        >
          {value || <Smile className="w-6 h-6 text-gray-400" />}
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-500">
            {value ? 'Click to change pin icon' : 'Click to select a pin icon'}
          </p>
        </div>
      </div>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Emoji picker panel */}
          <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-72">
            {/* Custom emoji input */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Type or paste your emoji
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomEmojiSubmit()}
                  placeholder="Type emoji..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleCustomEmojiSubmit}
                  disabled={!customEmoji.trim()}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Use
                </button>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                {category ? `Suggested for ${category}` : 'Common Pins'}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {suggestedEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`w-10 h-10 text-2xl hover:bg-primary-100 rounded transition ${
                      value === emoji ? 'bg-primary-200 ring-2 ring-primary-500' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {category && category !== 'Other' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">All Pins</p>
                <div className="grid grid-cols-6 gap-2">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`w-10 h-10 text-2xl hover:bg-primary-100 rounded transition ${
                        value === emoji ? 'bg-primary-200 ring-2 ring-primary-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
