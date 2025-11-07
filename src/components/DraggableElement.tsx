import { useRef, useState, useEffect } from 'react';
import { Trash2, RotateCw } from 'lucide-react';

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

interface DraggableElementProps {
  element: PageElement;
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
  onDelete: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export function DraggableElement({ element, onUpdate, onDelete, canvasWidth, canvasHeight }: DraggableElementProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isEditing) return;

    e.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = Number(element.position_x);
    const startPosY = Number(element.position_y);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = ((e.clientX - startX) / canvasWidth) * 100;
      const deltaY = ((e.clientY - startY) / canvasHeight) * 100;

      onUpdate(element.id, {
        position_x: Math.max(0, Math.min(100, startPosX + deltaX)),
        position_y: Math.max(0, Math.min(100, startPosY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = Number(element.width);
    const startHeight = Number(element.height);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      onUpdate(element.id, {
        width: Math.max(20, startWidth + deltaX),
        height: Math.max(20, startHeight + deltaY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRotation = (Number(element.rotation) + 15) % 360;
    onUpdate(element.id, { rotation: newRotation });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (element.element_type === 'text') {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleSaveText = () => {
    onUpdate(element.id, { content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(element.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const styleData = element.style_data as any || {};

  const renderContent = () => {
    switch (element.element_type) {
      case 'image':
        return (
          <img
            src={element.content}
            alt="Scrapbook element"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        );
      case 'text':
        if (isEditing) {
          return (
            <div className="w-full h-full flex flex-col p-2">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full resize-none border-none outline-none bg-transparent text-center"
                style={{
                  color: styleData.color || '#000000',
                  fontSize: `${styleData.fontSize || 16}px`,
                  fontWeight: styleData.fontWeight || 400,
                }}
              />
              <div className="flex gap-1 justify-center mt-1">
                <button
                  onClick={handleSaveText}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center text-center p-2 break-words overflow-hidden select-none cursor-text"
            style={{
              color: styleData.color || '#000000',
              fontSize: `${styleData.fontSize || 16}px`,
              fontWeight: styleData.fontWeight || 400,
            }}
            onDoubleClick={handleDoubleClick}
          >
            {element.content}
          </div>
        );
      case 'sticker':
        return (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              fontSize: `${Number(element.width) * 0.6}px`,
            }}
          >
            {element.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(true);
      }}
      className={`absolute rounded transition-all ${
        isSelected ? 'border-2 border-primary-600 shadow-lg shadow-primary-100' : 'border-2 border-transparent'
      }`}
      style={{
        left: `${element.position_x}%`,
        top: `${element.position_y}%`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: element.z_index,
      }}
    >
      {renderContent()}

      {isSelected && (
        <>
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-primary-600 rounded-full cursor-nwse-resize z-10"
          />

          <div className="absolute -top-9 right-0 flex gap-1 bg-white px-1 py-1 rounded-md shadow-md border border-gray-200">
            <button
              onClick={handleRotate}
              className="p-1 bg-transparent border-none cursor-pointer flex items-center text-gray-600 hover:text-primary-600 transition"
              title="Rotate"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 bg-transparent border-none cursor-pointer flex items-center text-gray-600 hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
