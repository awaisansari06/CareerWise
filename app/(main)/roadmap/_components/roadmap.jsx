"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Route,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
  Briefcase,
  BookOpen,
  Info,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Compass,
  ListTree,
  GitBranch,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveRoadMap } from "@/actions/road-map";

// Stage Tier Color Mapping & Detailed Context
const stageConfig = {
  Fundamentals: {
    label: "Fundamentals",
    badgeVariant: "info",
    dotColor: "#38bdf8",
    nodeBorder: "border-sky-500/40 hover:border-sky-500/80",
    nodeBorderSelected: "border-sky-500 ring-2 ring-sky-500/50 shadow-sky-500/20",
    nodeBg: "bg-sky-500/10 dark:bg-sky-500/15",
    nodeText: "text-sky-700 dark:text-sky-300",
    description: "Core conceptual foundations, syntax, and essential environment setup.",
  },
  Core: {
    label: "Core",
    badgeVariant: "success",
    dotColor: "#34d399",
    nodeBorder: "border-emerald-500/40 hover:border-emerald-500/80",
    nodeBorderSelected: "border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-500/20",
    nodeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    nodeText: "text-emerald-700 dark:text-emerald-300",
    description: "Industry-standard methodologies, primary frameworks, and production patterns.",
  },
  Advanced: {
    label: "Advanced",
    badgeVariant: "warning",
    dotColor: "#fbbf24",
    nodeBorder: "border-amber-500/40 hover:border-amber-500/80",
    nodeBorderSelected: "border-amber-500 ring-2 ring-amber-500/50 shadow-amber-500/20",
    nodeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    nodeText: "text-amber-700 dark:text-amber-300",
    description: "Complex architecture, performance optimization, and distributed systems.",
  },
  Specialization: {
    label: "Specialization",
    badgeVariant: "neutral",
    dotColor: "#c084fc",
    nodeBorder: "border-purple-500/40 hover:border-purple-500/80",
    nodeBorderSelected: "border-purple-500 ring-2 ring-purple-500/50 shadow-purple-500/20",
    nodeBg: "bg-purple-500/10 dark:bg-purple-500/15",
    nodeText: "text-purple-700 dark:text-purple-300",
    description: "Niche domain leadership, specialized tooling, and advanced technical innovation.",
  },
};

// --- Dagre Auto-Layout Setup ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Tuned node dimensions for maximum visual clarity
const nodeWidth = 280;
const nodeHeight = 108;

function getLayoutedElements(nodes, edges, direction = "TB") {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 75 });

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

