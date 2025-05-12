import logging
import re
import nltk
from typing import List, Dict
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')

# nltk 초기화
nltk.download('punkt')

# 모델 로딩
logging.info("🔄 모델 및 토크나이저 로딩 중...")
tokenizer = AutoTokenizer.from_pretrained('eenzeenee/t5-base-korean-summarization') # 'eenzeenee/t5-base-korean-summarization', 'eenzeenee/t5-small-korean-summarization'
model = AutoModelForSeq2SeqLM.from_pretrained('eenzeenee/t5-base-korean-summarization') # 'eenzeenee/t5-base-korean-summarization', 'eenzeenee/t5-small-korean-summarization'

logging.info("✅ 모델 로딩 완료")


def summarize_text(text: str) -> str:
    logging.info("📝 텍스트 요약 시작")
    input_text = "summarize: " + text.strip()
    logging.info("✂️ 토큰화 중...")
    inputs = tokenizer([input_text], max_length=512, truncation=True, return_tensors="pt")

    logging.info("🧠 요약 생성 중...")
    output = model.generate(**inputs, num_beams=3, do_sample=True, min_length=10, max_length=64)

    decoded = tokenizer.batch_decode(output, skip_special_tokens=True)[0].strip()

    if not decoded:
        logging.warning("⚠️ 모델이 빈 문자열을 반환함. 요약 실패.")
        return ""

    sentences = nltk.sent_tokenize(decoded)
    if not sentences:
        logging.warning(f"⚠️ 문장 분리 실패. 전체 반환: {decoded}")
        return decoded  # fallback: 전체 반환

    summary = sentences[0]
    logging.info(f"📌 요약 결과: {summary}")
    return summary



def summarize_conversation(text: str) -> str:
    """단일 대화 텍스트를 요약"""
    return summarize_text(text)


def should_use_context(query: str) -> bool:
    """맥락 의존형 질의 판단"""
    contextual_keywords = ["그럼", "다음엔", "이럴 때", "그래서", "그 이후", "이 경우"]
    for kw in contextual_keywords:
        if query.strip().startswith(kw):
            logging.info("🔁 맥락 의존 질의로 판단됨")
            return True
    logging.info("🆕 독립 질의로 판단됨")
    return False


def build_context_prompt(history: List[Dict]) -> str:
    """
    최근 대화 히스토리를 기반으로 context 프롬프트 생성
    """
    window = history[-3:]  # 마지막 2~3턴 사용
    raw_text = ""
    for turn in window:
        role = "사용자" if turn["role"] == "user" else "AI"
        raw_text += f"{turn['content']}\n"

    summary = summarize_text(raw_text)
    return f"[Context]\n{summary}\n"


def summarize_chat_history(history: List[Dict]) -> str:
    """
    전체 히스토리가 길어졌을 때 간소화 요약
    """
    raw_text = ""
    for turn in history:
        role = "사용자" if turn["role"] == "user" else "AI"
        raw_text += f"{role}: {turn['content']}\n"

    return summarize_text(raw_text)

def build_additional_prompt_with_history(history: List[Dict]) -> str:
    """
    대화 히스토리를 기반으로, 맥락 여부 판단 후 context 포함 최종 프롬프트를 생성합니다.
    
    Args:
        history (List[Dict]): role(user/assistant)과 content를 포함한 대화 이력 리스트
    
    Returns:
        str: LLM에 넣을 최종 프롬프트 문자열
    """
    if not history:
        logging.warning("⚠️ 히스토리가 비어 있어 프롬프트를 생성할 수 없습니다.")
        return ""

    current_query = history[-1]["content"]

    if should_use_context(current_query):
        context_prompt = build_context_prompt(history[:-1])  # 마지막 발화 제외하고 맥락 구성
        final_prompt = f"[Current User Query]\n{current_query}\n{context_prompt}"
    else:
        final_prompt = current_query

    logging.info("🧾 최종 프롬프트 생성 완료")
    return final_prompt



