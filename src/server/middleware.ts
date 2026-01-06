'use server'

import { createMiddleware } from '@tanstack/react-start'

export const loggingMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const result = await next()
    return result
  } catch (error) {
    console.error('[Server Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    throw error
  }
})
