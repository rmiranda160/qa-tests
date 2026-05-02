#!/usr/bin/env python3
"""
OpenClaw Voice - Integration Test
Prueba flujo completo, latencia, calidad de transcripción, manejo de errores.
"""

import os
import sys
import json
import time
import requests
import subprocess
import tempfile
from typing import Optional, Tuple
from dataclasses import dataclass
from urllib.parse import urljoin

# Configuración
IP = os.environ.get("OPENCLAW_IP", "217.182.244.180")
PORT = int(os.environ.get("HTTP_PORT", "3002"))
USE_HTTPS = os.environ.get("USE_HTTPS", "false").lower() == "true"
PROTOCOL = "https" if USE_HTTPS else "http"
BASE_URL = f"{PROTOCOL}://{IP}:{PORT}"
HEALTH_ENDPOINT = "/health"
TRANSCRIBE_ENDPOINT = "/api/transcribe"
TIMEOUT = 30  # segundos

# Colores
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
BLUE = "\033[34m"
RESET = "\033[0m"

def log_success(msg):
    print(f"{GREEN}[✓]{RESET} {msg}")

def log_warning(msg):
    print(f"{YELLOW}[!]{RESET} {msg}")

def log_error(msg):
    print(f"{RED}[✗]{RESET} {msg}")

def log_info(msg):
    print(f"{BLUE}[i]{RESET} {msg}")

@dataclass
class TestResult:
    name: str
    passed: bool
    message: str
    latency: float = 0.0
    data: Optional[dict] = None

