import { X, Minimize2, Maximize2, ExternalLink, Scaling } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeIFrame, toggleIFrameMinimize, toggleIFrameMaximize } from "../../features/ui/uiSlice";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { useState, useRef, useEffect } from "react";

const IFrameViewer = () => {
  const dispatch = useAppDispatch();
  const { isOpen, url, title, isMinimized, isMaximized } = useAppSelector(
    (state) => state.ui.iframe
  );

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 600, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  useEffect(() => {
    // Reset to sensible defaults when opening or if screen resizes drastically
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition({ x: 10, y: window.innerHeight - 500 - 10 });
        setSize({ width: window.innerWidth - 20, height: 500 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && !isMaximized && !isMinimized && position.y === 20 && position.x === 20) {
       // center or bottom right initialization
       setPosition({ x: Math.max(10, window.innerWidth - size.width - 20), y: Math.max(10, window.innerHeight - size.height - 20) });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return; // Don't drag if maximized
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    // Calculate new positions
    let newX = dragRef.current.initX + (e.clientX - dragRef.current.startX);
    let newY = dragRef.current.initY + (e.clientY - dragRef.current.startY);

    // Keep within bounds roughly
    newX = Math.max(0, Math.min(newX, window.innerWidth - 100));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 50));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const wrapperStyle: React.CSSProperties = isMaximized
    ? { top: "10px", left: "10px", width: "calc(100vw - 20px)", height: "calc(100vh - 20px)" }
    : isMinimized
        ? { bottom: "20px", right: "20px", width: "300px", height: "48px" }
        : { 
            top: `${position.y}px`, 
            left: `${position.x}px`, 
            width: `${size.width}px`, 
            height: `${size.height}px`,
            resize: "both"
        };

  return (
    <div
      style={wrapperStyle}
      className={`fixed z-50 shadow-2xl border flex flex-col ${THEME_CLASSES.surface.card} ${
        isMaximized ? "rounded-none sm:rounded-xl" : "rounded-xl"
      } ${
        (!isMinimized && !isMaximized) ? "overflow-hidden" : "overflow-hidden transition-all duration-300"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b select-none ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary} ${isMaximized || isMinimized ? "" : "cursor-move"}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => dispatch(toggleIFrameMaximize())}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
          <span
            className={`text-xs font-medium truncate ${THEME_CLASSES.text.primary}`}
          >
            {title || "Link Viewer"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleIFrameMinimize());
            }}
            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${THEME_CLASSES.text.secondary}`}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 size={12} />
          </button>
          <button
             onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleIFrameMaximize());
            }}
            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${THEME_CLASSES.text.secondary}`}
            title={isMaximized ? "Restore down" : "Maximize"}
          >
            {isMaximized ? <Scaling size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(closeIFrame());
            }}
            className={`p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors ${THEME_CLASSES.text.secondary}`}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className={`flex-1 bg-white relative w-full h-full`}>
          {isDragging && <div className="absolute inset-0 z-10 bg-transparent" /> /* Prevents iframe from swallowing mousemove events during drag */}
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default IFrameViewer;
