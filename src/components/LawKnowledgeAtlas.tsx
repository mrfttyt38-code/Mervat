import React, { useState, useMemo } from 'react';
import {
  Scale,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GitBranch,
  ArrowLeftRight,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { LEGAL_MAXIMS, LAW_BRANCHES } from '../data/legalTaxonomy';
import { MIND_MAP_NODES, MIND_MAP_EDGES, MindMapNode, MindMapEdge } from '../data/legalMindMap';
import { LawBranch } from '../types/legal';

interface LawKnowledgeAtlasProps {
  onSelectBranch: (branch: LawBranch) => void;
  onConsultMaxim: (query: string) => void;
}

type RelationFilter = 'all' | 'hierarchy' | 'intersection';

export const LawKnowledgeAtlas: React.FC<LawKnowledgeAtlasProps> = ({
  onSelectBranch,
  onConsultMaxim,
}) => {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'branches' | 'maxims'>('mindmap');

  // Interactive Mind Map state
  const [selectedNodeId, setSelectedNodeId] = useState<string>('commercial');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('all');
  const [zoom, setZoom] = useState<number>(1);

  const selectedNode: MindMapNode = useMemo(
    () => MIND_MAP_NODES.find((n) => n.id === selectedNodeId) || MIND_MAP_NODES[0],
    [selectedNodeId]
  );

  const selectedEdge: MindMapEdge | null = useMemo(
    () => (selectedEdgeId ? MIND_MAP_EDGES.find((e) => e.id === selectedEdgeId) || null : null),
    [selectedEdgeId]
  );

  // Connected edges & neighbor node IDs for focused node
  const activeFocusId = hoveredNodeId || selectedNodeId;
  const connectedEdges = useMemo(
    () =>
      MIND_MAP_EDGES.filter(
        (e) =>
          (e.from === activeFocusId || e.to === activeFocusId) &&
          (relationFilter === 'all' || e.type === relationFilter)
      ),
    [activeFocusId, relationFilter]
  );

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>([activeFocusId]);
    connectedEdges.forEach((e) => {
      set.add(e.from);
      set.add(e.to);
    });
    return set;
  }, [activeFocusId, connectedEdges]);

  const visibleEdges = useMemo(
    () =>
      MIND_MAP_EDGES.filter(
        (e) => relationFilter === 'all' || e.type === relationFilter
      ),
    [relationFilter]
  );

  // Node relationships grouped for the Inspector Panel
  const nodeIntersections = useMemo(
    () =>
      MIND_MAP_EDGES.filter(
        (e) => (e.from === selectedNodeId || e.to === selectedNodeId) && e.type === 'intersection'
      ),
    [selectedNodeId]
  );

  const nodeHierarchyLinks = useMemo(
    () =>
      MIND_MAP_EDGES.filter(
        (e) => (e.from === selectedNodeId || e.to === selectedNodeId) && e.type === 'hierarchy'
      ),
    [selectedNodeId]
  );

  const getNodeById = (id: string) => MIND_MAP_NODES.find((n) => n.id === id);

  const getCategoryColors = (category: MindMapNode['category'], isSelected: boolean) => {
    if (category === 'root') {
      return {
        fill: isSelected ? '#d97706' : '#1e293b',
        stroke: '#f59e0b',
        text: isSelected ? '#020617' : '#fef3c7',
        badge: 'القمة الدستورية',
      };
    }
    if (category === 'public') {
      return {
        fill: isSelected ? '#b45309' : '#171c2b',
        stroke: isSelected ? '#fbbf24' : '#d97706',
        text: '#fef3c7',
        badge: 'القانون العام',
      };
    }
    if (category === 'private') {
      return {
        fill: isSelected ? '#1d4ed8' : '#111a2e',
        stroke: isSelected ? '#60a5fa' : '#3b82f6',
        text: '#dbeafe',
        badge: 'القانون الخاص',
      };
    }
    return {
      fill: isSelected ? '#047857' : '#0f2123',
      stroke: isSelected ? '#34d399' : '#10b981',
      text: '#d1fae5',
      badge: 'تشريع متقاطع',
    };
  };

  // Smooth SVG curved path between two nodes
  const buildCurvePath = (fromNode: MindMapNode, toNode: MindMapNode, isIntersection: boolean) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const mx = (fromNode.x + toNode.x) / 2;
    const my = (fromNode.y + toNode.y) / 2;
    // Offset perpendicular to line so cross-cutting edges curve distinctly without overlapping straight lines
    const offset = isIntersection ? 42 : 18;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx = mx - (dy / len) * offset;
    const cy = my + (dx / len) * offset;
    return {
      path: `M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`,
      labelX: 0.25 * fromNode.x + 0.5 * cx + 0.25 * toNode.x,
      labelY: 0.25 * fromNode.y + 0.5 * cy + 0.25 * toNode.y,
    };
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>شجرة القانون العام والقواعد الكبرى</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              أطلس المعرفة القانونية والمخطط التفاعلي للتشريعات المتقاطعة
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              استكشف العلاقات البينية والتقاطعات التشريعية بين فروع القانون العام والخاص، وانقر على أي عقدة أو رابط لفهم نقاط الالتقاء القضائي ومناقشتها مباشرة مع العقل المستقل.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center bg-slate-950 border border-slate-800 p-1 rounded-xl gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'mindmap'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>المخطط التفاعلي للعلاقات</span>
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'branches'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              فروع وتصنيفات القانون
            </button>
            <button
              onClick={() => setActiveTab('maxims')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'maxims'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              القواعد الكبرى
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Interactive Legal Mind Map */}
      {activeTab === 'mindmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left / Main Stage: Interactive Mind Map Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-[#0b101c] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setRelationFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    relationFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  جميع الروابط
                </button>
                <button
                  onClick={() => setRelationFilter('hierarchy')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    relationFilter === 'hierarchy'
                      ? 'bg-blue-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GitBranch className="w-3 h-3" />
                  <span>التدرج الهرمي</span>
                </button>
                <button
                  onClick={() => setRelationFilter('intersection')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    relationFilter === 'intersection'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>التشريعات المتقاطعة</span>
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setZoom((z) => Math.min(1.35, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="تكبير المخطط"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono tabular-nums text-slate-400 px-1.5">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="تصغير المخطط"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setSelectedNodeId('commercial');
                    setSelectedEdgeId(null);
                    setRelationFilter('all');
                  }}
                  className="p-1.5 rounded text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="إعادة ضبط العرض"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div className="relative flex-1 min-h-[460px] sm:min-h-[540px] rounded-xl bg-[#070b14] border border-slate-800/80 overflow-auto">
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-200 origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <svg
                  viewBox="0 0 1000 620"
                  className="w-full h-full min-w-[720px] select-none"
                  role="img"
                  aria-label="المخطط التفاعلي لفروع القانون والتشريعات المتقاطعة"
                >
                  <defs>
                    <pattern id="legalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.06)"
                        strokeWidth="1"
                      />
                    </pattern>
                    <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <rect width="1000" height="620" fill="url(#legalGrid)" />

                  {/* Edges Layer */}
                  {visibleEdges.map((edge) => {
                    const fromNode = getNodeById(edge.from);
                    const toNode = getNodeById(edge.to);
                    if (!fromNode || !toNode) return null;

                    const isIntersection = edge.type === 'intersection';
                    const isEdgeActive =
                      selectedEdgeId === edge.id ||
                      edge.from === activeFocusId ||
                      edge.to === activeFocusId;

                    const { path, labelX, labelY } = buildCurvePath(fromNode, toNode, isIntersection);

                    const strokeColor = isEdgeActive
                      ? isIntersection
                        ? '#34d399'
                        : '#fbbf24'
                      : isIntersection
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(148, 163, 184, 0.22)';

                    return (
                      <g
                        key={edge.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedEdgeId(edge.id);
                          setSelectedNodeId(edge.from);
                        }}
                      >
                        {/* Invisible wide hit path for easy clicking */}
                        <path d={path} fill="none" stroke="transparent" strokeWidth="16" />

                        <path
                          d={path}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isEdgeActive ? (isIntersection ? 2.6 : 2.2) : 1.4}
                          strokeDasharray={isIntersection ? '6 5' : undefined}
                          className="transition-all duration-200"
                        />

                        {/* Show edge label on active or intersection hover */}
                        {isEdgeActive && (
                          <g transform={`translate(${labelX}, ${labelY})`}>
                            <rect
                              x="-64"
                              y="-11"
                              width="128"
                              height="22"
                              rx="6"
                              fill={selectedEdgeId === edge.id ? '#064e3b' : '#0f172a'}
                              stroke={isIntersection ? '#34d399' : '#f59e0b'}
                              strokeWidth="1"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={isIntersection ? '#a7f3d0' : '#fde68a'}
                              fontSize="10"
                              fontWeight="600"
                            >
                              {edge.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes Layer */}
                  {MIND_MAP_NODES.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const colors = getCategoryColors(node.category, isSelected);
                    const boxW = node.category === 'root' ? 185 : 152;
                    const boxH = node.category === 'root' ? 52 : 46;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setSelectedEdgeId(null);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-opacity duration-200"
                        style={{ opacity: isConnected ? 1 : 0.35 }}
                      >
                        {/* Outer focus halo when selected */}
                        {isSelected && (
                          <rect
                            x={-boxW / 2 - 5}
                            y={-boxH / 2 - 5}
                            width={boxW + 10}
                            height={boxH + 10}
                            rx="14"
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="1.5"
                            strokeOpacity="0.6"
                          />
                        )}

                        <rect
                          x={-boxW / 2}
                          y={-boxH / 2}
                          width={boxW}
                          height={boxH}
                          rx="11"
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth={isSelected ? 2.2 : 1.3}
                          filter={isSelected ? 'url(#glowAmber)' : undefined}
                        />

                        <text
                          y="-4"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={colors.text}
                          fontSize="12"
                          fontWeight="700"
                        >
                          {node.shortLabel}
                        </text>

                        <text
                          y="13"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isSelected ? 'rgba(255,255,255,0.85)' : 'rgba(148,163,184,0.8)'}
                          fontSize="9.5"
                        >
                          {colors.badge}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Clean Legend (Zero-pill inline text with clear indicators) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-600/40 border border-amber-500 inline-block" />
                  <span>القانون العام</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-600/40 border border-blue-500 inline-block" />
                  <span>القانون الخاص</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600/40 border border-emerald-500 inline-block" />
                  <span>تشريعات متقاطعة</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 border-t-2 border-dashed border-emerald-400 inline-block" />
                  <span>خط تقاطع تشريعي</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                انقر على أي فرع أو رابط متقطع لعرض تفاصيل العلاقة
              </span>
            </div>
          </div>

          {/* Right Inspector Panel: Selected Branch & Cross-Cutting Relationships (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* If user clicked a specific cross-cutting edge, highlight it first */}
              {selectedEdge && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                      <span>نقطة تقاطع تشريعي</span>
                    </span>
                    <button
                      onClick={() => setSelectedEdgeId(null)}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>
                  <div className="text-sm font-bold text-white">{selectedEdge.label}</div>
                  <div className="text-[11px] text-emerald-200/80">
                    {getNodeById(selectedEdge.from)?.shortLabel} ↔ {getNodeById(selectedEdge.to)?.shortLabel}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedEdge.intersectionDetail}
                  </p>
                  <button
                    onClick={() =>
                      onConsultMaxim(
                        `اشرح لي بالتفصيل كيف يتقاطع "${getNodeById(selectedEdge.from)?.label}" مع "${getNodeById(selectedEdge.to)?.label}" في مسألة: (${selectedEdge.label})؟ وما هي الإجراءات العملية إذا اجتمعا في نزاع واحد؟`
                      )
                    }
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مناقشة هذا التقاطع مع العقل المستقل</span>
                  </button>
                </div>
              )}

              {/* Selected Node Header */}
              <div>
                <div className="text-xs text-amber-400 font-medium mb-1">
                  {selectedNode.category === 'public'
                    ? 'فرع من فروع القانون العام'
                    : selectedNode.category === 'private'
                    ? 'فرع من فروع القانون الخاص'
                    : selectedNode.category === 'cross'
                    ? 'منظومة تشريعية متقاطعة'
                    : 'القاعدة الهرمية العليا'}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {selectedNode.description}
                </p>
              </div>

              {/* Key Statutes */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>التشريعات والركائز الحاكمة:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedNode.keyStatutes.map((stat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cross-Cutting Links from this Node */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>التقاطعات المباشرة مع فروع أخرى ({nodeIntersections.length}):</span>
                </div>

                {nodeIntersections.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                    {nodeIntersections.map((edge) => {
                      const otherId = edge.from === selectedNodeId ? edge.to : edge.from;
                      const otherNode = getNodeById(otherId);
                      return (
                        <button
                          key={edge.id}
                          onClick={() => {
                            setSelectedEdgeId(edge.id);
                          }}
                          className={`w-full text-right p-2.5 rounded-xl border transition-all cursor-pointer ${
                            selectedEdgeId === edge.id
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                              : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-emerald-300">{edge.label}</span>
                            <span className="text-[11px] text-slate-400">
                              مع {otherNode?.shortLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {edge.intersectionDetail}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    تمثل هذه العقدة محوراً هرمياً رئيسياً تتفرع عنه التشريعات التنفيذية. انقر على الروابط الموصلة بها لاستكشافها.
                  </p>
                )}

                {nodeHierarchyLinks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                    {nodeHierarchyLinks.map((edge) => {
                      const otherId = edge.from === selectedNodeId ? edge.to : edge.from;
                      const otherNode = getNodeById(otherId);
                      if (!otherNode) return null;
                      return (
                        <button
                          key={edge.id}
                          onClick={() => {
                            setSelectedNodeId(otherNode.id);
                            setSelectedEdgeId(null);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        >
                          انتقل إلى: {otherNode.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Primary Action */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => onConsultMaxim(selectedNode.sampleQuestion)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>اسأل العقل المستقل في "{selectedNode.shortLabel}"</span>
              </button>
              {selectedNode.chatBranch && (
                <button
                  onClick={() => onSelectBranch(selectedNode.chatBranch!)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>فتح جلسة استشارية متخصصة في هذا الفرع</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Branches View */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* General Law vs Private Law Big Split explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public Law */}
            <div className="bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>القانون العام (Public Law)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                مجموعة القواعد القانونية التي تنظم العلاقات التي تكون الدولة طرفاً فيها بصفتها صاحبة سيادة وسلطان عام. يهدف لتحقيق الصالح العام والنظام والأمن.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-300">الفروع الرئيسية:</div>
                <ul className="text-xs text-slate-400 space-y-1.5 pr-2">
                  <li>• القانون الدستوري (نظام الحكم، السلطات، والحريات العامة)</li>
                  <li>• القانون الإداري وقضاء مجلس الدولة (نشاط الإدارة، والقرارات والعقود الإدارية)</li>
                  <li>• القانون الجنائي والعقوبات (حماية المجتمع، الجرائم، والعقوبات)</li>
                  <li>• القانون المالي والضريبي (الموازنة العامة للدولة والموارد)</li>
                  <li>• القانون الدولي العام (العلاقات بين الدول والمنظمات الدولية)</li>
                </ul>
              </div>
            </div>

            {/* Private Law */}
            <div className="bg-gradient-to-br from-blue-950/20 to-slate-900 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-base mb-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span>القانون الخاص (Private Law)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                مجموعة القواعد التي تنظم العلاقات بين الأفراد أو بينهم وبين الدولة حين تتصرف كشخص عادي دون سيادة. يركز على حماية الحقوق والمصالح الذاتية.
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-blue-300">الفروع الرئيسية:</div>
                <ul className="text-xs text-slate-400 space-y-1.5 pr-2">
                  <li>• القانون المدني والشريعة العامة (أم القوانين، العقود والالتزامات والملكية)</li>
                  <li>• القانون التجاري والشركات (الأعمال التجارية، الأوراق المالية، والشركات)</li>
                  <li>• قانون العمل والتأمينات (علاقات العمل التبعية وحماية الأجراء)</li>
                  <li>• قانون المرافعات المدنية والتجارية (إجراءات التقاضي والدفوع والتنفيذ)</li>
                  <li>• القانون الدولي الخاص (تنازع القوانين والاختصاص القضائي الدولي)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Branch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LAW_BRANCHES.filter((b) => b.domain === 'law').map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 group-hover:underline">
                      {b.label}
                    </span>
                    <Scale className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {b.summary}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBranch(b.id)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>استشارة في هذا الفرع</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Legal Maxims View */}
      {activeTab === 'maxims' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGAL_MAXIMS.map((maxim, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold">{maxim.branch}</span>
                  {maxim.latin && (
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      {maxim.latin}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  "{maxim.arabic}"
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {maxim.meaning}
                </p>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">
                    مجال التطبيق القضائي:
                  </span>
                  <span className="text-xs text-slate-300">
                    {maxim.application}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  onConsultMaxim(
                    `أريد فهم أبعاد القاعدة القانونية الكبرى: "${maxim.arabic}"، وكيف يتم توظيفها كدفع جوهري أمام المحكمة أو في تفسير العقود والنزاعات؟`
                  )
                }
                className="w-full py-2 bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>محاورة العقل المستقل حول هذه القاعدة</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
