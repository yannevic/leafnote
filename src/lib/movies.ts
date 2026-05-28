import { ref, push, set, onValue, off, remove } from 'firebase/database'
import { db } from './firebase'

export type MovieStatus = 'watched' | 'watching' | 'wishlist'

export interface MovieRating {
  stars: number
  comment: string
}

export interface MovieProgress {
  season: number
  episode: number
}

export interface Movie {
  id: string
  title: string
  poster: string | null
  type: 'filme' | 'série' | 'desenho'
  status: MovieStatus
  watchedAt: string
  watchedAtMs?: number
  createdAt: string
  ratings: Record<string, MovieRating>
  progress?: MovieProgress
  wishlistOrder?: number
  watchCount?: number
  trashed?: boolean
  trashedAt?: number
  calendarEventId?: string
  calendarEventDateKey?: string
}

export async function addMovie(coupleId: string, movie: Omit<Movie, 'id'>): Promise<void> {
  const result = await push(ref(db, `couples/${coupleId}/movies`), movie)
  if (!result.key) throw new Error('Firebase não gerou chave para o item')
}

export async function updateMovieField(
  coupleId: string,
  movieId: string,
  field: string,
  value: unknown
): Promise<void> {
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/${field}`), value)
}

export async function updateMovieRating(
  coupleId: string,
  movieId: string,
  uid: string,
  rating: MovieRating
): Promise<void> {
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/ratings/${uid}`), rating)
}

export async function deleteMovie(coupleId: string, movieId: string): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/movies/${movieId}`))
}

export async function reorderWishlist(coupleId: string, movies: Movie[]): Promise<void> {
  const updates: Promise<void>[] = movies.map((m, i) =>
    set(ref(db, `couples/${coupleId}/movies/${m.id}/wishlistOrder`), i)
  )
  await Promise.all(updates)
}

export async function trashMovie(coupleId: string, movieId: string): Promise<void> {
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/trashedAt`), Date.now())
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/trashed`), true)
}

export async function restoreMovie(coupleId: string, movieId: string): Promise<void> {
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/trashed`), false)
  await set(ref(db, `couples/${coupleId}/movies/${movieId}/trashedAt`), null)
}

export async function deleteMoviePermanently(coupleId: string, movieId: string): Promise<void> {
  await remove(ref(db, `couples/${coupleId}/movies/${movieId}`))
}

export function subscribeTrashedMovies(
  coupleId: string,
  callback: (movies: Movie[]) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/movies`)
  onValue(r, (snap) => {
    const val = snap.val() as Record<string, Omit<Movie, 'id'>> | null
    if (!val) return callback([])
    const list = Object.entries(val).map(([id, m]) => {
      const movie = { ...m, id }
      if (!movie.status) movie.status = 'watched' as MovieStatus
      return movie
    })
    callback(list.filter((m) => m.trashed).sort((a, b) => (b.trashedAt ?? 0) - (a.trashedAt ?? 0)))
  })
  return () => off(r, 'value')
}

export function subscribeMovies(coupleId: string, callback: (movies: Movie[]) => void): () => void {
  const r = ref(db, `couples/${coupleId}/movies`)
  onValue(r, (snap) => {
    const val = snap.val() as Record<string, Omit<Movie, 'id'>> | null
    if (!val) return callback([])
    const list = Object.entries(val).map(([id, m]) => {
      const movie = { ...m, id }
      if (!movie.status) movie.status = 'watched' as MovieStatus
      return movie
    })
    callback(list.filter((m) => !m.trashed))
  })
  return () => off(r, 'value')
}
