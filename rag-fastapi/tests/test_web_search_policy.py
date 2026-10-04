import unittest

from app.models.schemas import SourceItem
from app.services.evidence_retriever import EvidenceBundle
from app.services.web_search_policy import WebSearchFallbackPolicy


def bundle(source_type: str, source_id: int, title: str) -> EvidenceBundle:
    source = SourceItem(
        source_type=source_type,
        source_id=source_id,
        title=title,
        category="TEST",
        snippet=f"{title} snippet",
        score=0.9,
        citation_number=1,
        url=f"https://example.com/{source_id}" if source_type == "WEB" else None,
    )
    return EvidenceBundle(sources=[source], context_text=title)


class WebSearchFallbackPolicyTest(unittest.TestCase):
    def setUp(self):
        self.policy = WebSearchFallbackPolicy()

    def test_no_internal_evidence_triggers_web_search(self):
        decision = self.policy.decide(
            allow_web_search=True,
            has_internal_evidence=False,
        )
        self.assertTrue(decision.should_search)

    def test_complete_internal_evidence_does_not_trigger_web_search(self):
        decision = self.policy.decide(
            allow_web_search=True,
            has_internal_evidence=True,
            coverage="COMPLETE",
        )
        self.assertFalse(decision.should_search)

    def test_partial_internal_evidence_triggers_gap_fill(self):
        decision = self.policy.decide(
            allow_web_search=True,
            has_internal_evidence=True,
            coverage="PARTIAL",
            missing_points=["두 번째 비교 대상"],
        )
        self.assertTrue(decision.should_search)

    def test_disabled_web_search_never_triggers(self):
        decision = self.policy.decide(
            allow_web_search=False,
            has_internal_evidence=False,
        )
        self.assertFalse(decision.should_search)

    def test_web_search_is_attempted_at_most_once(self):
        decision = self.policy.decide(
            allow_web_search=True,
            has_internal_evidence=True,
            coverage="PARTIAL",
            missing_points=["부족한 항목"],
            web_attempted=True,
        )
        self.assertFalse(decision.should_search)

    def test_structurer_failure_alone_does_not_trigger_web_search(self):
        decision = self.policy.decide(
            allow_web_search=True,
            has_internal_evidence=True,
            coverage="PARTIAL",
            missing_points=["구조화 모델이 근거 범위를 확정하지 못했습니다."],
        )
        self.assertFalse(decision.should_search)

    def test_gap_query_adds_missing_aspects(self):
        query = self.policy.gap_query(
            "선형 회귀와 로지스틱 회귀 차이",
            ["두 번째 비교 대상의 동일 기준상 특성", "핵심 차이"],
        )
        self.assertIn("두 번째 비교 대상", query)
        self.assertIn("핵심 차이", query)

    def test_merge_keeps_internal_and_web_sources_and_renumbers_citations(self):
        internal = bundle("POST", 1, "내부 문서")
        web = bundle("WEB", 2, "웹 문서")

        merged = self.policy.merge(internal, web)

        self.assertEqual(2, len(merged.sources))
        self.assertEqual([1, 2], [s.citation_number for s in merged.sources])
        self.assertEqual(["POST", "WEB"], [s.source_type for s in merged.sources])


if __name__ == "__main__":
    unittest.main()
