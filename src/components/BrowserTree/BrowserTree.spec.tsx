import { render, screen, fireEvent } from '@testing-library/react';
import { NodeType } from '../../utils/enums';
import { DirectoryNode } from '../Tree/TreeNode';
import BrowserTree from './BrowserTree';

const mockData: DirectoryNode = {
  type: NodeType.Directory,
  name: 'root',
  key: 'root',
  parent: null,
  children: [
    {
      type: NodeType.Directory,
      name: 'folder1',
      key: 'root/folder1',
      parent: null,
      children: [],
    },
    {
      type: NodeType.Directory,
      name: 'folder2',
      key: 'root/folder2',
      parent: null,
      children: [
        {
          type: NodeType.Directory,
          name: 'subfolder1',
          key: 'root/folder2/subfolder1',
          parent: {
            type: NodeType.Directory,
            name: 'folder2',
            key: 'root/folder2',
            parent: null,
            children: []
          },
          children: [],
        },
        {
          type: NodeType.File,
          name: 'file1.txt',
          key: 'root/folder2/file1.txt',
        },
      ],
    }
  ]
};
const selectedDirectory: DirectoryNode = mockData.children.find(child => child.type === NodeType.Directory)!;

describe('BrowserTree', () => {
  it('renders directories', () => {
    render(<BrowserTree nodes={mockData} selectedDirectory={selectedDirectory} />);
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('folder2')).toBeInTheDocument();
    expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
  });

  it('expands and collaps a directory on click', () => {
    render(<BrowserTree nodes={mockData} selectedDirectory={selectedDirectory} />);
    const directory = screen.getByText('folder2');
    expect(screen.queryByText('subfolder1')).not.toBeInTheDocument();

    fireEvent.click(directory);
    expect(screen.getByText('subfolder1')).toBeInTheDocument();

    fireEvent.click(directory);
    expect(screen.queryByText('subfolder1')).not.toBeInTheDocument();
  });

  it('renders nested directories when expanded', () => {
    render(<BrowserTree nodes={mockData} loading={false} selectedDirectory={selectedDirectory} />);
    expect(screen.queryByText('subfolder1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('folder2'));
    expect(screen.getByText('subfolder1')).toBeInTheDocument();
  });

  it('does not expand any directory if root is selected', () => {
    render(<BrowserTree nodes={mockData} selectedDirectory={selectedDirectory} />);
    expect(screen.getByText('folder1').classList.contains('expanded')).toBe(false);
  });

  it('expands multiple levels of parent directories', () => {
    const selectedSubolder2Directory = (mockData.children.find(d => d.name === 'folder2') as DirectoryNode)?.children.find(d => d.name === 'subfolder1') as DirectoryNode;
    render(<BrowserTree nodes={mockData} selectedDirectory={selectedSubolder2Directory} />);
    expect(screen.getByText('folder2').closest('div')?.classList.contains('expanded')).toBe(true);
    expect(screen.getByText('subfolder1').closest('div')?.classList.contains('selected')).toBe(false);
  });

  it('calls selectCategory on double click', () => {
    const mockSelectCategory = jest.fn();
    render(<BrowserTree nodes={mockData} selectedDirectory={selectedDirectory} selectCategory={mockSelectCategory} />);
    const directory = screen.getByText('folder1');
    fireEvent.doubleClick(directory);
    expect(mockSelectCategory).toHaveBeenCalledWith(selectedDirectory);
    expect(mockSelectCategory).toHaveBeenCalledWith(mockData.children[0]);
    expect(directory).toHaveClass('selected');
  });

  it('renders loading state', () => {
    render(<BrowserTree nodes={mockData} loading={true} selectedDirectory={selectedDirectory} />);
    expect(screen.getByText('Loading files...')).toBeInTheDocument();
  });
});
