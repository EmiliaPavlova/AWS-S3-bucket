import { AWSConfig } from '../../pages/Home/Home';
import TreeNode, { DirectoryNode } from './TreeNode';
import './Tree.css';

interface TreeProps {
  node: DirectoryNode;
  awsConfig: AWSConfig;
  selectCategory: (category: DirectoryNode) => void;
  onDeleteFile: (fileName: string) => void;
  goToParentDirectory: () => void;
}

const Tree: React.FC<TreeProps> = ({ node, goToParentDirectory, ...rest }) => {
  return (
    <div className="directories">
      {node.parent ? (
        <div className="parentDirectory" onClick={goToParentDirectory}>
          Go to parent directory
        </div>
      ) : (<div className="emptyParent" />)}
      {node.children.map((node) => (
        <TreeNode key={node.name} node={node} {...rest} />
      ))}
    </div>
  );
};

export default Tree;
