import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Callable, List, Optional

from app.models.schemas import SourceItem
from app.services.query_planner import QueryPlan


@dataclass(frozen=True)
class EvidenceBundle:
    sources: List[SourceItem]
    context_text: str

    @property
    def has_evidence(self) -> bool:
        return bool(self.sources and self.context_text)


class EvidenceRetriever:
    def __init__(
        self,
        vector_store,
        embed_query: Callable[[str], List[float]],
        min_score: float,
        max_chunks_per_source: int = 2,
    ):
        self.vector_store = vector_store
        self.embed_query = embed_query
        self.min_score = min_score
        self.max_chunks_per_source = max_chunks_per_source

    def retrieve(
        self,
        plan: QueryPlan,
        top_k: int,
        domain_filter: Optional[str],
    ) -> EvidenceBundle:
        query_vector = self.embed_query(plan.search_query)
        candidate_limit = max(top_k * 3, top_k)
        hits = self.vector_store.search(
            query_vector=query_vector,
            limit=candidate_limit,
            domain_filter=domain_filter,
        )

        selected = []
        per_source_count = defaultdict(int)
        seen_content = set()

        for hit in hits:
            if hit.score < self.min_score:
                continue
            payload = hit.payload or {}
            source_key = (
                str(payload.get("source_type", "POST")),
                int(payload.get("source_id", 0)),
            )
            normalized_content = re.sub(
                r"\s+", " ", str(payload.get("content", "")).strip().lower()
            )
            if not normalized_content or normalized_content in seen_content:
                continue
            if per_source_count[source_key] >= self.max_chunks_per_source:
                continue

            selected.append(hit)
            seen_content.add(normalized_content)
            per_source_count[source_key] += 1
            if len(selected) >= top_k:
                break

        sources: List[SourceItem] = []
        context_chunks: List[str] = []
        for citation_number, hit in enumerate(selected, start=1):
            payload = hit.payload or {}
            content = str(payload.get("content", "")).strip()
            sources.append(SourceItem(
                source_type=payload.get("source_type", "POST"),
                source_id=payload.get("source_id", 0),
                title=payload.get("title", "Unknown"),
                category=payload.get("category_section", "ALL"),
                url=payload.get("url"),
                snippet=content,
                score=round(hit.score, 4),
                chunk_index=int(payload.get("chunk_index", 0)),
                citation_number=citation_number,
            ))
            context_chunks.append(
                f"[근거 {citation_number}]\n"
                f"제목: {payload.get('title')}\n"
                f"링크: {payload.get('url') or ''}\n"
                f"원문: {content}"
            )

        return EvidenceBundle(
            sources=sources,
            context_text="\n\n".join(context_chunks),
        )
