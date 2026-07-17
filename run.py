import os
import sys
import subprocess
import threading
import time
import signal
import shutil

# --- Self-Bootstrapping Logic ---
def check_and_bootstrap_venv():
    # sys.prefix == sys.base_prefix is True if not in a venv
    in_venv = sys.prefix != sys.base_prefix or hasattr(sys, 'real_prefix')
    
    if not in_venv:
        root_dir = os.path.dirname(os.path.abspath(__file__))
        venv_dir = os.path.join(root_dir, ".venv")
        
        print("=" * 70)
        print("[SYSTEM] Not running inside a Python virtual environment.")
        print(f"[SYSTEM] Creating virtual environment at: {venv_dir}")
        print("=" * 70)
        
        if not os.path.isdir(venv_dir):
            try:
                subprocess.run([sys.executable, "-m", "venv", ".venv"], check=True)
                print("[SYSTEM] Virtual environment created successfully.")
            except Exception as e:
                print(f"[ERROR] Failed to create virtual environment: {e}")
                sys.exit(1)
        
        # Resolve python interpreter path in venv
        if sys.platform == "win32":
            venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
        else:
            venv_python = os.path.join(venv_dir, "bin", "python")
            
        if not os.path.exists(venv_python):
            print(f"[ERROR] Virtual environment python not found at: {venv_python}")
            sys.exit(1)
            
        print("[SYSTEM] Installing colorama in the virtual environment...")
        try:
            subprocess.run([venv_python, "-m", "pip", "install", "colorama"], check=True)
            print("[SYSTEM] colorama installed successfully.")
        except Exception as e:
            print(f"[WARNING] Failed to install colorama in venv: {e}. Running without colors.")
            
        print("[SYSTEM] Restarting script inside the virtual environment...")
        print("=" * 70)
        
        # Restart the script using the virtual environment's python
        cmd = [venv_python] + sys.argv
        sys.exit(subprocess.run(cmd).returncode)

# Run bootstrap check
check_and_bootstrap_venv()

# --- Main Script Execution (Runs inside venv) ---
try:
    from colorama import init, Fore, Style
    # Enable virtual terminal processing on Windows for ANSI colors
    if sys.platform == 'win32':
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    init(autoreset=True)
    HAS_COLOR = True
except Exception:
    HAS_COLOR = False

def log_backend(msg):
    if HAS_COLOR:
        print(f"{Fore.CYAN}{Style.BRIGHT}[BACKEND]{Style.RESET_ALL} {msg}", flush=True)
    else:
        print(f"[BACKEND] {msg}", flush=True)

def log_frontend(msg):
    if HAS_COLOR:
        print(f"{Fore.MAGENTA}{Style.BRIGHT}[FRONTEND]{Style.RESET_ALL} {msg}", flush=True)
    else:
        print(f"[FRONTEND] {msg}", flush=True)

def log_system(msg):
    if HAS_COLOR:
        print(f"{Fore.GREEN}{Style.BRIGHT}[SYSTEM]{Style.RESET_ALL} {msg}", flush=True)
    else:
        print(f"[SYSTEM] {msg}", flush=True)

def log_error(msg):
    if HAS_COLOR:
        print(f"{Fore.RED}{Style.BRIGHT}[ERROR]{Style.RESET_ALL} {msg}", flush=True)
    else:
        print(f"[ERROR] {msg}", flush=True)

def log_database(msg):
    if HAS_COLOR:
        print(f"{Fore.BLUE}{Style.BRIGHT}[DATABASE]{Style.RESET_ALL} {msg}", flush=True)
    else:
        print(f"[DATABASE] {msg}", flush=True)

def command_exists(cmd):
    return shutil.which(cmd) is not None

