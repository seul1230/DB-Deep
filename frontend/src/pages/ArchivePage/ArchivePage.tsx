import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ArchivePage.module.css";
import SectionTitle from "@/entities/archive/SectionTitle/SectionTitle";
import ArchiveCard from "@/entities/archive/ArchiveCard/ArchiveCard";
import { fetchArchiveList } from "@/features/archive/archiveApi";
import { ArchiveItem } from "@/features/archive/archiveTypes";
import { CustomChartData } from "@/types/chart";
import ChartOverlay from "@/entities/chat/ChartOverlay/ChartOverlay";

const ArchivePage = () => {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<CustomChartData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadArchives = async () => {
      try {
        const archiveList = await fetchArchiveList();
        setArchives(archiveList);
      } catch (error) {
        console.error("아카이브 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArchives();
  }, []);

  const handleCardClick = (archive: ArchiveItem) => {
    navigate("/archiveDetail", { state: archive });
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setArchives((prev) =>
      prev.filter((archive) => archive.archiveId.toString() !== deletedId)
    );
  };

  const handleChartClick = (chart: CustomChartData) => {
    setSelectedChart(chart);
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
                archive={item}
                onClick={() => handleCardClick(item)}
                onChartClick={handleChartClick}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {selectedChart && (
        <ChartOverlay
          chartData={selectedChart}
          onClose={() => setSelectedChart(null)}
        />
      )}
    </div>
  );
};

export default ArchivePage;
