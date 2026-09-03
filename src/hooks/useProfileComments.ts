// src/hooks/useProfileComments.ts
import { useEffect, useState } from 'react'
import { subscribeProfileComments, ProfileComment } from '../lib/profileComments'

export function useProfileComments(profileUid: string) {
  const [comments, setComments] = useState<ProfileComment[]>([])

  useEffect(() => {
    if (!profileUid) return
    const unsub = subscribeProfileComments(profileUid, setComments)
    return unsub
  }, [profileUid])

  return comments
}
