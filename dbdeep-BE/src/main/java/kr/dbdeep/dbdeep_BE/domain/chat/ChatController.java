package kr.dbdeep.dbdeep_BE.domain.chat;

import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chats")
public class ChatController {

    @GetMapping
    public void abc(@CurrentMemberId Integer id) {
        System.out.println("@@@@@");
        System.out.println(id);
    }

}
