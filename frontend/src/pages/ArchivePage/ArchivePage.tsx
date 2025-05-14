import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ArchivePage.module.css";
import SectionTitle from "@/entities/archive/SectionTitle/SectionTitle";
import ArchiveCard from "@/entities/archive/ArchiveCard/ArchiveCard";
import { fetchArchiveList } from "@/features/archive/archiveApi";
import { ArchiveItem } from "@/features/archive/archiveTypes";
import dayjs from "dayjs";

const ArchivePage = () => {

  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadArchives = async () => {
      try {
        const data = await fetchArchiveList();
        setArchives(data);
      } catch (error) {
        console.error("아카이브 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArchives();
  }, []);

  const handleCardClick = (chatRoomId: string) => {
    navigate(`/archiveDetail/${chatRoomId}`);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setArchives((prev) =>
      prev.filter((archive) => archive.archiveId.toString() !== deletedId)
    );
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <SectionTitle text="아카이브" />
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : archives.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>아카이브가 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {archives.map((item) => (
              <ArchiveCard
                key={item.archiveId}
                id={item.archiveId.toString()}
                title={item.chatName}
                description={item.lastMessage}
                date={dayjs(item.archivedAt).format("YYYY년 M월 D일 A h시 m분")}
                onClick={() => handleCardClick(item.chatRoomId)}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivePage;
