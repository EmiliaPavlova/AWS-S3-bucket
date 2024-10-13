import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NodeType } from '../../utils/enums';
import { DirectoryNode } from '../Tree/TreeNode';
import './BrowserTree.css';

interface BrowserTreeProps {
  nodes: DirectoryNode;
  loading?: boolean;
  selectedDirectory: DirectoryNode;
  selectCategory?: (category: DirectoryNode) => void;
}

const BrowserTree: React.FC<BrowserTreeProps> = React.memo(({ nodes, loading, selectedDirectory, selectCategory }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = useCallback((key: string) => {
    setExpanded(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }, []);

  const expandParents = useCallback((node: DirectoryNode) => {
    const parentsToExpand: { [key: string]: boolean } = {};
    let currentNode: DirectoryNode | null = node || null;
    while (currentNode) {
      parentsToExpand[currentNode.key] = true;
      currentNode = currentNode.parent || null;
    }

    setExpanded((prevState) => ({
      ...prevState,
      ...parentsToExpand,
    }));
  }, []);

  useEffect(() => {
    if (selectedDirectory) {
      expandParents(selectedDirectory);
    }
  }, [selectedDirectory, expandParents]);


  const handleDoubleClick = useCallback((node: DirectoryNode) => {
    selectCategory?.(node);
  }, [selectCategory]);

  const hasNestedItems = useCallback((treeNode: DirectoryNode) => {
    return treeNode && treeNode.children.filter(node => node.type === NodeType.Directory).length > 0;
  }, []);

  const isSelected = (treeNode: DirectoryNode) => {
    return treeNode.key === selectedDirectory.key
  };

  const directories = useMemo(() => {
    return nodes.children.filter(node => node.type === NodeType.Directory)
  }, [nodes])

  return (
    <div>
      {loading ? (
        <p>Loading files...</p>
      ) : (
        <ul className="browserTree">
          {directories.map(node => (
            <li key={node.key}>
              <>
                <div
                  onClick={() => toggleExpand(node.key)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  className={hasNestedItems(node) ? (expanded[node.key] ? "expanded" : "collapsed") : undefined}
                >
                  <span className={isSelected(node) ? "selected" : undefined}>{node.name}</span>
                </div>
                {expanded[node.key] && (
                  <BrowserTree
                    nodes={node}
                    selectedDirectory={selectedDirectory}
                    selectCategory={selectCategory}
                  />
                )}
              </>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default BrowserTree;
