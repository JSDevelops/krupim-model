import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi } from '../../_lib/auth'

type TripoResponse = {
  code?: number
  data?: {
    task_id?: string
    status?: 'success' | 'failed' | string
    result?: { model?: { glb?: string } }
  }
}

function developmentPreview(topic: string) {
  const lowerTopic = topic.toLowerCase()
  if (lowerTopic.includes('glass') || lowerTopic.includes('wine') || lowerTopic.includes('แก้ว')) {
    return {
      glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WineGlass/glTF-Binary/WineGlass.glb',
      usdzUrl: 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz',
    }
  }
  if (lowerTopic.includes('teapot') || lowerTopic.includes('กา')) {
    return {
      glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/UtahTeapot/glTF-Binary/UtahTeapot.glb',
      usdzUrl: 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz',
    }
  }
  if (lowerTopic.includes('bottle') || lowerTopic.includes('water') || lowerTopic.includes('ขวด')) {
    return {
      glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
      usdzUrl: 'https://developer.apple.com/augmented-reality/quick-look/models/waterbottle/waterbottle.usdz',
    }
  }
  return {
    glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    usdzUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz',
  }
}

export async function POST(req: NextRequest) {
  try {
    await guardApi(req, { roles: ['teacher', 'developer'], maxRequests: 4 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { topic } = body

    if (typeof topic !== 'string' || !topic.trim() || topic.length > 200) {
      return NextResponse.json({ error: 'topic must be between 1 and 200 characters' }, { status: 400 })
    }

    const tripoKey = (process.env.TRIPO_API_KEY || '').trim()
    const tripoConfigured = Boolean(tripoKey && tripoKey !== 'your_tripo_api_key_here')

    // Submit asynchronously. The client must poll the status endpoint for the generated asset.
    if (tripoConfigured) {
      try {
        const tripoResp = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tripoKey}` },
          body: JSON.stringify({ type: 'text_to_model', prompt: topic })
        })
        const tripoData = await tripoResp.json() as TripoResponse
        if (!tripoResp.ok || tripoData.code !== 0 || !tripoData.data?.task_id) {
          return NextResponse.json({ error: 'Tripo3D ไม่สามารถรับงานสร้างโมเดลได้' }, { status: 502 })
        }
        return NextResponse.json({
          success: true,
          topic: topic.trim(),
          status: 'pending',
          taskId: tripoData.data.task_id,
          glbUrl: '',
          usdzUrl: '',
          preview: false,
          provider: 'Tripo3D',
        }, { status: 202 })
      } catch (err: unknown) {
        console.error('Tripo3D API error:', getErrorMessage(err))
        return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อ Tripo3D ได้' }, { status: 502 })
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const preview = developmentPreview(topic)
      return NextResponse.json({
        success: true,
        topic: topic.trim(),
        ...preview,
        status: 'preview',
        taskId: null,
        preview: true,
        provider: 'Development sample',
      })
    }

    return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า TRIPO_API_KEY สำหรับการสร้างโมเดล 3D' }, { status: 503 })
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('3D Generation Error:', message)
    return NextResponse.json({ error: message || 'Failed to generate 3D model' }, { status: 500 })
  }
}
