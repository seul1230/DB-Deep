import { useEffect, useState } from 'react';
import styles from './GlossaryModal.module.css';
import { glossaryApi } from '@/features/chat/glossaryApi';
import { FaPencilAlt, FaTrash, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';

type GlossaryItem = {
  id: string;
  key: string;
  value: string;
};

const GlossaryModal = ({ onClose }: { onClose: () => void }) => {
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<{ key: string; value: string } | null>(null);
  const [editedData, setEditedData] = useState<{ [id: string]: { key: string; value: string } }>({});

  const fetchGlossary = async () => {
    const data = await glossaryApi.getAll();
    setGlossary(data);
  };

  useEffect(() => {
    fetchGlossary();
  }, []);

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
    await glossaryApi.update(id, { key, value });
    setEditingId(null);
    fetchGlossary();
  };

  const handleDelete = async (id: string) => {
    await glossaryApi.delete(id);
    fetchGlossary();
  };

  const handleAddRow = () => {
    setNewRow({ key: '', value: '' });
  };

  const handleNewChange = (field: 'key' | 'value', value: string) => {
    if (newRow) {
      setNewRow({ ...newRow, [field]: value });
    }
  };

  const handleNewSubmit = async () => {
    if (newRow?.key && newRow?.value) {
      await glossaryApi.create({ key: newRow.key, value: newRow.value });
      setNewRow(null);
      fetchGlossary();
    }
  };

  return (
    <div className={styles['glossaryModal-overlay']} onClick={onClose}>
      <div
        className={styles['glossaryModal-content']}
        onClick={(e) => e.stopPropagation()}
      >
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
                      <>
                        <FaPencilAlt
                          onClick={() => handleEdit(item.id)}
                          className={styles['glossaryModal-icon']}
                        />
                        <FaTrash
                          onClick={() => handleDelete(item.id)}
                          className={styles['glossaryModal-icon']}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {newRow && (
                <tr className={styles['glossaryModal-row']}>
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
    </div>
  );
};

export default GlossaryModal;
