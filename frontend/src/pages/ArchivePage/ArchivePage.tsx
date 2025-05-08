// ArchivePage.tsx
import styles from "./ArchivePage.module.css";
import SectionTitle from "@/entities/archive/SectionTitle/SectionTitle";
import ArchiveCard from "@/entities/archive/ArchiveCard/ArchiveCard";

const ArchivePage = () => {
  const cards = [
    {
      id: "1",
      title: "세그먼트 구매 패턴",
      date: "2025년 4월 23일 오후 4시 32분",
      description: "고객 세그먼트별 구매 패턴 분석 결과입니다.",
      tableData: [
        ["프리미엄", "450,000", "월 2.3회", "전자기기"],
        ["일반", "120,000", "월 1.5회", "의류"],
        ["가격민감형", "45,000", "월 3.2회", "식품"],
        ["간헐적", "85,000", "분기 1.7회", "취미용품"]
      ],
    },
    {
      id: "2",
      title: "마케팅 캠페인 전후의 전환율",
      date: "2025년 2월 11일 오전 9시 02분",
      chartData: [
        { label: "캠페인 전", value: 11 },
        { label: "캠페인 후", value: 15 },
      ],
      description:
        "이번 마케팅 캠페인 전후의 전환율을 비교한 결과, 캠페인 이전에는 11.00%, 캠페인 이후는 15.00%로 확인되었습니다. 이는 약 4.00%p의 전환율 상승을 의미하며, 상대적으로 36% 이상의 개선 효과를 나타냅니다.",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <SectionTitle text="아카이브" />
        <div className={styles.cardList}>
          {cards.map((card, i) => (
            <ArchiveCard 
            key={i} 
            {...card}
            
            onClick={() => console.log(`ArchiveCard ${i} clicked`)}
             />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;
