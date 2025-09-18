'use client';

import { useState, useEffect } from 'react';
import { ApiService, GenreResponse, CreateGenreRequest, UpdateGenreRequest } from '@/lib/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function GenreManagement() {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateGenreRequest>({ name: '' });
  const [editForm, setEditForm] = useState<UpdateGenreRequest>({ name: '' });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getGenres();
      if (response.success) {
        setGenres(response.data || []);
      } else {
        setError(response.error || 'Không thể tải danh sách thể loại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách thể loại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await ApiService.createGenre(createForm);
      if (response.success) {
        setShowCreateModal(false);
        setCreateForm({ name: '' });
        await fetchGenres();
      } else {
        setError(response.error || 'Không thể tạo thể loại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo thể loại';
      // Show validation errors (like "already exists") as a warning instead of error
      if (errorMessage.includes('đã tồn tại')) {
        setError(`⚠️ ${errorMessage}`);
      } else {
        setError(`❌ ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !editForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await ApiService.updateGenre(editingGenre.genreId, editForm);
      if (response.success) {
        setShowEditModal(false);
        setEditingGenre(null);
        setEditForm({ name: '' });
        await fetchGenres();
      } else {
        setError(response.error || 'Không thể cập nhật thể loại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thể loại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGenre = async (genreId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;

    try {
      setError(null);
      const response = await ApiService.deleteGenre(genreId);
      if (response.success) {
        await fetchGenres();
      } else {
        setError(response.error || 'Không thể xóa thể loại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa thể loại');
    }
  };

  const openEditModal = (genre: GenreResponse) => {
    setEditingGenre(genre);
    setEditForm({ name: genre.name });
    setShowEditModal(true);
  };

  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>Quản lý thể loại</h1>
          <p style={{color: 'var(--color-text-secondary)'}}>Quản lý các thể loại phim trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm thể loại
        </button>
      </div>

      {/* Error/Warning Message */}
      {error && (
        <div className="rounded-md p-4" style={{
          backgroundColor: 'var(--bg-4)',
          border: error.includes('⚠️') ? '1px solid #f59e0b' : '1px solid #ef4444'
        }}>
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium" style={{
                color: error.includes('⚠️') ? '#f59e0b' : '#ef4444'
              }}>
                {error.includes('⚠️') ? 'Cảnh báo' : 'Lỗi'}
              </h3>
              <div className="mt-2 text-sm" style={{
                color: error.includes('⚠️') ? '#f59e0b' : '#ef4444'
              }}>
                {error.replace('⚠️ ', '').replace('❌ ', '')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5" style={{color: 'var(--color-text-muted)'}} />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm thể loại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          style={{
            backgroundColor: 'var(--bg-3)',
            border: '1px solid var(--bg-3)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      {/* Genres Table */}
      <div className="rounded-lg shadow-sm" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--bg-3)'}}>
          <h3 className="text-lg font-medium" style={{color: 'var(--color-text-primary)'}}>
            Danh sách thể loại ({filteredGenres.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center" style={{color: 'var(--color-text-muted)'}}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto"></div>
            <p className="mt-2">Đang tải...</p>
          </div>
        ) : filteredGenres.length === 0 ? (
          <div className="p-6 text-center" style={{color: 'var(--color-text-muted)'}}>
            <TagIcon className="h-12 w-12 mx-auto mb-4" style={{color: 'var(--color-text-muted)'}} />
            <p>Không có thể loại nào</p>
            {searchTerm && (
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{borderColor: 'var(--bg-3)'}}>
              <thead style={{backgroundColor: 'var(--bg-3)'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Tên thể loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody style={{backgroundColor: 'var(--bg-4)'}}>
                {filteredGenres.map((genre) => (
                  <tr key={genre.genreId} className="transition-colors" style={{backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 mr-3" style={{color: 'var(--color-text-muted)'}} />
                        <div className="text-sm font-medium" style={{color: 'var(--color-text-primary)'}}>
                          {genre.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--color-text-muted)'}}>
                      {genre.genreId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(genre)}
                          className="p-1 rounded transition-colors"
                          style={{color: '#3b82f6'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGenre(genre.genreId)}
                          className="p-1 rounded transition-colors"
                          style={{color: '#ef4444'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
            <div className="mt-3">
              <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Thêm thể loại mới</h3>
              <form onSubmit={handleCreateGenre}>
                <div className="mb-4">
                  <label htmlFor="create-name" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                    Tên thể loại
                  </label>
                  <input
                    type="text"
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => {
                      setCreateForm({ name: e.target.value });
                      // Clear error when user starts typing
                      if (error) setError(null);
                    }}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Nhập tên thể loại..."
                    required
                    maxLength={80}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ name: '' });
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !createForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGenre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
            <div className="mt-3">
              <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Chỉnh sửa thể loại</h3>
              <form onSubmit={handleUpdateGenre}>
                <div className="mb-4">
                  <label htmlFor="edit-name" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                    Tên thể loại
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm({ name: e.target.value });
                      // Clear error when user starts typing
                      if (error) setError(null);
                    }}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    placeholder="Nhập tên thể loại..."
                    required
                    maxLength={80}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingGenre(null);
                      setEditForm({ name: '' });
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !editForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}