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
        <div>name: {network.name}</div>
        <div>nodes: {network.nodes.length}</div>
        <div>lnks: {network.edges.length}</div>
      </section>

      <div className="mb-2">
        <div className="font-bold mb-2">Upload</div>
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
              Click to Upload
            </Button>
          </Upload>
        </div>
      </div>

      <div className="mb-2">
        <div className="font-bold mb-2">Files</div>
        <div>
          {!fileItems.length && (
            <div>
              <span className="text-gray-500">No files</span>
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
                  <span className={file === currentFileItem ? '' : 'text-gray-500'}>
                    {file.name}
                    {file.network && <span>(nodes:{file.network.nodes.length} edges:{file.network.edges.length})</span>}
                    {!file.network && <span>(no network)</span>}
                    &nbsp;&nbsp;
                    <span className="text-gray-400" title="click to remove file" onClick={e => {
                      e.stopPropagation()
                      setFileItems(files => files.filter(f => f !== file))
                    }}>remove</span>
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
