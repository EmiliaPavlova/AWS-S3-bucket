import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { S3 } from 'aws-sdk';
import CreateFile from '../../components/CreateFile/CreateFile';
import Header from '../../components/Header/Header';
import ConfigForm from '../../components/ConfigForm/ConfigForm';
import { DirectoryNode } from '../../components/Tree/TreeNode';
import { buildTree } from '../../utils/buildTree';
import './Home.css';
const BrowserTree = React.lazy(() => import('../../components/BrowserTree/BrowserTree'));
const Tree = React.lazy(() => import('../../components/Tree/Tree'));

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

const title = 'AWS S3 File Manager';

const Home: React.FC = () => {
  const [files, setFiles] = useState<S3.ObjectList>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [awsConfig, setAwsConfig] = useState<AWSConfig | null>(null);

  const paths = useMemo(() => files.map(file => file.Key!), [files]);
  const rootDirectory = useMemo(() => buildTree(paths), [paths]);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryNode>(rootDirectory);

  const directories = useMemo(() => {
    const directorySet = new Set<string>();
    files.forEach(file => {
      if (file.Key) {
        const parts = file.Key.split('/');
        parts.pop();
        let path = '';
        parts.forEach(part => {
          path = path ? `${path}/${part}` : part;
          directorySet.add(path);
        });
      }
    });

    return Array.from(directorySet);
  }, [files]);

  useEffect(() => {
    const storedConfig = localStorage.getItem('awsConfig');
    if (storedConfig) {
      const parsedConfig: AWSConfig = JSON.parse(storedConfig);
      setAwsConfig(parsedConfig); 
    }
  }, []);

  const initializeS3 = useCallback(() => {
    if (!awsConfig) {
      return null;
    }

    return new S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });
  }, [awsConfig]);

  const fetchFiles = useCallback(() => {
    const s3 = initializeS3();
    if (!s3 || !awsConfig) {
      return;
    }

    setLoading(true);
    const params = {
      Bucket: awsConfig.bucketName,
    };

    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.error('Error fetching files:', err);
      } else {
        setFiles(data.Contents || []);
      }
      setLoading(false);
    });
  }, [awsConfig, initializeS3]);

  useEffect(() => {
    if (awsConfig) {
      fetchFiles();
    }
  }, [awsConfig, fetchFiles]);

  const handleSaveConfig = useCallback((config: AWSConfig) => {
    setAwsConfig(config);
    localStorage.setItem('awsConfig', JSON.stringify(config));
    fetchFiles();
  }, [fetchFiles]);

  const handleFileCreate = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileDelete = useCallback((fileName: string) => {
    const s3 = initializeS3();
    if (!s3 || !awsConfig) {
      return;
    }

    const params = {
      Bucket: awsConfig.bucketName,
      Key: fileName,
    };

    s3.deleteObject(params, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log(`File deleted successfully: ${fileName}`);
        fetchFiles();
      }
    });
  }, [awsConfig, fetchFiles, initializeS3]);

  useEffect(() => {
    setSelectedDirectory(rootDirectory);
  }, [rootDirectory]);

  const goToParentDirectory = useCallback(() => {
    if (selectedDirectory && selectedDirectory.parent) {
      setSelectedDirectory(selectedDirectory.parent);
    }
  }, [selectedDirectory]);

  return (
    <div className="home">
      <Header title={title} />
      {awsConfig ? (
        <div className="container">
          <div className="tree">
            <Suspense fallback={<div>Loading...</div>}>
              <BrowserTree
                nodes={rootDirectory}
                loading={loading}
                selectedDirectory={selectedDirectory}
                selectCategory={setSelectedDirectory}
              />
            </Suspense>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <Tree
              node={selectedDirectory}
              awsConfig={awsConfig}
              selectCategory={setSelectedDirectory}
              onDeleteFile={handleFileDelete}
              goToParentDirectory={goToParentDirectory}
            />
          </Suspense>
          <CreateFile awsConfig={awsConfig} directories={directories} onFileCreate={handleFileCreate} />
        </div>
      ) : (
        <ConfigForm onSaveConfig={handleSaveConfig} />
      )}
    </div>
  )
}

export default Home;
