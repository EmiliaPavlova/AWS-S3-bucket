import './Modal.css';

interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="modal">
      <header className="modalHeader">
        {title}
        <button className="modalClose" data-testid="close" aria-label="Close" onClick={onClose} />
      </header>
      {content}
    </div>
  )
}

export default Modal;
