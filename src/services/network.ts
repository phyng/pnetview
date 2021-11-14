import wakatimeLeaders from '../data/wakatime-leaders.json'
import { message } from 'antd'

type FormatStringArray = string[][]

export type Node = {
  id: string
  style: {
    keyshape: {
      size: number
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
      endArrow?: {
        path: string
      }
    }
  }
}

export type Network = {
  name: string
  nodes: Node[]
  edges: Edge[]
}

const convertFormatStringArrayToNetwork = (name: string, data: FormatStringArray, limit = 100): Network => {
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
      const size = (count / maxCount) * 50
      nodes.push({
        id: name,
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

  nodes.forEach((node, index) => {
    nodes.slice(index + 1).forEach((otherNode) => {
      const count = data.filter((line) => line.includes(node.id) && line.includes(otherNode.id)).length
      if (!count) return
      const lineWidth = (count / maxCount) * 20
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

  return {
    name,
    nodes,
    edges,
  }
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
