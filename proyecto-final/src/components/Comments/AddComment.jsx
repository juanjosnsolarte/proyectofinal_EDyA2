import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addComment } from "../../store/slices/comments/commentThunks"

function AddComment({ postId }) {
  const [text, setText] = useState("")
  const [showBox, setShowBox] = useState(false)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    await dispatch(
      addComment(postId, {
        usuarioId: user.uid,
        autorNombre: user.name,
        contenido: trimmed,
      })
    )

    setText("")
    setShowBox(false)
  }

  const handleToggle = () => {
    setShowBox((prev) => !prev)
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      {!showBox && (
        <button
          onClick={handleToggle}
          style={{
            padding: "0.3rem 0.9rem",
            borderRadius: "999px",
            border: "1px solid var(--primary)",
            background: "transparent",
            color: "var(--primary)",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Responder
        </button>
      )}

      {showBox && (
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            animation: "fadeInCommentBox 0.18s ease-out",
          }}
        >
          <textarea
            placeholder="Responde la publicación..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              padding: "0.6rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              resize: "vertical",
              minHeight: "60px",
            }}
          />

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: "0.4rem 1.2rem",
                borderRadius: "999px",
                background: "var(--primary)",
                color: "#fff",
                cursor: "pointer",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Enviar
            </button>

            <button
              onClick={handleToggle}
              style={{
                padding: "0.4rem 1.1rem",
                borderRadius: "999px",
                background: "transparent",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddComment