"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  Handle,
  Position,
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
  RotateCcw,
  Loader2,
  Maximize2,
  HelpCircle,
  Compass,
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

// Stage Tier Color Mapping & Styles
const stageConfig = {
  Fundamentals: {
    label: "Fundamentals",
    badgeVariant: "info",
    dotColor: "#38bdf8",
    nodeBorder: "border-sky-500/40 hover:border-sky-500",
    nodeBg: "bg-sky-500/10 dark:bg-sky-500/15",
    nodeText: "text-sky-700 dark:text-sky-300",
  },
  Core: {
    label: "Core",
    badgeVariant: "success",
    dotColor: "#34d399",
    nodeBorder: "border-emerald-500/40 hover:border-emerald-500",
    nodeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    nodeText: "text-emerald-700 dark:text-emerald-300",
  },
  Advanced: {
    label: "Advanced",
    badgeVariant: "warning",
    dotColor: "#fbbf24",
    nodeBorder: "border-amber-500/40 hover:border-amber-500",
    nodeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    nodeText: "text-amber-700 dark:text-amber-300",
  },
  Specialization: {
    label: "Specialization",
    badgeVariant: "neutral",
    dotColor: "#c084fc",
    nodeBorder: "border-purple-500/40 hover:border-purple-500",
    nodeBg: "bg-purple-500/10 dark:bg-purple-500/15",
    nodeText: "text-purple-700 dark:text-purple-300",
  },
};

// --- Dagre Auto-Layout Setup ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 240;
const nodeHeight = 90;

function getLayoutedElements(nodes, edges, direction = "TB") {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 60 });

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
      className={`group relative w-[240px] rounded-xl border p-3.5 transition-all duration-150 cursor-pointer select-none backdrop-blur-md ${
        selected
          ? "border-primary bg-card ring-2 ring-primary shadow-xl scale-[1.03]"
          : `${stage.nodeBorder} bg-card/90 hover:bg-card shadow-sm hover:shadow-md`
      }`}
    >
      {/* Target connection point */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-1.5">
        {/* Stage Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: stage.dotColor }}
          />
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${stage.nodeText}`}>
            {data.level || "Milestone"}
          </span>
        </div>

        {/* Milestone Title */}
        <h4 className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-2">
          {data.label}
        </h4>
      </div>

      {/* Source connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-muted-foreground !border-2 !border-background"
      />
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

  // Node selection callback
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileDialogOpen(true);
    }
  }, []);

  // Format Nodes
  const rawNodes = useMemo(() => {
    return (
      roadmap?.initialNodes?.map((node, index) => ({
        id: node.id?.toString() || `node-${index}`,
        type: "custom",
        data: {
          label: node.data?.title || node.data?.label || `Milestone ${index + 1}`,
          description: node.data?.description || "",
          link: node.data?.link || null,
          level: node.data?.level || "Fundamentals",
        },
        position: { x: 0, y: 0 },
      })) || []
    );
  }, [roadmap]);

  // Format Edges
  const rawEdges = useMemo(() => {
    return (
      roadmap?.initialEdges?.map((edge, i) => ({
        id: edge.id?.toString() || `edge-${i}`,
        source: edge.source?.toString(),
        target: edge.target?.toString(),
        type: "smoothstep",
        animated: true,
        style: {
          stroke: isDark ? "#475569" : "#94a3b8",
          strokeWidth: 2,
        },
      })) || []
    );
  }, [roadmap, isDark]);

  // Dagre Layout
  const { nodes, edges } = useMemo(() => {
    return getLayoutedElements([...rawNodes], [...rawEdges], "TB");
  }, [rawNodes, rawEdges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

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
            className="gap-1.5 text-xs shadow-xs"
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
              className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stage.dotColor }}
                />
                <span className="text-xs font-medium text-foreground">{stage.label}</span>
              </div>
              <span className="text-xs font-bold font-mono text-muted-foreground">
                {count} {count === 1 ? "node" : "nodes"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Roadmap Workspace */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* ReactFlow Interactive Canvas Container (2/3 width on desktop) */}
        <Card className="lg:col-span-2 border-border/80 bg-card/50 backdrop-blur-sm overflow-hidden shadow-md">
          <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between bg-card/80">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Compass className="h-4 w-4 text-primary" />
              <span>Interactive Skill Graph ({nodes.length} Milestones)</span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Drag to pan • Scroll to zoom • Click node for details
            </span>
          </CardHeader>

          {/* Clean canvas container without h-screen */}
          <div className="h-[550px] sm:h-[620px] lg:h-[680px] w-full relative bg-background/50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              minZoom={0.2}
              maxZoom={1.5}
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
        </Card>

        {/* Desktop Side Details Panel (1/3 width on desktop) */}
        <Card className="hidden lg:block border-border/80 bg-card/70 backdrop-blur-sm shadow-md sticky top-24">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span>Milestone Details</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Comprehensive objectives and learning context
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {selectedNode ? (
              <div className="space-y-4">
                {/* Stage Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant={selectedStage.badgeVariant} className="text-xs font-semibold gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: selectedStage.dotColor }}
                    />
                    <span>{selectedNode.data?.level}</span>
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Node ID: {selectedNode.id}
                  </span>
                </div>

                {/* Milestone Title */}
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {selectedNode.data?.label}
                  </h3>
                </div>

                {/* Description */}
                <div className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Learning Objective</span>
                  </h4>
                  <p>
                    {selectedNode.data?.description ||
                      "Detailed guidance and mastery requirements for this milestone in your career journey."}
                  </p>
                </div>

                {/* External Link if provided */}
                {selectedNode.data?.link ? (
                  <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs font-medium">
                    <a
                      href={selectedNode.data.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Explore Curated Resource</span>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center italic">
                    Sequential milestone ready for independent review
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground space-y-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No Milestone Selected</p>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Click any node on the roadmap graph to inspect its syllabus, learning objectives, and stage level.
                  </p>
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
            <div className="flex items-center gap-2 mb-1.5">
              {selectedStage && (
                <Badge variant={selectedStage.badgeVariant} className="text-xs font-semibold gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedStage.dotColor }}
                  />
                  <span>{selectedNode?.data?.level}</span>
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-foreground leading-snug">
              {selectedNode?.data?.label || "Milestone Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Learning Objective</span>
              </h4>
              <p>
                {selectedNode?.data?.description ||
                  "Detailed guidance and mastery requirements for this milestone in your career journey."}
              </p>
            </div>

            {selectedNode?.data?.link && (
              <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs">
                <a
                  href={selectedNode.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Explore Learning Resource</span>
                  <ExternalLink className="h-3.5 w-3.5" />
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
