import { useState, useEffect, useCallback } from 'react'
import {
  Movie,
  MovieRating,
  MovieProgress,
  MovieStatus,
  subscribeMovies,
  addMovie,
  updateMovieField,
  updateMovieRating,
  trashMovie,
  restoreMovie,
  deleteMoviePermanently,
  reorderWishlist,
} from '../lib/movies'
import { addCalendarEventReturningId, moveCalendarEvent, toDateKey } from '../lib/calendar'

export default function useMovies(coupleId: string, uid: string, displayName: string) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [moviesLoaded, setMoviesLoaded] = useState(false)

  useEffect(() => {
    return subscribeMovies(coupleId, (data) => {
      setMovies(data)
      setMoviesLoaded(true)
    })
  }, [])

  const addNewMovie = useCallback(
    async (
      title: string,
      type: Movie['type'],
      poster: string | null,
      status: MovieStatus
    ): Promise<'duplicate_same' | 'duplicate_other' | 'ok'> => {
      const existing = movies.find((m) => m.title.toLowerCase() === title.toLowerCase())
      if (existing) {
        if (status !== 'watched') {
          return existing.status === status ? 'duplicate_same' : 'duplicate_other'
        }
        if (existing.status !== 'watched') {
          return 'duplicate_other'
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const wishlistCount = movies.filter((m) => m.status === 'wishlist').length
      const [year, month, day] = today.split('-').map(Number)
      const dateKey = toDateKey(year, month - 1, day)

      let calendarEventId: string | null = null
      if (status === 'watched') {
        calendarEventId = await addCalendarEventReturningId(coupleId, dateKey, {
          text: `🎬 assistimos: ${title}`,
          time: null,
          createdBy: displayName,
        })
      }

      const movie: Omit<Movie, 'id'> = {
        title,
        poster,
        type,
        status,
        watchedAt: today,
        watchedAtMs: status === 'watched' ? now.getTime() : 0,
        createdAt: now.toISOString(),
        ratings: {},
        watchCount: status === 'watched' ? 1 : 0,
        ...(status === 'wishlist' && { wishlistOrder: wishlistCount }),
        ...(calendarEventId && { calendarEventId, calendarEventDateKey: dateKey }),
      }

      await addMovie(coupleId, movie)
      return 'ok'
    },
    [displayName, movies]
  )

  const rateMovie = useCallback(
    async (movieId: string, rating: MovieRating) => {
      await updateMovieRating(coupleId, movieId, uid, rating)
    },
    [uid]
  )

  const changeStatus = useCallback(
    async (movieId: string, status: MovieStatus, title: string) => {
      await updateMovieField(coupleId, movieId, 'status', status)
      if (status === 'watched') {
        const today = new Date().toISOString().split('T')[0]
        await updateMovieField(coupleId, movieId, 'watchedAt', today)
        await updateMovieField(coupleId, movieId, 'watchedAtMs', Date.now())
        const found = movies.find((m) => m.id === movieId)
        const allWithTitle = movies.filter(
          (m) => m.title.toLowerCase() === (found?.title ?? '').toLowerCase()
        )
        const maxCount = Math.max(...allWithTitle.map((m) => m.watchCount ?? 0))
        await updateMovieField(coupleId, movieId, 'watchCount', maxCount + 1)

        const [year, month, day] = today.split('-').map(Number)
        const dateKey = toDateKey(year, month - 1, day)
        const eventId = await addCalendarEventReturningId(coupleId, dateKey, {
          text: `🎬 assistimos: ${title}`,
          time: null,
          createdBy: displayName,
        })
        if (eventId) {
          await updateMovieField(coupleId, movieId, 'calendarEventId', eventId)
          await updateMovieField(coupleId, movieId, 'calendarEventDateKey', dateKey)
        }
      }
    },
    [displayName, movies]
  )

  const changeDate = useCallback(
    async (movieId: string, date: string) => {
      await updateMovieField(coupleId, movieId, 'watchedAt', date) // ← coupleId adicionado
      const found = movies.find((m) => m.id === movieId)
      if (!found) return

      const [year, month, day] = date.split('-').map(Number)
      const newDateKey = toDateKey(year, month - 1, day)

      if (found.calendarEventId && found.calendarEventDateKey) {
        const newEventId = await moveCalendarEvent(
          coupleId,
          found.calendarEventDateKey,
          found.calendarEventId,
          newDateKey,
          {
            text: `🎬 assistimos: ${found.title}`,
            time: null,
            createdBy: displayName,
          }
        )
        if (newEventId) {
          await updateMovieField(coupleId, movieId, 'calendarEventId', newEventId)
          await updateMovieField(coupleId, movieId, 'calendarEventDateKey', newDateKey)
        }
      } else {
        // filme antigo sem referência — cria o evento na nova data
        const newEventId = await addCalendarEventReturningId(coupleId, newDateKey, {
          text: `🎬 assistimos: ${found.title}`,
          time: null,
          createdBy: displayName,
        })
        if (newEventId) {
          await updateMovieField(coupleId, movieId, 'calendarEventId', newEventId)
          await updateMovieField(coupleId, movieId, 'calendarEventDateKey', newDateKey)
        }
      }
    },
    [coupleId, displayName, movies] // ← deps array estava faltando
  )

  const saveProgress = useCallback(async (movieId: string, progress: MovieProgress) => {
    await updateMovieField(coupleId, movieId, 'progress', progress)
  }, [])

  const removeMovie = useCallback(
    async (movieId: string) => {
      await trashMovie(coupleId, movieId)
    },
    [coupleId]
  )

  const restoreMovieById = useCallback(
    async (movieId: string) => {
      await restoreMovie(coupleId, movieId)
    },
    [coupleId]
  )

  const deleteMovieForever = useCallback(
    async (movieId: string) => {
      await deleteMoviePermanently(coupleId, movieId)
    },
    [coupleId]
  )

  const reorderWishlistMovies = useCallback(
    async (ordered: Movie[]) => {
      await reorderWishlist(coupleId, ordered)
    },
    [coupleId]
  )
  return {
    movies,
    moviesLoaded,
    addNewMovie,
    rateMovie,
    changeStatus,
    changeDate,
    saveProgress,
    removeMovie,
    restoreMovieById,
    deleteMovieForever,
    reorderWishlistMovies,
  }
}
