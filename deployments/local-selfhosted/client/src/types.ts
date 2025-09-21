export interface TreeNode {
  id: string;
  title: string;
  level: number;
  content: string;
  children?: TreeNode[];
  parent?: string;
  droppable?: boolean;
}

export interface NodeModel {
  id: string;
  parent: string;
  text: string;
  droppable?: boolean;
  data?: {
    level: number;
    content: string;
    originalIndex: number;
  };
}

export interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  level: number;
  tokenCount: number;
  parentId?: string;
}

export interface ProcessingState {
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
  success: boolean;
}
