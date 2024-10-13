import { DirectoryNode, FileNode } from "../components/Tree/TreeNode";
import { NodeType } from "./enums";

export const buildTree = (paths: string[]): DirectoryNode => {
  const root: DirectoryNode = {
    type: NodeType.Directory,
    name: 'root',
    key: '',
    parent: null,
    children: [],
  };

  paths.forEach((path) => {
    const parts = path.split('/');
    let currentDirectory = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && part.endsWith('.txt');
      const existingNode = currentDirectory.children.find(
        (node) => node.name === part
      );

      if (!existingNode) {
        if (isFile) {
          const fileNode: FileNode = {
            type: NodeType.File,
            name: part,
            key: path,
          };
          currentDirectory.children.push(fileNode);
        } else {
          const dirNode: DirectoryNode = {
            type: NodeType.Directory,
            name: part,
            key: path.substring(0, path.lastIndexOf(part)) + part,
            parent: currentDirectory,
            children: [],
          };
          currentDirectory.children.push(dirNode);
          currentDirectory = dirNode;
        }
      } else if (!isFile && existingNode.type === NodeType.Directory) {
        currentDirectory = existingNode as DirectoryNode;
      }
    });
  });

  return root;
};
