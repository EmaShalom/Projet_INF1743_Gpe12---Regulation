import { createPortal } from 'react-dom'
import './Modal.css'

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>

          {/* Tu as dit que le X est déjà correct: on ne le touche pas */}
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal