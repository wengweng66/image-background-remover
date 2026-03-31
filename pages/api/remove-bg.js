// Cloudflare Workers 兼容的 remove-bg API
// 使用 Edge Runtime，不需要 formidable

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Content-Type must be multipart/form-data' })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image_file')
    
    if (!file) {
      return res.status(400).json({ error: '请上传图片文件' })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png']
    const fileType = file.type
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: '仅支持 JPG 和 PNG 格式' })
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: '文件过大，请上传小于 10MB 的图片' })
    }

    // 获取 API Key
    const removeBgApiKey = process.env.REMOVE_BG_API_KEY
    if (!removeBgApiKey) {
      return res.status(500).json({ error: '服务器未配置 API Key' })
    }

    // 转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // 调用 remove.bg API
    const removeBgFormData = new FormData()
    removeBgFormData.append('image_file', new Blob([buffer]), file.name || 'image.png')
    removeBgFormData.append('size', 'auto')
    removeBgFormData.append('format', 'png')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeBgApiKey,
      },
      body: removeBgFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Remove.bg API error:', response.status, errorText)
      
      if (response.status === 402) {
        return res.status(500).json({ error: 'API 配额已用完' })
      }
      if (response.status === 403) {
        return res.status(500).json({ error: 'API Key 无效' })
      }
      try {
        const errObj = JSON.parse(errorText)
        return res.status(500).json({ error: errObj.errors?.[0]?.detail || '处理失败' })
      } catch {
        return res.status(500).json({ error: '处理失败，请重试' })
      }
    }

    // 返回图片
    res.setHeader('Content-Type', 'image/png')
    const resultBuffer = await response.arrayBuffer()
    res.send(Buffer.from(resultBuffer))
  } catch (error) {
    console.error('Error processing image:', error)
    res.status(500).json({ error: '处理失败，请重试' })
  }
}
