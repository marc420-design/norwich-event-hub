import unittest
from pathlib import Path
import sys
from unittest.mock import patch, Mock

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "automation" / "botasaurus_scraper"))

import exporter  # noqa: E402


class IngestionValidationTest(unittest.TestCase):
    def _base_event(self, **overrides):
        event = {
            "title": "Sample Event",
            "date": "2026-06-01",
            "time": "19:30",
            "end_time": None,
            "venue": "Norwich Arts Centre",
            "address": "",
            "description": "desc",
            "ticket_url": "https://tickets.example.com/event",
            "official_url": None,
            "image_url": "https://cdn.example.com/flyer.jpg",
            "price": "£10",
            "category": "gigs",
            "tags": ["music"],
            "source": "Test Source",
            "source_url": "https://source.example.com/event",
        }
        event.update(overrides)
        return event

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_working_source_url(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=200)
        adapted = exporter._adapt_scraper_event(self._base_event())
        self.assertEqual(adapted["link_status"], "verified")
        self.assertEqual(adapted["status"], "pending_review")
        self.assertEqual(adapted["review_notes"], ["queued_for_approval"])
        mock_get.assert_not_called()

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_broken_source_url(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=500)
        mock_get.return_value = Mock(status_code=500)
        adapted = exporter._adapt_scraper_event(self._base_event(source_url="https://source.example.com/bad"))
        self.assertEqual(adapted["link_status"], "broken")
        self.assertIn("broken_source_link", adapted["review_notes"])
        self.assertEqual(adapted["status"], "pending_review")

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_missing_flyer(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=200)
        adapted = exporter._adapt_scraper_event(self._base_event(image_url=None))
        self.assertTrue(adapted["needs_flyer"])
        self.assertEqual(adapted["image_status"], "fallback_assigned")
        self.assertTrue(adapted["images"][0].startswith("assets/"))
        mock_get.assert_not_called()

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_broken_flyer_url(self, mock_get, mock_head):
        mock_head.side_effect = [Mock(status_code=200), Mock(status_code=200), Mock(status_code=404)]
        mock_get.return_value = Mock(status_code=404)
        adapted = exporter._adapt_scraper_event(self._base_event(image_url="https://cdn.example.com/missing.jpg"))
        self.assertEqual(adapted["image_status"], "fallback_assigned")
        self.assertTrue(adapted["needs_flyer"])
        self.assertTrue(adapted["images"][0].startswith("assets/"))

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_ticket_link_missing(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=200)
        adapted = exporter._adapt_scraper_event(self._base_event(ticket_url=None))
        self.assertEqual(adapted["ticket_status"], "missing")
        self.assertEqual(adapted["link_status"], "verified")
        mock_get.assert_not_called()

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_generic_fallback_assigned(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=200)
        adapted = exporter._adapt_scraper_event(
            self._base_event(
                venue="Unknown Pop-up Space",
                category="unknown",
                image_url=None,
            )
        )
        self.assertEqual(adapted["images"][0], "assets/fallback-general.svg")
        self.assertEqual(adapted["image_status"], "fallback_assigned")
        self.assertTrue(adapted["needs_flyer"])
        mock_get.assert_not_called()

    @patch("exporter.requests.head")
    @patch("exporter.requests.get")
    def test_mismatched_title_date_for_same_source_url_needs_manual_review(self, mock_get, mock_head):
        mock_head.return_value = Mock(status_code=200)
        events = [
            self._base_event(title="Event A", date="2026-06-01", source_url="https://source.example.com/shared"),
            self._base_event(title="Event B", date="2026-06-02", source_url="https://source.example.com/shared"),
        ]
        exporter._mark_title_date_mismatch(events)
        adapted = exporter._adapt_scraper_event(events[1])
        self.assertIn("title_date_mismatch", adapted["review_notes"])
        self.assertEqual(adapted["status"], "pending_review")
        mock_get.assert_not_called()


if __name__ == "__main__":
    unittest.main()