class AudioGenerator:
    """Genera archivos de audio de prueba."""
    
    @staticmethod
    def generate_wav(duration_sec=3, sample_rate=16000, freq=440):
        """Genera un archivo WAV con tono sinusoidal usando sox o ffmpeg."""
        import tempfile
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp.close()
        
        # Intentar sox primero
        try:
            cmd = [
                "sox", "-n", "-r", str(sample_rate), "-c", "1", "-b", "16",
                tmp.name, "synth", str(duration_sec), "sine", str(freq)
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            log_success(f"Audio generado con sox: {tmp.name}")
            return tmp.name
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
        
        # Intentar ffmpeg
        try:
            cmd = [
                "ffmpeg", "-f", "lavfi", "-i",
                f"sine=frequency={freq}:sample_rate={sample_rate}:duration={duration_sec}",
                "-c:a", "pcm_s16le", tmp.name, "-y"
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            log_success(f"Audio generado con ffmpeg: {tmp.name}")
            return tmp.name
        except (subprocess.CalledProcessError, FileNotFoundError):
            log_error("No se pudo generar audio (sox/ffmpeg no instalados)")
            return None
    
    @staticmethod
    def cleanup(filename):
        if filename and os.path.exists(filename):
            os.unlink(filename)

class IntegrationTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        if USE_HTTPS:
            self.session.verify = False  # Ignorar SSL self-signed
        self.results = []
    
    def run_test(self, name, func):
        log_info(f"Ejecutando: {name}")
        start = time.time()
        try:
            result = func()
            latency = time.time() - start
            if result.passed:
                log_success(f"{name}: {result.message}")
            else:
                log_error(f"{name}: {result.message}")
            result.latency = latency
            self.results.append(result)
            return result
        except Exception as e:
            log_error(f"{name}: Error inesperado - {str(e)}")
            self.results.append(TestResult(name, False, f"Excepción: {str(e)}"))
            return None
    
    def test_health(self):
        url = urljoin(self.base_url, HEALTH_ENDPOINT)
        try:
            resp = self.session.get(url, timeout=5)
            if resp.status_code == 200:
                return TestResult("Health Check", True, f"HTTP {resp.status_code}")
            else:
                return TestResult("Health Check", False, f"HTTP {resp.status_code}")
        except requests.exceptions.RequestException as e:
            return TestResult("Health Check", False, f"Error de conexión: {str(e)}")
    
    def test_transcribe_simple(self, audio_path, mime_type="audio/wav"):
        if not audio_path or not os.path.exists(audio_path):
            return TestResult("Transcripción Simple", False, "Archivo de audio no existe")
        
        url = urljoin(self.base_url, TRANSCRIBE_ENDPOINT)
        with open(audio_path, "rb") as f:
            files = {"audio": (os.path.basename(audio_path), f, mime_type)}
            try:
                start = time.time()
                resp = self.session.post(url, files=files, timeout=TIMEOUT)
                latency = time.time() - start
                
                if resp.status_code == 200:
                    # Intentar parsear JSON
                    try:
                        data = resp.json()
                        text = data.get("text", "")
                        confidence = data.get("confidence", 0)
                        if text:
                            msg = f"Transcripción exitosa ({len(text)} chars, conf: {confidence})"
                            return TestResult("Transcripción Simple", True, msg, latency, data)
                        else:
                            msg = "Transcripción vacía"
                            return TestResult("Transcripción Simple", False, msg, latency, data)
                    except json.JSONDecodeError:
                        msg = f"Respuesta no JSON: {resp.text[:100]}"
                        return TestResult("Transcripción Simple", False, msg, latency)
                else:
                    msg = f"HTTP {resp.status_code}: {resp.text[:200]}"
                    return TestResult("Transcripción Simple", False, msg, latency)
            except requests.exceptions.RequestException as e:
                return TestResult("Transcripción Simple", False, f"Error de red: {str(e)}")
    
    def test_transcribe_raw(self, audio_path, mime_type="audio/wav"):
        if not audio_path or not os.path.exists(audio_path):
            return TestResult("Transcripción Raw", False, "Archivo de audio no existe")
        
        url = urljoin(self.base_url, TRANSCRIBE_ENDPOINT)
        with open(audio_path, "rb") as f:
            headers = {"Content-Type": mime_type}
            try:
                start = time.time()
                resp = self.session.post(url, data=f, headers=headers, timeout=TIMEOUT)
                latency = time.time() - start
                
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                        text = data.get("text", "")
                        if text:
                            msg = f"Transcripción raw exitosa ({len(text)} chars)"
                            return TestResult("Transcripción Raw", True, msg, latency, data)
                        else:
                            return TestResult("Transcripción Raw", False, "Transcripción vacía", latency)
                    except json.JSONDecodeError:
                        return TestResult("Transcripción Raw", False, "Respuesta no JSON", latency)
                else:
                    msg = f"HTTP {resp.status_code}"
                    return TestResult("Transcripción Raw", False, msg, latency)
            except requests.exceptions.RequestException as e:
                return TestResult("Transcripción Raw", False, f"Error: {str(e)}")
    
    def test_latency(self, audio_path, expected_max=5.0):
        """Prueba que la latencia esté dentro del límite."""
        result = self.test_transcribe_simple(audio_path)
        if result and result.passed:
            if result.latency <= expected_max:
                msg = f"Latencia aceptable: {result.latency:.2f}s <= {expected_max}s"
                return TestResult("Latencia", True, msg, result.latency)
            else:
                msg = f"Latencia excedida: {result.latency:.2f}s > {expected_max}s"
                return TestResult("Latencia", False, msg, result.latency)
        else:
            return TestResult("Latencia", False, "Transcripción falló, no se mide latencia")
    
    def test_error_handling(self):
        """Prueba manejo de errores: archivo vacío, tipo incorrecto."""
        url = urljoin(self.base_url, TRANSCRIBE_ENDPOINT)
        
        # 1. Archivo vacío
        try:
            resp = self.session.post(url, data=b"", headers={"Content-Type": "audio/wav"}, timeout=5)
            if resp.status_code in (400, 413, 415):
                log_success(f"Archivo vacío rechazado correctamente (HTTP {resp.status_code})")
                passed1 = True
            else:
                log_warning(f"Archivo vacío recibió HTTP {resp.status_code} (esperado 400/413/415)")
                passed1 = False
        except requests.exceptions.RequestException:
            passed1 = False
        
        # 2. Tipo no soportado
        try:
            resp = self.session.post(url, data=b"fake", headers={"Content-Type": "image/jpeg"}, timeout=5)
            if resp.status_code == 415:
                log_success("Tipo no soportado rechazado correctamente (415)")
                passed2 = True
            else:
                log_warning(f"Tipo no soportado recibió HTTP {resp.status_code}")
                passed2 = False
        except requests.exceptions.RequestException:
            passed2 = False
        
        passed = passed1 and passed2
        return TestResult("Manejo de Errores", passed, "Pruebas de error básicas")
    
    def test_concurrent_users(self, num_users=3):
        """Prueba concurrente simulada (secuencial por simplicidad)."""
        audio_path = AudioGenerator.generate_wav(duration_sec=2)
        if not audio_path:
            return TestResult("Usuarios Concurrentes", False, "No se pudo generar audio")
        
        latencies = []
        successes = 0
        for i in range(num_users):
            log_info(f"  Usuario {i+1}/{num_users}...")
            result = self.test_transcribe_simple(audio_path)
            if result and result.passed:
                successes += 1
                latencies.append(result.latency)
            time.sleep(0.5)  # Pequeña pausa
        
        AudioGenerator.cleanup(audio_path)
        
        if successes == num_users:
            avg_latency = sum(latencies) / len(latencies) if latencies else 0
            msg = f"{successes}/{num_users} exitosos, latencia avg: {avg_latency:.2f}s"
            return TestResult("Usuarios Concurrentes", True, msg)
        else:
            msg = f"Solo {successes}/{num_users} exitosos"
            return TestResult("Usuarios Concurrentes", False, msg)
    
    def print_summary(self):
        log_info("\n" + "="*50)
        log_info("RESUMEN DE PRUEBAS DE INTEGRACIÓN")
        log_info("="*50)
        
        passed = sum(1 for r in self.results if r.passed)
        total = len(self.results)
        
        for result in self.results:
            color = GREEN if result.passed else RED
            latency_str = f" ({result.latency:.2f}s)" if result.latency > 0 else ""
            print(f"{color}[{'✓' if result.passed else '✗'}]{RESET} {result.name}: {result.message}{latency_str}")
        
        print("\n" + "="*50)
        log_info(f"Total: {passed}/{total} pruebas pasadas")
        if passed == total:
            log_success("¡Todas las pruebas pasaron!")
        else:
            log_error(f"Fallas: {total - passed}")
        
        # Recomendaciones
        print("\nRecomendaciones:")
        if any("latencia" in r.name.lower() and not r.passed for r in self.results):
            print("  - Optimizar tiempos de respuesta del backend/Gateway")
        if any("error" in r.name.lower() and not r.passed for r in self.results):
            print("  - Mejorar manejo de errores y códigos HTTP")
        if any("concurrente" in r.name.lower() and not r.passed for r in self.results):
            print("  - Revisar escalabilidad y concurrencia")

def main():
    log_info("=== OpenClaw Voice - Pruebas de Integración ===")
    log_info(f"URL base: {BASE_URL}")
    log_info(f"Hora: {time.ctime()}")
    print()
    
    tester = IntegrationTester(BASE_URL)
    
    # Generar archivo de audio de prueba
    audio_path = AudioGenerator.generate_wav(duration_sec=3)
    if not audio_path:
        log_error("No se puede continuar sin audio de prueba")
        sys.exit(1)
    
    try:
        # 1. Health check
        tester.run_test("Health Check", tester.test_health)
        
        # 2. Transcripción simple (multipart)
        tester.run_test("Transcripción Simple", lambda: tester.test_transcribe_simple(audio_path))
        
        # 3. Transcripción raw
        tester.run_test("Transcripción Raw", lambda: tester.test_transcribe_raw(audio_path))
        
        # 4. Latencia
        tester.run_test("Latencia", lambda: tester.test_latency(audio_path, expected_max=5.0))
        
        # 5. Manejo de errores
        tester.run_test("Manejo de Errores", tester.test_error_handling)
        
        # 6. Usuarios concurrentes (simulado)
        tester.run_test("Usuarios Concurrentes", lambda: tester.test_concurrent_users(num_users=3))
        
        # 7. Calidad de transcripción (requeriría texto de referencia)
        # Omitido por ahora
        
    finally:
        AudioGenerator.cleanup(audio_path)
    
    # Resumen
    tester.print_summary()
    
    # Salir con código apropiado
    passed = sum(1 for r in tester.results if r.passed)
    total = len(tester.results)
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()