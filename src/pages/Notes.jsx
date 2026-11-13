import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setNotes(await api("/api/notes"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!text.trim()) return;
    try {
      await api("/api/notes", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setText("");
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteNote(id) {
    try {
      await api(`/api/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(note) {
    setEditingId(note._id);
    setEditText(note.text);
  }

  async function saveEdit() {
    if (!editText.trim()) return;
    try {
      await api(`/api/notes/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ text: editText }),
      });
      setEditingId(null);
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  }

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <h1>Notes</h1>
          <p className="count">
            {notes.length} {notes.length === 1 ? "note" : "notes"} · {email}
          </p>
        </div>
        <button className="logout-btn" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="composer">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note..."
          rows={3}
        />
        <button className="add-btn" onClick={addNote}>
          Add
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="status">Loading notes...</p>}
      {!loading && !error && notes.length === 0 && (
        <p className="status">No notes yet. Write your first one!</p>
      )}

      <div className="grid">
        {notes.map((note) => (
          <div key={note._id} className="card">
            {editingId === note._id ? (
              <>
                <textarea
                  className="edit-box"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="actions">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="note-text" onClick={() => startEdit(note)}>
                  {note.text}
                </p>
                <div className="card-footer">
                  <span className="date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="actions">
                    <button onClick={() => startEdit(note)}>Edit</button>
                    <button
                      className="danger"
                      onClick={() => deleteNote(note._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}