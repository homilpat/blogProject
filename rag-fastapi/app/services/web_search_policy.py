from dataclasses import dataclass
from typing import Iterable, List

from app.models.schemas import SourceItem
from app.services.evidence_retriever import EvidenceBundle


@dataclass(frozen=True)
class WebSearchDecision:
    should_search: bool
    reason: str


class WebSearchFallbackPolicy:
    """Use web search only when internal knowledge cannot fully cover the query."""

    _STRUCTURER_FAILURE = "구조화 모델이 근거 범위를 확정하지 못했습니다."

    def decide(
        self,
        *,
        allow_web_search: bool,
        has_internal_evidence: bool,
        coverage: str | None = None,
        missing_points: Iterable[str] | None = None,
        web_attempted: bool = False,
    ) -> WebSearchDecision:
        if not allow_web_search:
            return WebSearchDecision(False, "web search disabled")
        if web_attempted:
            return WebSearchDecision(False, "web search already attempted")
        if not has_internal_evidence:
            return WebSearchDecision(True, "no internal evidence")
        if coverage != "PARTIAL":
            return WebSearchDecision(
                False,
                "internal evidence is sufficient or not yet assessed",
            )

        missing = [
            str(item).strip()
            for item in (missing_points or [])
            if str(item).strip()
        ]
        if missing and all(item == self._STRUCTURER_FAILURE for item in missing):
            return WebSearchDecision(
                False,
                "coverage judge failed; insufficiency not established",
            )
        return WebSearchDecision(True, "internal evidence is partial")

    @staticmethod
    def gap_query(
        search_query: str,
        missing_points: Iterable[str] | None = None,
    ) -> str:
        gaps = [
            str(item).strip()
            for item in (missing_points or [])
            if str(item).strip()
        ]
        if not gaps:
            return search_query
        return f"{search_query} {' '.join(gaps[:3])}".strip()

    @staticmethod
    def merge(
        primary: EvidenceBundle,
        supplement: EvidenceBundle,
    ) -> EvidenceBundle:
        merged: List[SourceItem] = []
        seen = set()

        for source in [*primary.sources, *supplement.sources]:
            key = (
                source.source_type,
                source.source_id,
                source.chunk_index,
                source.url or "",
                source.snippet,
            )
            if key in seen:
                continue
            seen.add(key)
            merged.append(
                source.model_copy(
                    update={"citation_number": len(merged) + 1}
                )
            )

        context_chunks = []
        for source in merged:
            if source.source_type == "WEB":
                context_chunks.append(
                    f"[근거 {source.citation_number}]\n"
                    f"제목: {source.title}\n"
                    f"발행처: {source.publisher or ''}\n"
                    f"확인 날짜: {source.checked_at or ''}\n"
                    f"링크: {source.url or ''}\n"
                    f"검색 결과 요약: {source.snippet}"
                )
            else:
                context_chunks.append(
                    f"[근거 {source.citation_number}]\n"
                    f"제목: {source.title}\n"
                    f"링크: {source.url or ''}\n"
                    f"원문: {source.snippet}"
                )

        return EvidenceBundle(
            sources=merged,
            context_text="\n\n".join(context_chunks),
        )


web_search_fallback_policy = WebSearchFallbackPolicy()
