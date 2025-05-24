import { useEffect, useRef, useState } from 'react';
import styles from './GlossaryModal.module.css';
import { glossaryApi } from '@/features/chat/glossaryApi';
import { FaPencilAlt, FaTrash, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useGlossaryStore } from '@/features/chat/useGlossarystore';

const GlossaryModal = ({ onClose }: { onClose: () => void }) => {
  const {
    glossary,
    setGlossary,
    isLoaded,
    fetchGlossary
  } = useGlossaryStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<{ key: string; value: string } | null>(null);
  const [editedData, setEditedData] = useState<{ [id: string]: { key: string; value: string } }>({});

  const endOfTableRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      fetchGlossary().catch(() => {
        alert('용어를 불러오지 못했습니다.');
        onClose();
      });
    }
  }, [isLoaded, fetchGlossary, onClose]);

  const handleEdit = (id: string) => {
    const item = glossary.find((g) => g.id === id);
    if (item) {
      setEditedData({
        ...editedData,
        [id]: { key: item.key, value: item.value },
      });
      setEditingId(id);
    }
  };

  const handleEditChange = (id: string, field: 'key' | 'value', value: string) => {
    setEditedData({
      ...editedData,
      [id]: {
        ...editedData[id],
        [field]: value,
      },
    });
  };

  const handleEditSubmit = async (id: string) => {
    const { key, value } = editedData[id];
    const prev = [...glossary];
    const updated = glossary.map((item) => (item.id === id ? { ...item, key, value } : item));

    setGlossary(updated);
    setEditingId(null);

    try {
      await glossaryApi.update(id, { key, value });
    } catch {
      setGlossary(prev);
      alert('수정 실패: 다시 시도해주세요.');
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...glossary];
    setGlossary(glossary.filter((item) => item.id !== id));

    try {
      await glossaryApi.delete(id);
    } catch {
      setGlossary(prev);
      alert('삭제 실패: 다시 시도해주세요.');
    }
  };

  const handleAddRow = () => {
    setNewRow({ key: '', value: '' });
    setTimeout(() => {
      endOfTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleNewChange = (field: 'key' | 'value', value: string) => {
    if (newRow) {
      setNewRow({ ...newRow, [field]: value });
    }
  };

  const handleNewSubmit = async () => {
    if (!newRow?.key || !newRow?.value) return;
    const prev = [...glossary];
    const tempId = `temp-${Date.now()}`;
    const tempItem = { id: tempId, ...newRow };

    setGlossary([...glossary, tempItem]);
    setNewRow(null);

    try {
      await glossaryApi.create([{ key: newRow.key, value: newRow.value }]);
      await fetchGlossary();
    } catch {
      setGlossary(prev);
      alert('추가 실패: 다시 시도해주세요.');
    }
  };

  if (!isLoaded) return null;

  return createPortal(
    <div className={styles['glossaryModal-overlay']} onClick={onClose}>
      <div className={styles['glossaryModal-content']} onClick={(e) => e.stopPropagation()}>
        <FaTimes className={styles['glossaryModal-closeIcon']} onClick={onClose} />
        <div className={styles['glossaryModal-header']}>
          <div className={styles['glossaryModal-title']}>용어 사전</div>
          <FaPlus className={styles['glossaryModal-addIcon']} onClick={handleAddRow} />
        </div>

        <div className={styles['glossaryModal-body']}>
          <table className={styles['glossaryModal-table']}>
            <tbody>
              {glossary.map((item) => (
                <tr key={item.id} className={styles['glossaryModal-row']}>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={editedData[item.id]?.key || ''}
                        onChange={(e) => handleEditChange(item.id, 'key', e.target.value)}
                      />
                    ) : (
                      item.key
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={editedData[item.id]?.value || ''}
                        onChange={(e) => handleEditChange(item.id, 'value', e.target.value)}
                      />
                    ) : (
                      item.value
                    )}
                  </td>
                  <td className={styles['glossaryModal-iconCell']}>
                    {editingId === item.id ? (
                      <FaCheck
                        onClick={() => handleEditSubmit(item.id)}
                        className={styles['glossaryModal-icon']}
                      />
                    ) : (
                      <div className={styles['glossaryModal-iconGroup']}>
                        <FaPencilAlt
                          onClick={() => handleEdit(item.id)}
                          className={styles['glossaryModal-icon']}
                        />
                        <FaTrash
                          onClick={() => handleDelete(item.id)}
                          className={styles['glossaryModal-icon']}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {newRow && (
                <tr ref={endOfTableRef} className={styles['glossaryModal-row']}>
                  <td>
                    <input
                      value={newRow.key}
                      onChange={(e) => handleNewChange('key', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={newRow.value}
                      onChange={(e) => handleNewChange('value', e.target.value)}
                    />
                  </td>
                  <td className={styles['glossaryModal-iconCell']}>
                    <FaCheck onClick={handleNewSubmit} className={styles['glossaryModal-icon']} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlossaryModal;
