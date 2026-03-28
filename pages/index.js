import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [file, setFile] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(null)
  const [resultPreview, setResultPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 验证文件大小
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件过大，请上传小于 10MB 的图片')
      return
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      setError('仅支持 JPG 和 PNG 格式')
      return
    }

    setFile(selectedFile)
    setError('')

    // 预览原图
    const reader = new FileReader()
    reader.onload = (e) => setOriginalPreview(e.target.result)
    reader.readAsDataURL(selectedFile)
    setResultPreview(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '处理失败')
      }

      // 转换为 Blob URL 用于预览
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setResultPreview(url)
    } catch (err) {
      setError(err.message || '处理失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!resultPreview) return
    const a = document.createElement('a')
    a.href = resultPreview
    a.download = 'removed-bg.png'
    a.click()
  }

  const handleReset = () => {
    setFile(null)
    setOriginalPreview(null)
    setResultPreview(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Image Background Remover - 一键移除图片背景</title>
        <meta name="description" content="免费在线移除图片背景" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            ImageBackgroundRemover
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            一键移除图片背景
          </h2>
          <p className="text-gray-600">免费、快捷、支持 PNG 透明背景</p>
        </div>

        {/* 上传区域 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-700 font-medium">
                拖拽图片到这里 或 点击上传
              </p>
              <p className="text-gray-500 text-sm mt-2">
                支持 JPG, PNG（最大 10MB）
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 text-center text-gray-600">
              已选择: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {file && !resultPreview && (
          <div className="text-center mb-8">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '处理中...' : '开始处理'}
            </button>
            <button
              onClick={handleReset}
              className="ml-4 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              重置
            </button>
          </div>
        )}

        {/* 加载动画 */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">处理中，请稍候...</p>
          </div>
        )}

        {/* 预览结果 */}
        {resultPreview && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-center mb-6">处理结果</h3>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-gray-600 mb-2">原图</p>
                <div className="border rounded-lg overflow-hidden inline-block">
                  <img
                    src={originalPreview}
                    alt="原图"
                    className="max-w-xs max-h-64 object-contain"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2">处理后</p>
                <div className="border rounded-lg overflow-hidden inline-block bg-checkered">
                  <img
                    src={resultPreview}
                    alt="处理后"
                    className="max-w-xs max-h-64 object-contain"
                    style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                💾 下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="ml-4 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                处理下一张
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        <p>© 2026 ImageBackgroundRemover</p>
      </footer>

      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  )
}