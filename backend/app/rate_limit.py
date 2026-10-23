"""
In-memory login throttling to slow down password guessing.

Failures are counted per username, so rotating IP addresses doesn't help an attacker.
State lives in this process only; run a shared store (e.g. Redis) if you scale to several workers.
"""
import threading
import time
from collections import defaultdict, deque
from fastapi import HTTPException, status

MAX_FAILED_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60

_failures = defaultdict(deque)
_lock = threading.Lock()

def _key(username: str) -> str:
    return (username or "").strip().lower()

def _prune(attempts: deque, now: float):
    while attempts and now - attempts[0] > WINDOW_SECONDS:
        attempts.popleft()

def check_login_allowed(username: str):
    """Raise 429 if this username has too many recent failed logins."""
    now = time.monotonic()
    with _lock:
        attempts = _failures[_key(username)]
        _prune(attempts, now)
        if len(attempts) >= MAX_FAILED_ATTEMPTS:
            retry_after = int(WINDOW_SECONDS - (now - attempts[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Please try again later.",
                headers={"Retry-After": str(retry_after)},
            )

def record_failed_login(username: str):
    with _lock:
        _failures[_key(username)].append(time.monotonic())

def reset_failed_logins(username: str):
    with _lock:
        _failures.pop(_key(username), None)
