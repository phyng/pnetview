import React, { useState } from 'react'
import { Modal, Upload, Button, message } from 'antd'
import { UploadOutlined, EditOutlined } from '@ant-design/icons'
import { downloadFile } from '../services/utils'
import { Network, getNetworkFromText, networkToCorrelationText } from '../services/network'
import DataEditor from './DataEditor'

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
  const [showEditModal, setShowEditModal] = useState(false)

  const selectFileItem = (fileItem: FileItem) => {
    console.log('selectFileItem', fileItem)
    if (!fileItem.network) {
      message.error('Invalid file')
      return
    }
    setCurrentFileItem(fileItem)
    onNetworkChange && onNetworkChange(fileItem.network)
  }

  const handleDownloadJSON = () => {
    downloadFile(`${network.name.split('.')[0]}_network.json`, JSON.stringify(network, null, 2))
  }

  const handleDownloadCorrelationText = () => {
    downloadFile(`${network.name.split('.')[0]}_correlation.csv`, networkToCorrelationText(network))
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

  const handleShowEdit = () => {
    setShowEditModal(true)
  }

  return (
    <section>
      <Modal
        title={'编辑网络: ' + network.name}
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        width={1350}
        footer={null}
        keyboard={false}
      >
        <DataEditor network={network} onNetworkChange={onNetworkChange}></DataEditor>
      </Modal>

      <section className="mb-2">
        {/* <div className="font-bold mb-1">summary</div> */}
        <div>名称: {network.name}</div>
        <div>节点: {network.nodes.length}</div>
        <div>链接: {network.edges.length}</div>
        <div>
          <span
            className="text-gray-400 cursor-pointer"
            title="click to download network"
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadJSON()
            }}
          >
            下载网络
          </span>

          <span
            className="text-gray-400 cursor-pointer inline-block ml-2"
            title="click to download network"
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadCorrelationText()
            }}
          >
            下载合作矩阵
          </span>
        </div>
      </section>

      <div className="mb-2">
        <div className="font-bold mb-2">文件列表</div>
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
        <div>
          {fileItems.length > 0 && (
            <div>
              {fileItems.map((file) => (
                <div
                  key={file.name}
                  className="cursor-pointer"
                  title="click to select file"
                  onClick={() => selectFileItem(file)}
                >
                  <span className={file === currentFileItem ? '' : 'text-gray-400'} style={{ lineHeight: '24px' }}>
                    {file.name}
                    {file.network && (
                      <span>
                        (节点:{file.network.nodes.length} 链接:{file.network.edges.length})
                      </span>
                    )}
                    {!file.network && <span>(无网络)</span>}

                    <span
                      className="text-gray-400 float-right"
                      title="点击移除文件"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFileItems((files) => files.filter((f) => f !== file))
                      }}
                    >
                      移除
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="font-bold mb-2">编辑网络</div>
        <div>
          <Button icon={<EditOutlined className="align-text-top" />} size="small" onClick={handleShowEdit}>
            编辑网络
          </Button>
        </div>
      </div>
    </section>
  )
}

export default DataPanel
