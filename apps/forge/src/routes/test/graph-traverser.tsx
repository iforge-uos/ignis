import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

// Graph type: each key lists possible next nodes; undefined means termination.
type Graph = Record<string, readonly (string | undefined)[]>

const GRAPH: Graph = {
  INITIALISE: ['AGREEMENTS', 'QUEUE', 'REASON', 'SIGN_OUT'],
  AGREEMENTS: ['MAILING_LISTS'],
  CANCEL: [undefined],
  MAILING_LISTS: ['REASON'],
  PERSONAL_TOOLS_AND_MATERIALS: ['TOOLS'],
  QUEUE: [undefined],
  REASON: ['FINALISE', 'PERSONAL_TOOLS_AND_MATERIALS', 'TOOLS'], // added explicit skip to TOOLS for main path clarity
  TOOLS: ['FINALISE'],
  FINALISE: [undefined],
  SIGN_OUT: [undefined],
} as const

// Configurable main path (must start with INITIALISE)
const DEFAULT_MAIN_PATH = ['INITIALISE', 'REASON', 'TOOLS', 'FINALISE'] as const

interface GraphVisualizerProps {
  graph?: Graph
  mainPath?: readonly string[]
}

interface TraversalState {
  current: string
  visited: Set<string>
  visitHistory: string[] // ordered list of nodes as visited (for path tracking)
  skipped: Set<string>
  // active branch being explored
  activeBranchOrigin?: string // main path node from which branch started
  activeBranchPath: string[] // off-main nodes traversed so far
  discoveredBranches: Record<string, string[][]> // origin main node -> array of branch paths
}

export const Route = createFileRoute('/test/graph-traverser')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GraphVisualizer />
}

