import { DirectoryNode, FileNode } from '../components/Tree/TreeNode';
import { NodeType } from './enums';
import { buildTree } from './buildTree';

describe('buildTree function', () => {
  it('should return a root directory node', () => {
    const paths: string[] = [];
    const tree = buildTree(paths);
    expect(tree).toEqual({
      type: NodeType.Directory,
      name: 'root',
      key: '',
      parent: null,
      children: [],
    });
  });

  it('should build a simple tree with one file', () => {
    const paths = ['file.txt'];
    const tree = buildTree(paths);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].type).toBe(NodeType.File);
    expect(tree.children[0].name).toBe('file.txt');
    expect(tree.children[0].key).toBe('file.txt');
  });

  it('should build a tree with nested directories and files', () => {
    const paths = ['folder/subfolder/file.txt'];
    const tree = buildTree(paths);
    const folderNode = tree.children[0] as DirectoryNode;
    const subfolderNode = folderNode.children[0] as DirectoryNode;
    const fileNode = subfolderNode.children[0] as FileNode;
    expect(tree.children.length).toBe(1);
    expect(folderNode.name).toBe('folder');
    expect(subfolderNode.name).toBe('subfolder');
    expect(fileNode.name).toBe('file.txt');
  });

  it('should handle multiple files in the same directory', () => {
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const tree = buildTree(paths);
    const folderNode = tree.children[0] as DirectoryNode;
    const file1 = folderNode.children[0] as FileNode;
    const file2 = folderNode.children[1] as FileNode;
    expect(folderNode.children.length).toBe(2);
    expect(file1.name).toBe('file1.txt');
    expect(file2.name).toBe('file2.txt');
  });

  it('should handle files and directories in different levels', () => {
    const paths = ['file1.txt', 'folder/file2.txt'];
    const tree = buildTree(paths);
    const file1 = tree.children[0] as FileNode;
    const folderNode = tree.children[1] as DirectoryNode;
    const file2 = folderNode.children[0] as FileNode;
    expect(tree.children.length).toBe(2);
    expect(file1.name).toBe('file1.txt');
    expect(folderNode.name).toBe('folder');
    expect(file2.name).toBe('file2.txt');
  });

  it('should add multiple files to existing directory', () => {
    const paths = ['folder/subfolder/file1.txt', 'folder/subfolder/file2.txt'];
    const tree = buildTree(paths);
    const folderNode = tree.children[0] as DirectoryNode;
    const subfolderNode = folderNode.children[0] as DirectoryNode;
    const file1 = subfolderNode.children[0] as FileNode;
    const file2 = subfolderNode.children[1] as FileNode;
    expect(folderNode.name).toBe('folder');
    expect(subfolderNode.name).toBe('subfolder');
    expect(subfolderNode.children.length).toBe(2);
    expect(file1.name).toBe('file1.txt');
    expect(file2.name).toBe('file2.txt');
  });
});
