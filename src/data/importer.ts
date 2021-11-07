import wakatimeLeaders from './wakatime-leaders.json'

type DataFormatStringArray = string[][]

type Node = {
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

type Edge = {
  source: string
  target: string
  value: number
  style: { keyshape: { lineWidth: number } }
}

type Network = {
  nodes: Node[]
  edges: Edge[]
}

const convertFormatStringArrayToNetwork = (data: DataFormatStringArray, limit = 30): Network => {
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
  console.log('counter', counter)
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
            size: size < 10 ? 10 : size,
          },
          label: {
            value: name,
          },
        },
      })
    })

  nodes.forEach((node, index) => {
    nodes.slice(index + 1, index + 1 + 3).forEach((otherNode) => {
      const count = data.filter((line) => line.includes(node.id) && line.includes(otherNode.id)).length
      const lineWidth = (count / maxCount) * 20
      edges.push({
        source: node.id,
        target: otherNode.id,
        value: count,
        style: {
          keyshape: {
            lineWidth: lineWidth < 1 ? 1 : lineWidth,
          },
        },
      })
    })
  })

  return { nodes, edges }
}

export const getDemoData = (type: 'wakatime-leaders'): Network => {
  if (type === 'wakatime-leaders') {
    return convertFormatStringArrayToNetwork(wakatimeLeaders)
  } else {
    throw new Error('Unknown type')
  }
}
