import React, { useState } from 'react'
import { Network, Node } from '../services/network'
import DataGrid, { Column, SelectColumn, TextEditor, EditorProps } from 'react-data-grid'
import { Button, Row, Col, Input } from 'antd'

type Props = {
  network: Network
  onNetworkChange?: (network: Network) => void
}

type Row = {
  index: number
  id: string
  'style.keyshape.size': number
  'style.keyshape.stroke': string
  'style.keyshape.fill': string
  'style.keyshape.fillOpacity': number
}

export type SummaryRow = {
  id: string
  totalCount: number
}

const ColorEditor: React.FC<EditorProps<Row, SummaryRow>> = ({ ...props }) => {
  const handleRowChange = (row: Row) => {
    console.log('row', row)
    props.onRowChange(row)
  }
  return <TextEditor {...{ ...props, onRowChange: handleRowChange }} />
}

const NumberEditor: React.FC<EditorProps<Row, SummaryRow>> = ({ ...props }) => {
  const handleRowChange = (row: Row) => {
    console.log('row', row)
    props.onRowChange(row)
  }
  return <TextEditor {...{ ...props, onRowChange: handleRowChange }} />
}

const rowKeyGetter = (row: Row) => {
  return row.index
}

const DataEditor: React.FC<Props> = ({ network, onNetworkChange }) => {
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(() => new Set())
  const [nodeStyleKeyshapeStroke, setNodeStyleKeyshapeStroke] = useState<string>('#037ef3')
  const [nodeStyleKeyshapeFill, setNodeStyleKeyshapeFill] = useState<string>('#037ef3')
  const [nodeStyleKeyshapeFillOpacity, setNodeStyleKeyshapeFillOpacity] = useState<number>(0.2)

  const columns: Column<Row, SummaryRow>[] = [
    SelectColumn,
    { key: 'index', name: '序号' },
    { key: 'id', name: '名称' },
    { key: 'style.keyshape.size', name: '节点大小缩放' },
    { key: 'style.keyshape.stroke', name: '节点边框颜色(双击修改)', editor: ColorEditor },
    { key: 'style.keyshape.fill', name: '节点填充颜色(双击修改)', editor: ColorEditor },
    { key: 'style.keyshape.fillOpacity', name: '节点填充透明度(双击修改)', editor: NumberEditor },
  ]

  const rows: Row[] = network.nodes.map((node, index) => ({
    index: index + 1,
    id: node.id,
    'style.keyshape.size': node.style.keyshape.size ?? 0,
    'style.keyshape.stroke': node.style.keyshape.stroke || '',
    'style.keyshape.fill': node.style.keyshape.fill || '',
    'style.keyshape.fillOpacity': node.style.keyshape.fillOpacity ?? 0,
  }))

  const onRowsChange = (rows: Row[]) => {
    onNetworkChange &&
      onNetworkChange({
        ...network,
        nodes: network.nodes.map((node) => {
          const cloneNode = JSON.parse(JSON.stringify(node)) as Node
          const matchRow = rows.find((row) => row.id === node.id)
          if (matchRow) {
            cloneNode.style.keyshape.stroke = matchRow['style.keyshape.stroke']
            cloneNode.style.keyshape.fill = matchRow['style.keyshape.fill']
            if (
              matchRow['style.keyshape.fillOpacity'] &&
              !isNaN(parseFloat(matchRow['style.keyshape.fillOpacity'] as unknown as string))
            ) {
              cloneNode.style.keyshape.fillOpacity = parseFloat(
                matchRow['style.keyshape.fillOpacity'] as unknown as string
              )
            }
          }
          return cloneNode
        }),
      })
  }

  const bulkSetNodeStyleKeyshapeStroke = () => {
    onNetworkChange &&
      onNetworkChange({
        ...network,
        nodes: network.nodes.map((node) => {
          const cloneNode = JSON.parse(JSON.stringify(node)) as Node
          const matchRow = rows.find((row) => row.id === node.id && selectedRows.has(row.index))
          if (matchRow) {
            if (nodeStyleKeyshapeStroke) {
              cloneNode.style.keyshape.stroke = nodeStyleKeyshapeStroke
            }
            if (nodeStyleKeyshapeFill) {
              cloneNode.style.keyshape.fill = nodeStyleKeyshapeFill
            }
            if (
              nodeStyleKeyshapeFillOpacity &&
              !isNaN(parseFloat(nodeStyleKeyshapeFillOpacity as unknown as string))
            ) {
              cloneNode.style.keyshape.fillOpacity = parseFloat(nodeStyleKeyshapeFillOpacity as unknown as string)
            }
          }
          return cloneNode
        }),
      })
  }

  return (
    <section>
      <section>
        <Row className="mb-1">
          <Col span={2}>
            <span style={{ lineHeight: '24px' }}>节点边框颜色</span>
          </Col>
          <Col span={2} className="mr-2">
            <Input
              value={nodeStyleKeyshapeStroke}
              onChange={(e) => setNodeStyleKeyshapeStroke(e.target.value)}
              size="small"
              placeholder="输入颜色"
            ></Input>
          </Col>

          <Col span={2}>
            <span style={{ lineHeight: '24px' }}>节点填充颜色</span>
          </Col>
          <Col span={2} className="mr-2">
            <Input
              value={nodeStyleKeyshapeFill}
              onChange={(e) => setNodeStyleKeyshapeFill(e.target.value)}
              size="small"
              placeholder="输入颜色"
            ></Input>
          </Col>

          <Col span={2}>
            <span style={{ lineHeight: '24px' }}>节点填充透明度</span>
          </Col>
          <Col span={2} className="mr-2">
            <Input
              value={nodeStyleKeyshapeFillOpacity}
              onChange={(e) => setNodeStyleKeyshapeFillOpacity(parseFloat(e.target.value) || 0)}
              size="small"
              type="number"
              step="0.01"
              placeholder="输入透明度"
            ></Input>
          </Col>

          <Col span={2}>
            <Button
              size="small"
              disabled={selectedRows.size === 0}
              type="primary"
              onClick={bulkSetNodeStyleKeyshapeStroke}
            >
              设置选中节点({selectedRows.size})
            </Button>
          </Col>
        </Row>
      </section>
      <section className="mt-2">
        <DataGrid
          style={{ height: '60vh' }}
          columns={columns}
          rows={rows}
          onRowsChange={onRowsChange}
          rowKeyGetter={rowKeyGetter}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
        />
      </section>
    </section>
  )
}

export default DataEditor
