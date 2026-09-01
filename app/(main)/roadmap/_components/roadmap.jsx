"use client";

import React, { useCallback, useState, useMemo } from "react";
import ReactFlow, { Controls, Background, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const levelColors = {
  Fundamentals: "#60A5FA",
  Core: "#34D399",
  Advanced: "#FBBF24",
  Specialization: "#F472B6",
};

// --- Dagre graph setup ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

function getLayoutedElements(nodes, edges, direction = "TB") {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id);
    node.position = { x: x - nodeWidth / 2, y: y - nodeHeight / 2 };
  });

  return { nodes, edges };
}

// --- Custom Node component ---
function CustomNode({ data }) {
  return (
    <div
      className="rounded-xl text-white shadow-md border p-3 flex flex-col justify-center items-center"
      style={{
        backgroundColor: levelColors[data.level] || "#1F2937",
        borderColor: "#374151",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#6B7280" }} />
      <h4 className="font-semibold text-sm text-center">{data.label}</h4>
      <p className="text-xs text-gray-200">{data.level}</p>
      <Handle type="source" position={Position.Bottom} style={{ background: "#6B7280" }} />
    </div>
  );
}

export default function CareerRoadmap({ roadmap }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    if (window.innerWidth < 768) {
      setIsMobileDialogOpen(true);
    }
  }, []);

  // --- Build nodes ---
  const rawNodes = useMemo(() => {
    return (
      roadmap?.initialNodes?.map((node, index) => ({
        id: node.id?.toString() || `node-${index}`,
        type: "custom",
        data: {
          label: node.data?.title || node.data?.label || `Node ${index + 1}`,
          description: node.data?.description || "",
          link: node.data?.link || null,
          level: node.data?.level || "Fundamentals",
        },
        position: { x: 0, y: 0 },
      })) || []
    );
  }, [roadmap]);

  // --- Build edges ---
  const rawEdges = useMemo(() => {
    return (
      roadmap?.initialEdges?.map((edge, i) => ({
        id: edge.id?.toString() || `edge-${i}`,
        source: edge.source?.toString(),
        target: edge.target?.toString(),
        type: "smoothstep",
        animated: true,
        style: { stroke: "#9CA3AF" },
      })) || []
    );
  }, [roadmap]);

  // --- Layout with Dagre ---
  const { nodes, edges } = useMemo(() => {
    return getLayoutedElements([...rawNodes], [...rawEdges], "TB");
  }, [rawNodes, rawEdges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-72 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-2">
          {roadmap?.roadmapTitle || "Career Roadmap"}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {roadmap?.description || "No description available."}
        </p>

        {selectedNode ? (
          <div className="p-4 bg-gray-800 rounded-xl shadow-md">
            <h3 className="font-semibold text-white mb-2">
              {selectedNode.data?.label || "Node Details"}
            </h3>
            <p className="text-sm text-gray-300 mb-2">
              {selectedNode.data?.description || "No description available."}
            </p>
            {selectedNode.data?.link && (
              <a
                href={selectedNode.data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-sm underline"
              >
                Learn more →
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Click on a node to see details here.
          </p>
        )}
      </div>

      {/* Flow Area */}
      <div className="flex-1 bg-gray-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="bg-gray-950"
        >
          <Controls />
          <Background gap={16} color="#374151" />
        </ReactFlow>
      </div>

      {/* Mobile Dialog */}
      <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
        <DialogContent className="bg-gray-900 text-gray-100 rounded-xl">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>
              {selectedNode?.data?.label || "Node Details"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-300 mt-2">
            {selectedNode?.data?.description || "No description available."}
          </DialogDescription>
          {selectedNode?.data?.link && (
            <a
              href={selectedNode.data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm underline mt-3 block"
            >
              Learn more →
            </a>
          )}
          <div className="flex justify-center mt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700 px-6 text-white rounded-lg"
              onClick={() => setIsMobileDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
