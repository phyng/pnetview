import React from 'react'
import { Network } from '../services/network'

type Props = {
  network: Network
  onNetworkChange?: (network: Network) => void
}


const DataEditor: React.FC<Props> = ({ network }) => {
  return (
    <section>
      <div>名称: {network.name}</div>
      <div>节点: {network.nodes.length}</div>
      <div>链接: {network.edges.length}</div>
      <section className="mt-2">
        {/*  */}
      </section>
    </section>
  )
}

export default DataEditor
