// src/components/FlowCanvas.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
  useStoreApi,
  Connection,
  Node,
  Edge,
  EdgeProps,
  BaseEdge,
  getSmoothStepPath,
} from 'reactflow';
import 'reactflow/dist/style.css';

import KougarNode from './NodeTypes/KougarNode';
import DocumentSidebar from './sidebars/DocumentSidebar';
import ClientFormSidebar from './sidebars/ClientFormSidebar';
import { kougarNodes, kougarEdges, parentChildMap } from '../data/mockFlowData';

const NeonEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <style>{`
        @keyframes neonDash {
          to { stroke-dashoffset: 1000; }
        }
      `}</style>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: '#00f0ff',
          strokeWidth: 6,
          strokeOpacity: 0.2,
          filter: 'drop-shadow(0 0 6px #00f0ff)',
        }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd="url(#arrowhead)"
        style={{
          stroke: '#00f0ff',
          strokeWidth: 2,
          strokeDasharray: '12,6',
          animation: 'neonDash 3s linear infinite',
          filter: 'drop-shadow(0 0 4px #00f0ff)',
        }}
      />
    </>
  );
};

const nodeTypes = { kougar: KougarNode };
const edgeTypes = { custom: NeonEdge };

type Props = {
  toggleSidebar: () => void;     // left sidebar toggle (from MainLayout)
  sidebarOpen: boolean;          // left sidebar state (from MainLayout)
};

