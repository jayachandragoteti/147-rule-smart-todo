import { X, Minimize2, Maximize2, ExternalLink, Scaling, Sparkles, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeIFrame, toggleIFrameMinimize, toggleIFrameMaximize } from "../../features/ui/uiSlice";
import { THEME_CLASSES } from "../../utils/themeUtils";
import { useState, useRef, useEffect, useCallback } from "react";
import { summarizeLink } from "../../services/aiService";

const IFrameViewer = () => {
  const dispatch = useAppDispatch();
  const { isOpen, url, title, isMinimized, isMaximized } = useAppSelector(
    (state) => state.ui.iframe
  );

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size] = useState({ width: 600, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const positionRef = useRef(position);

  // Keep positionRef in sync with state
  positionRef.current = position;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition({ x: 10, y: window.innerHeight - 500 - 10 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!isMaximized && !isMinimized) {
        setPosition({
          x: Math.max(10, window.innerWidth - size.width - 20),
          y: Math.max(10, window.innerHeight - size.height - 20),
        });
      }
      
      // AI Link Summarization
      const fetchSummary = async () => {
        setIsSummarizing(true);
        setAiSummary(null);
        try {
          const summary = await summarizeLink(url, title);
          setAiSummary(summary);
        } catch (err) {
          console.error("AI Summarizer failed:", err);
        } finally {
          setIsSummarizing(false);
        }
      };
      fetchSummary();
    }
  }, [isOpen, url, title]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Drag handlers using refs (avoids stale closure) ───────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    let newX = dragStartRef.current.initX + (e.clientX - dragStartRef.current.startX);
    let newY = dragStartRef.current.initY + (e.clientY - dragStartRef.current.startY);
    newX = Math.max(0, Math.min(newX, window.innerWidth - 100));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 50));
    setPosition({ x: newX, y: newY });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: positionRef.current.x,
      initY: positionRef.current.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  const wrapperStyle: React.CSSProperties = isMaximized
    ? { top: "10px", left: "10px", width: "calc(100vw - 20px)", height: "calc(100vh - 20px)" }
    : isMinimized
        ? { bottom: "20px", right: "20px", width: "300px", height: "48px" }
        : {
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            resize: "both",
          };

  return (
    <div
      style={wrapperStyle}
      className={`fixed z-50 shadow-2xl border flex flex-col ${THEME_CLASSES.surface.card} ${
        isMaximized ? "rounded-none sm:rounded-xl" : "rounded-xl"
      } overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b select-none ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary} ${isMaximized || isMinimized ? "" : "cursor-move"}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => dispatch(toggleIFrameMaximize())}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
          <span className={`text-xs font-medium truncate ${THEME_CLASSES.text.primary}`}>
            {title || "Link Viewer"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(toggleIFrameMinimize()); }}
            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${THEME_CLASSES.text.secondary}`}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(toggleIFrameMaximize()); }}
            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${THEME_CLASSES.text.secondary}`}
            title={isMaximized ? "Restore down" : "Maximize"}
          >
            {isMaximized ? <Scaling size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(closeIFrame()); }}
            className={`p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors ${THEME_CLASSES.text.secondary}`}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="flex-1 bg-white relative w-full h-full">
          {/* Transparent overlay prevents iframe from swallowing drag events */}
          <div
            className="absolute inset-0 z-10 bg-transparent"
            onMouseDown={handleMouseDown}
            style={{ pointerEvents: isDragging ? "auto" : "none" }}
          />

          {/* AI Summary Sidebar/Header overlay */}
          {(isSummarizing || aiSummary) && (
            <div className={`absolute bottom-4 left-4 right-4 z-20 p-3 rounded-xl border border-blue-500/20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl transition-all duration-300 ${isMinimized ? "hidden" : "block"}`}>
               <div className="flex items-start gap-2">
                 <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    {isSummarizing ? <RefreshCw size={12} className="text-blue-500 animate-spin" /> : <Sparkles size={12} className="text-blue-500" />}
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-0.5">AI Link Insights</p>
                    <p className={`text-[10px] leading-relaxed font-medium ${THEME_CLASSES.text.primary}`}>
                      {isSummarizing ? "Synthesizing content overview..." : aiSummary}
                    </p>
                 </div>
                 {!isSummarizing && (
                   <button onClick={() => setAiSummary(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                      <X size={10} />
                   </button>
                 )}
               </div>
            </div>
          )}

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
