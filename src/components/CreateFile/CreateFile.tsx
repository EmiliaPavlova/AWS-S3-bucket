import React, { useMemo, useState } from 'react';
import { S3 } from 'aws-sdk';
import './CreateFile.css';

interface CreateFileProps {
  awsConfig: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  directories: string[];
  onFileCreate: () => void;
}

const CreateFile: React.FC<CreateFileProps> = ({ awsConfig, directories, onFileCreate }) => {
  const [formData, setFormData] = useState({
    selectedDirectory: '',
    newDirectory: '',
    fileName: '',
    fileContent: '',
  });
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const s3 = useMemo(() => {
    return new S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });
  }, [awsConfig]);

  const resetState = () => {
    setFormData({
      selectedDirectory: '',
      newDirectory: '',
      fileName: '',
      fileContent: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setUploadStatus('');
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      'selectedDirectory': selectedOption,
    }));
    setUploadStatus('');
  };

  const sanitizePath = (path: string) => {
    return path.replace(/\/+/g, '/');
  };

  const validateForm = () => {
    if (formData.selectedDirectory && !(formData.newDirectory || formData.fileName)) {
      setUploadStatus('Add new directory or new file name.');
      return false;
    }
    if (formData.fileName && !formData.fileContent) {
      setUploadStatus('File content is required.');
      return false;
    }
    return true;
  };

  const createFileOrDirectory = async () => {
    if (!validateForm()) {
      return;
    }

    const isDirectory = !formData.fileContent.trim();
    let directoryPath = formData.selectedDirectory
      ? formData.newDirectory
        ? `${formData.selectedDirectory}/${formData.newDirectory}`
        : formData.selectedDirectory
      : formData.newDirectory;
    directoryPath = sanitizePath(directoryPath.trim());

    let fileName = formData.fileName;
    if (!isDirectory && !fileName.endsWith('.txt')) {
      fileName += '.txt';
    }

    const path = isDirectory ? `${directoryPath}` : `${directoryPath ? directoryPath + '/' : ''}${fileName}`;

    const params: S3.PutObjectRequest = {
      Bucket: awsConfig.bucketName,
      Key: path,
      Body: isDirectory ? '' : formData.fileContent,
      ContentType: isDirectory ? undefined : 'text/plain'
    };

    try {
      setUploadStatus(isDirectory ? 'Creating folder...' : 'Creating file...');
      await s3.putObject(params).promise();
      setUploadStatus(isDirectory ? `Folder created at: ${path}` : `File created successfully at: ${path}`);
      onFileCreate();
      resetState();

      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error creating file or directory:', error);
      setUploadStatus('Creation failed');
    }
  };

  const disabled = !(formData.selectedDirectory || formData.newDirectory || formData.fileName);

  return (
    <div className="form">
      <div className="newFileTitle" onClick={() => setOpen(!open)}>Create new file in S3</div>
      {open && (
        <>
          <label htmlFor="existingDirectory">Select existing directory:</label>
          <select
            id="existingDirectory"
            name="selectedDirectory"
            className="input"
            value={formData.selectedDirectory}
            onChange={handleSelectChange}
          >
            <option value="">--Select a directory--</option>
            {directories.map((dir, index) => (
              <option key={index} value={dir}>{dir}</option>
            ))}
          </select>
          <input
            type="text"
            name="newDirectory"
            className="input"
            placeholder="New directory path (e.g. newFolder/subFolder)"
            value={formData.newDirectory}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="fileName"
            className="input"
            placeholder="File name (e.g. file.txt)"
            value={formData.fileName}
            onChange={handleInputChange}
          />
          <textarea
            name="fileContent"
            className="input"
            placeholder="File content"
            value={formData.fileContent}
            onChange={handleInputChange}
          ></textarea>
          <button
            className="newFileButton"
            disabled={disabled}
            aria-label={formData.fileName.trim() ? 'Create File' : 'Create Folder'}
            onClick={createFileOrDirectory}
          >
            {formData.fileName.trim() ? 'Create File' : 'Create Folder'}
          </button>

          {uploadStatus && <p className="statusMessage">{uploadStatus}</p>}
        </>
      )}
    </div>
  );
};

export default CreateFile;