# 테스트 코드
if __name__ == "__main__":
    logging.info("🚀 테스트 실행 시작")

    # 단순 대화 요약 테스트
    sample = """
        안녕하세요? 우리 (2학년)/(이 학년) 친구들 우리 친구들 학교에 가서 진짜 (2학년)/(이 학년) 이 되고 싶었는데 학교에 못 가고 있어서 답답하죠? 
        그래도 우리 친구들의 안전과 건강이 최우선이니까요 오늘부터 선생님이랑 매일 매일 국어 여행을 떠나보도록 해요. 
        어/ 시간이 벌써 이렇게 됐나요? 늦었어요. 늦었어요. 빨리 국어 여행을 떠나야 돼요. 
        그런데 어/ 국어여행을 떠나기 전에 우리가 준비물을 챙겨야 되겠죠? 국어 여행을 떠날 준비물, 교안을 어떻게 받을 수 있는지 선생님이 설명을 해줄게요. 
        (EBS)/(이비에스) 초등을 검색해서 들어가면요 첫화면이 이렇게 나와요. 
        자/ 그러면요 여기 (X)/(엑스) 눌러주(고요)/(구요). 저기 (동그라미)/(똥그라미) (EBS)/(이비에스) (2주)/(이 주) 라이브특강이라고 되어있죠? 
        거기를 바로 가기를 누릅니다. 자/ (누르면요)/(눌르면요). 어떻게 되냐? b/ 밑으로 내려요 내려요 내려요 쭉 내려요. 
        우리 몇 학년이죠? 아/ (2학년)/(이 학년) 이죠 (2학년)/(이 학년)의 무슨 과목? 국어. 
        이번주는 (1주)/(일 주) 차니까요 여기 교안. 다음주는 여기서 다운을 받으면 돼요. 
        이 교안을 클릭을 하면, 짜잔/. 이렇게 교재가 나옵니다 .이 교안을 (다운)/(따운)받아서 우리 국어여행을 떠날 수가 있어요. 
        그럼 우리 진짜로 국어 여행을 한번 떠나보도록 해요? 국어여행 출발. 자/ (1단원)/(일 단원) 제목이 뭔가요? 한번 찾아봐요. 
        시를 즐겨요 에요. 그냥 시를 읽어요 가 아니에요. 시를 즐겨야 돼요 즐겨야 돼. 어떻게 즐길까? 일단은 내내 시를 즐기는 방법에 대해서 공부를 할 건데요. 
        그럼 오늘은요 어떻게 즐길까요? 오늘 공부할 내용은요 시를 여러 가지 방법으로 읽기를 공부할겁니다. 
        어떻게 여러가지 방법으로 읽을까 우리 공부해 보도록 해요. 오늘의 시 나와라 짜잔/! 시가 나왔습니다 시의 제목이 뭔가요? 다툰 날이에요 다툰 날. 
        누구랑 다퉜나 동생이랑 다퉜나 언니랑 친구랑? 누구랑 다퉜는지 선생님이 시를 읽어 줄 테니까 한번 생각을 해보도록 해요."""

    result = summarize_conversation(sample)
    print("✅ 단일 대화 요약 결과:\n", result)
    

    # 히스토리 기반 context 프롬프트 테스트
    history = [
        {"role": "user", "content": "오늘 수업은 어떤 내용이었어?"},
        {"role": "assistant", "content": "시를 다양한 방법으로 감상하는 방법을 배웠어요."},
        {"role": "user", "content": "그럼 내일 수업은 뭐야?"}
    ]

    # if should_use_context(history[-1]["content"]):
    #     context_prompt = build_context_prompt(history[:-1])
    #     final_prompt = f"[Current User Query]\n{history[-1]['content']}\n {context_prompt}"
    # else:
    #     final_prompt = history[-1]['content']
    
    final_prompt = build_additional_prompt_with_history(history)

    print("\n📤 최종 생성 프롬프트:\n", final_prompt)
