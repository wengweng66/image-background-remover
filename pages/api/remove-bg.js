export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 检查 Content-Type
  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Content-Type must be multipart/form-data' })
  }

  // 从 FormData 获取文件
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) {
    return res.status(400).json({ error: '请上传图片文件' })
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return res.status(400).json({ error: '仅支持 JPG 和 PNG 格式' })
  }

  // 验证文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: '文件过大，请上传小于 10MB 的图片' })
  }

  // 获取文件内容
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 调用 Remove.bg API
  const removeBgApiKey = process.env.REMOVE_BG_API_KEY

  if (!removeBgApiKey) {
    return res.status(500).json({ error: '服务器未配置 API Key' })
  }

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeBgApiKey,
      },
      body: (() => {
        const form = new FormData()
        form.append('image_file', new Blob([buffer], { type: file.type }), file.name)
        form.append('size', 'auto')
        form.append('format', 'png')
        return form
      })(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Remove.bg API error:', errorText)
      
      if (response.status === 402) {
        return res.status(500).json({ error: 'API 配额已用完，请联系管理员' })
      }
      if (response.status === 403) {
        return res.status(500).json({ error: 'API Key 无效' })
      }
      return res.status(500).json({ error: '处理失败，请重试' })
    }

    // 返回图片流
    res.setHeader('Content-Type', 'image/png')
    res.send(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error('Error processing image:', error)
    res.status(500).json({ error: '处理失败，请重试' })
  }
}