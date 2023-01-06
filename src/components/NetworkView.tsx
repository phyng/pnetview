import React, { useMemo, useState } from 'react'
import Graphin, { Utils } from '@antv/graphin'
import { useWindowSize } from 'react-use'
import styles from './NetworkView.module.scss'
import { getDemoData, Network, Node, Edge } from '../services/network'
import DataPanel from './DataPanel'
import { Row, Col, Input, InputNumber, Select, Button } from 'antd'
// import { SketchPicker } from 'react-color'

interface Props {
  value?: string
  onChange?: (value: string) => void
}

type NetworkFilters = {
  nodeTopCount: number
  minEdgeValue: number
  edgeTopCount: number
  nodeSizeScale: number
  edgeLineWidthScale: number

  nodeStyleKeyshapeStroke: string
  nodeStyleKeyshapeFill: string
  nodeStyleKeyshapeFillOpacity: number

  edgeStyleKeyshapeStroke: string
  edgeStyleKeyshapeOpacity: number
}

const filterNetwork = (network: Network, filters: NetworkFilters) => {
  const {
    nodeTopCount,
    edgeTopCount,
    minEdgeValue,
    nodeSizeScale,
    edgeLineWidthScale,

    nodeStyleKeyshapeStroke,
    nodeStyleKeyshapeFill,
    nodeStyleKeyshapeFillOpacity,

    edgeStyleKeyshapeStroke,
    edgeStyleKeyshapeOpacity,
  } = filters
  const { nodes, edges, ...rest } = JSON.parse(JSON.stringify(network)) as Network
  const getNodeValue = (node: Node) => edges.map((edge) => [edge.source, edge.target].includes(node.id) ? edge.value : 0).reduce((a, b) => a + b, 0)
  const filteredNodes = nodes
    .sort((a, b) => getNodeValue(b) - getNodeValue(a))
    .slice(0, nodeTopCount)
    .map((node) => {
      return {
        ...node,
        style: {
          ...node.style,
          keyshape: {
            ...node.style.keyshape,
            size: node.style.keyshape.size * nodeSizeScale,
            stroke: node.style.keyshape.stroke || nodeStyleKeyshapeStroke,
            fill: node.style.keyshape.fill || nodeStyleKeyshapeFill,
            fillOpacity: node.style.keyshape.fillOpacity || nodeStyleKeyshapeFillOpacity,
          },
        },
      }
    })
  const nodeIds = filteredNodes.map((node) => node.id)
  const filteredEdges = edges
    .filter(
      ({ source, target, value }) => source !== target && nodeIds.includes(source) && nodeIds.includes(target) && value >= minEdgeValue
    )
    .map((edge) => {
      return {
        ...edge,
        style: {
          ...edge.style,
          keyshape: {
            ...edge.style.keyshape,
            lineWidth: edge.style.keyshape.lineWidth * edgeLineWidthScale,
            stroke: edgeStyleKeyshapeStroke || edge.style.keyshape.stroke,
            opacity: edgeStyleKeyshapeOpacity || edge.style.keyshape.opacity,
          },
        },
      }
    })

  const keepEdges: Edge[] = []
  for (const node of filteredNodes) {
    const nodeEdges = filteredEdges
      .filter((edge) => [edge.source, edge.target].includes(node.id))
      .sort((a, b) => b.value - a.value)
      .slice(0, edgeTopCount)
    keepEdges.push(...nodeEdges)
  }

  const filteredNetwork = {
    ...rest,
    nodes: filteredNodes,
    edges: filteredEdges.filter((edge) => keepEdges.includes(edge)),
  }
  return filteredNetwork
}

