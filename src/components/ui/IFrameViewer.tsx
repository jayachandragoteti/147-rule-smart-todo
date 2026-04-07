import React from "react";
import { X, Minimize2, Maximize2, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeIFrame, toggleIFrameMinimize } from "../../features/ui/uiSlice";
import { THEME_CLASSES } from "../../utils/themeUtils";

const IFrameViewer = () => {
  const dispatch = useAppDispatch();
  const { isOpen, url, title, isMinimized } = useAppSelector(
    (state) => state.ui.iframe
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl border ${
        isMinimized
          ? "bottom-4 right-4 w-64 h-12"
          : "bottom-4 right-4 w-[90%] md:w-[600px] h-[500px]"
      } ${THEME_CLASSES.surface.card} rounded-xl overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${THEME_CLASSES.border.base} ${THEME_CLASSES.surface.secondary} cursor-pointer`}
        onClick={() => isMinimized && dispatch(toggleIFrameMinimize())}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
          <span
            className={`text-xs font-medium truncate ${THEME_CLASSES.text.primary}`}
          >
            {title || "Link Viewer"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleIFrameMinimize());
            }}
            className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${THEME_CLASSES.text.secondary}`}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(closeIFrame());
            }}
            className={`p-1 rounded-md hover:bg-red-500 hover:text-white transition-colors ${THEME_CLASSES.text.secondary}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="w-full h-[calc(100%-41px)] bg-white">
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
