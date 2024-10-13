import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

const title = 'Title';
const content = 'Content';

describe('Modal', () => {
  it('renders modal', () => {
    const onClose = jest.fn();
    render(<Modal title={title} content={content} onClose={onClose} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('calls onClose', () => {
    const onClose = jest.fn();
    render(<Modal title={title} content={content} onClose={onClose} />);
    expect(screen.getByTestId('close')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
