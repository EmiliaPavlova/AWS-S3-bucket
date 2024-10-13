import React, { useCallback, useMemo, useState } from 'react';
import { S3 } from 'aws-sdk';
import DeleteIcon from '../../assets/DeleteIcon';
import FileIcon from '../../assets/FileIcon'
import FolderIcon from '../../assets/FolderIcon';
import { NodeType } from '../../utils/enums';
import { AWSConfig } from '../../pages/Home/Home';
import Modal from '../Modal/Modal';

export type FileNode = {
  type: NodeType.File;
  name: string;
  key: string;
};

export type DirectoryNode = {
  type: NodeType.Directory;
  name: string;
  key: string;
  parent: DirectoryNode | null;
  children: TreeNode[];
};

type TreeNode = FileNode | DirectoryNode;

interface TreeNodeProps {
  node: TreeNode;
  awsConfig: AWSConfig;
  parent?: DirectoryNode | null;
  selectCategory: (category: DirectoryNode) => void;
  onDeleteFile: (fileName: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({ node, awsConfig, selectCategory, onDeleteFile }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('No content');
  const [loading, setLoading] = useState<boolean>(false);

  const s3 = useMemo(() => new S3({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region,
  }), [awsConfig.accessKeyId, awsConfig.region, awsConfig.secretAccessKey]);

  const handleCloseModal = useCallback(() => setOpenModal(false), []);

  const handleOpenModal = useCallback(async (key: string) => {
    setOpenModal(true);
    setLoading(true);

    const params = {
      Bucket: awsConfig.bucketName,
      Key: key,
    };

    try {
      const data = await s3.getObject(params).promise();
      const fileData = data.Body?.toString('utf-8') || 'No content';
      setFileContent(fileData);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setFileContent('Error loading file content.');
    } finally {
      setLoading(false);
    }
  }, [awsConfig.bucketName, s3]);

  const handleClick = useCallback(() => {
    if (node.type === NodeType.File) {
      handleOpenModal(node.key);
    } else {
      selectCategory(node as DirectoryNode);
    }
  }, [handleOpenModal, node, selectCategory]);

  const hasChildren = node.type === NodeType.Directory && node.children.length > 0;

  return (
    <div className="treeNode">
      <div className="treeNodeRow">
        <div
          onClick={handleClick}
          className={node.type === NodeType.Directory ? 'directory' : 'file'}
        >
          {node.type === NodeType.Directory ? <FolderIcon /> : <FileIcon />}
          {node.name}
        </div>
        {!hasChildren && (
          <div className="deleteNode" data-testid="deleteNode" onClick={() => onDeleteFile(node.key)}>
            <DeleteIcon />
          </div>
        )}
      </div>
      {hasChildren && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode
              key={childNode.key}
              node={childNode}
              awsConfig={awsConfig}
              parent={node as DirectoryNode}
              selectCategory={selectCategory}
              onDeleteFile={onDeleteFile}
            />
          ))}
        </div>
      )}
      {openModal && (
        <Modal
          title={node.name}
          content={loading ? 'Loading content...' : fileContent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
});

export default TreeNode;
