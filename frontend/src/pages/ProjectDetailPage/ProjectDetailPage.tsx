import React from "react";
import styles from "./ProjectDetailPage.module.css";
import { FiTrash, FiClock, FiRefreshCw, FiFolderMinus } from "react-icons/fi";
//삭제
// import { deleteChatInProject } from "@/features/project/projectApi";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
//추가
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { fetchProjectDetail } from "@/features/project/projectApi";
// import { ProjectDetail } from "@/features/project/projectTypes";

const dummyCards = [
  { id: 1, title: "3월 매출 요약", date: "2025년 4월 23일" },
  { id: 2, title: "설문 응답 요약", date: "2025년 4월 11일" },
  { id: 3, title: "주간 지표 정리", date: "2025년 3월 29일" },
  { id: 4, title: "리포트 초안 자동화", date: "2025년 3월 15일" },
  { id: 5, title: "주요 지표만 뽑기", date: "2025년 2월 27일" },
  { id: 6, title: "채널별 전환 분석", date: "2025년 2월 02일" },
  { id: 7, title: "성장률 변화 요약", date: "2025년 1월 18일" },
  { id: 8, title: "수치 기반 인사이트 정리", date: "2025년 1월 11일" },
  { id: 9, title: "발표용 요약 정리본", date: "2024년 12월 24일" },
];

// 채팅 데이터 생성되면 활성화화
// const formatDate = (iso: string) => {
//   const date = new Date(iso);
//   return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
// };

// const ProjectDetailPage: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const { data, isLoading, isError } = useQuery<ProjectDetail>({
//     queryKey: ["projectDetail", projectId],
//     queryFn: () => fetchProjectDetail(projectId!),
//     enabled: !!projectId,
//   });

//   if (isLoading) return <div>불러오는 중...</div>;
//   if (isError || !data) return <div>에러가 발생했습니다.</div>;

//   return (
//     <div className={styles.container}>
//       <div className={styles.inner}>
//         <div className={styles.projectHeader}>
//           <FiFolderMinus size={24} className={styles.folderIcon} />
//           <h2 className={styles.title}>{data.projectTitle}</h2>
//         </div>
//         <div className={styles.metaRow}>
//           <span className={styles.meta}>
//             <FiRefreshCw size={14} className={styles.metaIcon} />
//             업데이트 : {formatDate(data.chats[0]?.updatedAt || data.createdAt)}
//           </span>
//           <span className={styles.meta}>
//             <FiClock size={14} className={styles.metaIcon} />
//             생성 : {formatDate(data.createdAt)}
//           </span>
//         </div>
//         <p className={styles.description}>이 프로젝트의 채팅 내역을 정리한 목록입니다.</p>
//         <div className={styles.divider}></div>

//         <div className={styles.cardList}>
//           {data.chats.map((chat) => (
//             <div key={chat.messageId} className={styles.card}>
//               <div className={styles.cardHeader}>
//                 <span className={styles.cardTitle}>{chat.message}</span>
//                 <FiTrash className={styles.deleteIcon} />
//               </div>
//               <div className={styles.cardDate}>{formatDate(chat.updatedAt)}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// 실제 API 연동 시 필요
// const PROJECT_ID = "p1";

const ProjectDetailPage: React.FC = () => {
  const handleCardClick = (chatId: number) => {
    // 추후 라우팅 예정
    console.log("Clicked card id:", chatId);
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    console.log("Deleted card id: ", chatId);
  };

  //실제 삭제 api를 사용할 때 사용용
  // const queryClient = useQueryClient();

  // const deleteMutation = useMutation({
  //   mutationFn: (chatId: string) => deleteChatInProject(PROJECT_ID, chatId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["projectDetail", PROJECT_ID] });
  //   },
  // });

  // const handleDelete = (e: React.MouseEvent, chatId: string) => {
  //   e.stopPropagation();
  //   if (confirm("정말로 이 채팅을 삭제하시겠습니까?")) {
  //     deleteMutation.mutate(chatId);
  //   }
  // };

  return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.projectHeader}>
              <FiFolderMinus size={24} className={styles.folderIcon} />
              <h2 className={styles.title}>성과 요약 프로젝트</h2>
          </div>
          <div className={styles.metaRow}>
              <span className={styles.meta}>
                  <FiRefreshCw size={14} className={styles.metaIcon} />
                  업데이트 : 2025년 4월 23일 오후 2시 38분
              </span>
              <span className={styles.meta}>
                  <FiClock size={14} className={styles.metaIcon} />
                  생성 : 2025년 4월 20일 오후 12시 02분
              </span>
          </div>
          <p className={styles.description}>2024년의 성과를 요약하는 프로젝트입니다.</p>
          <div className={styles.divider}></div>
          <div className={styles.cardList}>
            {dummyCards.map((card) => (
              <div key={card.id} className={styles.card} onClick={() => handleCardClick(card.id)}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{card.title}</span>
                  <FiTrash className={styles.deleteIcon} onClick={(e) => handleDelete(e, String(card.id))}/>
                </div>
                <div className={styles.cardDate}>{card.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      );
};

export default ProjectDetailPage;
