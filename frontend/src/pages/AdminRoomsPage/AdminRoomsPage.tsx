import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal, Layout } from '../../components'
import { useAuthStore, useRoomsStore } from '../../store'
import type { Room } from '../../types/models'

export function AdminRoomsPage() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const {
    rooms,
    loading,
    error,
    createRoom,
    deleteRoom,
    updateRoom,
    clearError,
  } = useRoomsStore()
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  const handleOpenDelete = (room: Room) => {
    clearError()
    setRoomToDelete(room)
  }

  const handleCloseDelete = () => {
    clearError()
    setRoomToDelete(null)
  }

  const handleDelete = async () => {
    if (!token || !roomToDelete) {
      return
    }

    setSuccessMessage(null)
    clearError()

    try {
      await deleteRoom(roomToDelete.id, token)
      setRoomToDelete(null)
      setSuccessMessage('Sala excluída com sucesso.')
    } catch {
      // Error is exposed by the rooms store.
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    clearError()

    if (!token) {
      return
    }

    try {
      await createRoom(
        {
          name: name.trim(),
          capacity: Number(capacity),
          location: location.trim() || undefined,
        },
        token,
      )
      setName('')
      setCapacity('')
      setLocation('')
      setSuccessMessage('Sala cadastrada com sucesso.')
    } catch {
      // Error is exposed by the rooms store.
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setName(room.name)
    setCapacity(String(room.capacity))
    setLocation(room.location ?? '')
    setSuccessMessage(null)
    clearError()
  }

  const handleCancelEdit = () => {
    setEditingRoom(null)
    setName('')
    setCapacity('')
    setLocation('')
    setSuccessMessage(null)
    clearError()
  }

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    clearError()

    if (!token || !editingRoom) {
      return
    }

    try {
      await updateRoom(
        editingRoom.id,
        {
          name: name.trim(),
          capacity: Number(capacity),
          location: location.trim() || undefined,
        },
        token,
      )
      handleCancelEdit()
      setSuccessMessage('Sala atualizada com sucesso.')
    } catch {
      // Error is exposed by the rooms store.
    }
  }

  return (
    <Layout>
      {!isAdmin ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold text-red-800">Acesso restrito</h1>
          <p className="mt-2 text-sm text-red-700">
            Apenas administradores podem cadastrar salas.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-5 min-h-11 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Voltar ao dashboard
          </button>
        </section>
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
                Administração
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
                {editingRoom ? 'Editar sala' : 'Cadastrar sala'}
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                {editingRoom
                  ? 'Atualize os dados da sala selecionada.'
                  : 'Adicione uma sala para disponibilizá-la para reservas.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="min-h-11 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              Voltar ao dashboard
            </button>
          </div>

          <section className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
            <form onSubmit={editingRoom ? handleUpdate : handleSubmit} className="space-y-5">
              {error && !roomToDelete && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-lg border border-accent-200 bg-accent-50 p-3 text-sm text-accent-900">
                  {successMessage}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                  Nome da sala
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="Sala Ipê"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-stone-700">
                  Capacidade
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-stone-700">
                  Localização <span className="font-normal text-stone-500">(opcional)</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="2º andar"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="min-h-11 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {loading
                  ? editingRoom
                    ? 'Salvando alterações...'
                    : 'Cadastrando sala...'
                  : editingRoom
                    ? 'Salvar alterações'
                    : 'Cadastrar sala'}
              </button>
              {editingRoom && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="min-h-11 w-full rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                  Cancelar edição
                </button>
              )}
            </form>
          </section>

          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900">Salas cadastradas</h2>
              <span className="text-sm text-stone-500">{rooms.length}</span>
            </div>
            {rooms.length > 0 ? (
              <ul className="mt-4 divide-y divide-stone-100">
                {rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:justify-start">
                      <span className="truncate font-medium text-stone-800">{room.name}</span>
                      <span className="shrink-0 text-stone-500">{room.capacity} lugares</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(room)}
                        disabled={loading}
                        className="min-h-11 rounded-lg border border-brand-200 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                      >
                        Editar sala
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(room)}
                        disabled={loading}
                        className="min-h-11 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                      >
                        Excluir sala
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-stone-600">Nenhuma sala cadastrada nesta sessão.</p>
            )}
          </section>
        </div>
      )}
      <ConfirmModal
        open={roomToDelete !== null}
        title="Excluir sala"
        message={
          roomToDelete
            ? `Deseja excluir a sala "${roomToDelete.name}"? Essa ação não poderá ser desfeita.`
            : ''
        }
        confirmLabel="Excluir sala"
        error={error}
        loading={loading}
        onConfirm={() => void handleDelete()}
        onClose={handleCloseDelete}
      />
    </Layout>
  )
}
