import { render, screen } from '@testing-library/react';
import Header from './Header';

const title = 'Title';

describe('Header', () => {
  it('renders heading', () => {
    render(<Header title={title} />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });
});
