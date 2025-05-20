from typing import Dict
from asyncio import Lock

_stop_flags: Dict[str, bool] = {}
_lock = Lock()

async def set_stop_flag(user_id: str):
    async with _lock:
        _stop_flags[user_id] = True

async def clear_stop_flag(user_id: str):
    async with _lock:
        _stop_flags.pop(user_id, None)

async def is_stop_requested(user_id: str) -> bool:
    async with _lock:
        return _stop_flags.get(user_id, False)