def check_docker():
    if not command_exists("docker"):
        return False
    try:
        res = subprocess.run(["docker", "info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return res.returncode == 0
    except Exception:
        return False

def stream_output(process, log_func):
    try:
        for line in iter(process.stdout.readline, b''):
            try:
                line_str = line.decode('utf-8', errors='replace').rstrip()
            except Exception:
                line_str = str(line).rstrip()
            log_func(line_str)
    except Exception:
        pass

def kill_process_tree(pid):
    if sys.platform == "win32":
        try:
            subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    else:
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except Exception:
            try:
                os.kill(pid, signal.SIGTERM)
            except Exception:
                pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    log_system("Starting The Aim High Coaching Institute Portal...")
    log_system(f"Active Virtual Environment: {sys.prefix}")
    
    # 1. Check prerequisites
    if not command_exists("node"):
        log_error("Node.js is not installed or not in system PATH. Please install Node.js first.")
        sys.exit(1)
    if not command_exists("npm"):
        log_error("npm is not installed or not in system PATH. Please install npm first.")
        sys.exit(1)
        
    # 2. Check and start Docker PostgreSQL container if Docker is available
    if check_docker():
        log_database("Docker is running. Starting PostgreSQL database container...")
        try:
            subprocess.run(["docker-compose", "up", "-d"], cwd=root_dir, check=True)
            log_database("PostgreSQL container started successfully.")
        except Exception as e:
            log_error(f"Failed to start Docker container: {e}. Attempting to run with local SQLite database...")
    else:
        log_database("Docker is not running/installed. Using local SQLite database (default config).")

    # 3. Setup backend
    backend_node_modules = os.path.join(backend_dir, "node_modules")
    if not os.path.isdir(backend_node_modules):
        log_system("Backend node_modules not found. Installing backend dependencies...")
        try:
            subprocess.run("npm install", shell=True, cwd=backend_dir, check=True)
            log_system("Backend dependencies installed.")
        except Exception as e:
            log_error(f"Failed to install backend dependencies: {e}")
            sys.exit(1)
    else:
        log_system("Backend node_modules already exists. Skipping npm install.")
        
    # 4. Synchronize Database & Seed
    log_system("Synchronizing database schema using Prisma...")
    try:
        subprocess.run("npx prisma db push", shell=True, cwd=backend_dir, check=True)
        log_system("Database schema sync complete.")
    except Exception as e:
        log_error(f"Failed to sync database: {e}")
        sys.exit(1)

    log_system("Seeding initial database entries...")
    try:
        subprocess.run("npm run db:seed", shell=True, cwd=backend_dir, check=True)
        log_system("Database seeding complete.")
    except Exception as e:
        log_error(f"Failed to seed database: {e}")

    # 5. Setup frontend
    frontend_node_modules = os.path.join(frontend_dir, "node_modules")
    if not os.path.isdir(frontend_node_modules):
        log_system("Frontend node_modules not found. Installing frontend dependencies...")
        try:
            subprocess.run("npm install", shell=True, cwd=frontend_dir, check=True)
            log_system("Frontend dependencies installed.")
        except Exception as e:
            log_error(f"Failed to install frontend dependencies: {e}")
            sys.exit(1)
    else:
        log_system("Frontend node_modules already exists. Skipping npm install.")

    # 6. Start backend & frontend concurrently
    log_system("Launching backend and frontend servers concurrently...")
    
    # Unix-specific subprocess group settings
    spawn_kwargs = {"stdout": subprocess.PIPE, "stderr": subprocess.STDOUT}
    if sys.platform != "win32":
        spawn_kwargs["preexec_fn"] = os.setsid

    backend_proc = None
    frontend_proc = None
    
    try:
        backend_proc = subprocess.Popen("npm run dev", shell=True, cwd=backend_dir, **spawn_kwargs)
        frontend_proc = subprocess.Popen("npm run dev", shell=True, cwd=frontend_dir, **spawn_kwargs)
        
        # Start threads to stream output
        backend_thread = threading.Thread(target=stream_output, args=(backend_proc, log_backend), daemon=True)
        frontend_thread = threading.Thread(target=stream_output, args=(frontend_proc, log_frontend), daemon=True)
        
        backend_thread.start()
        frontend_thread.start()
        
        log_system("Application is running! URLs:")
        log_system("  - Frontend: http://localhost:3000")
        log_system("  - Backend API: http://localhost:5000")
        log_system("Press Ctrl+C to terminate both servers.")
        
        # Wait for processes or Ctrl+C
        while True:
            if backend_proc.poll() is not None:
                log_error("Backend process terminated unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                log_error("Frontend process terminated unexpectedly.")
                break
            time.sleep(1)
            
    except KeyboardInterrupt:
        log_system("Ctrl+C detected. Shutting down servers...")
    finally:
        if backend_proc:
            log_system(f"Terminating Backend process (PID {backend_proc.pid})...")
            kill_process_tree(backend_proc.pid)
        if frontend_proc:
            log_system(f"Terminating Frontend process (PID {frontend_proc.pid})...")
            kill_process_tree(frontend_proc.pid)
        log_system("Shutdown complete.")

if __name__ == "__main__":
    main()