function FlowCanvasInner({ toggleSidebar, sidebarOpen }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentSidebarType, setCurrentSidebarType] =
    useState<'document' | 'client-form' | null>(null);
  const [uploadTargetNode, setUploadTargetNode] = useState<Node | null>(null);

  const reactFlow = useReactFlow();
  const store = useStoreApi();

  // container ref to measure actual render area (accounts for sidebars & header)
  const canvasRef = useRef<HTMLDivElement | null>(null);
  // when a node toggles expansion/collapse, we remember it and fit to its subtree after layout renders
  const pendingFitToSubtreeRef = useRef<string | null>(null);

  const autoLayout = (): { nodes: Node[]; edges: Edge[] } => {
    const visible = new Set<string>(['root']);
    const output: Node[] = [];
    const nodeMap = new Map(kougarNodes.map((n) => [n.id, { ...n, type: 'kougar' }]));
    const spacingX = 300;
    const spacingY = 80;
    const yTracker: number[] = [];

    const layoutTree = (id: string, depth: number): number => {
      const node = nodeMap.get(id);
      if (!node) return 0;

      const children = expanded.has(id) ? parentChildMap[id] || [] : [];
      if (!yTracker[depth]) yTracker[depth] = 0;

      const childYs: number[] = [];
      for (const childId of children) {
        const childY = layoutTree(childId, depth + 1);
        childYs.push(childY);
      }

      let nodeY;
      if (childYs.length > 0) {
        const minY = Math.min(...childYs);
        const maxY = Math.max(...childYs);
        nodeY = (minY + maxY) / 2;
      } else {
        nodeY = yTracker[depth];
        yTracker[depth] += spacingY;
      }

      node.position = { x: depth * spacingX, y: nodeY };
      yTracker[depth] = Math.max(yTracker[depth], nodeY + spacingY);
      visible.add(id);
      return node.position.y;
    };

    layoutTree('root', 0);

    for (const [, node] of nodeMap.entries()) {
      if (visible.has(node.id)) output.push({ ...node });
    }

    const visibleIds = new Set(output.map((n) => n.id));
    const visibleEdges = kougarEdges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((e) => ({ ...e, type: 'custom' }));

    return { nodes: output, edges: visibleEdges };
  };

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // --- helpers: bounds & fitting ------------------------------------------------

  // get visible nodes that have dimensions measured
  const getMeasuredNodes = () =>
    store.getState().getNodes().filter((n) => n.width && n.height);

  // compute bounds for a set of nodes (in RF coordinates)
  const getBounds = (ns: Node[]) => {
    const xs = ns.map((n) => n.position.x);
    const ys = ns.map((n) => n.position.y);
    const rs = ns.map((n) => n.position.x + (n.width ?? 0));
    const bs = ns.map((n) => n.position.y + (n.height ?? 0));
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...rs);
    const maxY = Math.max(...bs);
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  };

  // smoothly center & zoom so given nodes fit inside the actual canvas
  const fitToNodesSmooth = (ids?: string[], padding = 100) => {
    const all = getMeasuredNodes();
    const target = ids?.length ? all.filter((n) => ids.includes(n.id)) : all;
    if (!target.length) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    const canvasW = Math.max(1, rect?.width ?? window.innerWidth);
    const canvasH = Math.max(1, (rect?.height ?? window.innerHeight) - 56); // minus top bar
    const { minX, minY, w, h } = getBounds(target);

    // add padding to content size
    const paddedW = w + padding * 2;
    const paddedH = h + padding * 2;

    // compute zoom that fits content inside canvas (cap at 2)
    const zoom = Math.min(canvasW / paddedW, canvasH / paddedH, 2);

    // center of content in flow coords
    const centerX = minX + w / 2;
    const centerY = minY + h / 2;

    reactFlow.setCenter(centerX, centerY, {
      zoom: Math.max(zoom, 0.5),
      duration: 600,
      easing: (t) => t * (2 - t),
    });
  };

  // recursively get subtree ids from a node, honoring current expansion state
  const getSubtreeIds = (id: string, acc = new Set<string>()) => {
    acc.add(id);
    if (!expanded.has(id)) return acc;
    const children = parentChildMap[id] || [];
    for (const c of children) getSubtreeIds(c, acc);
    return acc;
  };

  // --- effects: layout & auto-fit ----------------------------------------------

  // Run layout on expansion changes
  useEffect(() => {
    const { nodes, edges } = autoLayout();
    setNodes(nodes);
    setEdges(edges);
  }, [expanded]);

  // After nodes change (post-layout), perform any pending fit (subtree), else fit on first mount
  const firstMount = useRef(true);
  useEffect(() => {
    // wait a frame so RF measures node widths/heights
    const id = requestAnimationFrame(() => {
      const targetId = pendingFitToSubtreeRef.current;
      if (targetId) {
        const ids = Array.from(getSubtreeIds(targetId));
        fitToNodesSmooth(ids, 120);
        pendingFitToSubtreeRef.current = null;
      } else if (firstMount.current) {
        fitToNodesSmooth(undefined, 120);
        firstMount.current = false;
      }
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Refit when either sidebar changes layout (left from MainLayout, right from sidebars here)
  useEffect(() => {
    const id = setTimeout(() => fitToNodesSmooth(undefined, 120), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen, currentSidebarType]);

  // Refit on resize
  useEffect(() => {
    const onResize = () => fitToNodesSmooth(undefined, 120);
    const debounced = () => {
      clearTimeout((debounced as any)._t);
      (debounced as any)._t = setTimeout(onResize, 150);
    };
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ----------------------------------------------------------------

  const onConnect = (params: Connection) => console.log('Connected:', params);

  const onNodeClick = (_: any, node: Node) => {
    const label = node.data?.label?.toLowerCase();

    if (label?.includes('client inquiry')) {
      setUploadTargetNode(node);
      setCurrentSidebarType('client-form');
    } else if (label?.includes('documents:')) {
      setUploadTargetNode(node);
      setCurrentSidebarType('document');
    } else {
      setCurrentSidebarType(null);
      setUploadTargetNode(null);
    }

    // toggle expand/collapse if the node has children
    if (parentChildMap[node.id]) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.has(node.id) ? next.delete(node.id) : next.add(node.id);
        return next;
      });
      // after layout finishes, fit to this node's subtree
      pendingFitToSubtreeRef.current = node.id;
    }

    setSelectedNodeId(node.id);
  };

  const handleRecenterAll = () => fitToNodesSmooth(undefined, 120);

  // --- Render ------------------------------------------------------------------

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <svg className="absolute w-0 h-0">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" />
          </marker>
        </defs>
      </svg>

      <div className="absolute top-0 left-0 w-full z-10 px-4 py-3 bg-gray-950/80 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between">
        <div className="text-md font-semibold tracking-wide">
          📁 Document Workflow by Project Stage
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRecenterAll}
            className="text-xs px-3 py-1.5 bg-white text-gray-800 rounded hover:bg-gray-200 transition"
          >
            Recenter
          </button>
          <button
            onClick={toggleSidebar}
            className="text-xs px-3 py-1.5 bg-white text-gray-800 rounded hover:bg-gray-200 transition"
          >
            {sidebarOpen ? '⛶ Fullscreen' : '📂 Show Sidebar'}
          </button>
        </div>
      </div>

      {/* Canvas wrapper we measure for accurate fitting */}
      <div
        ref={canvasRef}
        className={`absolute inset-0 top-[56px] transition-all ${currentSidebarType ? 'mr-96' : ''}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          panOnScroll
          zoomOnScroll
          panOnDrag
          minZoom={0.5}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {currentSidebarType === 'document' && uploadTargetNode && (
        <DocumentSidebar nodeId={uploadTargetNode.id} onClose={() => setCurrentSidebarType(null)} />
      )}

      {currentSidebarType === 'client-form' && (
        <ClientFormSidebar onClose={() => setCurrentSidebarType(null)} />
      )}
    </div>
  );
}

export default function FlowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
