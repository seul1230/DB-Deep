import { FiMoreVertical } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import styles from "./ProjectDetailPage.module.css";
import { FiTrash, FiClock, FiRefreshCw, FiFolderMinus } from "react-icons/fi";
import EditProjectModal from "@/shared/ui/CreateProjectModal/EditProjectModal";
import DeleteConfirmModal from "@/shared/ui/DeleteConfirmModal/DeleteConfirmModal";
import { useParams, useNavigate  } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjectDetail, updateProjectTitle, deleteProject, removeChatFromProject } from "@/features/project/projectApi";
import { ProjectDetail } from "@/features/project/projectTypes";
import dayjs from "dayjs";

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChatDeleteModal, setShowChatDeleteModal] = useState(false);
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<string | null>(null);
  const [pendingDeleteChatTitle, setPendingDeleteChatTitle] = useState<string | null>(null);


  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ProjectDetail>({
    queryKey: ["projectDetail", String(projectId)],
    queryFn: () => fetchProjectDetail(String(projectId)!),
    enabled: !!String(projectId),
  });

  const updateTitleMutation = useMutation({
    mutationFn: (params: { title: string; description: string }) =>
      updateProjectTitle(projectId!, params.title, params.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectDetail", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      alert("프로젝트 수정에 실패했습니다.");
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      alert("프로젝트가 삭제되었습니다.");
      navigate("/main");
    },
    onError: () => {
      alert("프로젝트 삭제에 실패했습니다.");
    },
  });

  const removeChatMutation = useMutation({
    mutationFn: (chatId: string) => removeChatFromProject(projectId!, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectDetail", projectId] });
    },
    onError: () => {
      alert("채팅 삭제에 실패했습니다.");
    },
  });

  const handleDelete = (e: React.MouseEvent, chatId: string, chatTitle: string) => {
    e.stopPropagation();
    setPendingDeleteChatId(chatId);
    setPendingDeleteChatTitle(chatTitle);
    setShowChatDeleteModal(true);
  };

  const confirmDeleteChat = () => {
    if (pendingDeleteChatId) {
      removeChatMutation.mutate(pendingDeleteChatId);
    }
    setShowChatDeleteModal(false);
    setPendingDeleteChatId(null);
    setPendingDeleteChatTitle(null);
  };
  
  const cancelDeleteChat = () => {
    setShowChatDeleteModal(false);
    setPendingDeleteChatId(null);
    setPendingDeleteChatTitle(null);
  };
  
  

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    setShowDeleteModal(false);
    deleteProjectMutation.mutate();
  };

  const cancelDeleteProject = () => {
    setShowDeleteModal(false);
  };

  const handleCardClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowProjectMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowProjectMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError || !data) return <div>에러가 발생했습니다.</div>;

  const updatedAt =
    data.chatRooms.length > 0
      ? data.chatRooms[0].lastMessageAt
      : data.createdAt;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.projectHeader}>
          <div className={styles.projectTitleWrap}>
            <FiFolderMinus size={24} className={styles.folderIcon} />
            <h2 className={styles.title}>{data.name}</h2>
          </div>

          <div
            className={styles.projectMoreWrapper}
            ref={wrapperRef}
          >
            <div
              className={styles.projectMoreIcon}
              onClick={(e) => {
                e.stopPropagation();
                setShowProjectMenu((prev) => !prev);
              }}
            >
              <FiMoreVertical size={20} />
            </div>
            {showProjectMenu && (
              <div className={styles.projectOverlay}>
                <div
                  className={styles.projectOverlayItem}
                  onClick={() => {
                    setShowProjectMenu(false);
                    setShowEditModal(true);
                  }}
                >
                  정보 수정
                </div>
                <div
                  className={styles.projectOverlayItemDanger}
                  onClick={() => {
                    setShowProjectMenu(false);
                    handleDeleteProject();
                  }}
                >
                  삭제
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.meta}>
            <FiRefreshCw size={14} className={styles.metaIcon} />
            업데이트 :{" "}
            {dayjs(updatedAt).format("YYYY년 M월 D일 A h시 m분")}
          </span>
          <span className={styles.meta}>
            <FiClock size={14} className={styles.metaIcon} />
            생성 : {dayjs(data.createdAt).format("YYYY년 M월 D일 A h시 m분")}
          </span>
        </div>

        <p className={styles.description}>{data.description}</p>
        <div className={styles.divider}></div>

        <div className={styles.cardList}>
          {data.chatRooms.map((chat) => (
            <div
              key={chat.id}
              className={styles.card}
              onClick={() => handleCardClick(chat.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{chat.title}</span>
                <FiTrash
                  className={styles.deleteIcon}
                  onClick={(e) => handleDelete(e, chat.id, chat.title)}
                />
              </div>
              <div className={styles.cardDate}>
                {dayjs(chat.lastMessageAt).format(
                  "YYYY년 M월 D일 A h시 m분"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && (
        <EditProjectModal
          initialName={data.name}
          initialDescription={data.description}
          onClose={() => setShowEditModal(false)}
          onEdit={(name, description) => {
            updateTitleMutation.mutate({ title: name, description });
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title="프로젝트 삭제"
          message={
            <>
              <strong>"{data.name}"</strong> 프로젝트를 삭제하시겠습니까?
              <br />
              삭제된 프로젝트는 복구할 수 없습니다.
            </>
          }
          onCancel={cancelDeleteProject}
          onConfirm={confirmDeleteProject}
        />
      )}

      {showChatDeleteModal && (
        <DeleteConfirmModal
          title="채팅 삭제"
          message={
            <>
              <strong>"{pendingDeleteChatTitle}"</strong> 채팅방을 프로젝트에서 삭제하시겠습니까?
              <br />
              삭제된 채팅방은 복구할 수 없습니다.
            </>
          }
          onCancel={cancelDeleteChat}
          onConfirm={confirmDeleteChat}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;