import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../_lib/auth'

// In-memory store for Tripo3D async tasks (resets on cold start — acceptable for serverless)
const tripoTasks = new Map<string, { status: 'pending' | 'success' | 'failed'; glbUrl?: string; topic?: string }>()

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const tripoKey = (req.headers.get('x-tripo-key') || process.env.TRIPO_API_KEY || '').trim()
    let glbUrl = ''
    let usdzUrl = ''
    let isMocked = true

    // 1. Try Tripo3D API — NON-BLOCKING: submit task, return taskId immediately
    if (tripoKey && tripoKey !== 'your_tripo_api_key_here') {
      try {
        const tripoResp = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tripoKey}` },
          body: JSON.stringify({ type: 'text_to_model', prompt: topic })
        })
        if (tripoResp.ok) {
          const tripoData = await tripoResp.json() as any
          if (tripoData.code === 0 && tripoData.data?.task_id) {
            const taskId = tripoData.data.task_id as string
            tripoTasks.set(taskId, { status: 'pending', topic })
            // Background polling (non-blocking)
            ;(async () => {
              for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 5000))
                try {
                  const pollResp = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${tripoKey}` }
                  })
                  if (pollResp.ok) {
                    const pollData = await pollResp.json() as any
                    if (pollData.code === 0 && pollData.data) {
                      if (pollData.data.status === 'success') {
                        tripoTasks.set(taskId, { status: 'success', glbUrl: pollData.data.result?.model?.glb || '', topic })
                        break
                      } else if (pollData.data.status === 'failed') {
                        tripoTasks.set(taskId, { status: 'failed', topic })
                        break
                      }
                    }
                  }
                } catch { /* ignore poll errors */ }
              }
            })()
            return NextResponse.json({ success: true, topic, taskId, status: 'pending', provider: 'Tripo3D' })
          }
        }
      } catch (err: any) {
        console.error('Tripo3D API error:', err.message)
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
      status: 'success',
      provider: '3D Sample Model'
    })
  } catch (err: any) {
    console.error('3D Generation Error:', err.message)
    return NextResponse.json({ error: err.message || 'Failed to generate 3D model' }, { status: 500 })
  }
}

// Export tripoTasks for status route
export { tripoTasks }
