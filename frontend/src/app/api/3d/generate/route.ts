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
    let glbUrl = ''
    let usdzUrl = ''
    const isMocked = true
    let submittedTaskId: string | undefined

    // 1. Try Tripo3D API — NON-BLOCKING: submit task, return taskId immediately
    if (tripoKey && tripoKey !== 'your_tripo_api_key_here') {
      try {
        const tripoResp = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tripoKey}` },
          body: JSON.stringify({ type: 'text_to_model', prompt: topic })
        })
        if (tripoResp.ok) {
          const tripoData = await tripoResp.json() as TripoResponse
          if (tripoData.code === 0 && tripoData.data?.task_id) {
            const taskId = tripoData.data.task_id as string
            submittedTaskId = taskId
          }
        }
      } catch (err: unknown) {
        console.error('Tripo3D API error:', getErrorMessage(err))
      }
    }

    // 2. Fallback: curated sample GLB models
    if (isMocked) {
      const lowerTopic = topic.toLowerCase()
      if (lowerTopic.includes('glass') || lowerTopic.includes('wine') || lowerTopic.includes('แก้ว')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WineGlass/glTF-Binary/WineGlass.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else if (lowerTopic.includes('teapot') || lowerTopic.includes('กา')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/UtahTeapot/glTF-Binary/UtahTeapot.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else if (lowerTopic.includes('bottle') || lowerTopic.includes('water') || lowerTopic.includes('ขวด')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/waterbottle/waterbottle.usdz'
      } else if (lowerTopic.includes('cake') || lowerTopic.includes('เค้ก')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Cake/glTF-Binary/Cake.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else {
        glbUrl = `https://modelviewer.dev/shared-assets/models/Astronaut.glb`
        usdzUrl = `https://modelviewer.dev/shared-assets/models/Astronaut.usdz`
      }
    }

    return NextResponse.json({
      success: true, topic, glbUrl, usdzUrl,
      status: submittedTaskId ? 'pending' : 'success',
      taskId: submittedTaskId,
      provider: submittedTaskId ? 'Tripo3D (sample shown while processing)' : '3D Sample Model'
    })
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('3D Generation Error:', message)
    return NextResponse.json({ error: message || 'Failed to generate 3D model' }, { status: 500 })
  }
}
