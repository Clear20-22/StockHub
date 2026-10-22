"""
Run the StockHub backend (FastAPI) and frontend (Vite) together.

Usage:
    python run.py

Press Ctrl+C to stop both servers.
"""
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
IS_WINDOWS = os.name == "nt"


def backend_python():
    """Prefer the backend virtual environment, fall back to the current interpreter."""
    venv_python = BACKEND_DIR / ".venv" / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")
    return str(venv_python) if venv_python.exists() else sys.executable


def stream_output(process, prefix):
    """Print each line of a process's output with a label."""
    for line in iter(process.stdout.readline, ""):
        print(f"{prefix} {line}", end="", flush=True)


def start(name, command, cwd):
    process = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        # Own process group so the whole tree can be stopped together
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if IS_WINDOWS else 0,
        start_new_session=not IS_WINDOWS,
    )
    threading.Thread(target=stream_output, args=(process, f"[{name}]"), daemon=True).start()
    return process


def stop(process):
    """Stop a process and every child it started (uvicorn reloader, node, ...)."""
    if process.poll() is not None:
        return
    if IS_WINDOWS:
        subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        os.killpg(process.pid, signal.SIGTERM)
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()


def main():
    # Vite prints symbols like "➜" that the Windows console encoding can't represent
    sys.stdout.reconfigure(errors="replace")

    # On Windows "npm" can resolve to the extensionless shell script, which Popen can't run
    npm = shutil.which("npm.cmd" if IS_WINDOWS else "npm")
    if npm is None:
        sys.exit("npm was not found. Install Node.js and try again.")

    if not (ROOT / "node_modules").exists():
        print("[setup] Installing frontend dependencies...")
        subprocess.run([npm, "install"], cwd=ROOT, check=True)

    processes = {}
    try:
        processes["backend"] = start("backend", [backend_python(), "start_server.py"], BACKEND_DIR)
        processes["frontend"] = start("frontend", [npm, "run", "dev"], ROOT)
        print("Backend:  http://localhost:8000/docs")
        print("Frontend: http://localhost:5173")
        print("Press Ctrl+C to stop both servers.\n")

        while True:
            for name, process in processes.items():
                if process.poll() is not None:
                    print(f"\n{name} exited with code {process.returncode}, stopping everything.")
                    return
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        for process in processes.values():
            stop(process)
        print("All servers stopped.")


if __name__ == "__main__":
    main()
