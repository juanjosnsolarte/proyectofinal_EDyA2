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
    setShowBox(false) // ocultar después de enviar
  }

  return (
    <div style={{ marginTop: "0.5rem" }}>
      {!showBox && (
        <button
          onClick={() => setShowBox(true)}
          style={{
            padding: "0.3rem 0.8rem",
            borderRadius: "6px",
            border: "1px solid var(--primary)",
            background: "transparent",
            color: "var(--primary)",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Responder
        </button>
      )}

      {showBox && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea
            placeholder="Responde la publicación..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
            }}
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#fff",
                cursor: "pointer",
                border: "none",
              }}
            >
              Enviar
            </button>

            <button
              onClick={() => setShowBox(false)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                background: "transparent",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
                cursor: "pointer",
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