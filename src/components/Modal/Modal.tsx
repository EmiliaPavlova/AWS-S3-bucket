import './Modal.css';

interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="modal">
      <div className="modalHeader">
        {title}
        <div className="modalClose" data-testid="close" onClick={onClose} />
      </div>
      {content}
    </div>
  )
}

export default Modal;
