import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  StickyNote,
  Tag,
  X,
  Check,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import { fetchNotes, createNote, updateNote, deleteNote } from "../features/notes/notesSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { Note } from "../types/note";
import { format } from "date-fns";
import { summarizeContent } from "../services/aiService";
import { Sparkles, RefreshCw } from "lucide-react";

const Notes = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { notes, loading } = useAppSelector((state) => state.notes);
  const user = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);

  useEffect(() => {
    if (user) dispatch(fetchNotes());
  }, [user, dispatch]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormTags([]);
    setTagInput("");
    setFormPinned(false);
    setIsCreating(false);
    setEditingNote(null);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormTags(note.tags || []);
    setFormPinned(note.isPinned);
    setIsCreating(true);
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !formTags.includes(t)) setFormTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleSave = async () => {
    if (!formContent.trim() && !formTitle.trim()) {
      toast.error("Please add some content or a title.");
      return;
    }
    const data = {
      title: formTitle.trim() || "Untitled",
      content: formContent.trim(),
      tags: formTags,
      isPinned: formPinned,
    };

    try {
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote.id, updates: data })).unwrap();
        toast.success("Note updated ✓");
      } else {
        await dispatch(createNote(data)).unwrap();
        toast.success("Note saved ✓");
      }
      resetForm();
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await dispatch(updateNote({ id: note.id, updates: { isPinned: !note.isPinned } })).unwrap();
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteNote(id)).unwrap();
      toast.success("Note deleted");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleAIByLine = async (noteId: string, content: string) => {
    setIsSummarizing(noteId);
    try {
      const summary = await summarizeContent(content);
      await dispatch(updateNote({ id: noteId, updates: { content: `${content}\n\nAI SUMMARY: ${summary}` } })).unwrap();
      toast.success("AI Summary added to note!");
    } catch {
      toast.error("Failed to summarize note");
    } finally {
      setIsSummarizing(null);
    }
  };

  const handleFormSummarize = async () => {
    if (!formContent.trim()) return;
    setIsSummarizing("form");
    try {
      const summary = await summarizeContent(formContent);
      setFormContent(prev => `${prev}\n\nAI SUMMARY: ${summary}`);
      toast.success("AI Summary generated!");
    } catch {
      toast.error("Failed to summarize content");
    } finally {
      setIsSummarizing(null);
    }
  };

  const NoteCard = ({ note }: { note: Note }) => (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-200 hover:shadow-md flex flex-col gap-3 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${
        note.isPinned ? "ring-1 ring-amber-400/40" : ""
      }`}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-3 right-3 p-1 bg-amber-100 dark:bg-amber-900/30 rounded-md">
          <Pin size={12} className="text-amber-600 dark:text-amber-400" />
        </div>
      )}

      {/* Title */}
      <h3 className={`font-bold text-sm pr-8 line-clamp-1 ${THEME_CLASSES.text.primary}`}>
        {note.title}
      </h3>

      {/* Content */}
      <p className={`text-xs leading-relaxed line-clamp-4 flex-1 ${THEME_CLASSES.text.secondary}`}>
        {note.content}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={`flex items-center justify-between pt-2 border-t ${THEME_CLASSES.border.base}`}>
        <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>
          {format(new Date(note.updatedAt), "MMM d, h:mm a")}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {deleteConfirmId === note.id ? (
            <>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={13} />
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Check size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTogglePin(note)}
                className={`p-1.5 rounded-lg transition-colors ${
                  note.isPinned
                    ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                }`}
                title={note.isPinned ? "Unpin" : "Pin to top"}
              >
                {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>
              <button
                onClick={() => openEdit(note)}
                className={`p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={() => handleAIByLine(note.id, note.content)}
                disabled={isSummarizing === note.id}
                className={`p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${isSummarizing === note.id ? "animate-pulse" : ""}`}
                title="AI Summarize"
              >
                {isSummarizing === note.id ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              </button>
              <button
                onClick={() => setDeleteConfirmId(note.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
              Quick Notes
            </h2>
            <p className={`text-sm ${THEME_CLASSES.text.secondary}`}>
              Capture ideas, reminders, and thoughts instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64 group">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${THEME_CLASSES.text.tertiary} group-focus-within:text-blue-500`}
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20 shrink-0"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-lg ${THEME_CLASSES.text.primary}`}>
                  {editingNote ? "Edit Note" : "New Note"}
                </h3>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${THEME_CLASSES.text.secondary}`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Note title (optional)..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
              />

              {/* Content */}
              <textarea
                placeholder="What's on your mind? ✍️"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                autoFocus
              />

              {/* Tags */}
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${THEME_CLASSES.text.tertiary}`}>
                  <Tag size={10} /> Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md"
                    >
                      #{tag}
                      <button
                        onClick={() => setFormTags((prev) => prev.filter((t) => t !== tag))}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs transition-all focus:ring-4 focus:ring-blue-500/10 ${THEME_CLASSES.input.base}`}
                  />
                  <button
                    onClick={handleAddTag}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Pin toggle */}
              <button
                type="button"
                onClick={() => setFormPinned((p) => !p)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  formPinned
                    ? "bg-amber-50 dark:bg-amber-900/10 border-amber-400 ring-1 ring-amber-400"
                    : `${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`
                }`}
              >
                <Pin size={16} className={formPinned ? "text-amber-500" : "text-gray-400"} />
                <div>
                  <p className={`text-sm font-bold ${formPinned ? "text-amber-700 dark:text-amber-300" : THEME_CLASSES.text.primary}`}>
                    Pin to top
                  </p>
                  <p className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>
                    Pinned notes always appear first
                  </p>
                </div>
              </button>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95"
                >
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>

              {/* AI Actions */}
              <button
                onClick={handleFormSummarize}
                disabled={isSummarizing === "form" || !formContent.trim()}
                className={`w-full py-2 flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all ${isSummarizing === "form" ? 'animate-pulse' : ''}`}
              >
                {isSummarizing === "form" ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate AI Summary
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 animate-pulse h-40 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-3xl p-16 text-center flex flex-col items-center gap-4 ${THEME_CLASSES.border.base} ${THEME_CLASSES.text.tertiary}`}
          >
            <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl flex items-center justify-center">
              <StickyNote size={32} className="text-yellow-400" />
            </div>
            <div>
              <p className={`font-bold text-base ${THEME_CLASSES.text.primary}`}>
                {searchQuery ? "No notes found" : "No notes yet"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term."
                  : "Click \"New Note\" to capture your first idea!"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${THEME_CLASSES.text.tertiary}`}>
                  <Pin size={10} /> Pinned ({pinnedNotes.length})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                    All Notes ({unpinnedNotes.length})
                  </h3>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Notes;
