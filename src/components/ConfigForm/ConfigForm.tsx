import React, { useState } from 'react';
import './ConfigForm.css';

interface ConfigFormProps {
  onSaveConfig: (config: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string,
    bucketName: string
  }) => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ onSaveConfig }) => {
  const [formValues, setFormValues] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucketName: ''
  });
  const [formErrors, setFormErrors] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucketName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {
      accessKeyId: formValues.accessKeyId ? '' : 'AWS Access Key is required',
      secretAccessKey: formValues.secretAccessKey ? '' : 'AWS Secret Key is required',
      region: formValues.region ? '' : 'AWS Region is required',
      bucketName: formValues.bucketName ? '' : 'S3 Bucket Name is required'
    };
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSaveConfig(formValues);
      localStorage.setItem('awsConfig', JSON.stringify(formValues));
    }
  };

  return (
    <div className="formWrapper">
      <form className="confirmForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="accessKeyId">AWS Access Key</label>
          <input
            type="text"
            name="accessKeyId"
            id="accessKeyId"
            value={formValues.accessKeyId}
            onChange={handleInputChange}
          />
        </div>
        {formErrors.accessKeyId ? <div className="errorMessage">{formErrors.accessKeyId}</div> : <div className="noError" />}
        <div>
          <label htmlFor="secretAccessKey">AWS Secret Key</label>
          <input
            type="password"
            name="secretAccessKey"
            id="secretAccessKey"
            value={formValues.secretAccessKey}
            onChange={handleInputChange}
          />
        </div>
        {formErrors.secretAccessKey ? <div className="errorMessage">{formErrors.secretAccessKey}</div> : <div className="noError" />}
        <div>
          <label htmlFor="region">AWS Region</label>
          <input
            type="text"
            name="region"
            id="region"
            value={formValues.region}
            onChange={handleInputChange}
          />
        </div>
        {formErrors.region ? <div className="errorMessage">{formErrors.region}</div> : <div className="noError" />}
        <div>
          <label htmlFor="bucketName">S3 Bucket Name</label>
          <input
            type="text"
            name="bucketName"
            id="bucketName"
            value={formValues.bucketName}
            onChange={handleInputChange}
          />
        </div>
        {formErrors.bucketName ? <div className="errorMessage">{formErrors.bucketName}</div> : <div className="noError" />}
        <button className="submitButton" type="submit" aria-label="Submit">Submit</button>
      </form>
    </div>
  );
};

export default ConfigForm;
