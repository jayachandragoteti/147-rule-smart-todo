import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Check,
  Search,
  StickyNote,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector, useToast } from "../app/hooks";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../features/notes/notesSlice";
import { THEME_CLASSES } from "../utils/themeUtils";
import type { Note } from "../types/note";
import { format } from "date-fns";

const Notes = () => {
  const dispatch = useAppDispatch();
  const toast    = useToast();
  const { notes, loading } = useAppSelector((s) => s.notes);
  const user = useAppSelector((s) => s.auth.user);

  const [searchQuery,    setSearchQuery]    = useState("");
  const [isCreating,     setIsCreating]     = useState(false);
  const [editingNote,    setEditingNote]    = useState<Note | null>(null);
  const [formTitle,      setFormTitle]      = useState("");
  const [formContent,    setFormContent]    = useState("");
  const [formTags,       setFormTags]       = useState<string[]>([]);
  const [tagInput,       setTagInput]       = useState("");
  const [formPinned,     setFormPinned]     = useState(false);
  const [deleteConfirmId,setDeleteConfirmId]= useState<string | null>(null);

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

  const pinnedNotes   = filteredNotes.filter((n) => n.isPinned);
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
      title:    formTitle.trim() || "Untitled",
      content:  formContent.trim(),
      tags:     formTags,
      isPinned: formPinned,
    };
    try {
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote.id, updates: data })).unwrap();
        toast.success("Note updated");
      } else {
        await dispatch(createNote(data)).unwrap();
        toast.success("Note saved");
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

  const NoteCard = ({ note }: { note: Note }) => (
    <div
      className={`group relative flex flex-col rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:border-[#4f8cff]/20 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${
        note.isPinned ? "ring-1 ring-[#f59e0b]/30" : ""
      }`}
    >
      {/* Pin badge */}
      {note.isPinned && (
        <div className="absolute top-3 right-3 p-1 bg-[#f59e0b]/10 rounded-md">
          <Pin size={11} className="text-[#f59e0b]" />
        </div>
      )}

      <h3 className={`font-semibold text-sm pr-7 line-clamp-1 mb-2 ${THEME_CLASSES.text.primary}`}>
        {note.title}
      </h3>

      <p className={`text-xs leading-relaxed line-clamp-4 flex-1 ${THEME_CLASSES.text.secondary}`}>
        {note.content}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#4f8cff]/10 text-[#4f8cff] rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={`flex items-center justify-between mt-3 pt-3 border-t ${THEME_CLASSES.border.base}`}>
        <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>
          {format(new Date(note.updatedAt), "MMM d, h:mm a")}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {deleteConfirmId === note.id ? (
            <>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`p-1 rounded ${THEME_CLASSES.text.tertiary}`}
              >
                <X size={12} />
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="p-1 rounded text-[#ef4444]"
              >
                <Check size={12} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTogglePin(note)}
                className={`p-1.5 rounded-lg transition-colors ${
                  note.isPinned
                    ? "text-[#f59e0b]"
                    : `${THEME_CLASSES.text.tertiary} hover:text-[#f59e0b]`
                }`}
                title={note.isPinned ? "Unpin" : "Pin"}
              >
                {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>
              <button
                onClick={() => openEdit(note)}
                className={`p-1.5 rounded-lg transition-colors ${THEME_CLASSES.text.tertiary} hover:text-[#4f8cff]`}
                title="Edit"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(note.id)}
                className={`p-1.5 rounded-lg transition-colors ${THEME_CLASSES.text.tertiary} hover:text-[#ef4444]`}
                title="Delete"
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
      <div className="space-y-5 pb-12 animate-fade-in">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[#f59e0b]/10">
                <StickyNote size={15} className="text-[#f59e0b]" />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>
                Quick Notes
              </h1>
            </div>
            <p className={`text-sm ${THEME_CLASSES.text.tertiary}`}>
              Capture ideas instantly. {notes.length > 0 && `${notes.length} note${notes.length !== 1 ? "s" : ""} saved.`}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
          >
            <Plus size={16} /> New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${THEME_CLASSES.text.tertiary}`} />
          <input
            type="text"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${THEME_CLASSES.input.base}`}
          />
        </div>

        {/* Create / Edit modal */}
        {isCreating && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${THEME_CLASSES.text.primary}`}>
                  {editingNote ? "Edit Note" : "New Note"}
                </h3>
                <button
                  onClick={resetForm}
                  className={`p-1.5 rounded-lg ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.tertiary}`}
                >
                  <X size={16} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Title…"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm ${THEME_CLASSES.input.base}`}
              />
              <textarea
                placeholder="Content…"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${THEME_CLASSES.input.base}`}
              />

              {/* Tags */}
              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#4f8cff]/10 text-[#4f8cff] rounded-md">
                      #{tag}
                      <button onClick={() => setFormTags((p) => p.filter((t) => t !== tag))}>
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs ${THEME_CLASSES.input.base}`}
                />
                <button
                  onClick={handleAddTag}
                  className={`px-3 py-2 border rounded-xl text-xs font-semibold ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover} ${THEME_CLASSES.text.secondary}`}
                >
                  Add
                </button>
              </div>

              {/* Pin toggle */}
              <button
                type="button"
                onClick={() => setFormPinned(!formPinned)}
                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                  formPinned ? "text-[#f59e0b]" : THEME_CLASSES.text.tertiary
                }`}
              >
                <Pin size={13} />
                {formPinned ? "Pinned" : "Pin this note"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className={`flex-1 py-2.5 border rounded-xl text-sm font-semibold ${THEME_CLASSES.border.base} ${THEME_CLASSES.button.hover}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
                >
                  {editingNote ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={`text-center py-20 border-2 border-dashed rounded-2xl ${THEME_CLASSES.border.base}`}>
            <StickyNote size={36} className="mx-auto mb-3 text-[#f59e0b] opacity-40" />
            <p className={`text-sm font-medium ${THEME_CLASSES.text.tertiary}`}>
              {searchQuery ? "No notes match your search" : "No notes yet. Capture your first idea!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreating(true)}
                className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${THEME_CLASSES.button.primary}`}
              >
                <Plus size={14} /> New Note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${THEME_CLASSES.text.tertiary}`}>
                  📌 Pinned
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedNotes.map((n) => <NoteCard key={n.id} note={n} />)}
                </div>
              </div>
            )}
            {/* Other notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 mt-4 ${THEME_CLASSES.text.tertiary}`}>
                    Notes
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {unpinnedNotes.map((n) => <NoteCard key={n.id} note={n} />)}
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
