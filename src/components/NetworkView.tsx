import React, { useMemo, useState } from 'react'
import Graphin, { Utils } from '@antv/graphin'
import { useWindowSize } from 'react-use'
import styles from './NetworkView.module.scss'
import { getDemoData } from '../services/network'
import DataPanel from './DataPanel'

interface Props {
  value?: string
  onChange?: (value: string) => void
}

const NetworkView: React.FC<Props> = () => {
  const { width, height } = useWindowSize()
  const [layoutType, setLayoutType] = useState('force')
  const [network, setNetwork] = useState(getDemoData('wakatime-leaders'))
  console.log('network', network)

  const graphinData = useMemo(() => {
    const nodes = network.nodes
    const edges = Utils.processEdges(network.edges, {
      poly: 50,
      loop: 100,
    })
    edges.forEach((edge) => {
      edge.style = edge.style || {}
      if (typeof edge.style === 'object') {
        edge.style.label = {
          value: '', // edge.value,
        }
        edge.style.keyshape = edge.style.keyshape || {}
        edge.style.keyshape.stroke = '#ccc'
        edge.style.keyshape.opacity = 0.5
      }
    })
    return {
      nodes,
      edges,
    }
  }, [network])

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
    linkDistance: 250, // 可选，边长
    nodeStrength: 10, // 可选
    edgeStrength: 0.1, // 可选
    nodeSize: 20, // 可选
  }

  return (
    <section className={styles.container}>
      <section className={styles.leftToolbox}>
        <div>
          <strong className="text-lg mb-2">Data</strong>
          <DataPanel network={network} onNetworkChange={setNetwork}></DataPanel>
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
      <Graphin
        key={`${width}:${height}`}
        data={graphinData}
        layout={layout}
        height={height - 64}
        width={width}
        fitView
      />
    </section>
  )
}

export default NetworkView
