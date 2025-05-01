package kr.dbdeep.dbdeep_BE.domain.chat.api;

import java.time.LocalDateTime;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatMessageListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ShareChatRequest;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.UpdateChatRoomTitleRequest;
import kr.dbdeep.dbdeep_BE.domain.chat.application.ChatMessageService;
import kr.dbdeep.dbdeep_BE.domain.chat.application.ChatRoomService;
import kr.dbdeep.dbdeep_BE.domain.chat.application.ChatShareService;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch.ChatMessageSearchService;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch.ChatRoomSearchResultResponse;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chats")
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;
    private final ChatMessageSearchService chatMessageSearchService;
    private final ChatShareService chatShareService;

    @GetMapping
    public JSONResponse<ChatRoomListResponse> findChatRooms(@CurrentMemberId Integer memberId,
                                                            @RequestParam(required = false, defaultValue = "30") Integer size,
                                                            @RequestParam(required = false) String cursor) {
        LocalDateTime parsedCursor = null;
        if (cursor != null && !cursor.isBlank()) {
            parsedCursor = LocalDateTime.parse(cursor);
        }
        ChatRoomListResponse chatRoomListResponse = chatRoomService.find(memberId, parsedCursor, size);
        return JSONResponse.onSuccess(chatRoomListResponse);
    }

    @GetMapping("/{chatRoomId}")
    public JSONResponse<ChatMessageListResponse> findChatMessagesById(@PathVariable String chatRoomId) {
        ChatMessageListResponse response = chatMessageService.findByChatRoomId(chatRoomId);
        return JSONResponse.onSuccess(response);
    }

    @DeleteMapping("/{chatRoomId}")
    public JSONResponse<Void> deleteChatRoomById(@PathVariable String chatRoomId) {
        chatRoomService.deleteById(chatRoomId);
        return JSONResponse.onSuccess();
    }

    @PatchMapping("/{chatRoomId}/title")
    public JSONResponse<Void> updateChatRoomTitle(@PathVariable String chatRoomId,
                                                  @RequestBody UpdateChatRoomTitleRequest request) {
        chatRoomService.updateTitle(chatRoomId, request.getTitle());
        return JSONResponse.onSuccess();
    }

    @GetMapping("/search")
    public JSONResponse<List<ChatRoomSearchResultResponse>> searchByKeyword(@CurrentMemberId Integer memberId,
                                                                            @RequestParam String keyword) {
        List<ChatRoomSearchResultResponse> response = chatMessageSearchService.findLatestUserMessagesByKeyword(
                memberId, keyword);
        return JSONResponse.onSuccess(response);
    }

    @PostMapping("/share")
    public JSONResponse<Void> shareChat(@CurrentMemberId Integer memberId,
                                        @RequestBody ShareChatRequest request) {
        chatShareService.share(memberId, request.getTargets(), request.getChatId());
        return JSONResponse.onSuccess();
    }
}