function GraphVisualizer({ graph = GRAPH, mainPath = DEFAULT_MAIN_PATH }: GraphVisualizerProps) {
  const [state, setState] = React.useState<TraversalState>(() => ({
    current: mainPath[0],
    visited: new Set([mainPath[0]]),
    visitHistory: [mainPath[0]],
    skipped: new Set<string>(),
    activeBranchOrigin: undefined,
    activeBranchPath: [],
    discoveredBranches: {},
  }))

  const isOnMain = (node: string) => mainPath.includes(node)
  const mainIndex = (node: string) => mainPath.indexOf(node)

  const currentOptions = React.useMemo(() => {
    const raw = graph[state.current] || []
    return raw.filter(Boolean) as string[]
  }, [state.current, graph])

  // Determine if an option is a skip ahead on main path
  const classifyOption = (option: string) => {
    if (!isOnMain(option)) return 'branch'
    const curIdx = mainIndex(state.current)
    const optIdx = mainIndex(option)
    // If current is off-main but option is on main, it's a rejoin
    if (curIdx === -1) return 'rejoin'
    if (optIdx === curIdx + 1) return 'forward'
    if (optIdx > curIdx + 1) return 'skip'
    return 'rejoin' // going backwards or rejoining earlier main path
  }

  const handleSelect = (next: string) => {
    setState(prev => {
      // Check if we're backtracking to a previously visited node
      const existingIndex = prev.visitHistory.indexOf(next)

      if (existingIndex !== -1) {
        // Backtracking: truncate history at this point
        return {
          ...prev,
          current: next,
          visitHistory: prev.visitHistory.slice(0, existingIndex + 1),
          // Clear active branch if backtracking
          activeBranchOrigin: undefined,
          activeBranchPath: [],
        }
      }

      // Normal forward navigation
      const visited = new Set(prev.visited)
      visited.add(next)
      const visitHistory = [...prev.visitHistory, next]
      const skipped = new Set(prev.skipped)
      let { activeBranchOrigin, activeBranchPath, discoveredBranches } = prev
      const classification = classifyOption(next)

      // Branch exploration logic
      if (classification === 'branch') {
        // Check if this is a termination node
        const nextEdges = graph[next] || []
        const isTermination = nextEdges.length === 1 && nextEdges[0] === undefined

        // starting a new branch (only when not already in branch)
        if (!activeBranchOrigin) {
          activeBranchOrigin = prev.current // origin is the main node we branched from
          // Include this node unless it's terminating
          activeBranchPath = isTermination ? [] : [next]
        } else {
          // continue existing branch - add all nodes except termination
          activeBranchPath = isTermination ? activeBranchPath : [...activeBranchPath, next]
        }
      } else if (classification === 'rejoin' && isOnMain(next) && activeBranchOrigin) {
        // finalize branch on rejoin (only store if non-empty)
        if (activeBranchPath.length > 0) {
          discoveredBranches = { ...discoveredBranches }
          const arr = discoveredBranches[activeBranchOrigin] || []
          arr.push(activeBranchPath)
          discoveredBranches[activeBranchOrigin] = arr
        }
        activeBranchOrigin = undefined
        activeBranchPath = []
      } else if (classification === 'skip') {
        const fromIdx = mainIndex(prev.current)
        const toIdx = mainIndex(next)
        if (fromIdx !== -1 && toIdx !== -1) {
          for (let i = fromIdx + 1; i < toIdx; i++) {
            const skipNode = mainPath[i]
            if (!visited.has(skipNode)) skipped.add(skipNode)
          }
        }
        // finalize branch if we skipped while inside a branch (treat as abandon)
        if (activeBranchOrigin) {
          discoveredBranches = { ...discoveredBranches }
          const arr = discoveredBranches[activeBranchOrigin] || []
          arr.push(activeBranchPath)
          discoveredBranches[activeBranchOrigin] = arr
          activeBranchOrigin = undefined
          activeBranchPath = []
        }
      } else if (classification === 'forward') {
        // moving forward on main, finalize any active branch silently
        if (activeBranchOrigin) {
          discoveredBranches = { ...discoveredBranches }
          const arr = discoveredBranches[activeBranchOrigin] || []
          arr.push(activeBranchPath)
          discoveredBranches[activeBranchOrigin] = arr
          activeBranchOrigin = undefined
          activeBranchPath = []
        }
      }

      return {
        ...prev,
        current: next,
        visited,
        visitHistory,
        skipped,
        activeBranchOrigin,
        activeBranchPath,
        discoveredBranches,
      }
    })
  }

  const terminated = (graph[state.current] || []).includes(undefined)

  // Determine which main nodes to reveal: those visited or skipped up to current furthest point
  const furthestIndex = mainPath.reduce((acc, node, idx) => (state.visited.has(node) || state.skipped.has(node) ? idx : acc), 0)
  const visibleMainNodes = mainPath.slice(0, furthestIndex + 1)

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold">Graph Traverser</h1>
      <VerticalTimeline
        mainNodes={visibleMainNodes}
        state={state}
        graph={graph}
        onSelect={handleSelect}
      />
      <OptionPanel
        options={currentOptions.map(o => ({ node: o, type: classifyOption(o) }))}
        onSelect={handleSelect}
      />
      {terminated && <p className="text-xs text-green-600">Terminated at {state.current}</p>}
    </div>
  )
}
// Custom option panel reused.
function OptionPanel({ options, onSelect }: { options: { node: string; type: string }[]; onSelect: (n: string) => void }) {
  if (!options.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.node}
            type="button"
            onClick={() => onSelect(opt.node)}
            className={`rounded border px-2 py-1 text-xs transition hover:bg-accent hover:text-accent-foreground ${
              opt.type === 'skip' ? 'border-yellow-500 text-yellow-600' :
              opt.type === 'branch' ? 'border-blue-500 text-blue-600' :
              opt.type === 'forward' ? 'border-green-500 text-green-600' :
              opt.type === 'rejoin' ? 'border-purple-500 text-purple-600' : 'border-muted'
            }`}
        >
          {opt.node}
          <span className="ml-1 opacity-60">({opt.type})</span>
        </button>
      ))}
    </div>
  )
}

interface VerticalTimelineProps {
  mainNodes: string[]
  state: TraversalState
  graph: Graph
  onSelect: (n: string) => void
}