// --- Custom Node Component ---
function CustomNode({ data, selected }) {
  const stage = stageConfig[data.level] || stageConfig.Fundamentals;

  return (
    <div
      className={`group relative w-[280px] min-h-[106px] rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none backdrop-blur-md flex flex-col justify-between ${
        selected
          ? `${stage.nodeBorderSelected} bg-card shadow-xl scale-[1.03]`
          : `${stage.nodeBorder} bg-card/95 hover:bg-card shadow-sm hover:shadow-lg hover:scale-[1.01]`
      }`}
    >
      {/* Target connection point */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background hover:!bg-primary transition-colors"
      />

      {/* Top Meta: Stage Pill + Sequence Number */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: stage.dotColor }}
          />
          <span className={`text-[11px] font-bold uppercase tracking-wider ${stage.nodeText}`}>
            {data.level || "Milestone"}
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
          Step #{data.index !== undefined ? data.index + 1 : "•"}
        </span>
      </div>

      {/* Milestone Title */}
      <div className="py-2 flex items-center justify-center text-center">
        <h4 className="font-bold text-sm sm:text-[15px] text-foreground leading-snug line-clamp-2 tracking-tight">
          {data.label}
        </h4>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
        <span className="truncate max-w-[200px]">
          {data.link ? "Resource Available" : "Milestone Objective"}
        </span>
        {data.link && <ExternalLink className="h-3 w-3 text-primary shrink-0" />}
      </div>

      {/* Source connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background hover:!bg-primary transition-colors"
      />
    </div>
  );
}

// Inner Canvas Component to leverage ReactFlow hooks
function RoadmapCanvas({
  nodes,
  edges,
  nodeTypes,
  onNodeClick,
  isDark,
  selectedNodeId,
}) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleResetView = useCallback(() => {
    fitView({ padding: 0.12, duration: 400 });
  }, [fitView]);

  return (
    <div className="h-[600px] sm:h-[680px] lg:h-[760px] w-full relative bg-background/50">
      {/* Floating Canvas Quick-Controls Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border/80 rounded-lg p-1 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleResetView}
          title="Fit Graph to View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.12, includeHiddenNodes: false }}
        minZoom={0.25}
        maxZoom={1.75}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
        className="w-full h-full"
      >
        <Controls
          className="!bg-card !border-border !shadow-md !rounded-lg !text-foreground"
          showInteractive={false}
        />
        <Background
          gap={24}
          size={1.5}
          color={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"}
        />
      </ReactFlow>
    </div>
  );
}

export default function CareerRoadmap({ roadmap }) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  // Format Raw Nodes with sequence indexing
  const rawNodes = useMemo(() => {
    return (
      roadmap?.initialNodes?.map((node, index) => ({
        id: node.id?.toString() || `node-${index}`,
        type: "custom",
        data: {
          index,
          label: node.data?.title || node.data?.label || `Milestone ${index + 1}`,
          description: node.data?.description || "",
          link: node.data?.link || null,
          level: node.data?.level || "Fundamentals",
        },
        position: { x: 0, y: 0 },
      })) || []
    );
  }, [roadmap]);

  // Format Edges with Arrowhead Markers and Active Highlighting
  const rawEdges = useMemo(() => {
    const selectedId = selectedNode?.id;

    return (
      roadmap?.initialEdges?.map((edge, i) => {
        const sourceStr = edge.source?.toString();
        const targetStr = edge.target?.toString();
        const isConnected =
          selectedId && (sourceStr === selectedId || targetStr === selectedId);

        const strokeColor = isConnected
          ? isDark
            ? "#38bdf8"
            : "#0284c7"
          : isDark
          ? "#475569"
          : "#94a3b8";

        return {
          id: edge.id?.toString() || `edge-${i}`,
          source: sourceStr,
          target: targetStr,
          type: "smoothstep",
          animated: isConnected || !selectedId,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: strokeColor,
          },
          style: {
            stroke: strokeColor,
            strokeWidth: isConnected ? 2.5 : 1.75,
            opacity: selectedId && !isConnected ? 0.45 : 1,
            transition: "all 0.2s ease",
          },
        };
      }) || []
    );
  }, [roadmap, isDark, selectedNode]);

  // Dagre Layout
  const { nodes, edges } = useMemo(() => {
    return getLayoutedElements([...rawNodes], [...rawEdges], "TB");
  }, [rawNodes, rawEdges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Node selection callback
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileDialogOpen(true);
    }
  }, []);

  // Direct selection by node ID (for prerequisite / next milestone clicks)
  const handleSelectById = useCallback(
    (targetId) => {
      const found = nodes.find((n) => n.id === targetId);
      if (found) {
        setSelectedNode(found);
      }
    },
    [nodes]
  );

  // Compute Real Prerequisites (Incoming nodes)
  const prerequisites = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.target === selectedNode.id)
      .map((e) => nodes.find((n) => n.id === e.source))
      .filter(Boolean);
  }, [selectedNode, edges, nodes]);

  // Compute Real Next Milestones (Outgoing nodes)
  const nextMilestones = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.source === selectedNode.id)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter(Boolean);
  }, [selectedNode, edges, nodes]);

  // Stage breakdown counts
  const stageCounts = useMemo(() => {
    const counts = {
      Fundamentals: 0,
      Core: 0,
      Advanced: 0,
      Specialization: 0,
    };
    rawNodes.forEach((n) => {
      const lvl = n.data?.level;
      if (counts[lvl] !== undefined) {
        counts[lvl]++;
      } else {
        counts.Fundamentals++;
      }
    });
    return counts;
  }, [rawNodes]);

  // Regenerate Roadmap handler
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await saveRoadMap({ forceRegenerate: true });
      toast.success("Roadmap refreshed with latest industry standards!");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to regenerate roadmap");
    } finally {
      setIsRegenerating(false);
    }
  };

  const selectedStage = selectedNode
    ? stageConfig[selectedNode.data?.level] || stageConfig.Fundamentals
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Route className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {roadmap?.roadmapTitle || "Career Learning Roadmap"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {roadmap?.description ||
              "Sequential mastery path designed to advance your technical capabilities from core foundations to specialized domain leadership."}
          </p>
        </div>

        {/* Header Action & Badges */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {roadmap?.industry && (
            <Badge variant="outline" className="gap-1 text-xs font-medium py-1">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span>{roadmap.industry}</span>
            </Badge>
          )}

          {roadmap?.duration && (
            <Badge variant="neutral" className="gap-1 text-xs font-medium py-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{roadmap.duration}</span>
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="gap-1.5 text-xs shadow-xs font-medium"
            title="Regenerate roadmap with AI"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Regenerate Path</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stage Progression Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(stageConfig).map(([key, stage]) => {
          const count = stageCounts[key] || 0;
          return (
            <div
              key={key}
              className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 flex items-center justify-between shadow-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.dotColor }}
                  />
                  <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground hidden sm:block truncate max-w-[140px]">
                  {stage.description}
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Roadmap Workspace */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* ReactFlow Interactive Canvas Container (8 cols on lg, 7 cols on xl) */}
        <Card className="lg:col-span-8 xl:col-span-8 border-border/80 bg-card/50 backdrop-blur-sm overflow-hidden shadow-md">
          <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between bg-card/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Compass className="h-4 w-4 text-primary" />
              <span>Interactive Skill Graph</span>
              <span className="text-muted-foreground font-normal">
                ({nodes.length} Milestones)
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Click node to inspect • Arrows indicate progression
            </span>
          </CardHeader>

          {/* ReactFlow Provider & Canvas with tuned scale */}
          <ReactFlowProvider>
            <RoadmapCanvas
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              isDark={isDark}
              selectedNodeId={selectedNode?.id}
            />
          </ReactFlowProvider>
        </Card>

        {/* Desktop Side Details Panel (4 cols on lg, 4 cols on xl) */}
        <Card className="hidden lg:block lg:col-span-4 xl:col-span-4 border-border/80 bg-card/70 backdrop-blur-sm shadow-md sticky top-24">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span>Milestone Details</span>
              </span>
              {selectedNode && (
                <Badge variant={selectedStage.badgeVariant} className="text-xs font-semibold gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedStage.dotColor }}
                  />
                  <span>{selectedNode.data?.level}</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {selectedNode
                ? "Syllabus, requirements & dependency map"
                : "Select any milestone node on the canvas to inspect"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {selectedNode ? (
              <div className="space-y-4">
                {/* Milestone Title & Index */}
                <div>
                  <div className="text-[11px] font-mono text-muted-foreground mb-1">
                    Milestone #{(selectedNode.data?.index ?? 0) + 1} of {nodes.length}
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {selectedNode.data?.label}
                  </h3>
                </div>

                {/* Stage Purpose */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Stage Focus: </span>
                  {selectedStage?.description}
                </div>

                {/* Description & Learning Objective */}
                <div className="space-y-1.5 rounded-xl border border-border/60 bg-card p-4 text-xs sm:text-sm leading-relaxed text-foreground/90 shadow-xs">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Learning Objective</span>
                  </h4>
                  <p className="pt-1">
                    {selectedNode.data?.description ||
                      "Mastery criteria and implementation guidelines for this technical milestone."}
                  </p>
                </div>

                {/* Prerequisites (Real Incoming Edges) */}
                {prerequisites.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ArrowLeft className="h-3.5 w-3.5 text-sky-500" />
                      <span>Prerequisites ({prerequisites.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {prerequisites.map((pNode) => (
                        <button
                          key={pNode.id}
                          onClick={() => handleSelectById(pNode.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-border/80 bg-muted/40 hover:bg-accent hover:border-primary/50 text-foreground transition-all text-left"
                          title="Click to jump to this prerequisite"
                        >
                          <span className="truncate max-w-[160px] font-medium">
                            {pNode.data.label}
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Milestones (Real Outgoing Edges) */}
                {nextMilestones.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Leads Into ({nextMilestones.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {nextMilestones.map((nNode) => (
                        <button
                          key={nNode.id}
                          onClick={() => handleSelectById(nNode.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-border/80 bg-muted/40 hover:bg-accent hover:border-primary/50 text-foreground transition-all text-left"
                          title="Click to jump to this next milestone"
                        >
                          <span className="truncate max-w-[160px] font-medium">
                            {nNode.data.label}
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Link if provided */}
                {selectedNode.data?.link && (
                  <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs font-medium mt-2">
                    <a
                      href={selectedNode.data.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Explore Curated Learning Resource</span>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              /* Polished Empty State */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">
                    Select a Milestone
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Click any node on the roadmap canvas to inspect its syllabus, objectives, prerequisites, and subsequent progression steps.
                  </p>
                </div>

                <div className="w-full border-t border-border/60 pt-4 mt-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Total Progression Milestones</span>
                    <span className="font-mono font-bold text-foreground">{nodes.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Skill Progression Tiers</span>
                    <span className="font-mono font-bold text-foreground">4 Levels</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile & Tablet Modal Dialog for Node Details */}
      <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
        <DialogContent className="max-w-md p-6 bg-card border-border">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {selectedStage && (
                <Badge variant={selectedStage.badgeVariant} className="text-xs font-semibold gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedStage.dotColor }}
                  />
                  <span>{selectedNode?.data?.level}</span>
                </Badge>
              )}
              {selectedNode && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  Milestone #{(selectedNode.data?.index ?? 0) + 1} of {nodes.length}
                </span>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-foreground leading-snug">
              {selectedNode?.data?.label || "Milestone Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Learning Objective */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Learning Objective</span>
              </h4>
              <p>
                {selectedNode?.data?.description ||
                  "Detailed guidance and mastery requirements for this milestone in your career journey."}
              </p>
            </div>

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3 text-sky-500" />
                  <span>Prerequisites</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {prerequisites.map((pNode) => (
                    <button
                      key={pNode.id}
                      onClick={() => handleSelectById(pNode.id)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border/80 bg-muted/40 text-foreground"
                    >
                      {pNode.data.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Next Milestones */}
            {nextMilestones.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-emerald-500" />
                  <span>Next Steps</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {nextMilestones.map((nNode) => (
                    <button
                      key={nNode.id}
                      onClick={() => handleSelectById(nNode.id)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border/80 bg-muted/40 text-foreground"
                    >
                      {nNode.data.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* External Link */}
            {selectedNode?.data?.link && (
              <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs">
                <a
                  href={selectedNode.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Explore Learning Resource</span>
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                </a>
              </Button>
            )}

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => setIsMobileDialogOpen(false)}
            >
              Back to Roadmap Canvas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
