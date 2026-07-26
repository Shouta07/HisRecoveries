"""Tests for core.scheduler"""

from datetime import datetime
from unittest import mock

import pytest

from core.scheduler import get_next_slot


class TestGetNextSlot:
    def test_returns_future_slot(self):
        with mock.patch("core.scheduler.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2025, 1, 1, 10, 0, 0)
            mock_dt.strptime = datetime.strptime

            slot, wait = get_next_slot(["08:00", "12:00", "20:00"])
            assert slot == "12:00"
            assert wait == 7200.0  # 2 hours

    def test_wraps_to_tomorrow(self):
        with mock.patch("core.scheduler.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2025, 1, 1, 22, 0, 0)
            mock_dt.strptime = datetime.strptime

            slot, wait = get_next_slot(["08:00", "12:00", "20:00"])
            assert slot == "08:00"
            assert wait > 0

    def test_single_slot(self):
        with mock.patch("core.scheduler.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2025, 1, 1, 6, 0, 0)
            mock_dt.strptime = datetime.strptime

            slot, wait = get_next_slot(["12:00"])
            assert slot == "12:00"