function VerticalTimeline({ mainNodes, state, graph, onSelect }: VerticalTimelineProps) {
  return (
    <div className="relative">
      <p className="mb-2 text-sm text-muted-foreground">Main Path (Vertical)</p>
      <div className="relative flex flex-col pl-4">
        {/* Vertical spine */}
        <div className="absolute left-2 top-0 h-full w-0.5 bg-muted" />
        {mainNodes.map((node, idx) => {
          const isCurrent = state.current === node
          const isVisited = state.visited.has(node)
          const isSkipped = state.skipped.has(node) && !isVisited
          // All visited or skipped nodes should be clickable (interactive)
          const interactive = isVisited || isSkipped
          const branches = state.discoveredBranches[node] || []
          const showActivePlaceholder = state.activeBranchOrigin === node && state.activeBranchPath.length > 0
          const visitOrder = state.visitHistory.indexOf(node)
          const currentVisitOrder = state.visitHistory.indexOf(state.current)
          // Node is in active path if it appears in history before or at current position
          const isInActivePath = visitOrder >= 0 && visitOrder <= currentVisitOrder
          const nextInHistory = visitOrder >= 0 && visitOrder < state.visitHistory.length - 1 ? state.visitHistory[visitOrder + 1] : null
          // Check if the connection to next node is part of current active path (not future visited nodes)
          // Line should be active only if this node comes BEFORE current in history
          const isActiveConnection = nextInHistory && mainNodes.includes(nextInHistory) && visitOrder < currentVisitOrder
          // Check if this node is a terminating node
          const nodeEdges = graph[node] || []
          const isTerminating = nodeEdges.length === 0 || (nodeEdges.length === 1 && nodeEdges[0] === undefined)
          const isLastNode = idx === mainNodes.length - 1
          // options to start branch from this main node (only if current node)
          return (
            <div key={node} className="relative flex items-start mb-12">
              {/* Highlight path line if this connects to next in history and is on active path, don't show if terminating */}
              {nextInHistory && mainNodes.includes(nextInHistory) && !isTerminating && !isLastNode && (
                <div className={`absolute left-2 top-3 w-0.5 z-0 ${isActiveConnection ? 'bg-primary' : 'bg-muted'}`} style={{ height: 'calc(100% + 3rem)' }} />
              )}
              {/* Node container with label inline */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() => interactive && onSelect(node)}
                  className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition ${
                    isCurrent ? 'bg-primary text-background border-primary scale-110' : isInActivePath ? 'bg-primary/10 border-primary/50 text-primary' : isSkipped ? 'bg-yellow-50 border-yellow-400 text-yellow-600' : 'bg-background border-muted text-muted-foreground'
                  } ${interactive ? 'cursor-pointer' : 'cursor-not-allowed opacity-25'}`}
                >
                  {node[0]}
                </button>
                <span className="text-sm font-medium">{node}</span>
              </div>
              {/* Branches container */}
              <div className="ml-6 flex flex-1 flex-col gap-2">
                {branches.map((branch) => (
                  <BranchRow
                    key={branch.join('__')}
                    nodes={branch}
                    isActive={false}
                    onSelect={onSelect}
                    visitHistory={state.visitHistory}
                    currentVisitOrder={currentVisitOrder}
                  />
                ))}
                {showActivePlaceholder && (
                  <BranchRow
                    nodes={state.activeBranchPath}
                    isActive={true}
                    onSelect={onSelect}
                    visitHistory={state.visitHistory}
                    currentVisitOrder={currentVisitOrder}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface BranchRowProps {
  nodes: string[]
  isActive: boolean
  visitHistory: string[]
  currentVisitOrder: number
  onSelect: (n: string) => void
}

function BranchRow({ nodes, isActive, visitHistory, currentVisitOrder, onSelect }: BranchRowProps) {
  if (nodes.length === 0) return null

  // Check if any nodes in this branch are in active history (before or at current position)
  const hasActiveNodes = nodes.some(n => {
    const nodeOrder = visitHistory.indexOf(n)
    return nodeOrder >= 0 && nodeOrder <= currentVisitOrder
  })
  const lineColor = hasActiveNodes || isActive ? 'bg-primary' : 'bg-muted'

  return (
    <div className="group relative" style={{ marginLeft: '-1rem' }}>
      <div className="flex items-start">
        {/* Branch structure with proper line connections */}
        <div className="relative flex">
          {/* Initial horizontal line from spine (positioned to align with spine center) */}
          <div className={`absolute left-0 top-2.5 h-0.5 w-8 ${lineColor}`} />

          {/* Vertical section with nodes */}
          <div className="relative" style={{ marginLeft: '2rem', paddingLeft: '0.5rem' }}>
            {/* Vertical connecting line for entire branch */}
            <div className={`absolute left-0 top-0 w-0.5 ${lineColor}`} style={{ height: `${nodes.length * 1.25 + (nodes.length - 1) * 0.5}rem` }} />

            {/* Branch nodes */}
            <div className="flex flex-col gap-2">
              {nodes.map((n) => {
                const nodeOrder = visitHistory.indexOf(n)
                const isInActivePath = nodeOrder >= 0 && nodeOrder <= currentVisitOrder

                return (
                  <div key={n} className="relative flex items-center">
                    {/* Horizontal connector from vertical line to node */}
                    <div className={`h-0.5 w-2 ${isInActivePath || isActive ? 'bg-primary' : 'bg-muted'}`} />
                    <button
                      type="button"
                      onClick={() => onSelect(n)}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-[10px] transition ${
                        isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : isInActivePath ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {n[0]}
                    </button>
                    <span className="ml-2 text-[10px] text-muted-foreground whitespace-nowrap">{n}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Exit horizontal line back to spine */}
          <div className={`absolute right-0 h-0.5 w-8 ${lineColor}`} style={{ top: `${(nodes.length - 1) * 1.75 + 0.625}rem`, left: '2rem' }} />
        </div>
      </div>
    </div>
  )
}
