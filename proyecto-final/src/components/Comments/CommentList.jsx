import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchComments } from "../../store/slices/comments/commentThunks"
import { selectCommentsByPost } from "../../store/selectors/commentSelectors"

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

function CommentList({ postId }) {
  const dispatch = useDispatch()

  const comments = useSelector(selectCommentsByPost(postId))
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchComments(postId))
  }, [postId, dispatch])

  if (!comments.length) {
    return (
      <p style={{ opacity: 0.6, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
        No hay comentarios aún.
      </p>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "0.5rem",
      }}
    >
      {comments.map((c) => {
        const initials = getInitials(c.autorNombre)
        const isOwnComment = user && c.usuarioId === user.uid
        const hasProfile = !!c.usuarioId && !isOwnComment
        const profileLink = hasProfile ? `/profile/${c.usuarioId}` : null

        const authorNode = profileLink ? (
          <Link to={profileLink} className="commentAuthorLink">
            {c.autorNombre || "Estudiante"}
          </Link>
        ) : (
          <span className="commentAuthorText">
            {c.autorNombre || "Estudiante"}
          </span>
        )

        return (
          <div
            key={c.id}
            style={{
              display: "flex",
              gap: "0.6rem",
              background: "var(--bg-secondary)",
              padding: "0.55rem 0.7rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials || "U"}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.15rem",
                }}
              >
                {authorNode}
              </div>

              <div style={{ fontSize: "0.9rem", lineHeight: 1.3 }}>
                {c.contenido}
              </div>

              {c.fecha && (
                <small
                  style={{
                    marginTop: "0.2rem",
                    fontSize: "0.75rem",
                    opacity: 0.55,
                  }}
                >
                  {new Date(c.fecha).toLocaleString()}
                </small>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CommentList