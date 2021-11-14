import React, { useState } from 'react'
import { Network, getNetworkFromText } from '../services/network'
import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

type Props = {
  network: Network
  onNetworkChange?: (network: Network) => void
}

type FileItem = {
  file: File
  name: string
  network: Network | null
}

const DataPanel: React.FC<Props> = ({ network, onNetworkChange }) => {
  const [fileItems, setFileItems] = useState<FileItem[]>([])
  const [currentFileItem, setCurrentFileItem] = useState<FileItem | null>(null)

  const selectFileItem = (fileItem: FileItem) => {
    console.log('selectFileItem', fileItem)
    if (!fileItem.network) {
      message.error('Invalid file')
      return
    }
    setCurrentFileItem(fileItem)
    onNetworkChange && onNetworkChange(fileItem.network)
  }

  const handleDownload = () => {
    const text = JSON.stringify(network, null, 2)
    const a = window.document.createElement('a')
    a.href = window.URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = `${network.name.split('.')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleUpload = async (file: File) => {
    const fileItem: FileItem = {
      file: file,
      name: file.name,
      network: getNetworkFromText(file.name, await file.text()),
    }
    setFileItems((files) => [...files, fileItem])
    selectFileItem(fileItem)
  }

  return (
    <section>
      <section className="mb-2">
        {/* <div className="font-bold mb-1">summary</div> */}
        <div>
          名称: {network.name}
          &nbsp;&nbsp;
          <span className="text-gray-400 cursor-pointer" title="click to download network" onClick={e => {
            e.stopPropagation()
            handleDownload()
          }}>下载</span>
        </div>
        <div>节点: {network.nodes.length}</div>
        <div>链接: {network.edges.length}</div>
      </section>

      <div className="mb-2">
        <div className="font-bold mb-2">上传</div>
        <div>
          <Upload
            accept=".json,.txt,.csv"
            beforeUpload={(e) => {
              if (fileItems.find((f) => f.name === e.name)) {
                message.info(`${e.name} already exists`)
                return Upload.LIST_IGNORE
              }
              handleUpload(e)
              return Upload.LIST_IGNORE
            }}
          >
            <Button icon={<UploadOutlined className="align-text-top" />} size="small">
              选择文件
            </Button>
          </Upload>
        </div>
      </div>

      <div className="mb-2">
        <div className="font-bold mb-2">文件列表</div>
        <div>
          {!fileItems.length && (
            <div>
              <span className="text-gray-500">暂无文件</span>
            </div>
          )}
          {fileItems.length > 0 && (
            <div>
              {fileItems.map((file) => (
                <div
                  key={file.name}
                  className="cursor-pointer"
                  title="click to select file"
                  onClick={() => selectFileItem(file)}
                >
                  <span className={file === currentFileItem ? 'font-bold' : 'text-gray-500'}>
                    {file.name}
                    {file.network && <span>(节点:{file.network.nodes.length} 链接:{file.network.edges.length})</span>}
                    {!file.network && <span>(无网络)</span>}
                    &nbsp;&nbsp;
                    <span className="text-gray-400" title="点击移除文件" onClick={e => {
                      e.stopPropagation()
                      setFileItems(files => files.filter(f => f !== file))
                    }}>移除</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DataPanel
