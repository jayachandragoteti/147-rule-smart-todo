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
      className={`group relative rounded-2xl border p-4 transition-all duration-200 hover:shadow-md flex flex-col gap-3 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base} ${
        note.isPinned ? "ring-1 ring-amber-400/40" : ""
      }`}
    >
      {note.isPinned && (
        <div className="absolute top-3 right-3 p-1 bg-amber-100 dark:bg-amber-900/30 rounded-md">
          <Pin size={12} className="text-amber-600 dark:text-amber-400" />
        </div>
      )}

      <h3 className={`font-bold text-sm pr-8 line-clamp-1 ${THEME_CLASSES.text.primary}`}>
        {note.title}
      </h3>

      <p className={`text-xs leading-relaxed line-clamp-4 flex-1 ${THEME_CLASSES.text.secondary}`}>
        {note.content}
      </p>

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

      <div className={`flex items-center justify-between pt-2 border-t ${THEME_CLASSES.border.base}`}>
        <span className={`text-[10px] ${THEME_CLASSES.text.tertiary}`}>
          {format(new Date(note.updatedAt), "MMM d, h:mm a")}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {deleteConfirmId === note.id ? (
            <>
              <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X size={13} />
              </button>
              <button onClick={() => handleDelete(note.id)} className="p-1.5 text-red-500">
                <Check size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTogglePin(note)}
                className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
              >
                {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>
              <button onClick={() => openEdit(note)} className="p-1.5 text-gray-400 hover:text-blue-500">
                <Edit3 size={13} />
              </button>
              <button onClick={() => setDeleteConfirmId(note.id)} className="p-1.5 text-gray-400 hover:text-red-500">
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className={`text-3xl font-bold tracking-tight ${THEME_CLASSES.text.primary}`}>Quick Notes</h2>
            <p className="text-sm opacity-50">Capture your ideas instantly.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-4 pr-4 py-2.5 rounded-xl border text-sm ${THEME_CLASSES.input.base} w-64`}
            />
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-5 ${THEME_CLASSES.surface.card} ${THEME_CLASSES.border.base}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{editingNote ? "Edit Note" : "New Note"}</h3>
                <button onClick={resetForm}><X size={18} /></button>
              </div>
              <input
                type="text"
                placeholder="Title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border ${THEME_CLASSES.input.base}`}
              />
              <textarea
                placeholder="Content..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border ${THEME_CLASSES.input.base}`}
              />
              <div className="flex flex-wrap gap-1.5">
                {formTags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-md">#{tag}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs ${THEME_CLASSES.input.base}`}
                />
                <button onClick={handleAddTag} className="px-3 py-2 border rounded-lg text-xs font-bold">Add</button>
              </div>
              <div className="flex gap-3">
                <button onClick={resetForm} className="flex-1 py-2.5 border rounded-xl font-bold">Cancel</button>
                <button onClick={handleSave} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl font-bold">Save</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center opacity-50">Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-center opacity-50 py-20 border-2 border-dashed rounded-3xl">No notes found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pinnedNotes.map(n => <NoteCard key={n.id} note={n} />)}
            {unpinnedNotes.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Notes;
