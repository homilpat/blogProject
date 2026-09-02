import logging

from app.services.query_planner import QueryPlan

logger = logging.getLogger(__name__)


class AnswerRenderer:
    @staticmethod
    def _complete(llm_client, model: str, messages):
        last_error = None
        for attempt in range(2):
            try:
                return llm_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.0,
                )
            except Exception as error:
                last_error = error
                logger.warning("Draft generation attempt %d failed: %s", attempt + 1, error)
        raise last_error

    def generate_draft(
        self,
        llm_client,
        model: str,
        plan: QueryPlan,
        context_text: str,
        policy_instructions: str = "",
    ) -> str:
        style_instructions = self._style_instructions(plan)
        system_prompt = (
            "당신은 반도체 제조 공정 및 AI RAG 기술 지식 전문가 어시스턴트입니다. "
            "사용자와 대화하듯 자연스럽고 명확하게 답하세요. 첫 1~2문장에서 질문에 직접 답하고 결론을 미루지 마세요. "
            "'[근거 1]에서는', '[근거 2]와 [근거 3]은'처럼 출처 번호를 문장의 주어로 삼거나 근거를 번호순으로 해설하지 마세요. "
            "여러 원문에서 확인되는 내용을 하나의 설명으로 종합하고, 인용은 관련 문장이나 문단 끝에 자연스럽게 붙이세요. "
            "원문이 직접 말하는 사실과 그 사실에서 도출한 판단·설계 제안은 구분하되, 매 문장마다 같은 단서를 반복하지 마세요. "
            "원문에 있는 사실은 단정적으로 설명할 수 있지만, 여러 근거를 연결한 결론은 필요한 경우에만 '근거를 종합하면' 또는 '추론하면'이라고 한 번 표시하세요. "
            "원문에 없는 수치·실험 결과·기술명·장단점·성공 보장을 추가하지 마세요. "
            "사실 주장이 포함된 각 문단이나 항목에는 이를 뒷받침하는 [근거 N]을 붙이고, 여러 출처가 필요하면 모두 표시하세요. "
            "'직접 답변:', '근거 기반 설명:', '검증 필요:' 같은 고정 보고서 제목은 사용자가 요구하지 않는 한 쓰지 마세요. "
            "검색 문서에 질문의 정답이 직접 적혀 있지 않다는 경고는 결론을 대신하지 말고, 정말 중요한 한계일 때 마지막에 한 번만 짧게 밝히세요. "
            "같은 결론을 표현만 바꿔 반복하지 마세요. "
            + style_instructions
            + policy_instructions
        )
        response = self._complete(
            llm_client=llm_client,
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"질문 의도: {plan.intent.value}\n"
                        f"요청 작업: {', '.join(plan.requested_tasks)}\n\n"
                        f"참고 지식:\n{context_text}\n\n"
                        f"질문: {plan.original_query}"
                    ),
                },
            ],
        )
        return response.choices[0].message.content or ""

    @staticmethod
    def _style_instructions(plan: QueryPlan) -> str:
        intent = plan.intent.value
        if intent in {"DESIGN_PROPOSAL", "NOVELTY_ASSESSMENT", "VALIDATION_PLAN"}:
            return (
                "설계·신규성 질문에는 가능 여부와 판정 이유를 먼저 말하고, 이어서 사용자가 실제로 시도할 수 있는 단계나 판정 기준을 최대 3개 제시하세요. "
                "근거에 있는 사례는 가능성을 설명하는 재료로 사용하되, 사례가 존재한다는 이유만으로 사용자의 아이디어가 새 알고리즘이라고 결론내리지 마세요. "
            )
        if intent == "TROUBLESHOOTING":
            return "트러블슈팅 질문에는 가장 가능성 높은 원인부터 확인 순서와 조치 순서로 답하세요. "
        if intent == "COMPARISON":
            return "비교 질문에는 핵심 차이를 먼저 말하고, 차이가 실제 선택에 미치는 영향까지 설명하세요. "
        if intent == "CAUSE_ANALYSIS":
            return "원인 질문에는 가장 직접적인 원인을 먼저 말하고 원인과 결과의 연결을 설명하세요. "
        return "사실 질문에는 핵심 답을 짧게 제시한 뒤 필요한 배경만 덧붙이세요. "


answer_renderer = AnswerRenderer()
