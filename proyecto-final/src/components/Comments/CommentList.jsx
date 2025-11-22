import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchComments } from "../../store/slices/comments/commentThunks"

function CommentList({ postId }) {
  const dispatch = useDispatch()
  const comments = useSelector(
    (state) => state.comments.commentsByPost[postId] || []
  )

  useEffect(() => {
    dispatch(fetchComments(postId))
  }, [postId])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {comments.length === 0 && (
        <p style={{ opacity: 0.7 }}>No hay comentarios aún.</p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            background: "var(--bg-secondary)",
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <strong>{c.autorNombre}</strong>
          <p style={{ margin: "0.2rem 0" }}>{c.contenido}</p>
          <small style={{ opacity: 0.6 }}>
            {c.fecha ? new Date(c.fecha).toLocaleString() : ""}
          </small>
        </div>
      ))}
    </div>
  )
}

export default CommentList