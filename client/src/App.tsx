import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import MarkdownInput from './components/MarkdownInput';
import SimpleTreeEditor from './components/SimpleTreeEditor';
import MarkdownPreview from './components/MarkdownPreview';
import ChunkExporter from './components/ChunkExporter';
import { TreeNode, ProcessingState } from './types';
import { parseMarkdownToTree } from './utils/markdownParser';
import { FileText, TreePine, Eye, Download, Github } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'export'>('upload');
  const [originalMarkdown, setOriginalMarkdown] = useState<string>('');
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isUploading: false,
    isProcessing: false,
    error: null,
    success: false
  });

  const handleFileProcessed = useCallback((markdown: string, filename: string) => {
    setOriginalMarkdown(markdown);
    setOriginalFilename(filename);
    
    // Parse markdown to tree
    const parsedTree = parseMarkdownToTree(markdown);
    setTree(parsedTree);
    setCurrentStep('edit');
    
    // Reset processing state after a delay
    setTimeout(() => {
      setProcessingState({
        isUploading: false,
        isProcessing: false,
        error: null,
        success: false
      });
    }, 2000);
  }, []);

  const handleTreeChange = useCallback((newTree: TreeNode[]) => {
    setTree(newTree);
  }, []);

  const handleNodeSelect = useCallback((node: TreeNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleContentChange = useCallback((nodeId: string, newContent: string) => {
    const updateNodeContent = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, content: newContent };
        }
        if (node.children) {
          return { ...node, children: updateNodeContent(node.children) };
        }
        return node;
      });
    };

    const newTree = updateNodeContent(tree);
    setTree(newTree);
    
    // Update selected node to reflect changes
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, content: newContent });
    }
  }, [tree, selectedNode]);

  const handleReset = useCallback(() => {
    setCurrentStep('upload');
    setOriginalMarkdown('');
    setOriginalFilename('');
    setTree([]);
    setSelectedNode(null);
    setProcessingState({
      isUploading: false,
      isProcessing: false,
      error: null,
      success: false
    });
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Lumberjack
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Chop documents into perfect chunks for vector databases
              </p>
            </div>

            <div className="space-y-8">
              <FileUpload
                onFileProcessed={handleFileProcessed}
                processingState={processingState}
                setProcessingState={setProcessingState}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <MarkdownInput onMarkdownProcessed={handleFileProcessed} />
            </div>
          </div>
        );

      case 'edit':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Editing: {originalFilename}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Select sections to preview • Scroll to see all sections
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => setCurrentStep('export')}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                  >
                    Export Chunks
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-grow flex min-h-0">
              <div className="w-1/2 border-r border-gray-200">
                <SimpleTreeEditor
                  initialTree={tree}
                  onTreeChange={handleTreeChange}
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNode?.id}
                />
              </div>
              <div className="w-1/2">
                <MarkdownPreview
                  tree={tree}
                  selectedNode={selectedNode}
                  originalMarkdown={originalMarkdown}
                  originalFilename={originalFilename}
                  onContentChange={handleContentChange}
                />
              </div>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Export Chunks: {originalFilename}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configure chunking options and export your processed document
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentStep('edit')}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Back to Editor
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-grow min-h-0">
              <ChunkExporter tree={tree} originalFilename={originalFilename} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lumberjack</h1>
                <p className="text-sm text-gray-600">Document Hierarchy Tree Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Step indicators */}
              <div className="flex items-center space-x-2">
                <div className={`
                  flex items-center space-x-2 px-3 py-1 rounded-full text-sm
                  ${currentStep === 'upload' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  <FileText className="h-4 w-4" />
                  <span>Upload</span>
                </div>
                
                <div className={`
                  flex items-center space-x-2 px-3 py-1 rounded-full text-sm
                  ${currentStep === 'edit' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  <TreePine className="h-4 w-4" />
                  <span>Edit</span>
                </div>
                
                <div className={`
                  flex items-center space-x-2 px-3 py-1 rounded-full text-sm
                  ${currentStep === 'export' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </div>
              </div>

              <a
                href="https://github.com/pandaxbacon/AutoChunker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {currentStep === 'upload' ? (
          <div className="py-12">
            {renderStepContent()}
          </div>
        ) : (
          <div className="h-[calc(100vh-140px)] flex flex-col">
            {renderStepContent()}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
