import React, { useState } from 'react'
import Graphin, { Utils } from '@antv/graphin'
import { useWindowSize } from 'react-use'
import styles from './NetworkView.module.scss'
import { getDemoData } from '../data/importer'

interface Props {
  value?: string
  onChange?: (value: string) => void
}

const NetworkView: React.FC<Props> = () => {
  const { width, height } = useWindowSize()
  const [layoutType, setLayoutType] = useState('force')
  const network = getDemoData('wakatime-leaders')
  console.log('network', network)

  const nodes = network.nodes
  const edges = Utils.processEdges(network.edges, {
    poly: 50,
    loop: 100,
  })
  const data = { nodes, edges }

  edges.forEach((edge) => {
    edge.style = edge.style || {}
    if (typeof edge.style === 'object') {
      edge.style.label = {
        value: '' // edge.value,
      }
      edge.style.keyshape = edge.style.keyshape || {}
      edge.style.keyshape.stroke = '#ccc'
      edge.style.keyshape.opacity = 0.5
    }
  })

  const choices = [
    'graphin-force',
    'gForce',
    'force',
    'random',
    'concentric',
    'circular',
    'dagre',
    'grid',
    'radial',
    'mds',
  ]

  const layout = {
    type: layoutType,
    linkDistance: 250,         // 可选，边长
    nodeStrength: 10,         // 可选
    edgeStrength: 0.1,        // 可选
    nodeSize: 20,             // 可选
  }

  return (
    <section className={styles.container}>
      <section className={styles.leftToolbox}>
        <div>
          <strong>Data</strong>
        </div>
      </section>
      <section className={styles.rightToolbox}>
        <div>
          <strong>Style</strong>
        </div>
        <select value={layoutType} onChange={(e) => setLayoutType(e.target.value)}>
          {choices.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </section>
      <Graphin data={data} layout={layout} height={height - 64} width={width} fitView />
    </section>
  )
}

export default NetworkView
