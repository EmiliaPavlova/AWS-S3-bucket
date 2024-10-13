import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateFile from './CreateFile';
import { S3 } from 'aws-sdk';

jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    putObject: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  })),
}));

describe('CreateFile Component', () => {
  const awsConfig = {
    accessKeyId: 'test-access-key-id',
    secretAccessKey: 'test-secret-access-key',
    region: 'test-region',
    bucketName: 'test-bucket-name',
  };

  const mockOnFileCreate = jest.fn();

  const directories = ['folder1', 'folder2'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form', () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    expect(screen.getByText('Create new file in S3')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create new file in S3'));
    expect(screen.getByLabelText('Select existing directory:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New directory path', { exact: false})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('File name', { exact: false})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('File content')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    const selectedDirectoryInput = screen.getByLabelText('Select existing directory:');
    fireEvent.change(selectedDirectoryInput, { target: { value: 'folder1' } });
    expect(selectedDirectoryInput).toHaveValue('folder1');

    const newDirectoryInput = screen.getByPlaceholderText('New directory path', { exact: false});
    fireEvent.change(newDirectoryInput, { target: { value: 'newFolder' } });
    expect(newDirectoryInput).toHaveValue('newFolder');

    const fileNameInput = screen.getByPlaceholderText('File name', { exact: false});
    fireEvent.change(fileNameInput, { target: { value: 'New File' } });
    expect(fileNameInput).toHaveValue('New File');

    const fileContentInput = screen.getByPlaceholderText('File content');
    fireEvent.change(fileContentInput, { target: { value: 'New Content' } });
    expect(fileContentInput).toHaveValue('New Content');
  });

  it('creates a file in new directory', async () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByPlaceholderText('New directory path', { exact: false}), { target: { value: 'newFolder' } });
    fireEvent.change(screen.getByPlaceholderText('File name', { exact: false}), { target: { value: 'testFile' } });
    fireEvent.change(screen.getByPlaceholderText('File content'), { target: { value: 'File content' } });
    fireEvent.click(screen.getByText('Create File'));
    await waitFor(() => expect(screen.getByText('File created successfully', { exact: false})).toBeInTheDocument());
    expect(S3).toHaveBeenCalledTimes(1);
    expect(mockOnFileCreate).toHaveBeenCalledTimes(1);
  });

  it('creates a file in existing directory', async () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByLabelText('Select existing directory:'), { target: { value: 'folder1' } });
    fireEvent.change(screen.getByPlaceholderText('File name', { exact: false}), { target: { value: 'testFile' } });
    fireEvent.change(screen.getByPlaceholderText('File content'), { target: { value: 'File content' } });
    fireEvent.click(screen.getByText('Create File'));
    await waitFor(() => expect(screen.getByText('File created successfully at: folder1/testFile.txt')).toBeInTheDocument());
    expect(S3).toHaveBeenCalledTimes(1);
    expect(mockOnFileCreate).toHaveBeenCalledTimes(1);
  });

  it('hides the status message after a file is created', async () => {
    jest.useFakeTimers();
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByPlaceholderText('File name', { exact: false}), { target: { value: 'testFile' } });
    fireEvent.change(screen.getByPlaceholderText('File content'), { target: { value: 'File content' } });
    fireEvent.click(screen.getByText('Create File'));
    await waitFor(() => expect(screen.getByText('File created successfully at: testFile.txt')).toBeInTheDocument());
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByPlaceholderText('File created successfully at: testFile.txt')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('creates a new directory', async () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByPlaceholderText('New directory path', { exact: false}), { target: { value: 'newFolder' } });
    fireEvent.click(screen.getByText('Create Folder'));
    await waitFor(() => expect(screen.getByText('Folder created at: newFolder')).toBeInTheDocument());
    expect(S3).toHaveBeenCalledTimes(1);
    expect(mockOnFileCreate).toHaveBeenCalledTimes(1);
  });

  it('creates a new directory in existing one', async () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByLabelText('Select existing directory:'), { target: { value: 'folder1' } });
    fireEvent.change(screen.getByPlaceholderText('New directory path', { exact: false}), { target: { value: 'newFolder' } });
    fireEvent.click(screen.getByText('Create Folder'));
    await waitFor(() => expect(screen.getByText('Folder created at: folder1/newFolder')).toBeInTheDocument());
    expect(S3).toHaveBeenCalledTimes(1);
    expect(mockOnFileCreate).toHaveBeenCalledTimes(1);
  });

  it('handles form validation error if no folder or file is added', () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByLabelText('Select existing directory:'), { target: { value: 'folder1' } });
    fireEvent.click(screen.getByText('Create Folder'));
    expect(screen.getByText('Add new directory or new file name.')).toBeInTheDocument();
  });

  it('handles form validation error for file', () => {
    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByPlaceholderText('File name', { exact: false}), { target: { value: 'testFile' } });
    fireEvent.click(screen.getByText('Create File'));
    expect(screen.getByText('File content is required.')).toBeInTheDocument();
  });

  it('returns an error if creation fails', async () => {
    (S3 as unknown as jest.Mock).mockImplementation(() => ({
      putObject: jest.fn(() => ({
        promise: jest.fn().mockRejectedValueOnce(new Error('Simulated S3 error')),
      })),
    }));

    render(<CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={mockOnFileCreate} />);
    fireEvent.click(screen.getByText('Create new file in S3'));
    fireEvent.change(screen.getByPlaceholderText('File name', { exact: false }), { target: { value: 'testFile' } });
    fireEvent.change(screen.getByPlaceholderText('File content'), { target: { value: 'File content' } });
    fireEvent.click(screen.getByText('Create File'));
    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
    expect(mockOnFileCreate).not.toHaveBeenCalled();
  });
});
