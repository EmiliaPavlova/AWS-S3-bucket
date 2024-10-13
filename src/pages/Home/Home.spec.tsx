import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { S3 } from 'aws-sdk';
import Home, { AWSConfig } from './Home';

const mockListObjects = S3.prototype.listObjectsV2 = jest.fn();
const mockDeleteObject = S3.prototype.deleteObject = jest.fn();

const mockFiles = [
  { Key: 'file1.txt' },
  { Key: 'file2.txt' },
];

describe('Home', () => {
  const mockAwsConfig: AWSConfig = {
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    region: 'us-east-1',
    bucketName: 'test-bucket',
  };

  localStorage.setItem('awsConfig', JSON.stringify(mockAwsConfig));

  beforeEach(() => {
    mockListObjects.mockReset();
    mockDeleteObject.mockReset();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders ConfigForm if no awsConfig in localStorage', () => {
    localStorage.removeItem('awsConfig');
    render(<Home />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('saves awsConfig and fetches files after config is submitted', async () => {
    mockListObjects.mockImplementationOnce((_params, callback) => {
      callback(null, { Contents: mockFiles });
    });
    render(<Home />);
    fireEvent.change(screen.getByLabelText('AWS Access Key'), { target: { value: 'test-access-key' } });
    fireEvent.change(screen.getByLabelText('AWS Secret Key'), { target: { value: 'test-secret-key' } });
    fireEvent.change(screen.getByLabelText('AWS Region'), { target: { value: 'us-east-1' } });
    fireEvent.change(screen.getByLabelText('S3 Bucket Name'), { target: { value: 'test-bucket' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      const awsConfig = JSON.parse(localStorage.getItem('awsConfig') || '{}');
      expect(awsConfig.accessKeyId).toBe('test-access-key');
      expect(awsConfig.bucketName).toBe('test-bucket');
    });

    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });
  });

  it('fetches files from S3 when awsConfig exists in localStorage', async () => {
    mockListObjects.mockImplementationOnce((_params, callback) => {
      callback(null, { Contents: mockFiles });
    });

    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });
  });

  it('deletes a file from S3', async () => {
    localStorage.setItem(
      'awsConfig',
      JSON.stringify(mockAwsConfig)
    );

    (S3.prototype.listObjectsV2 as jest.Mock).mockImplementation((_params, callback) => {
      callback(null, { Contents: mockFiles });
    });

    (S3.prototype.deleteObject as jest.Mock).mockImplementation((_params, callback) => {
      callback(null);
    });
    const consoleSpy = jest.spyOn(console, 'log');
    render(<Home />);
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    fireEvent.click(screen.getAllByTestId('deleteNode')[0]);
    expect(consoleSpy).toHaveBeenCalledWith('File deleted successfully: file1.txt');
  });
});
