import React from 'react'
import { getDemoData, Network } from '../services/network'

interface Props {
  network?: Network
  onNetworkChange?: (network: Network) => void
}

const DataPanel: React.FC<Props> = ({ network, onNetworkChange }) => {
  if (!network) {
    onNetworkChange && onNetworkChange(getDemoData('wakatime-leaders'))
    return null
  }

  return (
    <section>
      <div>网络：{network.name}</div>
      <div>节点数量：{network.nodes.length}</div>
      <div>链接数量：{network.edges.length}</div>
    </section>
  )
}

export default DataPanel
