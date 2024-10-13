import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NodeType } from '../../utils/enums';
import TreeNode, { FileNode, DirectoryNode } from './TreeNode';
import { S3 } from 'aws-sdk';

jest.mock('aws-sdk', () => {
  const mockS3 = {
    getObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Body: 'Test file content',
      }),
    }),
  };
  return {
    S3: jest.fn(() => mockS3),
  };
});

const mockAwsConfig = {
  accessKeyId: 'testAccessKeyId',
  secretAccessKey: 'testSecretAccessKey',
  region: 'testRegion',
  bucketName: 'testBucket',
};

const mockSelectCategory = jest.fn();
const mockOnDeleteFile = jest.fn();

describe('TreeNode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a directory node', () => {
    const directoryNode: DirectoryNode = {
      type: NodeType.Directory,
      name: 'Test Folder',
      key: 'testFolder',
      parent: null,
      children: [],
    };
    render(
      <TreeNode
        node={directoryNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  it('renders a file node and allows deleting', () => {
    const fileNode: FileNode = {
      type: NodeType.File,
      name: 'Test File.txt',
      key: 'testFile.txt',
    };
    render(
      <TreeNode
        node={fileNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    expect(screen.getByText('Test File.txt')).toBeInTheDocument();
    const deleteButton = screen.getByTestId('deleteNode');
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
    expect(mockOnDeleteFile).toHaveBeenCalledWith('testFile.txt');
  });

  it('opens modal, fetches file content and closes modal', async () => {
    const fileNode: FileNode = {
      type: NodeType.File,
      name: 'Test File.txt',
      key: 'testFile.txt',
    };
    render(
      <TreeNode
        node={fileNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    fireEvent.click(screen.getByText('Test File.txt'));
    expect(screen.getAllByText('Test File.txt')).toHaveLength(2);
    fireEvent.click(screen.getByTestId('close'));
    expect(screen.getAllByText('Test File.txt')).toHaveLength(1);
  });

  it('calls selectCategory on directory node click', () => {
    const directoryNode: DirectoryNode = {
      type: NodeType.Directory,
      name: 'Test Folder',
      key: 'testFolder',
      parent: null,
      children: [],
    };
    render(
      <TreeNode
        node={directoryNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    fireEvent.click(screen.getByText('Test Folder'));
    expect(mockSelectCategory).toHaveBeenCalledWith(directoryNode);
  });

  it('renders child nodes when a directory has children', () => {
    const directoryNode: DirectoryNode = {
      type: NodeType.Directory,
      name: 'Parent Folder',
      key: 'parentFolder',
      parent: null,
      children: [
        {
          type: NodeType.File,
          name: 'Child File.txt',
          key: 'parentFolder/childFile.txt',
        },
      ],
    };
    render(
      <TreeNode
        node={directoryNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    expect(screen.getByText('Parent Folder')).toBeInTheDocument();
    expect(screen.getByText('Child File.txt')).toBeInTheDocument();
  });

  it('returns an error if fetching file content fails', async () => {
    (S3 as unknown as jest.Mock).mockImplementation(() => ({
      putObject: jest.fn(() => ({
        promise: jest.fn().mockRejectedValueOnce(new Error('Simulated S3 error')),
      })),
    }));
    const fileNode: FileNode = {
      type: NodeType.File,
      name: 'Test File.txt',
      key: 'testFile.txt',
    };
    render(
      <TreeNode
        node={fileNode}
        awsConfig={mockAwsConfig}
        selectCategory={mockSelectCategory}
        onDeleteFile={mockOnDeleteFile}
      />
    );
    fireEvent.click(screen.getByText('Test File.txt'));
    await waitFor(() => {
      expect(screen.getByText('Error loading file content.')).toBeInTheDocument();
    });
  });
});