const NetworkView: React.FC<Props> = () => {
  const { width, height } = useWindowSize()
  const [network, setNetwork] = useState(() => getDemoData('wakatime-leaders'))
  const [layoutType, setLayoutType] = useState('force')
  const [arrowType, setArrowType] = useState('none')
  const [renderKey, setRenderKey] = useState(0)
  const [networkFilters, setNetworkFilters] = useState<NetworkFilters>({
    nodeTopCount: 30,
    edgeTopCount: 3,
    minEdgeValue: 0,
    nodeSizeScale: 1,
    edgeLineWidthScale: 1,
    nodeStyleKeyshapeStroke: '#037ef3',
    nodeStyleKeyshapeFill: '#037ef3',
    nodeStyleKeyshapeFillOpacity: 0.2,

    edgeStyleKeyshapeStroke: '#ccc',
    edgeStyleKeyshapeOpacity: 0.5,
  })

  const graphinData = useMemo(() => {
    console.time('filterNetwork')
    const networkClone = filterNetwork(network, networkFilters)
    console.timeEnd('filterNetwork')
    const nodes = networkClone.nodes
    const edges = Utils.processEdges(networkClone.edges, {
      poly: 50,
      loop: 10,
    })
    edges.forEach((edge) => {
      edge.style = edge.style || {}
      if (typeof edge.style === 'object') {
        edge.style.label = {
          value: '', // edge.value,
        }
        edge.style.keyshape = edge.style.keyshape || {}
        // edge.style.keyshape.stroke = '#ccc'
        // edge.style.keyshape.opacity = 0.5

        if (arrowType === 'none') {
          edge.style.keyshape.endArrow = {
            path: '',
          }
        }
      }
    })
    return {
      nodes,
      edges,
    }
  }, [network, networkFilters, arrowType])

  const layoutChoices = [
    {id: 'graphin-force', name: 'graphin-force'},
    {id: 'gForce', name: 'gForce'},
    {id: 'force', name: 'force'},
    {id: 'random', name: 'random'},
    {id: 'concentric', name: 'concentric'},
    {id: 'circular', name: 'circular'},
    {id: 'dagre', name: 'dagre'},
    {id: 'grid', name: 'grid'},
    {id: 'radial', name: 'radial'},
    {id: 'mds', name: 'mds'},
  ]

  const arrowChoices = [
    {id: 'none', name: '无'},
    {id: 'arrow', name: '有向箭头'},
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
          <strong className="text-lg mb-2">网络数据</strong>
          <DataPanel network={network} onNetworkChange={setNetwork}></DataPanel>
        </div>
        <div className="mb-2">
          <div className="font-bold mb-2">网络过滤</div>
          <section>
            <Row className="mb-1">
              <Col span={12}><span style={{lineHeight: '24px'}}>节点数量</span></Col>
              <Col span={12}>
                <InputNumber
                  value={networkFilters.nodeTopCount}
                  onChange={(e) => setNetworkFilters({ ...networkFilters, nodeTopCount: e })}
                  size="small"
                  style={{ width: '100%' }}
                ></InputNumber>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col span={12}><span style={{lineHeight: '24px'}}>节点边数量限制</span></Col>
              <Col span={12}>
                <InputNumber
                  value={networkFilters.edgeTopCount}
                  onChange={(e) => setNetworkFilters({ ...networkFilters, edgeTopCount: e })}
                  size="small"
                  style={{ width: '100%' }}
                ></InputNumber>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col span={12}><span style={{lineHeight: '24px'}}>边最小值</span></Col>
              <Col span={12}>
                <InputNumber
                  value={networkFilters.minEdgeValue}
                  onChange={(e) => setNetworkFilters({ ...networkFilters, minEdgeValue: e })}
                  size="small"
                  style={{ width: '100%' }}
                ></InputNumber>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col span={12}><span style={{lineHeight: '24px'}}>节点大小缩放</span></Col>
              <Col span={12}>
                <InputNumber
                  value={networkFilters.nodeSizeScale}
                  onChange={(e) => setNetworkFilters({ ...networkFilters, nodeSizeScale: e })}
                  step={0.1}
                  size="small"
                  style={{ width: '100%' }}
                ></InputNumber>
              </Col>
            </Row>
            <Row className="mb-1">
              <Col span={12}><span style={{lineHeight: '24px'}}>边宽度缩放</span></Col>
              <Col span={12}>
                <InputNumber
                  value={networkFilters.edgeLineWidthScale}
                  onChange={(e) => setNetworkFilters({ ...networkFilters, edgeLineWidthScale: e })}
                  step={0.1}
                  size="small"
                  style={{ width: '100%' }}
                ></InputNumber>
              </Col>
            </Row>
          </section>
        </div>
      </section>
      <section className={styles.rightToolbox}>
        <div>
          <strong className="text-lg mb-2">样式设置</strong>
        </div>
        <section>
          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>箭头方式</span></Col>
            <Col span={12}>
              <Select
                value={arrowType}
                onChange={(e) => setArrowType(e)}
                size="small"
                style={{ width: '100%' }}
              >
                {arrowChoices.map((choice) => (
                  <Select.Option key={choice.id} value={choice.id}>
                    {choice.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>布局方式</span></Col>
            <Col span={12}>
              <Select
                value={layoutType}
                onChange={(e) => setLayoutType(e)}
                size="small"
                style={{ width: '100%' }}
              >
                {layoutChoices.map((choice) => (
                  <Select.Option key={choice.id} value={choice.id}>
                    {choice.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>节点边框颜色</span></Col>
            <Col span={12}>
              <Input
                value={networkFilters.nodeStyleKeyshapeStroke}
                onChange={(e) => setNetworkFilters({ ...networkFilters, nodeStyleKeyshapeStroke: e.target.value })}
                size="small"
                placeholder="输入颜色"
              ></Input>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>节点填充颜色</span></Col>
            <Col span={12}>
              <Input
                value={networkFilters.nodeStyleKeyshapeFill}
                onChange={(e) => setNetworkFilters({ ...networkFilters, nodeStyleKeyshapeFill: e.target.value })}
                size="small"
                placeholder="输入颜色"
              ></Input>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>节点填充透明度</span></Col>
            <Col span={12}>
              <InputNumber
                value={networkFilters.nodeStyleKeyshapeFillOpacity}
                onChange={(e) => setNetworkFilters({ ...networkFilters, nodeStyleKeyshapeFillOpacity: e })}
                step={0.1}
                size="small"
                style={{ width: '100%' }}
              ></InputNumber>
            </Col>
          </Row>

          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>边的颜色</span></Col>
            <Col span={12}>
              <Input
                value={networkFilters.edgeStyleKeyshapeStroke}
                onChange={(e) => setNetworkFilters({ ...networkFilters, edgeStyleKeyshapeStroke: e.target.value })}
                size="small"
                placeholder="输入颜色"
              ></Input>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col span={12}><span style={{lineHeight: '24px'}}>边的透明度</span></Col>
            <Col span={12}>
              <InputNumber
                value={networkFilters.edgeStyleKeyshapeOpacity}
                onChange={(e) => setNetworkFilters({ ...networkFilters, edgeStyleKeyshapeOpacity: e })}
                step={0.1}
                size="small"
                style={{ width: '100%' }}
              ></InputNumber>
            </Col>
          </Row>
        </section>
        <section>
          <Button size="small" type="primary" onClick={() => setRenderKey(key => key + 1)}>刷新渲染</Button>
        </section>
      </section>
      <Graphin
        key={`${width}:${height}:${renderKey}`}
        data={graphinData}
        layout={layout}
        height={height - 64 - 10}
        width={width - 10}
        fitView
      />
    </section>
  )
}

export default NetworkView
