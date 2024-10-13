import { render, screen, fireEvent } from '@testing-library/react';
import ConfigForm from './ConfigForm';

describe('ConfigForm', () => {
  const mockOnSaveConfig = jest.fn();

  beforeEach(() => {
    mockOnSaveConfig.mockClear();
    localStorage.clear();
  });

  it('renders the form', () => {
    render(<ConfigForm onSaveConfig={mockOnSaveConfig} />);
    expect(screen.getByText('AWS Access Key')).toBeInTheDocument();
    expect(screen.getByText('AWS Secret Key')).toBeInTheDocument();
    expect(screen.getByText('AWS Region')).toBeInTheDocument();
    expect(screen.getByText('S3 Bucket Name')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('displays error messages when required fields are missing', () => {
    render(<ConfigForm onSaveConfig={mockOnSaveConfig} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('AWS Access Key is required')).toBeInTheDocument();
    expect(screen.getByText('AWS Secret Key is required')).toBeInTheDocument();
    expect(screen.getByText('AWS Region is required')).toBeInTheDocument();
    expect(screen.getByText('S3 Bucket Name is required')).toBeInTheDocument();
    expect(mockOnSaveConfig).not.toHaveBeenCalled();
  });

  it('updates form values when input fields are changed', () => {
    render(<ConfigForm onSaveConfig={mockOnSaveConfig} />);
    const accessKeyInput = screen.getByLabelText('AWS Access Key');
    const secretKeyInput = screen.getByLabelText('AWS Secret Key');
    const regionInput = screen.getByLabelText('AWS Region');
    const bucketNameInput = screen.getByLabelText('S3 Bucket Name');

    fireEvent.change(accessKeyInput, { target: { value: 'new-access-key' } });
    fireEvent.change(secretKeyInput, { target: { value: 'new-secret-key' } });
    fireEvent.change(regionInput, { target: { value: 'new-us-west-1' } });
    fireEvent.change(bucketNameInput, { target: { value: 'new-bucket' } });

    expect(accessKeyInput).toHaveValue('new-access-key');
    expect(secretKeyInput).toHaveValue('new-secret-key');
    expect(regionInput).toHaveValue('new-us-west-1');
    expect(bucketNameInput).toHaveValue('new-bucket');
  });

  it('calls onSaveConfig with correct values when the form is submitted successfully', async () => {
    render(<ConfigForm onSaveConfig={mockOnSaveConfig} />);
    fireEvent.change(screen.getByLabelText('AWS Access Key'), { target: { value: 'new-access-key' } });
    fireEvent.change(screen.getByLabelText('AWS Secret Key'), { target: { value: 'new-secret-key' } });
    fireEvent.change(screen.getByLabelText('AWS Region'), { target: { value: 'new-us-west-1' } });
    fireEvent.change(screen.getByLabelText('S3 Bucket Name'), { target: { value: 'new-bucket' } });

    await fireEvent.click(screen.getByText('Submit'));
    expect(mockOnSaveConfig).toHaveBeenCalledWith({
      accessKeyId: 'new-access-key',
      secretAccessKey: 'new-secret-key',
      region: 'new-us-west-1',
      bucketName: 'new-bucket'
    });
    expect(localStorage.getItem('awsConfig')).toEqual(JSON.stringify({
      accessKeyId: 'new-access-key',
      secretAccessKey: 'new-secret-key',
      region: 'new-us-west-1',
      bucketName: 'new-bucket'
    }));
  });
});