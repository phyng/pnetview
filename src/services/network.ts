import wakatimeLeaders from '../data/wakatime-leaders.json'
import { message } from 'antd'

type FormatStringArray = string[][]

export type Node = {
  id: string
  value: number
  style: {
    keyshape: {
      size: number
      stroke?: string
      fill?: string
      fillOpacity?: number
    }
    label: {
      value: string
    }
  }
}

export type Edge = {
  source: string
  target: string
  value: number
  style: {
    keyshape: {
      lineWidth: number
      stroke?: string
      opacity?: number
      endArrow?: {
        path: string
      }
    }
  }
}

export type Network = {
  name: string
  direction?: boolean
  nodes: Node[]
  edges: Edge[]
}

const convertFormatStringArrayToNetwork = (name: string, data: FormatStringArray, limit = 2000): Network => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const counter: Record<string, number> = {}
  for (const line of data) {
    for (const name of line) {
      if (name in counter) {
        counter[name] += 1
      } else {
        counter[name] = 1
      }
    }
  }

  const maxCount = Math.max(...Object.values(counter)) || 0
  Array.from(Object.entries(counter))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .forEach(([name, count]) => {
      const size = Math.ceil((count / maxCount) * 50 * 100) / 100
      nodes.push({
        id: name,
        value: count,
        style: {
          keyshape: {
            size: size
          },
          label: {
            value: name,
          },
        },
      })
    })

  const hasDirection = data.filter((line) => line.length === 2).length === data.length
  if (hasDirection) {
    nodes.forEach((node, index) => {
      nodes.slice(index).forEach((otherNode) => {
        const totalCount = data.filter((line) => line.includes(node.id) && line.includes(otherNode.id)).length
        if (!totalCount) return

        // source -> target
        const sourceTargetCount = data.filter((line) => line[0] === node.id && line[1] === otherNode.id).length
        sourceTargetCount && edges.push({
          source: node.id,
          target: otherNode.id,
          value: sourceTargetCount,
          style: {
            keyshape: {
              lineWidth: Math.ceil((sourceTargetCount / maxCount) * 20 * 100) / 100,
            }
          },
        })

        // target -> source: 当 target === source 时忽略
        const targetSourceCount = data.filter((line) => line[0] === otherNode.id && line[1] === node.id && line[0] !== line[1]).length
        targetSourceCount && edges.push({
          source: otherNode.id,
          target: node.id,
          value: targetSourceCount,
          style: {
            keyshape: {
              lineWidth: Math.ceil((targetSourceCount / maxCount) * 20 * 100) / 100,
            }
          },
        })
      })
    })
  } else {
    nodes.forEach((node, index) => {
      nodes.slice(index).forEach((otherNode) => {
        const count = data.filter((line) => line.includes(node.id) && line.includes(otherNode.id)).length
        if (!count) return
        const lineWidth = Math.ceil((count / maxCount) * 20 * 100) / 100
        edges.push({
          source: node.id,
          target: otherNode.id,
          value: count,
          style: {
            keyshape: {
              lineWidth: lineWidth,
            }
          },
        })
      })
    })
  }

  return {
    name,
    direction: hasDirection,
    nodes,
    edges,
  }
}

const networkToCorrelation = (network: Network): string[][] => {
  const { nodes, edges } = network
  const correlation: string[][] = []

  for (const node of nodes) {
    const line: string[] = [node.id]
    for (const otherNode of nodes) {
      const _edges = edges.filter((edge) => (
        (edge.source === node.id && edge.target === otherNode.id) ||
        (edge.target === node.id && edge.source === otherNode.id)
      ))
      const count = _edges.reduce((acc, edge) => acc + edge.value, 0)
      line.push(count.toString())
    }
    correlation.push(line)
  }

  return correlation
}

const correlationToText = (correlation: string[][]): string => {
  const text = correlation.map((line) => line.join(',')).join('\n')
  return text
}

export const networkToCorrelationText = (network: Network): string => {
  const correlation = networkToCorrelation(network)
  const text = correlationToText(correlation)
  return text
}

export const getDemoData = (type: 'wakatime-leaders'): Network => {
  if (type === 'wakatime-leaders') {
    return convertFormatStringArrayToNetwork('wakatime-leaders', wakatimeLeaders)
  } else {
    throw new Error('Unknown type')
  }
}

export const getNetworkFromText = (name: string, text: string): Network | null => {
  try {
    const data = JSON.parse(text)
    if (data.edges && data.nodes) {
      return {...data, name} as Network
    } else {
      message.error(`${name} is invalid json file`)
      return null
    }
  } catch (e) {
    //
  }

  // FormatStringArray
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter((line) => line.length > 0)
    .map(line => line.split(',').map(i => i.trim()).filter((i) => i.length > 0))
    .filter((tokens) => tokens.length > 0)

  return convertFormatStringArrayToNetwork(name, lines)
}
