import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { createOpenaiChat } from '@tanstack/ai-openai'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { config } from './config'

const voiceSchema = z.object({
  audio: z.string(),
  format: z.string().optional(),
  prompt: z.string().optional(),
})

const mistral = createOpenaiChat(
  'mistral-small-latest' as any,
  config.MISTRAL_API_KEY,
  {
    baseURL: 'https://api.mistral.ai/v1',
  },
)

export const voiceFn = createServerFn({ method: 'POST' })
  .inputValidator(voiceSchema)
  .handler(async ({ data }) => {
    if (!data.audio) {
      return { error: 'Missing audio data' }
    }

    try {
      const stream = chat({
        adapter: mistral,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcris cet audio en une phrase courte en français qui décrit mes envies pour choisir un restaurant pour le déjeuner.',
              },
              {
                type: 'audio',
                source: {
                  type: 'base64',
                  value: data.audio,
                  mimeType: `audio/${data.format || 'webm'}`,
                },
              } as any,
            ],
          },
        ],
      })

      return toServerSentEventsResponse(stream)
    }
    catch (e) {
      console.error('Mistral API error:', e)
      return { error: 'Mistral API error' }
    }
  })
